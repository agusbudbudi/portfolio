import React, { useId } from 'react';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { C, pop } from '../../../components/illustration/illustrationKit';
import { Bar, Shadow } from '../../../components/illustration/IllustrationParts';
import PixelMosaic from '../../../components/illustration/PixelMosaic';

// Compact hero art for /qa-library (design canvas "QA Library Hero", option
// A): a magnifying glass sweeps over an article, the line it rests on lights
// up Sky Blue and a matching tag pops out (#test-case, #api, #bug-report).
// Echoes the search box beside it. Entrance plays once in view, then a 7s
// loop; static (glass on the first hit, all tags shown) under reduced
// motion. Brand tokens only; decorative.

const LOOP = 7;
const ENTRANCE = 1.1;

// Glass path: rest → line 1 → line 2 → rest (offsets from its start point).
const SCAN = {
  x: [0, 0, 120, 120, 30, 30, 0],
  y: [0, 0, 46, 46, 92, 92, 0],
  times: [0, 0.08, 0.3, 0.38, 0.6, 0.68, 0.92],
};

const loopTransition = (times: number[], delay = 0): Transition => ({
  duration: LOOP, times, repeat: Infinity, ease: 'easeInOut', delay: ENTRANCE + delay,
});

// [x, y, width, label, style, loop delay]
const TAGS: [number, number, number, string, 'solid' | 'outline' | 'dark', number][] = [
  [338, 74, 92, '#test-case', 'solid', 0],
  [348, 152, 74, '#api', 'outline', 2.3],
  [36, 128, 96, '#bug-report', 'dark', 4.6],
];

const QaLibraryHeroArt: React.FC = () => {
  const reduce = !!useReducedMotion();
  const shadowId = `qlh-sh-${useId().replace(/:/g, '')}`;

  const highlight = (from: number, to: number) => reduce
    ? {}
    : {
        animate: { fill: [C.ash, C.ash, C.blue, C.blue, C.ash, C.ash] },
        transition: loopTransition([0, from - 0.08, from, to, to + 0.08, 1]),
      };

  return (
    <div aria-hidden="true" className="relative w-full max-w-[380px] ml-auto select-none">
      {/* Brand pixel mosaic behind the art, as on the other page heroes. */}
      <PixelMosaic variant="blue" className="absolute -top-8 -right-6 w-[55%] max-w-[220px] opacity-70" />
      <motion.svg
        viewBox="0 0 460 300"
        className="relative w-full h-auto"
        fill="none"
        initial={reduce ? 'show' : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <defs><Shadow id={shadowId} /></defs>

        <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="230" cy="150" r="128" fill={C.whisper} />

        {/* the article: rises in, then floats */}
        <motion.g
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.1 } },
          }}
        >
          <motion.g {...(reduce ? {} : { animate: { y: [0, -6, 0] }, transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: ENTRANCE } })}>
            <g filter={`url(#${shadowId})`}>
              <rect x="120" y="44" width="220" height="210" rx="16" fill={C.white} stroke={C.ash} />
            </g>
            <Bar delay={0.35} x="140" y="64" width="90" height="10" rx="5" fill={C.blue} />
            <rect x="140" y="84" width="54" height="16" rx="8" fill={C.whisper} />
            <Bar delay={0.45} x="140" y="116" width="180" height="6" rx="3" fill={C.ash} />
            <Bar delay={0.5} x="140" y="130" width="150" height="6" rx="3" fill={C.ash} />
            <motion.rect x="140" y="144" width="166" height="6" rx="3" fill={reduce ? C.blue : C.ash} {...highlight(0.3, 0.52)} />
            <Bar delay={0.6} x="140" y="158" width="120" height="6" rx="3" fill={C.ash} />
            <Bar delay={0.65} x="140" y="172" width="172" height="6" rx="3" fill={C.ash} />
            <motion.rect x="140" y="190" width="140" height="6" rx="3" fill={C.ash} {...highlight(0.6, 0.84)} />
            <Bar delay={0.75} x="140" y="204" width="176" height="6" rx="3" fill={C.ash} />
            <Bar delay={0.8} x="140" y="218" width="96" height="6" rx="3" fill={C.ash} />
          </motion.g>
        </motion.g>

        {/* the magnifying glass: pops in, then sweeps line to line */}
        <motion.g variants={pop(0.85)} style={{ originX: 0.5, originY: 0.5 }}>
          <motion.g
            {...(reduce
              ? { style: { x: 120, y: 46 } }
              : { animate: { x: SCAN.x, y: SCAN.y }, transition: loopTransition(SCAN.times) })}
          >
            <g transform="translate(150 96)">
              <circle cx="0" cy="0" r="30" fill="rgba(255,255,255,0.35)" stroke={C.graphite} strokeWidth="7" />
              <path d="M22 22 L44 44" stroke={C.graphite} strokeWidth="10" strokeLinecap="round" />
              <path d="M-14 -10 a18 18 0 0 1 12 -9" stroke={C.white} strokeWidth="4" strokeLinecap="round" />
            </g>
          </motion.g>
        </motion.g>

        {/* tags found, one per stop of the glass */}
        {TAGS.map(([x, y, w, label, style, delay]) => (
          <motion.g
            key={label}
            style={{ originX: 0.5, originY: 0.5 }}
            {...(reduce
              ? {}
              : {
                  initial: { scale: 0, opacity: 0 },
                  animate: { scale: [0, 0, 1, 1, 0, 0], opacity: [0, 0, 1, 1, 0, 0] },
                  transition: loopTransition([0, 0.2, 0.28, 0.8, 0.9, 1], delay),
                })}
          >
            <rect
              x={x} y={y} width={w} height="28" rx="14"
              fill={style === 'solid' ? C.blue : style === 'dark' ? C.graphite : C.white}
              stroke={style === 'outline' ? C.blue : undefined}
            />
            <text
              x={x + w / 2} y={y + 19} textAnchor="middle" fontSize="12" fontWeight="600"
              fill={style === 'outline' ? C.blue : C.white}
              style={{ fontFamily: 'inherit' }}
            >
              {label}
            </text>
          </motion.g>
        ))}
      </motion.svg>
    </div>
  );
};

export default QaLibraryHeroArt;
