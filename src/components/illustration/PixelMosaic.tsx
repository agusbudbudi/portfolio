import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// The brand's pixel-mosaic ornament (docs/DESIGN.md "Pixel-Art Hero
// Decoration"). Tiles fan in diagonally when scrolled into view; a few keep
// twinkling. `variant` picks the tile tints: blue on a white canvas, white on
// a blue band.

// B strongest, W mid, P faintest. 12 cols × 9 rows, dense toward top-right.
const PATTERN = [
  '......PWWBB.',
  '....P.WBBWBB',
  '.....PWWBBWB',
  '...P..PWBWBB',
  '......PPWWBW',
  '....P...PWWB',
  '.........PWW',
  '.......P..PW',
  '...........P',
];

type Tone = 'B' | 'W' | 'P';

const TONES: Record<'blue' | 'white', Record<Tone, string>> = {
  blue: { B: 'bg-ld-violet', W: 'bg-ld-lavender', P: 'bg-ld-lilac' },
  white: { B: 'bg-white/20', W: 'bg-white/12', P: 'bg-white/[0.07]' },
};

const PixelMosaic: React.FC<{
  variant: 'blue' | 'white';
  className?: string;
  style?: React.CSSProperties;
}> = ({ variant, className = '', style }) => {
  const reduce = useReducedMotion();
  const tones = TONES[variant];
  return (
    <motion.div
      aria-hidden="true"
      className={`grid grid-cols-12 gap-1 pointer-events-none ${className}`}
      style={style}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {PATTERN.flatMap((row, y) =>
        [...row].map((ch, x) =>
          ch === '.' ? (
            <span key={`${x}-${y}`} className="aspect-square" />
          ) : (
            <motion.span
              key={`${x}-${y}`}
              className={`aspect-square rounded-[2px] ${tones[ch as Tone]}`}
              variants={{
                hidden: { opacity: 0, scale: 0.4 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.35, delay: 0.05 + (11 - x + y) * 0.04 } },
              }}
              {...(reduce || (x * 7 + y * 3) % 5 !== 0
                ? {}
                : { animate: { opacity: [1, 0.35, 1] }, transition: { duration: 2.6, delay: 1.5 + ((x + y) % 4) * 0.4, repeat: Infinity } })}
            />
          ),
        ),
      )}
    </motion.div>
  );
};

export default PixelMosaic;
