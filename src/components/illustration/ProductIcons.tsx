import React from 'react';
import { C } from './illustrationKit';

// Brand icon set for the Mentor.QA products and features. Flat vector on a rounded
// Whisper tile (docs/DESIGN.md: brand tokens only, one Sky Blue focal element
// per icon, Graphite outlines). 48×48 viewBox; size via the `size` prop.
// Decorative (aria-hidden) — pair with a visible text label.

export interface IconProps { size?: number; className?: string; tile?: boolean }

/** Tile colours: Sky for products, Honey for feedback & rating. */
const TILE = { sky: { fill: C.whisper, stroke: C.wash }, honey: { fill: C.cream, stroke: C.butter } } as const;

export const Frame: React.FC<IconProps & { tone?: keyof typeof TILE; children: React.ReactNode }> = ({ size = 40, className, tile = true, tone = 'sky', children }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden="true">
    {tile && <rect x="0.5" y="0.5" width="47" height="47" rx="12" fill={TILE[tone].fill} stroke={TILE[tone].stroke} />}
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

/** QA Course — graduation cap over a stack of lessons, blue tassel. */
export const QaCourseIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="13" y="27" width="22" height="11" rx="2.5" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <rect x="17" y="31" width="9" height="2" rx="1" fill={C.ash} />
    <path d="M24 10L8 17.5 24 25l16-7.5z" fill={C.white} stroke={C.graphite} strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 21.3v4.2c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-4.2L24 25z" fill={C.blue} />
    <path d="M38 18.5v7" stroke={C.graphite} strokeWidth="2" strokeLinecap="round" />
    <circle cx="38" cy="27.5" r="2.2" fill={C.blue} />
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

/** Dashboard — bento grid of cards, one blue focal tile and a mini bar chart. */
export const DashboardIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="10" y="10" width="13" height="16" rx="3" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <rect x="13.5" y="14" width="6" height="2.2" rx="1.1" fill={C.graphite} />
    <rect x="13.5" y="18.6" width="4.5" height="2.2" rx="1.1" fill={C.ash} />
    <rect x="26" y="10" width="12" height="10" rx="3" fill={C.blue} />
    <rect x="10" y="29" width="13" height="9" rx="3" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <rect x="26" y="23" width="12" height="15" rx="3" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <rect x="28.8" y="30.5" width="2" height="4.5" rx="1" fill={C.ash} />
    <rect x="31.6" y="27.5" width="2" height="7.5" rx="1" fill={C.graphite} />
    <rect x="34.4" y="29" width="2" height="6" rx="1" fill={C.ash} />
  </Frame>
);

/** Mentor — person outline wearing a blue star medal (verified mentor). */
export const MentorIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <circle cx="21" cy="17.5" r="6" fill={C.white} stroke={C.graphite} strokeWidth="2" />
    <path d="M9.5 37.5a11.5 9.5 0 0 1 23 0z" fill={C.white} stroke={C.graphite} strokeWidth="2" strokeLinejoin="round" />
    <path d="M31 33.5l-1.6 6.3 2.6-1.2 1.6 2.2 1.2-6.6zM37 33.5l1.6 6.3-2.6-1.2-1.6 2.2-1.2-6.6z" fill={C.wash} stroke={C.graphite} strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="34" cy="29.5" r="6.2" fill={C.blue} stroke={C.graphite} strokeWidth="2" />
    <path d="M34.0 26.3L34.8 28.4L37.0 28.5L35.3 29.9L35.9 32.1L34.0 30.9L32.1 32.1L32.7 29.9L31.0 28.5L33.2 28.4z" fill={C.white} />
  </Frame>
);

/** 5-point star path centred on (cx, cy). */
const starPath = (cx: number, cy: number, r: number) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    return `${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join('L')}z`;
};

/** Feedback — speech bubble holding a star rating on a Honey tile; two of three stars filled. */
export const FeedbackIcon: React.FC<IconProps> = (p) => (
  <Frame tone="honey" {...p}>
    <path d="M13 11h22a5 5 0 0 1 5 5v11a5 5 0 0 1-5 5H22l-7.5 6v-6H13a5 5 0 0 1-5-5V16a5 5 0 0 1 5-5z" fill={C.white} stroke={C.graphite} strokeWidth="2" strokeLinejoin="round" />
    <path d={starPath(15.5, 22, 4.3)} fill={C.honey} />
    <path d={starPath(24, 22, 4.3)} fill={C.honey} />
    <path d={starPath(32.5, 22, 4.3)} fill={C.ash} />
  </Frame>
);
