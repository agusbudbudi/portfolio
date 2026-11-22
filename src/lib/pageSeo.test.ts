import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOWEST_MENTORING_PRICE, PAGE_SEO, SITE_URL, findPageSeo } from './pageSeo';

const pages = Object.values(PAGE_SEO);

describe('pageSeo', () => {
  it('resolves bot paths with or without slashes', () => {
    expect(findPageSeo('')?.path).toBe('/');
    expect(findPageSeo('/')?.path).toBe('/');
    expect(findPageSeo('courses')?.path).toBe('/courses');
    expect(findPageSeo('mentoring/booking/')?.path).toBe('/mentoring/booking');
    expect(findPageSeo('dashboard')).toBeNull();
  });

  it('gives every page its own share copy and image', () => {
    const unique = (k: 'shareTitle' | 'shareDescription' | 'image') => new Set(pages.map((p) => p[k])).size;
    expect(unique('shareTitle')).toBe(pages.length);
    expect(unique('shareDescription')).toBe(pages.length);
    expect(unique('image')).toBe(pages.length);
  });

  it('points every image at a generated file in public/', () => {
    for (const p of pages) {
      expect(p.image.startsWith(`${SITE_URL}/shared/img/og/`)).toBe(true);
      const file = new URL(p.image).pathname;
      expect(existsSync(resolve(process.cwd(), 'public', `.${file}`)), file).toBe(true);
    }
  });

  it('keeps copy within preview limits and free of em dashes', () => {
    for (const p of pages) {
      expect(p.title.length, p.path).toBeLessThanOrEqual(70);
      expect(p.shareTitle.length, p.path).toBeLessThanOrEqual(70);
      expect(p.description.length, p.path).toBeLessThanOrEqual(170);
      expect(p.shareDescription.length, p.path).toBeLessThanOrEqual(160);
      expect(`${p.title}${p.description}${p.shareTitle}${p.shareDescription}`).not.toContain('—');
    }
  });

  it('quotes the current lowest mentoring price', () => {
    expect(LOWEST_MENTORING_PRICE).toMatch(/^Rp[\d.]+$/);
    expect(PAGE_SEO['/mentoring'].shareTitle).toContain(LOWEST_MENTORING_PRICE);
  });
});
