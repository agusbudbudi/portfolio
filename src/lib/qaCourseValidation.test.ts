import { describe, expect, it } from 'vitest';
import { courseArticleIds, courseCheckpointWarnings, validateQaCourseData } from './qaCourseValidation';

const valid = () => ({
  title: 'Junior QA Ready',
  description: 'Jalur pertama',
  level: 'beginner',
  estimatedHours: 5,
  status: 'published',
  modules: [
    {
      id: 'm1',
      title: 'Requirement',
      items: [
        { id: 'i1', kind: 'article', articleId: 'art1' },
        { id: 'i2', kind: 'mission', projectId: 'splitbill', phaseId: 'requirement-analysis' },
      ],
    },
  ],
});

describe('validateQaCourseData', () => {
  it('accepts a well-formed course', () => {
    expect(validateQaCourseData(valid()).ok).toBe(true);
  });

  it('rejects missing fields, empty modules and bad items', () => {
    const bad = { ...valid(), title: ' ', level: 'expert', estimatedHours: 0 };
    const res = validateQaCourseData(bad);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.errors).toEqual(expect.arrayContaining([
        expect.stringContaining('title'), expect.stringContaining('level'), expect.stringContaining('estimatedHours'),
      ]));
    }
  });

  it('rejects duplicate item ids and missing article/phase picks', () => {
    const c = valid();
    c.modules[0].items = [
      { id: 'dup', kind: 'article', articleId: '' },
      { id: 'dup', kind: 'mission', projectId: 'splitbill', phaseId: '' },
    ];
    const res = validateQaCourseData(c);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors.join(' ')).toMatch(/duplikat|pilih artikel|pilih phase/);
  });

  it('requires at least one module before publishing', () => {
    const res = validateQaCourseData({ ...valid(), modules: [] });
    expect(res.ok).toBe(false);
  });
});

describe('courseArticleIds', () => {
  it('lists article ids in reading order without duplicates', () => {
    const c = valid();
    c.modules.push({ id: 'm2', title: 'x', items: [{ id: 'i3', kind: 'article', articleId: 'art1' }, { id: 'i4', kind: 'article', articleId: 'art2' }] });
    expect(courseArticleIds(c as never)).toEqual(['art1', 'art2']);
  });
});

describe('courseCheckpointWarnings', () => {
  const art = (id: string) => ({ id, kind: 'article' as const, articleId: `a-${id}` });
  const fb = (id: string) => ({ id, kind: 'feedback' as const, flowId: 'flow-1' });

  it('is empty when every checkpoint has a lesson after it', () => {
    const modules = [{ id: 'm1', title: 'M1', items: [fb('f0'), art('x'), fb('f1')] }, { id: 'm2', title: 'M2', items: [art('y'), fb('f2')] }];
    expect(courseCheckpointWarnings({ modules })).toEqual({});
  });

  it('flags the earlier of two adjacent checkpoints in one module', () => {
    const modules = [{ id: 'm1', title: 'M1', items: [art('x'), fb('f1'), fb('f2'), art('y')] }];
    expect(Object.keys(courseCheckpointWarnings({ modules }))).toEqual(['f1']);
  });

  it('flags adjacency across a module boundary', () => {
    const modules = [{ id: 'm1', title: 'M1', items: [art('x'), fb('end')] }, { id: 'm2', title: 'M2', items: [fb('start'), art('y')] }];
    expect(Object.keys(courseCheckpointWarnings({ modules }))).toEqual(['end']);
  });
});
