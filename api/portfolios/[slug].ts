import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from '../_lib/auth.js';
import { readTools } from '../_lib/configStore.js';
import {
  deletePortfolio, isSlugTaken, readPortfolioBySlug, updatePortfolio,
} from '../_lib/portfolioStore.js';
import { isValidSlug, validatePortfolioData, validatePortfolioStatus } from '../../src/lib/portfolioValidation.js';

async function requireAuth(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
    return false;
  }
  if (!(await requireAdminSession(sessionSecret, req.headers.authorization))) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

async function isAuthed(req: VercelRequest): Promise<boolean> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) return false;
  return Boolean(await requireAdminSession(sessionSecret, req.headers.authorization));
}

function getSlugParam(req: VercelRequest): string | null {
  const { slug } = req.query;
  return typeof slug === 'string' ? slug : null;
}

// Public reader (mentee portfolio page at /portfolio/:slug) shares this route
// with the admin editor. Unauthenticated callers only ever see a published
// record — draft rows 404 for them so a slug's content isn't leaked before
// the mentee publishes.
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const slug = getSlugParam(req);
  if (!slug) return res.status(400).json({ error: 'missing_slug' });

  const record = await readPortfolioBySlug(slug);
  if (!record) return res.status(404).json({ error: 'not_found' });

  if (await isAuthed(req)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(record);
  }

  if (record.status !== 'published') return res.status(404).json({ error: 'not_found' });
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(record);
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;
  const currentSlug = getSlugParam(req);
  if (!currentSlug) return res.status(400).json({ error: 'missing_slug' });

  const existing = await readPortfolioBySlug(currentSlug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const nextSlug = typeof body.slug === 'string' ? body.slug : '';
  const status = body.status;

  if (!isValidSlug(nextSlug)) {
    return res.status(400).json({ error: 'invalid_slug', errors: ['slug: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (!validatePortfolioStatus(status)) {
    return res.status(400).json({ error: 'invalid_status', errors: ['status: wajib "draft" atau "published".'] });
  }
  if (nextSlug !== existing.slug && (await isSlugTaken(nextSlug, existing.id))) {
    return res.status(409).json({ error: 'slug_taken', errors: [`slug "${nextSlug}" sudah dipakai.`] });
  }

  const { tools } = await readTools();
  const validToolIds = new Set(tools.map((t) => t.id));
  const result = validatePortfolioData(body.data, validToolIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_portfolio', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded.
  const clientVersion = req.headers['x-portfolio-updated-at'];
  const expectedUpdatedAt = typeof clientVersion === 'string' ? clientVersion : existing.updatedAt;

  const write = await updatePortfolio(existing.id, nextSlug, status, result.data, expectedUpdatedAt);
  if (!write.ok) {
    if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.record);
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;
  const slug = getSlugParam(req);
  if (!slug) return res.status(400).json({ error: 'missing_slug' });

  const existing = await readPortfolioBySlug(slug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  await deletePortfolio(existing.id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'PUT') return handlePut(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'method_not_allowed' });
}
