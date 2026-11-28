import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { QaLibraryCategory } from '../../../types/qaLibrary';

interface QaLibraryCategoryFilterProps {
  categories: QaLibraryCategory[];
  activeCategoryId: string | undefined;
  onChange: (categoryId: string | undefined) => void;
}

const chipClass = (active: boolean) =>
  `shrink-0 snap-start whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium cursor-pointer border transition-colors ${
    active ? 'bg-ld-violet text-white border-ld-violet' : 'bg-white text-ld-graphite border-ld-frost hover:border-ld-violet'
  }`;

const arrowClass =
  'hidden md:flex absolute top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full border border-ld-ash bg-white text-ld-graphite shadow-[0_2px_8px_rgba(39,40,53,0.12)] cursor-pointer hover:text-ld-violet hover:border-ld-violet transition-colors';

/**
 * One-row category slider: swipe on phones, arrows on desktop (shown only
 * when there is more to scroll that way), edges fade where chips continue.
 * The active chip is scrolled into view when it changes.
 */
const QaLibraryCategoryFilter: React.FC<QaLibraryCategoryFilterProps> = ({ categories, activeCategoryId, onChange }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [update, categories.length]);

  useEffect(() => {
    trackRef.current
      ?.querySelector<HTMLElement>('[aria-pressed="true"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }, [activeCategoryId]);

  const scrollBy = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  const fade = `${canLeft ? 'transparent, black 40px' : 'black'}, ${canRight ? 'black calc(100% - 40px), transparent' : 'black'}`;

  return (
    <div className="relative" role="group" aria-label="Filter category">
      {canLeft && (
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Category sebelumnya" className={`${arrowClass} -left-3`}>
          <ChevronLeft size={16} />
        </button>
      )}
      <div
        ref={trackRef}
        onScroll={update}
        className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-px-4 md:scroll-px-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 py-0.5"
        style={{ maskImage: `linear-gradient(to right, ${fade})`, WebkitMaskImage: `linear-gradient(to right, ${fade})` }}
      >
        <button type="button" aria-pressed={!activeCategoryId} onClick={() => onChange(undefined)} className={chipClass(!activeCategoryId)}>
          Semua
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={activeCategoryId === category.id}
            onClick={() => onChange(category.id)}
            className={chipClass(activeCategoryId === category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>
      {canRight && (
        <button type="button" onClick={() => scrollBy(1)} aria-label="Category berikutnya" className={`${arrowClass} -right-3`}>
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default QaLibraryCategoryFilter;
