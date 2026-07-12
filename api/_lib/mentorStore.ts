// Read/write mentor records in Turso. Real per-row table (unlike topics/
// tools/booking-rules, which stay whole-JSON-documents) — mirrors
// portfolioStore.ts's per-row CAS pattern, since concurrent self-edits by
// different mentors must not be able to stomp each other's writes the way a
// whole-document replace would.
import type { Row } from '@libsql/client';
import type { MentorConfig, MentorVerificationStatus } from '../../src/types/mentoring';
import { getClient, migrate } from './turso.js';

export type MentorWriteResult =
  | { ok: true; mentor: MentorConfig }
  | { ok: false; reason: 'conflict'; current: MentorConfig | null }
  | { ok: false; reason: 'not_found' };

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
    userId: (row.user_id as string | null) ?? undefined,
    verificationStatus: row.verification_status as MentorVerificationStatus,
    rejectionReason: (row.rejection_reason as string | null) ?? undefined,
    submittedAt: row.submitted_at as string,
    reviewedAt: (row.reviewed_at as string | null) ?? undefined,
    reviewedBy: (row.reviewed_by as string | null) ?? undefined,
  };
}

export async function listMentors(options?: { verifiedOnly?: boolean }): Promise<MentorConfig[]> {
  await migrate();
  const db = getClient();
  const result = options?.verifiedOnly
    ? await db.execute({ sql: "SELECT * FROM mentors WHERE verification_status = 'verified' ORDER BY name", args: [] })
    : await db.execute('SELECT * FROM mentors ORDER BY name');
  return result.rows.map(rowToMentor);
}

export async function readMentorById(id: string): Promise<MentorConfig | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM mentors WHERE id = ?', args: [id] });
  const row = result.rows[0];
  return row ? rowToMentor(row) : null;
}

export async function readMentorByUserId(userId: string): Promise<MentorConfig | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM mentors WHERE user_id = ?', args: [userId] });
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

export interface CreateMentorOptions {
  userId?: string;
  verificationStatus?: MentorVerificationStatus;
}

export async function createMentor(id: string, data: MentorData, options?: CreateMentorOptions): Promise<MentorConfig> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  const userId = options?.userId ?? null;
  const verificationStatus = options?.verificationStatus ?? 'verified';
  await db.execute({
    sql: `INSERT INTO mentors
            (id, user_id, name, whatsapp, bio, detail_profile, avatar, expertise, work_experience, schedule, platforms,
             verification_status, submitted_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, userId, data.name, data.whatsapp, data.bio,
      data.detailProfile ?? null, data.avatar ?? null,
      JSON.stringify(data.expertise), JSON.stringify(data.workExperience ?? []), JSON.stringify(data.schedule),
      data.platforms ? JSON.stringify(data.platforms) : null,
      verificationStatus, now, now, now,
    ],
  });
  return {
    id, updatedAt: now, ...data,
    userId: userId ?? undefined, verificationStatus, submittedAt: now,
  };
}

export interface StatusPatch {
  verificationStatus: MentorVerificationStatus;
  rejectionReason: string | null;
  submittedAt: string;
}

// Per-row CAS, mirrors portfolioStore.updatePortfolio. statusPatch is set
// only on the resubmit-after-rejection path (see api/mentors/[id].ts) — a
// plain profile edit by admin or an already-verified mentor leaves status
// untouched.
export async function updateMentor(
  id: string,
  data: MentorData,
  expectedUpdatedAt: string,
  statusPatch?: StatusPatch
): Promise<MentorWriteResult> {
  await migrate();
  const db = getClient();
  const updatedAt = new Date().toISOString();
  const result = statusPatch
    ? await db.execute({
        sql: `UPDATE mentors SET
                name = ?, whatsapp = ?, bio = ?, detail_profile = ?, avatar = ?,
                expertise = ?, work_experience = ?, schedule = ?, platforms = ?, updated_at = ?,
                verification_status = ?, rejection_reason = ?, submitted_at = ?
              WHERE id = ? AND updated_at IS ?
              RETURNING id`,
        args: [
          data.name, data.whatsapp, data.bio, data.detailProfile ?? null, data.avatar ?? null,
          JSON.stringify(data.expertise), JSON.stringify(data.workExperience ?? []), JSON.stringify(data.schedule),
          data.platforms ? JSON.stringify(data.platforms) : null, updatedAt,
          statusPatch.verificationStatus, statusPatch.rejectionReason, statusPatch.submittedAt,
          id, expectedUpdatedAt,
        ],
      })
    : await db.execute({
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
  const current = await readMentorById(id);
  return { ok: true, mentor: current as MentorConfig };
}

// No CAS — a low-frequency admin decision, not worth guarding against a
// concurrent profile edit the way the higher-traffic updateMentor path is.
export async function reviewMentor(
  id: string,
  decision: 'verified' | 'rejected',
  rejectionReason: string | null,
  reviewerUserId: string
): Promise<MentorConfig | null> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  await db.execute({
    sql: `UPDATE mentors SET verification_status = ?, rejection_reason = ?, reviewed_at = ?, reviewed_by = ?
          WHERE id = ?`,
    args: [decision, decision === 'rejected' ? rejectionReason : null, now, reviewerUserId, id],
  });
  return readMentorById(id);
}

export async function deleteMentor(id: string): Promise<void> {
  await migrate();
  const db = getClient();
  await db.execute({ sql: 'DELETE FROM mentors WHERE id = ?', args: [id] });
}
