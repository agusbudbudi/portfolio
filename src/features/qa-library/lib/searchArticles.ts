import type { QaLibraryArticleSummary } from '../../../types/qaLibrary';

/** Lowercase, accents folded, punctuation as spaces: "Given-When-Then" → "given when then". */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Articles matching every word of `query` (in any order) across title,
 * excerpt, tags, author, category label and course title. Title hits rank
 * first; otherwise the list keeps its incoming order. An empty query returns
 * the list unchanged.
 */
export function searchArticles(
  articles: QaLibraryArticleSummary[],
  query: string,
  categoryLabel: (id: string) => string,
): QaLibraryArticleSummary[] {
  const words = normalizeSearchText(query).split(' ').filter(Boolean);
  if (words.length === 0) return articles;

  const scored: { article: QaLibraryArticleSummary; score: number; index: number }[] = [];
  articles.forEach((article, index) => {
    const title = normalizeSearchText(article.title);
    const haystack = normalizeSearchText([
      article.title,
      article.excerpt,
      article.tags.join(' '),
      article.authorName,
      categoryLabel(article.categoryId),
      article.course?.title ?? '',
    ].join(' '));
    if (!words.every((w) => haystack.includes(w))) return;
    const score = words.filter((w) => title.includes(w)).length;
    scored.push({ article, score, index });
  });

  return scored
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((s) => s.article);
}
