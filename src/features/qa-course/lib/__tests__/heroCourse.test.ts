import { describe, expect, it } from 'vitest';
import { buildLessons } from '../courseOutline';
import { pickHeroCourse, type LearnerCourse } from '../heroCourse';
import { course, progress, project } from './fixtures';

// Lessons: art1, art2, mission p1 (a1+a2), art3, mission p2 (a3).
function row(slug: string, articles: string[], submitted: string[] = []): LearnerCourse {
  const c = course({ id: slug, slug, title: slug });
  return {
    course: c,
    lessons: buildLessons({
      course: c,
      projects: { [project.id]: project },
      simulatorProgress: { [project.id]: progress(...submitted) },
      completedArticleIds: new Set(articles),
      loggedIn: true,
    }),
  };
}
const ALL_ARTICLES = ['art1', 'art2', 'art3'];
const ALL_MISSIONS = ['a1', 'a2', 'a3'];

describe('pickHeroCourse', () => {
  it('shows nothing before any lesson is done', () => {
    expect(pickHeroCourse([row('a', [])])).toBeNull();
  });

  it('features the course in progress with its next lesson', () => {
    const hero = pickHeroCourse([row('a', ['art1'])]);
    expect(hero?.kind).toBe('in-progress');
    expect(hero?.kind === 'in-progress' && hero.target.title).toBe('Artikel art2');
  });

  it('shows the graduation card once a course is finished', () => {
    const hero = pickHeroCourse([row('a', ALL_ARTICLES, ALL_MISSIONS), row('b', [])]);
    expect(hero?.kind).toBe('finished');
    expect(hero?.course.slug).toBe('a');
    expect(hero?.kind === 'finished' && hero.otherCourses).toBe(1);
  });

  it('prefers a course in progress over a finished one', () => {
    const hero = pickHeroCourse([row('done', ALL_ARTICLES, ALL_MISSIONS), row('next', ['art1'])]);
    expect(hero?.kind).toBe('in-progress');
    expect(hero?.course.slug).toBe('next');
  });

  it('picks the in-progress course closest to done', () => {
    const hero = pickHeroCourse([row('little', ['art1']), row('most', ['art1', 'art2'], ['a1', 'a2'])]);
    expect(hero?.course.slug).toBe('most');
  });
});
