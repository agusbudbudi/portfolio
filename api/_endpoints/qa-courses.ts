import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireSession, resolveAdminSession, resolveSession } from '../_lib/auth.js';
import {
  courseLearners, coursesForProjectWithProgress, createQaCourse, deleteQaCourse, isCourseSlugTaken, listCompletedArticles, listQaCourses, publishedCoursesForArticle,
  readQaCourseBySlug, resolveCourseArticles, setArticleCompleted, updateQaCourse,
} from '../_lib/qaCourseStore.js';
import { courseArticleIds, validateQaCourseData } from '../../src/lib/qaCourseValidation.js';
import { isValidSlug, slugify } from '../../src/lib/portfolioValidation.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import type { QaCourseData, QaCourseDetail } from '../../src/types/qaCourse.js';

// Routes:
//   GET    /api/qa-courses                  public: published course summaries
//   GET    /api/qa-courses?article=<id>     public: { memberships } courses using that article
//   POST   /api/qa-courses                  admin: create { slug, ...QaCourseData }
//   GET    /api/qa-courses/admin            admin: every course, any status
//   GET    /api/qa-courses/admin/learners/:slug  admin: { learners: QaCourseLearner[] }
//   GET    /api/qa-courses/:slug            public (drafts: admin only) → QaCourseDetail
//   PUT    /api/qa-courses/:slug            admin: replace, CAS via x-qa-course-updated-at
//   DELETE /api/qa-courses/:slug            admin
//   GET    /api/qa-courses/for-project/:projectId  user: { courses: QaCourseWithProgress[] }
//   GET    /api/qa-courses/:slug/progress   user: { courseId, completedArticleIds }
//   PUT    /api/qa-courses/:slug/progress   user: { articleId, completed } → same shape

const RESERVED_SLUGS = new Set(['admin', 'for-project']);
const PROJECT_ID_RE = /^[a-z0-9-]+$/;

// Signed-in learner's own courses on a simulator project (portfolio tab).
async function handleForProject(req: VercelRequest, res: VercelResponse, projectId: string) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!PROJECT_ID_RE.test(projectId)) return res.status(400).json({ error: 'invalid_project_id' });
  const session = await resolveSession(req, res);
  if (!session) return;
  const courses = await coursesForProjectWithProgress(session.userId, projectId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ courses });
}

function readBody(req: VercelRequest): Record<string, unknown> {
  return typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
}

// A published course must only point at published articles, or a lesson
// would 404 for learners.
async function publishErrors(data: QaCourseData): Promise<string[]> {
  if (data.status !== 'published') return [];
  const ids = courseArticleIds(data);
  const refs = await resolveCourseArticles(ids);
  const errors: string[] = [];
  data.modules.forEach((mod, mi) => mod.items.forEach((item, ii) => {
    if (item.kind !== 'article') return;
    const ref = refs[item.articleId];
    if (!ref) errors.push(`Modul ${mi + 1}, item ${ii + 1}: artikel sudah dihapus.`);
    else if (!ref.available) errors.push(`Modul ${mi + 1}, item ${ii + 1}: artikel "${ref.title}" masih draft.`);
  }));
  return errors;
}

async function handleRoot(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { article } = req.query;
    if (typeof article === 'string' && article) {
      const memberships = await publishedCoursesForArticle(article);
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
      return res.status(200).json({ memberships });
    }
    const courses = await listQaCourses({ publishedOnly: true });
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ courses });
  }
  if (req.method === 'POST') {
    if (!(await resolveAdminSession(req, res))) return;
    const body = readBody(req);
    const slug = typeof body.slug === 'string' && body.slug ? body.slug : slugify(typeof body.title === 'string' ? body.title : '');
    if (!isValidSlug(slug) || RESERVED_SLUGS.has(slug)) {
      return res.status(400).json({ error: 'invalid_slug', errors: ['slug: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
    }
    if (await isCourseSlugTaken(slug)) return res.status(409).json({ error: 'slug_taken', errors: [`slug "${slug}" sudah dipakai.`] });
    const result = validateQaCourseData(body);
    if (!result.ok) return res.status(400).json({ error: 'invalid_course', errors: result.errors });
    const pubErrors = await publishErrors(result.course);
    if (pubErrors.length > 0) return res.status(400).json({ error: 'invalid_course', errors: pubErrors });
    const course = await createQaCourse(slug, result.course);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(201).json(course);
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleAdminList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!(await resolveAdminSession(req, res))) return;
  const courses = await listQaCourses();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ courses });
}

