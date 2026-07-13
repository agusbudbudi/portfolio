// Read/write booking records in Turso. Real per-row table (mirrors
// portfolioStore.ts's per-row CAS pattern) — every create/edit/status
// transition touches exactly one row, unlike the old whole-array
// delete-all-insert-all replace this store replaces.
import type { Row } from '@libsql/client';
import type { BookingConfig, BookingStatus } from '../../src/types/mentoring';
import { getClient, migrate } from './turso.js';

const OCCUPYING_STATUSES: readonly BookingStatus[] = ['booked', 'confirmed', 'completed'];

export type BookingWriteResult =
  | { ok: true; booking: BookingConfig }
  | { ok: false; reason: 'conflict'; current: BookingConfig | null }
  | { ok: false; reason: 'not_found' };

function rowToBooking(row: Row): BookingConfig {
  return {
    id: row.id as string,
    menteeName: row.mentee_name as string,
    menteeEmail: row.mentee_email as string,
    menteeWhatsapp: row.mentee_whatsapp as string,
    topics: JSON.parse(row.topics as string) as string[],
    mentorId: row.mentor_id as string,
    date: row.date as string,
    time: row.time as string,
    notes: row.notes as string,
    status: row.status as BookingStatus,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    menteeUserId: (row.mentee_user_id as string | null) ?? undefined,
  };
}

export async function listBookings(): Promise<BookingConfig[]> {
  await migrate();
  const db = getClient();
  const result = await db.execute('SELECT * FROM bookings ORDER BY created_at DESC');
  return result.rows.map(rowToBooking);
}

export async function readBookingById(id: string): Promise<BookingConfig | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM bookings WHERE id = ?', args: [id] });
  const row = result.rows[0];
  return row ? rowToBooking(row) : null;
}

export async function readBookingsByMenteeUserId(menteeUserId: string): Promise<BookingConfig[]> {
  await migrate();
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM bookings WHERE mentee_user_id = ? ORDER BY created_at DESC',
    args: [menteeUserId],
  });
  return result.rows.map(rowToBooking);
}

// mentorId here is the mentor's public MentorConfig.id (bookings.mentor_id),
// not a user id — the route resolves session.userId -> mentor.id via
// mentorStore.readMentorByUserId before calling this.
export async function readBookingsByMentorId(mentorId: string): Promise<BookingConfig[]> {
  await migrate();
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT * FROM bookings WHERE mentor_id = ? ORDER BY created_at DESC',
    args: [mentorId],
  });
  return result.rows.map(rowToBooking);
}

// Pre-check mirroring isSlugTaken/isMentorIdTaken — the DB's
// bookings_slot_unique partial index (turso.ts) is the backstop for the rare
// concurrent-write race, same acceptance as the old whole-doc write path.
export async function isSlotTaken(mentorId: string, date: string, time: string, excludeId?: string): Promise<boolean> {
  await migrate();
  const db = getClient();
  const statusPlaceholders = OCCUPYING_STATUSES.map(() => '?').join(',');
  const result = await db.execute({
    sql: excludeId
      ? `SELECT 1 FROM bookings WHERE mentor_id = ? AND date = ? AND time = ? AND id != ? AND status IN (${statusPlaceholders})`
      : `SELECT 1 FROM bookings WHERE mentor_id = ? AND date = ? AND time = ? AND status IN (${statusPlaceholders})`,
    args: excludeId
      ? [mentorId, date, time, excludeId, ...OCCUPYING_STATUSES]
      : [mentorId, date, time, ...OCCUPYING_STATUSES],
  });
  return result.rows.length > 0;
}

export async function readOccupiedTimes(mentorId: string, date: string): Promise<string[]> {
  await migrate();
  const db = getClient();
  const statusPlaceholders = OCCUPYING_STATUSES.map(() => '?').join(',');
  const result = await db.execute({
    sql: `SELECT time FROM bookings WHERE mentor_id = ? AND date = ? AND status IN (${statusPlaceholders})`,
    args: [mentorId, date, ...OCCUPYING_STATUSES],
  });
  return result.rows.map((row) => row.time as string);
}

export async function isBookingIdTaken(id: string): Promise<boolean> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT 1 FROM bookings WHERE id = ?', args: [id] });
  return result.rows.length > 0;
}

export type BookingData = Omit<BookingConfig, 'id' | 'createdAt' | 'updatedAt' | 'menteeUserId'>;

// id is caller-supplied (like mentors'/portfolios' slug) rather than
// server-generated — admin and self-serve creation both use the same
// human-readable "M20260711xyz" format (see generateBookingId in
// AdminBookingForm.tsx / MemberBookingForm.tsx), pre-checked via
// isBookingIdTaken before this is called.
export async function createBooking(id: string, data: BookingData, menteeUserId: string | null): Promise<BookingConfig> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  await db.execute({
    sql: `INSERT INTO bookings
            (id, mentee_name, mentee_email, mentee_whatsapp, mentor_id, date, time, notes, status, topics, mentee_user_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, data.menteeName, data.menteeEmail, data.menteeWhatsapp, data.mentorId,
      data.date, data.time, data.notes, data.status, JSON.stringify(data.topics),
      menteeUserId, now, now,
    ],
  });
  return { id, ...data, createdAt: now, updatedAt: now, menteeUserId: menteeUserId ?? undefined };
}

// Per-row CAS, mirrors updatePortfolio/updateMentor.
export async function updateBooking(
  id: string,
  data: BookingData,
  expectedUpdatedAt: string
): Promise<BookingWriteResult> {
  await migrate();
  const db = getClient();
  const updatedAt = new Date().toISOString();
  const result = await db.execute({
    sql: `UPDATE bookings SET
            mentee_name = ?, mentee_email = ?, mentee_whatsapp = ?, mentor_id = ?,
            date = ?, time = ?, notes = ?, status = ?, topics = ?, updated_at = ?
          WHERE id = ? AND updated_at IS ?
          RETURNING created_at, mentee_user_id`,
    args: [
      data.menteeName, data.menteeEmail, data.menteeWhatsapp, data.mentorId,
      data.date, data.time, data.notes, data.status, JSON.stringify(data.topics), updatedAt,
      id, expectedUpdatedAt,
    ],
  });
  const row = result.rows[0];
  if (!row) {
    const current = await readBookingById(id);
    if (!current) return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'conflict', current };
  }
  return {
    ok: true,
    booking: {
      id, ...data, createdAt: row.created_at as string, updatedAt,
      menteeUserId: (row.mentee_user_id as string | null) ?? undefined,
    },
  };
}
