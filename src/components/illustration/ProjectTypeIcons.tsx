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
