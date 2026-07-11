import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Search } from 'lucide-react';
import type { TopicConfig } from '../../../../../types/mentoring';

// Searchable multi-select with checkboxes — admin equivalent of the public
// TopicsField slider, built for a long topic list where scanning pills isn't
// practical. Reusable anywhere a topic id[] needs picking, with or without a cap.
interface TopicsSelectProps {
  topics: TopicConfig[];
  selected: string[];
  maxSelectable: number;
  onChange: (selected: string[]) => void;
  error: string | null;
  label?: string;
  required?: boolean;
}

const TopicsSelect: React.FC<TopicsSelectProps> = ({
  topics, selected, maxSelectable, onChange, error, label = 'Topic', required = true,
}) => {
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => t.label.toLowerCase().includes(q));
  }, [topics, query]);

  const toggle = (topicId: string) => {
    if (selected.includes(topicId)) {
      onChange(selected.filter((id) => id !== topicId));
    } else {
      if (selected.length >= maxSelectable) return;
      onChange([...selected, topicId]);
    }
  };

  const selectedLabels = selected.map((id) => topics.find((t) => t.id === id)?.label ?? id);
  const capped = maxSelectable < topics.length;

  return (
    <div className="flex flex-col gap-2" ref={rootRef}>
      <label className="flex items-center gap-2 text-sm font-medium text-ld-graphite">
        <BookOpen size={15} className="text-ld-violet flex-shrink-0" />
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => (open ? closeDropdown() : setOpen(true))}
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border bg-white text-left text-sm cursor-pointer transition-colors ${
            error ? 'border-red-500' : 'border-ld-frost hover:border-ld-violet'
          }`}
        >
          {selectedLabels.length > 0 ? (
            <span className="flex flex-wrap gap-1.5 min-w-0">
              {selectedLabels.map((label) => (
                <span key={label} className="px-2 py-0.5 rounded-full bg-ld-lilac text-ld-violet text-[11px] font-medium whitespace-nowrap">
                  {label}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-ld-fog">{capped ? `Pilih topic (maks. ${maxSelectable})` : 'Pilih topic'}</span>
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
                placeholder="Cari topic…"
                className="w-full text-sm outline-none border-none bg-transparent text-ld-onyx placeholder:text-ld-fog"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1.5">
              {filtered.length === 0 && (
                <p className="px-2.5 py-3 text-xs text-ld-fog text-center m-0">Topic tidak ditemukan.</p>
              )}
              {filtered.map((topic) => {
                const checked = selected.includes(topic.id);
                const disabled = !checked && selected.length >= maxSelectable;
                return (
                  <label
                    key={topic.id}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-ld-cloud'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(topic.id)}
                      className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
                    />
                    <span className="text-ld-graphite">{topic.label}</span>
                  </label>
                );
              })}
            </div>
            {selected.length >= maxSelectable && (
              <p className="px-3 py-2 text-[11px] text-ld-fog border-t border-ld-frost/60 m-0">Maksimal {maxSelectable} topic tercapai.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
};

export default TopicsSelect;
