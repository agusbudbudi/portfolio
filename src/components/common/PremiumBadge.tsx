import React from 'react';

// "Berbayar" label for paid products (Mentoring). 3D look: solid darker
// amber "edge" under the pill (0 1px 0, kept thin), top-lit vertical
// gradient, glossy upper half and a soft cast shadow. Gold is deliberately outside
// the blue brand palette so paid items read as premium at a glance; keep it
// to this badge only. Crown is a small inline vector; the shine sweep honours
// prefers-reduced-motion via Tailwind's motion-safe variant.

const Crown: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
    <path d="M2.2 5.4l2.9 2.3L8 3.4l2.9 4.3 2.9-2.3-1.1 6.4H3.3z" fill="#fff7e0" stroke="#7c4a03" strokeWidth="1.1" strokeLinejoin="round" />
    <rect x="3.3" y="12.2" width="9.4" height="1.6" rx="0.8" fill="#7c4a03" />
    <circle cx="8" cy="3" r="1.1" fill="#7c4a03" />
    <circle cx="2" cy="5.1" r="0.9" fill="#7c4a03" />
    <circle cx="14" cy="5.1" r="0.9" fill="#7c4a03" />
  </svg>
);

const PremiumBadge: React.FC<{ size?: 'sm' | 'md'; label?: string; className?: string }> = ({ size = 'sm', label = 'Berbayar', className = '' }) => (
  <span
    className={`relative inline-flex items-center gap-1 overflow-hidden rounded-full border border-amber-500/60 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 font-semibold leading-none tracking-wide text-amber-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_1px_0_#d97706,0_2px_5px_-2px_rgba(180,83,9,0.4)] ${
      size === 'md' ? 'px-2.5 py-1 text-[11px]' : 'px-1.5 py-[3px] text-[10px]'
    } ${className}`}
  >
    <Crown size={size === 'md' ? 13 : 11} />
    {label}
    {/* glossy top half — reads as a rounded, lit surface */}
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-white/0" />
    {/* shine sweep */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/50 motion-safe:animate-[premium-shine_3.2s_ease-in-out_infinite]"
    />
  </span>
);

export default PremiumBadge;
