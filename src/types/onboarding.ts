// Shared types for the new-user onboarding + program recommendation flow.
// Used by both the API (api/_endpoints/onboarding.ts) and the UI — keep this
// file free of browser-only imports.

export type OnboardingStatus = 'pending' | 'completed' | 'skipped';

export type ProgramId = 'course' | 'simulator' | 'portfolio' | 'mentoring' | 'library';

export type PricingModel = 'free' | 'paid' | 'freemium';

/** One entry of the program catalog — priority, boost, pricing and landing
 *  page live in config so they can change (e.g. a free program going paid)
 *  without a deploy. */
export interface ProgramCatalogEntry {
  id: ProgramId;
  name: string;
  headline: string;
  /** Business priority, 1 = highest. Last tie-breaker. */
  priority: number;
  /** Added to the program's base score before answers are counted. */
  boost: number;
  pricing: { model: PricingModel; label: string };
  /** Public landing page. CTAs use the dashboard path from `programHref`
   *  in src/lib/onboarding.ts and only fall back to this (e.g. QA Library). */
  landingPath: string;
  cta: string;
  /** Inactive programs are dropped from the ranking. */
  isActive: boolean;
}

export interface OnboardingOption {
  id: string;
  label: string;
  /** Points this answer adds to each program. Missing programs count as 0. */
  weights: Partial<Record<ProgramId, number>>;
  /** Phrase used to build the "Karena kamu …" reason line. */
  reason: string;
  /** Q2/Q3 answers "own" a program — used by the tie-breakers. */
  owner?: ProgramId;
}

export interface OnboardingQuestion {
  id: 'q1' | 'q2' | 'q3' | 'q4';
  title: string;
  /** Max selections; 1 = single choice. */
  maxSelect: number;
  options: OnboardingOption[];
}

export interface OnboardingConfig {
  version: number;
  questions: OnboardingQuestion[];
  catalog: ProgramCatalogEntry[];
  /** A secondary program at rank 3 is shown only if its score is ≥ this
   *  fraction of the primary's score. */
  secondaryThreshold: number;
  updatedAt?: string;
}

/** Answers keyed by question id; every value is a list of option ids
 *  (single-choice questions hold exactly one). */
export type OnboardingAnswers = Record<OnboardingQuestion['id'], string[]>;

export interface RankedProgram {
  id: ProgramId;
  score: number;
  reason: string;
}

export interface OnboardingRecommendation {
  primary: RankedProgram;
  secondary: RankedProgram[];
  /** Remaining active programs, in rank order ("Lihat semua program"). */
  others: RankedProgram[];
  scores: Record<ProgramId, number>;
}

export interface OnboardingResultRecord {
  id: string;
  questionnaireVersion: number;
  answers: OnboardingAnswers;
  recommendation: OnboardingRecommendation;
  createdAt: string;
}

export interface OnboardingMeResponse {
  status: OnboardingStatus;
  latest: OnboardingResultRecord | null;
}
