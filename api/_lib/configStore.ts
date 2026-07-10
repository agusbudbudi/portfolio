// Read/write the mentoring config resources in Vercel Blob — topics, mentors,
// and booking-rules are stored as independent documents (independent blobs) so
// editing one doesn't lock or version-conflict with the others.
// The project's Blob store is private, so reads/writes go through get()/put()
// with the read-write token rather than fetching each blob's public URL.
// Stable pathnames (no random suffix) so writes overwrite in place.
import { get, put } from '@vercel/blob';
import type {
  BookingRulesDocument, MentoringConfig, MentorsDocument, TopicsDocument,
} from '../../src/types/mentoring';
// Bundled into the function at build time — the pre-seed fallback and the
// permanent degradation path if Blob is unavailable. Imported (not fetched over
// HTTP) because the SPA rewrite swallows /config/*.json under `vercel dev`.
import staticConfig from '../../public/config/qa-mentoring-config.json' with { type: 'json' };

const LEGACY_PATHNAME = 'mentoring/config.json';
const TOPICS_PATHNAME = 'mentoring/topics.json';
const MENTORS_PATHNAME = 'mentoring/mentors.json';
const BOOKING_RULES_PATHNAME = 'mentoring/booking-rules.json';

const staticSeed = staticConfig as unknown as MentoringConfig;

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  try {
    const result = await get(pathname, { access: 'private' });
    if (!result || result.statusCode !== 200) return null;
    return (await new Response(result.stream).json()) as T;
  } catch {
    return null; // not seeded yet, or network failure
  }
}

async function writeBlobJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
  });
}

// Pre-split, single-document blob from before the topics/mentors/booking-rules
// split. Each resource below falls back to slicing this if its own blob hasn't
// been written yet — so existing saved config survives the migration without
// a manual migration step. Once a resource is saved via its own endpoint it
// never reads this again.
let legacyBlobPromise: Promise<MentoringConfig | null> | null = null;
function readLegacyBlob(): Promise<MentoringConfig | null> {
  if (!legacyBlobPromise) legacyBlobPromise = readBlobJson<MentoringConfig>(LEGACY_PATHNAME);
  return legacyBlobPromise;
}

export async function readTopics(): Promise<TopicsDocument> {
  const own = await readBlobJson<TopicsDocument>(TOPICS_PATHNAME);
  if (own) return own;
  const legacy = await readLegacyBlob();
  if (legacy) return { topics: legacy.topics, updatedAt: legacy.metadata.updatedAt };
  return { topics: staticSeed.topics };
}

export async function writeTopics(doc: TopicsDocument): Promise<void> {
  await writeBlobJson(TOPICS_PATHNAME, doc);
}

export async function readMentors(): Promise<MentorsDocument> {
  const own = await readBlobJson<MentorsDocument>(MENTORS_PATHNAME);
  if (own) return own;
  const legacy = await readLegacyBlob();
  if (legacy) return { mentors: legacy.mentors, updatedAt: legacy.metadata.updatedAt };
  return { mentors: staticSeed.mentors };
}

export async function writeMentors(doc: MentorsDocument): Promise<void> {
  await writeBlobJson(MENTORS_PATHNAME, doc);
}

export async function readBookingRules(): Promise<BookingRulesDocument> {
  const own = await readBlobJson<BookingRulesDocument>(BOOKING_RULES_PATHNAME);
  if (own) return own;
  const legacy = await readLegacyBlob();
  if (legacy) {
    return {
      metadata: legacy.metadata,
      availableDays: legacy.availableDays,
      bookingRules: legacy.bookingRules,
      updatedAt: legacy.metadata.updatedAt,
    };
  }
  return {
    metadata: staticSeed.metadata,
    availableDays: staticSeed.availableDays,
    bookingRules: staticSeed.bookingRules,
  };
}

export async function writeBookingRules(doc: BookingRulesDocument): Promise<void> {
  await writeBlobJson(BOOKING_RULES_PATHNAME, doc);
}
