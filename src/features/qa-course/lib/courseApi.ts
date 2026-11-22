import { ApiError, UnauthorizedError } from '../../../lib/adminApi';
import type {
  QaCourseDetail, QaCourseMembership, QaCourseProgress, QaCourseSummary, QaCourseWithProgress,
} from '../../../types/qaCourse';

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
