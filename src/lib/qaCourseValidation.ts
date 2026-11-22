// Shared validator for QA Course writes: used by the admin form before save
// and by PUT/POST /api/qa-courses. Keep free of browser-only imports.
import type { QaCourseData, QaCourseLevel, QaCourseStatus } from '../types/qaCourse.js';

const LEVELS: readonly QaCourseLevel[] = ['beginner', 'intermediate', 'advanced'];
const STATUSES: readonly QaCourseStatus[] = ['draft', 'published'];
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const SIMULATOR_ID_RE = /^[a-z0-9-]+$/;

export const QA_COURSE_LIMITS = { modules: 20, itemsPerModule: 30 } as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export type QaCourseValidationResult = { ok: true; course: QaCourseData } | { ok: false; errors: string[] };

export function validateQaCourseData(data: unknown): QaCourseValidationResult {
  const errors: string[] = [];
  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  if (!isNonEmptyString(data.title)) errors.push('title: wajib diisi.');
  if (!isNonEmptyString(data.description)) errors.push('description: wajib diisi.');
  if (typeof data.level !== 'string' || !LEVELS.includes(data.level as QaCourseLevel)) {
    errors.push(`level: wajib salah satu dari ${LEVELS.join(', ')}.`);
  }
  if (typeof data.estimatedHours !== 'number' || !(data.estimatedHours > 0) || data.estimatedHours > 200) {
    errors.push('estimatedHours: harus angka antara 0 dan 200.');
  }
  if (typeof data.status !== 'string' || !STATUSES.includes(data.status as QaCourseStatus)) {
    errors.push(`status: wajib salah satu dari ${STATUSES.join(', ')}.`);
  }
  for (const key of ['thumbnailUrl', 'seoMetaTitle', 'seoMetaDescription', 'seoOgImage'] as const) {
    if (data[key] !== undefined && typeof data[key] !== 'string') errors.push(`${key}: harus string.`);
  }

  const itemIds = new Set<string>();
  if (!Array.isArray(data.modules)) {
    errors.push('modules: wajib array.');
  } else {
    if (data.modules.length > QA_COURSE_LIMITS.modules) errors.push(`modules: maksimal ${QA_COURSE_LIMITS.modules} modul.`);
    data.modules.forEach((mod, mi) => {
      const at = `Modul ${mi + 1}`;
      if (!isRecord(mod)) { errors.push(`${at}: harus objek.`); return; }
      if (typeof mod.id !== 'string' || !ID_RE.test(mod.id)) errors.push(`${at}: id tidak valid.`);
      if (!isNonEmptyString(mod.title)) errors.push(`${at}: judul wajib diisi.`);
      if (mod.intro !== undefined && typeof mod.intro !== 'string') errors.push(`${at}: intro harus string.`);
      if (!Array.isArray(mod.items)) { errors.push(`${at}: items wajib array.`); return; }
      if (mod.items.length === 0) errors.push(`${at}: minimal 1 item.`);
      if (mod.items.length > QA_COURSE_LIMITS.itemsPerModule) errors.push(`${at}: maksimal ${QA_COURSE_LIMITS.itemsPerModule} item.`);
      mod.items.forEach((item, ii) => {
        const iat = `${at}, item ${ii + 1}`;
        if (!isRecord(item)) { errors.push(`${iat}: harus objek.`); return; }
        if (typeof item.id !== 'string' || !ID_RE.test(item.id)) errors.push(`${iat}: id tidak valid.`);
        else if (itemIds.has(item.id)) errors.push(`${iat}: id duplikat.`);
        else itemIds.add(item.id);
        if (item.kind === 'article') {
          if (!isNonEmptyString(item.articleId)) errors.push(`${iat}: pilih artikel.`);
        } else if (item.kind === 'mission') {
          if (typeof item.projectId !== 'string' || !SIMULATOR_ID_RE.test(item.projectId)) errors.push(`${iat}: pilih project simulator.`);
          if (typeof item.phaseId !== 'string' || !SIMULATOR_ID_RE.test(item.phaseId)) errors.push(`${iat}: pilih phase simulator.`);
        } else {
          errors.push(`${iat}: kind wajib article atau mission.`);
        }
      });
    });
    if (data.status === 'published' && data.modules.length === 0) errors.push('modules: course published wajib punya minimal 1 modul.');
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, course: data as unknown as QaCourseData };
}

/** Article ids a course references, in reading order (deduped). */
export function courseArticleIds(course: Pick<QaCourseData, 'modules'>): string[] {
  const ids: string[] = [];
  for (const mod of course.modules) {
    for (const item of mod.items) {
      if (item.kind === 'article' && !ids.includes(item.articleId)) ids.push(item.articleId);
    }
  }
  return ids;
}
