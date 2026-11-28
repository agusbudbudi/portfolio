import { describe, expect, it } from 'vitest';
import { finalizeSlug, parsePortfolioClaim, sanitizeSlugInput, suggestSlug } from './portfolioClaim';

describe('sanitizeSlugInput', () => {
  it('lowercases and turns runs of other characters into one hyphen', () => {
    expect(sanitizeSlugInput('Budi Santoso!!')).toBe('budi-santoso-');
    expect(sanitizeSlugInput('a  --  b')).toBe('a-b');
  });
  it('strips accents and leading hyphens', () => {
    expect(sanitizeSlugInput('  Éka')).toBe('eka');
  });
  it('keeps one trailing hyphen while typing', () => {
    expect(sanitizeSlugInput('budi ')).toBe('budi-');
  });
});

describe('finalizeSlug', () => {
  it('drops leading, trailing and double hyphens', () => {
    expect(finalizeSlug('Budi Santoso!!')).toBe('budi-santoso');
    expect(finalizeSlug('--qa--engineer--')).toBe('qa-engineer');
  });
  it('returns empty for input with no letters or digits', () => {
    expect(finalizeSlug('!!!')).toBe('');
  });
});

describe('suggestSlug', () => {
  it('appends -qa, or the year when it already ends with -qa', () => {
    expect(suggestSlug('budi')).toBe('budi-qa');
    expect(suggestSlug('budi-qa')).toMatch(/^budi-qa-\d{4}$/);
  });
});

describe('parsePortfolioClaim', () => {
  const now = 1_000_000_000_000;
  it('reads a fresh claim', () => {
    expect(parsePortfolioClaim(JSON.stringify({ slug: 'budi', at: now - 1000 }), now)).toBe('budi');
  });
  it('drops claims older than 7 days, malformed or empty values', () => {
    expect(parsePortfolioClaim(JSON.stringify({ slug: 'budi', at: now - 8 * 86_400_000 }), now)).toBeNull();
    expect(parsePortfolioClaim('not json', now)).toBeNull();
    expect(parsePortfolioClaim(JSON.stringify({ slug: '!!', at: now }), now)).toBeNull();
    expect(parsePortfolioClaim(null, now)).toBeNull();
  });
});
