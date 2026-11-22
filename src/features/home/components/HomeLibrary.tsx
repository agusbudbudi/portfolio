import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import QaLibraryArticleCard from '../../qa-library/components/QaLibraryArticleCard';
import { useQaLibraryArticles } from '../../qa-library/hooks/useQaLibraryArticles';
import { useQaLibraryCategories } from '../../qa-library/hooks/useQaLibraryCategories';

// Latest four QA Library articles. Renders nothing when the library is empty
// or unreachable (e.g. plain `npm run dev` without /api), so the home page
// never shows an empty shell.

const HomeLibrary: React.FC = () => {
  const { articles, loading } = useQaLibraryArticles();
  const { categories } = useQaLibraryCategories();
  if (!loading && articles.length === 0) return null;
  const label = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <section className="py-16 md:py-24 bg-ld-cloud border-t border-ld-frost font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Terbaru di QA Library</p>
            <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">Bacaan singkat untuk QA</h2>
          </div>
          <Link to="/qa-library" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ld-violet no-underline hover:underline shrink-0">
            Semua artikel <ArrowRight size={15} />
          </Link>
        </div>
        {/* Mobile: horizontal snap slider bleeding to the screen edges, the next
            card peeking in as a swipe hint. sm+: regular grid. */}
        <div className="-mx-4 px-4 flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible lg:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map((i) => <div key={i} className="shrink-0 w-[78%] snap-start h-[340px] rounded-xl bg-white border border-ld-frost animate-pulse sm:w-auto" />)
            : articles.slice(0, 4).map((a) => (
                <div key={a.id} className="shrink-0 w-[78%] snap-start flex sm:w-auto [&>*]:flex-1">
                  <QaLibraryArticleCard article={a} categoryLabel={label(a.categoryId)} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default HomeLibrary;
