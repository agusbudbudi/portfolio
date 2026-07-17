import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminSession, resolveSession } from '../_lib/auth.js';
import {
  readBookingRules, readSkills, readTools, readTopics, writeBookingRules, writeSkills, writeTools, writeTopics,
} from '../_lib/configStore.js';
import { listMentors } from '../_lib/mentorStore.js';
import { validateBookingRules, validateTopics } from '../../src/lib/configValidation.js';
import { validateSkills, validateTools } from '../../src/lib/portfolioValidation.js';

async function handleTopicsGet(_req: VercelRequest, res: VercelResponse) {
  const doc = await readTopics();
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(doc);
}

async function handleTopicsPut(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;

  const result = validateTopics(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_topics', errors: result.errors });
  }

  // Referential integrity across resources: block dropping a topic id that a
  // mentor's expertise still references, even though mentors live in a
  // different document now.
  const nextIds = new Set(result.topics.map((t) => t.id));
  const mentors = await listMentors();
  const stillUsed = mentors.filter((m) => m.expertise.some((id) => !nextIds.has(id)));
  if (stillUsed.length > 0) {
    return res.status(400).json({
      error: 'topic_in_use',
      errors: [`Topic dipakai sebagai expertise oleh: ${stillUsed.map((m) => m.name).join(', ')}. Hapus dari mentor dulu.`],
    });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded, applied
  // atomically as part of the write itself (see writeTopics).
  const clientVersion = req.headers['x-topics-updated-at'];
  const write = await writeTopics({ topics: result.topics }, typeof clientVersion === 'string' ? clientVersion : undefined);
  if (!write.ok) {
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.doc);
}

async function handleTopics(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleTopicsGet(req, res);
  if (req.method === 'PUT') return handleTopicsPut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleToolsGet(_req: VercelRequest, res: VercelResponse) {
  const doc = await readTools();
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(doc);
}

async function handleToolsPut(req: VercelRequest, res: VercelResponse) {
  // Any authenticated user can extend the shared tools list (needed for portfolio building).
  if (!(await resolveSession(req, res))) return;

  const result = validateTools(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_tools', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded, applied
  // atomically as part of the write itself (see writeTools).
  const clientVersion = req.headers['x-tools-updated-at'];
  const write = await writeTools({ tools: result.tools }, typeof clientVersion === 'string' ? clientVersion : undefined);
  if (!write.ok) {
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.doc);
}

async function handleTools(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleToolsGet(req, res);
  if (req.method === 'PUT') return handleToolsPut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleSkillsGet(_req: VercelRequest, res: VercelResponse) {
  const doc = await readSkills();
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(doc);
}

async function handleSkillsPut(req: VercelRequest, res: VercelResponse) {
  // Any authenticated user can extend the shared skills list (needed for portfolio building).
  if (!(await resolveSession(req, res))) return;

  const result = validateSkills(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_skills', errors: result.errors });
  }

  // Optimistic concurrency: client echoes the updatedAt it loaded, applied
  // atomically as part of the write itself (see writeSkills).
  const clientVersion = req.headers['x-skills-updated-at'];
  const write = await writeSkills({ skills: result.skills }, typeof clientVersion === 'string' ? clientVersion : undefined);
  if (!write.ok) {
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.doc);
}

async function handleSkills(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleSkillsGet(req, res);
  if (req.method === 'PUT') return handleSkillsPut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}

async function handleBookingRulesGet(_req: VercelRequest, res: VercelResponse) {
  const doc = await readBookingRules();
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(doc);
}

async function handleBookingRulesPut(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;

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

async function handleBookingRules(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') return handleBookingRulesGet(req, res);
  if (req.method === 'PUT') return handleBookingRulesPut(req, res);
  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'method_not_allowed' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { resource } = req.query;

  if (resource === 'topics') return handleTopics(req, res);
  if (resource === 'tools') return handleTools(req, res);
  if (resource === 'skills') return handleSkills(req, res);
  if (resource === 'booking-rules') return handleBookingRules(req, res);
  return res.status(404).json({ error: 'not_found' });
}
