import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import { readTools } from '../_lib/configStore.js';
import { createPortfolio, isSlugTaken, readPortfolioByOwnerId } from '../_lib/portfolioStore.js';
import { isValidSlug, validatePortfolioData, validatePortfolioStatus } from '../../src/lib/portfolioValidation.js';

// Self-serve counterpart to api/portfolios.ts (admin list/create) — this is
// "my own portfolio," scoped to whoever is currently logged in. One portfolio
// per account, enforced by the owner_id unique index (turso.ts) and this
// pre-check (mirrors mentors/apply.ts's readMentorByUserId check).
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const portfolio = await readPortfolioByOwnerId(session.userId);
  if (!portfolio) return res.status(404).json({ error: 'not_found' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(portfolio);
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
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

  // Self-serve create — only admins can grant the verified badge (see [slug].ts).
  result.data.profile.isVerified = false;

  const record = await createPortfolio(slug, status, result.data, session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(record);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
