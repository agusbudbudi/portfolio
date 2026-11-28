import React from 'react';
import { C } from './illustrationKit';
import { Frame, type IconProps } from './ProductIcons';

// Icons for the kinds of practice projects a no-experience QA can show
// (portfolio landing "Belum Pernah Kerja?"). Same style as ProductIcons:
// Whisper tile, Graphite 2px outlines, one Sky Blue focal element each.

const S = { stroke: C.graphite, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Capstone — graduation cap with a blue tassel. */
export const CapstoneIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M8 19l16-7 16 7-16 7z" fill={C.white} {...S} />
    <path d="M15 22.5v7c0 2.5 4 4.5 9 4.5s9-2 9-4.5v-7" fill={C.white} {...S} />
    <path d="M24 19l10 4v10" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" />
    <circle cx="34" cy="35" r="2.6" fill={C.blue} />
  </Frame>
);

/** Automation — code window with a blue run button. */
export const AutomationIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="8" y="11" width="32" height="24" rx="4" fill={C.white} {...S} />
    <path d="M8 17h32" {...S} />
    <path d="M15 23l-3 3 3 3M22 23l3 3-3 3" fill="none" {...S} strokeWidth="1.8" />
    <circle cx="34" cy="35" r="7" fill={C.blue} stroke={C.white} strokeWidth="2" />
    <path d="M32.2 31.8v6.4l5-3.2z" fill={C.white} />
  </Frame>
);

/** API testing — request/response arrows between two endpoints. */
export const ApiTestingIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="7" y="15" width="12" height="18" rx="3" fill={C.white} {...S} />
    <rect x="29" y="15" width="12" height="18" rx="3" fill={C.white} {...S} />
    <path d="M10 20h6M10 24h4M32 24h6M32 28h4" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
    <path d="M21 20.5h6m-2.5-2.5l2.5 2.5-2.5 2.5" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M27 27.5h-6m2.5-2.5l-2.5 2.5 2.5 2.5" fill="none" {...S} />
  </Frame>
);

/** Bootcamp — laptop with a blue achievement flag. */
export const BootcampIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="11" y="13" width="26" height="17" rx="2.5" fill={C.white} {...S} />
    <path d="M7 34h34l-2 3H9z" fill={C.white} {...S} />
    <path d="M15.5 19h9M15.5 23h6" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
    <path d="M30 26V16" {...S} />
    <path d="M30 16.5h6l-1.6 2.3L36 21h-6z" fill={C.blue} />
  </Frame>
);

/** Personal learning — light bulb with a blue glow. */
export const LearningIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M24 10a9.5 9.5 0 0 0-5.6 17.2c.9.7 1.6 1.9 1.6 3.1V32h8v-1.7c0-1.2.7-2.4 1.6-3.1A9.5 9.5 0 0 0 24 10z" fill={C.blue} {...S} />
    <path d="M20 35.5h8M21.5 39h5" {...S} />
    <path d="M21 19.5a3.8 3.8 0 0 1 3-2.5" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" />
    <path d="M10 19h-2.5M40.5 19H38M13.5 9.5l1.8 1.8M34.5 9.5l-1.8 1.8" stroke={C.graphite} strokeWidth="2" strokeLinecap="round" />
  </Frame>
);

/** Dummy project — app wireframe with dashed blocks and a blue CTA. */
export const DummyProjectIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="14" y="8" width="20" height="32" rx="4" fill={C.white} {...S} />
    <rect x="18" y="13.5" width="12" height="8" rx="1.5" fill="none" stroke={C.ash} strokeWidth="1.6" strokeDasharray="2.4 2" />
    <path d="M18 25.5h12M18 29h8" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
    <rect x="18" y="32.5" width="12" height="3.6" rx="1.8" fill={C.blue} />
  </Frame>
);

/** PDF CV — document with a folded corner and a PDF label (portfolio landing
 *  "Sebelum: CV biasa"). */
