import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from './_lib/auth.js';
import { readTools } from './_lib/configStore.js';
import { createPortfolio, isSlugTaken, listPortfolios } from './_lib/portfolioStore.js';
import { isValidSlug, validatePortfolioData, validatePortfolioStatus } from '../src/lib/portfolioValidation.js';

// Portfolio records aren't public yet (no reader page until phase 2), and the
// list/create surface is admin tooling only — same auth-on-everything shape
// as bookings.ts.
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

async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;
  const portfolios = await listPortfolios();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ portfolios });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

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

  const record = await createPortfolio(slug, status, result.data);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(record);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
