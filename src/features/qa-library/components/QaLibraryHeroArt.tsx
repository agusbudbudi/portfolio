import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import { C } from '../../../components/illustration/illustrationKit';
import type { QaLibraryCategory } from '../../../types/qaLibrary';

// Compact hero art for /qa-library: a flat-vector bookshelf. Each book stands
// for a topic; the one Sky Blue book (the focal element) slides up off the
// shelf, and the category chips underneath name what's on it. Brand tokens
// only, Graphite outlines; plays once on mount with one gentle idle bob on
// the blue book. Static under reduced motion. Decorative.

// [x, width, height, fill, spine-bar colour, tilt]
const BOOKS: [number, number, number, string, string, number][] = [
  [40, 22, 86, C.wash, C.blue, 0],
  [64, 16, 74, C.white, C.ash, 0],
  [82, 26, 92, C.whisper, C.wash, 0],
  [138, 18, 80, C.white, C.ash, 0],
  [158, 24, 70, C.wash, C.white, 0],
  [184, 20, 88, C.white, C.ash, 0],
  [206, 28, 78, C.whisper, C.wash, 0],
  [254, 18, 84, C.wash, C.white, 0],
  [274, 22, 72, C.white, C.ash, 0],
  [318, 24, 90, C.whisper, C.wash, -14],
];
const SHELF_Y = 128;
const PULLED = { x: 110, w: 24, h: 96 };

const QaLibraryHeroArt: React.FC<{ categories: QaLibraryCategory[] }> = ({ categories }) => {
  const reduce = !!useReducedMotion();
  const chips = categories.length ? categories.slice(0, 4).map((c) => c.label) : ['QA Fundamentals', 'Test Planning', 'Automation', 'AI in QA'];

  return (
    <div aria-hidden="true" className="relative w-full max-w-[440px] ml-auto select-none">
      <PixelMosaic variant="blue" className="absolute -top-6 -right-4" style={{ width: 'min(50%, 200px)' }} />

      <svg viewBox="0 0 360 150" className="relative w-full h-auto" fill="none">
        {/* shelf */}
        <rect x="24" y={SHELF_Y} width="324" height="8" rx="3" fill={C.white} stroke={C.graphite} strokeWidth="2" />
        <rect x="40" y={SHELF_Y + 8} width="10" height="8" rx="1.5" fill={C.graphite} />
        <rect x="322" y={SHELF_Y + 8} width="10" height="8" rx="1.5" fill={C.graphite} />

        {/* books */}
        {BOOKS.map(([x, w, h, fill, bar, tilt], i) => (
          <motion.g
            key={x}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <g transform={tilt ? `rotate(${tilt} ${x} ${SHELF_Y})` : undefined}>
              <rect x={x} y={SHELF_Y - h} width={w} height={h} rx="3" fill={fill} stroke={C.graphite} strokeWidth="2" />
              <rect x={x + 4} y={SHELF_Y - h + 10} width={w - 8} height="3" rx="1.5" fill={bar} />
              <rect x={x + 4} y={SHELF_Y - 16} width={w - 8} height="3" rx="1.5" fill={bar} />
            </g>
          </motion.g>
        ))}

        {/* gap where the blue book came from */}
        <rect x={PULLED.x} y={SHELF_Y - 20} width={PULLED.w} height="18" rx="2" fill={C.whisper} opacity="0.6" />

        {/* the pulled-out blue book */}
        <motion.g
          initial={reduce ? false : { y: 0, rotate: 0, opacity: 0 }}
          animate={reduce ? undefined : { y: [0, -34, -30], rotate: [0, -6, -6], opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0.5, originY: 1 }}
          transform={reduce ? `translate(0 -30) rotate(-6 ${PULLED.x + PULLED.w / 2} ${SHELF_Y})` : undefined}
        >
          <motion.g
            animate={reduce ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          >
            <rect x={PULLED.x} y={SHELF_Y - PULLED.h} width={PULLED.w} height={PULLED.h} rx="3" fill={C.blue} stroke={C.graphite} strokeWidth="2" />
            <rect x={PULLED.x + 4} y={SHELF_Y - PULLED.h + 10} width={PULLED.w - 8} height="3" rx="1.5" fill={C.white} />
            <rect x={PULLED.x + 4} y={SHELF_Y - PULLED.h + 17} width={PULLED.w - 12} height="3" rx="1.5" fill={C.white} opacity="0.7" />
            <rect x={PULLED.x + 4} y={SHELF_Y - 16} width={PULLED.w - 8} height="3" rx="1.5" fill={C.white} />
          </motion.g>
        </motion.g>

        {/* sparkle */}
        <motion.path
          d="M146 14q0 6 6 6-6 0-6 6 0-6-6-6 6 0 6-6z"
          fill={C.blue}
          initial={reduce ? false : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, type: 'spring', stiffness: 300, damping: 15 }}
          style={{ originX: 0.5, originY: 0.5 }}
        />
      </svg>

      <div className="mt-2 flex flex-wrap justify-end gap-1.5">
        {chips.map((c, i) => (
          <span
            key={c}
            className={`px-2 py-0.5 rounded-md text-[10.5px] font-medium ${i === 0 ? 'bg-ld-violet text-white' : 'bg-ld-cloud border border-ld-frost text-ld-slate'}`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
};

export default QaLibraryHeroArt;
