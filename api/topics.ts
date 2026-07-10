import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bearerToken, verifyToken } from './_lib/auth';
import { readMentors, readTopics, writeTopics } from './_lib/configStore';
import { validateTopics } from '../src/lib/configValidation';

async function handleGet(_req: VercelRequest, res: VercelResponse) {
  const doc = await readTopics();
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

  const result = validateTopics(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_topics', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded.
  const current = await readTopics();
  if (current.updatedAt) {
    const clientVersion = req.headers['x-topics-updated-at'];
    if (clientVersion !== current.updatedAt) {
      return res.status(409).json({ error: 'conflict', current });
    }
  }

  // Referential integrity across resources: block dropping a topic id that a
  // mentor's expertise still references, even though mentors live in a
  // different document now.
  const nextIds = new Set(result.topics.map((t) => t.id));
  const { mentors } = await readMentors();
  const stillUsed = mentors.filter((m) => m.expertise.some((id) => !nextIds.has(id)));
  if (stillUsed.length > 0) {
    return res.status(400).json({
      error: 'topic_in_use',
      errors: [`Topic dipakai sebagai expertise oleh: ${stillUsed.map((m) => m.name).join(', ')}. Hapus dari mentor dulu.`],
    });
  }

  const doc = { topics: result.topics, updatedAt: new Date().toISOString() };
  await writeTopics(doc);

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(doc);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'PUT') return handlePut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}
