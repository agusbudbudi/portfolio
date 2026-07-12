import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isSlugTaken } from '../_lib/portfolioStore.js';
import { isValidSlug } from '../../src/lib/portfolioValidation.js';

// Public, no auth — the admin form live-checks slug availability as the
// mentee name is typed. Response is intentionally minimal (just a boolean)
// so it can't be used to enumerate portfolio data.
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
