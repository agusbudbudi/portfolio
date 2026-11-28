import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useQaLibraryArticles } from '../hooks/useQaLibraryArticles';
import { useQaLibraryCategories } from '../hooks/useQaLibraryCategories';
import QaLibraryArticleCard from '../components/QaLibraryArticleCard';
import QaLibraryCategoryFilter from '../components/QaLibraryCategoryFilter';
import LoadingState from '../../../components/common/LoadingState';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../admin/components/shared/Pagination';
import QaLibraryHeroArt from '../components/QaLibraryHeroArt';
import CoursePromoStrip from '../../qa-course/components/CoursePromoStrip';
import { searchArticles } from '../lib/searchArticles';

const PAGE_SIZE = 12;

const QaLibraryIndexPage: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
  // Fetched unfiltered — filtering happens client-side below so the category
  // chips can be limited to categories that actually have a published
  // article, not the full taxonomy.
  const { articles, loading, error, retry } = useQaLibraryArticles();
  const { categories } = useQaLibraryCategories();
  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  const categoryIdsWithArticles = new Set(articles.map((a) => a.categoryId));
  const visibleCategories = categories.filter((c) => categoryIdsWithArticles.has(c.id));
  // ?q= keeps a search shareable and survives back navigation from an article.
  // The input reads local state, not the URL: a router navigation per
  // keystroke lands asynchronously and would drop fast typing.
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQueryState] = useState(() => searchParams.get('q') ?? '');
  const inCategory = activeCategoryId ? articles.filter((a) => a.categoryId === activeCategoryId) : articles;
  const filteredArticles = searchArticles(inCategory, query, categoryLabel);
  const { page, setPage, totalPages, pageItems: displayedArticles } = usePagination(filteredArticles, PAGE_SIZE);

  const setQuery = (value: string) => {
    setQueryState(value);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('q', value); else next.delete('q');
      return next;
    }, { replace: true });
    setPage(1);
  };
  const trimmedQuery = query.trim();

  return (
    <div className="font-ld-sans pb-16">
      {/* Compact hero: copy left, small bookshelf art right (md+), on a soft
          full-bleed brand gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-ld-lilac via-ld-cloud to-white mb-8">
      <div aria-hidden="true" className="pointer-events-none absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-white/70 blur-3xl" />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-24 md:pt-28 pb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          {/* Same hero pattern as /courses and /qa-simulator: product eyebrow,
              then a keyword-led H1 (what people search for) with the
              benefit in Sky Blue. */}
          <p className="m-0 mb-3 text-xs font-medium uppercase tracking-[0.06em] text-ld-steel">QA Library</p>
          <h1 className="m-0 mb-4 font-ld-display font-semibold text-[32px] sm:text-[40px] lg:text-[44px] leading-[1.08] tracking-[-0.025em] text-ld-graphite">
            Artikel Software Testing <span className="text-ld-violet">untuk QA Engineer</span>
          </h1>
          <p className="text-ld-slate text-sm sm:text-base leading-relaxed max-w-xl m-0">
            Belajar manual testing, test case, API testing, automation, sampai AI di QA dari praktisi. Bahasa Indonesia, gratis dibaca tanpa login.
          </p>
          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-5">
            <label htmlFor="qa-library-search" className="sr-only">Cari artikel</label>
            <div className="relative w-full md:max-w-md">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ld-steel" />
              <input
                id="qa-library-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape' && query) { e.preventDefault(); setQuery(''); } }}
                placeholder="Cari artikel, topik, atau tag"
                autoComplete="off"
                className="w-full h-11 pl-10 pr-10 rounded-lg border border-ld-ash bg-white shadow-[0_2px_8px_rgba(39,40,53,0.06)] text-[15px] text-ld-onyx placeholder:text-ld-fog outline-none transition-colors focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac [&::-webkit-search-cancel-button]:appearance-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md border-none bg-transparent text-ld-steel hover:bg-ld-cloud hover:text-ld-onyx cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="hidden md:block">
          <QaLibraryHeroArt />
        </div>
      </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <CoursePromoStrip />

        {visibleCategories.length > 0 && (
          <div className="mb-8">
            <QaLibraryCategoryFilter
              categories={visibleCategories}
              activeCategoryId={activeCategoryId}
              onChange={(id) => { setActiveCategoryId(id); setPage(1); }}
            />
          </div>
        )}

        {!loading && !error && trimmedQuery && filteredArticles.length > 0 && (
          <p className="m-0 -mt-3 mb-5 text-sm text-ld-slate" aria-live="polite">
            {filteredArticles.length} artikel untuk <span className="font-medium text-ld-onyx">"{trimmedQuery}"</span>
          </p>
        )}

        {loading ? (
          <LoadingState label="Memuat artikel…" className="min-h-[40vh]" />
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-ld-slate mb-4">{error}</p>
            <button
              onClick={retry}
              className="px-5 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium cursor-pointer border-none hover:bg-[#1f87e6] transition-colors"
            >
              Coba lagi
            </button>
          </div>
        ) : filteredArticles.length === 0 && trimmedQuery ? (
          <div className="text-center py-16" aria-live="polite">
            <p className="m-0 text-sm text-ld-slate">
              Tidak ada artikel untuk <span className="font-medium text-ld-onyx">"{trimmedQuery}"</span>
              {activeCategoryId ? ' di category ini' : ''}.
            </p>
            <button
              type="button"
              onClick={() => { setQuery(''); setActiveCategoryId(undefined); }}
              className="mt-4 px-4 py-2 rounded-lg border border-ld-ash bg-white text-sm font-medium text-ld-graphite cursor-pointer hover:border-ld-violet hover:text-ld-violet transition-colors"
            >
              Hapus pencarian dan filter
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <p className="text-center text-sm text-ld-fog py-16">Belum ada artikel di category ini.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayedArticles.map((article) => (
                <QaLibraryArticleCard key={article.id} article={article} categoryLabel={categoryLabel(article.categoryId)} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={filteredArticles.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default QaLibraryIndexPage;
