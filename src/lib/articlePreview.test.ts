import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { countWords, PREVIEW_MAX_SECTION_RATIO, splitPreview, stripPreviewMarker } from './articlePreview';

/** A paragraph of exactly `n` words. */
const words = (n: number, w = 'kata') => Array.from({ length: n }, () => w).join(' ');

/** Article markdown without its frontmatter. */
function articleBody(path: string): string {
  const raw = readFileSync(resolve(__dirname, '../..', path), 'utf8');
  return raw.replace(/^---\n[\s\S]*?\n---\n/, '');
}

describe('splitPreview', () => {
  it('cuts at the marker and drops it from the preview', () => {
    const body = `${words(50)}\n\n<!-- preview-end -->\n\n## Rahasia\n\n${words(200)}`;
    const result = splitPreview(body);
    expect(result?.source).toBe('marker');
    expect(result?.preview).toBe(words(50));
    expect(result?.lockedHeadings).toEqual(['Rahasia']);
  });

  it('ignores a marker with nothing above or below it', () => {
    expect(splitPreview(`<!-- preview-end -->\n\n${words(40)}`)).toBeNull();
    expect(splitPreview(`${words(40)}\n\n<!-- preview-end -->`)).toBeNull();
  });

  it('stops at the end of the first section that reaches the target', () => {
    // 1000 words: target 200. Intro 60 + A 160 = 220 (22%) before "B".
    const body = [words(60), '## A', words(160), '## B', words(400), '## C', words(380)].join('\n\n');
    const result = splitPreview(body);
    expect(result?.source).toBe('section');
    expect(result?.lockedHeadings).toEqual(['B', 'C']);
    expect(result?.ratio).toBeCloseTo(0.22, 2);
  });

  it('uses the 150-word floor on short articles', () => {
    // 400 words: 20% = 80, floor wins. Intro 100 + A 60 = 160 before "B" (40%) > 35%,
    // so the section cut is refused and a paragraph cut is used.
    const body = [words(100), '## A', words(60), '## B', words(240)].join('\n\n');
    const result = splitPreview(body);
    expect(result?.source).toBe('paragraph');
    expect(result?.ratio).toBeLessThanOrEqual(0.5);
  });

  it('falls back to a paragraph cut when the first big section passes the cap', () => {
    // 1000 words, one huge first section.
    const body = [words(100), '## Besar', ...Array.from({ length: 6 }, () => words(100)), '## Akhir', words(300)].join('\n\n');
    const result = splitPreview(body);
    expect(result?.source).toBe('paragraph');
    expect(result!.ratio).toBeLessThanOrEqual(PREVIEW_MAX_SECTION_RATIO);
    expect(result?.lockedHeadings).toEqual(['Akhir']);
  });

  it('cuts by paragraph when the article has no H2', () => {
    const body = Array.from({ length: 10 }, () => words(100)).join('\n\n');
    const result = splitPreview(body);
    expect(result?.source).toBe('paragraph');
    expect(result?.ratio).toBeCloseTo(0.2, 2);
    expect(result?.lockedHeadings).toEqual([]);
  });

  it('never cuts inside a fenced code block, even one with blank lines', () => {
    const code = ['```gherkin', words(120, 'Given'), '', words(120, 'Then'), '```'].join('\n');
    const body = [words(100), code, words(400)].join('\n\n');
    const result = splitPreview(body)!;
    const fences = result.preview.match(/```/g) ?? [];
    expect(fences.length % 2).toBe(0);
  });

  it('never cuts between list items, under a heading, or after a lead-in colon', () => {
    const list = Array.from({ length: 8 }, () => `- ${words(30)}`);
    const body = [words(100), 'Empat syarat:', ...list, '### Sub', words(60), words(500)].join('\n\n');
    const result = splitPreview(body)!;
    expect(result.preview.endsWith(':')).toBe(false);
    expect(result.preview.trimEnd().endsWith('### Sub')).toBe(false);
    // The whole list stays together: all 8 items or none.
    const items = (result.preview.match(/^- /gm) ?? []).length;
    expect([0, 8]).toContain(items);
  });

  it('returns null when too little would be locked', () => {
    expect(splitPreview(words(120))).toBeNull();
    expect(splitPreview([words(150), words(30)].join('\n\n'))).toBeNull();
  });

  it('cuts the real AC article after its first section (PRD example)', () => {
    const body = articleBody('content/qa-course/junior-qa-ready/03-acceptance-criteria-yang-bisa-dites.md');
    const result = splitPreview(body)!;
    expect(result.source).toBe('section');
    expect(result.lockedHeadings[0]).toBe('Format Given-When-Then');
    expect(result.lockedHeadings).toHaveLength(5);
    expect(result.ratio).toBeGreaterThan(0.2);
    expect(result.ratio).toBeLessThanOrEqual(PREVIEW_MAX_SECTION_RATIO);
  });
});

describe('stripPreviewMarker', () => {
  it('removes the marker line and keeps everything else', () => {
    const body = `Satu\n\n<!-- preview-end -->\n\n## Dua\n\nTiga`;
    expect(stripPreviewMarker(body)).toBe('Satu\n\n## Dua\n\nTiga');
  });
});

describe('countWords', () => {
  it('skips markdown punctuation tokens', () => {
    expect(countWords('## Judul | --- | **tebal** - item')).toBe(3);
  });
});
