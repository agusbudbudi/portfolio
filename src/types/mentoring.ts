// Canonical types for the QA mentoring config document.
// Shared by the public site (useConfig), the admin dashboard, and the /api functions.

export interface TopicConfig {
  id: string;
  label: string;
  description: string;
  image?: string;
  popular?: boolean;
  materials?: string[];
  updatedAt?: string;
}

export interface MentorPlatforms {
  digitalSkola?: boolean;
  dealls?: boolean;
}

export type MentorEmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

export interface MentorWorkExperienceEntry {
  id: string;
  company: string;
  companyLogo?: string;
  position: string;
  employmentType?: MentorEmploymentType;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM, absent when isCurrent
  isCurrent: boolean;
}

export type MentorVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface MentorConfig {
  id: string;
  name: string;
  whatsapp: string;
  expertise: string[];
  bio: string;
  detailProfile?: string;
  avatar?: string;
  workExperience?: MentorWorkExperienceEntry[];
  schedule: Record<string, string[]>;
  platforms?: MentorPlatforms;
  updatedAt?: string;
  // Optional (not required) even though every DB row always has these —
  // keeps MentorForm.tsx's local draft-state literal valid without needing
  // dummy values, same reasoning as `updatedAt?` above.
  userId?: string;
  verificationStatus?: MentorVerificationStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface BookingRules {
  minIntroductionLength: number;
  maxTopicsSelectable: number;
  sessionDurationMinutes: number;
  daysInAdvanceMin: number;
  daysInAdvanceMax: number;
}

export interface MentoringConfig {
  metadata: {
    timezone: string;
    timezone_abbr: string;
    version: string;
    updatedAt?: string;
  };
  topics: TopicConfig[];
  mentors: MentorConfig[];
  availableDays: string[];
  bookingRules: BookingRules;
}

// Per-resource API document shapes — /api/topics, /api/mentors, /api/booking-rules.
// Each is stored, validated, and saved independently of the others.
export interface TopicsDocument {
  topics: TopicConfig[];
  updatedAt?: string;
}

export interface MentorsDocument {
  mentors: MentorConfig[];
  updatedAt?: string;
}

export interface BookingRulesDocument {
  metadata: MentoringConfig['metadata'];
  availableDays: string[];
  bookingRules: BookingRules;
  updatedAt?: string;
}

// Booking record — created either by an admin (BookingsTab) or self-serve by
// a logged-in mentee (api/bookings/mine.ts). Status is a one-way state
// machine advanced by explicit admin actions:
//   booked -> confirmed -> completed
//   booked | confirmed -> canceled
export type BookingStatus = 'booked' | 'confirmed' | 'completed' | 'canceled';

export interface BookingConfig {
  id: string;
  menteeName: string;
  menteeEmail: string;
  menteeWhatsapp: string;
  topics: string[]; // topic ids, ref TopicConfig
  mentorId: string; // ref MentorConfig
  date: string; // YYYY-MM-DD
  time: string; // "HH:MM" session start
  notes: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  // Set for self-serve bookings created by a logged-in mentee; undefined for
  // admin-created bookings (no owning account).
  menteeUserId?: string;
}

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
