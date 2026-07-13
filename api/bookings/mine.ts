import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveSession } from '../_lib/auth.js';
import { readBookingRules, readTopics } from '../_lib/configStore.js';
import { listMentors } from '../_lib/mentorStore.js';
import {
  createBooking, isBookingIdTaken, isSlotTaken, readBookingsByMenteeUserId,
} from '../_lib/bookingStore.js';
import { validateBookingData } from '../../src/lib/configValidation.js';
import { getDayName, parseDateId } from '../../src/lib/dates.js';

// Self-serve counterpart to api/bookings.ts (admin list/create) — this is
// "my own bookings," scoped to whoever is currently logged in. Unlike admin
// (which books freely, bypassing the public booking window), self-serve
// creation must respect the same daysInAdvanceMin/Max + availableDays rules
// the public booking page enforces client-side.
async function handleGet(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const bookings = await readBookingsByMenteeUserId(session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ bookings });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const id = typeof body.id === 'string' ? body.id : '';
  if (!id.trim()) {
    return res.status(400).json({ error: 'invalid_id', errors: ['id: wajib string non-kosong.'] });
  }
  if (await isBookingIdTaken(id)) {
    return res.status(409).json({ error: 'id_taken', errors: [`id "${id}" sudah dipakai.`] });
  }

  // Self-serve only ever books a verified, publicly-listed mentor.
  const [mentors, { topics }, bookingRulesDoc] = await Promise.all([
    listMentors({ verifiedOnly: true }),
    readTopics(),
    readBookingRules(),
  ]);
  const validMentorIds = new Set(mentors.map((m) => m.id));
  const validTopicIds = new Set(topics.map((t) => t.id));

  const result = validateBookingData(body, validMentorIds, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_booking', errors: result.errors });
  }

  const { availableDays, bookingRules } = bookingRulesDoc;
  const date = parseDateId(result.booking.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysFromToday = Math.round((date.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

  if (daysFromToday < bookingRules.daysInAdvanceMin || daysFromToday > bookingRules.daysInAdvanceMax) {
    return res.status(400).json({
      error: 'date_out_of_range',
      errors: [`date: harus antara ${bookingRules.daysInAdvanceMin}-${bookingRules.daysInAdvanceMax} hari dari sekarang.`],
    });
  }
  if (!availableDays.includes(getDayName(date))) {
    return res.status(400).json({ error: 'day_not_available', errors: ['date: hari ini tidak tersedia untuk booking.'] });
  }

  if (await isSlotTaken(result.booking.mentorId, result.booking.date, result.booking.time)) {
    return res.status(409).json({ error: 'slot_taken', errors: ['Slot ini sudah dipakai booking lain.'] });
  }

  const booking = await createBooking(id, result.booking, session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(booking);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
