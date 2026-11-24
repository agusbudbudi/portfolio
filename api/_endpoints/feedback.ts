import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminSession, resolveSession } from '../_lib/auth.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import {
  contextResponses, createFlow, createQuestion, deleteFlow, deleteQuestion, flowUsage, listFlows, listQuestions,
  questionAnswerCount, readFlow, readQuestion, readQuestionBank, resolvePublicFlows, updateFlow, updateQuestion,
  upsertResponse,
} from '../_lib/feedbackStore.js';
import { readQaCourseBySlug } from '../_lib/qaCourseStore.js';
import {
  CONSENT_QUESTION_ID, consentGiven, firstRating, lockedQuestionChange, validateFeedbackAnswers, validateFeedbackFlow,
  validateFeedbackQuestion,
} from '../../src/lib/feedbackValidation.js';
import { courseFlowIds } from '../../src/lib/qaCourseValidation.js';
import { FEEDBACK_LIMITS, type FeedbackFlowData } from '../../src/types/feedback.js';

/** Client-reported fill time; out-of-range or junk is dropped, not rejected. */
function cleanDuration(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= FEEDBACK_LIMITS.maxDurationMs ? Math.round(v) : null;
}

// Routes:
//   GET    /api/feedback/questions                 admin: { questions: FeedbackQuestionSummary[] }
//   POST   /api/feedback/questions                 admin: create (any type except consent)
//   PUT    /api/feedback/questions/:id             admin: replace, CAS via x-feedback-updated-at
//   DELETE /api/feedback/questions/:id             admin: only when unanswered and unused (else archive)
//   POST   /api/feedback/questions/:id/duplicate   admin: copy as a new question
//   GET    /api/feedback/flows                     admin: { flows: FeedbackFlowSummary[] }
//   POST   /api/feedback/flows                     admin: create
//   PUT    /api/feedback/flows/:id                 admin: replace, CAS via x-feedback-updated-at
//   DELETE /api/feedback/flows/:id                 admin: 409 while a course checkpoint uses it
//   POST   /api/feedback/responses                 user: submit or skip one course checkpoint
//   GET    /api/feedback/results?course=<slug>     admin: { flows, responses } for the course

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const UPDATED_AT_HEADER = 'x-feedback-updated-at';

function readBody(req: VercelRequest): Record<string, unknown> {
  return typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};
}

function methodNotAllowed(res: VercelResponse, allow: string) {
  res.setHeader('Allow', allow);
  return res.status(405).json({ error: 'method_not_allowed' });
}

function expectedVersion(req: VercelRequest, fallback: string): string {
  const header = req.headers[UPDATED_AT_HEADER];
  return typeof header === 'string' ? header : fallback;
}

// ---------- questions ----------

async function handleQuestions(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ questions: await listQuestions() });
  if (req.method === 'POST') {
    const result = validateFeedbackQuestion(readBody(req));
    if (!result.ok) return res.status(400).json({ error: 'invalid_question', errors: result.errors });
    if (result.question.type === 'consent') {
      return res.status(400).json({ error: 'invalid_question', errors: ['Consent adalah pertanyaan sistem, tidak bisa dibuat lagi.'] });
    }
    return res.status(201).json(await createQuestion(result.question));
  }
  return methodNotAllowed(res, 'GET, POST');
}

