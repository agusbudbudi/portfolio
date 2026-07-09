// Structural validator for the mentoring config document.
// Used by both the admin dashboard (client-side pre-save check) and
// the /api/config serverless function (server-side write validation).
// Keep this file free of browser-only imports — it is bundled into the API.

import type { MentoringConfig } from '../types/mentoring';
import { WEEKDAYS } from '../types/mentoring';

export type ValidationResult =
  | { ok: true; config: MentoringConfig }
  | { ok: false; errors: string[] };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const WHATSAPP_RE = /^\d{8,15}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function validateMentoringConfig(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { ok: false, errors: ['Config harus berupa objek JSON.'] };
  }

  // metadata
  const metadata = data.metadata;
  if (!isRecord(metadata)) {
    errors.push('metadata: wajib berupa objek.');
  } else {
    for (const key of ['timezone', 'timezone_abbr', 'version'] as const) {
      if (!isNonEmptyString(metadata[key])) errors.push(`metadata.${key}: wajib string non-kosong.`);
    }
    if (metadata.updatedAt !== undefined && typeof metadata.updatedAt !== 'string') {
      errors.push('metadata.updatedAt: harus string ISO date.');
    }
  }

  // topics
  const topicIds = new Set<string>();
  if (!Array.isArray(data.topics) || data.topics.length === 0) {
    errors.push('topics: wajib array non-kosong.');
  } else {
    data.topics.forEach((topic, i) => {
      if (!isRecord(topic)) {
        errors.push(`topics[${i}]: harus objek.`);
        return;
      }
      if (!isNonEmptyString(topic.id)) {
        errors.push(`topics[${i}].id: wajib string non-kosong.`);
      } else if (!SLUG_RE.test(topic.id)) {
        errors.push(`topics[${i}].id: harus slug lowercase (a-z, 0-9, tanda hubung).`);
      } else if (topicIds.has(topic.id)) {
        errors.push(`topics[${i}].id: duplikat "${topic.id}".`);
      } else {
        topicIds.add(topic.id);
      }
      if (!isNonEmptyString(topic.label)) errors.push(`topics[${i}].label: wajib string non-kosong.`);
      if (!isNonEmptyString(topic.description)) errors.push(`topics[${i}].description: wajib string non-kosong.`);
      if (topic.image !== undefined && typeof topic.image !== 'string') errors.push(`topics[${i}].image: harus string URL.`);
      if (topic.popular !== undefined && typeof topic.popular !== 'boolean') errors.push(`topics[${i}].popular: harus boolean.`);
      if (topic.materials !== undefined) {
        if (!Array.isArray(topic.materials) || topic.materials.some((m) => typeof m !== 'string' || !m.trim())) {
          errors.push(`topics[${i}].materials: harus array string non-kosong.`);
        }
      }
    });
  }

  // mentors
  const mentorIds = new Set<string>();
  if (!Array.isArray(data.mentors) || data.mentors.length === 0) {
    errors.push('mentors: wajib array non-kosong.');
  } else {
    data.mentors.forEach((mentor, i) => {
      if (!isRecord(mentor)) {
        errors.push(`mentors[${i}]: harus objek.`);
        return;
      }
      if (!isNonEmptyString(mentor.id)) {
        errors.push(`mentors[${i}].id: wajib string non-kosong.`);
      } else if (mentorIds.has(mentor.id)) {
        errors.push(`mentors[${i}].id: duplikat "${mentor.id}".`);
      } else {
        mentorIds.add(mentor.id);
      }
      if (!isNonEmptyString(mentor.name)) errors.push(`mentors[${i}].name: wajib string non-kosong.`);
      if (!isNonEmptyString(mentor.whatsapp) || !WHATSAPP_RE.test(mentor.whatsapp as string)) {
        errors.push(`mentors[${i}].whatsapp: wajib 8-15 digit angka (format internasional tanpa +).`);
      }
      if (!isNonEmptyString(mentor.bio)) errors.push(`mentors[${i}].bio: wajib string non-kosong.`);
      if (mentor.avatar !== undefined && typeof mentor.avatar !== 'string') errors.push(`mentors[${i}].avatar: harus string.`);
      if (!Array.isArray(mentor.expertise) || mentor.expertise.length === 0) {
        errors.push(`mentors[${i}].expertise: wajib array topic id non-kosong.`);
      } else {
        mentor.expertise.forEach((topicId) => {
          if (typeof topicId !== 'string' || !topicIds.has(topicId)) {
            errors.push(`mentors[${i}].expertise: topic id "${String(topicId)}" tidak ada di topics.`);
          }
        });
      }
      if (mentor.platforms !== undefined) {
        if (!isRecord(mentor.platforms)) {
          errors.push(`mentors[${i}].platforms: harus objek.`);
        } else {
          for (const key of ['digitalSkola', 'dealls'] as const) {
            if (mentor.platforms[key] !== undefined && typeof mentor.platforms[key] !== 'boolean') {
              errors.push(`mentors[${i}].platforms.${key}: harus boolean.`);
            }
          }
        }
      }
      if (!isRecord(mentor.schedule)) {
        errors.push(`mentors[${i}].schedule: wajib objek hari → jam.`);
      } else {
        for (const [day, slots] of Object.entries(mentor.schedule)) {
          if (!(WEEKDAYS as readonly string[]).includes(day)) {
            errors.push(`mentors[${i}].schedule: hari "${day}" tidak valid.`);
            continue;
          }
          if (!Array.isArray(slots)) {
            errors.push(`mentors[${i}].schedule.${day}: harus array jam.`);
            continue;
          }
          slots.forEach((slot) => {
            if (typeof slot !== 'string' || !TIME_RE.test(slot)) {
              errors.push(`mentors[${i}].schedule.${day}: slot "${String(slot)}" harus format HH:MM.`);
            }
          });
        }
      }
    });
  }

  // availableDays
  if (!Array.isArray(data.availableDays) || data.availableDays.length === 0) {
    errors.push('availableDays: wajib array non-kosong.');
  } else {
    data.availableDays.forEach((day) => {
      if (typeof day !== 'string' || !(WEEKDAYS as readonly string[]).includes(day)) {
        errors.push(`availableDays: hari "${String(day)}" tidak valid.`);
      }
    });
  }

  // bookingRules
  const rules = data.bookingRules;
  if (!isRecord(rules)) {
    errors.push('bookingRules: wajib berupa objek.');
  } else {
    for (const key of [
      'minIntroductionLength',
      'maxTopicsSelectable',
      'sessionDurationMinutes',
      'daysInAdvanceMin',
      'daysInAdvanceMax',
    ] as const) {
      if (!isPositiveInt(rules[key])) errors.push(`bookingRules.${key}: wajib bilangan bulat positif.`);
    }
    if (
      isPositiveInt(rules.daysInAdvanceMin) &&
      isPositiveInt(rules.daysInAdvanceMax) &&
      rules.daysInAdvanceMin > rules.daysInAdvanceMax
    ) {
      errors.push('bookingRules: daysInAdvanceMin tidak boleh lebih besar dari daysInAdvanceMax.');
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, config: data as unknown as MentoringConfig };
}
