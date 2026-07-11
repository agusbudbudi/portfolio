import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bearerToken, verifyToken } from './_lib/auth.js';
import { readBookingRules, writeBookingRules } from './_lib/configStore.js';
import { validateBookingRules } from '../src/lib/configValidation.js';

async function handleGet(_req: VercelRequest, res: VercelResponse) {
  const doc = await readBookingRules();
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(doc);
}

async function handlePut(req: VercelRequest, res: VercelResponse) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }

  if (!(await verifyToken(sessionSecret, bearerToken(req.headers.authorization)))) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const result = validateBookingRules(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_booking_rules', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded, applied
  // atomically as part of the write itself (see writeBookingRules).
  const clientVersion = req.headers['x-booking-rules-updated-at'];
  const write = await writeBookingRules(
    { metadata: result.metadata, availableDays: result.availableDays, bookingRules: result.bookingRules },
    typeof clientVersion === 'string' ? clientVersion : undefined
  );
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
