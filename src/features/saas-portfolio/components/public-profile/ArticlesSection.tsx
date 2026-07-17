import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';
import type { ArticleEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';
import ArticleSlider, { type SliderHandle } from './ArticleSlider';

const ArticlesSection: React.FC<{ articles: ArticleEntry[] }> = ({ articles }) => {
  const sliderRef = useRef<SliderHandle>(null);

  return (
    <section className="mb-14">
      <SectionHeading
        icon={<Newspaper size={20} />}
        iconClassName="bg-amber-500/10 text-amber-500"
        title="Article"
        subtitle="Tulisan dan publikasi yang pernah dibuat."
        action={articles.length > 3 && (
          <div className="hidden md:flex gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => sliderRef.current?.scroll('left')}
              aria-label="Sebelumnya"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => sliderRef.current?.scroll('right')}
              aria-label="Berikutnya"
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      />
      <ArticleSlider ref={sliderRef} articles={articles} />
    </section>
  );
};

export default ArticlesSection;
