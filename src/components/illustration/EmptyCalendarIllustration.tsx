import React from 'react';
import { C } from './illustrationKit';

// Empty-state art for "no bookings yet": a calendar with one highlighted
// open slot, a chat bubble (the 1:1 session) and a floating "+" — flat
// vector in the brand palette (docs/DESIGN.md), decorative only.
const EmptyCalendarIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 240 170" className={className} fill="none" aria-hidden="true">
    {/* ground shadow */}
    <ellipse cx="120" cy="158" rx="78" ry="7" fill={C.frost} />

    {/* background pixel blocks */}
    <rect x="22" y="34" width="14" height="14" rx="3" fill={C.whisper} />
    <rect x="38" y="50" width="10" height="10" rx="2.5" fill={C.wash} />
    <rect x="200" y="26" width="12" height="12" rx="3" fill={C.wash} />
    <rect x="190" y="118" width="9" height="9" rx="2" fill={C.whisper} />

    {/* calendar body */}
    <rect x="62" y="34" width="116" height="116" rx="14" fill={C.white} stroke={C.graphite} strokeWidth="2.5" />
    <path d="M62 48a14 14 0 0 1 14-14h88a14 14 0 0 1 14 14v14H62z" fill={C.blue} />
    <path d="M62 62h116" stroke={C.graphite} strokeWidth="2.5" />
    {/* rings */}
    <rect x="86" y="24" width="7" height="20" rx="3.5" fill={C.white} stroke={C.graphite} strokeWidth="2.5" />
    <rect x="147" y="24" width="7" height="20" rx="3.5" fill={C.white} stroke={C.graphite} strokeWidth="2.5" />

    {/* day grid: 4 x 3, one open slot highlighted */}
    {[0, 1, 2].map((row) =>
      [0, 1, 2, 3].map((col) => {
        const x = 76 + col * 23;
        const y = 74 + row * 23;
        const highlight = row === 1 && col === 2;
        return highlight ? (
          <rect key={`${row}-${col}`} x={x} y={y} width="16" height="16" rx="4" fill={C.whisper} stroke={C.blue} strokeWidth="2" strokeDasharray="3 2.5" />
        ) : (
          <rect key={`${row}-${col}`} x={x} y={y} width="16" height="16" rx="4" fill={C.frost} />
        );
      }),
    )}

    {/* chat bubble — the 1:1 mentoring session */}
    <path d="M168 78h44a10 10 0 0 1 10 10v20a10 10 0 0 1-10 10h-26l-10 9v-9h-8a10 10 0 0 1-10-10V88a10 10 0 0 1 10-10z" fill={C.white} stroke={C.graphite} strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="180" cy="98" r="3" fill={C.ash} />
    <circle cx="190" cy="98" r="3" fill={C.steel} />
    <circle cx="200" cy="98" r="3" fill={C.blue} />

    {/* floating add badge */}
    <circle cx="58" cy="118" r="15" fill={C.blue} stroke={C.graphite} strokeWidth="2.5" />
    <path d="M58 111v14M51 118h14" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default EmptyCalendarIllustration;
