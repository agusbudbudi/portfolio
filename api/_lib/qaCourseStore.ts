// Read/write QA Course records and per-user article progress in Turso.
// A course row holds its whole module/item structure as JSON; the admin
// always saves the course whole, guarded by compare-and-swap on updated_at
// (same pattern as qaLibraryStore.ts).
import type { Row } from '@libsql/client';
import type {
  QaCourse, QaCourseArticleRef, QaCourseData, QaCourseLearner, QaCourseMembership, QaCourseModule, QaCourseSummary, QaCourseWithProgress,
} from '../../src/types/qaCourse.js';
import { isLessonItem } from '../../src/types/qaCourse.js';
import { courseArticleIds } from '../../src/lib/qaCourseValidation.js';
import { getClient, migrate } from './turso.js';

export type QaCourseWriteResult =
  | { ok: true; course: QaCourse }
  | { ok: false; reason: 'conflict'; current: QaCourse | null }
  | { ok: false; reason: 'not_found' };

function rowToCourse(row: Row): QaCourse {
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: row.description as string,
    level: row.level as QaCourse['level'],
    estimatedHours: Number(row.estimated_hours),
    thumbnailUrl: (row.thumbnail_url as string | null) ?? undefined,
    status: row.status as QaCourse['status'],
    modules: JSON.parse(row.modules as string) as QaCourseModule[],
    seoMetaTitle: (row.seo_meta_title as string | null) ?? undefined,
    seoMetaDescription: (row.seo_meta_description as string | null) ?? undefined,
    seoOgImage: (row.seo_og_image as string | null) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toSummary(course: QaCourse): QaCourseSummary {
  const items = course.modules.flatMap((m) => m.items);
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    level: course.level,
    estimatedHours: course.estimatedHours,
    thumbnailUrl: course.thumbnailUrl,
    status: course.status,
    moduleCount: course.modules.length,
    articleCount: items.filter((i) => i.kind === 'article').length,
    missionCount: items.filter((i) => i.kind === 'mission').length,
    updatedAt: course.updatedAt,
  };
}

// Accounts with any activity in the course whose id is bound to both `?`:
// a lesson marked done, or a checkpoint answered/skipped. Blocks deleting
// the course. (Peserta, the count shown, is the progress half only, the
// same rule as the Peserta panel; mission progress lives per simulator
// project, not per course, so neither counts it.)
const ACTIVE_USERS_SQL = `SELECT user_id FROM qa_course_progress WHERE course_id = ?
  UNION SELECT user_id FROM feedback_responses WHERE context_type = 'course' AND context_id = ?`;

export async function listQaCourses(opts?: { publishedOnly?: boolean }): Promise<QaCourseSummary[]> {
  await migrate();
  if (opts?.publishedOnly) {
    const result = await getClient().execute(`SELECT * FROM qa_courses WHERE status = 'published' ORDER BY created_at ASC`);
    return result.rows.map((row) => toSummary(rowToCourse(row)));
  }
  // Admin list: Peserta, submitted feedback, and whether anything blocks delete.
  const result = await getClient().execute(
    `SELECT c.*,
            (SELECT COUNT(DISTINCT p.user_id) FROM qa_course_progress p WHERE p.course_id = c.id) AS learner_count,
            (SELECT COUNT(*) FROM feedback_responses f
              WHERE f.context_type = 'course' AND f.context_id = c.id AND f.status = 'submitted') AS feedback_count,
            (SELECT COUNT(*) FROM (${ACTIVE_USERS_SQL.replace(/\?/g, 'c.id')})) AS active_count
       FROM qa_courses c ORDER BY c.updated_at DESC`
  );
  return result.rows.map((row) => ({
    ...toSummary(rowToCourse(row)),
    learnerCount: Number(row.learner_count),
    feedbackCount: Number(row.feedback_count),
    deleteLocked: Number(row.active_count) > 0,
  }));
}

