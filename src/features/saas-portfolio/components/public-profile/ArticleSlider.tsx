import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ExternalLink, ImageOff } from 'lucide-react';
import { useEdgeGutter } from '../../../../hooks/useEdgeGutter';

export interface SliderHandle {
  scroll: (dir: 'left' | 'right') => void;
}

const ArticleSlider = forwardRef<SliderHandle, {
  articles: { id: string; url: string; title: string; description?: string; thumbnail?: string; source?: string }[];
}>(({ articles }, ref) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [wrapRef, gutter] = useEdgeGutter<HTMLDivElement>();

  useImperativeHandle(ref, () => ({
    scroll: (dir) => {
      const el = sliderRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.9;
      el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    },
  }));

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative w-screen left-1/2 -translate-x-1/2">
        <div
          ref={sliderRef}
          style={{ paddingLeft: gutter, scrollPaddingLeft: gutter }}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-none snap-x snap-mandatory scroll-pr-4 pr-4 pb-1"
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
      </div>
    </div>
  );
});

ArticleSlider.displayName = 'ArticleSlider';

export default ArticleSlider;
