import React, { useId } from 'react';
import { C } from './illustrationKit';

// Flat-vector cartoon face for the generic learner ("Kamu") in illustrations,
// replacing the plain "K" initial. docs/DESIGN.md illustration rules: brand
// tokens only — Whisper backdrop, Graphite hair & features, Sky Blue shirt as
// the single blue focal element. Skin tones are the one necessary
// non-token colour (persona exception). Decorative (aria-hidden).

const SKIN = '#f5cba7';
const SKIN_SHADE = '#e8b48f';

const CartoonAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 36, className }) => {
  const clip = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id={clip}><circle cx="32" cy="32" r="32" /></clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill={C.whisper} />
        {/* shoulders + shirt */}
        <path d="M8 66c0-13 10.5-21 24-21s24 8 24 21z" fill={C.blue} />
        <path d="M26.5 45.5L32 52l5.5-6.5" fill="none" stroke={C.white} strokeWidth="2" strokeLinejoin="round" />
        {/* neck */}
        <path d="M27.5 37h9v7.5c0 2.5-2 4-4.5 4s-4.5-1.5-4.5-4z" fill={SKIN_SHADE} />
        {/* ears */}
        <circle cx="20.6" cy="29" r="2.8" fill={SKIN_SHADE} />
        <circle cx="43.4" cy="29" r="2.8" fill={SKIN_SHADE} />
        {/* head */}
        <ellipse cx="32" cy="28" rx="11.5" ry="12.8" fill={SKIN} />
        {/* hair */}
        <path d="M20.3 28.5c-1.2-10.3 4.3-16.2 11.9-16.2 8.6 0 13 5.9 11.5 15.7-1.6-4.6-5.4-7.6-10.6-7.6-4.6 0-6.4 2.4-9.2 3.4-1.6.6-2.8 2.1-3.6 4.7z" fill={C.graphite} />
        {/* eyes + brows */}
        <circle cx="27.3" cy="29.2" r="1.5" fill={C.graphite} />
        <circle cx="36.7" cy="29.2" r="1.5" fill={C.graphite} />
        <path d="M25.2 25.6q2-1.2 4.2 0M34.6 25.6q2-1.2 4.2 0" fill="none" stroke={C.graphite} strokeWidth="1.2" strokeLinecap="round" />
        {/* cheeks + smile */}
        <circle cx="24.8" cy="33.2" r="1.9" fill="#f29e8e" opacity="0.45" />
        <circle cx="39.2" cy="33.2" r="1.9" fill="#f29e8e" opacity="0.45" />
        <path d="M28.6 34.2q3.4 3 6.8 0" fill="none" stroke={C.graphite} strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

export default CartoonAvatar;
