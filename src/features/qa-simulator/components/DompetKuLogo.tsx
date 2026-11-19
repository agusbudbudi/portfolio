import React from 'react';

// Brand mark for the DompetKu practice app: a wallet with a card and a coin
// peeking out of the top, on an indigo tile.
const DompetKuLogo: React.FC<{ size?: number; className?: string }> = ({ size = 40, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
    <rect width="40" height="40" rx="8" fill="#4f46e5" />
    {/* card behind the wallet */}
    <rect x="10" y="8.5" width="17" height="11" rx="2" fill="#a5b4fc" transform="rotate(-12 18.5 14)" />
    <rect x="12" y="10.5" width="6" height="1.6" rx="0.8" fill="#6366f1" transform="rotate(-12 18.5 14)" />
    {/* coin */}
    <circle cx="27.5" cy="11.5" r="4.6" fill="#fbbf24" />
    <circle cx="27.5" cy="11.5" r="2.7" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
    {/* wallet body */}
    <rect x="6.5" y="15" width="27" height="18" rx="3.5" fill="#ffffff" />
    <path d="M10 19h8" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />
    {/* clasp flap */}
    <path d="M23 20.5h10.5v8H23a4 4 0 0 1 0-8z" fill="#e0e7ff" />
    <circle cx="25" cy="24.5" r="1.7" fill="#4f46e5" />
  </svg>
);

export default DompetKuLogo;
