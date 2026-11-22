import { describe, expect, it } from 'vitest';
import { completedCourses } from '../completedCourses';
import { course, progress, project } from './fixtures';

const record = (done: string[], lastCompletedAt: string | null = '2026-11-21T08:00:00.000Z', c = course()) => ({
  course: c,
  completedArticleIds: done,
  lastCompletedAt,
});

describe('completedCourses', () => {
  it('returns nothing until every article and mission is done', () => {
    expect(completedCourses([record(['art1', 'art2', 'art3'])], project, progress('a1', 'a2'))).toEqual([]);
    expect(completedCourses([record(['art1'])], project, progress('a1', 'a2', 'a3'))).toEqual([]);
  });

  it('returns the course once fully finished, dated by the latest activity', () => {
    const [done] = completedCourses([record(['art1', 'art2', 'art3'])], project, progress('a1', 'a2', 'a3'));
    expect(done.record.course.slug).toBe('junior');
    // Simulator submissions (Nov 20) are older than the last article (Nov 21).
    expect(done.finishedAt).toBe('2026-11-21T08:00:00.000Z');
  });

  it('never counts a course that also needs another simulator project', () => {
    const c = course();
    c.modules[1].items.push({ id: 'i6', kind: 'mission', projectId: 'ewallet', phaseId: 'x' });
    expect(completedCourses([record(['art1', 'art2', 'art3'], null, c)], project, progress('a1', 'a2', 'a3'))).toEqual([]);
  });
});
