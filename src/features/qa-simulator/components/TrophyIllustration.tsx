import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Flat-vector trophy for the "all phases done" completion bar, in the same
// language as the landing illustrations (docs/DESIGN.md palette: Sky Blue cup,
// Graphite base, white highlights). Plays on mount: the trophy springs up with
// a little wobble, the star draws in, confetti bursts out; afterwards a shine
// sweeps the cup and the confetti twinkles. Static under reduced motion.

const C = {
  blue: '#3b9eff',
  blueDeep: '#1f87e6',
  wash: '#c9e4ff',
  whisper: '#e3f2ff',
  white: '#ffffff',
  graphite: '#36394a',
  slate: '#666d80',
};

// Confetti: [x, y, burst dx, burst dy, shape, color, rotate]
const CONFETTI: [number, number, number, number, 'rect' | 'dot', string, number][] = [
  [10, 12, -5, -4, 'rect', C.blue, 20],
  [6, 26, -5, 1, 'dot', C.wash, 0],
  [12, 38, -4, 4, 'rect', C.wash, -30],
  [16, 4, -2, -5, 'dot', C.blue, 0],
  [50, 10, 5, -4, 'rect', C.wash, -20],
  [54, 24, 5, 0, 'dot', C.blue, 0],
  [48, 38, 4, 4, 'rect', C.blue, 35],
  [44, 3, 2, -5, 'dot', C.wash, 0],
];

const TrophyIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  const reduce = useReducedMotion();
  const clipId = `trophy-cup-${useId().replace(/:/g, '')}`;
  const cupPath = 'M19 8 h22 v8 a11 11 0 0 1 -22 0 z';

  return (
    <svg viewBox="0 0 60 50" className={className} fill="none" role="img" aria-label="Trofi">
      <defs>
        <clipPath id={clipId}><path d={cupPath} /></clipPath>
      </defs>

      {/* confetti burst, then twinkle */}
      {CONFETTI.map(([x, y, dx, dy, shape, color, rot], i) => (
        <motion.g
          key={i}
          initial={reduce ? false : { x: 30 - x, y: 22 - y, scale: 0, opacity: 0 }}
          animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 12, delay: 0.35 + (i % 4) * 0.04 }}
        >
          <motion.g
            {...(reduce
              ? {}
              : {
                  animate: { x: [0, dx * 0.3, 0], y: [0, dy * 0.3, 0], opacity: [1, 0.45, 1] },
                  transition: { duration: 2.2, delay: 1.2 + i * 0.15, repeat: Infinity, ease: 'easeInOut' },
                })}
          >
            {shape === 'rect' ? (
              <rect x={x - 1.6} y={y - 0.9} width="3.2" height="1.8" rx="0.6" fill={color} transform={`rotate(${rot} ${x} ${y})`} />
            ) : (
              <circle cx={x} cy={y} r="1.3" fill={color} />
            )}
          </motion.g>
        </motion.g>
      ))}

      {/* trophy: spring up + wobble */}
      <motion.g
        style={{ originX: 0.5, originY: 1 }}
        initial={reduce ? false : { y: 14, scale: 0.6, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 13, delay: 0.05 }}
      >
        <motion.g
          style={{ originX: 0.5, originY: 1 }}
          {...(reduce ? {} : { animate: { rotate: [0, -6, 5, -2, 0] }, transition: { duration: 0.8, delay: 0.55 } })}
        >
          {/* handles */}
          <path d="M19 11 h-4 a4 4 0 0 0 0 8 h5" stroke={C.blueDeep} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M41 11 h4 a4 4 0 0 1 0 8 h-5" stroke={C.blueDeep} strokeWidth="2.4" strokeLinecap="round" />
          {/* cup */}
          <path d={cupPath} fill={C.blue} />
          <rect x="18" y="6.5" width="24" height="3" rx="1.5" fill={C.blueDeep} />
          <path d="M23 11 v5 a7 7 0 0 0 3 5.5" stroke={C.wash} strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
          {/* shine sweep */}
          <g clipPath={`url(#${clipId})`}>
            <g transform="skewX(-20)">
              <motion.rect
                x="14" y="4" width="5" height="30" fill={C.white} opacity="0.45"
                initial={{ x: -10 }}
                {...(reduce ? {} : { animate: { x: [-10, 40] }, transition: { duration: 0.9, delay: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' } })}
              />
            </g>
          </g>
          {/* star */}
          <motion.path
            d="M30 10.5 l1.6 3.3 3.6 .5 -2.6 2.5 .6 3.6 -3.2 -1.7 -3.2 1.7 .6 -3.6 -2.6 -2.5 3.6 -.5 z"
            fill={C.white}
            stroke={C.white}
            strokeWidth="0.6"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0, opacity: 0, scale: 0.4 }}
            animate={{ pathLength: 1, opacity: 1, scale: 1 }}
            style={{ originX: 0.5, originY: 0.5 }}
            transition={{ duration: 0.45, delay: 0.6, ease: 'easeOut' }}
          />
          {/* stem + base */}
          <rect x="27.5" y="26.5" width="5" height="6" fill={C.blueDeep} />
          <rect x="23" y="32" width="14" height="4" rx="1.5" fill={C.slate} />
          <rect x="20" y="36" width="20" height="6" rx="2" fill={C.graphite} />
          <rect x="25" y="38.2" width="10" height="1.6" rx="0.8" fill={C.whisper} opacity="0.5" />
        </motion.g>
      </motion.g>
    </svg>
  );
};

export default TrophyIllustration;