async function handleQuestion(req: VercelRequest, res: VercelResponse, id: string, action?: string) {
  if (!(await resolveAdminSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  const existing = await readQuestion(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  if (action === 'duplicate') {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
    if (existing.isSystem) return res.status(400).json({ error: 'system_question', errors: ['Pertanyaan sistem tidak bisa diduplikat.'] });
    const copy = await createQuestion({
      type: existing.type,
      prompt: `${existing.prompt} (salinan)`.slice(0, 300),
      ...(existing.helpText ? { helpText: existing.helpText } : {}),
      config: existing.config,
      status: 'active',
    });
    return res.status(201).json(copy);
  }
  if (action) return res.status(404).json({ error: 'not_found' });

  if (req.method === 'PUT') {
    const result = validateFeedbackQuestion(readBody(req));
    if (!result.ok) return res.status(400).json({ error: 'invalid_question', errors: result.errors });
    const next = result.question;
    if (existing.isSystem) {
      if (next.type !== 'consent' || next.status !== 'active') {
        return res.status(400).json({ error: 'system_question', errors: ['Pertanyaan sistem hanya bisa diubah teksnya.'] });
      }
    } else if (next.type === 'consent') {
      return res.status(400).json({ error: 'invalid_question', errors: ['Tipe consent hanya untuk pertanyaan sistem.'] });
    }
    if ((await questionAnswerCount(id)) > 0) {
      const locked = lockedQuestionChange(existing, next);
      if (locked) return res.status(400).json({ error: 'question_locked', errors: [locked] });
    }
    const write = await updateQuestion(id, next, expectedVersion(req, existing.updatedAt));
    if (!write.ok) {
      if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
      return res.status(409).json({ error: 'conflict', current: write.current });
    }
    return res.status(200).json(write.value);
  }

  if (req.method === 'DELETE') {
    if (existing.isSystem) return res.status(400).json({ error: 'system_question', errors: ['Pertanyaan sistem tidak bisa dihapus.'] });
    if ((await questionAnswerCount(id)) > 0) {
      return res.status(409).json({ error: 'has_answers', message: 'Pertanyaan ini sudah punya jawaban. Arsipkan saja.' });
    }
    const flows = await listFlows();
    const users = flows.filter((f) => f.items.some((i) => i.questionId === id));
    if (users.length > 0) {
      return res.status(409).json({ error: 'in_use', message: `Masih dipakai di flow: ${users.map((f) => f.name).join(', ')}.` });
    }
    await deleteQuestion(id);
    return res.status(204).end();
  }
  return methodNotAllowed(res, 'PUT, DELETE');
}

// ---------- flows ----------

/** Every question exists; questions newly added to a flow must not be archived. */
async function flowQuestionErrors(flow: FeedbackFlowData, previousIds: string[] = []): Promise<string[]> {
  const bank = await readQuestionBank();
  const errors: string[] = [];
  flow.items.forEach((item, i) => {
    const q = bank[item.questionId];
    if (!q) errors.push(`Pertanyaan ${i + 1}: sudah tidak ada di bank.`);
    else if (q.status === 'archived' && !previousIds.includes(q.id)) errors.push(`Pertanyaan ${i + 1}: sudah diarsipkan.`);
  });
  return errors;
}

async function handleFlows(req: VercelRequest, res: VercelResponse) {
  if (!(await resolveAdminSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json({ flows: await listFlows() });
  if (req.method === 'POST') {
    const result = validateFeedbackFlow(readBody(req));
    if (!result.ok) return res.status(400).json({ error: 'invalid_flow', errors: result.errors });
    const errors = await flowQuestionErrors(result.flow);
    if (errors.length > 0) return res.status(400).json({ error: 'invalid_flow', errors });
    return res.status(201).json(await createFlow(result.flow));
  }
  return methodNotAllowed(res, 'GET, POST');
}

async function handleFlow(req: VercelRequest, res: VercelResponse, id: string) {
  if (!(await resolveAdminSession(req, res))) return;
  res.setHeader('Cache-Control', 'no-store');
  const existing = await readFlow(id);
  if (!existing) return res.status(404).json({ error: 'not_found' });

  if (req.method === 'PUT') {
    const result = validateFeedbackFlow(readBody(req));
    if (!result.ok) return res.status(400).json({ error: 'invalid_flow', errors: result.errors });
    const errors = await flowQuestionErrors(result.flow, existing.items.map((i) => i.questionId));
    if (errors.length > 0) return res.status(400).json({ error: 'invalid_flow', errors });
    const write = await updateFlow(id, result.flow, expectedVersion(req, existing.updatedAt));
    if (!write.ok) {
      if (write.reason === 'not_found') return res.status(404).json({ error: 'not_found' });
      return res.status(409).json({ error: 'conflict', current: write.current });
    }
    return res.status(200).json(write.value);
  }
  if (req.method === 'DELETE') {
    const used = await flowUsage(id);
    if (used.length > 0) {
      const courses = [...new Set(used.map((u) => u.courseTitle))].join(', ');
      return res.status(409).json({ error: 'in_use', message: `Flow masih dipakai checkpoint di course: ${courses}.` });
    }
    await deleteFlow(id);
    return res.status(204).end();
  }
  return methodNotAllowed(res, 'PUT, DELETE');
}

// ---------- learner responses ----------

async function handleResponses(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
  const session = await resolveSession(req, res);
  if (!session) return;
  if (!(await checkRateLimit(`feedback:${session.userId}`, 30, 60_000))) {
    return res.status(429).json({ error: 'rate_limited', message: 'Terlalu banyak permintaan. Coba lagi sebentar.' });
  }
  const body = readBody(req);
  if (body.contextType !== 'course') return res.status(400).json({ error: 'invalid_body', errors: ['contextType: hanya course untuk saat ini.'] });
  if (typeof body.contextId !== 'string' || typeof body.checkpointId !== 'string' || !ID_RE.test(body.checkpointId)) {
    return res.status(400).json({ error: 'invalid_body', errors: ['contextId dan checkpointId wajib.'] });
  }
  if (body.status !== 'submitted' && body.status !== 'skipped') {
    return res.status(400).json({ error: 'invalid_body', errors: ['status: submitted atau skipped.'] });
  }

  const course = await readQaCourseBySlug(body.contextId);
  if (!course || course.status !== 'published') return res.status(404).json({ error: 'not_found' });
  const checkpoint = course.modules.flatMap((m) => m.items).find((i) => i.id === body.checkpointId);
  if (!checkpoint || checkpoint.kind !== 'feedback') return res.status(404).json({ error: 'checkpoint_not_found' });

  // The flow must still be active; the client may hold a cached copy.
  const flows = await resolvePublicFlows([checkpoint.flowId]);
  const flow = flows[checkpoint.flowId];
  if (!flow) return res.status(409).json({ error: 'flow_inactive', message: 'Form feedback ini sedang tidak aktif.' });

  const check = validateFeedbackAnswers(flow, body.answers, body.status);
  if (!check.ok) return res.status(400).json({ error: 'invalid_answers', errors: check.errors });

  const state = await upsertResponse({
    userId: session.userId,
    contextType: 'course',
    contextId: course.id,
    checkpointId: checkpoint.id,
    flowId: flow.id,
    status: body.status,
    answers: check.answers,
    snapshot: flow.questions.map((q) => ({ id: q.id, type: q.type, prompt: q.prompt, ...(q.helpText ? { helpText: q.helpText } : {}), config: q.config })),
    rating: firstRating(flow, check.answers),
    consent: consentGiven(check.answers),
    durationMs: body.status === 'submitted' ? cleanDuration(body.durationMs) : null,
  });
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ checkpointId: checkpoint.id, ...state });
}

async function handleResults(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, 'GET');
  if (!(await resolveAdminSession(req, res))) return;
  const slug = req.query.course;
  if (typeof slug !== 'string' || !slug) return res.status(400).json({ error: 'invalid_query', errors: ['course wajib.'] });
  const course = await readQaCourseBySlug(slug);
  if (!course) return res.status(404).json({ error: 'not_found' });
  const responses = await contextResponses('course', course.id);
  // Flows used now plus flows answered before a checkpoint was re-pointed.
  const flowIds = [...new Set([...courseFlowIds(course), ...responses.map((r) => r.flowId)])];
  const flows = await resolvePublicFlows(flowIds, true);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ flows, responses, consentQuestionId: CONSENT_QUESTION_ID });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? [segments] : [];
  const [first, second, third] = path;

  if (first === 'questions' && !second) return handleQuestions(req, res);
  if (first === 'questions' && second && ID_RE.test(second) && path.length <= 3) return handleQuestion(req, res, second, third);
  if (first === 'flows' && !second) return handleFlows(req, res);
  if (first === 'flows' && second && ID_RE.test(second) && path.length === 2) return handleFlow(req, res, second);
  if (first === 'responses' && path.length === 1) return handleResponses(req, res);
  if (first === 'results' && path.length === 1) return handleResults(req, res);
  return res.status(404).json({ error: 'not_found' });
}
