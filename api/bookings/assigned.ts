import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import { readMentorByUserId } from '../_lib/mentorStore.js';
import { readBookingsByMentorId } from '../_lib/bookingStore.js';

// Mentor-side counterpart to api/bookings/mine.ts (mentee-side) — bookings
// assigned to whoever is currently logged in, resolved via their own mentor
// record. No mentor record (plain mentee, or pending/rejected applicant with
// no live bookings anyway) is a normal empty state, not an error.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveSession(req, res);
  if (!session) return;

  const mentor = await readMentorByUserId(session.userId);
  if (!mentor) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ bookings: [] });
  }

  const bookings = await readBookingsByMentorId(mentor.id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ bookings });
}
