// Read/write the mentoring config resources in Turso (libSQL) — topics,
// mentors, and booking-rules are stored as independent JSON documents in
// `config_documents` (each edited as a whole-array/object replace by the
// admin UI); bookings is a real table with a partial unique index so the
// DB itself rejects a double-booked mentor slot, not just app validation.
import type { Row } from '@libsql/client';
import type {
  BookingConfig, BookingRulesDocument, BookingsDocument, BookingStatus, MentoringConfig,
  MentorsDocument, TopicConfig, TopicsDocument,
} from '../../src/types/mentoring';
import type { ToolConfig, ToolsDocument } from '../../src/types/portfolio';
// Bundled into the function at build time — the pre-seed fallback and the
// permanent degradation path if a resource hasn't been written to Turso yet.
import staticConfig from '../../public/config/qa-mentoring-config.json' with { type: 'json' };
import { getClient, migrate } from './turso.js';

const staticSeed = staticConfig as unknown as MentoringConfig;

export type WriteResult<T> = { ok: true; doc: T } | { ok: false; current: T };

interface DocRow<T> {
  data: T;
  updatedAt?: string;
}

async function readDocument<T>(key: string): Promise<DocRow<T> | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT data, updated_at FROM config_documents WHERE key = ?', args: [key] });
  const row = result.rows[0];
  if (!row) return null;
  return { data: JSON.parse(row.data as string) as T, updatedAt: (row.updated_at as string | null) ?? undefined };
}

// Atomic compare-and-swap: the WHERE clause on the conflict's DO UPDATE only
// applies the write if the stored updated_at still matches what the caller
// last read (or if no row exists yet, in which case it's a plain insert).
// `IS ?` (not `= ?`) so `expectedUpdatedAt === undefined` correctly matches
// SQL NULL. Closes the read-then-write race the old Blob store had.
async function casWriteDocument(
  key: string,
  data: unknown,
  expectedUpdatedAt: string | undefined
): Promise<{ ok: true; updatedAt: string } | { ok: false }> {
  await migrate();
  const db = getClient();
  const updatedAt = new Date().toISOString();
  const result = await db.execute({
    sql: `INSERT INTO config_documents (key, data, updated_at) VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
          WHERE config_documents.updated_at IS ?`,
    args: [key, JSON.stringify(data), updatedAt, expectedUpdatedAt ?? null],
  });
  if (result.rowsAffected === 0) return { ok: false };
  return { ok: true, updatedAt };
}

export async function readTopics(): Promise<TopicsDocument> {
  const doc = await readDocument<TopicConfig[]>('topics');
  if (doc) return { topics: doc.data, updatedAt: doc.updatedAt };
  return { topics: staticSeed.topics };
}

export async function writeTopics(
  doc: Pick<TopicsDocument, 'topics'>,
  expectedUpdatedAt: string | undefined
): Promise<WriteResult<TopicsDocument>> {
  const result = await casWriteDocument('topics', doc.topics, expectedUpdatedAt);
  if (!result.ok) return { ok: false, current: await readTopics() };
  return { ok: true, doc: { topics: doc.topics, updatedAt: result.updatedAt } };
}

export async function readMentors(): Promise<MentorsDocument> {
  const doc = await readDocument<MentorsDocument['mentors']>('mentors');
  if (doc) return { mentors: doc.data, updatedAt: doc.updatedAt };
  return { mentors: staticSeed.mentors };
}

export async function writeMentors(
  doc: Pick<MentorsDocument, 'mentors'>,
  expectedUpdatedAt: string | undefined
): Promise<WriteResult<MentorsDocument>> {
  const result = await casWriteDocument('mentors', doc.mentors, expectedUpdatedAt);
  if (!result.ok) return { ok: false, current: await readMentors() };
  return { ok: true, doc: { mentors: doc.mentors, updatedAt: result.updatedAt } };
}

type BookingRulesData = Pick<BookingRulesDocument, 'metadata' | 'availableDays' | 'bookingRules'>;

