import React from 'react';
import { C } from './illustrationKit';
import { Frame, type IconProps } from './ProductIcons';
import type { QaCourseLevel } from '../../types/qaCourse';

// One icon per QA Course level, same style as ProductIcons: Whisper tile,
// Graphite 2px outlines, one Sky Blue focal element. Reads as a climb:
// a sprout (just starting), steps going up, a summit flag.

const S = { stroke: C.graphite, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Pemula: a sprout with a blue leaf in a small pot. */
export const BeginnerLevelIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M24 30V20" {...S} />
    <path d="M24 22c0-5 3.5-8.5 9-8.5 0 5.5-3.5 8.5-9 8.5z" fill={C.blue} {...S} />
    <path d="M24 25c0-4-2.8-6.5-7-6.5 0 4 2.8 6.5 7 6.5z" fill={C.white} {...S} />
    <path d="M15.5 30h17l-2 8.5h-13z" fill={C.white} {...S} />
  </Frame>
);

/** Menengah: three steps, the middle one blue, an arrow heading up. */
export const IntermediateLevelIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <rect x="8" y="30" width="10" height="8" rx="1.5" fill={C.white} {...S} />
    <rect x="19" y="23" width="10" height="15" rx="1.5" fill={C.blue} {...S} />
    <rect x="30" y="16" width="10" height="22" rx="1.5" fill={C.white} {...S} />
    <path d="M11 24l8-8m0 0h-5.5M19 16v5.5" fill="none" {...S} />
  </Frame>
);

/** Lanjutan: a mountain with a blue flag on the summit. */
export const AdvancedLevelIcon: React.FC<IconProps> = (p) => (
  <Frame {...p}>
    <path d="M6 37l12-16 5 6 6-9 13 19z" fill={C.white} {...S} />
    <path d="M26 22.5l3-4.5 3 4.5-1.6 1.2-1.4-1.4-1.6 1.4z" fill={C.wash} />
    <path d="M29 18V9" {...S} />
    <path d="M29 9.5h7.5l-2 2.5 2 2.5H29z" fill={C.blue} />
  </Frame>
);

const BY_LEVEL: Record<QaCourseLevel, React.FC<IconProps>> = {
  beginner: BeginnerLevelIcon,
  intermediate: IntermediateLevelIcon,
  advanced: AdvancedLevelIcon,
};

/** The icon for a course's level. */
export const CourseLevelIcon: React.FC<IconProps & { level: QaCourseLevel }> = ({ level, ...rest }) => {
  const Icon = BY_LEVEL[level];
  return <Icon {...rest} />;
};