export const PdfFileIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M14 8h14l8 8v22a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" fill={C.white} {...S} />
    <path d="M28 8v6a2 2 0 0 0 2 2h6" fill="none" {...S} />
    <path d="M16 20h9M16 24h12" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
    <rect x="7" y="28" width="22" height="9" rx="2.5" fill={C.blue} />
    <text x="18" y="35" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="7" fontWeight="700" fill={C.white} letterSpacing="0.4">PDF</text>
  </Frame>
);

/**
 * Free — gift box with a blue ribbon and bow. Badge-sized (24 grid, thicker
 * strokes so it stays crisp at 18-22px); no tile, it sits inside a pill.
 */
export const FreeGiftIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path d="M12 8.2c-1-2.9-4.6-4.4-5.6-2.5-.8 1.6 1.6 2.5 5.6 2.5zM12 8.2c1-2.9 4.6-4.4 5.6-2.5.8 1.6-1.6 2.5-5.6 2.5z" fill={C.blue} stroke={C.graphite} strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="4.6" y="12.2" width="14.8" height="8.6" rx="1.6" fill={C.white} stroke={C.graphite} strokeWidth="1.5" />
    <rect x="3.2" y="8.2" width="17.6" height="4.2" rx="1.2" fill={C.white} stroke={C.graphite} strokeWidth="1.5" />
    <path d="M10.6 8.95h2.8V20.05h-2.8z" fill={C.blue} />
  </svg>
);

// Mentoring services (portfolio landing mentoring card). Same tile style.

/** Review portfolio — profile page with a blue magnifier inspecting it. */
export const ReviewPortfolioIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="8" y="10" width="26" height="26" rx="4" fill={C.white} {...S} />
    <circle cx="15.5" cy="18" r="3" fill={C.ash} />
    <path d="M21 16.5h8M21 20h5M13 26h15M13 30h10" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
    <circle cx="33" cy="31" r="6.5" fill={C.blue} stroke={C.white} strokeWidth="2" />
    <circle cx="33" cy="31" r="3" fill="none" stroke={C.white} strokeWidth="1.8" />
    <path d="M38 36l3.5 3.5" {...S} strokeWidth="2.4" />
  </Frame>
);

/** Review CV — document with a blue approval check badge. */
export const ReviewCvIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M14 8h13l7 7v20a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" fill={C.white} {...S} />
    <path d="M27 8v5a2 2 0 0 0 2 2h5" fill="none" {...S} />
    <path d="M16 19h7M16 23h12M16 27h8" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
    <circle cx="33" cy="34" r="6.5" fill={C.blue} stroke={C.white} strokeWidth="2" />
    <path d="M30.2 34.2l2 2 3.8-4" fill="none" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Frame>
);

/** Mock interview — video call window with the interviewer and a blue question bubble. */
export const MockInterviewIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="7" y="13" width="28" height="23" rx="4" fill={C.white} {...S} />
    <circle cx="21" cy="22" r="3.6" fill={C.white} {...S} />
    <path d="M14 33.5a7 5.5 0 0 1 14 0" fill={C.white} {...S} />
    <path d="M31 7.5h9a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-4.5l-3.5 3v-3h-1a2.5 2.5 0 0 1-2.5-2.5v-6A2.5 2.5 0 0 1 31 7.5z" fill={C.blue} />
    <path d="M33.8 11.2a1.9 1.9 0 1 1 2.4 1.8c-.5.2-.7.5-.7 1v.3" fill="none" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="35.5" cy="16.4" r="0.9" fill={C.white} />
  </Frame>
);

/** Career advice — rising steps with a blue goal flag on top. */
export const CareerAdviceIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M8 37h8v-7h8v-7h8v-7h8v21z" fill={C.white} {...S} />
    <path d="M32 16V7" {...S} />
    <path d="M32 7.5h7l-1.8 2.6L39 12.7h-7z" fill={C.blue} />
  </Frame>
);
