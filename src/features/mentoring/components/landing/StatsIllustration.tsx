import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Small looping illustrations for the StatsStrip bento cards (replacing the
// plain icon tiles). Brand palette: violet #3b9eff, lavender #c9e4ff,
// lilac #e3f2ff, onyx #1a1b25. All motion is disabled under
// prefers-reduced-motion — the static frame still reads on its own.

const VIOLET = '#3b9eff';
const LAVENDER = '#c9e4ff';
const LILAC = '#e3f2ff';
const ONYX = '#1a1b25';

const Svg: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <svg viewBox="0 0 80 80" className={className} aria-hidden="true">{children}</svg>
);

/** Clock with a sweeping minute hand and a filling progress ring. */
export const ClockIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  return (
    <Svg className={className}>
      <circle cx="40" cy="40" r="34" fill={LILAC} />
      <motion.circle
        cx="40" cy="40" r="30" fill="none" stroke={VIOLET} strokeWidth="4" strokeLinecap="round"
        transform="rotate(-90 40 40)"
        initial={{ pathLength: still ? 1 : 0 }}
        animate={still ? undefined : { pathLength: [0, 1, 1] }}
        transition={{ duration: 6, times: [0, 0.85, 1], repeat: Infinity, ease: 'linear' }}
      />
      <circle cx="40" cy="40" r="24" fill="#fff" />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x="39" y="18" width="2" height="4" rx="1" fill={LAVENDER} transform={`rotate(${a} 40 40)`} />
      ))}
      <line x1="40" y1="40" x2="40" y2="30" stroke={ONYX} strokeWidth="3" strokeLinecap="round" transform="rotate(-60 40 40)" />
      {/* SMIL rotate pivots exactly on the clock centre (40,40); CSS/framer
          transform-origin on SVG children resolves against the element's own
          box, which made the hand orbit instead of sweep. */}
      <line x1="40" y1="40" x2="40" y2="23" stroke={VIOLET} strokeWidth="2.5" strokeLinecap="round">
        {!still && <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="6s" repeatCount="indefinite" />}
      </line>
      <circle cx="40" cy="40" r="3" fill={ONYX} />
    </Svg>
  );
};

/** Two people with chat bubbles popping in turn. */
export const ChatIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const pop = (delay: number) =>
    still
      ? {}
      : {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] },
          transition: { duration: 3.2, times: [0, 0.12, 0.85, 1], repeat: Infinity, delay, repeatDelay: 0.4 },
        };
  return (
    <Svg className={className}>
      <circle cx="40" cy="40" r="34" fill={LILAC} />
      {/* people */}
      <circle cx="24" cy="50" r="7" fill={VIOLET} />
      <path d="M12 68a12 10 0 0 1 24 0z" fill={VIOLET} />
      <circle cx="56" cy="50" r="7" fill={ONYX} />
      <path d="M44 68a12 10 0 0 1 24 0z" fill={ONYX} />
      {/* bubbles */}
      <motion.g style={{ originX: 0.25, originY: 1 }} {...pop(0)}>
        <rect x="10" y="18" width="26" height="15" rx="7" fill="#fff" stroke={LAVENDER} />
        <path d="M17 32l-2 5 6-4z" fill="#fff" />
        <circle cx="17" cy="25.5" r="1.6" fill={VIOLET} /><circle cx="23" cy="25.5" r="1.6" fill={VIOLET} /><circle cx="29" cy="25.5" r="1.6" fill={VIOLET} />
      </motion.g>
      <motion.g style={{ originX: 0.75, originY: 1 }} {...pop(1.6)}>
        <rect x="44" y="18" width="26" height="15" rx="7" fill={VIOLET} />
        <path d="M63 32l2 5-6-4z" fill={VIOLET} />
        <rect x="49" y="23" width="16" height="2" rx="1" fill="#fff" />
        <rect x="49" y="27" width="10" height="2" rx="1" fill="#fff" opacity="0.7" />
      </motion.g>
    </Svg>
  );
};

/** Stack of topic cards bobbing out of sync. */
export const TopicsIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const cards = [
    { x: 14, y: 46, w: 44, color: LAVENDER, bar: VIOLET, rot: -6 },
    { x: 20, y: 34, w: 46, color: '#fff', bar: ONYX, rot: 4 },
    { x: 16, y: 21, w: 46, color: VIOLET, bar: '#fff', rot: -3 },
  ];
  return (
    <Svg className={className}>
      <circle cx="40" cy="40" r="34" fill={LILAC} />
      {cards.map((c, i) => (
        <motion.g
          key={i}
          animate={still ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.35 }}
        >
          <g transform={`rotate(${c.rot} ${c.x + c.w / 2} ${c.y + 7})`}>
            <rect x={c.x} y={c.y} width={c.w} height="14" rx="3" fill={c.color} stroke={c.color === '#fff' ? LAVENDER : 'none'} />
            <rect x={c.x + 5} y={c.y + 4} width={c.w * 0.45} height="2.4" rx="1.2" fill={c.bar} />
            <rect x={c.x + 5} y={c.y + 8.5} width={c.w * 0.28} height="2" rx="1" fill={c.bar} opacity="0.45" />
          </g>
        </motion.g>
      ))}
    </Svg>
  );
};

/** Calendar whose day cells light up one by one, then a check pops in. */
export const CalendarIllustration: React.FC<{ className?: string }> = ({ className }) => {
  const still = useReducedMotion();
  const cells = Array.from({ length: 8 }, (_, i) => ({ x: 20 + (i % 4) * 11, y: 34 + Math.floor(i / 4) * 11 }));
  return (
    <Svg className={className}>
      <circle cx="40" cy="40" r="34" fill={LILAC} />
      <rect x="14" y="18" width="52" height="46" rx="6" fill="#fff" stroke={LAVENDER} />
      <path d="M14 24a6 6 0 0 1 6-6h40a6 6 0 0 1 6 6v4H14z" fill={VIOLET} />
      <rect x="24" y="14" width="3" height="8" rx="1.5" fill={ONYX} />
      <rect x="53" y="14" width="3" height="8" rx="1.5" fill={ONYX} />
      {cells.map((c, i) => (
        <motion.rect
          key={i} x={c.x} y={c.y} width="8" height="8" rx="2"
          initial={{ fill: still ? LAVENDER : LILAC }}
          animate={still ? undefined : { fill: [LILAC, LAVENDER, LAVENDER, LILAC] }}
          transition={{ duration: 4, times: [0, 0.1, 0.85, 1], repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
      <motion.g
        style={{ originX: 0.5, originY: 0.5 }}
        initial={{ scale: still ? 1 : 0, opacity: still ? 1 : 0 }}
        animate={still ? undefined : { scale: [0, 0, 1.35, 0.88, 1.08, 1, 1, 1.2, 0], opacity: [0, 0, 1, 1, 1, 1, 1, 1, 0] }}
        transition={{ duration: 4, times: [0, 0.4, 0.5, 0.56, 0.62, 0.68, 0.86, 0.92, 1], repeat: Infinity, ease: 'easeOut' }}
      >
        <circle cx="58" cy="58" r="9" fill={VIOLET} stroke="#fff" strokeWidth="2" />
        <path d="M54 58l3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </Svg>
  );
};
