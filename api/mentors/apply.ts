import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireSession } from '../_lib/auth.js';
import { readTopics } from '../_lib/configStore.js';
import { createMentor, isMentorIdTaken, readMentorByUserId } from '../_lib/mentorStore.js';
import { isValidMentorId, validateMentorData } from '../../src/lib/configValidation.js';

// Mentor onboarding is self-serve: any logged-in account (already at least
// a mentee) can apply. The application lands as `pending` for admin review
// — see api/mentors/[id]/review.ts.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  const session = await requireSession(sessionSecret, req.headers.authorization);
  if (!session) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const existing = await readMentorByUserId(session.userId);
  if (existing) {
    return res.status(409).json({
      error: 'already_applied',
      message: 'Kamu sudah punya profil mentor. Edit yang sudah ada, bukan apply lagi.',
      mentorId: existing.id,
    });
  }

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const id = typeof body.id === 'string' ? body.id : '';

  if (!isValidMentorId(id)) {
    return res.status(400).json({ error: 'invalid_id', errors: ['id: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (await isMentorIdTaken(id)) {
    return res.status(409).json({ error: 'id_taken', errors: [`id "${id}" sudah dipakai mentor lain.`] });
  }

  const { topics } = await readTopics();
  const validTopicIds = new Set(topics.map((t) => t.id));
  const result = validateMentorData(body, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_mentor', errors: result.errors });
  }

  const mentor = await createMentor(id, result.mentor, { userId: session.userId, verificationStatus: 'pending' });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(mentor);
}
