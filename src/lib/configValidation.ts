// Structural validators for the mentoring config resources — topics, mentors, booking-rules.
// Used by both the admin dashboard (client-side pre-save check) and the
// /api/topics, /api/mentors, /api/booking-rules serverless functions (server-side write validation).
// Keep this file free of browser-only imports — it is bundled into the API.

import type {
  BookingConfig, BookingRules, BookingStatus, MentoringConfig, MentorConfig, MentorEmploymentType, TopicConfig,
} from '../types/mentoring';
import { WEEKDAYS } from '../types/mentoring.js';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const WHATSAPP_RE = /^\d{8,15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MENTOR_EMPLOYMENT_TYPES: readonly MentorEmploymentType[] = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const BOOKING_STATUSES: readonly BookingStatus[] = ['booked', 'confirmed', 'completed', 'canceled'];
// Statuses that occupy a mentor's slot — canceled frees it up for reuse.
const OCCUPYING_STATUSES: readonly BookingStatus[] = ['booked', 'confirmed', 'completed'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export type TopicsValidationResult =
  | { ok: true; topics: TopicConfig[] }
  | { ok: false; errors: string[] };

export function validateTopics(data: unknown): TopicsValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

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
      if (topic.updatedAt !== undefined && typeof topic.updatedAt !== 'string') errors.push(`topics[${i}].updatedAt: harus string.`);
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, topics: data.topics as TopicConfig[] };
}

function validateMentorWorkExperience(workExperience: unknown, errors: string[]): void {
  if (!Array.isArray(workExperience)) {
    errors.push('workExperience: harus array.');
    return;
  }
  workExperience.forEach((entry, i) => {
    const prefix = `workExperience[${i}]`;
    if (!isRecord(entry)) { errors.push(`${prefix}: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`${prefix}.id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.company)) errors.push(`${prefix}.company: wajib string non-kosong.`);
    if (entry.companyLogo !== undefined && typeof entry.companyLogo !== 'string') errors.push(`${prefix}.companyLogo: harus string.`);
    if (!isNonEmptyString(entry.position)) errors.push(`${prefix}.position: wajib string non-kosong.`);
    if (entry.employmentType !== undefined && !MENTOR_EMPLOYMENT_TYPES.includes(entry.employmentType as MentorEmploymentType)) {
      errors.push(`${prefix}.employmentType: wajib salah satu dari ${MENTOR_EMPLOYMENT_TYPES.join(', ')}.`);
    }
    if (!isNonEmptyString(entry.startDate) || !MONTH_RE.test(entry.startDate as string)) {
      errors.push(`${prefix}.startDate: wajib format YYYY-MM.`);
    }
    if (typeof entry.isCurrent !== 'boolean') errors.push(`${prefix}.isCurrent: wajib boolean.`);
    if (entry.isCurrent === false) {
      if (!isNonEmptyString(entry.endDate) || !MONTH_RE.test(entry.endDate as string)) {
        errors.push(`${prefix}.endDate: wajib format YYYY-MM saat isCurrent false.`);
      }
    } else if (entry.endDate !== undefined && entry.endDate !== '') {
      errors.push(`${prefix}.endDate: harus kosong saat isCurrent true.`);
    }
  });
}

export type MentorDataValidationResult =
  | { ok: true; mentor: Omit<MentorConfig, 'id' | 'updatedAt'> }
  | { ok: false; errors: string[] };

export function isValidMentorId(id: string): boolean {
  return SLUG_RE.test(id);
}

