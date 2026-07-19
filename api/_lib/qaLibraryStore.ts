// Read/write QA Library article records in Turso. Real per-row table (mirrors
// bookingStore.ts/portfolioStore.ts's per-row CAS pattern) — articles are
// discrete, independently-edited records expected to grow over time, unlike
// the small whole-doc categories resource (see configStore.ts).
import type { Row } from '@libsql/client';
import type { QaLibraryArticle, QaLibraryArticleData, QaLibraryArticleSummary } from '../../src/types/qaLibrary';
import { getClient, migrate } from './turso.js';

export type QaLibraryWriteResult =
  | { ok: true; article: QaLibraryArticle }
  | { ok: false; reason: 'conflict'; current: QaLibraryArticle | null }
  | { ok: false; reason: 'not_found' };

function rowToArticle(row: Row): QaLibraryArticle {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    categoryId: row.category_id as string,
    excerpt: row.excerpt as string,
    body: row.body as string,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? undefined,
    docUrl: (row.doc_url as string | null) ?? undefined,
    docFilename: (row.doc_filename as string | null) ?? undefined,
    docSizeBytes: (row.doc_size_bytes as number | null) ?? undefined,
    tags: JSON.parse(row.tags as string) as string[],
    authorName: row.author_name as string,
    authorUserId: (row.author_user_id as string | null) ?? undefined,
    authorAvatarUrl: (row.author_avatar_url as string | null) ?? undefined,
    readingTimeMinutes: row.reading_time_minutes as number,
    viewCount: row.view_count as number,
    status: row.status as QaLibraryArticle['status'],
    seoMetaTitle: (row.seo_meta_title as string | null) ?? undefined,
    seoMetaDescription: (row.seo_meta_description as string | null) ?? undefined,
    seoOgImage: (row.seo_og_image as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToSummary(row: Row): QaLibraryArticleSummary {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    categoryId: row.category_id as string,
    excerpt: row.excerpt as string,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? undefined,
    tags: JSON.parse(row.tags as string) as string[],
    status: row.status as QaLibraryArticleSummary['status'],
    readingTimeMinutes: row.reading_time_minutes as number,
    authorName: row.author_name as string,
    authorAvatarUrl: (row.author_avatar_url as string | null) ?? undefined,
    updatedAt: row.updated_at as string,
  };
}

export async function listQaLibraryArticles(opts?: { publishedOnly?: boolean; categoryId?: string }): Promise<QaLibraryArticleSummary[]> {
  await migrate();
  const db = getClient();
  const conditions: string[] = [];
  const args: string[] = [];
  if (opts?.publishedOnly) conditions.push(`status = 'published'`);
  if (opts?.categoryId) { conditions.push('category_id = ?'); args.push(opts.categoryId); }
  const where = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.execute({
    sql: `SELECT id, slug, title, category_id, excerpt, thumbnail_url, tags, status, reading_time_minutes,
                 author_name, author_avatar_url, updated_at
          FROM qa_library_articles${where} ORDER BY updated_at DESC`,
    args,
  });
  return result.rows.map(rowToSummary);
}

export async function readQaLibraryArticleBySlug(slug: string): Promise<QaLibraryArticle | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM qa_library_articles WHERE slug = ?', args: [slug] });
  const row = result.rows[0];
  return row ? rowToArticle(row) : null;
}

export async function readQaLibraryArticleById(id: string): Promise<QaLibraryArticle | null> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT * FROM qa_library_articles WHERE id = ?', args: [id] });
  const row = result.rows[0];
  return row ? rowToArticle(row) : null;
}

export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await migrate();
  const db = getClient();
  const result = await db.execute({
    sql: excludeId ? 'SELECT 1 FROM qa_library_articles WHERE slug = ? AND id != ?' : 'SELECT 1 FROM qa_library_articles WHERE slug = ?',
    args: excludeId ? [slug, excludeId] : [slug],
  });
  return result.rows.length > 0;
}

export async function isCategoryInUse(categoryId: string): Promise<boolean> {
  await migrate();
  const db = getClient();
  const result = await db.execute({ sql: 'SELECT 1 FROM qa_library_articles WHERE category_id = ?', args: [categoryId] });
  return result.rows.length > 0;
}

