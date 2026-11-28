// Canonical types for the QA Library (articles) feature.
// Shared by the public /qa-library pages, the admin dashboard, and the /api functions.
// Named QaLibrary* (not Article*) to avoid colliding with ArticleEntry in
// src/types/portfolio.ts, an unrelated link-preview card type.
import type { QaCourseMembership } from './qaCourse.js';

export interface QaLibraryCategory {
  id: string;
  label: string;
  description?: string;
}

export interface QaLibraryCategoriesDocument {
  categories: QaLibraryCategory[];
  updatedAt?: string;
}

export type QaLibraryArticleStatus = 'draft' | 'published';

// 'course-only' articles are hidden from the public library grid/list but
// stay readable at /qa-library/:slug, so a QA Course can use them as lessons.
export type QaLibraryArticleVisibility = 'library' | 'course-only';

export interface QaLibraryArticleData {
  title: string;
  categoryId: string;
  excerpt: string;
  body: string; // markdown source
  thumbnailUrl?: string;
  docUrl?: string;
  docFilename?: string;
  docSizeBytes?: number;
  tags: string[];
  authorName: string;
  // Optional ref/snapshot into the `users` table — set when the author is
  // picked via the registered-user lookup in the admin form. authorName
  // stays the source of truth for display (also covers authors who aren't
  // registered users), authorUserId/authorAvatarUrl are a point-in-time
  // snapshot taken at save time, not a live join.
  authorUserId?: string;
  authorAvatarUrl?: string;
  status: QaLibraryArticleStatus;
  /** Absent on articles saved before courses shipped = 'library'. */
  visibility?: QaLibraryArticleVisibility;
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  seoOgImage?: string;
}

export interface QaLibraryArticle extends QaLibraryArticleData {
  id: string;
  slug: string;
  readingTimeMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  /**
   * Set by the public API when it sent only the top of a course-only article
   * (see src/lib/articlePreview.ts): `body` is the preview, the attachment is
   * withheld, and the reader is sent to one of `courses` for the rest.
   */
  preview?: QaLibraryArticlePreview;
}

export interface QaLibraryArticlePreview {
  /** H2 headings below the cut, in order. */
  lockedHeadings: string[];
  /** Preview words / article words, 0..1. */
  previewWordRatio: number;
  /** Published courses using the article, oldest first (the first is the main CTA). */
  courses: QaCourseMembership[];
  /** The article had an attachment, withheld with the rest. */
  hasAttachment: boolean;
}

/** The course a course-only article in the public grid belongs to (oldest published). */
export interface QaLibraryArticleCourseRef {
  slug: string;
  title: string;
}

// Lightweight row for list views (admin table, public grid) — excludes body/doc metadata.
export type QaLibraryArticleSummary = Pick<
  QaLibraryArticle,
  | 'id' | 'slug' | 'title' | 'categoryId' | 'excerpt' | 'thumbnailUrl' | 'tags' | 'status' | 'readingTimeMinutes'
  | 'authorName' | 'authorAvatarUrl' | 'updatedAt' | 'visibility'
> & {
  /** Public list only: set on course-only rows, which show as a course preview. */
  course?: QaLibraryArticleCourseRef;
};
