import React from 'react';

// Static flat-vector padlock for locked states in the Labs workspace (locked
// phase, portfolio not ready, login prompt). Same palette as the animated
// illustrations (docs/DESIGN.md → Mentor.QA Adaptations) but intentionally
// still — these are blocking states, motion would only distract.

const LockIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 96" className={className} fill="none" aria-hidden="true">
    <circle cx="60" cy="50" r="40" fill="#e3f2ff" />
    <circle cx="20" cy="28" r="3" fill="#c9e4ff" />
    <circle cx="101" cy="22" r="2.5" fill="#3b9eff" />
    <circle cx="104" cy="70" r="2" fill="#c9e4ff" />

    {/* locked document behind */}
    <g transform="rotate(-8 50 52)">
      <rect x="26" y="22" width="48" height="60" rx="8" fill="#ffffff" stroke="#cdd2d9" />
      <rect x="34" y="32" width="24" height="4" rx="2" fill="#3b9eff" opacity="0.55" />
      <rect x="34" y="42" width="32" height="3" rx="1.5" fill="#eceff3" />
      <rect x="34" y="49" width="26" height="3" rx="1.5" fill="#eceff3" />
      <rect x="34" y="56" width="30" height="3" rx="1.5" fill="#eceff3" />
    </g>

    {/* padlock */}
    <ellipse cx="72" cy="83" rx="20" ry="3" fill="#36394a" opacity="0.08" />
    <path d="M60 50 v-9 a12 12 0 0 1 24 0 v9" stroke="#36394a" strokeWidth="6" strokeLinecap="round" />
    <rect x="52" y="47" width="40" height="33" rx="9" fill="#3b9eff" />
    <rect x="52" y="47" width="40" height="9" rx="4.5" fill="#ffffff" opacity="0.18" />
    <circle cx="72" cy="61" r="4.5" fill="#ffffff" />
    <rect x="70.5" y="62" width="3" height="8" rx="1.5" fill="#ffffff" />
  </svg>
);

export default LockIllustration;
