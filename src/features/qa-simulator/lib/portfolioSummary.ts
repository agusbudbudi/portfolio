import type { ProjectProgress, SimulatorAssignment, SimulatorInputSpec, SimulatorPhase, SimulatorProject } from '../../../types/qaSimulator';
import { isPhaseComplete, phaseScore, portfolioPhases } from './progress';

type ListSpec = Extract<SimulatorInputSpec, { type: 'list' }>;

export interface PortfolioSummary {
  /** The phases this portfolio covers (all, minus later-added ones a learner who started earlier skipped). */
  phases: SimulatorPhase[];
  allDone: boolean;
  /** Average of the phase self-assessment scores, 0–100. */
  overall: number;
  /** Aligned with `phases`. */
  phaseScores: number[];
  /** One entry per list-type assignment, e.g. { label: 'Test Case', count: 8 }. */
  stats: { label: string; count: number }[];
  startedAt?: string;
  finishedAt?: string;
}

// Shared by the portfolio document (owner + public share page) and the
// QA Simulator card on the SaaS portfolio, so all three show the same numbers.
export function summarizePortfolio(project: SimulatorProject, progress: ProjectProgress): PortfolioSummary {
  const phases = portfolioPhases(project, progress);
  const allAssignments = phases.flatMap((p) => p.assignments);
  const submittedDates = (allAssignments.map((a) => progress.assignments[a.id]?.submittedAt).filter(Boolean) as string[]).sort();
  const phaseScores = phases.map((p) => phaseScore(p, progress) ?? 0);
  const overall = phaseScores.length === 0 ? 0 : Math.round(phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length);
  const stats = allAssignments
    .filter((a): a is SimulatorAssignment & { input: ListSpec } => a.input.type === 'list')
    .map((a) => ({ label: a.input.itemLabel, count: progress.assignments[a.id]?.content.items?.length ?? 0 }));
  return {
    phases,
    allDone: phases.every((p) => isPhaseComplete(p, progress)),
    overall,
    phaseScores,
    stats,
    startedAt: submittedDates[0],
    finishedAt: submittedDates[submittedDates.length - 1],
  };
}
