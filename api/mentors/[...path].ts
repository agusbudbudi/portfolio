import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireOwnerOrAdmin, resolveAdminSession, resolveSession } from '../_lib/auth.js';
import { readTopics } from '../_lib/configStore.js';
import {
  countMentors, createMentor, deleteMentor, isMentorIdTaken, readMentorById, readMentorByUserId,
  reviewMentor, updateMentor, type StatusPatch,
} from '../_lib/mentorStore.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { isValidMentorId, validateMentorData, validateReviewDecision } from '../../src/lib/configValidation.js';

// Shared by the apply and resubmission-after-rejection paths — a
// resubmission is the same kind of event as a fresh application.
const MENTOR_APPLICATION_RATE_LIMIT = { maxAttempts: 5, windowMs: 60 * 60 * 1000 };

// Mentor onboarding is self-serve: any logged-in account (already at least
// a mentee) can apply. The application lands as `pending` for admin review
// — see handleReview below.
async function handleApply(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveSession(req, res);
  if (!session) return;

  const allowed = await checkRateLimit(
    `mentor-application:${session.userId}`,
    MENTOR_APPLICATION_RATE_LIMIT.maxAttempts,
    MENTOR_APPLICATION_RATE_LIMIT.windowMs
  );
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Terlalu banyak pengajuan. Coba lagi nanti.' });
  }

  const existing = await readMentorByUserId(session.userId);
  if (existing) {
    return res.status(409).json({
      error: 'already_applied',
      message: 'Kamu sudah punya profil mentor. Edit yang sudah ada, bukan apply lagi.',
      mentorId: existing.id,
    });
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

  const mentor = await createMentor(id, result.mentor, { userId: session.userId, verificationStatus: 'pending' });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(201).json(mentor);
}

// Lets a logged-in user check their own mentor application/profile
// regardless of status — the public list only ever shows `verified`
// mentors, so this is the only way a pending/rejected applicant can see
// their own record.
async function handleMe(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveSession(req, res);
  if (!session) return;

  const mentor = await readMentorByUserId(session.userId);
  if (!mentor) return res.status(404).json({ error: 'not_found' });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(mentor);
}

// Admin verify/reject decision — separate from the profile PUT below, since
// "editing a bio" and "deciding whether this mentor is legit" are different
// actions with different auth boundaries.
async function handleReview(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await resolveAdminSession(req, res);
  if (!session) return;

  const existing = await readMentorById(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  const result = validateReviewDecision(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: 'invalid_decision', errors: result.errors });
  }

  const mentor = await reviewMentor(id, result.decision, result.rejectionReason, session.userId);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(mentor);
}

// Profile edits are admin-or-owning-mentor. Verify/reject decisions are a
// separate admin-only action — see handleReview above.
async function handleByIdPut(req: VercelRequest, res: VercelResponse, id: string) {
  const session = await resolveSession(req, res);
  if (!session) return;

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

async function handleByIdDelete(req: VercelRequest, res: VercelResponse, id: string) {
  if (!(await resolveAdminSession(req, res))) return;

  const existing = await readMentorById(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  if ((await countMentors()) <= 1) {
    return res.status(400).json({ error: 'last_mentor', message: 'Minimal harus ada satu mentor.' });
  }

  await deleteMentor(id);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(204).end();
}

async function handleById(req: VercelRequest, res: VercelResponse, id: string) {
  if (req.method === 'PUT') return handleByIdPut(req, res, id);
  if (req.method === 'DELETE') return handleByIdDelete(req, res, id);
  res.setHeader('Allow', 'PUT, DELETE');
  return res.status(405).json({ error: 'method_not_allowed' });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first, second] = path;

  // Two-segment /:id/review must win before the single-segment reserved
  // words below — otherwise a mentor whose own id happens to be literally
  // "apply" or "me" would have their review action swallowed by handleApply
  // / handleMe instead of reaching handleReview.
  if (first && second === 'review') return handleReview(req, res, first);
  if (first === 'apply') return handleApply(req, res);
  if (first === 'me') return handleMe(req, res);
  if (first) return handleById(req, res, first);
  return res.status(404).json({ error: 'not_found' });
}
