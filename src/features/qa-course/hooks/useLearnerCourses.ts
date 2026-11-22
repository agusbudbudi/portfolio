import { useEffect, useState } from 'react';
import type { QaCourseDetail } from '../../../types/qaCourse';
import type { ProjectProgress, SimulatorProject } from '../../../types/qaSimulator';
import { apiListSimulatorProgress, fetchSimulatorProject } from '../../qa-simulator/lib/simulatorApi';
import { fetchCourse, fetchCourseProgress, fetchCourses } from '../lib/courseApi';
import { buildLessons } from '../lib/courseOutline';
import type { LearnerCourse } from '../lib/heroCourse';

/**
 * Every published course with the learner's lessons (article + mission
 * status) resolved. Shared by the dashboard QA Course tab and the /courses
 * hero card. Without a token the lessons are built as a guest's.
 * `rows` is null while loading.
 */
export function useLearnerCourses(token: string | null) {
  const [rows, setRows] = useState<LearnerCourse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const summaries = await fetchCourses();
        const details = (await Promise.all(summaries.map((c) => fetchCourse(c.slug)))).filter((c): c is QaCourseDetail => Boolean(c));

        // Simulator projects + the learner's simulator progress, for mission status.
        const projectIds = [...new Set(details.flatMap((c) => c.modules.flatMap((m) => m.items)).flatMap((i) => (i.kind === 'mission' ? [i.projectId] : [])))];
        const [projects, simRecords, progresses] = await Promise.all([
          Promise.all(projectIds.map((id) => fetchSimulatorProject(id).catch(() => null))),
          token && projectIds.length ? apiListSimulatorProgress(token).catch(() => []) : Promise.resolve([]),
          Promise.all(details.map((c) => (token ? fetchCourseProgress(c.slug, token).catch(() => null) : Promise.resolve(null)))),
        ]);
        if (cancelled) return;

        const projectMap: Record<string, SimulatorProject> = Object.fromEntries(
          projects.filter((p): p is SimulatorProject => Boolean(p)).map((p) => [p.id, p])
        );
        const simMap: Record<string, ProjectProgress> = Object.fromEntries(simRecords.map((r) => [r.projectId, r.data]));
        setRows(details.map((course, i) => ({
          course,
          lessons: buildLessons({
            course,
            projects: projectMap,
            simulatorProgress: simMap,
            completedArticleIds: new Set(progresses[i]?.completedArticleIds ?? []),
            loggedIn: Boolean(token),
          }),
        })));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat QA Course.');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return { rows, error };
}
