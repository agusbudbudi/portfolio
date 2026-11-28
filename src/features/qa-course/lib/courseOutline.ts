import type { QaCourseDetail, QaCourseFeedbackItem, QaCourseLessonItem } from '../../../types/qaCourse';
import type { FeedbackCheckpointState, FeedbackFlowPublic } from '../../../types/feedback';
import type { ProjectProgress, SimulatorProject } from '../../../types/qaSimulator';
import { isPhaseComplete } from '../../qa-simulator/lib/progress';

/** One step of a course, flattened in reading order with everything the UI shows. */
export interface Lesson {
  item: QaCourseLessonItem;
  /** 0-based position across the whole course. */
  index: number;
  moduleIndex: number;
  moduleTitle: string;
  kind: QaCourseLessonItem['kind'];
  title: string;
  /** Secondary line: reading time, or the simulator project. */
  meta: string;
  href: string;
  done: boolean;
  /** false = the article was unpublished/deleted or the phase no longer exists. */
  available: boolean;
  /** Guests can open only the first lesson; the rest ask them to log in. */
  needsLogin: boolean;
  /**
   * Why the lesson can't be opened yet: 'login' (guest past lesson 1) or
   * 'sequence' (comes after the next unfinished lesson; it opens only by
   * finishing the one before it). null = open.
   */
  lock: 'login' | 'sequence' | null;
  /** The next unfinished lesson: the one "Mulai/Lanjutkan" points at. */
  isNext: boolean;
  /** Missions only: the simulator product name, e.g. "SplitBill". */
  product?: string;
}

export interface CourseOutlineInput {
  course: QaCourseDetail;
  projects: Record<string, SimulatorProject>;
  simulatorProgress: Record<string, ProjectProgress>;
  completedArticleIds: Set<string>;
  loggedIn: boolean;
}

export const articleLessonHref = (courseSlug: string, articleSlug: string) =>
  `/qa-library/${articleSlug}?course=${encodeURIComponent(courseSlug)}`;

/** Course detail with an article's lesson opened, scrolled to and highlighted (CourseDetailPage). */
export const courseLessonAnchorHref = (courseSlug: string, articleSlug: string) =>
  `/courses/${courseSlug}#lesson-${articleSlug}`;

export const missionLessonHref = (courseSlug: string, projectId: string, phaseId: string) =>
  `/qa-simulator/${projectId}?phase=${encodeURIComponent(phaseId)}&course=${encodeURIComponent(courseSlug)}`;

export function buildLessons({ course, projects, simulatorProgress, completedArticleIds, loggedIn }: CourseOutlineInput): Lesson[] {
  const lessons: Lesson[] = [];
  course.modules.forEach((mod, moduleIndex) => {
    for (const item of mod.items) {
      // Feedback checkpoints are not lessons (see buildCheckpoints).
      if (item.kind === 'feedback') continue;
      const index = lessons.length;
      const needsLogin = !loggedIn && index > 0;
      if (item.kind === 'article') {
        const ref = course.articles[item.articleId];
        lessons.push({
          item, index, moduleIndex, moduleTitle: mod.title, kind: 'article',
          title: ref?.title ?? 'Artikel tidak tersedia',
          meta: ref ? `${ref.readingTimeMinutes} menit baca` : '',
          href: ref ? articleLessonHref(course.slug, ref.slug) : '#',
          done: completedArticleIds.has(item.articleId),
          available: Boolean(ref?.available),
          needsLogin,
          lock: null,
          isNext: false,
        });
      } else {
        const project = projects[item.projectId];
        const phaseIdx = project?.phases.findIndex((p) => p.id === item.phaseId) ?? -1;
        const phase = phaseIdx >= 0 ? project?.phases[phaseIdx] : undefined;
        const progress = simulatorProgress[item.projectId];
        lessons.push({
          item, index, moduleIndex, moduleTitle: mod.title, kind: 'mission',
          title: phase ? `Misi: ${phase.title}` : 'Misi simulator',
          meta: project ? `QA Simulator · ${project.product}, phase ${phaseIdx + 1}` : 'QA Simulator',
          href: missionLessonHref(course.slug, item.projectId, item.phaseId),
          done: Boolean(phase && progress && isPhaseComplete(phase, progress)),
          // Until projects load, assume the mission exists (avoids a flash of "tidak tersedia").
          available: !project || Boolean(phase),
          needsLogin,
          lock: null,
          isNext: false,
          product: project?.product,
        });
      }
    }
  });

  // Sequential unlock: everything up to and including the first unfinished
  // lesson is open; later lessons stay locked until the learner finishes the
  // one before them (from inside the lesson, via "Selesai & lanjut").
  // Unavailable lessons are skipped so a removed article never blocks a course.
  const frontier = lessons.find((l) => l.available && !l.done);
  for (const lesson of lessons) {
    lesson.isNext = lesson === frontier;
    if (lesson.needsLogin) lesson.lock = 'login';
    else if (frontier && lesson.index > frontier.index) lesson.lock = 'sequence';
  }
  return lessons;
}

export function courseCompletion(lessons: Lesson[]) {
  const counted = lessons.filter((l) => l.available);
  const done = counted.filter((l) => l.done).length;
  return {
    done,
    total: counted.length,
    percent: counted.length === 0 ? 0 : Math.round((done / counted.length) * 100),
    allDone: counted.length > 0 && done === counted.length,
  };
}

/** First lesson not done yet (the "Lanjutkan" target), or the first lesson. */
export function nextLesson(lessons: Lesson[]): Lesson | undefined {
  return lessons.find((l) => l.available && !l.done) ?? lessons[0];
}

/** A feedback checkpoint placed between lessons. */
export interface Checkpoint {
  item: QaCourseFeedbackItem;
  moduleIndex: number;
  moduleTitle: string;
  /** Lessons that come before it, in course order. */
  lessonsBefore: number;
  /** Resolved flow; absent = draft or deleted, so the checkpoint is hidden. */
  flow?: FeedbackFlowPublic;
  /** Every available lesson before it is done. */
  reached: boolean;
  /** The learner's saved state, if any. */
  state?: FeedbackCheckpointState;
}

export function buildCheckpoints(
  course: QaCourseDetail,
  lessons: Lesson[],
  feedback: Record<string, FeedbackCheckpointState>,
): Checkpoint[] {
  const out: Checkpoint[] = [];
  let lessonsBefore = 0;
  course.modules.forEach((mod, moduleIndex) => {
    for (const item of mod.items) {
      if (item.kind !== 'feedback') { lessonsBefore += 1; continue; }
      const before = lessons.slice(0, lessonsBefore);
      out.push({
        item,
        moduleIndex,
        moduleTitle: mod.title,
        lessonsBefore,
        flow: course.feedbackFlows?.[item.flowId],
        reached: before.every((l) => !l.available || l.done),
        state: feedback[item.id],
      });
    }
  });
  return out;
}

/**
 * The checkpoint the popup should ask about now, or undefined: the LAST one
 * the learner has reached that has a live flow, no saved response and is not
 * snoozed this session. Older unanswered ones are not queued up; they stay
 * reachable from the outline. Guests never get one.
 */
export function activeCheckpoint(
  checkpoints: Checkpoint[],
  opts: { loggedIn: boolean; snoozed: ReadonlySet<string> },
): Checkpoint | undefined {
  if (!opts.loggedIn) return undefined;
  const reached = checkpoints.filter((c) => c.flow && c.reached);
  const last = reached.at(-1);
  if (!last || last.state || opts.snoozed.has(last.item.id)) return undefined;
  return last;
}
