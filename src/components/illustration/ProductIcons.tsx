import React from 'react';
import { C } from './illustrationKit';

// Brand icon set for the four Mentor.QA products. Flat vector on a rounded
// Whisper tile (docs/DESIGN.md: brand tokens only, one Sky Blue focal element
// per icon, Graphite outlines). 48×48 viewBox; size via the `size` prop.
// Decorative (aria-hidden) — pair with a visible text label.

export interface IconProps { size?: number; className?: string; tile?: boolean }

export const Frame: React.FC<IconProps & { children: React.ReactNode }> = ({ size = 40, className, tile = true, children }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
    {tile && <rect x="0.5" y="0.5" width="47" height="47" rx="12" fill={C.whisper} stroke={C.wash} />}
    {children}
  </svg>
);

/** QA Simulator — lab flask with blue liquid and a found-bug spark. */
export const QaSimulatorIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M19 10h10M20.5 10v9.5L12.8 32.6A3.6 3.6 0 0 0 15.9 38h16.2a3.6 3.6 0 0 0 3.1-5.4L27.5 19.5V10" fill={C.white} stroke={C.graphite} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    <path d="M16.4 27h15.2l3.6 5.6A3.6 3.6 0 0 1 32.1 38H15.9a3.6 3.6 0 0 1-3.1-5.4z" fill={C.blue} />
    <circle cx="20.5" cy="32" r="1.6" fill={C.white} opacity="0.85" />
    <circle cx="25.5" cy="34.2" r="1.1" fill={C.white} opacity="0.7" />
    <path d="M36 12.5v5M33.5 15h5" stroke={C.blue} strokeWidth="2" strokeLinecap="round" />
  </Frame>
);

/** QA Portfolio — profile card with a blue avatar and a verified tick. */
export const QaPortfolioIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="9" y="12" width="30" height="24" rx="4" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <circle cx="18" cy="21.5" r="4" fill={C.blue} />
    <path d="M12.8 31.5a5.2 4 0 0 1 10.4 0" fill={C.blue} />
    <rect x="26" y="18.5" width="9" height="2.4" rx="1.2" fill={C.graphite} />
    <rect x="26" y="23.2" width="6.5" height="2.2" rx="1.1" fill={C.ash} />
    <rect x="26" y="27.6" width="8" height="2.2" rx="1.1" fill={C.ash} />
    <circle cx="36.5" cy="34.5" r="5" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <path d="M34.3 34.6l1.6 1.6 2.9-3.1" fill="none" stroke={C.graphite} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Frame>
);

/** QA Library — open book with a blue bookmark ribbon. */
export const QaLibraryIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M24 15.5c-3.6-2.6-8.3-3.3-13-2.3v20.3c4.7-1 9.4-.3 13 2.3 3.6-2.6 8.3-3.3 13-2.3V13.2c-4.7-1-9.4-.3-13 2.3z" fill={C.white} stroke={C.graphite} strokeWidth="2" strokeLinejoin="round" />
    <path d="M24 15.5v20.3" stroke={C.graphite} strokeWidth="2" />
    <rect x="14" y="19" width="7" height="2" rx="1" fill={C.ash} />
    <rect x="14" y="23.5" width="6" height="2" rx="1" fill={C.ash} />
    <rect x="27" y="23.5" width="7" height="2" rx="1" fill={C.ash} />
    <rect x="27" y="28" width="5.5" height="2" rx="1" fill={C.ash} />
    <path d="M28 11h6v10.5l-3-2.4-3 2.4z" fill={C.blue} />
  </Frame>
);

/** Mentoring — mentee's white bubble answered by the mentor's blue one. */
export const MentoringIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M10 14.5a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-8.5L12.5 28.5v-4.1A4 4 0 0 1 10 20.6z" fill={C.white} stroke={C.graphite} strokeWidth="2" strokeLinejoin="round" />
    <circle cx="16" cy="17.6" r="1.3" fill={C.graphite} />
    <circle cx="20" cy="17.6" r="1.3" fill={C.graphite} />
    <circle cx="24" cy="17.6" r="1.3" fill={C.graphite} />
    <path d="M38 25.5a4 4 0 0 0-4-4H22.5a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h7l5 4v-4.1a4 4 0 0 0 3.5-3.9z" fill={C.blue} />
    <rect x="22.8" y="26.2" width="10.5" height="2.2" rx="1.1" fill={C.white} />
    <rect x="22.8" y="30.4" width="6.5" height="2.2" rx="1.1" fill={C.white} opacity="0.75" />
  </Frame>
);
