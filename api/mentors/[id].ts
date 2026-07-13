import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireOwnerOrAdmin, resolveAdminSession, resolveSession } from '../_lib/auth.js';
import { readTopics } from '../_lib/configStore.js';
import { countMentors, deleteMentor, readMentorById, updateMentor, type StatusPatch } from '../_lib/mentorStore.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { validateMentorData } from '../../src/lib/configValidation.js';

// Shares its budget with api/mentors/apply.ts — a resubmission-after-rejection
// is the same kind of event as a fresh application.
const MENTOR_APPLICATION_RATE_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000 };

function getIdParam(req: VercelRequest): string | null {
  const { id } = req.query;
  return typeof id === 'string' ? id : null;
}

// Profile edits are admin-or-owning-mentor. Verify/reject decisions are a
// separate admin-only action — see api/mentors/[id]/review.ts.
async function handlePut(req: VercelRequest, res: VercelResponse) {
  const session = await resolveSession(req, res);
  if (!session) return;

  const id = getIdParam(req);
  if (!id) return res.status(400).json({ error: 'missing_id' });

  const existing = await readMentorById(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  if (!requireOwnerOrAdmin(res, session, existing.userId)) return;
  const isAdmin = session.roles.includes('admin');

  const body = typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
  const { topics } = await readTopics();
  const validTopicIds = new Set(topics.map((t) => t.id));
  const result = validateMentorData(body, validTopicIds);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_mentor', errors: result.errors });
  }

  // Confirmed decision: a verified mentor's own edits go live immediately,
  // no re-review — only editing while rejected is a real resubmission.
  let statusPatch: StatusPatch | undefined;
  if (!isAdmin && existing.verificationStatus === 'rejected') {
    const allowed = await checkRateLimit(
      `mentor-application:${session.userId}`,
      MENTOR_APPLICATION_RATE_LIMIT.maxAttempts,
      MENTOR_APPLICATION_RATE_LIMIT.windowMs
    );
    if (!allowed) {
      return res.status(429).json({ error: 'rate_limited', message: 'Terlalu banyak pengajuan ulang. Coba lagi nanti.' });
    }
    statusPatch = { verificationStatus: 'pending', rejectionReason: null, submittedAt: new Date().toISOString() };
  }

  // mentorStore always populates updatedAt from the DB row — MentorConfig
  // types it as optional only because the admin form's local state reuses
  // the same type before a mentor has ever been saved.
  const clientVersion = req.headers['x-mentor-updated-at'];
  const expectedUpdatedAt = typeof clientVersion === 'string' ? clientVersion : (existing.updatedAt as string);

  const write = await updateMentor(id, result.mentor, expectedUpdatedAt, statusPatch);
  if (!write.ok) {
    if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
    return res.status(409).json({ error: 'conflict', current: write.current });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(write.mentor);
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;
  const id = getIdParam(req);
  if (!id) return res.status(400).json({ error: 'missing_id' });

  const existing = await readMentorById(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  if ((await countMentors()) <= 1) {
    return res.status(400).json({ error: 'last_mentor', message: 'Minimal harus ada satu mentor.' });
  }

  await deleteMentor(id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') return handlePut(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'method_not_allowed' });
}
