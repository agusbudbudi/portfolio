import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from '../../_lib/auth.js';
import { readMentorById, reviewMentor } from '../../_lib/mentorStore.js';
import { validateReviewDecision } from '../../../src/lib/configValidation.js';

// Admin verify/reject decision — separate from the profile PUT in
// api/mentors/[id].ts, since "editing a bio" and "deciding whether this
// mentor is legit" are different actions with different auth boundaries.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  const session = await requireAdminSession(sessionSecret, req.headers.authorization);
  if (!session) return res.status(401).json({ error: 'unauthorized' });

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'missing_id' });

  const existing = await readMentorById(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const result = validateReviewDecision(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_decision', errors: result.errors });
  }

  const mentor = await reviewMentor(id, result.decision, result.rejectionReason, session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(mentor);
}
