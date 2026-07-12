import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from './_lib/auth.js';
import { readTopics } from './_lib/configStore.js';
import { createMentor, isMentorIdTaken, listMentors } from './_lib/mentorStore.js';
import { isValidMentorId, validateMentorData } from '../src/lib/configValidation.js';

async function handleGet(_req: VercelRequest, res: VercelResponse) {
  const mentors = await listMentors();
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json({ mentors });
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'server_not_configured', message: 'SESSION_SECRET env var is not set.' });
  }
  if (!(await requireAdminSession(sessionSecret, req.headers.authorization))) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const id = typeof body.id === 'string' ? body.id : '';

  if (!isValidMentorId(id)) {
    return res.status(400).json({ error: 'invalid_id', errors: ['id: harus slug lowercase (a-z, 0-9, tanda hubung).'] });
  }
  if (await isMentorIdTaken(id)) {
    return res.status(409).json({ error: 'id_taken', errors: [`id "${id}" sudah dipakai mentor lain.`] });
  }

  const { topics } = await readTopics();
  const validTopicIds = new Set(topics.map((t) => t.id));
  const result = validateMentorData(body, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_mentor', errors: result.errors });
  }

  const mentor = await createMentor(id, result.mentor);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(mentor);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
