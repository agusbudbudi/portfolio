import { QA_COURSE_LEVEL_LABEL, type QaCourseDetail } from '../../../types/qaCourse';
import { buildLessons, nextLesson } from '../../qa-course/lib/courseOutline';
import type { Program } from '../data/programs';

/** "±5 jam", with an Indonesian decimal comma for e.g. 1.5. */
export const hoursFact = (hours: number) => `±${hours.toLocaleString('id-ID')} jam`;

/**
 * Fill a course card from the live course: the CTA deep-links to lesson 1 as
 * the DB orders it (first available lesson, as a guest sees it), and the
 * hours/level chips come from the course instead of a hand-typed copy.
 * Static facts stay first ("Gratis"); duplicates are dropped.
 */
export function applyCourse(program: Program, course: QaCourseDetail): Program {
  const lessons = buildLessons({ course, projects: {}, simulatorProgress: {}, completedArticleIds: new Set(), loggedIn: false });
  const first = nextLesson(lessons);
  // A lesson a guest can't open (login-gated, removed) falls back to the course page.
  const href = first && first.available && !first.lock && first.href !== '#' ? first.href : program.href;
  const facts = [...new Set([...program.facts, hoursFact(course.estimatedHours), QA_COURSE_LEVEL_LABEL[course.level]])];
  return { ...program, href, facts };
}
