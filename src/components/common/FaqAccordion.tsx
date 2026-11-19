import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Shared FAQ accordion for every landing (home, /mentoring, /portfolio,
// /qa-simulator).
// - One item open at a time; the first is open by default. Opening another
//   collapses the current one; clicking the open one closes it.
// - Smooth expand/collapse via a CSS grid-rows 0fr → 1fr transition, so the
//   real content height animates without measuring.
// - Answers always stay in the DOM (just collapsed), keeping them crawlable
//   and in sync with the pages' FAQPage JSON-LD.

export interface FaqItem { q: string; a: string }

const FaqAccordion: React.FC<{ items: FaqItem[]; defaultOpen?: number | null; className?: string }> = ({
  items,
  defaultOpen = 0,
  className = '',
}) => {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();

  return (
    <div className={`max-w-3xl mx-auto space-y-3 ${className}`}>
      {items.map((faq, i) => {
        const isOpen = open === i;
        const btnId = `${base}-q${i}`;
        const panelId = `${base}-a${i}`;
        return (
          <div
            key={faq.q}
            className={`rounded-xl border overflow-hidden bg-ld-canvas transition-colors duration-300 ${isOpen ? 'border-ld-lavender' : 'border-ld-ash'}`}
          >
            <h3 className="m-0">
              <button
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-transparent border-none cursor-pointer hover:bg-ld-cloud transition-colors"
              >
                <span className="text-sm font-medium text-ld-graphite leading-snug">{faq.q}</span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180 text-ld-violet' : 'text-ld-fog'}`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="min-h-0 overflow-hidden">
                <p
                  className={`m-0 px-5 pb-5 pt-4 border-t border-ld-ash text-sm text-ld-slate leading-relaxed transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
