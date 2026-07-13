import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminSession } from './_lib/auth.js';
import { readTopics } from './_lib/configStore.js';
import { listMentors } from './_lib/mentorStore.js';
import { createBooking, isBookingIdTaken, isSlotTaken, listBookings } from './_lib/bookingStore.js';
import { validateBookingData } from '../src/lib/configValidation.js';

// Unlike topics/mentors/booking-rules, booking records contain mentee PII
// (name, email, WhatsApp) — both GET and POST require an admin session.
async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;
  const bookings = await listBookings();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ bookings });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id.trim()) {
    return res.status(400).json({ error: 'invalid_id', errors: ['id: wajib string non-kosong.'] });
  }
  if (await isBookingIdTaken(id)) {
    return res.status(409).json({ error: 'id_taken', errors: [`id "${id}" sudah dipakai.`] });
  }

  // Cross-resource check: mentorId/topics must reference real records.
  const [mentors, { topics }] = await Promise.all([listMentors(), readTopics()]);
  const validMentorIds = new Set(mentors.map((m) => m.id));
  const validTopicIds = new Set(topics.map((t) => t.id));

  const result = validateBookingData(body, validMentorIds, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_booking', errors: result.errors });
  }

  if (await isSlotTaken(result.booking.mentorId, result.booking.date, result.booking.time)) {
    return res.status(409).json({ error: 'slot_taken', errors: ['Slot ini sudah dipakai booking lain.'] });
  }

  const booking = await createBooking(id, result.booking, null);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(booking);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