export async function readBookingRules(): Promise<BookingRulesDocument> {
  const doc = await readDocument<BookingRulesData>('booking-rules');
  if (doc) return { ...doc.data, updatedAt: doc.updatedAt };
  return {
    metadata: staticSeed.metadata,
    availableDays: staticSeed.availableDays,
    bookingRules: staticSeed.bookingRules,
  };
}

export async function writeBookingRules(
  doc: BookingRulesData,
  expectedUpdatedAt: string | undefined
): Promise<WriteResult<BookingRulesDocument>> {
  const result = await casWriteDocument('booking-rules', doc, expectedUpdatedAt);
  if (!result.ok) return { ok: false, current: await readBookingRules() };
  return { ok: true, doc: { ...doc, updatedAt: result.updatedAt } };
}

// Tools is a small shared lookup (mentee portfolio projects reference it by
// id), same document-per-key shape as topics/mentors. No static seed — new
// resource, starts empty until the admin adds tools.
export async function readTools(): Promise<ToolsDocument> {
  const doc = await readDocument<ToolConfig[]>('tools');
  if (doc) return { tools: doc.data, updatedAt: doc.updatedAt };
  return { tools: [] };
}

export async function writeTools(
  doc: Pick<ToolsDocument, 'tools'>,
  expectedUpdatedAt: string | undefined
): Promise<WriteResult<ToolsDocument>> {
  const result = await casWriteDocument('tools', doc.tools, expectedUpdatedAt);
  if (!result.ok) return { ok: false, current: await readTools() };
  return { ok: true, doc: { tools: doc.tools, updatedAt: result.updatedAt } };
}

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
  };
}

async function readBookingsMetaUpdatedAt(): Promise<string | undefined> {
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT updated_at FROM bookings_meta WHERE key = ?', args: ['bookings'] });
  return (result.rows[0]?.updated_at as string | undefined) ?? undefined;
}

export async function readBookings(): Promise<BookingsDocument> {
  await migrate();
  const db = getClient();
  const [rowsResult, updatedAt] = await Promise.all([
    db.execute('SELECT * FROM bookings ORDER BY created_at ASC'),
    readBookingsMetaUpdatedAt(),
  ]);
  return { bookings: rowsResult.rows.map(rowToBooking), updatedAt };
}

// Whole-array replace (matches the admin UI's PUT-the-full-list contract),
// executed as one transaction: the bookings_meta CAS guards the replace
// against a concurrent conflicting save, and the `bookings_slot_unique`
// partial index (see turso.ts) guards against two occupying bookings for the
// same mentor/date/time landing in the same write.
export async function writeBookings(
  doc: Pick<BookingsDocument, 'bookings'>,
  expectedUpdatedAt: string | undefined
): Promise<WriteResult<BookingsDocument>> {
  await migrate();
  const db = getClient();
  const newUpdatedAt = new Date().toISOString();

  const casResult = await db.execute({
    sql: `INSERT INTO bookings_meta (key, updated_at) VALUES ('bookings', ?)
          ON CONFLICT(key) DO UPDATE SET updated_at = excluded.updated_at
          WHERE bookings_meta.updated_at IS ?`,
    args: [newUpdatedAt, expectedUpdatedAt ?? null],
  });
  if (casResult.rowsAffected === 0) return { ok: false, current: await readBookings() };

  await db.batch(
    [
      { sql: 'DELETE FROM bookings', args: [] },
      ...doc.bookings.map((b) => ({
        sql: `INSERT INTO bookings
                (id, mentee_name, mentee_email, mentee_whatsapp, mentor_id, date, time, notes, status, topics, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          b.id, b.menteeName, b.menteeEmail, b.menteeWhatsapp, b.mentorId, b.date, b.time,
          b.notes, b.status, JSON.stringify(b.topics), b.createdAt, b.updatedAt,
        ],
      })),
    ],
    'write'
  );

  return { ok: true, doc: { bookings: doc.bookings, updatedAt: newUpdatedAt } };
}
