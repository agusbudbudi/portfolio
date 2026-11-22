import React from 'react';
import { CheckCircle2, type LucideIcon } from 'lucide-react';

// Row of small "trust" chips under a landing hero's CTAs (e.g. Gratis,
// ±4 jam). Each chip: white pill, tinted icon disc, short label.
// Icon is optional per item; falls back to a check mark.

export interface HeroTrustChip {
  label: string;
  icon?: LucideIcon;
}

interface HeroTrustChipsProps {
  items: HeroTrustChip[];
  className?: string;
}

const HeroTrustChips: React.FC<HeroTrustChipsProps> = ({ items, className = '' }) => (
  <ul className={`m-0 p-0 list-none flex flex-wrap gap-2 ${className}`}>
    {items.map(({ label, icon: Icon = CheckCircle2 }) => (
      <li
        key={label}
        className="group inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-ld-frost bg-white text-ld-graphite text-xs font-medium shadow-[0_1px_2px_rgba(26,27,37,0.04)] transition-colors hover:border-ld-lavender"
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-6 h-6 rounded-full bg-ld-lilac text-ld-violet transition-colors group-hover:bg-ld-violet group-hover:text-white"
        >
          <Icon size={13} strokeWidth={2.25} />
        </span>
        {label}
      </li>
    ))}
  </ul>
);

export default HeroTrustChips;
