import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readOccupiedTimes } from '../_lib/bookingStore.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Public, no auth — mirrors api/portfolios/check-slug.ts. Only exposes which
// time slots are already occupied for a mentor/date, no mentee PII, so the
// self-serve booking form can gray out taken times before submit.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const { mentorId, date } = req.query;
  if (typeof mentorId !== 'string' || !mentorId.trim()) {
    return res.status(400).json({ error: 'invalid_mentor_id' });
  }
  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return res.status(400).json({ error: 'invalid_date' });
  }

  const occupiedTimes = await readOccupiedTimes(mentorId, date);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ occupiedTimes });
}
