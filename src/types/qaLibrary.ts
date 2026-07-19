// Canonical types for the QA Library (articles) feature.
// Shared by the public /qa-library pages, the admin dashboard, and the /api functions.
// Named QaLibrary* (not Article*) to avoid colliding with ArticleEntry in
// src/types/portfolio.ts, an unrelated link-preview card type.

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
}

// Lightweight row for list views (admin table, public grid) — excludes body/doc metadata.
export type QaLibraryArticleSummary = Pick<
  QaLibraryArticle,
  | 'id' | 'slug' | 'title' | 'categoryId' | 'excerpt' | 'thumbnailUrl' | 'tags' | 'status' | 'readingTimeMinutes'
  | 'authorName' | 'authorAvatarUrl' | 'updatedAt'
>;
