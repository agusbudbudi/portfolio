import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isResourceOwner, resolveSession } from '../_lib/auth.js';
import { readTopics } from '../_lib/configStore.js';
import { listMentors, readMentorByUserId } from '../_lib/mentorStore.js';
import { isSlotTaken, readBookingById, updateBooking, type BookingData } from '../_lib/bookingStore.js';
import { ALLOWED_BOOKING_TRANSITIONS, validateBookingData } from '../../src/lib/configValidation.js';

function getIdParam(req: VercelRequest): string | null {
  const { id } = req.query;
  return typeof id === 'string' ? id : null;
}

const sortedTopics = (topics: string[]) => [...topics].sort().join(',');

// Everything except `status` must match — the field-lock for the
// assigned-mentor / owning-mentee paths (admin bypasses this entirely, see
// handlePut).
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

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const id = getIdParam(req);
  if (!id) return res.status(400).json({ error: 'missing_id' });

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
  if (req.method === 'PUT') return handlePut(req, res);
  res.setHeader('Allow', 'PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}
