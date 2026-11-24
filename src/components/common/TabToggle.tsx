import React, { useId, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Brand "Tab Toggle" (docs/DESIGN.md → Components), with button radius
// (8px tabs in a 12px track) to sit with admin buttons: Cloud #f6f8fa track,
// the active tab a white chip with a subtle shadow that slides
// between options. 14px Inter Medium, Slate #666d80 inactive, Graphite
// #36394a active. For switching between views of the same thing (Flow /
// Bank pertanyaan), not for page sections.
//
//   <TabToggle value={view} onChange={setView} label="Feedback"
//     options={[{ value: 'flows', label: 'Flow', count: 3 }, { value: 'questions', label: 'Bank pertanyaan' }]} />

export interface TabToggleOption<T extends string> {
  value: T;
  label: string;
  /** Small number after the label (e.g. how many items the view holds). */
  count?: number;
}

interface Props<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: TabToggleOption<T>[];
  /** Accessible name of the tablist. */
  label: string;
  className?: string;
}

function TabToggle<T extends string>({ value, onChange, options, label, className = '' }: Props<T>) {
  const reduce = useReducedMotion();
  const pillId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs (WAI-ARIA tabs pattern, automatic activation).
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : delta ? (i + delta + options.length) % options.length : -1;
    if (to < 0) return;
    e.preventDefault();
    onChange(options[to].value);
    refs.current[to]?.focus();
  };

  return (
    <div role="tablist" aria-label={label} className={`inline-flex items-center gap-1 p-1 rounded-xl bg-ld-cloud ${className}`}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap border-none bg-transparent cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ld-violet ${
              active ? 'text-ld-graphite' : 'text-ld-slate hover:text-ld-graphite'
            }`}
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : pillId}
                className="absolute inset-0 rounded-lg bg-white shadow-[0_1px_3px_rgba(39,40,53,0.1),0_1px_2px_rgba(39,40,53,0.06)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                aria-hidden="true"
              />
            )}
            <span className="relative">{o.label}</span>
            {o.count !== undefined && (
              <span
                className={`relative min-w-5 px-1.5 rounded-md text-[11px] leading-5 tabular-nums text-center transition-colors ${
                  active ? 'bg-ld-lilac text-ld-violet' : 'bg-ld-frost text-ld-steel'
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default TabToggle;