/** Accounts with progress or feedback in a course; a course with any cannot be deleted. */
export async function courseActiveUserCount(courseId: string): Promise<number> {
  await migrate();
  const result = await getClient().execute({ sql: `SELECT COUNT(*) AS n FROM (${ACTIVE_USERS_SQL})`, args: [courseId, courseId] });
  return Number(result.rows[0]?.n ?? 0);
}

export async function readQaCourseBySlug(slug: string): Promise<QaCourse | null> {
  await migrate();
  const result = await getClient().execute({ sql: 'SELECT * FROM qa_courses WHERE slug = ?', args: [slug] });
  const row = result.rows[0];
  return row ? rowToCourse(row) : null;
}

async function readQaCourseById(id: string): Promise<QaCourse | null> {
  const result = await getClient().execute({ sql: 'SELECT * FROM qa_courses WHERE id = ?', args: [id] });
  const row = result.rows[0];
  return row ? rowToCourse(row) : null;
}

export async function isCourseSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await migrate();
  const result = await getClient().execute({
    sql: excludeId ? 'SELECT 1 FROM qa_courses WHERE slug = ? AND id != ?' : 'SELECT 1 FROM qa_courses WHERE slug = ?',
    args: excludeId ? [slug, excludeId] : [slug],
  });
  return result.rows.length > 0;
}

