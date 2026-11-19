// QA Simulator — a guided, end-to-end "work like a real QA" exercise built
// around one fictional sprint on a real product. Content is static JSON for
// now (public/qa-simulator/config/*.json); the shapes below are what a future
// admin CMS would write. Keep this file free of browser-only imports — the
// API validates progress documents against ProjectProgress.

export type SimulatorFieldType = 'text' | 'textarea' | 'select' | 'url';

export interface SimulatorField {
  id: string;
  label: string;
  type: SimulatorFieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export type SimulatorInputSpec =
  | { type: 'textarea'; placeholder?: string; minLength?: number }
  | { type: 'link'; placeholder?: string; hint?: string }
  | { type: 'list'; itemLabel: string; fields: SimulatorField[]; minItems?: number };

export interface SimulatorRubricItem {
  id: string;
  label: string;
  weight: number;
}

export interface SimulatorAnswerKeyItem {
  title: string;
  detail: string;
  tag?: string;
}

export interface SimulatorAssignment {
  id: string;
  title: string;
  /** Markdown. */
  instructions: string;
  input: SimulatorInputSpec;
  expectedOutput: string[];
  rubric: SimulatorRubricItem[];
  answerKey?: {
    intro?: string;
    items: SimulatorAnswerKeyItem[];
  };
}

export interface SimulatorKeyPoint {
  title: string;
  body: string;
}

export interface SimulatorPhase {
  id: string;
  title: string;
  shortTitle: string;
  summary: string;
  requiresLogin: boolean;
  learn: {
    objectives: string[];
    keyPoints: SimulatorKeyPoint[];
    resources?: { label: string; url: string }[];
  };
  brief: {
    /** SimulatorTeamMember.id */
    fromId: string;
    /** Markdown. */
    message: string;
  };
  /** PRD revision unlocked from this phase on (e.g. PM answers to phase 1 questions). */
  prdAddendum?: { version: string; markdown: string };
  /** In-app practice target (bug-hunting phase). */
  sandbox?: { label: string; path: string; description: string };
  assignments: SimulatorAssignment[];
}

export interface SimulatorTeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  /** Tailwind bg-* class for the avatar bubble. */
  color: string;
}

export type SimulatorDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SimulatorProject {
  id: string;
  title: string;
  product: string;
  productUrl?: string;
  domain: string;
  difficulty: SimulatorDifficulty;
  estimatedHours: number;
  summary: string;
  /** Markdown — company/sprint context shown on the project intro. */
  context: string;
  team: SimulatorTeamMember[];
  prd: { title: string; version: string; markdown: string };
  phases: SimulatorPhase[];
}

export interface SimulatorProjectSummary {
  id: string;
  title: string;
  product: string;
  domain: string;
  summary: string;
  difficulty: SimulatorDifficulty;
  estimatedHours: number;
  phaseTitles: string[];
  status: 'available' | 'coming-soon';
}

export interface SimulatorIndex {
  projects: SimulatorProjectSummary[];
}

// ── Progress ────────────────────────────────────────────────────────────────

export interface AssignmentContent {
  text?: string;
  url?: string;
  items?: Record<string, string>[];
}

export type AssignmentStatus = 'draft' | 'submitted';

export interface AssignmentProgress {
  content: AssignmentContent;
  status: AssignmentStatus;
  /** SimulatorRubricItem.id values the learner ticked in self-assessment. */
  checkedRubric: string[];
  submittedAt?: string;
  /** Set when the learner finishes the self-assessment for the current submission. */
  assessedAt?: string;
  updatedAt: string;
}

export interface ProjectProgress {
  /** Keyed by SimulatorAssignment.id (unique across a project). */
  assignments: Record<string, AssignmentProgress>;
  updatedAt: string;
}

export interface ProjectProgressRecord {
  projectId: string;
  data: ProjectProgress;
  updatedAt: string;
}
