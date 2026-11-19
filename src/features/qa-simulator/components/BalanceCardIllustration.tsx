import React from 'react';

// Decorative art for the DompetKu balance card: a stack of coins, a floating
// "Rp" coin and a couple of sparkles over soft background rings.
const COIN_LAYERS = [80, 71, 62, 53];

const Sparkle: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <path
    d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}z`}
    fill="#ffffff"
  />
);

// `rings={false}` drops the soft background circles, for when the art doesn't
// sit flush in the card's corner (they'd show a hard edge at the SVG bounds).
const BalanceCardIllustration: React.FC<{ className?: string; rings?: boolean }> = ({ className, rings = true }) => (
  <svg viewBox="0 0 140 110" className={className} aria-hidden="true">
    {rings && (
      <>
        <circle cx="118" cy="14" r="52" fill="#ffffff" opacity="0.07" />
        <circle cx="140" cy="104" r="44" fill="#ffffff" opacity="0.06" />
      </>
    )}

    {/* coin stack, drawn bottom-up */}
    {COIN_LAYERS.map((y) => (
      <g key={y}>
        <rect x="56" y={y} width="36" height="9" fill="#d97706" />
        <ellipse cx="74" cy={y + 9} rx="18" ry="5.5" fill="#d97706" />
        <ellipse cx="74" cy={y} rx="18" ry="5.5" fill="#fbbf24" stroke="#fcd34d" strokeWidth="1" />
      </g>
    ))}
    <ellipse cx="74" cy="53" rx="10" ry="2.8" fill="none" stroke="#f59e0b" strokeWidth="1.2" />

    {/* floating coin */}
    <g transform="rotate(-14 112 44)">
      <circle cx="112" cy="44" r="15" fill="#f59e0b" />
      <circle cx="110.5" cy="42.5" r="15" fill="#fbbf24" />
      <circle cx="110.5" cy="42.5" r="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <text x="110.5" y="46" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#b45309" fontFamily="system-ui, sans-serif">Rp</text>
    </g>

    <Sparkle x={42} y={40} s={5} />
    <Sparkle x={96} y={18} s={3.5} />
    <Sparkle x={130} y={74} s={3} />
  </svg>
);

export default BalanceCardIllustration;
