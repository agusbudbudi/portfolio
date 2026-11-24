// Feedback Checkpoint: a bank of reusable questions, flows that order them,
// and per-learner responses. Shared by the admin UI, the learner popup and
// the /api functions — keep free of browser-only imports.

export type FeedbackQuestionType = 'scale' | 'single_choice' | 'multi_choice' | 'text' | 'rating' | 'consent';
export type FeedbackQuestionStatus = 'active' | 'archived';
export type FeedbackFlowStatus = 'draft' | 'active';
export type FeedbackResponseStatus = 'submitted' | 'skipped';

export const FEEDBACK_TYPE_LABEL: Record<FeedbackQuestionType, string> = {
  scale: 'Skala keyakinan',
  single_choice: 'Pilih satu',
  multi_choice: 'Pilih banyak',
  text: 'Isian',
  rating: 'Rating',
  consent: 'Consent',
};

/** Types an admin can create; consent is the one built-in system question. */
export const CREATABLE_FEEDBACK_TYPES: readonly FeedbackQuestionType[] = ['scale', 'single_choice', 'multi_choice', 'text', 'rating'];

/** One option of a scale level or a choice. `id` is stable: answers point at it. */
export interface FeedbackOption {
  id: string;
  label: string;
  /** Scale levels only: the rubric line under the label. */
  description?: string;
}

/** Per-type settings. Unused keys stay absent. */
export interface FeedbackQuestionConfig {
  options?: FeedbackOption[];
  /** multi_choice: how many may be picked. */
  maxSelect?: number;
  /** text: textarea instead of a one-line input. */
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
  /** rating: words under the 1 and the 5. */
  lowLabel?: string;
  highLabel?: string;
}

export interface FeedbackQuestionData {
  type: FeedbackQuestionType;
  prompt: string;
  helpText?: string;
  config: FeedbackQuestionConfig;
  status: FeedbackQuestionStatus;
}

export interface FeedbackQuestion extends FeedbackQuestionData {
  id: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Admin list row: the question plus where it is used and how often answered. */
export interface FeedbackQuestionSummary extends FeedbackQuestion {
  flowCount: number;
  answerCount: number;
}

export interface FeedbackFlowItem {
  questionId: string;
  required: boolean;
}

export interface FeedbackFlowData {
  /** Internal name, admin only. */
  name: string;
  /** Title in the popup header. */
  title: string;
  intro?: string;
  status: FeedbackFlowStatus;
  items: FeedbackFlowItem[];
  /** Append the system consent question to the review screen. */
  askConsent: boolean;
}

export interface FeedbackFlow extends FeedbackFlowData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFlowSummary extends FeedbackFlow {
  /** Course checkpoints that point at this flow. */
  usedIn: { courseSlug: string; courseTitle: string; checkpointId: string }[];
  answerCount: number;
}

/** A flow as the learner gets it: questions resolved from the bank, in order. */
export interface FeedbackFlowPublic {
  id: string;
  title: string;
  intro?: string;
  questions: (FeedbackQuestionPublic & { required: boolean })[];
}

export interface FeedbackQuestionPublic {
  id: string;
  type: FeedbackQuestionType;
  prompt: string;
  helpText?: string;
  config: FeedbackQuestionConfig;
}

/** Answer per questionId: option id (scale/single), option ids (multi), text, 1-5 (rating), boolean (consent). */
export type FeedbackAnswerValue = string | string[] | number | boolean;
export type FeedbackAnswers = Record<string, FeedbackAnswerValue>;

export type FeedbackContextType = 'course' | 'simulator';

/** A learner's saved state for one checkpoint. */
export interface FeedbackCheckpointState {
  status: FeedbackResponseStatus;
  answers: FeedbackAnswers;
  updatedAt: string;
}

/** POST /api/feedback/responses */
export interface FeedbackResponseInput {
  contextType: FeedbackContextType;
  /** Course slug for contextType 'course'. */
  contextId: string;
  checkpointId: string;
  status: FeedbackResponseStatus;
  answers?: FeedbackAnswers;
  /** submitted only: visible time from the first question to Kirim, in ms. */
  durationMs?: number;
}

/** One stored response, for the admin results view. Name, no email. */
export interface FeedbackResponseRow {
  checkpointId: string;
  flowId: string;
  status: FeedbackResponseStatus;
  answers: FeedbackAnswers;
  /** Questions as answered (labels survive later edits). */
  snapshot: FeedbackQuestionPublic[];
  userKey: string;
  userName: string;
  avatarUrl?: string;
  /** Time to fill on the first submission (ms); absent for skips and older rows. */
  durationMs?: number;
  updatedAt: string;
}

export const FEEDBACK_LIMITS = {
  promptLength: 300,
  helpLength: 300,
  optionLabelLength: 80,
  optionDescLength: 160,
  minOptions: 2,
  maxOptions: 6,
  textMaxLength: 2000,
  defaultTextMaxLength: 500,
  /** Durations above this are dropped (tab left open, not filling). */
  maxDurationMs: 60 * 60 * 1000,
  minFlowItems: 1,
  maxFlowItems: 10,
  nameLength: 120,
  titleLength: 120,
  introLength: 400,
} as const;
