import { describe, expect, it } from 'vitest';
import { buildLessons, courseCompletion, nextLesson } from '../courseOutline';
import { course, progress, project } from './fixtures';

const build = (opts: { done?: string[]; submitted?: string[]; loggedIn?: boolean; c?: ReturnType<typeof course> } = {}) =>
  buildLessons({
    course: opts.c ?? course(),
    projects: { splitbill: project },
    simulatorProgress: { splitbill: progress(...(opts.submitted ?? [])) },
    completedArticleIds: new Set(opts.done ?? []),
    loggedIn: opts.loggedIn ?? true,
  });

describe('buildLessons', () => {
  it('flattens modules into lessons in reading order', () => {
    const lessons = build();
    expect(lessons.map((l) => l.item.id)).toEqual(['i1', 'i2', 'i3', 'i4', 'i5']);
    expect(lessons.map((l) => l.moduleIndex)).toEqual([0, 0, 0, 1, 1]);
    expect(lessons[0].href).toBe('/qa-library/art1-slug?course=junior');
    expect(lessons[2].href).toBe('/qa-simulator/splitbill?phase=p1&course=junior');
  });

  it('opens only the first lesson for a new learner and locks the rest in sequence', () => {
    const lessons = build();
    expect(lessons[0].isNext).toBe(true);
    expect(lessons[0].lock).toBeNull();
    expect(lessons.slice(1).every((l) => l.lock === 'sequence')).toBe(true);
  });

  it('unlocks up to the next unfinished lesson; finished ones stay open', () => {
    const lessons = build({ done: ['art1', 'art2'] });
    expect(lessons.map((l) => l.lock)).toEqual([null, null, null, 'sequence', 'sequence']);
    expect(nextLesson(lessons)?.item.id).toBe('i3');
  });

  it('marks a mission done only when every assignment of its phase is submitted', () => {
    expect(build({ done: ['art1', 'art2'], submitted: ['a1'] })[2].done).toBe(false);
    const lessons = build({ done: ['art1', 'art2'], submitted: ['a1', 'a2'] });
    expect(lessons[2].done).toBe(true);
    expect(nextLesson(lessons)?.item.id).toBe('i4');
  });

  it('locks every lesson after the first for guests, behind login', () => {
    const lessons = build({ loggedIn: false });
    expect(lessons[0].lock).toBeNull();
    expect(lessons.slice(1).every((l) => l.lock === 'login')).toBe(true);
  });

  it('skips an unpublished article so it never blocks the course', () => {
    const c = course();
    c.articles.art2 = { ...c.articles.art2, available: false };
    const lessons = build({ c, done: ['art1'] });
    expect(lessons[1].available).toBe(false);
    expect(nextLesson(lessons)?.item.id).toBe('i3');
    expect(lessons[2].lock).toBeNull();
  });
});

describe('courseCompletion', () => {
  it('counts available lessons only and reports allDone at 100%', () => {
    expect(courseCompletion(build())).toMatchObject({ done: 0, total: 5, percent: 0, allDone: false });
    const all = build({ done: ['art1', 'art2', 'art3'], submitted: ['a1', 'a2', 'a3'] });
    expect(courseCompletion(all)).toMatchObject({ done: 5, total: 5, percent: 100, allDone: true });
  });
});
