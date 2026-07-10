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

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
