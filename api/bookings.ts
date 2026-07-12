import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from './_lib/auth.js';
import {
  readBookings, readMentors, readTopics, writeBookings,
} from './_lib/configStore.js';
import { validateBookings } from '../src/lib/configValidation.js';

// Unlike topics/mentors/booking-rules, booking records contain mentee PII
// (name, email, WhatsApp) — both GET and PUT require an admin session.
async function requireAuth(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
    return false;
  }
  if (!(await requireAdminSession(sessionSecret, req.headers.authorization))) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;
  const doc = await readBookings();
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(doc);
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  if (!(await requireAuth(req, res))) return;

  // Cross-resource check: mentorId/topics must reference real records.
  const [{ mentors }, { topics }] = await Promise.all([readMentors(), readTopics()]);
  const validMentorIds = new Set(mentors.map((m) => m.id));
  const validTopicIds = new Set(topics.map((t) => t.id));

  const result = validateBookings(req.body, validMentorIds, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_bookings', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded, applied
  // atomically as part of the write itself (see writeBookings). The DB's
  // partial unique index also rejects two occupying bookings for the same
  // mentor/date/time landing in this write, surfacing as a 500 — that's a
  // validateBookings bug, not a normal client-facing conflict.
  const clientVersion = req.headers['x-bookings-updated-at'];
  const write = await writeBookings({ bookings: result.bookings }, typeof clientVersion === 'string' ? clientVersion : undefined);
  if (!write.ok) {
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.doc);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'PUT') return handlePut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}
