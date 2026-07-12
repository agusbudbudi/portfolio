// Read/write mentee portfolio records in Turso. Unlike topics/mentors/
// booking-rules (single JSON document per key) or bookings (whole-array
// replace), portfolios is a real per-row table where each mentee gets one
// row — expected to grow to hundreds of rows, so every mutation targets one
// row by id instead of replacing an entire array.
import type { Row } from '@libsql/client';
import type { PortfolioData, PortfolioRecord, PortfolioStatus, PortfolioSummary } from '../../src/types/portfolio';
import { getClient, migrate } from './turso.js';

export type PortfolioWriteResult =
  | { ok: true; record: PortfolioRecord }
  | { ok: false; reason: 'conflict'; current: PortfolioRecord | null }
  | { ok: false; reason: 'not_found' };

function rowToRecord(row: Row): PortfolioRecord {
  return {
    id: row.id as string,
    slug: row.slug as string,
    status: row.status as PortfolioStatus,
    data: JSON.parse(row.data as string) as PortfolioData,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToSummary(row: Row): PortfolioSummary {
  const data = JSON.parse(row.data as string) as PortfolioData;
  return {
    id: row.id as string,
    slug: row.slug as string,
    status: row.status as PortfolioStatus,
    name: data.profile?.name ?? '',
    photo: data.profile?.photo,
    updatedAt: row.updated_at as string,
  };
}

export async function listPortfolios(): Promise<PortfolioSummary[]> {
  await migrate();
  const db = getClient();
  const result = await db.execute('SELECT id, slug, status, data, updated_at FROM portfolios ORDER BY updated_at DESC');
  return result.rows.map(rowToSummary);
}

export async function readPortfolioBySlug(slug: string): Promise<PortfolioRecord | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM portfolios WHERE slug = ?', args: [slug] });
  const row = result.rows[0];
  return row ? rowToRecord(row) : null;
}

export async function readPortfolioById(id: string): Promise<PortfolioRecord | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM portfolios WHERE id = ?', args: [id] });
  const row = result.rows[0];
  return row ? rowToRecord(row) : null;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await migrate();
  const db = getClient();
  const result = await db.execute({
    sql: excludeId ? 'SELECT 1 FROM portfolios WHERE slug = ? AND id != ?' : 'SELECT 1 FROM portfolios WHERE slug = ?',
    args: excludeId ? [slug, excludeId] : [slug],
  });
  return result.rows.length > 0;
}

export async function createPortfolio(
  slug: string,
  status: PortfolioStatus,
  data: PortfolioData
): Promise<PortfolioRecord> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO portfolios (id, slug, mentee_name, status, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [id, slug, data.profile.name, status, JSON.stringify(data), now, now],
  });
  return { id, slug, status, data, createdAt: now, updatedAt: now };
}

// Per-row compare-and-swap: only applies the write if the stored updated_at
// still matches what the caller last read. Mirrors casWriteDocument's intent
// in configStore.ts but against a real table row instead of a key-value doc.
export async function updatePortfolio(
  id: string,
  slug: string,
  status: PortfolioStatus,
  data: PortfolioData,
  expectedUpdatedAt: string
): Promise<PortfolioWriteResult> {
  await migrate();
  const db = getClient();
  const updatedAt = new Date().toISOString();
  const result = await db.execute({
    sql: `UPDATE portfolios SET slug = ?, mentee_name = ?, status = ?, data = ?, updated_at = ?
          WHERE id = ? AND updated_at IS ?
          RETURNING created_at`,
    args: [slug, data.profile.name, status, JSON.stringify(data), updatedAt, id, expectedUpdatedAt],
  });
  const row = result.rows[0];
  if (!row) {
    const current = await readPortfolioById(id);
    if (!current) return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'conflict', current };
  }
  return { ok: true, record: { id, slug, status, data, createdAt: row.created_at as string, updatedAt } };
}

export async function deletePortfolio(id: string): Promise<void> {
  await migrate();
  const db = getClient();
  await db.execute({ sql: 'DELETE FROM portfolios WHERE id = ?', args: [id] });
}
