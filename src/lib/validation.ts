// Form validation logic for QA Mentoring Booking

export interface FormData {
  date: string;
  topics: string[];
  mentorId: string;
  time: string;
  introduction: string;
}

export interface ValidationErrors {
  date: string | null;
  topics: string | null;
  mentorId: string | null;
  time: string | null;
  introduction: string | null;
}

const MAX_INTRODUCTION_LENGTH = 2000;

/**
 * Validates all form fields and returns a map of field → error message (null if valid).
 */
export function validateForm(data: FormData): ValidationErrors {
  const errors: ValidationErrors = {
    date: null,
    topics: null,
    mentorId: null,
    time: null,
    introduction: null,
  };

  // Date
  if (!data.date) {
    errors.date = 'Tanggal harus dipilih';
  }

  // Topics
  if (!data.topics || data.topics.length === 0) {
    errors.topics = 'Minimal pilih 1 topik';
  } else if (data.topics.length > 2) {
    errors.topics = 'Maksimal 2 topik dapat dipilih';
  }

  // Mentor
  if (!data.mentorId) {
    errors.mentorId = 'Mentor harus dipilih untuk melanjutkan';
  }

  // Time
  if (!data.time) {
    errors.time = 'Waktu harus dipilih';
  }

  // Introduction
  const trimmed = (data.introduction || '').trim();
  if (!trimmed) {
    errors.introduction = 'Deskripsi tidak boleh kosong';
  } else if (trimmed.length > MAX_INTRODUCTION_LENGTH) {
    errors.introduction = `Deskripsi terlalu panjang (maksimal ${MAX_INTRODUCTION_LENGTH} karakter)`;
  }

  return errors;
}

/** Returns true if a ValidationErrors object has no errors */
export function isFormValid(errors: ValidationErrors): boolean {
  return Object.values(errors).every((v) => v === null);
}

/** Returns a flat list of error messages for display in an error banner */
export function getErrorMessages(errors: ValidationErrors): string[] {
  return Object.values(errors).filter((v): v is string => v !== null);
}
