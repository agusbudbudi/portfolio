// Read/write mentor records in Turso. Real per-row table (unlike topics/
// tools/booking-rules, which stay whole-JSON-documents) — mirrors
// portfolioStore.ts's per-row CAS pattern, since concurrent self-edits by
// different mentors must not be able to stomp each other's writes the way a
// whole-document replace would.
import type { Row } from '@libsql/client';
import type { MentorConfig } from '../../src/types/mentoring';
import { getClient, migrate } from './turso.js';

export type MentorWriteResult =
  | { ok: true; mentor: MentorConfig }
  | { ok: false; reason: 'conflict'; current: MentorConfig | null }
  | { ok: false; reason: 'not_found' };

// Verification/user_id columns exist in the DB but aren't surfaced here yet —
// nothing consumes them until the self-serve application flow lands.
function rowToMentor(row: Row): MentorConfig {
  return {
    id: row.id as string,
    name: row.name as string,
    whatsapp: row.whatsapp as string,
    bio: row.bio as string,
    detailProfile: (row.detail_profile as string | null) ?? undefined,
    avatar: (row.avatar as string | null) ?? undefined,
    expertise: JSON.parse(row.expertise as string) as string[],
    workExperience: JSON.parse(row.work_experience as string) as MentorConfig['workExperience'],
    schedule: JSON.parse(row.schedule as string) as MentorConfig['schedule'],
    platforms: row.platforms ? (JSON.parse(row.platforms as string) as MentorConfig['platforms']) : undefined,
    updatedAt: row.updated_at as string,
  };
}

export async function listMentors(): Promise<MentorConfig[]> {
  await migrate();
  const db = getClient();
  const result = await db.execute('SELECT * FROM mentors ORDER BY name');
  return result.rows.map(rowToMentor);
}

export async function readMentorById(id: string): Promise<MentorConfig | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM mentors WHERE id = ?', args: [id] });
  const row = result.rows[0];
  return row ? rowToMentor(row) : null;
}

export async function isMentorIdTaken(id: string): Promise<boolean> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT 1 FROM mentors WHERE id = ?', args: [id] });
  return result.rows.length > 0;
}

export async function countMentors(): Promise<number> {
  await migrate();
  const db = getClient();
  const result = await db.execute('SELECT COUNT(*) as count FROM mentors');
  return Number(result.rows[0]?.count ?? 0);
}

export type MentorData = Omit<MentorConfig, 'id' | 'updatedAt'>;

export async function createMentor(id: string, data: MentorData): Promise<MentorConfig> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO mentors
            (id, name, whatsapp, bio, detail_profile, avatar, expertise, work_experience, schedule, platforms,
             verification_status, submitted_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, ?, ?)`,
    args: [
      id, data.name, data.whatsapp, data.bio,
      data.detailProfile ?? null, data.avatar ?? null,
      JSON.stringify(data.expertise), JSON.stringify(data.workExperience ?? []), JSON.stringify(data.schedule),
      data.platforms ? JSON.stringify(data.platforms) : null,
      now, now, now,
    ],
  });
  return { id, updatedAt: now, ...data };
}

// Per-row CAS, mirrors portfolioStore.updatePortfolio.
export async function updateMentor(
  id: string,
  data: MentorData,
  expectedUpdatedAt: string
): Promise<MentorWriteResult> {
  await migrate();
  const db = getClient();
  const updatedAt = new Date().toISOString();
  const result = await db.execute({
    sql: `UPDATE mentors SET
            name = ?, whatsapp = ?, bio = ?, detail_profile = ?, avatar = ?,
            expertise = ?, work_experience = ?, schedule = ?, platforms = ?, updated_at = ?
          WHERE id = ? AND updated_at IS ?
          RETURNING id`,
    args: [
      data.name, data.whatsapp, data.bio, data.detailProfile ?? null, data.avatar ?? null,
      JSON.stringify(data.expertise), JSON.stringify(data.workExperience ?? []), JSON.stringify(data.schedule),
      data.platforms ? JSON.stringify(data.platforms) : null, updatedAt,
      id, expectedUpdatedAt,
    ],
  });
  if (!result.rows[0]) {
    const current = await readMentorById(id);
    if (!current) return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'conflict', current };
  }
  return { ok: true, mentor: { id, updatedAt, ...data } };
}

export async function deleteMentor(id: string): Promise<void> {
  await migrate();
  const db = getClient();
  await db.execute({ sql: 'DELETE FROM mentors WHERE id = ?', args: [id] });
}
