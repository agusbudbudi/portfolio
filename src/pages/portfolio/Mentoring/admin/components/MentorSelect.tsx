import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, User as UserIcon } from 'lucide-react';
import type { MentorConfig, TopicConfig } from '../../../../../types/mentoring';

// Searchable single-select with avatar — admin equivalent of the public
// MentorField carousel, built for scanning a mentor list by name instead of
// scrolling cards.
interface MentorSelectProps {
  mentors: MentorConfig[];
  topics: TopicConfig[];
  value: string;
  onChange: (mentorId: string) => void;
  error: string | null;
}

const Avatar: React.FC<{ mentor: MentorConfig; size?: number }> = ({ mentor, size = 28 }) => (
  mentor.avatar ? (
    <img
      src={mentor.avatar}
      alt=""
      className="rounded-full object-cover border border-ld-frost shrink-0"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="rounded-full bg-ld-lilac text-ld-violet border border-ld-frost shrink-0 flex items-center justify-center font-medium"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {mentor.name.charAt(0)}
    </span>
  )
);

const MentorSelect: React.FC<MentorSelectProps> = ({ mentors, topics, value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const closeDropdown = () => { setOpen(false); setQuery(''); };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selectedMentor = mentors.find((m) => m.id === value) ?? null;
  const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? id;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;
    return mentors.filter((m) => m.name.toLowerCase().includes(q));
  }, [mentors, query]);

  const select = (mentorId: string) => {
    onChange(mentorId);
    closeDropdown();
  };

  return (
    <div className="flex flex-col gap-2" ref={rootRef}>
      <label className="flex items-center gap-2 text-sm font-medium text-ld-graphite">
        <UserIcon size={15} className="text-ld-violet flex-shrink-0" />
        Mentor <span className="text-red-500 ml-0.5">*</span>
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => (open ? closeDropdown() : setOpen(true))}
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-white text-left text-sm cursor-pointer transition-colors ${
            error ? 'border-red-500' : 'border-ld-frost hover:border-ld-violet'
          }`}
        >
          {selectedMentor ? (
            <span className="flex items-center gap-2.5 min-w-0">
              <Avatar mentor={selectedMentor} />
              <span className="text-ld-onyx font-medium truncate">{selectedMentor.name}</span>
            </span>
          ) : (
            <span className="text-ld-fog">Pilih mentor</span>
          )}
          <ChevronDown size={15} className={`text-ld-fog flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-ld-frost bg-white shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.12)_0px_12px_24px_-8px]">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-ld-frost/60">
              <Search size={14} className="text-ld-fog flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari mentor…"
                className="w-full text-sm outline-none border-none bg-transparent text-ld-onyx placeholder:text-ld-fog"
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="px-2.5 py-3 text-xs text-ld-fog text-center m-0">Mentor tidak ditemukan.</p>
              )}
              {filtered.map((mentor) => {
                const selected = mentor.id === value;
                return (
                  <button
                    key={mentor.id}
                    type="button"
                    onClick={() => select(mentor.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border-none transition-colors ${
                      selected ? 'bg-ld-lilac/60' : 'bg-transparent hover:bg-ld-cloud'
                    }`}
                  >
                    <Avatar mentor={mentor} size={32} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ld-onyx truncate">{mentor.name}</span>
                      <span className="block text-[11px] text-ld-fog truncate">{mentor.expertise.map(topicLabel).join(', ')}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
};

export default MentorSelect;
