import React from 'react';
import { motion } from 'framer-motion';
import { C, fadeUp, pop, useLoop } from '../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame } from '../../../components/illustration/IllustrationParts';

// "Bug hunting on staging" art for the dark SandboxCard banner: a mini
// SplitBill window, a magnifier sweeping it, bug markers popping in and
// pulsing, and a "found" chip landing last. Same flat-vector kit as the
// landing illustrations (docs/DESIGN.md → Mentor.QA Adaptations). Bug
// positions are decorative — they do not map to real planted bugs.

const BugMarker: React.FC<{ cx: number; cy: number; delay: number }> = ({ cx, cy, delay }) => {
  const loop = useLoop();
  return (
    <motion.g variants={pop(delay)} style={{ originX: 0.5, originY: 0.5 }}>
      <motion.circle
        cx={cx} cy={cy} r="6" fill={C.blue} opacity="0.25"
        style={{ originX: 0.5, originY: 0.5 }}
        {...loop({ scale: [1, 1.9, 1], opacity: [0.35, 0, 0.35] }, 1.8, delay + 0.4)}
      />
      <circle cx={cx} cy={cy} r="5" fill={C.blue} />
      {/* tiny bug glyph */}
      <path d={`M${cx - 3} ${cy - 1} h1.2 M${cx - 3} ${cy + 1.2} h1.2 M${cx + 1.8} ${cy - 1} h1.2 M${cx + 1.8} ${cy + 1.2} h1.2`} stroke={C.white} strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx={cx} cy={cy + 0.4} rx="1.9" ry="2.5" fill={C.white} />
      <circle cx={cx} cy={cy - 2.4} r="1" fill={C.white} />
      <line x1={cx} x2={cx} y1={cy - 1.6} y2={cy + 2.6} stroke={C.blue} strokeWidth="0.6" />
    </motion.g>
  );
};

const SandboxIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const loop = useLoop();
  return (
    <IllustrationFrame className={className}>
      {/* staging window */}
      <motion.g variants={fadeUp(0)}>
        <rect x="18" y="25" width="156" height="110" rx="11" fill="#000" opacity="0.25" />
        <rect x="18" y="22" width="156" height="110" rx="11" fill={C.white} />
        <path d="M18 33 a11 11 0 0 1 11 -11 h134 a11 11 0 0 1 11 11 v4 h-156 z" fill={C.frost} />
        <circle cx="28" cy="30" r="2.2" fill="#ff5f57" />
        <circle cx="35" cy="30" r="2.2" fill="#febc2e" />
        <circle cx="42" cy="30" r="2.2" fill="#28c840" />
        <rect x="52" y="26.5" width="70" height="7" rx="3.5" fill={C.white} />
        <rect x="56" y="29" width="40" height="2.2" rx="1.1" fill={C.ash} />
      </motion.g>

      {/* app content */}
      <Bar delay={0.25} x="28" y="46" width="44" height="6" rx="3" fill={C.graphite} opacity="0.8" />
      <Bar delay={0.3} x="28" y="56" width="28" height="3.5" rx="1.75" fill={C.frost} />
      {[70, 84, 98].map((y, i) => (
        <motion.g key={y} variants={fadeUp(0.35 + i * 0.08)}>
          <circle cx="32" cy={y} r="4.5" fill={C.whisper} />
          <rect x="41" y={y - 3} width={[34, 26, 30][i]} height="3.5" rx="1.75" fill={C.graphite} opacity="0.6" />
          <rect x="41" y={y + 1.5} width="46" height="2.5" rx="1.25" fill={C.frost} />
          <rect x="140" y={y - 2} width="24" height="4" rx="2" fill={C.ash} />
        </motion.g>
      ))}
      <motion.g variants={fadeUp(0.6)}>
        <line x1="28" x2="164" y1="109" y2="109" stroke={C.ash} strokeDasharray="3 2" />
        <rect x="28" y="116" width="22" height="4.5" rx="2.25" fill={C.graphite} opacity="0.75" />
        <rect x="132" y="115" width="32" height="6" rx="3" fill={C.blue} />
      </motion.g>

      {/* bugs found */}
      <BugMarker cx={160} cy={84} delay={1.2} />
      <BugMarker cx={136} cy={118} delay={1.7} />

      {/* magnifier sweeping the screen */}
      <motion.g variants={fadeUp(0.8)}>
        <motion.g {...loop({ x: [0, -62, -40, 0], y: [0, -18, 14, 0] }, 7, 1)}>
          <circle cx="128" cy="78" r="13" fill={C.white} fillOpacity="0.35" stroke={C.graphite} strokeWidth="4" />
          <path d="M137.5 87.5 l11 11" stroke={C.graphite} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M120.5 72 a8 8 0 0 1 6 -3" stroke={C.white} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </motion.g>
      </motion.g>

      {/* found chip */}
      <motion.g variants={pop(2.2)} style={{ originX: 0, originY: 0.5 }}>
        <rect x="150" y="128" width="62" height="20" rx="10" fill={C.blue} />
        <circle cx="161" cy="138" r="5" fill={C.white} />
        <path d="M158.7 138 l1.6 1.6 l3 -3" stroke={C.blue} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="170" y="134" width="34" height="3.5" rx="1.75" fill={C.white} />
        <rect x="170" y="140" width="22" height="2.5" rx="1.25" fill={C.wash} />
      </motion.g>
    </IllustrationFrame>
  );
};

export default SandboxIllustration;
