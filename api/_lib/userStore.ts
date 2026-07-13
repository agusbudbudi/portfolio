// Read/write user identity rows in Turso. One row per Google account,
// keyed by the stable `sub` claim — mirrors the row-table pattern in
// portfolioStore.ts (ISO timestamps), but `id` is a short 5-digit number
// (not a UUID) since it's user-facing here (admin Users list).
import type { Client, Row } from '@libsql/client';
import { getClient, migrate } from './turso.js';

export interface UserRecord {
  id: string;
  googleSub: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

function rowToUser(row: Row): UserRecord {
  return {
    id: row.id as string,
    googleSub: row.google_sub as string,
    email: row.email as string,
    name: row.name as string,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    roles: JSON.parse(row.roles as string) as string[],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function listUsers(): Promise<UserRecord[]> {
  await migrate();
  const db = getClient();
  const result = await db.execute('SELECT * FROM users ORDER BY updated_at DESC');
  return result.rows.map(rowToUser);
}

// 5-digit numeric id (10000-99999) — collision-checked against the table
// since the space is small enough to matter, unlike a UUID.
async function generateUniqueUserId(db: Client): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = String(Math.floor(10000 + Math.random() * 90000));
    const existing = await db.execute({ sql: 'SELECT 1 FROM users WHERE id = ?', args: [candidate] });
    if (existing.rows.length === 0) return candidate;
  }
  throw new Error('Gagal membuat user id unik, coba lagi.');
}

export interface UpsertUserInput {
  googleSub: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

// Creates a user on first login, or refreshes identity fields (name/email/
// avatar can change on Google's side) on every subsequent login. Never
// touches `roles` on conflict — role grants are a manual admin action and
// must survive re-logins untouched.
export async function upsertUserByGoogleSub(input: UpsertUserInput): Promise<UserRecord> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  const id = await generateUniqueUserId(db);
  const result = await db.execute({
    sql: `INSERT INTO users (id, google_sub, email, name, avatar_url, roles, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, '["mentee"]', ?, ?)
          ON CONFLICT(google_sub) DO UPDATE SET
            email = excluded.email,
            name = excluded.name,
            avatar_url = excluded.avatar_url,
            updated_at = excluded.updated_at
          RETURNING *`,
    args: [id, input.googleSub, input.email, input.name, input.avatarUrl ?? null, now, now],
  });
  return rowToUser(result.rows[0]);
}

// Union-adds a role (never removes) — used when a mentor application gets
// verified, so the mentor's own account can pass session.roles checks that
// gate mentor-only UI/actions. No-op if the user already has the role.
export async function grantRole(userId: string, role: string): Promise<void> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT roles FROM users WHERE id = ?', args: [userId] });
  const row = result.rows[0];
  if (!row) return;
  const roles = JSON.parse(row.roles as string) as string[];
  if (roles.includes(role)) return;
  const now = new Date().toISOString();
  await db.execute({
    sql: 'UPDATE users SET roles = ?, updated_at = ? WHERE id = ?',
    args: [JSON.stringify([...roles, role]), now, userId],
  });
}
