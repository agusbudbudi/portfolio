import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Flat-vector party popper for the "Phase N selesai!" completion bar — the
// per-phase sibling of TrophyIllustration (same 60×50 frame and palette;
// docs/DESIGN.md → Mentor.QA Adaptations). Drawn bold so it still reads at
// 48–60px.
//
// Motion (on mount): popper springs in → squashes (anticipation) → POP: a
// radial flash, a recoil, streamers unfurl and confetti flies out on arcs
// (up past its resting spot, then "falls" into place while spinning).
// Idle afterwards: confetti sways, sparkles twinkle, streamers drift.
// Static final frame under prefers-reduced-motion.

const C = {
  blue: '#3b9eff',
  blueDeep: '#1f87e6',
  wash: '#c9e4ff',
  whisper: '#e3f2ff',
  white: '#ffffff',
  graphite: '#36394a',
};

const MOUTH = { x: 28, y: 21 };
const POP_AT = 0.55; // seconds — moment of the pop

type Shape = 'rect' | 'dot' | 'tri' | 'ring' | 'zig' | 'star';
// [final x, final y, shape, color, base rotation, stays after the burst]
// Only a few pieces stay; the rest join the burst then fade out so the bar
// doesn't stay busy.
const CONFETTI: [number, number, Shape, string, number, boolean][] = [
  // Top arc (above the streamers) carries most of the pieces that stay...
  [37, 4, 'rect', C.blue, 25, true],
  [42, 7, 'tri', C.graphite, -15, true],
  [17, 6, 'rect', C.wash, 40, true],
  // ...two more sit between the streamers, clear of the right edge.
  [50, 15, 'ring', C.blue, 0, true],
  [46, 19, 'rect', C.graphite, -30, true],
  // Burst only.
  [23, 3, 'dot', C.graphite, 0, false],
  [36, 9.5, 'dot', C.wash, 0, false],
  [50, 30, 'star', C.blue, 0, false],
  [49, 37, 'zig', C.blue, 20, false],
  [12, 6, 'dot', C.blue, 0, false],
];

const Piece: React.FC<{ shape: Shape; x: number; y: number; color: string; rot: number }> = ({ shape, x, y, color, rot }) => {
  switch (shape) {
    case 'rect':
      return <rect x={x - 2.2} y={y - 1.1} width="4.4" height="2.2" rx="0.7" fill={color} transform={`rotate(${rot} ${x} ${y})`} />;
    case 'dot':
      return <circle cx={x} cy={y} r="1.7" fill={color} />;
    case 'tri':
      return <path d={`M${x} ${y - 2.2} l2 3.5 h-4 z`} fill={color} transform={`rotate(${rot} ${x} ${y})`} />;
    case 'ring':
      return <circle cx={x} cy={y} r="1.9" stroke={color} strokeWidth="1.2" />;
    case 'zig':
      return (
        <path
          d={`M${x - 3} ${y + 1} l1.5 -2 l1.5 2 l1.5 -2 l1.5 2`}
          stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
          transform={`rotate(${rot} ${x} ${y})`}
        />
      );
    case 'star':
      return <path d={`M${x} ${y - 3} Q${x} ${y} ${x + 3} ${y} Q${x} ${y} ${x} ${y + 3} Q${x} ${y} ${x - 3} ${y} Q${x} ${y} ${x} ${y - 3} z`} fill={color} />;
  }
};

const STREAMERS = [
  { d: 'M30 18 q4 -8 10 -6 t8 -8', color: C.blue, w: 2.2 },
  { d: 'M32 24 q6 -2 8 3 t9 2', color: C.wash, w: 2.2 },
  // Upward one above the blue streamer, so the burst also reads vertically.
  { d: 'M27 16 q-1.5 -5 2 -8 t4 -6', color: C.graphite, w: 2.2 },
];

// Radial "pop" flash lines from the mouth, fanned up-right.
const FLASH = [-80, -50, -20, 10].map((deg) => {
  const a = (deg * Math.PI) / 180;
  const r0 = 6;
  const r1 = 10.5;
  return `M${(MOUTH.x + 4 + r0 * Math.cos(a)).toFixed(1)} ${(MOUTH.y - 4 + r0 * Math.sin(a)).toFixed(1)} L${(MOUTH.x + 4 + r1 * Math.cos(a)).toFixed(1)} ${(MOUTH.y - 4 + r1 * Math.sin(a)).toFixed(1)}`;
});

const SPARKLES: [number, number, number][] = [[10, 15, 2.4], [53, 3, 2]];

const PartyPopperIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduce = !!useReducedMotion();

  return (
    <svg viewBox="0 0 60 50" className={className} fill="none" role="img" aria-label="Phase selesai">
      {/* pop flash */}
      {!reduce &&
        FLASH.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke={C.blue}
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: POP_AT + i * 0.02, times: [0, 0.4, 1] }}
          />
        ))}

      {/* streamers: unfurl on pop, then drift */}
      {STREAMERS.map((s, i) => (
        <motion.g
          key={i}
          style={{ originX: 0, originY: 1 }}
          {...(reduce ? {} : { animate: { rotate: [0, i ? 4 : -4, 0] }, transition: { duration: 3, delay: 1.4 + i * 0.4, repeat: Infinity, ease: 'easeInOut' } })}
        >
          <motion.path
            d={s.d}
            stroke={s.color}
            strokeWidth={s.w}
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: POP_AT + 0.05 + i * 0.07, ease: 'easeOut' }}
          />
        </motion.g>
      ))}

      {/* confetti: arc out (overshoot up), fall into place spinning, then sway */}
      {CONFETTI.map(([x, y, shape, color, rot, stays], i) => {
        const sx = MOUTH.x - x;
        const sy = MOUTH.y - y;
        const peakX = -sx * 0.12;
        const peakY = -6 - (i % 3) * 1.5;
        const spin = (i % 2 ? 1 : -1) * (180 + i * 25);
        if (!stays) {
          // burst piece: fly out, land, then drift down and fade away
          if (reduce) return null;
          return (
            <motion.g
              key={i}
              style={{ originX: 0.5, originY: 0.5 }}
              initial={{ x: sx, y: sy, scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                x: [sx, peakX, 0, 0],
                y: [sy, peakY, 0, 5],
                scale: [0, 1.15, 1, 0.5],
                opacity: [0, 1, 1, 0],
                rotate: [0, spin * 0.7, spin, spin * 1.3],
              }}
              transition={{ duration: 1.9, delay: POP_AT + (i % 5) * 0.035, times: [0, 0.24, 0.5, 1], ease: 'easeInOut' }}
            >
              <Piece shape={shape} x={x} y={y} color={color} rot={rot} />
            </motion.g>
          );
        }
        return (
          <motion.g
            key={i}
            initial={reduce ? false : { x: sx, y: sy, scale: 0, opacity: 0, rotate: 0 }}
            animate={{ x: [sx, peakX, 0], y: [sy, peakY, 0], scale: [0, 1.15, 1], opacity: [0, 1, 1], rotate: [0, spin * 0.7, spin] }}
            transition={{ duration: 0.95, delay: POP_AT + (i % 5) * 0.035, times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            <motion.g
              style={{ originX: 0.5, originY: 0.5 }}
              {...(reduce
                ? {}
                : {
                    animate: { x: [0, i % 2 ? 1.2 : -1.2, 0], rotate: [0, i % 2 ? 18 : -18, 0], opacity: [1, 0.7, 1] },
                    transition: { duration: 2.4 + (i % 3) * 0.4, delay: 1.7 + i * 0.12, repeat: Infinity, ease: 'easeInOut' },
                  })}
            >
              <Piece shape={shape} x={x} y={y} color={color} rot={rot} />
            </motion.g>
          </motion.g>
        );
      })}

      {/* sparkles */}
      {SPARKLES.map(([x, y, s], i) => (
        <motion.path
          key={i}
          d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} z`}
          fill={i === 1 ? C.graphite : C.blue}
          style={{ originX: 0.5, originY: 0.5 }}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={reduce ? { scale: 1, opacity: 1 } : { scale: [0, 1.3, 1, 0.4, 1], opacity: [0, 1, 1, 0.5, 1] }}
          transition={reduce ? undefined : { duration: 2.2, delay: POP_AT + 0.3 + i * 0.25, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
      ))}

      {/* popper: spring in → squash (anticipation) → recoil on pop */}
      <motion.g
        style={{ originX: 0.25, originY: 0.85 }}
        initial={reduce ? false : { scale: 0.4, opacity: 0, rotate: -18 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      >
        <motion.g
          style={{ originX: 0.25, originY: 0.85 }}
          {...(reduce
            ? {}
            : {
                animate: { scaleX: [1, 1.08, 0.94, 1], scaleY: [1, 0.9, 1.06, 1], x: [0, 0, -2.5, 0], y: [0, 0, 2.5, 0] },
                transition: { duration: 0.55, delay: 0.25, times: [0, 0.5, 0.75, 1], ease: 'easeOut' },
              })}
        >
          {/* soft shadow */}
          <ellipse cx="14" cy="46" rx="8" ry="1.6" fill={C.graphite} opacity="0.1" />
          {/* cone body */}
          <path d="M18.5 13.5 L35.5 30.5 L13 43 Q8 45 8.5 39.5 Z" fill={C.blue} />
          {/* stripes parallel to the mouth */}
          <path d="M16.3 19.2 L14.9 22.9 L27.4 35 L30.55 33.25 Z" fill={C.white} opacity="0.85" />
          <path d="M13 27.8 L11.8 30.9 L20.4 38.9 L23.1 37.4 Z" fill={C.white} opacity="0.85" />
          {/* shade (left) + highlight (right) */}
          <path d="M18.5 13.5 L8.5 39.5 L11.2 39.4 L20.6 15.6 Z" fill={C.blueDeep} opacity="0.55" />
          <path d="M33.4 28.4 L16 40.8 L17.4 41.6 L35.5 30.5 Z" fill={C.white} opacity="0.35" />
          {/* mouth rim + dark inside */}
          <ellipse cx="27" cy="22" rx="12.6" ry="3.4" transform="rotate(45 27 22)" fill={C.graphite} />
          <ellipse cx="27.5" cy="21.5" rx="10.2" ry="2" transform="rotate(45 27.5 21.5)" fill="#1a1b25" />        </motion.g>
      </motion.g>
    </svg>
  );
};

export default PartyPopperIllustration;
