// Turso (libSQL) client + schema bootstrap. Talks over HTTP, not a native
// binding, so it's safe in Vercel's serverless Node runtime.
import { createClient, type Client } from '@libsql/client';

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
    ],
    'write'
  );
}
