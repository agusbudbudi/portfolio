import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireSession } from '../../_lib/auth.js';
import { readPortfolioByOwnerId } from '../../_lib/portfolioStore.js';

// Lets a mentor (or any logged-in account) check whether a mentee — identified
// by their booking's menteeUserId — has a CV and/or a public portfolio page to
// view. CV is returned regardless of publish status (it's just an uploaded
// file, not gated content); the portfolio slug/link is only returned once
// published, matching /api/portfolios/:slug's own visibility rule for non-owners.
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  const session = await requireSession(sessionSecret, req.headers.authorization);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const { userId } = req.query;
  if (typeof userId !== 'string') return res.status(400).json({ error: 'missing_user_id' });

  const portfolio = await readPortfolioByOwnerId(userId);
  if (!portfolio) return res.status(404).json({ error: 'not_found' });

  res.setHeader('Cache-Control', 'private, max-age=0, s-maxage=60');
  return res.status(200).json({
    slug: portfolio.status === 'published' ? portfolio.slug : null,
    cvUrl: portfolio.data.profile.cvUrl ?? null,
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  res.setHeader('Allow', 'GET');
  return res.status(405).json({ error: 'method_not_allowed' });
}
