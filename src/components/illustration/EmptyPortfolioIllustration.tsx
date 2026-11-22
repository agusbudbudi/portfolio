import React from 'react';
import { C } from './illustrationKit';

// Empty-state art for "no portfolio yet": a blank profile card with a dashed
// avatar slot and placeholder lines, a small project tile behind it and a
// floating "+" — same flat-vector language as EmptyCalendarIllustration.
const EmptyPortfolioIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 240 170" className={className} fill="none" aria-hidden="true">
    {/* ground shadow */}
    <ellipse cx="120" cy="158" rx="78" ry="7" fill={C.frost} />

    {/* background pixel blocks */}
    <rect x="22" y="34" width="14" height="14" rx="3" fill={C.whisper} />
    <rect x="38" y="50" width="10" height="10" rx="2.5" fill={C.wash} />
    <rect x="204" y="26" width="12" height="12" rx="3" fill={C.wash} />
    <rect x="196" y="132" width="9" height="9" rx="2" fill={C.whisper} />

    {/* project tile peeking behind the card */}
    <rect x="132" y="22" width="66" height="54" rx="10" fill={C.whisper} stroke={C.graphite} strokeWidth="2.5" />
    <rect x="142" y="32" width="46" height="22" rx="5" fill={C.wash} />
    <rect x="142" y="60" width="28" height="6" rx="3" fill={C.white} />

    {/* profile card */}
    <rect x="54" y="44" width="132" height="104" rx="14" fill={C.white} stroke={C.graphite} strokeWidth="2.5" />
    {/* dashed avatar slot */}
    <circle cx="88" cy="80" r="17" fill={C.whisper} stroke={C.blue} strokeWidth="2" strokeDasharray="4 3" />
    <circle cx="88" cy="75" r="5.5" fill={C.wash} />
    <path d="M78 90a10 8 0 0 1 20 0" fill={C.wash} />
    {/* name + role placeholders */}
    <rect x="114" y="68" width="54" height="8" rx="4" fill={C.ash} />
    <rect x="114" y="82" width="38" height="7" rx="3.5" fill={C.frost} />
    {/* content lines */}
    <rect x="70" y="110" width="100" height="7" rx="3.5" fill={C.frost} />
    <rect x="70" y="124" width="72" height="7" rx="3.5" fill={C.frost} />

    {/* floating add badge */}
    <circle cx="186" cy="130" r="15" fill={C.blue} stroke={C.graphite} strokeWidth="2.5" />
    <path d="M186 123v14M179 130h14" stroke={C.white} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export default EmptyPortfolioIllustration;
