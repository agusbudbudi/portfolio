import type {
  AssignmentContent, AssignmentProgress, ProjectProgress, SimulatorAssignment, SimulatorInputSpec, SimulatorPhase, SimulatorProject,
} from '../../../types/qaSimulator';

export const emptyProgress = (): ProjectProgress => ({ assignments: {}, updatedAt: new Date(0).toISOString() });

export function isPhaseComplete(phase: SimulatorPhase, progress: ProjectProgress): boolean {
  return phase.assignments.every((a) => progress.assignments[a.id]?.status === 'submitted');
}

export type PhaseState = 'locked' | 'login-required' | 'available' | 'completed';

export function phaseState(project: SimulatorProject, index: number, progress: ProjectProgress, loggedIn: boolean): PhaseState {
  const phase = project.phases[index];
  if (isPhaseComplete(phase, progress)) return 'completed';
  const prevComplete = index === 0 || isPhaseComplete(project.phases[index - 1], progress);
  if (!prevComplete) return 'locked';
  if (phase.requiresLogin && !loggedIn) return 'login-required';
  return 'available';
}

/**
 * Phases a learner's portfolio has to cover. A phase with `addedAt` came later
 * to a published project: a learner who started the project before that date
 * (earliest submittedAt) and finished every earlier phase does not need it, so
 * their portfolio stays complete; the phase joins it once they finish it.
 * Everyone else needs every phase.
 */
export function portfolioPhases(project: Pick<SimulatorProject, 'phases'>, progress: ProjectProgress): SimulatorPhase[] {
  const waived = new Set<string>();
  for (const phase of project.phases) {
    if (!phase.addedAt || isPhaseComplete(phase, progress)) continue;
    const added = Date.parse(phase.addedAt);
    if (!Number.isFinite(added)) continue;
    const earlier = project.phases.filter(
      (p) => p !== phase && !waived.has(p.id) && (!p.addedAt || Date.parse(p.addedAt) < added)
    );
    if (earlier.length === 0 || !earlier.every((p) => isPhaseComplete(p, progress))) continue;
    const submitted = earlier
      .flatMap((p) => p.assignments)
      .map((a) => Date.parse(progress.assignments[a.id]?.submittedAt ?? ''))
      .filter(Number.isFinite);
    if (submitted.length > 0 && Math.min(...submitted) < added) waived.add(phase.id);
  }
  return project.phases.filter((p) => !waived.has(p.id));
}

/** Portfolio can be shown: every phase it has to cover is complete. */
export function isPortfolioReady(project: Pick<SimulatorProject, 'phases'>, progress: ProjectProgress): boolean {
  return portfolioPhases(project, progress).every((p) => isPhaseComplete(p, progress));
}

export function projectCompletion(project: Pick<SimulatorProject, 'phases'>, progress: ProjectProgress): { done: number; total: number; percent: number } {
  const all = project.phases.flatMap((p) => p.assignments);
  const done = all.filter((a) => progress.assignments[a.id]?.status === 'submitted').length;
  return { done, total: all.length, percent: all.length === 0 ? 0 : Math.round((done / all.length) * 100) };
}

export function rubricScore(assignment: SimulatorAssignment, checked: string[]): { score: number; max: number; percent: number } {
  const max = assignment.rubric.reduce((sum, r) => sum + r.weight, 0);
  const score = assignment.rubric.filter((r) => checked.includes(r.id)).reduce((sum, r) => sum + r.weight, 0);
  return { score, max, percent: max === 0 ? 0 : Math.round((score / max) * 100) };
}

export function phaseScore(phase: SimulatorPhase, progress: ProjectProgress): number | null {
  const submitted = phase.assignments.filter((a) => progress.assignments[a.id]?.status === 'submitted');
  if (submitted.length === 0) return null;
  let score = 0;
  let max = 0;
  for (const a of submitted) {
    const r = rubricScore(a, progress.assignments[a.id].checkedRubric);
    score += r.score;
    max += r.max;
  }
  return max === 0 ? null : Math.round((score / max) * 100);
}

// A list item counts once every required field has non-whitespace text.
export function isItemFilled(spec: Extract<SimulatorInputSpec, { type: 'list' }>, item: Record<string, string>): boolean {
  return spec.fields.filter((f) => f.required).every((f) => (item[f.id] ?? '').trim().length > 0);
}

export function filledItemCount(spec: Extract<SimulatorInputSpec, { type: 'list' }>, content: AssignmentContent): number {
  return (content.items ?? []).filter((item) => isItemFilled(spec, item)).length;
}

/** Null when submittable, otherwise a human reason. */
export function submitBlocker(spec: SimulatorInputSpec, content: AssignmentContent): string | null {
  if (spec.type === 'textarea') {
    const len = (content.text ?? '').trim().length;
    const min = spec.minLength ?? 1;
    return len >= min ? null : `Minimal ${min} karakter (sekarang ${len}).`;
  }
  if (spec.type === 'link') {
    const url = (content.url ?? '').trim();
    return /^https?:\/\/\S+\.\S+/.test(url) ? null : 'Isi link yang valid (diawali https://).';
  }
  const items = content.items ?? [];
  const filled = filledItemCount(spec, content);
  const min = spec.minItems ?? 1;
  if (filled < min) return `Minimal ${min} ${spec.itemLabel.toLowerCase()} terisi lengkap (sekarang ${filled}).`;
  if (filled < items.length) return `Masih ada ${spec.itemLabel.toLowerCase()} yang field wajibnya kosong. Lengkapi atau hapus dulu.`;
  return null;
}

export function blankAssignment(): AssignmentProgress {
  return { content: {}, status: 'draft', checkedRubric: [], updatedAt: new Date().toISOString() };
}
