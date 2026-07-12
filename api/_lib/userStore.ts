// Read/write user identity rows in Turso. One row per Google account,
// keyed by the stable `sub` claim — mirrors the row-table pattern in
// portfolioStore.ts (crypto.randomUUID() ids, ISO timestamps).
import type { Row } from '@libsql/client';
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
  const id = crypto.randomUUID();
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
