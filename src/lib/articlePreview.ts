// Preview cut for course-only QA Library articles shown in the public
// library: the top of the article stays readable, the rest is locked and
// leads to the course. Pure (no browser or Node APIs): the API truncates with
// it and the admin UI uses it to show where the public cut lands.

/** Share of the article's words the automatic cut aims for. */
export const PREVIEW_TARGET_RATIO = 0.2;
/** The preview never stops before this many words (short articles). */
export const PREVIEW_MIN_WORDS = 150;
/** A section cut longer than this falls back to a paragraph cut. */
export const PREVIEW_MAX_SECTION_RATIO = 0.35;
/** Less than this many locked words: not worth a lock, show it all. */
export const PREVIEW_MIN_LOCKED_WORDS = 80;

/** Author-placed cut: everything above it is the preview. */
export const PREVIEW_MARKER = '<!-- preview-end -->';
const MARKER_RE = /^\s*<!--\s*preview-end\s*-->\s*$/i;

export interface ArticlePreview {
  /** Markdown shown to the public (marker removed). */
  preview: string;
  /** H2 headings below the cut, plain text, in order. */
  lockedHeadings: string[];
  /** Preview words / article words, 0..1. */
  ratio: number;
  /** How the cut was chosen. */
  source: 'marker' | 'section' | 'paragraph';
}

interface Block {
  text: string;
  words: number;
  /** Plain-text H2 title, when the block is an H2 heading. */
  h2?: string;
  isMarker: boolean;
  isHeading: boolean;
  isList: boolean;
  /** Starts indented: continues the block above it (nested list, code). */
  isIndented: boolean;
}

const LIST_RE = /^\s*([-*+]|\d+[.)])\s+/;
const FENCE_RE = /^\s*(```|~~~)/;

export function countWords(markdown: string): number {
  return markdown.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

function headingText(line: string): string {
  return line
    .replace(/^##\s+/, '')
    .replace(/[*_`]/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();
}

/**
 * Top-level blocks separated by blank lines. A fenced code block is one block
 * even when it holds blank lines, so a cut never lands inside it.
 */
function toBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  let current: string[] = [];
  let inFence = false;

  const flush = () => {
    if (current.length === 0) return;
    const text = current.join('\n');
    const first = current[0];
    const isMarker = current.length === 1 && MARKER_RE.test(first);
    blocks.push({
      text,
      words: isMarker ? 0 : countWords(text),
      h2: /^##\s+/.test(first) ? headingText(first) : undefined,
      isMarker,
      isHeading: /^#{1,6}\s/.test(first),
      isList: LIST_RE.test(first),
      isIndented: /^(\s{2,}|\t)/.test(first),
    });
    current = [];
  };

  for (const line of body.replace(/\r\n/g, '\n').split('\n')) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
      current.push(line);
      if (!inFence) flush();
      continue;
    }
    if (inFence) { current.push(line); continue; }
    if (line.trim() === '') { flush(); continue; }
    // A heading always starts its own block, even without a blank line above.
    if (/^#{1,6}\s/.test(line)) flush();
    current.push(line);
    if (/^#{1,6}\s/.test(line)) flush();
  }
  flush();
  return blocks;
}

/**
 * Can the preview stop right before block `i`? Never inside a list or an
 * indented continuation, right under a heading, or after a lead-in line
 * ("...empat syarat:") whose list or table would be cut off.
 */
function isSafeCut(blocks: Block[], i: number): boolean {
  if (i <= 0 || i >= blocks.length) return false;
  const prev = blocks[i - 1];
  const next = blocks[i];
  if (prev.isHeading || prev.text.trimEnd().endsWith(':')) return false;
  if (next.isIndented) return false;
  if (next.isList && prev.isList) return false;
  return true;
}

function build(blocks: Block[], cut: number, total: number, source: ArticlePreview['source']): ArticlePreview {
  const kept = blocks.slice(0, cut).filter((b) => !b.isMarker);
  const words = kept.reduce((n, b) => n + b.words, 0);
  return {
    preview: kept.map((b) => b.text).join('\n\n'),
    lockedHeadings: blocks.slice(cut).flatMap((b) => (b.h2 ? [b.h2] : [])),
    ratio: total > 0 ? words / total : 0,
    source,
  };
}

/** The body with any preview marker removed: what a full read renders. */
export function stripPreviewMarker(body: string): string {
  return toBlocks(body).filter((b) => !b.isMarker).map((b) => b.text).join('\n\n');
}

/**
 * Where the public preview of `body` ends, or null when the article is too
 * short to lock anything (then it is shown whole).
 *
 * 1. A `<!-- preview-end -->` line wins.
 * 2. Else the end of the first H2 section that brings the preview to
 *    PREVIEW_TARGET_RATIO of the words (at least PREVIEW_MIN_WORDS), as long
 *    as that stays within PREVIEW_MAX_SECTION_RATIO.
 * 3. Else the end of the first paragraph that passes that target.
 */
export function splitPreview(body: string): ArticlePreview | null {
  const blocks = toBlocks(body);
  const total = blocks.reduce((n, b) => n + b.words, 0);

  // before[i] = words in blocks[0..i-1].
  const before: number[] = [0];
  for (const b of blocks) before.push(before[before.length - 1] + b.words);
  const lockedAfter = (cut: number) => total - before[cut];

  const markerAt = blocks.findIndex((b) => b.isMarker);
  if (markerAt >= 0) {
    if (markerAt === 0 || lockedAfter(markerAt) === 0) return null;
    return build(blocks, markerAt, total, 'marker');
  }

  const target = Math.max(total * PREVIEW_TARGET_RATIO, PREVIEW_MIN_WORDS);
  const worthLocking = (cut: number) => lockedAfter(cut) >= PREVIEW_MIN_LOCKED_WORDS;

  const sectionCut = blocks.findIndex((b, i) => b.h2 !== undefined && i > 0 && before[i] >= target);
  if (sectionCut > 0 && before[sectionCut] <= total * PREVIEW_MAX_SECTION_RATIO && worthLocking(sectionCut)) {
    return build(blocks, sectionCut, total, 'section');
  }

  for (let i = 1; i < blocks.length; i++) {
    if (before[i] >= target && isSafeCut(blocks, i)) {
      return worthLocking(i) ? build(blocks, i, total, 'paragraph') : null;
    }
  }
  return null;
}
