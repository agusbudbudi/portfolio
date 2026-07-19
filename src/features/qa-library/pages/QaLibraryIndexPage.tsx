import React, { useState } from 'react';
import { useQaLibraryArticles } from '../hooks/useQaLibraryArticles';
import { useQaLibraryCategories } from '../hooks/useQaLibraryCategories';
import QaLibraryArticleCard from '../components/QaLibraryArticleCard';
import QaLibraryCategoryFilter from '../components/QaLibraryCategoryFilter';
import LoadingState from '../../../components/common/LoadingState';
import { usePagination } from '../../../hooks/usePagination';
import Pagination from '../../admin/components/shared/Pagination';

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
  const filteredArticles = activeCategoryId ? articles.filter((a) => a.categoryId === activeCategoryId) : articles;
  const { page, setPage, totalPages, pageItems: displayedArticles } = usePagination(filteredArticles, PAGE_SIZE);

  return (
    <div className="font-ld-sans pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-24 md:pt-28 pb-8 text-center">
        <h1 className="font-ld-display font-semibold text-3xl sm:text-4xl text-ld-onyx tracking-[-0.02em] mb-3">
          QA Library
        </h1>
        <p className="text-ld-slate text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          Kumpulan artikel dan materi seputar manual testing, automation testing, dan API testing untuk QA Engineer.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {visibleCategories.length > 0 && (
          <div className="mb-8">
            <QaLibraryCategoryFilter categories={visibleCategories} activeCategoryId={activeCategoryId} onChange={setActiveCategoryId} />
          </div>
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
        ) : filteredArticles.length === 0 ? (
          <p className="text-center text-sm text-ld-fog py-16">Belum ada artikel di category ini.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
