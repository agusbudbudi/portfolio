// Public aggregate read of the mentoring config — merges the three
// independently-stored resources (topics, mentors, booking-rules) into the
// full MentoringConfig shape the public site (useConfig) expects.
// Read-only: writes go through /api/topics, /api/mentors, /api/booking-rules.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readBookingRules, readMentors, readTopics } from './_lib/configStore';
import type { MentoringConfig } from '../src/types/mentoring';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const [topicsDoc, mentorsDoc, rulesDoc] = await Promise.all([
    readTopics(),
    readMentors(),
    readBookingRules(),
  ]);

  const config: MentoringConfig = {
    metadata: rulesDoc.metadata,
    topics: topicsDoc.topics,
    mentors: mentorsDoc.mentors,
    availableDays: rulesDoc.availableDays,
    bookingRules: rulesDoc.bookingRules,
  };

  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(config);
}