export async function createQaCourse(slug: string, data: QaCourseData): Promise<QaCourse> {
  await migrate();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await getClient().execute({
    sql: `INSERT INTO qa_courses
            (id, slug, title, description, level, estimated_hours, thumbnail_url, status, modules,
             seo_meta_title, seo_meta_description, seo_og_image, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, slug, data.title, data.description, data.level, data.estimatedHours, data.thumbnailUrl ?? null,
      data.status, JSON.stringify(data.modules),
      data.seoMetaTitle ?? null, data.seoMetaDescription ?? null, data.seoOgImage ?? null, now, now,
    ],
  });
  return { id, slug, ...data, createdAt: now, updatedAt: now };
}

export async function updateQaCourse(
  id: string,
  slug: string,
  data: QaCourseData,
  expectedUpdatedAt: string
): Promise<QaCourseWriteResult> {
  await migrate();
  const updatedAt = new Date().toISOString();
  const result = await getClient().execute({
    sql: `UPDATE qa_courses SET
            slug = ?, title = ?, description = ?, level = ?, estimated_hours = ?, thumbnail_url = ?, status = ?,
            modules = ?, seo_meta_title = ?, seo_meta_description = ?, seo_og_image = ?, updated_at = ?
          WHERE id = ? AND updated_at IS ?
          RETURNING created_at`,
    args: [
      slug, data.title, data.description, data.level, data.estimatedHours, data.thumbnailUrl ?? null, data.status,
      JSON.stringify(data.modules), data.seoMetaTitle ?? null, data.seoMetaDescription ?? null, data.seoOgImage ?? null,
      updatedAt, id, expectedUpdatedAt,
    ],
  });
  const row = result.rows[0];
  if (!row) {
    const current = await readQaCourseById(id);
    if (!current) return { ok: false, reason: 'not_found' };
    return { ok: false, reason: 'conflict', current };
  }
  return { ok: true, course: { id, slug, ...data, createdAt: row.created_at as string, updatedAt } };
}

export async function deleteQaCourse(id: string): Promise<void> {
  await migrate();
  await getClient().batch([
    { sql: 'DELETE FROM qa_course_progress WHERE course_id = ?', args: [id] },
    { sql: 'DELETE FROM qa_courses WHERE id = ?', args: [id] },
  ], 'write');
}

/**
 * Titles of courses that use an article, so the library admin can refuse to
 * delete it (a lesson would 404). JSON1 walks modules[].items[].
 */
export async function coursesUsingArticle(articleId: string): Promise<string[]> {
  await migrate();
  const result = await getClient().execute({
    sql: `SELECT DISTINCT c.title FROM qa_courses c, json_each(c.modules) m, json_each(m.value, '$.items') i
          WHERE json_extract(i.value, '$.kind') = 'article' AND json_extract(i.value, '$.articleId') = ?`,
    args: [articleId],
  });
  return result.rows.map((r) => r.title as string);
}

/** Lesson facts for the given article ids, any status; `available` = published. */
export async function resolveCourseArticles(ids: string[]): Promise<Record<string, QaCourseArticleRef>> {
  if (ids.length === 0) return {};
  await migrate();
  const placeholders = ids.map(() => '?').join(', ');
  const result = await getClient().execute({
    sql: `SELECT id, slug, title, excerpt, reading_time_minutes, status FROM qa_library_articles WHERE id IN (${placeholders})`,
    args: ids,
  });
  const refs: Record<string, QaCourseArticleRef> = {};
  for (const row of result.rows) {
    refs[row.id as string] = {
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: row.excerpt as string,
      readingTimeMinutes: row.reading_time_minutes as number,
      available: row.status === 'published',
    };
  }
  return refs;
}

export async function listCompletedArticles(userId: string, courseId: string): Promise<string[]> {
  await migrate();
  const result = await getClient().execute({
    sql: 'SELECT article_id FROM qa_course_progress WHERE user_id = ? AND course_id = ?',
    args: [userId, courseId],
  });
  return result.rows.map((r) => r.article_id as string);
}

export async function setArticleCompleted(userId: string, courseId: string, articleId: string, completed: boolean): Promise<void> {
  await migrate();
  await getClient().execute(
    completed
      ? {
        sql: `INSERT INTO qa_course_progress (user_id, course_id, article_id, completed_at) VALUES (?, ?, ?, ?)
              ON CONFLICT(user_id, course_id, article_id) DO NOTHING`,
        args: [userId, courseId, articleId, new Date().toISOString()],
      }
      : {
        sql: 'DELETE FROM qa_course_progress WHERE user_id = ? AND course_id = ? AND article_id = ?',
        args: [userId, courseId, articleId],
      }
  );
}

/** Published courses that include an article, with its lesson position. */
export async function publishedCoursesForArticle(articleId: string): Promise<QaCourseMembership[]> {
  await migrate();
  const result = await getClient().execute({
    sql: `SELECT DISTINCT c.* FROM qa_courses c, json_each(c.modules) m, json_each(m.value, '$.items') i
          WHERE c.status = 'published'
            AND json_extract(i.value, '$.kind') = 'article' AND json_extract(i.value, '$.articleId') = ?
          ORDER BY c.created_at ASC`,
    args: [articleId],
  });
  return result.rows.map((row) => {
    const course = rowToCourse(row);
    // Feedback checkpoints are not lessons: leave them out of "Lesson X dari Y".
    const lessons = course.modules.flatMap((m) => m.items).filter(isLessonItem);
    const position = lessons.findIndex((i) => i.kind === 'article' && i.articleId === articleId);
    return { slug: course.slug, title: course.title, lessonNumber: position + 1, totalLessons: lessons.length };
  });
}

/**
 * articleId → the oldest published course using it as a lesson: the course a
 * course-only article's card in the public library grid points to.
 */
export async function publishedCourseRefsByArticle(): Promise<Map<string, { slug: string; title: string }>> {
  await migrate();
  const result = await getClient().execute(
    `SELECT json_extract(i.value, '$.articleId') AS article_id, c.slug, c.title
     FROM qa_courses c, json_each(c.modules) m, json_each(m.value, '$.items') i
     WHERE c.status = 'published' AND json_extract(i.value, '$.kind') = 'article'
     ORDER BY c.created_at ASC`
  );
  const refs = new Map<string, { slug: string; title: string }>();
  for (const row of result.rows) {
    const id = row.article_id as string;
    if (!refs.has(id)) refs.set(id, { slug: row.slug as string, title: row.title as string });
  }
  return refs;
}

/**
 * Published courses with a mission on `projectId`, each with `userId`'s
 * article progress: what the simulator portfolio's "QA Course" tab needs.
 */
export async function coursesForProjectWithProgress(userId: string, projectId: string): Promise<QaCourseWithProgress[]> {
  await migrate();
  const db = getClient();
  const found = await db.execute({
    sql: `SELECT DISTINCT c.* FROM qa_courses c, json_each(c.modules) m, json_each(m.value, '$.items') i
          WHERE c.status = 'published'
            AND json_extract(i.value, '$.kind') = 'mission' AND json_extract(i.value, '$.projectId') = ?
          ORDER BY c.created_at ASC`,
    args: [projectId],
  });
  const courses = found.rows.map(rowToCourse);
  const out: QaCourseWithProgress[] = [];
  for (const course of courses) {
    const progress = await db.execute({
      sql: 'SELECT article_id, completed_at FROM qa_course_progress WHERE user_id = ? AND course_id = ?',
      args: [userId, course.id],
    });
    const completedArticleIds = progress.rows.map((r) => r.article_id as string);
    const lastCompletedAt = progress.rows.reduce<string | null>(
      (latest, r) => (!latest || (r.completed_at as string) > latest ? (r.completed_at as string) : latest),
      null
    );
    out.push({
      course: { ...course, articles: await resolveCourseArticles(courseArticleIds(course)), feedbackFlows: {} },
      completedArticleIds,
      lastCompletedAt,
    });
  }
  return out;
}

/**
 * Everyone who started `course` (marked at least one article), with their
 * article progress and the simulator progress of the course's projects.
 * Admin-only view; names and avatars, no emails.
 */
export async function courseLearners(course: QaCourse): Promise<QaCourseLearner[]> {
  await migrate();
  const db = getClient();
  const projectIds = [...new Set(course.modules.flatMap((m) => m.items).flatMap((i) => (i.kind === 'mission' ? [i.projectId] : [])))];
  const rows = await db.execute({
    sql: `SELECT p.user_id, p.article_id, p.completed_at, u.name, u.avatar_url
          FROM qa_course_progress p LEFT JOIN users u ON u.id = p.user_id
          WHERE p.course_id = ?`,
    args: [course.id],
  });
  const byUser = new Map<string, { name: string; avatarUrl?: string; ids: string[]; last: string | null }>();
  for (const r of rows.rows) {
    const uid = r.user_id as string;
    const entry = byUser.get(uid) ?? { name: (r.name as string | null) ?? 'Peserta', avatarUrl: (r.avatar_url as string | null) ?? undefined, ids: [], last: null };
    entry.ids.push(r.article_id as string);
    const at = r.completed_at as string;
    if (!entry.last || at > entry.last) entry.last = at;
    byUser.set(uid, entry);
  }
  const userIds = [...byUser.keys()];
  const sims = new Map<string, { data: Record<string, unknown>; shared: string[]; last: string | null }>();
  if (userIds.length > 0 && projectIds.length > 0) {
    const sim = await db.execute({
      sql: `SELECT user_id, project_id, data, updated_at, share_id FROM qa_simulator_progress
            WHERE user_id IN (${userIds.map(() => '?').join(', ')}) AND project_id IN (${projectIds.map(() => '?').join(', ')})`,
      args: [...userIds, ...projectIds],
    });
    for (const r of sim.rows) {
      const uid = r.user_id as string;
      const entry = sims.get(uid) ?? { data: {}, shared: [], last: null };
      entry.data[r.project_id as string] = JSON.parse(r.data as string);
      if (r.share_id) entry.shared.push(r.project_id as string);
      const at = r.updated_at as string;
      if (!entry.last || at > entry.last) entry.last = at;
      sims.set(uid, entry);
    }
  }
  return userIds.map((uid, i) => {
    const u = byUser.get(uid)!;
    const sim = sims.get(uid);
    const last = [u.last, sim?.last ?? null].filter((d): d is string => Boolean(d)).sort().at(-1) ?? null;
    return {
      key: `learner-${i}`,
      name: u.name,
      avatarUrl: u.avatarUrl,
      completedArticleIds: u.ids,
      lastActiveAt: last,
      simulator: sim?.data ?? {},
      sharedProjectIds: sim?.shared ?? [],
    };
  }).sort((a, b) => (b.lastActiveAt ?? '').localeCompare(a.lastActiveAt ?? ''));
}
