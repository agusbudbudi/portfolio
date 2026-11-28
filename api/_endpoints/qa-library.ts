import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireSession, resolveAdminSession } from '../_lib/auth.js';
import { readQaLibraryCategories } from '../_lib/configStore.js';
import {
  createQaLibraryArticle, deleteQaLibraryArticle, incrementQaLibraryArticleViewCount, isSlugTaken,
  listQaLibraryArticles, readQaLibraryArticleBySlug, updateQaLibraryArticle,
} from '../_lib/qaLibraryStore.js';
import { coursesUsingArticle, publishedCourseRefsByArticle, publishedCoursesForArticle } from '../_lib/qaCourseStore.js';
import { computeReadingTimeMinutes, validateQaLibraryArticleData } from '../../src/lib/qaLibraryValidation.js';
import { splitPreview, stripPreviewMarker } from '../../src/lib/articlePreview.js';
import type { QaLibraryArticle } from '../../src/types/qaLibrary.js';
import { isValidSlug, slugify } from '../../src/lib/portfolioValidation.js';

// Admin-only list — every status, no auth-visibility split needed since the
// whole response is gated. Mirrors handleAdminList precedent (bookings.ts).
async function handleAdminList(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!(await resolveAdminSession(req, res))) return;

  const articles = await listQaLibraryArticles();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ articles });
}

// Public list — published only, optional category filter. Unlike
// bookings.ts/portfolios.ts (which have no root handler at all, a known
// dead-code gap — see turso.ts/mentors.ts comments), this explicitly
// implements GET/POST at the root so /api/qa-library actually works.
async function handleRootGet(req: VercelRequest, res: VercelResponse) {
  const { category, slugs: slugsParam } = req.query;
  const categoryId = typeof category === 'string' && category ? category : undefined;
  // ?slugs=a,b — fetch specific articles (e.g. a simulator phase's reading
  // list) by slug. Includes course-only articles: they're public by URL, just
  // hidden from the library grid. Avoids per-slug detail reads, which would
  // bump view counts.
  const slugs = typeof slugsParam === 'string' && slugsParam
    ? slugsParam.split(',').map((s) => s.trim()).filter((s) => isValidSlug(s)).slice(0, 20)
    : undefined;
  const [articles, courseRefs] = await Promise.all([
    listQaLibraryArticles({ publishedOnly: true, publicGrid: !slugs, categoryId, slugs }),
    publishedCourseRefsByArticle(),
  ]);
  // Course-only rows carry their course, for the card's "Bagian dari" badge.
  for (const article of articles) {
    const course = article.visibility === 'course-only' ? courseRefs.get(article.id) : undefined;
    if (course) article.course = course;
  }
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ articles });
}

