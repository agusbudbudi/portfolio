// The public face of a QA Library article, shared by the JSON API
// (_endpoints/qa-library.ts) and the bot HTML (qa-library-og.ts) so crawlers
// and readers always get the same content.
import type { QaLibraryArticle } from '../../src/types/qaLibrary.js';
import { splitPreview, stripPreviewMarker } from '../../src/lib/articlePreview.js';
import { publishedCoursesForArticle } from './qaCourseStore.js';

/**
 * What a non-admin reader gets. A course-only article that a published course
 * uses is cut to its preview (src/lib/articlePreview.ts) unless the request is
 * a lesson read, `?course=<slug>` of one of those courses: the rest of the
 * article lives in the course. Everything else is sent whole, marker removed.
 */
export async function publicArticleView(article: QaLibraryArticle, courseParam: string | undefined): Promise<QaLibraryArticle> {
  const whole = { ...article, body: stripPreviewMarker(article.body) };
  if (article.visibility !== 'course-only') return whole;

  const courses = await publishedCoursesForArticle(article.id);
  if (courses.length === 0 || courses.some((c) => c.slug === courseParam)) return whole;

  const cut = splitPreview(article.body);
  if (!cut) return whole;
  return {
    ...article,
    body: cut.preview,
    docUrl: undefined,
    docFilename: undefined,
    docSizeBytes: undefined,
    preview: {
      lockedHeadings: cut.lockedHeadings,
      previewWordRatio: Math.round(cut.ratio * 100) / 100,
      courses,
      hasAttachment: Boolean(article.docUrl),
    },
  };
}
