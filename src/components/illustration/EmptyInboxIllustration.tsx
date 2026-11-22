import React from 'react';
import { C } from './illustrationKit';

// Empty-state art for "no incoming bookings" (mentor side): an empty inbox
// tray with an envelope hovering above it and a small clock badge —
// same flat-vector language as EmptyCalendarIllustration.
const EmptyInboxIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 240 170" className={className} fill="none" aria-hidden="true">
    {/* ground shadow */}
    <ellipse cx="120" cy="158" rx="78" ry="7" fill={C.frost} />

    {/* background pixel blocks */}
    <rect x="24" y="40" width="14" height="14" rx="3" fill={C.whisper} />
    <rect x="40" y="56" width="10" height="10" rx="2.5" fill={C.wash} />
    <rect x="200" y="30" width="12" height="12" rx="3" fill={C.wash} />
    <rect x="206" y="120" width="9" height="9" rx="2" fill={C.whisper} />

    {/* envelope floating above the tray */}
    <g transform="rotate(-6 120 52)">
      <rect x="88" y="26" width="64" height="44" rx="8" fill={C.white} stroke={C.graphite} strokeWidth="2.5" />
      <path d="M90 30l30 21 30-21" stroke={C.graphite} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="98" y="56" width="18" height="5" rx="2.5" fill={C.wash} />
    </g>
    {/* motion dashes */}
    <path d="M74 44h8M70 54h8M158 40h8M162 50h8" stroke={C.ash} strokeWidth="2.5" strokeLinecap="round" />

    {/* inbox tray */}
    <path d="M56 104l14-22a8 8 0 0 1 6.8-3.8h86.4a8 8 0 0 1 6.8 3.8l14 22v34a12 12 0 0 1-12 12H68a12 12 0 0 1-12-12z" fill={C.white} stroke={C.graphite} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M56 104h36l6 12h44l6-12h36" stroke={C.graphite} strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M58.5 106h32l6 12h46l6-12h32v32a10 10 0 0 1-10 10H68.5a10 10 0 0 1-10-10z" fill={C.whisper} />

    {/* clock badge — waiting for mentees */}
    <circle cx="184" cy="88" r="15" fill={C.blue} stroke={C.graphite} strokeWidth="2.5" />
    <path d="M184 80v8l5 4" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default EmptyInboxIllustration;
