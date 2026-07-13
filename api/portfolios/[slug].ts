import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isResourceOwner, requireOwnerOrAdmin, resolveAdminSession, resolveSession, requireSession } from '../_lib/auth.js';
import { readTools } from '../_lib/configStore.js';
import {
  deletePortfolio, isSlugTaken, readPortfolioBySlug, updatePortfolio,
} from '../_lib/portfolioStore.js';
import { isValidSlug, validatePortfolioData, validatePortfolioStatus } from '../../src/lib/portfolioValidation.js';

function getSlugParam(req: VercelRequest): string | null {
  const { slug } = req.query;
  return typeof slug === 'string' ? slug : null;
}

// Public reader (mentee portfolio page at /portfolio/:slug) shares this route
// with the admin editor and the owning mentee's own dashboard. Unauthenticated
// callers, and authenticated callers who are neither the owner nor admin,
// only ever see a published record — draft rows 404 for them so a slug's
// content isn't leaked before the mentee publishes.
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const slug = getSlugParam(req);
  if (!slug) return res.status(400).json({ error: 'missing_slug' });

  const record = await readPortfolioBySlug(slug);
  if (!record) return res.status(404).json({ error: 'not_found' });

  const sessionSecret = process.env.SESSION_SECRET;
  const session = sessionSecret ? await requireSession(sessionSecret, req.headers.authorization) : null;
  const canSeeDraft = Boolean(session && (session.roles.includes('admin') || isResourceOwner(session, record.ownerId)));

  if (record.status === 'published' || canSeeDraft) {
    res.setHeader('Cache-Control', canSeeDraft ? 'no-store' : 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(record);
  }

  return res.status(404).json({ error: 'not_found' });
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const currentSlug = getSlugParam(req);
  if (!currentSlug) return res.status(400).json({ error: 'missing_slug' });

  const existing = await readPortfolioBySlug(currentSlug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  if (!requireOwnerOrAdmin(res, session, existing.ownerId)) return;
  const isAdmin = session.roles.includes('admin');

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

  // Only admins can grant/revoke the verified badge — an owner editing their
  // own portfolio can't self-verify by sending isVerified in the payload.
  if (!isAdmin) {
    result.data.profile.isVerified = existing.data.profile.isVerified;
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
  if (!(await resolveAdminSession(req, res))) return;
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
