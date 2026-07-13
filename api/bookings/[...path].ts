import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isResourceOwner, resolveSession } from '../_lib/auth.js';
import { readBookingRules, readTopics } from '../_lib/configStore.js';
import { listMentors, readMentorByUserId } from '../_lib/mentorStore.js';
import {
  createBooking, isBookingIdTaken, isSlotTaken, readBookingById, readBookingsByMenteeUserId,
  readBookingsByMentorId, readOccupiedTimes, updateBooking, type BookingData,
} from '../_lib/bookingStore.js';
import { ALLOWED_BOOKING_TRANSITIONS, validateBookingData } from '../../src/lib/configValidation.js';
import { getDayName, parseDateId } from '../../src/lib/dates.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Vercel dynamic-route matching gives static segments (mine, assigned,
// availability) priority over the dynamic [id] route when they were separate
// files — reproduced here by checking the reserved names first, else
// treating path[0] as a booking id.

// Mentor-side counterpart to the "mine" handler below — bookings assigned to
// whoever is currently logged in, resolved via their own mentor record. No
// mentor record (plain mentee, or pending/rejected applicant with no live
// bookings anyway) is a normal empty state, not an error.
async function handleAssigned(req: VercelRequest, res: VercelResponse) {
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

// Public, no auth — mirrors api/portfolios' check-slug. Only exposes which
// time slots are already occupied for a mentor/date, no mentee PII, so the
// self-serve booking form can gray out taken times before submit.
async function handleAvailability(req: VercelRequest, res: VercelResponse) {
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

// Self-serve counterpart to api/bookings.ts (admin list/create) — this is
// "my own bookings," scoped to whoever is currently logged in. Unlike admin
// (which books freely, bypassing the public booking window), self-serve
// creation must respect the same daysInAdvanceMin/Max + availableDays rules
// the public booking page enforces client-side.
async function handleMineGet(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const bookings = await readBookingsByMenteeUserId(session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ bookings });
}

async function handleMinePost(req: VercelRequest, res: VercelResponse) {
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

async function handleMine(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleMineGet(req, res);
  if (req.method === 'POST') return handleMinePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}

const sortedTopics = (topics: string[]) => [...topics].sort().join(',');

// Everything except `status` must match — the field-lock for the
// assigned-mentor / owning-mentee paths (admin bypasses this entirely, see
// handleById).
function isStatusOnlyChange(next: BookingData, existing: BookingData): boolean {
  return next.menteeName === existing.menteeName
    && next.menteeEmail === existing.menteeEmail
    && next.menteeWhatsapp === existing.menteeWhatsapp
    && next.mentorId === existing.mentorId
    && next.date === existing.date
    && next.time === existing.time
    && next.notes === existing.notes
    && sortedTopics(next.topics) === sortedTopics(existing.topics);
}

async function handleById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveSession(req, res);
  if (!session) return;

  const existing = await readBookingById(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const isAdmin = session.roles.includes('admin');
  const ownMentor = isAdmin ? null : await readMentorByUserId(session.userId);
  const isAssignedMentor = Boolean(ownMentor && ownMentor.id === existing.mentorId);
  const isOwningMentee = !isAdmin && !isAssignedMentor && isResourceOwner(session, existing.menteeUserId);
  if (!isAdmin && !isAssignedMentor && !isOwningMentee) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};

  const [mentors, { topics }] = await Promise.all([listMentors(), readTopics()]);
  const validMentorIds = new Set(mentors.map((m) => m.id));
  const validTopicIds = new Set(topics.map((t) => t.id));

  const result = validateBookingData(body, validMentorIds, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_booking', errors: result.errors });
  }

  // Assigned mentor (not admin): status-only, any legal transition.
  if (isAssignedMentor) {
    if (!isStatusOnlyChange(result.booking, existing)) {
      return res.status(400).json({ error: 'field_locked', errors: ['Mentor hanya bisa mengubah status booking.'] });
    }
    if (!ALLOWED_BOOKING_TRANSITIONS[existing.status].includes(result.booking.status)) {
      return res.status(400).json({
        error: 'invalid_transition',
        errors: [`Booking dengan status "${existing.status}" tidak bisa diubah ke "${result.booking.status}".`],
      });
    }
  }

  // Owning mentee (not admin, not the assigned mentor): status-only, and the
  // only status they may set is "canceled" — confirm/complete are mentor-only
  // actions (assessment §3.3: "a mentee can create/cancel their own booking").
  if (isOwningMentee) {
    if (!isStatusOnlyChange(result.booking, existing)) {
      return res.status(400).json({ error: 'field_locked', errors: ['Kamu hanya bisa membatalkan booking ini.'] });
    }
    if (result.booking.status !== 'canceled' || !ALLOWED_BOOKING_TRANSITIONS[existing.status].includes('canceled')) {
      return res.status(400).json({
        error: 'invalid_transition',
        errors: [`Booking dengan status "${existing.status}" tidak bisa dibatalkan.`],
      });
    }
  }

  const slotChanged = result.booking.mentorId !== existing.mentorId
    || result.booking.date !== existing.date
    || result.booking.time !== existing.time;
  if (slotChanged && (await isSlotTaken(result.booking.mentorId, result.booking.date, result.booking.time, id))) {
    return res.status(409).json({ error: 'slot_taken', errors: ['Slot ini sudah dipakai booking lain.'] });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded.
  const clientVersion = req.headers['x-booking-updated-at'];
  const expectedUpdatedAt = typeof clientVersion === 'string' ? clientVersion : existing.updatedAt;

  const write = await updateBooking(id, result.booking, expectedUpdatedAt);
  if (!write.ok) {
    if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.booking);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first] = path;

  if (first === 'mine') return handleMine(req, res);
  if (first === 'assigned') return handleAssigned(req, res);
  if (first === 'availability') return handleAvailability(req, res);
  if (first) return handleById(req, res, first);
  return res.status(404).json({ error: 'not_found' });
}
