import { describe, expect, it } from 'vitest';
import type { ProjectProgress, SimulatorPhase } from '../../../types/qaSimulator';
import { isPortfolioReady, portfolioPhases } from './progress';

const phase = (id: string, addedAt?: string): SimulatorPhase =>
  ({ id, assignments: [{ id: `${id}-a` }, { id: `${id}-b` }], ...(addedAt ? { addedAt } : {}) }) as unknown as SimulatorPhase;

const project = {
  phases: [phase('p1'), phase('p2'), phase('p3', '2026-11-29'), phase('p4', '2026-11-29')],
};

/** Submits both assignments of each listed phase at the given time. */
const progressOf = (done: Record<string, string>): ProjectProgress => ({
  updatedAt: '2026-12-01T00:00:00.000Z',
  assignments: Object.fromEntries(
    Object.entries(done).flatMap(([pid, at]) =>
      ['a', 'b'].map((x) => [`${pid}-${x}`, { status: 'submitted', submittedAt: at, content: {}, checkedRubric: [], updatedAt: at }])
    )
  ),
});

const ids = (phases: SimulatorPhase[]) => phases.map((p) => p.id);

describe('portfolioPhases', () => {
  it('keeps a complete portfolio for a learner who finished the original phases before the new ones were added', () => {
    const progress = progressOf({ p1: '2026-11-10T08:00:00.000Z', p2: '2026-11-12T08:00:00.000Z' });
    expect(ids(portfolioPhases(project, progress))).toEqual(['p1', 'p2']);
    expect(isPortfolioReady(project, progress)).toBe(true);
  });

  it('adds a new phase to that portfolio once the learner finishes it', () => {
    const progress = progressOf({ p1: '2026-11-10T08:00:00.000Z', p2: '2026-11-12T08:00:00.000Z', p3: '2026-12-02T08:00:00.000Z' });
    expect(ids(portfolioPhases(project, progress))).toEqual(['p1', 'p2', 'p3']);
    expect(isPortfolioReady(project, progress)).toBe(true);
  });

  it('counts a learner who started before the date but finished the original phases after it', () => {
    const progress = progressOf({ p1: '2026-11-27T08:00:00.000Z', p2: '2026-12-03T08:00:00.000Z' });
    expect(isPortfolioReady(project, progress)).toBe(true);
  });

  it('requires every phase from a learner who started after the new phases were added', () => {
    const progress = progressOf({ p1: '2026-12-01T08:00:00.000Z', p2: '2026-12-02T08:00:00.000Z' });
    expect(ids(portfolioPhases(project, progress))).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(isPortfolioReady(project, progress)).toBe(false);
  });

  it('is not ready while an original phase is unfinished, even for an early starter', () => {
    const progress = progressOf({ p1: '2026-11-10T08:00:00.000Z' });
    expect(ids(portfolioPhases(project, progress))).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(isPortfolioReady(project, progress)).toBe(false);
  });

  it('needs every phase of a project without added phases', () => {
    const plain = { phases: [phase('p1'), phase('p2')] };
    const progress = progressOf({ p1: '2026-11-10T08:00:00.000Z' });
    expect(isPortfolioReady(plain, progress)).toBe(false);
    expect(isPortfolioReady(plain, progressOf({ p1: '2026-11-10T08:00:00.000Z', p2: '2026-11-11T08:00:00.000Z' }))).toBe(true);
  });
});
