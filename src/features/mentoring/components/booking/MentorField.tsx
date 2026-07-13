// MentorField – horizontal card slider using Tailwind CSS (light & dark mode support)
import React, { useRef } from 'react';
import { User as UserIcon, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MentorConfig } from '../../../../hooks/useConfig';
import { mentorHasSlotsOnDate } from '../../../../lib/dates';

interface MentorFieldProps {
  mentors: MentorConfig[];
  selectedTopics: string[];
  selectedDate: string;
  value: string;
  onChange: (mentorId: string) => void;
  error: string | null;
}

const MentorField: React.FC<MentorFieldProps> = ({ mentors, selectedTopics, selectedDate, value, onChange, error }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const filteredMentors = (selectedTopics.length === 0
    ? mentors
    : mentors.filter((m) => selectedTopics.every((t) => m.expertise.includes(t)))
  ).sort((a, b) => {
    if (!selectedDate) return 0;
    const aAvail = mentorHasSlotsOnDate(a, selectedDate);
    const bAvail = mentorHasSlotsOnDate(b, selectedDate);
    return aAvail === bAvail ? 0 : aAvail ? -1 : 1;
  });

  const noMatch = selectedTopics.length > 0 && filteredMentors.length === 0;

  const scroll = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({ left: dir === 'left' ? -260 : 260, behavior: 'smooth' });
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
          <UserIcon size={15} className="text-ld-violet flex-shrink-0" />
          Pilih Mentor <span className="text-red-500 ml-0.5">*</span>
        </label>
        {!noMatch && filteredMentors.length > 1 && (
          <div className="flex gap-1.5 flex-shrink-0">
            <button type="button" className={navBtnCls} onClick={() => scroll('left')} aria-label="Sebelumnya"><ChevronLeft size={15} /></button>
            <button type="button" className={navBtnCls} onClick={() => scroll('right')} aria-label="Berikutnya"><ChevronRight size={15} /></button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-ld-slate">
        {selectedTopics.length === 0
          ? 'Pilih topik terlebih dahulu untuk melihat mentor yang tersedia'
          : 'Mentor difilter berdasarkan topik yang kamu pilih'}
      </p>

      {noMatch ? (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl border border-dashed border-amber-300 text-amber-600 text-xs bg-amber-50/30">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>Tidak ada mentor yang menguasai kombinasi topik ini</span>
        </div>
      ) : (
        <div
          className="overflow-hidden -mx-1 px-1 py-1"
          role="radiogroup"
          aria-describedby={error ? 'mentor-error' : undefined}
        >
          <div
            ref={sliderRef}
            className="flex gap-3 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
          >
            {filteredMentors.map((mentor) => {
              const isSelected = value === mentor.id;
              const hasSlots = selectedDate ? mentorHasSlotsOnDate(mentor, selectedDate) : true;

              return (
                <button
                  key={mentor.id}
                  id={`mentor-${mentor.id}`}
                  type="button"
                  onClick={() => hasSlots && onChange(mentor.id)}
                  disabled={!hasSlots}
                  aria-pressed={isSelected}
                  role="radio"
                  aria-checked={isSelected}
                  className={[
                    'relative overflow-hidden flex-none w-[260px] flex flex-col gap-2.5 p-3.5 rounded-xl text-left border transition-all duration-150',
                    isSelected
                      ? 'border-ld-violet bg-ld-lilac/40'
                      : !hasSlots
                        ? 'border-ld-ash bg-white opacity-40 cursor-not-allowed'
                        : 'border-ld-ash bg-white hover:border-ld-violet hover:bg-ld-cloud cursor-pointer',
                  ].join(' ')}
                >
                  {isSelected && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-ld-violet flex items-center justify-center rounded-bl-lg">
                      <CheckCircle2 size={10} className="text-white" />
                    </span>
                  )}
                  {/* Header: avatar + name/bio */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={mentor.avatar || '/admin/img/default-avatar-mentor.webp'}
                        alt={mentor.name}
                        loading="lazy"
                        decoding="async"
                        className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                        onError={(e) => { e.currentTarget.src = '/admin/img/default-avatar-mentor.webp'; }}
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-ld-graphite leading-snug">{mentor.name}</span>
                        <span className="text-[10px] text-ld-slate leading-snug">{mentor.bio}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise badges */}
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 5).map((expId: string) => {
                      const isMatch = selectedTopics.includes(expId);
                      return (
                        <span
                          key={expId}
                          className={`text-[9px] px-2 py-0.5 rounded-full font-medium border capitalize transition-colors ${isMatch
                            ? 'bg-ld-lilac border-ld-lavender text-ld-violet'
                            : 'bg-white border-ld-ash text-ld-slate'
                            }`}
                        >
                          {expId.replace(/-/g, ' ')}
                        </span>
                      );
                    })}
                    {mentor.expertise.length > 5 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-medium border bg-ld-cloud border-ld-ash text-ld-slate">
                        +{mentor.expertise.length - 5} lainnya
                      </span>
                    )}
                  </div>

                  {!hasSlots && selectedDate && (
                    <p className="text-[10px] text-red-500">Tidak tersedia di tanggal yang kamu pilih</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}


      {error && <p id="mentor-error" className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
    </div>
  );
};

export default MentorField;
