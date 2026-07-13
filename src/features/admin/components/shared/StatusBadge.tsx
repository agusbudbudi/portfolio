import React from 'react';

// Single source of truth for every status pill across the admin dashboard
// (bookings, portfolios, mentor verification) — add new statuses by mapping
// them to one of these tones rather than inventing new color classes.
export type StatusBadgeTone = 'slate' | 'sky' | 'emerald' | 'amber' | 'red' | 'violet';

const TONE_CLASSES: Record<StatusBadgeTone, string> = {
  slate: 'bg-ld-cloud text-ld-slate border-ld-ash',
  sky: 'bg-sky-50 text-sky-600 border-sky-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  red: 'bg-red-50 text-red-500 border-red-200',
  violet: 'bg-ld-lilac text-ld-violet border-ld-violet/30',
};

interface StatusBadgeProps {
  tone: StatusBadgeTone;
  children: React.ReactNode;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ tone, children, className = '' }) => (
  <span
    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest border ${TONE_CLASSES[tone]} ${className}`}
  >
    {children}
  </span>
);

export default StatusBadge;
