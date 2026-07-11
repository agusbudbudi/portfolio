// Canonical types for the QA mentoring config document.
// Shared by the public site (useConfig), the admin dashboard, and the /api functions.

export interface TopicConfig {
  id: string;
  label: string;
  description: string;
  image?: string;
  popular?: boolean;
  materials?: string[];
}

export interface MentorPlatforms {
  digitalSkola?: boolean;
  dealls?: boolean;
}

export interface MentorConfig {
  id: string;
  name: string;
  whatsapp: string;
  expertise: string[];
  bio: string;
  detailProfile?: string;
  avatar?: string;
  schedule: Record<string, string[]>;
  platforms?: MentorPlatforms;
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

// Admin-created booking record — MVP scope is admin-only CRUD (create/edit/
// cancel), no public-facing booking persistence yet. Status is a one-way
// state machine advanced by explicit admin actions:
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
}

export interface BookingsDocument {
  bookings: BookingConfig[];
  updatedAt?: string;
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