// Single-mentor validator — mentors is a real per-row table (see
// api/_lib/mentorStore.ts), so there's no whole-array shape to validate
// anymore. validTopicIds cross-checks mentor.expertise against the topics
// resource — the one place the split APIs still depend on each other.
export function validateMentorData(data: unknown, validTopicIds: Set<string>): MentorDataValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  if (!isNonEmptyString(data.name)) errors.push('name: wajib string non-kosong.');
  if (!isNonEmptyString(data.whatsapp) || !WHATSAPP_RE.test(data.whatsapp as string)) {
    errors.push('whatsapp: wajib 8-15 digit angka (format internasional tanpa +).');
  }
  if (!isNonEmptyString(data.bio)) errors.push('bio: wajib string non-kosong.');
  if (data.detailProfile !== undefined && typeof data.detailProfile !== 'string') {
    errors.push('detailProfile: harus string.');
  }
  if (data.avatar !== undefined && typeof data.avatar !== 'string') errors.push('avatar: harus string.');
  if (data.workExperience !== undefined) validateMentorWorkExperience(data.workExperience, errors);
  if (!Array.isArray(data.expertise) || data.expertise.length === 0) {
    errors.push('expertise: wajib array topic id non-kosong.');
  } else {
    data.expertise.forEach((topicId) => {
      if (typeof topicId !== 'string' || !validTopicIds.has(topicId)) {
        errors.push(`expertise: topic id "${String(topicId)}" tidak ada di topics.`);
      }
    });
  }
  if (data.platforms !== undefined) {
    if (!isRecord(data.platforms)) {
      errors.push('platforms: harus objek.');
    } else {
      for (const key of ['digitalSkola', 'dealls'] as const) {
        if (data.platforms[key] !== undefined && typeof data.platforms[key] !== 'boolean') {
          errors.push(`platforms.${key}: harus boolean.`);
        }
      }
    }
  }
  if (!isRecord(data.schedule)) {
    errors.push('schedule: wajib objek hari → jam.');
  } else {
    for (const [day, slots] of Object.entries(data.schedule)) {
      if (!(WEEKDAYS as readonly string[]).includes(day)) {
        errors.push(`schedule: hari "${day}" tidak valid.`);
        continue;
      }
      if (!Array.isArray(slots)) {
        errors.push(`schedule.${day}: harus array jam.`);
        continue;
      }
      slots.forEach((slot) => {
        if (typeof slot !== 'string' || !TIME_RE.test(slot)) {
          errors.push(`schedule.${day}: slot "${String(slot)}" harus format HH:MM.`);
        }
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    mentor: {
      name: data.name as string,
      whatsapp: data.whatsapp as string,
      bio: data.bio as string,
      detailProfile: data.detailProfile as string | undefined,
      avatar: data.avatar as string | undefined,
      workExperience: data.workExperience as MentorConfig['workExperience'],
      expertise: data.expertise as string[],
      platforms: data.platforms as MentorConfig['platforms'],
      schedule: data.schedule as MentorConfig['schedule'],
    },
  };
}

export type ReviewDecisionValidationResult =
  | { ok: true; decision: 'verified' | 'rejected'; rejectionReason: string | null }
  | { ok: false; errors: string[] };

export function validateReviewDecision(data: unknown): ReviewDecisionValidationResult {
  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  if (data.decision !== 'verified' && data.decision !== 'rejected') {
    return { ok: false, errors: ['decision: wajib "verified" atau "rejected".'] };
  }
  if (data.decision === 'rejected' && !isNonEmptyString(data.rejectionReason)) {
    return { ok: false, errors: ['rejectionReason: wajib diisi saat menolak mentor.'] };
  }

  return {
    ok: true,
    decision: data.decision,
    rejectionReason: data.decision === 'rejected' ? (data.rejectionReason as string) : null,
  };
}

export type BookingRulesValidationResult =
  | { ok: true; metadata: MentoringConfig['metadata']; availableDays: string[]; bookingRules: BookingRules }
  | { ok: false; errors: string[] };

export function validateBookingRules(data: unknown): BookingRulesValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  const metadata = data.metadata;
  if (!isRecord(metadata)) {
    errors.push('metadata: wajib berupa objek.');
  } else {
    for (const key of ['timezone', 'timezone_abbr', 'version'] as const) {
      if (!isNonEmptyString(metadata[key])) errors.push(`metadata.${key}: wajib string non-kosong.`);
    }
  }

  if (!Array.isArray(data.availableDays) || data.availableDays.length === 0) {
    errors.push('availableDays: wajib array non-kosong.');
  } else {
    data.availableDays.forEach((day) => {
      if (typeof day !== 'string' || !(WEEKDAYS as readonly string[]).includes(day)) {
        errors.push(`availableDays: hari "${String(day)}" tidak valid.`);
      }
    });
  }

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
  return {
    ok: true,
    metadata: metadata as MentoringConfig['metadata'],
    availableDays: data.availableDays as string[],
    bookingRules: rules as unknown as BookingRules,
  };
}

export type BookingsValidationResult =
  | { ok: true; bookings: BookingConfig[] }
  | { ok: false; errors: string[] };

// validMentorIds/validTopicIds cross-check against the mentors/topics resources.
export function validateBookings(
  data: unknown,
  validMentorIds: Set<string>,
  validTopicIds: Set<string>
): BookingsValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  if (!Array.isArray(data.bookings)) {
    errors.push('bookings: wajib array.');
    return { ok: false, errors };
  }

  const bookingIds = new Set<string>();
  // mentorId|date|time -> booking index, tracked only for occupying statuses.
  const occupiedSlots = new Map<string, number>();

  data.bookings.forEach((booking, i) => {
    if (!isRecord(booking)) {
      errors.push(`bookings[${i}]: harus objek.`);
      return;
    }
    if (!isNonEmptyString(booking.id)) {
      errors.push(`bookings[${i}].id: wajib string non-kosong.`);
    } else if (bookingIds.has(booking.id)) {
      errors.push(`bookings[${i}].id: duplikat "${booking.id}".`);
    } else {
      bookingIds.add(booking.id);
    }
    if (!isNonEmptyString(booking.menteeName)) errors.push(`bookings[${i}].menteeName: wajib string non-kosong.`);
    if (!isNonEmptyString(booking.menteeEmail) || !EMAIL_RE.test(booking.menteeEmail as string)) {
      errors.push(`bookings[${i}].menteeEmail: wajib email valid.`);
    }
    if (!isNonEmptyString(booking.menteeWhatsapp) || !WHATSAPP_RE.test(booking.menteeWhatsapp as string)) {
      errors.push(`bookings[${i}].menteeWhatsapp: wajib 8-15 digit angka (format internasional tanpa +).`);
    }
    if (!Array.isArray(booking.topics) || booking.topics.length === 0) {
      errors.push(`bookings[${i}].topics: wajib array topic id non-kosong.`);
    } else {
      booking.topics.forEach((topicId) => {
        if (typeof topicId !== 'string' || !validTopicIds.has(topicId)) {
          errors.push(`bookings[${i}].topics: topic id "${String(topicId)}" tidak ada di topics.`);
        }
      });
    }
    if (!isNonEmptyString(booking.mentorId) || !validMentorIds.has(booking.mentorId as string)) {
      errors.push(`bookings[${i}].mentorId: mentor id tidak ditemukan.`);
    }
    if (!isNonEmptyString(booking.date) || !DATE_RE.test(booking.date as string)) {
      errors.push(`bookings[${i}].date: wajib format YYYY-MM-DD.`);
    }
    if (!isNonEmptyString(booking.time) || !TIME_RE.test(booking.time as string)) {
      errors.push(`bookings[${i}].time: wajib format HH:MM.`);
    }
    if (!isNonEmptyString(booking.notes)) errors.push(`bookings[${i}].notes: wajib string non-kosong.`);
    if (typeof booking.status !== 'string' || !BOOKING_STATUSES.includes(booking.status as BookingStatus)) {
      errors.push(`bookings[${i}].status: wajib salah satu dari ${BOOKING_STATUSES.join(', ')}.`);
    }
    if (!isNonEmptyString(booking.createdAt)) errors.push(`bookings[${i}].createdAt: wajib string non-kosong.`);
    if (!isNonEmptyString(booking.updatedAt)) errors.push(`bookings[${i}].updatedAt: wajib string non-kosong.`);

    if (
      isNonEmptyString(booking.mentorId) &&
      isNonEmptyString(booking.date) &&
      isNonEmptyString(booking.time) &&
      typeof booking.status === 'string' &&
      OCCUPYING_STATUSES.includes(booking.status as BookingStatus)
    ) {
      const key = `${booking.mentorId}|${booking.date}|${booking.time}`;
      if (occupiedSlots.has(key)) {
        errors.push(`bookings[${i}]: bentrok jadwal dengan bookings[${occupiedSlots.get(key)}] (mentor, tanggal, jam sama).`);
      } else {
        occupiedSlots.set(key, i);
      }
    }
  });

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, bookings: data.bookings as BookingConfig[] };
}
