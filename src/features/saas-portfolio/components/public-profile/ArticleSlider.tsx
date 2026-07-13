import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, ImageOff } from 'lucide-react';

const ArticleSlider: React.FC<{
  articles: { id: string; url: string; title: string; description?: string; thumbnail?: string; source?: string }[];
}> = ({ articles }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-1"
      >
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col no-underline transition-shadow hover:shadow-ld-subtle-3"
          >
            <div className="w-full aspect-video overflow-hidden bg-ld-frost border-b border-ld-ash flex items-center justify-center">
              {article.thumbnail ? (
                <img src={article.thumbnail} alt={article.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <ImageOff size={24} className="text-ld-mist" />
              )}
            </div>
            <div className="p-4 flex flex-col gap-1.5 flex-grow">
              <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0 line-clamp-2">{article.title}</h4>
              {article.description && (
                <p className="text-ld-slate text-xs leading-relaxed m-0 line-clamp-2">{article.description}</p>
              )}
              {article.source && (
                <span className="inline-flex items-center gap-1 mt-auto pt-2 text-[11px] text-ld-fog">
                  <ExternalLink size={11} /> {article.source}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {articles.length > 3 && (
        <div className="flex gap-1.5 justify-end mt-3">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Sebelumnya"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Berikutnya"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleSlider;
