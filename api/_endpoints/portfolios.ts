import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isResourceOwner, requireOwnerOrAdmin, requireSession, resolveAdminSession, resolveSession,
} from '../_lib/auth.js';
import { readTools } from '../_lib/configStore.js';
import {
  createPortfolio, deletePortfolio, isSlugTaken, readPortfolioByOwnerId, readPortfolioBySlug, updatePortfolio,
} from '../_lib/portfolioStore.js';
import { isValidSlug, validatePortfolioData, validatePortfolioStatus } from '../../src/lib/portfolioValidation.js';

// Public, no auth — the admin form live-checks slug availability as the
// mentee name is typed. Response is intentionally minimal (just a boolean)
// so it can't be used to enumerate portfolio data.
async function handleCheckSlug(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { slug, excludeId } = req.query;
  if (typeof slug !== 'string' || !isValidSlug(slug)) {
    return res.status(400).json({ error: 'invalid_slug' });
  }

  const taken = await isSlugTaken(slug, typeof excludeId === 'string' ? excludeId : undefined);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ available: !taken });
}

// Self-serve counterpart to api/portfolios.ts (admin list/create) — this is
// "my own portfolio," scoped to whoever is currently logged in. One portfolio
// per account, enforced by the owner_id unique index (turso.ts) and this
// pre-check (mirrors mentors' apply readMentorByUserId check).
async function handleMineGet(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const portfolio = await readPortfolioByOwnerId(session.userId);
  if (!portfolio) return res.status(404).json({ error: 'not_found' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(portfolio);
}

async function handleMinePost(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const existing = await readPortfolioByOwnerId(session.userId);
  if (existing) {
    return res.status(409).json({
      error: 'already_have_portfolio',
      message: 'Kamu sudah punya portfolio. Edit yang sudah ada, bukan buat baru.',
      slug: existing.slug,
    });
  }

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const status = body.status;

  if (!isValidSlug(slug)) {
    return res.status(400).json({ error: 'invalid_slug', errors: ['slug: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (!validatePortfolioStatus(status)) {
    return res.status(400).json({ error: 'invalid_status', errors: ['status: wajib "draft" atau "published".'] });
  }
  if (await isSlugTaken(slug)) {
    return res.status(409).json({ error: 'slug_taken', errors: [`slug "${slug}" sudah dipakai.`] });
  }

  const { tools } = await readTools();
  const validToolIds = new Set(tools.map((t) => t.id));
  const result = validatePortfolioData(body.data, validToolIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_portfolio', errors: result.errors });
  }

  // Self-serve create — only admins can grant the verified badge (see handleSlug).
  result.data.profile.isVerified = false;

  const record = await createPortfolio(slug, status, result.data, session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(record);
}

async function handleMine(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleMineGet(req, res);
  if (req.method === 'POST') return handleMinePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}

// Lets a mentor (or any logged-in account) check whether a mentee — identified
// by their booking's menteeUserId — has a CV and/or a public portfolio page to
// view. CV is returned regardless of publish status (it's just an uploaded
// file, not gated content); the portfolio slug/link is only returned once
// published, matching the [slug] route's own visibility rule for non-owners.
async function handleByOwner(req: VercelRequest, res: VercelResponse, userId: string) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  const session = await requireSession(sessionSecret, req.headers.authorization);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const portfolio = await readPortfolioByOwnerId(userId);
  if (!portfolio) return res.status(404).json({ error: 'not_found' });

  res.setHeader('Cache-Control', 'private, max-age=0, s-maxage=60');
  return res.status(200).json({
    slug: portfolio.status === 'published' ? portfolio.slug : null,
    cvUrl: portfolio.data.profile.cvUrl ?? null,
  });
}

// Public reader (mentee portfolio page at /portfolio/:slug) shares this route
// with the admin editor and the owning mentee's own dashboard. Unauthenticated
// callers, and authenticated callers who are neither the owner nor admin,
// only ever see a published record — draft rows 404 for them so a slug's
// content isn't leaked before the mentee publishes.
async function handleSlugGet(req: VercelRequest, res: VercelResponse, slug: string) {
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

async function handleSlugPut(req: VercelRequest, res: VercelResponse, currentSlug: string) {
  const session = await resolveSession(req, res);
  if (!session) return;

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

async function handleSlugDelete(req: VercelRequest, res: VercelResponse, slug: string) {
  if (!(await resolveAdminSession(req, res))) return;

  const existing = await readPortfolioBySlug(slug);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  await deletePortfolio(existing.id);
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
  const [first, second] = path;

  if (first === 'check-slug') return handleCheckSlug(req, res);
  if (first === 'mine') return handleMine(req, res);
  if (first === 'by-owner' && second) return handleByOwner(req, res, second);
  if (first) return handleSlug(req, res, first);
  return res.status(404).json({ error: 'not_found' });
}
