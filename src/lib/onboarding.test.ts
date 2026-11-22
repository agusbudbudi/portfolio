import { describe, expect, it } from 'vitest';
import { DEFAULT_ONBOARDING_CONFIG, isOnboardingConfig, programHref, scoreOnboarding } from './onboarding';
import type { OnboardingAnswers, OnboardingConfig, ProgramId } from '../types/onboarding';

const config = DEFAULT_ONBOARDING_CONFIG;
const primaryOf = (q1: string, q2: string, q3: string[], q4: string): ProgramId =>
  scoreOnboarding({ q1: [q1], q2: [q2], q3, q4: [q4] }, config).primary.id;

/** Every valid answer set (single Q1/Q2/Q4, one or two Q3). */
function allAnswers(): OnboardingAnswers[] {
  const [q1, q2, q3, q4] = config.questions.map((q) => q.options.map((o) => o.id));
  const q3Sets: string[][] = [];
  q3.forEach((a, i) => { q3Sets.push([a]); q3.slice(i + 1).forEach((b) => q3Sets.push([a, b])); });
  return q1.flatMap((a) => q2.flatMap((b) => q3Sets.flatMap((c) => q4.map((d) => ({ q1: [a], q2: [b], q3: c, q4: [d] })))));
}

describe('onboarding matrix v3', () => {
  it('ships a valid config with QA Course in the catalog', () => {
    expect(isOnboardingConfig(config)).toBe(true);
    expect(config.catalog.map((c) => c.id)).toContain('course');
  });

  it('sends a confused career switcher to QA Course', () => {
    expect(primaryOf('1A', '2A', ['3A'], '4D')).toBe('course');
  });

  it('keeps the other programs reachable as primary', () => {
    expect(primaryOf('1B', '2B', ['3B'], '4B')).toBe('simulator');
    expect(primaryOf('1C', '2C', ['3C'], '4B')).toBe('portfolio');
    expect(primaryOf('1D', '2D', ['3D'], '4C')).toBe('mentoring');
    expect(primaryOf('1D', '2D', ['3E'], '4A')).toBe('library');
  });

  it('every program wins for some answers, and none dominates', () => {
    const counts: Partial<Record<ProgramId, number>> = {};
    const all = allAnswers();
    for (const a of all) {
      const id = scoreOnboarding(a, config).primary.id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    for (const c of config.catalog) {
      const share = (counts[c.id] ?? 0) / all.length;
      expect(share, c.id).toBeGreaterThan(0.05);
      expect(share, c.id).toBeLessThan(0.4);
    }
  });

  it('rarely recommends the beginner course to experienced QA (2+ tahun)', () => {
    const experienced = allAnswers().filter((a) => a.q1[0] === '1D');
    const course = experienced.filter((a) => scoreOnboarding(a, config).primary.id === 'course');
    expect(course.length / experienced.length).toBeLessThan(0.05);
  });

  it('drops an inactive QA Course from the ranking', () => {
    const off: OnboardingConfig = { ...config, catalog: config.catalog.map((c) => (c.id === 'course' ? { ...c, isActive: false } : c)) };
    const rec = scoreOnboarding({ q1: ['1A'], q2: ['2A'], q3: ['3A'], q4: ['4D'] }, off);
    expect([rec.primary, ...rec.secondary, ...rec.others].map((p) => p.id)).not.toContain('course');
  });

  it('routes the course CTA to the member dashboard (landing page for admins)', () => {
    const course = config.catalog.find((c) => c.id === 'course')!;
    expect(programHref(course, 'onboarding')).toBe('/dashboard/courses?ref=onboarding');
    expect(programHref(course, 'onboarding', true)).toBe('/courses?ref=onboarding');
  });
});
