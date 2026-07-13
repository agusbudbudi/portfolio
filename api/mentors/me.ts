import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import { readMentorByUserId } from '../_lib/mentorStore.js';

// Lets a logged-in user check their own mentor application/profile
// regardless of status — the public list only ever shows `verified`
// mentors, so this is the only way a pending/rejected applicant can see
// their own record.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveSession(req, res);
  if (!session) return;

  const mentor = await readMentorByUserId(session.userId);
  if (!mentor) return res.status(404).json({ error: 'not_found' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(mentor);
}
