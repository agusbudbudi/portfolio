import React from 'react';

const NotFoundIllustration: React.FC<{ label?: string }> = ({ label = '404' }) => (
  <svg
    viewBox="0 0 400 260"
    className="w-full max-w-[220px] mx-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <ellipse cx="200" cy="230" rx="140" ry="14" className="fill-ld-frost" />
    <text
      x="200"
      y="140"
      textAnchor="middle"
      className="fill-ld-lavender font-ld-display font-semibold"
      style={{ fontSize: 110 }}
    >
      {label}
    </text>
    <circle cx="70" cy="70" r="10" className="fill-ld-lilac" />
    <circle cx="335" cy="60" r="7" className="fill-ld-lavender" />
    <circle cx="345" cy="150" r="5" className="fill-ld-lilac" />
    <path
      d="M60 150 L80 150 M50 160 L70 160"
      className="stroke-ld-mist"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M320 190 L340 190 M330 200 L350 200"
      className="stroke-ld-mist"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

export default NotFoundIllustration;
