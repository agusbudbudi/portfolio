import React from 'react';

// Simple flat spot illustrations for the hero value chips, drawn to read at
// 24px: lilac disc + violet / lavender / onyx shapes (brand palette), static.

const VIOLET = '#3b9eff';
const LAVENDER = '#c9e4ff';
const LILAC = '#e3f2ff';
const ONYX = '#1a1b25';

type Props = { className?: string };

const Disc: React.FC<Props & { children: React.ReactNode }> = ({ className, children }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill={LILAC} />
    {children}
  </svg>
);

/** Belajar: open book. */
export const LearnSpot: React.FC<Props> = ({ className }) => (
  <Disc className={className}>
    <path d="M5 7.5c2.4-.8 4.8-.5 7 1v9c-2.2-1.5-4.6-1.8-7-1z" fill={VIOLET} />
    <path d="M19 7.5c-2.4-.8-4.8-.5-7 1v9c2.2-1.5 4.6-1.8 7-1z" fill={VIOLET} opacity="0.5" />
  </Disc>
);

/** Praktik: app window with a passed check. */
export const PracticeSpot: React.FC<Props> = ({ className }) => (
  <Disc className={className}>
    <rect x="5" y="6" width="14" height="12" rx="2" fill="#fff" stroke={LAVENDER} />
    <rect x="5" y="6" width="14" height="3.5" rx="1.75" fill={ONYX} />
    <path d="M9 13.6l2.1 2.1 4-4.2" fill="none" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Disc>
);

/** Bangun: stacked blocks. */
export const BuildSpot: React.FC<Props> = ({ className }) => (
  <Disc className={className}>
    <rect x="5.5" y="12.5" width="6" height="6" rx="1.4" fill={VIOLET} />
    <rect x="12.5" y="12.5" width="6" height="6" rx="1.4" fill={VIOLET} opacity="0.5" />
    <rect x="9" y="5.5" width="6" height="6" rx="1.4" fill={ONYX} />
  </Disc>
);

/** Berkembang: rising bars. */
export const GrowSpot: React.FC<Props> = ({ className }) => (
  <Disc className={className}>
    <rect x="5.5" y="13" width="3.4" height="5.5" rx="1" fill={VIOLET} opacity="0.5" />
    <rect x="10.3" y="10" width="3.4" height="8.5" rx="1" fill={VIOLET} />
    <rect x="15.1" y="6" width="3.4" height="12.5" rx="1" fill={ONYX} />
  </Disc>
);
