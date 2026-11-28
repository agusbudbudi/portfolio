import React from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Download, User } from 'lucide-react';
import { useQaLibraryArticle } from '../hooks/useQaLibraryArticle';
import { useQaLibraryArticles } from '../hooks/useQaLibraryArticles';
import { useQaLibraryCategories } from '../hooks/useQaLibraryCategories';
import QaLibraryArticleCard from '../components/QaLibraryArticleCard';
import Seo from '../../../components/common/Seo';
import LoadingState from '../../../components/common/LoadingState';
import NotFoundState from '../../../components/common/NotFoundState';
import CourseLessonMode from '../../qa-course/components/CourseLessonMode';
import CourseMembershipBanner from '../../qa-course/components/CourseMembershipBanner';
import ArticlePreviewLock from '../../qa-course/components/ArticlePreviewLock';
import { MARKDOWN_COMPONENTS } from '../../../lib/markdownComponents';

function formatBytes(bytes: number | undefined): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

function formatUpdatedDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

const QaLibraryArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  // ?course=<slug>: the article is being read as a lesson of that course.
  const courseSlug = useSearchParams()[0].get('course');
  const { article, loading, notFound, error } = useQaLibraryArticle(slug, courseSlug);
  const { categories } = useQaLibraryCategories();
  const { articles: allArticles } = useQaLibraryArticles();

  if (loading) {
    return <LoadingState className="min-h-[60vh] pt-16" />;
  }

  if (notFound || error || !article) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 font-ld-sans">
        <NotFoundState
          illustrationLabel="?"
          title="Artikel tidak ditemukan"
          description="Artikel yang kamu cari tidak tersedia atau sudah dipindahkan."
          actionTo="/qa-library"
          actionLabel="Kembali ke QA Library"
          actionIcon={<ArrowLeft size={16} />}
        />
      </div>
    );
  }

  const categoryLabel = categories.find((c) => c.id === article.categoryId)?.label ?? article.categoryId;
  const categoryLabelFor = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  // Summary rows don't carry authorUserId, only authorName — match on that.
  const moreFromAuthor = allArticles
    .filter((a) => a.id !== article.id && a.authorName === article.authorName)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const head = (
    <>
      <h1 className="font-ld-display font-semibold text-2xl sm:text-3xl text-ld-onyx tracking-[-0.02em] leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta: category chip, then author with one quiet stats line under the
          name. Stacks on phones, one row from sm up; each stat stays whole
          (nowrap) so the line only ever breaks between items. */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <span className="self-start sm:self-auto inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet">
          {categoryLabel}
        </span>
        <div className="flex items-center gap-2.5 min-w-0">
          {article.authorAvatarUrl ? (
            <img src={article.authorAvatarUrl} alt="" className="w-7 h-7 rounded-full object-cover object-top border border-ld-frost shrink-0" />
          ) : (
            <span className="w-7 h-7 rounded-full bg-ld-cloud border border-ld-frost flex items-center justify-center text-ld-steel shrink-0">
              <User size={14} />
            </span>
          )}
          <div className="min-w-0">
            <p className="m-0 text-sm font-medium text-ld-graphite leading-tight">{article.authorName}</p>
            <p className="m-0 mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ld-steel">
              <span className="whitespace-nowrap">{article.readingTimeMinutes} menit baca</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{article.viewCount.toLocaleString('id-ID')} dilihat</span>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{formatUpdatedDate(article.updatedAt)}</span>
            </p>
          </div>
        </div>
      </div>

      {article.thumbnailUrl && (
        <img
          src={article.thumbnailUrl}
          alt={article.title}
          className="w-full aspect-video object-cover object-top rounded-xl border border-ld-frost mb-8"
        />
      )}
    </>
  );

  const body = (
    <div className="text-ld-onyx text-[17px] md:text-lg leading-[1.75] markdown-body prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>{article.body}</ReactMarkdown>
    </div>
  );

  // Course-only article read from the library: the API sent only its top.
  // The last lines fade out (nothing is hidden client-side; the rest was
  // never sent), then the lock card leads to the course.
  const preview = !courseSlug ? article.preview : undefined;
  const previewBody = preview && (
    <>
      <div className="relative">
        {body}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-white/0 to-white" />
      </div>
      <ArticlePreviewLock articleId={article.id} articleSlug={article.slug} preview={preview} />
    </>
  );

  const extras = (
    <>
      {article.docUrl && (
        <a
          href={article.docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2.5 px-4 py-3 rounded-lg border border-ld-frost bg-white hover:border-ld-violet no-underline transition-colors"
        >
          <Download size={16} className="text-ld-violet shrink-0" />
          <span className="text-sm text-ld-onyx font-medium">
            {article.docFilename ?? 'Unduh dokumen'}
            {article.docSizeBytes ? <span className="text-ld-fog font-normal"> ({formatBytes(article.docSizeBytes)})</span> : null}
          </span>
        </a>
      )}

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-ld-frost/60">
          {article.tags.map((tag) => (
            <span key={tag} className="px-2.5 py-1 rounded-md text-xs text-ld-slate bg-ld-cloud">#{tag}</span>
          ))}
        </div>
      )}
    </>
  );

  return (
    <article className="font-ld-sans pb-16">
      <Seo
        path={`/qa-library/${article.slug}`}
        title={article.seoMetaTitle || `${article.title} | QA Library`}
        description={article.seoMetaDescription || article.excerpt}
        image={article.seoOgImage || article.thumbnailUrl}
        noindex={article.status !== 'published'}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          image: article.thumbnailUrl ? [article.thumbnailUrl] : undefined,
          datePublished: article.createdAt,
          dateModified: article.updatedAt,
          author: { '@type': 'Person', name: article.authorName },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.mentorqa.com/qa-library/${article.slug}` },
          // Preview of a course-only article: point to the course that has the rest.
          isPartOf: article.preview?.courses[0]
            ? { '@type': 'Course', name: article.preview.courses[0].title, url: `https://www.mentorqa.com/courses/${article.preview.courses[0].slug}` }
            : undefined,
        }}
      />

      {courseSlug ? (
        <CourseLessonMode
          key={`${courseSlug}:${article.id}`}
          courseSlug={courseSlug}
          articleId={article.id}
          head={head}
          extras={extras}
        >
          {body}
        </CourseLessonMode>
      ) : (
        <div className="max-w-3xl mx-auto px-4 pt-24 md:pt-28">
          <Link
            to="/qa-library"
            className="inline-flex items-center gap-1.5 text-sm text-ld-slate hover:text-ld-violet no-underline mb-6"
          >
            <ArrowLeft size={15} /> Kembali ke QA Library
          </Link>
          {head}
          {article.status === 'published' && <CourseMembershipBanner articleId={article.id} articleSlug={article.slug} />}
          {previewBody || (
            <>
              {body}
              {extras}
            </>
          )}
        </div>
      )}

      {/* Hidden while reading inside a course: keep the learner on the path. */}
      {!courseSlug && moreFromAuthor.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-12 pt-10 border-t border-ld-frost/60">
          <h2 className="font-ld-display font-semibold text-xl text-ld-onyx mb-5">
            Lainnya dari {article.authorName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {moreFromAuthor.map((related) => (
              <QaLibraryArticleCard key={related.id} article={related} categoryLabel={categoryLabelFor(related.categoryId)} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default QaLibraryArticleDetailPage;