async function handleRootPost(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const title = typeof body.title === 'string' ? body.title : '';
  const requestedSlug = typeof body.slug === 'string' && body.slug ? body.slug : slugify(title);

  if (!isValidSlug(requestedSlug)) {
    return res.status(400).json({ error: 'invalid_slug', errors: ['slug: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (await isSlugTaken(requestedSlug)) {
    return res.status(409).json({ error: 'slug_taken', errors: [`slug "${requestedSlug}" sudah dipakai.`] });
  }

  const { categories } = await readQaLibraryCategories();
  const validCategoryIds = new Set(categories.map((c) => c.id));
  const result = validateQaLibraryArticleData(body, validCategoryIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_article', errors: result.errors });
  }

  const readingTimeMinutes = computeReadingTimeMinutes(result.article.body);
  const article = await createQaLibraryArticle(requestedSlug, result.article, readingTimeMinutes);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(article);
}

async function handleRoot(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleRootGet(req, res);
  if (req.method === 'POST') return handleRootPost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}

/**
 * What a non-admin reader gets. A course-only article that a published course
 * uses is cut to its preview (src/lib/articlePreview.ts) unless the request is
 * a lesson read, `?course=<slug>` of one of those courses: the rest of the
 * article lives in the course. Everything else is sent whole, marker removed.
 */
async function publicView(article: QaLibraryArticle, courseParam: string | undefined): Promise<QaLibraryArticle> {
  const whole = { ...article, body: stripPreviewMarker(article.body) };
  if (article.visibility !== 'course-only') return whole;

  const courses = await publishedCoursesForArticle(article.id);
  if (courses.length === 0 || courses.some((c) => c.slug === courseParam)) return whole;

  const cut = splitPreview(article.body);
  if (!cut) return whole;
  return {
    ...article,
    body: cut.preview,
    docUrl: undefined,
    docFilename: undefined,
    docSizeBytes: undefined,
    preview: {
      lockedHeadings: cut.lockedHeadings,
      previewWordRatio: Math.round(cut.ratio * 100) / 100,
      courses,
      hasAttachment: Boolean(article.docUrl),
    },
  };
}

// Public reader — drafts are only visible to an admin session, mirroring
// portfolios.ts handleSlugGet's canSeeDraft pattern. Never varies s-maxage by
// session (a shared edge cache doesn't check Authorization). `?course=` is part
// of the URL, so a lesson read and a preview read are separate cache entries.
async function handleSlugGet(req: VercelRequest, res: VercelResponse, slug: string) {
  let article = await readQaLibraryArticleBySlug(slug);
  if (!article) return res.status(404).json({ error: 'not_found' });

  const sessionSecret = process.env.SESSION_SECRET;
  const session = sessionSecret ? await requireSession(sessionSecret, req.headers.authorization) : null;
  const canSeeDraft = Boolean(session?.roles.includes('admin'));

  if (article.status === 'published' || canSeeDraft) {
    // Only count genuine anonymous public reads — the admin form's edit/preview
    // load always sends an Authorization header, so an authenticated request
    // (any role, not just admin) never bumps the counter.
    if (article.status === 'published' && !session) {
      const viewCount = await incrementQaLibraryArticleViewCount(article.id);
      article = { ...article, viewCount };
    }
    // Admins (form edit/preview) get the stored body, marker included.
    if (!canSeeDraft) {
      const courseParam = typeof req.query.course === 'string' && req.query.course ? req.query.course : undefined;
      article = await publicView(article, courseParam);
    }
    res.setHeader('Cache-Control', canSeeDraft ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(article);
  }

  return res.status(404).json({ error: 'not_found' });
}

async function handleSlugPut(req: VercelRequest, res: VercelResponse, currentSlug: string) {
  if (!(await resolveAdminSession(req, res))) return;

  const existing = await readQaLibraryArticleBySlug(currentSlug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const nextSlug = typeof body.slug === 'string' && body.slug ? body.slug : currentSlug;

  if (!isValidSlug(nextSlug)) {
    return res.status(400).json({ error: 'invalid_slug', errors: ['slug: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (nextSlug !== existing.slug && (await isSlugTaken(nextSlug, existing.id))) {
    return res.status(409).json({ error: 'slug_taken', errors: [`slug "${nextSlug}" sudah dipakai.`] });
  }

  const { categories } = await readQaLibraryCategories();
  const validCategoryIds = new Set(categories.map((c) => c.id));
  const result = validateQaLibraryArticleData(body, validCategoryIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_article', errors: result.errors });
  }

  const readingTimeMinutes = computeReadingTimeMinutes(result.article.body);

  // Optimistic concurrency: client echoes the updatedAt it loaded.
  const clientVersion = req.headers['x-qa-library-article-updated-at'];
  const expectedUpdatedAt = typeof clientVersion === 'string' ? clientVersion : existing.updatedAt;

  const write = await updateQaLibraryArticle(existing.id, nextSlug, result.article, readingTimeMinutes, expectedUpdatedAt);
  if (!write.ok) {
    if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.article);
}

async function handleSlugDelete(req: VercelRequest, res: VercelResponse, slug: string) {
  if (!(await resolveAdminSession(req, res))) return;

  const existing = await readQaLibraryArticleBySlug(slug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  // A course lesson pointing at a deleted article would 404 for learners.
  const usedBy = await coursesUsingArticle(existing.id);
  if (usedBy.length > 0) {
    const message = `Artikel ini dipakai di course: ${usedBy.join(', ')}. Keluarkan dari course dulu sebelum menghapus.`;
    return res.status(409).json({ error: 'article_in_use', message, errors: [message] });
  }

  await deleteQaLibraryArticle(existing.id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}

async function handleSlug(req: VercelRequest, res: VercelResponse, slug: string) {
  if (req.method === 'GET') return handleSlugGet(req, res, slug);
  if (req.method === 'PUT') return handleSlugPut(req, res, slug);
  if (req.method === 'DELETE') return handleSlugDelete(req, res, slug);
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'method_not_allowed' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first] = path;

  if (first === 'admin') return handleAdminList(req, res);
  if (first) return handleSlug(req, res, first);
  return handleRoot(req, res);
}
