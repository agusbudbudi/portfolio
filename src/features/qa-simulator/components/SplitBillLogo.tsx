import React from 'react';

// Brand mark for the SplitBill practice app: a receipt torn into two halves
// (one shifted up) on a teal tile, with a coin on the right half.
const SplitBillLogo: React.FC<{ size?: number; className?: string }> = ({ size = 36, className }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
    <rect width="40" height="40" rx="8" fill="#0d9488" />
    {/* left half of the receipt */}
    <path d="M9 9.5a1.5 1.5 0 0 1 1.5-1.5H19.5v22.5l-1.75-1.5-1.75 1.5-1.75-1.5-1.75 1.5-1.75-1.5L9 30.5z" fill="#ffffff" />
    <path d="M12 13h5M12 16.5h4M12 20h5" stroke="#99f6e4" strokeWidth="1.6" strokeLinecap="round" />
    {/* right half, shifted up and right */}
    <path d="M21.5 6H29.5a1.5 1.5 0 0 1 1.5 1.5V28l-1.6-1.4-1.6 1.4-1.6-1.4-1.6 1.4-1.6-1.4-1.5 1.4z" fill="#ccfbf1" />
    <path d="M24 11h4.5M24 14.5h3" stroke="#5eead4" strokeWidth="1.6" strokeLinecap="round" />
    {/* coin */}
    <circle cx="27.5" cy="22" r="4.2" fill="#fbbf24" />
    <circle cx="27.5" cy="22" r="2.4" fill="none" stroke="#f59e0b" strokeWidth="1.1" />
  </svg>
);

export default SplitBillLogo;
