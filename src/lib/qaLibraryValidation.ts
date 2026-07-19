// Structural validators for the QA Library (articles) feature — categories
// and article records. Used by both the admin dashboard (client-side
// pre-save check) and the /api/admin-config/qa-library-categories,
// /api/qa-library serverless functions (server-side write validation).
// Keep this file free of browser-only imports — it is bundled into the API.

import type { QaLibraryArticleData, QaLibraryArticleStatus, QaLibraryCategory } from '../types/qaLibrary.js';
import { isValidSlug } from './portfolioValidation.js';

const ARTICLE_STATUSES: readonly QaLibraryArticleStatus[] = ['draft', 'published'];
const WORDS_PER_MINUTE = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export type QaLibraryCategoriesValidationResult =
  | { ok: true; categories: QaLibraryCategory[] }
  | { ok: false; errors: string[] };

export function validateQaLibraryCategories(data: unknown): QaLibraryCategoriesValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  const ids = new Set<string>();
  if (!Array.isArray(data.categories)) {
    errors.push('categories: wajib array.');
  } else {
    data.categories.forEach((category, i) => {
      if (!isRecord(category)) {
        errors.push(`categories[${i}]: harus objek.`);
        return;
      }
      if (!isNonEmptyString(category.id)) {
        errors.push(`categories[${i}].id: wajib string non-kosong.`);
      } else if (!isValidSlug(category.id)) {
        errors.push(`categories[${i}].id: harus slug lowercase (a-z, 0-9, tanda hubung).`);
      } else if (ids.has(category.id)) {
        errors.push(`categories[${i}].id: duplikat "${category.id}".`);
      } else {
        ids.add(category.id);
      }
      if (!isNonEmptyString(category.label)) errors.push(`categories[${i}].label: wajib string non-kosong.`);
      if (category.description !== undefined && typeof category.description !== 'string') {
        errors.push(`categories[${i}].description: harus string.`);
      }
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, categories: data.categories as QaLibraryCategory[] };
}

// Word count / WORDS_PER_MINUTE, min 1 — server-authoritative (recomputed on
// every write, ignoring any client-sent value), also reused client-side for
// a live "~4 min read" preview label in the article form.
export function computeReadingTimeMinutes(body: string): number {
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

export type QaLibraryArticleValidationResult =
  | { ok: true; article: QaLibraryArticleData }
  | { ok: false; errors: string[] };

export function validateQaLibraryArticleData(data: unknown, validCategoryIds: Set<string>): QaLibraryArticleValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  if (!isNonEmptyString(data.title)) errors.push('title: wajib string non-kosong.');
  if (!isNonEmptyString(data.categoryId) || !validCategoryIds.has(data.categoryId as string)) {
    errors.push('categoryId: category id tidak ditemukan.');
  }
  if (!isNonEmptyString(data.excerpt)) errors.push('excerpt: wajib string non-kosong.');
  if (!isNonEmptyString(data.body)) errors.push('body: wajib string non-kosong.');
  if (data.thumbnailUrl !== undefined && typeof data.thumbnailUrl !== 'string') errors.push('thumbnailUrl: harus string.');
  if (data.docUrl !== undefined && typeof data.docUrl !== 'string') errors.push('docUrl: harus string.');
  if (data.docFilename !== undefined && typeof data.docFilename !== 'string') errors.push('docFilename: harus string.');
  if (data.docSizeBytes !== undefined && (typeof data.docSizeBytes !== 'number' || data.docSizeBytes < 0)) {
    errors.push('docSizeBytes: harus angka >= 0.');
  }
  if (!Array.isArray(data.tags) || data.tags.some((t) => typeof t !== 'string' || !t.trim())) {
    errors.push('tags: harus array string non-kosong.');
  }
  if (!isNonEmptyString(data.authorName)) errors.push('authorName: wajib string non-kosong.');
  if (data.authorUserId !== undefined && typeof data.authorUserId !== 'string') errors.push('authorUserId: harus string.');
  if (data.authorAvatarUrl !== undefined && typeof data.authorAvatarUrl !== 'string') errors.push('authorAvatarUrl: harus string.');
  if (typeof data.status !== 'string' || !ARTICLE_STATUSES.includes(data.status as QaLibraryArticleStatus)) {
    errors.push(`status: wajib salah satu dari ${ARTICLE_STATUSES.join(', ')}.`);
  }
  if (data.seoMetaTitle !== undefined && typeof data.seoMetaTitle !== 'string') errors.push('seoMetaTitle: harus string.');
  if (data.seoMetaDescription !== undefined && typeof data.seoMetaDescription !== 'string') errors.push('seoMetaDescription: harus string.');
  if (data.seoOgImage !== undefined && typeof data.seoOgImage !== 'string') errors.push('seoOgImage: harus string.');

  // Publish-time rule: a published article must have a thumbnail (public
  // grid/detail pages assume one), checked here so both client pre-save and
  // server write enforce it identically.
  if (data.status === 'published' && !isNonEmptyString(data.thumbnailUrl)) {
    errors.push('thumbnailUrl: wajib diisi saat status "published".');
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, article: data as unknown as QaLibraryArticleData };
}