export async function createQaLibraryArticle(
  slug: string,
  data: QaLibraryArticleData,
  readingTimeMinutes: number
): Promise<QaLibraryArticle> {
  await migrate();
  const db = getClient();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.execute({
    sql: `INSERT INTO qa_library_articles
            (id, slug, title, category_id, excerpt, body, thumbnail_url, doc_url, doc_filename, doc_size_bytes,
             tags, author_name, author_user_id, author_avatar_url, reading_time_minutes, status,
             seo_meta_title, seo_meta_description, seo_og_image, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, slug, data.title, data.categoryId, data.excerpt, data.body,
      data.thumbnailUrl ?? null, data.docUrl ?? null, data.docFilename ?? null, data.docSizeBytes ?? null,
      JSON.stringify(data.tags), data.authorName, data.authorUserId ?? null, data.authorAvatarUrl ?? null,
      readingTimeMinutes, data.status,
      data.seoMetaTitle ?? null, data.seoMetaDescription ?? null, data.seoOgImage ?? null,
      now, now,
    ],
  });
  return { id, slug, ...data, readingTimeMinutes, viewCount: 0, createdAt: now, updatedAt: now };
}

// Per-row CAS, mirrors updatePortfolio/updateBooking.
export async function updateQaLibraryArticle(
  id: string,
  slug: string,
  data: QaLibraryArticleData,
  readingTimeMinutes: number,
  expectedUpdatedAt: string
): Promise<QaLibraryWriteResult> {
  await migrate();
  const db = getClient();
  const updatedAt = new Date().toISOString();
  const result = await db.execute({
    sql: `UPDATE qa_library_articles SET
            slug = ?, title = ?, category_id = ?, excerpt = ?, body = ?, thumbnail_url = ?, doc_url = ?,
            doc_filename = ?, doc_size_bytes = ?, tags = ?, author_name = ?, author_user_id = ?, author_avatar_url = ?,
            reading_time_minutes = ?, status = ?, seo_meta_title = ?, seo_meta_description = ?, seo_og_image = ?,
            updated_at = ?
          WHERE id = ? AND updated_at IS ?
          RETURNING created_at, view_count`,
    args: [
      slug, data.title, data.categoryId, data.excerpt, data.body, data.thumbnailUrl ?? null, data.docUrl ?? null,
      data.docFilename ?? null, data.docSizeBytes ?? null, JSON.stringify(data.tags), data.authorName,
      data.authorUserId ?? null, data.authorAvatarUrl ?? null,
      readingTimeMinutes, data.status, data.seoMetaTitle ?? null, data.seoMetaDescription ?? null,
      data.seoOgImage ?? null, updatedAt,
      id, expectedUpdatedAt,
    ],
  });
  const row = result.rows[0];
  if (!row) {
    const current = await readQaLibraryArticleById(id);
    if (!current) return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'conflict', current };
  }
  return {
    ok: true,
    article: {
      id, slug, ...data, readingTimeMinutes, viewCount: row.view_count as number,
      createdAt: row.created_at as string, updatedAt,
    },
  };
}

export async function deleteQaLibraryArticle(id: string): Promise<void> {
  await migrate();
  const db = getClient();
  await db.execute({ sql: 'DELETE FROM qa_library_articles WHERE id = ?', args: [id] });
}

// Fire-and-forget-friendly: called from the public GET route on every
// anonymous view. Not exact under heavy concurrency (no row lock beyond the
// atomic `+1` UPDATE itself), same trade-off already accepted by
// rateLimit.ts's counter — fine for a display metric, not a billing figure.
export async function incrementQaLibraryArticleViewCount(id: string): Promise<number> {
  await migrate();
  const db = getClient();
  const result = await db.execute({
    sql: 'UPDATE qa_library_articles SET view_count = view_count + 1 WHERE id = ? RETURNING view_count',
    args: [id],
  });
  return (result.rows[0]?.view_count as number | undefined) ?? 0;
}
