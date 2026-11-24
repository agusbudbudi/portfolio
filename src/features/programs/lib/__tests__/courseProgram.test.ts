import { describe, expect, it } from 'vitest';
import { applyCourse, hoursFact } from '../courseProgram';
import { PROGRAMS } from '../../data/programs';
import { course } from '../../../qa-course/lib/__tests__/fixtures';

const program = { ...PROGRAMS.find((p) => p.key === 'course')!, course: 'junior', href: '/courses/junior' };

describe('applyCourse', () => {
  it('deep-links to the first lesson as the DB orders it', () => {
    expect(applyCourse(program, course()).href).toBe('/qa-library/art1-slug?course=junior');
  });

  it('follows a reorder in the admin', () => {
    const c = course();
    c.modules[0].items.reverse(); // mission p1 is now lesson 1
    expect(applyCourse(program, c).href).toBe('/qa-simulator/splitbill?phase=p1&course=junior');
  });

  it('falls back to the course page when lesson 1 was removed', () => {
    const c = course();
    c.articles.art1 = { ...c.articles.art1, available: false };
    // The first available lesson is now lesson 2, which a guest can't open.
    expect(applyCourse(program, c).href).toBe('/courses/junior');
  });

  it('takes hours and level from the course, after the static facts', () => {
    expect(applyCourse(program, course({ estimatedHours: 5, level: 'intermediate' })).facts).toEqual(['Gratis', '±5 jam', 'Menengah']);
  });
});

describe('hoursFact', () => {
  it('uses a decimal comma', () => {
    expect(hoursFact(1.5)).toBe('±1,5 jam');
  });
});