async function handleLearners(req: VercelRequest, res: VercelResponse, slug: string) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!(await resolveAdminSession(req, res))) return;
  const course = await readQaCourseBySlug(slug);
  if (!course) return res.status(404).json({ error: 'not_found' });
  const learners = await courseLearners(course);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ learners });
}

async function handleSlugGet(req: VercelRequest, res: VercelResponse, slug: string) {
  const course = await readQaCourseBySlug(slug);
  if (!course) return res.status(404).json({ error: 'not_found' });
  const sessionSecret = process.env.SESSION_SECRET;
  const session = sessionSecret ? await requireSession(sessionSecret, req.headers.authorization) : null;
  const isAdmin = Boolean(session?.roles.includes('admin'));
  if (course.status !== 'published' && !isAdmin) return res.status(404).json({ error: 'not_found' });

  const detail: QaCourseDetail = { ...course, articles: await resolveCourseArticles(courseArticleIds(course)) };
  res.setHeader('Cache-Control', isAdmin ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(detail);
}

async function handleSlugPut(req: VercelRequest, res: VercelResponse, currentSlug: string) {
  if (!(await resolveAdminSession(req, res))) return;
  const existing = await readQaCourseBySlug(currentSlug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const body = readBody(req);
  const nextSlug = typeof body.slug === 'string' && body.slug ? body.slug : currentSlug;
  if (!isValidSlug(nextSlug) || RESERVED_SLUGS.has(nextSlug)) {
    return res.status(400).json({ error: 'invalid_slug', errors: ['slug: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (nextSlug !== existing.slug && (await isCourseSlugTaken(nextSlug, existing.id))) {
    return res.status(409).json({ error: 'slug_taken', errors: [`slug "${nextSlug}" sudah dipakai.`] });
  }
  const result = validateQaCourseData(body);
  if (!result.ok) return res.status(400).json({ error: 'invalid_course', errors: result.errors });
  const pubErrors = await publishErrors(result.course);
  if (pubErrors.length > 0) return res.status(400).json({ error: 'invalid_course', errors: pubErrors });

  const clientVersion = req.headers['x-qa-course-updated-at'];
  const expectedUpdatedAt = typeof clientVersion === 'string' ? clientVersion : existing.updatedAt;
  const write = await updateQaCourse(existing.id, nextSlug, result.course, expectedUpdatedAt);
  if (!write.ok) {
    if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
    return res.status(409).json({ error: 'conflict', current: write.current });
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.course);
}

async function handleSlugDelete(req: VercelRequest, res: VercelResponse, slug: string) {
  if (!(await resolveAdminSession(req, res))) return;
  const existing = await readQaCourseBySlug(slug);
  if (!existing) return res.status(404).json({ error: 'not_found' });
  await deleteQaCourse(existing.id);
  return res.status(204).end();
}

async function handleProgress(req: VercelRequest, res: VercelResponse, slug: string) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const session = await resolveSession(req, res);
  if (!session) return;
  const course = await readQaCourseBySlug(slug);
  if (!course || course.status !== 'published') return res.status(404).json({ error: 'not_found' });

  if (req.method === 'PUT') {
    // A learner marks a lesson every few minutes; 60/min/user is generous.
    if (!(await checkRateLimit(`course-progress:${session.userId}`, 60, 60_000))) {
      return res.status(429).json({ error: 'rate_limited', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' });
    }
    const body = readBody(req);
    if (typeof body.articleId !== 'string' || typeof body.completed !== 'boolean') {
      return res.status(400).json({ error: 'invalid_body', errors: ['articleId (string) dan completed (boolean) wajib.'] });
    }
    if (!courseArticleIds(course).includes(body.articleId)) {
      return res.status(400).json({ error: 'invalid_body', errors: ['articleId: bukan bagian dari course ini.'] });
    }
    await setArticleCompleted(session.userId, course.id, body.articleId, body.completed);
  }

  const completedArticleIds = await listCompletedArticles(session.userId, course.id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ courseId: course.id, completedArticleIds });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first, second] = path;

  if (!first) return handleRoot(req, res);
  if (first === 'admin' && !second) return handleAdminList(req, res);
  if (first === 'admin' && second === 'learners' && path[2] && path.length === 3) return handleLearners(req, res, path[2]);
  if (first === 'for-project' && second && path.length === 2) return handleForProject(req, res, second);
  if (second === 'progress' && path.length === 2) return handleProgress(req, res, first);
  if (path.length !== 1) return res.status(404).json({ error: 'not_found' });

  if (req.method === 'GET') return handleSlugGet(req, res, first);
  if (req.method === 'PUT') return handleSlugPut(req, res, first);
  if (req.method === 'DELETE') return handleSlugDelete(req, res, first);
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'method_not_allowed' });
}
