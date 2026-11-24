import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import type { QaCourseDetail } from '../../../types/qaCourse';
import type { ProjectProgress, SimulatorProject } from '../../../types/qaSimulator';
import { apiListSimulatorProgress, fetchSimulatorProject } from '../../qa-simulator/lib/simulatorApi';
import {
  clearPendingArticles, fetchCourse, fetchCourseProgress, postCourseFeedback, putCourseArticleDone, readPendingArticles,
} from '../lib/courseApi';
import { buildCheckpoints, buildLessons, courseCompletion } from '../lib/courseOutline';
import type { FeedbackAnswers, FeedbackCheckpointState, FeedbackResponseStatus } from '../../../types/feedback';

type CourseState =
  | { status: 'loading' }
  | { status: 'ready'; course: QaCourseDetail }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

type CourseResult = Exclude<CourseState, { status: 'loading' }>;

interface ProgressResult {
  key: string;
  completed: Set<string>;
  simulator: Record<string, ProjectProgress>;
  feedback: Record<string, FeedbackCheckpointState>;
}

const EMPTY_SET: Set<string> = new Set();
const EMPTY_SIM: Record<string, ProjectProgress> = {};
const EMPTY_FEEDBACK: Record<string, FeedbackCheckpointState> = {};

/**
 * Everything a course page needs: the course, the simulator projects its
 * missions point at, and (when logged in) the learner's article + simulator
 * progress, combined into a flat lesson list.
 *
 * Each async result is stored with the key it was fetched for; "loading" is
 * derived from a key mismatch, so effects only set state from callbacks.
 */
export function useCourse(slug: string | null | undefined) {
  const token = useAdminAuthStore((s) => s.token);
  const [courseResult, setCourseResult] = useState<{ key: string; result: CourseResult } | null>(null);
  const [projects, setProjects] = useState<Record<string, SimulatorProject>>({});
  const [progress, setProgress] = useState<ProgressResult | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchCourse(slug)
      .then((course) => {
        if (!cancelled) setCourseResult({ key: slug, result: course ? { status: 'ready', course } : { status: 'not-found' } });
      })
      .catch((e: unknown) => {
        if (!cancelled) setCourseResult({ key: slug, result: { status: 'error', message: e instanceof Error ? e.message : 'Gagal memuat course.' } });
      });
    return () => { cancelled = true; };
  }, [slug]);

  const state: CourseState = !slug
    ? { status: 'not-found' }
    : courseResult?.key === slug ? courseResult.result : { status: 'loading' };
  const course = state.status === 'ready' ? state.course : null;

  const projectIds = useMemo(() => {
    if (!course) return '';
    const ids = new Set<string>();
    course.modules.forEach((m) => m.items.forEach((i) => { if (i.kind === 'mission') ids.add(i.projectId); }));
    return [...ids].join(',');
  }, [course]);

  useEffect(() => {
    if (!projectIds) return;
    let cancelled = false;
    Promise.all(projectIds.split(',').map((id) => fetchSimulatorProject(id).catch(() => null))).then((list) => {
      if (cancelled) return;
      setProjects(Object.fromEntries(list.filter((p): p is SimulatorProject => Boolean(p)).map((p) => [p.id, p])));
    });
    return () => { cancelled = true; };
  }, [projectIds]);

  const progressKey = course && token ? `${course.slug}|${token}|${projectIds}` : null;

  useEffect(() => {
    if (!course || !token || !progressKey) return;
    let cancelled = false;
    (async () => {
      // Sync lessons finished as a guest (parked in localStorage) first.
      const pending = readPendingArticles(course.slug);
      for (const articleId of pending) {
        await putCourseArticleDone(course.slug, articleId, true, token).catch(() => null);
      }
      if (pending.length > 0) clearPendingArticles(course.slug);
      const [saved, records] = await Promise.all([
        fetchCourseProgress(course.slug, token).catch(() => null),
        projectIds ? apiListSimulatorProgress(token).catch(() => []) : Promise.resolve([]),
      ]);
      if (cancelled) return;
      setProgress({
        key: progressKey,
        completed: new Set(saved?.completedArticleIds ?? []),
        simulator: Object.fromEntries(records.map((r) => [r.projectId, r.data])),
        feedback: saved?.feedback ?? {},
      });
    })();
    return () => { cancelled = true; };
  }, [course, token, projectIds, progressKey]);

  const current = progressKey && progress?.key === progressKey ? progress : null;
  const completed = current?.completed ?? EMPTY_SET;
  const simulator = current?.simulator ?? EMPTY_SIM;
  const feedback = current?.feedback ?? EMPTY_FEEDBACK;
  const progressLoaded = !token || Boolean(current);

  const lessons = useMemo(
    () => (course ? buildLessons({ course, projects, simulatorProgress: simulator, completedArticleIds: completed, loggedIn: Boolean(token) }) : []),
    [course, projects, simulator, completed, token]
  );

  const checkpoints = useMemo(() => (course ? buildCheckpoints(course, lessons, feedback) : []), [course, lessons, feedback]);

  /** Submit or skip a checkpoint; resolves to an error message or null. */
  const submitFeedback = useCallback(async (checkpointId: string, status: FeedbackResponseStatus, answers: FeedbackAnswers, durationMs?: number): Promise<string | null> => {
    if (!course || !token || !progressKey) return 'Login dulu untuk mengirim feedback.';
    try {
      const saved = await postCourseFeedback(course.slug, checkpointId, status, answers, token, durationMs);
      setProgress((prev) => (prev && prev.key === progressKey ? { ...prev, feedback: { ...prev.feedback, [checkpointId]: saved } } : prev));
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Gagal mengirim feedback.';
    }
  }, [course, token, progressKey]);

  const setArticleDone = useCallback(async (articleId: string, done: boolean) => {
    if (!course || !token || !progressKey) return false;
    const apply = (mark: boolean) => setProgress((prev) => {
      if (!prev || prev.key !== progressKey) return prev;
      const next = new Set(prev.completed);
      if (mark) next.add(articleId); else next.delete(articleId);
      return { ...prev, completed: next };
    });
    apply(done); // optimistic
    try {
      const saved = await putCourseArticleDone(course.slug, articleId, done, token);
      setProgress((prev) => (prev && prev.key === progressKey ? { ...prev, completed: new Set(saved.completedArticleIds) } : prev));
      return true;
    } catch {
      apply(!done); // roll back
      return false;
    }
  }, [course, token, progressKey]);

  return {
    state,
    course,
    lessons,
    completion: courseCompletion(lessons),
    loggedIn: Boolean(token),
    progressLoaded,
    setArticleDone,
    checkpoints,
    submitFeedback,
  };
}
