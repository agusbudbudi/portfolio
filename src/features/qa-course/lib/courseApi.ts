import { ApiError, UnauthorizedError } from '../../../lib/adminApi';
import type {
  QaCourseDetail, QaCourseMembership, QaCourseProgress, QaCourseSummary, QaCourseWithProgress,
} from '../../../types/qaCourse';
import type { FeedbackAnswers, FeedbackCheckpointState, FeedbackResponseStatus } from '../../../types/feedback';

export async function fetchCourses(): Promise<QaCourseSummary[]> {
  const res = await fetch('/api/qa-courses');
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat course (HTTP ${res.status}).`);
  const body = (await res.json()) as { courses: QaCourseSummary[] };
  return body.courses;
}

/** null = not found (or a draft the caller can't see). */
export async function fetchCourse(slug: string): Promise<QaCourseDetail | null> {
  const res = await fetch(`/api/qa-courses/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat course (HTTP ${res.status}).`);
  return res.json();
}

export async function fetchCourseProgress(slug: string, token: string): Promise<QaCourseProgress> {
  const res = await fetch(`/api/qa-courses/${encodeURIComponent(slug)}/progress?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat progress (HTTP ${res.status}).`);
  return res.json();
}

export async function putCourseArticleDone(slug: string, articleId: string, completed: boolean, token: string): Promise<QaCourseProgress> {
  const res = await fetch(`/api/qa-courses/${encodeURIComponent(slug)}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ articleId, completed }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal menyimpan progress (HTTP ${res.status}).`);
  return res.json();
}

/** Published courses that use this article. Failures resolve to [] (the banner is optional). */
export async function fetchCoursesForArticle(articleId: string): Promise<QaCourseMembership[]> {
  try {
    const res = await fetch(`/api/qa-courses?article=${encodeURIComponent(articleId)}`);
    if (!res.ok) return [];
    const body = (await res.json()) as { memberships: QaCourseMembership[] };
    return body.memberships;
  } catch {
    return [];
  }
}

/** Signed-in learner's courses on a simulator project, with their article progress. */
export async function fetchMyCoursesForProject(projectId: string, token: string): Promise<QaCourseWithProgress[]> {
  const res = await fetch(`/api/qa-courses/for-project/${encodeURIComponent(projectId)}?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) throw new ApiError(res.status, `Gagal memuat course (HTTP ${res.status}).`);
  const body = (await res.json()) as { courses: QaCourseWithProgress[] };
  return body.courses;
}

// Guests can read lesson 1 without an account. When they finish it, the
// article id is parked in localStorage and synced once they log in, so the
// lesson isn't lost. Storage can throw (private mode, blocked): best effort.
const pendingKey = (slug: string) => `qa-course-pending:${slug}`;

export function addPendingArticle(slug: string, articleId: string) {
  try {
    const ids = new Set(readPendingArticles(slug));
    ids.add(articleId);
    localStorage.setItem(pendingKey(slug), JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

export function readPendingArticles(slug: string): string[] {
  try {
    const raw = localStorage.getItem(pendingKey(slug));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function clearPendingArticles(slug: string) {
  try {
    localStorage.removeItem(pendingKey(slug));
  } catch {
    // ignore
  }
}

/** Submit or skip a course feedback checkpoint. Returns the saved state. */
export async function postCourseFeedback(
  slug: string,
  checkpointId: string,
  status: FeedbackResponseStatus,
  answers: FeedbackAnswers,
  token: string,
  durationMs?: number,
): Promise<FeedbackCheckpointState> {
  const res = await fetch('/api/feedback/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ contextType: 'course', contextId: slug, checkpointId, status, answers, durationMs }),
  });
  if (res.status === 401) throw new UnauthorizedError();
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? `Gagal mengirim feedback (HTTP ${res.status}).`, body?.errors);
  }
  const body = (await res.json()) as FeedbackCheckpointState;
  return { status: body.status, answers: body.answers, updatedAt: body.updatedAt };
}

// "Nanti saja" snoozes a checkpoint for this browser session; the third
// snooze counts as a skip so the popup stops nagging. Storage may throw
// (private mode, blocked): then nothing is remembered, which is harmless.
const snoozeKey = (slug: string) => `qa-course-fb-snooze:${slug}`;
const snoozeCountKey = (slug: string, checkpointId: string) => `qa-course-fb-snooze-count:${slug}:${checkpointId}`;

export function readSnoozed(slug: string): Set<string> {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(snoozeKey(slug)) ?? '[]') as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

/** Snoozes for this session; returns how many times this checkpoint was snoozed in total. */
export function snoozeCheckpoint(slug: string, checkpointId: string): number {
  try {
    const set = readSnoozed(slug);
    set.add(checkpointId);
    sessionStorage.setItem(snoozeKey(slug), JSON.stringify([...set]));
    const count = Number(localStorage.getItem(snoozeCountKey(slug, checkpointId)) ?? '0') + 1;
    localStorage.setItem(snoozeCountKey(slug, checkpointId), String(count));
    return count;
  } catch {
    return 1;
  }
}

// Unsent answers survive a closed tab (same idea as useDraft).
const draftKey = (slug: string, checkpointId: string) => `qa-course-fb-draft:${slug}:${checkpointId}`;

export function readFeedbackDraft(slug: string, checkpointId: string): FeedbackAnswers | null {
  try {
    const raw = localStorage.getItem(draftKey(slug, checkpointId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as FeedbackAnswers) : null;
  } catch {
    return null;
  }
}

export function writeFeedbackDraft(slug: string, checkpointId: string, answers: FeedbackAnswers | null) {
  try {
    if (answers) localStorage.setItem(draftKey(slug, checkpointId), JSON.stringify(answers));
    else localStorage.removeItem(draftKey(slug, checkpointId));
  } catch {
    // ignore
  }
}
