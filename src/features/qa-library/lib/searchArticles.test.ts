import { describe, expect, it } from 'vitest';
import type { QaLibraryArticleSummary } from '../../../types/qaLibrary';
import { normalizeSearchText, searchArticles } from './searchArticles';

const article = (over: Partial<QaLibraryArticleSummary>): QaLibraryArticleSummary => ({
  id: over.slug ?? 'x',
  slug: 'x',
  title: '',
  categoryId: 'manual',
  excerpt: '',
  tags: [],
  status: 'published',
  readingTimeMinutes: 5,
  authorName: 'Agus Budiman',
  updatedAt: '2026-11-01T00:00:00Z',
  ...over,
});

const label = (id: string) => ({ manual: 'Manual Testing', api: 'API Testing' }[id] ?? id);

const list = [
  article({ slug: 'postman', title: 'Belajar Postman untuk Pemula', categoryId: 'api', tags: ['postman'] }),
  article({ slug: 'ac', title: 'Acceptance Criteria yang Bisa Dites', excerpt: 'Format Given-When-Then', course: { slug: 'junior-qa-ready', title: 'Junior QA Ready' } }),
  article({ slug: 'bva', title: 'Boundary Value Analysis', excerpt: 'Teknik test design untuk acceptance criteria angka' }),
];

const slugs = (q: string) => searchArticles(list, q, label).map((a) => a.slug);

describe('searchArticles', () => {
  it('returns the list unchanged for an empty query', () => {
    expect(slugs('   ')).toEqual(['postman', 'ac', 'bva']);
  });

  it('matches every word in any order, across fields', () => {
    expect(slugs('api postman')).toEqual(['postman']);
    expect(slugs('junior ready')).toEqual(['ac']);
    expect(slugs('given then')).toEqual(['ac']);
  });

  it('ranks title hits above body-only hits', () => {
    expect(slugs('acceptance criteria')).toEqual(['ac', 'bva']);
  });

  it('ignores case, accents and punctuation', () => {
    expect(slugs('GIVEN-WHEN')).toEqual(['ac']);
    expect(normalizeSearchText('Café, QA!')).toBe('cafe qa');
  });

  it('returns nothing when a word is missing', () => {
    expect(slugs('postman graphql')).toEqual([]);
  });
});
