import type { QaCourseDetail } from '../../../types/qaCourse';
import { courseCompletion, nextLesson, type Lesson } from './courseOutline';

export interface LearnerCourse {
  course: QaCourseDetail;
  lessons: Lesson[];
}

export type HeroCourse =
  | { kind: 'in-progress'; course: QaCourseDetail; lessons: Lesson[]; completion: ReturnType<typeof courseCompletion>; target: Lesson }
  | { kind: 'finished'; course: QaCourseDetail; lessons: Lesson[]; completion: ReturnType<typeof courseCompletion>; otherCourses: number };

/**
 * Which course the /courses hero card features for a signed-in learner:
 * 1. a course in progress (started, not finished) always wins; with several,
 *    the one closest to done, then catalog order;
 * 2. otherwise the first finished course (graduation card);
 * 3. otherwise nothing (not started anything yet).
 * Progress has no per-course activity timestamp, hence percent as the
 * tie-breaker.
 */
export function pickHeroCourse(rows: LearnerCourse[]): HeroCourse | null {
  const scored = rows.map((r) => ({ ...r, completion: courseCompletion(r.lessons) }));

  const inProgress = scored
    .filter((r) => r.completion.done > 0 && !r.completion.allDone)
    .sort((a, b) => b.completion.percent - a.completion.percent)[0];
  if (inProgress) {
    const target = nextLesson(inProgress.lessons);
    if (target) return { kind: 'in-progress', ...inProgress, target };
  }

  const finished = scored.find((r) => r.completion.allDone);
  if (finished) {
    const otherCourses = scored.filter((r) => r !== finished && !r.completion.allDone).length;
    return { kind: 'finished', ...finished, otherCourses };
  }
  return null;
}
