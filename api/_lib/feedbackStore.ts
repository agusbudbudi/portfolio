// Feedback Checkpoint storage: question bank, flows, and learner responses.
// Questions and flows are saved whole with compare-and-swap on updated_at
// (same pattern as qaCourseStore). Responses are one row per learner per
// checkpoint (upsert), generic over context_type for QA Simulator later.
import type { Row } from '@libsql/client';
import type {
  FeedbackAnswers, FeedbackCheckpointState, FeedbackContextType, FeedbackFlow, FeedbackFlowData, FeedbackFlowPublic,
  FeedbackFlowSummary, FeedbackQuestion, FeedbackQuestionData, FeedbackQuestionPublic, FeedbackQuestionSummary,
  FeedbackResponseRow, FeedbackResponseStatus,
} from '../../src/types/feedback.js';
import type { QaCourseModule } from '../../src/types/qaCourse.js';
import { CONSENT_QUESTION_ID, DEFAULT_CONSENT_PROMPT, buildPublicFlow } from '../../src/lib/feedbackValidation.js';
import { getClient, migrate } from './turso.js';

export type WriteResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: 'conflict'; current: T | null }
  | { ok: false; reason: 'not_found' };

// ---------- questions ----------

function rowToQuestion(row: Row): FeedbackQuestion {
  return {
    id: row.id as string,
    type: row.type as FeedbackQuestion['type'],
    prompt: row.prompt as string,
    ...((row.help_text as string | null) ? { helpText: row.help_text as string } : {}),
    config: JSON.parse((row.config as string) || '{}'),
    status: row.status as FeedbackQuestion['status'],
    isSystem: Number(row.is_system) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

let consentSeeded = false;

/** The built-in consent question exists from the first request on. */
async function ready(): Promise<void> {
  await migrate();
  if (consentSeeded) return;
  const now = new Date().toISOString();
  await getClient().execute({
    sql: `INSERT OR IGNORE INTO feedback_questions (id, type, prompt, config, is_system, status, created_at, updated_at)
          VALUES (?, 'consent', ?, '{}', 1, 'active', ?, ?)`,
    args: [CONSENT_QUESTION_ID, DEFAULT_CONSENT_PROMPT, now, now],
  });
  consentSeeded = true;
}

export async function listQuestions(): Promise<FeedbackQuestionSummary[]> {
  await ready();
  const db = getClient();
  const [questions, flows] = await Promise.all([
    db.execute(`SELECT q.*, (
                  SELECT COUNT(*) FROM feedback_responses r
                  WHERE r.status = 'submitted' AND json_extract(r.answers, '$."' || q.id || '"') IS NOT NULL
                ) AS answer_count
                FROM feedback_questions q ORDER BY q.is_system DESC, q.updated_at DESC`),
    db.execute('SELECT items, ask_consent FROM feedback_flows'),
  ]);
  const flowCount = new Map<string, number>();
  for (const f of flows.rows) {
    const ids = (JSON.parse(f.items as string) as { questionId: string }[]).map((i) => i.questionId);
    if (Number(f.ask_consent) === 1) ids.push(CONSENT_QUESTION_ID);
    for (const id of new Set(ids)) flowCount.set(id, (flowCount.get(id) ?? 0) + 1);
  }
  return questions.rows.map((row) => ({
    ...rowToQuestion(row),
    flowCount: flowCount.get(row.id as string) ?? 0,
    answerCount: Number(row.answer_count ?? 0),
  }));
}

export async function readQuestion(id: string): Promise<FeedbackQuestion | null> {
  await ready();
  const result = await getClient().execute({ sql: 'SELECT * FROM feedback_questions WHERE id = ?', args: [id] });
  return result.rows[0] ? rowToQuestion(result.rows[0]) : null;
}

export async function readQuestionBank(): Promise<Record<string, FeedbackQuestion>> {
  await ready();
  const result = await getClient().execute('SELECT * FROM feedback_questions');
  return Object.fromEntries(result.rows.map((r) => [r.id as string, rowToQuestion(r)]));
}

export async function questionAnswerCount(id: string): Promise<number> {
  await ready();
  const result = await getClient().execute({
    sql: `SELECT COUNT(*) AS n FROM feedback_responses
          WHERE status = 'submitted' AND json_extract(answers, '$."' || ? || '"') IS NOT NULL`,
    args: [id],
  });
  return Number(result.rows[0]?.n ?? 0);
}

export async function createQuestion(data: FeedbackQuestionData): Promise<FeedbackQuestion> {
  await ready();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await getClient().execute({
    sql: `INSERT INTO feedback_questions (id, type, prompt, help_text, config, is_system, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    args: [id, data.type, data.prompt, data.helpText ?? null, JSON.stringify(data.config), data.status, now, now],
  });
  return { id, ...data, isSystem: false, createdAt: now, updatedAt: now };
}

export async function updateQuestion(id: string, data: FeedbackQuestionData, expectedUpdatedAt: string): Promise<WriteResult<FeedbackQuestion>> {
  await ready();
  const updatedAt = new Date().toISOString();
  const result = await getClient().execute({
    sql: `UPDATE feedback_questions SET type = ?, prompt = ?, help_text = ?, config = ?, status = ?, updated_at = ?
          WHERE id = ? AND updated_at IS ? RETURNING *`,
    args: [data.type, data.prompt, data.helpText ?? null, JSON.stringify(data.config), data.status, updatedAt, id, expectedUpdatedAt],
  });
  if (result.rows[0]) return { ok: true, value: rowToQuestion(result.rows[0]) };
  const current = await readQuestion(id);
  return current ? { ok: false, reason: 'conflict', current } : { ok: false, reason: 'not_found' };
}

export async function deleteQuestion(id: string): Promise<void> {
  await ready();
  await getClient().execute({ sql: 'DELETE FROM feedback_questions WHERE id = ? AND is_system = 0', args: [id] });
}

// ---------- flows ----------

function rowToFlow(row: Row): FeedbackFlow {
  return {
    id: row.id as string,
    name: row.name as string,
    title: row.title as string,
    ...((row.intro as string | null) ? { intro: row.intro as string } : {}),
    status: row.status as FeedbackFlow['status'],
    items: JSON.parse(row.items as string),
    askConsent: Number(row.ask_consent) === 1,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Every course checkpoint, keyed by flow id. */
async function checkpointsByFlow(): Promise<Map<string, FeedbackFlowSummary['usedIn']>> {
  const result = await getClient().execute('SELECT slug, title, modules FROM qa_courses');
  const map = new Map<string, FeedbackFlowSummary['usedIn']>();
  for (const row of result.rows) {
    const modules = JSON.parse(row.modules as string) as QaCourseModule[];
    for (const mod of modules) {
      for (const item of mod.items) {
        if (item.kind !== 'feedback') continue;
        const list = map.get(item.flowId) ?? [];
        list.push({ courseSlug: row.slug as string, courseTitle: row.title as string, checkpointId: item.id });
        map.set(item.flowId, list);
      }
    }
  }
  return map;
}

export async function listFlows(): Promise<FeedbackFlowSummary[]> {
  await ready();
  const db = getClient();
  const [flows, counts, used] = await Promise.all([
    db.execute('SELECT * FROM feedback_flows ORDER BY updated_at DESC'),
    db.execute(`SELECT flow_id, COUNT(*) AS n FROM feedback_responses WHERE status = 'submitted' GROUP BY flow_id`),
    checkpointsByFlow(),
  ]);
  const answerCount = new Map(counts.rows.map((r) => [r.flow_id as string, Number(r.n)]));
  return flows.rows.map((row) => {
    const flow = rowToFlow(row);
    return { ...flow, usedIn: used.get(flow.id) ?? [], answerCount: answerCount.get(flow.id) ?? 0 };
  });
}

export async function readFlow(id: string): Promise<FeedbackFlow | null> {
  await ready();
  const result = await getClient().execute({ sql: 'SELECT * FROM feedback_flows WHERE id = ?', args: [id] });
  return result.rows[0] ? rowToFlow(result.rows[0]) : null;
}

export async function flowUsage(id: string): Promise<FeedbackFlowSummary['usedIn']> {
  await ready();
  return (await checkpointsByFlow()).get(id) ?? [];
}

/** Flow ids that exist, with their status (for course save checks). */
export async function flowStatuses(ids: string[]): Promise<Record<string, FeedbackFlow['status']>> {
  if (ids.length === 0) return {};
  await ready();
  const result = await getClient().execute({
    sql: `SELECT id, status FROM feedback_flows WHERE id IN (${ids.map(() => '?').join(', ')})`,
    args: ids,
  });
  return Object.fromEntries(result.rows.map((r) => [r.id as string, r.status as FeedbackFlow['status']]));
}

export async function createFlow(data: FeedbackFlowData): Promise<FeedbackFlow> {
  await ready();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await getClient().execute({
    sql: `INSERT INTO feedback_flows (id, name, title, intro, status, items, ask_consent, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, data.name, data.title, data.intro ?? null, data.status, JSON.stringify(data.items), data.askConsent ? 1 : 0, now, now],
  });
  return { id, ...data, createdAt: now, updatedAt: now };
}

export async function updateFlow(id: string, data: FeedbackFlowData, expectedUpdatedAt: string): Promise<WriteResult<FeedbackFlow>> {
  await ready();
  const updatedAt = new Date().toISOString();
  const result = await getClient().execute({
    sql: `UPDATE feedback_flows SET name = ?, title = ?, intro = ?, status = ?, items = ?, ask_consent = ?, updated_at = ?
          WHERE id = ? AND updated_at IS ? RETURNING *`,
    args: [data.name, data.title, data.intro ?? null, data.status, JSON.stringify(data.items), data.askConsent ? 1 : 0, updatedAt, id, expectedUpdatedAt],
  });
  if (result.rows[0]) return { ok: true, value: rowToFlow(result.rows[0]) };
  const current = await readFlow(id);
  return current ? { ok: false, reason: 'conflict', current } : { ok: false, reason: 'not_found' };
}

export async function deleteFlow(id: string): Promise<void> {
  await ready();
  await getClient().execute({ sql: 'DELETE FROM feedback_flows WHERE id = ?', args: [id] });
}

/**
 * Flows among `ids`, resolved for the learner. Only active ones unless
 * `includeDrafts` (admin results); missing flows are left out.
 */
export async function resolvePublicFlows(ids: string[], includeDrafts = false): Promise<Record<string, FeedbackFlowPublic>> {
  if (ids.length === 0) return {};
  await ready();
  const result = await getClient().execute({
    sql: `SELECT * FROM feedback_flows WHERE ${includeDrafts ? '1 = 1' : "status = 'active'"} AND id IN (${ids.map(() => '?').join(', ')})`,
    args: ids,
  });
  if (result.rows.length === 0) return {};
  const bank = await readQuestionBank();
  return Object.fromEntries(result.rows.map((row) => {
    const flow = rowToFlow(row);
    return [flow.id, buildPublicFlow(flow, bank)];
  }));
}

// ---------- responses ----------

export interface ResponseWrite {
  userId: string;
  contextType: FeedbackContextType;
  contextId: string;
  checkpointId: string;
  flowId: string;
  status: FeedbackResponseStatus;
  answers: FeedbackAnswers;
  snapshot: FeedbackQuestionPublic[];
  rating: number | null;
  consent: boolean;
  durationMs: number | null;
}

export async function upsertResponse(w: ResponseWrite): Promise<FeedbackCheckpointState> {
  await ready();
  const now = new Date().toISOString();
  await getClient().execute({
    sql: `INSERT INTO feedback_responses
            (id, user_id, context_type, context_id, checkpoint_id, flow_id, status, answers, snapshot, rating, consent, duration_ms, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, context_type, context_id, checkpoint_id) DO UPDATE SET
            flow_id = excluded.flow_id, status = excluded.status, answers = excluded.answers, snapshot = excluded.snapshot,
            rating = excluded.rating, consent = excluded.consent, updated_at = excluded.updated_at,
            -- Keep the first fill time: an edit from the outline is not a fresh fill.
            duration_ms = CASE WHEN feedback_responses.status = 'submitted' AND feedback_responses.duration_ms IS NOT NULL
                               THEN feedback_responses.duration_ms ELSE excluded.duration_ms END`,
    args: [
      crypto.randomUUID(), w.userId, w.contextType, w.contextId, w.checkpointId, w.flowId, w.status,
      JSON.stringify(w.answers), JSON.stringify(w.snapshot), w.rating, w.consent ? 1 : 0, w.durationMs, now, now,
    ],
  });
  return { status: w.status, answers: w.answers, updatedAt: now };
}

/** A learner's saved checkpoints in one course/project, keyed by checkpoint id. */
export async function userCheckpointStates(
  userId: string, contextType: FeedbackContextType, contextId: string
): Promise<Record<string, FeedbackCheckpointState>> {
  await ready();
  const result = await getClient().execute({
    sql: `SELECT checkpoint_id, status, answers, updated_at FROM feedback_responses
          WHERE user_id = ? AND context_type = ? AND context_id = ?`,
    args: [userId, contextType, contextId],
  });
  return Object.fromEntries(result.rows.map((r) => [
    r.checkpoint_id as string,
    { status: r.status as FeedbackResponseStatus, answers: JSON.parse(r.answers as string), updatedAt: r.updated_at as string },
  ]));
}

/** Every response in a course/project, newest first, with learner names (no emails). */
export async function contextResponses(contextType: FeedbackContextType, contextId: string): Promise<FeedbackResponseRow[]> {
  await ready();
  const result = await getClient().execute({
    sql: `SELECT r.user_id, r.checkpoint_id, r.flow_id, r.status, r.answers, r.snapshot, r.duration_ms, r.updated_at, u.name, u.avatar_url
          FROM feedback_responses r LEFT JOIN users u ON u.id = r.user_id
          WHERE r.context_type = ? AND r.context_id = ?
          ORDER BY r.updated_at DESC`,
    args: [contextType, contextId],
  });
  // Stable per-request key without exposing user ids to the browser.
  const keys = new Map<string, string>();
  return result.rows.map((r) => {
    const uid = r.user_id as string;
    if (!keys.has(uid)) keys.set(uid, `learner-${keys.size + 1}`);
    return {
      checkpointId: r.checkpoint_id as string,
      flowId: r.flow_id as string,
      status: r.status as FeedbackResponseStatus,
      answers: JSON.parse(r.answers as string),
      snapshot: JSON.parse(r.snapshot as string),
      userKey: keys.get(uid)!,
      userName: (r.name as string | null) ?? 'Peserta',
      ...((r.avatar_url as string | null) ? { avatarUrl: r.avatar_url as string } : {}),
      ...(r.duration_ms !== null && r.duration_ms !== undefined ? { durationMs: Number(r.duration_ms) } : {}),
      updatedAt: r.updated_at as string,
    };
  });
}

/** Drop a course's/project's responses (the course itself was deleted). */
export async function deleteContextResponses(contextType: FeedbackContextType, contextId: string): Promise<void> {
  await ready();
  await getClient().execute({ sql: 'DELETE FROM feedback_responses WHERE context_type = ? AND context_id = ?', args: [contextType, contextId] });
}
