// Canonical types for QA Course: an ordered path that strings QA Library
// articles (Belajar) and QA Simulator phases (Praktik) into modules.
// Shared by the public /courses pages, the admin Courses tab and the /api
// functions — keep free of browser-only imports.

export type QaCourseStatus = 'draft' | 'published';
export type QaCourseLevel = 'beginner' | 'intermediate' | 'advanced';

export const QA_COURSE_LEVEL_LABEL: Record<QaCourseLevel, string> = {
  beginner: 'Pemula',
  intermediate: 'Menengah',
  advanced: 'Lanjutan',
};

/** A lesson: one QA Library article, referenced by id (survives slug renames). */
export interface QaCourseArticleItem {
  id: string;
  kind: 'article';
  articleId: string;
}

/** A practice mission: one phase of a QA Simulator project. */
export interface QaCourseMissionItem {
  id: string;
  kind: 'mission';
  projectId: string;
  phaseId: string;
}

export type QaCourseItem = QaCourseArticleItem | QaCourseMissionItem;

export interface QaCourseModule {
  id: string;
  title: string;
  /** Short bridge text shown above the module's items. */
  intro?: string;
  items: QaCourseItem[];
}

export interface QaCourseData {
  title: string;
  description: string;
  level: QaCourseLevel;
  estimatedHours: number;
  thumbnailUrl?: string;
  status: QaCourseStatus;
  modules: QaCourseModule[];
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoOgImage?: string;
}

export interface QaCourse extends QaCourseData {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface QaCourseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: QaCourseLevel;
  estimatedHours: number;
  thumbnailUrl?: string;
  status: QaCourseStatus;
  moduleCount: number;
  articleCount: number;
  missionCount: number;
  updatedAt: string;
}

/**
 * Article facts the public course page needs, resolved server-side so the
 * client doesn't fetch every article. `available: false` = the article was
 * deleted or unpublished after the course was built.
 */
export interface QaCourseArticleRef {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readingTimeMinutes: number;
  available: boolean;
}

/** GET /api/qa-courses/:slug — the course plus its resolved articles. */
export interface QaCourseDetail extends QaCourse {
  articles: Record<string, QaCourseArticleRef>;
}

/** GET /api/qa-courses?article=<id> — published courses that use an article. */
export interface QaCourseMembership {
  slug: string;
  title: string;
  /** 1-based lesson position of the article in that course. */
  lessonNumber: number;
  totalLessons: number;
}

/**
 * A course that practices on a given simulator project, plus one learner's
 * article progress in it. Mission completion is derived client-side from the
 * same learner's simulator progress (project content is static JSON).
 */
export interface QaCourseWithProgress {
  course: QaCourseDetail;
  completedArticleIds: string[];
  /** Latest article completion time, for the "Lulus" date. */
  lastCompletedAt: string | null;
}

/**
 * One learner who started a course, for the admin "Peserta" view. No email:
 * the admin only needs a name to recognise someone. Mission status is derived
 * client-side from `simulator` (keyed by projectId).
 */
export interface QaCourseLearner {
  key: string;
  name: string;
  avatarUrl?: string;
  completedArticleIds: string[];
  lastActiveAt: string | null;
  /** Raw simulator progress (ProjectProgress) per projectId used by the course. */
  simulator: Record<string, unknown>;
  /** Projects of this course whose portfolio share link is on. */
  sharedProjectIds: string[];
}

/** GET /api/qa-courses/:slug/progress — articles the user marked done. */
export interface QaCourseProgress {
  courseId: string;
  completedArticleIds: string[];
}
