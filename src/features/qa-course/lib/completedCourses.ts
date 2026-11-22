import type { QaCourseWithProgress } from '../../../types/qaCourse';
import type { ProjectProgress, SimulatorProject } from '../../../types/qaSimulator';
import { buildLessons, courseCompletion, type Lesson } from './courseOutline';

export interface CompletedCourse {
  record: QaCourseWithProgress;
  lessons: Lesson[];
  /** Latest of the last article completion and the last simulator submission. */
  finishedAt?: string;
}

/**
 * Which of these courses the learner has fully finished, judged with the same
 * rules as the course itself: every article marked done and every mission's
 * phase submitted. Missions are read from this project's progress only, so a
 * course that also needs another project never counts as finished here.
 */
export function completedCourses(
  records: QaCourseWithProgress[],
  project: SimulatorProject,
  progress: ProjectProgress
): CompletedCourse[] {
  const lastSubmit = Object.values(progress.assignments)
    .map((a) => a.submittedAt)
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1);
  return records.flatMap((record) => {
    const lessons = buildLessons({
      course: record.course,
      projects: { [project.id]: project },
      simulatorProgress: { [project.id]: progress },
      completedArticleIds: new Set(record.completedArticleIds),
      loggedIn: true,
    });
    // Missions on other projects can't be verified here: never "finished".
    const foreignMission = lessons.some((l) => l.item.kind === 'mission' && l.item.projectId !== project.id);
    if (foreignMission || !courseCompletion(lessons).allDone) return [];
    const finishedAt = [record.lastCompletedAt, lastSubmit].filter((d): d is string => Boolean(d)).sort().at(-1);
    return [{ record, lessons, finishedAt }];
  });
}
