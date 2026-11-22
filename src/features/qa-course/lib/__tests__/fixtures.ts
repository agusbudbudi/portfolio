// Minimal course + simulator fixtures shared by the QA Course logic tests.
import type { QaCourseDetail } from '../../../../types/qaCourse';
import type { ProjectProgress, SimulatorProject } from '../../../../types/qaSimulator';

export const project = {
  id: 'splitbill',
  product: 'SplitBill',
  phases: [
    { id: 'p1', title: 'Requirement', learn: { objectives: ['Baca PRD'] }, assignments: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 'p2', title: 'Test Design', learn: { objectives: ['Tulis test case'] }, assignments: [{ id: 'a3' }] },
  ],
} as unknown as SimulatorProject;

const ref = (id: string, available = true) => ({ id, slug: `${id}-slug`, title: `Artikel ${id}`, excerpt: '', readingTimeMinutes: 4, available });

/** Module 1: art1, art2, mission p1 · Module 2: art3, mission p2 (5 lessons). */
export function course(overrides: Partial<QaCourseDetail> = {}): QaCourseDetail {
  return {
    id: 'c1',
    slug: 'junior',
    title: 'Junior',
    description: '',
    level: 'beginner',
    estimatedHours: 4,
    status: 'published',
    createdAt: '',
    updatedAt: '',
    modules: [
      {
        id: 'm1',
        title: 'Requirement',
        items: [
          { id: 'i1', kind: 'article', articleId: 'art1' },
          { id: 'i2', kind: 'article', articleId: 'art2' },
          { id: 'i3', kind: 'mission', projectId: 'splitbill', phaseId: 'p1' },
        ],
      },
      {
        id: 'm2',
        title: 'Test Design',
        items: [
          { id: 'i4', kind: 'article', articleId: 'art3' },
          { id: 'i5', kind: 'mission', projectId: 'splitbill', phaseId: 'p2' },
        ],
      },
    ],
    articles: { art1: ref('art1'), art2: ref('art2'), art3: ref('art3') },
    ...overrides,
  };
}

/** Simulator progress with the given assignment ids submitted. */
export function progress(...submitted: string[]): ProjectProgress {
  return {
    updatedAt: '2026-11-20T00:00:00.000Z',
    assignments: Object.fromEntries(submitted.map((id) => [id, {
      content: {}, status: 'submitted', checkedRubric: [], submittedAt: '2026-11-20T10:00:00.000Z', updatedAt: '',
    }])),
  };
}
