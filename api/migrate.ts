// ONE-TIME migration: copies mentoring data from Vercel Blob into Turso.
// Deploy, POST it once with the admin bearer token, confirm the returned
// counts against the source data, then delete this file (and, once
// confident, the @vercel/blob dependency + BLOB_READ_WRITE_TOKEN env var).
//
// Reads directly from Blob (own-resource pathname, falling back to the
// pre-split legacy single document) rather than through configStore.ts,
// since configStore.ts now points at Turso — this file is the one place
// both storage backends are still touched at once.
import { get } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BookingConfig, MentoringConfig } from '../src/types/mentoring';
import { bearerToken, verifyToken } from './_lib/auth.js';
import { getClient, migrate as migrateSchema } from './_lib/turso.js';
import staticConfig from '../public/config/qa-mentoring-config.json' with { type: 'json' };

const staticSeed = staticConfig as unknown as MentoringConfig;

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  try {
    const result = await get(pathname, { access: 'private' });
    if (!result || result.statusCode !== 200) return null;
    return (await new Response(result.stream).json()) as T;
  } catch {
    return null;
  }
}

let legacyPromise: Promise<MentoringConfig | null> | null = null;
function readLegacyBlob(): Promise<MentoringConfig | null> {
  if (!legacyPromise) legacyPromise = readBlobJson<MentoringConfig>('mentoring/config.json');
  return legacyPromise;
}

async function sourceTopics(): Promise<MentoringConfig['topics']> {
  const own = await readBlobJson<{ topics: MentoringConfig['topics'] }>('mentoring/topics.json');
  if (own) return own.topics;
  const legacy = await readLegacyBlob();
  return legacy ? legacy.topics : staticSeed.topics;
}

async function sourceMentors(): Promise<MentoringConfig['mentors']> {
  const own = await readBlobJson<{ mentors: MentoringConfig['mentors'] }>('mentoring/mentors.json');
  if (own) return own.mentors;
  const legacy = await readLegacyBlob();
  return legacy ? legacy.mentors : staticSeed.mentors;
}

async function sourceBookingRules(): Promise<Pick<MentoringConfig, 'metadata' | 'availableDays' | 'bookingRules'>> {
  const own = await readBlobJson<Pick<MentoringConfig, 'metadata' | 'availableDays' | 'bookingRules'>>('mentoring/booking-rules.json');
  if (own) return own;
  const legacy = await readLegacyBlob();
  if (legacy) return { metadata: legacy.metadata, availableDays: legacy.availableDays, bookingRules: legacy.bookingRules };
  return { metadata: staticSeed.metadata, availableDays: staticSeed.availableDays, bookingRules: staticSeed.bookingRules };
}

async function sourceBookings(): Promise<BookingConfig[]> {
  const own = await readBlobJson<{ bookings: BookingConfig[] }>('mentoring/bookings.json');
  return own?.bookings ?? [];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  if (!(await verifyToken(sessionSecret, bearerToken(req.headers.authorization)))) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const [topics, mentors, bookingRulesDoc, bookings] = await Promise.all([
    sourceTopics(),
    sourceMentors(),
    sourceBookingRules(),
    sourceBookings(),
  ]);

  await migrateSchema();
  const db = getClient();
  const now = new Date().toISOString();

  await db.batch(
    [
      {
        sql: `INSERT INTO config_documents (key, data, updated_at) VALUES ('topics', ?, ?)
              ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        args: [JSON.stringify(topics), now],
      },
      {
        sql: `INSERT INTO config_documents (key, data, updated_at) VALUES ('mentors', ?, ?)
              ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        args: [JSON.stringify(mentors), now],
      },
      {
        sql: `INSERT INTO config_documents (key, data, updated_at) VALUES ('booking-rules', ?, ?)
              ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
        args: [JSON.stringify(bookingRulesDoc), now],
      },
      { sql: 'DELETE FROM bookings', args: [] },
      ...bookings.map((b) => ({
        sql: `INSERT INTO bookings
                (id, mentee_name, mentee_email, mentee_whatsapp, mentor_id, date, time, notes, status, topics, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          b.id, b.menteeName, b.menteeEmail, b.menteeWhatsapp, b.mentorId, b.date, b.time,
          b.notes, b.status, JSON.stringify(b.topics), b.createdAt, b.updatedAt,
        ],
      })),
      {
        sql: `INSERT INTO bookings_meta (key, updated_at) VALUES ('bookings', ?)
              ON CONFLICT(key) DO UPDATE SET updated_at = excluded.updated_at`,
        args: [now],
      },
    ],
    'write'
  );

  return res.status(200).json({
    ok: true,
    counts: { topics: topics.length, mentors: mentors.length, bookings: bookings.length },
  });
}
