// Date calculation helpers for QA Mentoring Booking

export type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAY_MAP: Record<number, DayName> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

const INDONESIAN_DAYS: Record<DayName, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

const INDONESIAN_MONTHS: Record<number, string> = {
  0: 'Januari',
  1: 'Februari',
  2: 'Maret',
  3: 'April',
  4: 'Mei',
  5: 'Juni',
  6: 'Juli',
  7: 'Agustus',
  8: 'September',
  9: 'Oktober',
  10: 'November',
  11: 'Desember',
};

/** Returns lowercase weekday name for a given Date */
export function getDayName(date: Date): DayName {
  return DAY_MAP[date.getDay()];
}

/** Formats a Date to "YYYY-MM-DD" string */
export function formatDateId(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses "YYYY-MM-DD" string to Date (local timezone) */
export function parseDateId(dateId: string): Date {
  const [year, month, day] = dateId.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Formats a Date to Indonesian display label, e.g. "Senin, 01 Juli 2026" */
export function formatDateLabel(date: Date): string {
  const dayName = INDONESIAN_DAYS[getDayName(date)];
  const day = String(date.getDate()).padStart(2, '0');
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

/** Formats a Date to Indonesian display for WhatsApp message */
export function formatDateForWhatsApp(date: Date): string {
  const dayName = INDONESIAN_DAYS[getDayName(date)];
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

interface MentorSchedule {
  [day: string]: string[];
}

interface Mentor {
  id: string;
  schedule: MentorSchedule;
}

/**
 * Returns list of available date IDs (YYYY-MM-DD) within the booking window.
 * Only includes dates where at least one mentor is available.
 */
export function getAvailableDates(
  availableDays: string[],
  mentors: Mentor[],
  daysInAdvanceMin: number,
  daysInAdvanceMax: number
): string[] {
  const result: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = daysInAdvanceMin; i <= daysInAdvanceMax; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayName = getDayName(date);
    if (!availableDays.includes(dayName)) continue;

    // Check if at least one mentor has slots on this day
    const hasMentor = mentors.some((m) => m.schedule[dayName] && m.schedule[dayName].length > 0);
    if (hasMentor) {
      result.push(formatDateId(date));
    }
  }

  return result;
}

/**
 * Returns the first available date ID (next date with at least one mentor).
 */
export function getNextAvailableDate(
  availableDays: string[],
  mentors: Mentor[],
  daysInAdvanceMin: number,
  daysInAdvanceMax: number
): string | null {
  const dates = getAvailableDates(availableDays, mentors, daysInAdvanceMin, daysInAdvanceMax);
  return dates.length > 0 ? dates[0] : null;
}

/**
 * Returns time slots for a mentor on a given date.
 * Each slot is formatted as "HH:MM - HH:MM WIB"
 */
export function getTimeSlotsForMentorAndDate(
  mentor: Mentor,
  dateId: string,
  sessionDurationMinutes: number
): Array<{ value: string; label: string }> {
  const date = parseDateId(dateId);
  const dayName = getDayName(date);
  const slots = mentor.schedule[dayName] || [];

  return slots.map((startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(0, 0, 0, hours, minutes + sessionDurationMinutes);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    return {
      value: startTime,
      label: `${startTime} - ${endTime} WIB`,
    };
  });
}

/** Checks if a mentor has any slots on a given date */
export function mentorHasSlotsOnDate(mentor: Mentor, dateId: string): boolean {
  const date = parseDateId(dateId);
  const dayName = getDayName(date);
  return !!(mentor.schedule[dayName] && mentor.schedule[dayName].length > 0);
}
