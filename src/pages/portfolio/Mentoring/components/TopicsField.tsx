// TopicsField – horizontal slider, selection capped at maxSelectable (bookingRules.maxTopicsSelectable)
import React, { useRef } from 'react';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TopicConfig } from '../../../../hooks/useConfig';

interface TopicsFieldProps {
  topics: TopicConfig[];
  selected: string[];
  maxSelectable: number;
  onChange: (selected: string[]) => void;
  error: string | null;
}

const TopicsField: React.FC<TopicsFieldProps> = ({ topics, selected, maxSelectable, onChange, error }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleToggle = (topicId: string) => {
    if (selected.includes(topicId)) {
      onChange(selected.filter((id) => id !== topicId));
    } else {
      if (selected.length >= maxSelectable) return;
      onChange([...selected, topicId]);
    }
  };

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' });
  };

  const navBtnCls = [
    'w-7 h-7 flex items-center justify-center rounded-lg border cursor-pointer transition-all duration-150',
    'bg-white border-ld-ash',
    'text-ld-slate hover:text-ld-violet hover:border-ld-violet',
  ].join(' ');

  return (
    <div className="flex flex-col gap-2">
      {/* Label Row */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-ld-graphite">
          <BookOpen size={15} className="text-ld-violet flex-shrink-0" />
          Topik yang Ingin Dibahas <span className="text-red-500 ml-0.5">*</span>
        </label>
        <div className="flex gap-1.5 flex-shrink-0">
          <button type="button" className={navBtnCls} onClick={() => scroll('left')} aria-label="Sebelumnya"><ChevronLeft size={15} /></button>
          <button type="button" className={navBtnCls} onClick={() => scroll('right')} aria-label="Berikutnya"><ChevronRight size={15} /></button>
        </div>
      </div>

      <p className="text-[11px] text-ld-slate">Pilih 1–{maxSelectable} topik yang ingin dipelajari</p>

      {/* Topics Slider Container */}
      <div className="overflow-hidden -mx-1 px-1 py-1">
        <div
          ref={sliderRef}
          className="flex gap-3 overflow-x-auto scroll-smooth"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          role="group"
          aria-label="Daftar topik"
        >
          {topics.map((topic) => {
            const isSelected = selected.includes(topic.id);
            const isDisabled = !isSelected && selected.length >= maxSelectable;

            return (
              <button
                key={topic.id}
                id={`topic-${topic.id}`}
                type="button"
                disabled={isDisabled}
                onClick={() => handleToggle(topic.id)}
                aria-pressed={isSelected}
                className={[
                  'relative overflow-hidden flex-none w-[280px] flex items-center gap-3.5 p-2.5 rounded-xl text-left border transition-all duration-150',
                  isSelected
                    ? 'border-ld-violet bg-ld-lilac/40'
                    : isDisabled
                      ? 'border-ld-ash bg-white opacity-40 cursor-not-allowed'
                      : 'border-ld-ash bg-white hover:border-ld-violet hover:bg-ld-cloud cursor-pointer',
                ].join(' ')}
              >
                {isSelected && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-ld-violet flex items-center justify-center rounded-bl-lg">
                    <CheckCircle2 size={10} className="text-white" />
                  </span>
                )}
                {topic.image && (
                  <img
                    src={topic.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-lg flex-shrink-0 object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-xs font-medium text-ld-graphite leading-snug truncate">{topic.label}</span>
                  <p className="text-[10px] text-ld-slate leading-relaxed line-clamp-2">{topic.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
};

export default TopicsField;
