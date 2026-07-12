// Turso (libSQL) client + schema bootstrap. Talks over HTTP, not a native
// binding, so it's safe in Vercel's serverless Node runtime.
import { createClient, type Client } from '@libsql/client';
import type { MentorConfig } from '../../src/types/mentoring';

let client: Client | null = null;

export function getClient(): Client {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error('TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env vars are not set.');
  }
  client = createClient({ url, authToken });
  return client;
}

let migratePromise: Promise<void> | null = null;

// Idempotent — safe to call on every cold start. Cached per-process so it
// only actually round-trips once per warm instance.
export function migrate(): Promise<void> {
  if (!migratePromise) migratePromise = runMigrate();
  return migratePromise;
}

async function runMigrate(): Promise<void> {
  const db = getClient();
  await db.batch(
    [
      `CREATE TABLE IF NOT EXISTS config_documents (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        mentee_name TEXT NOT NULL,
        mentee_email TEXT NOT NULL,
        mentee_whatsapp TEXT NOT NULL,
        mentor_id TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        notes TEXT NOT NULL,
        status TEXT NOT NULL,
        topics TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique ON bookings(mentor_id, date, time)
        WHERE status IN ('booked','confirmed','completed')`,
      `CREATE TABLE IF NOT EXISTS bookings_meta (
        key TEXT PRIMARY KEY,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        mentee_name TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        google_sub TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        avatar_url TEXT,
        roles TEXT NOT NULL DEFAULT '["mentee"]',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS mentors (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE,
        name TEXT NOT NULL,
        whatsapp TEXT NOT NULL,
        bio TEXT NOT NULL,
        detail_profile TEXT,
        avatar TEXT,
        expertise TEXT NOT NULL,
        work_experience TEXT NOT NULL,
        schedule TEXT NOT NULL,
        platforms TEXT,
        verification_status TEXT NOT NULL DEFAULT 'verified',
        rejection_reason TEXT,
        submitted_at TEXT NOT NULL,
        reviewed_at TEXT,
        reviewed_by TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
    ],
    'write'
  );

  await ensureColumn(db, 'portfolios', 'owner_id', 'TEXT');
  await db.execute('CREATE UNIQUE INDEX IF NOT EXISTS portfolios_owner_id_unique ON portfolios(owner_id)');
  await ensureColumn(db, 'bookings', 'mentee_user_id', 'TEXT');

  await carryOverLegacyMentors(db);
}

// ALTER TABLE ADD COLUMN has no "IF NOT EXISTS" — re-running it on an
// already-migrated table errors, so check PRAGMA table_info first.
async function ensureColumn(db: Client, table: string, column: string, ddlType: string): Promise<void> {
  const info = await db.execute(`PRAGMA table_info(${table})`);
  const exists = info.rows.some((row) => row.name === column);
  if (!exists) await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddlType}`);
}

// One-time carryover from the pre-Phase-2 whole-document `mentors` key in
// config_documents into the new per-row table, so existing mentor content
// isn't lost when the storage model changes. Self-terminating: once the
// mentors table has any rows, this never runs again.
async function carryOverLegacyMentors(db: Client): Promise<void> {
  const countResult = await db.execute('SELECT COUNT(*) as count FROM mentors');
  const count = Number(countResult.rows[0]?.count ?? 0);
  if (count > 0) return;

  const legacyResult = await db.execute({
    sql: 'SELECT data FROM config_documents WHERE key = ?',
    args: ['mentors'],
  });
  const legacyRow = legacyResult.rows[0];
  if (!legacyRow) return;

  const legacyMentors = JSON.parse(legacyRow.data as string) as MentorConfig[];
  if (legacyMentors.length === 0) return;

  const now = new Date().toISOString();
  await db.batch(
    legacyMentors.map((mentor) => ({
      sql: `INSERT INTO mentors
              (id, name, whatsapp, bio, detail_profile, avatar, expertise, work_experience, schedule, platforms,
               verification_status, submitted_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?)`,
      args: [
        mentor.id, mentor.name, mentor.whatsapp, mentor.bio,
        mentor.detailProfile ?? null, mentor.avatar ?? null,
        JSON.stringify(mentor.expertise), JSON.stringify(mentor.workExperience ?? []), JSON.stringify(mentor.schedule),
        mentor.platforms ? JSON.stringify(mentor.platforms) : null,
        mentor.updatedAt ?? now, mentor.updatedAt ?? now, mentor.updatedAt ?? now,
      ],
    })),
    'write'
  );
}
