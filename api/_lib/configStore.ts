// Read/write the mentoring config resources in Turso (libSQL) — topics,
// tools, and booking-rules are stored as independent JSON documents in
// `config_documents` (each edited as a whole-array/object replace by the
// admin UI). Mentors and bookings each moved to their own per-row table (see
// mentorStore.ts, bookingStore.ts) since self-edits/self-serve creation need
// row-level concurrency, not whole-document CAS.
import type { BookingRulesDocument, MentoringConfig, TopicConfig, TopicsDocument } from '../../src/types/mentoring';
import type { ToolConfig, ToolsDocument } from '../../src/types/portfolio';
// Bundled into the function at build time — the pre-seed fallback and the
// permanent degradation path if a resource hasn't been written to Turso yet.
import staticConfig from '../../public/mentoring/config/qa-mentoring-config.json' with { type: 'json' };
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

