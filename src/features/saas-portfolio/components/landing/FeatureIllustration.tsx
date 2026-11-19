import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { C, draw, fadeUp, pop, useLoop } from '../../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame, Shadow } from '../../../../components/illustration/IllustrationParts';

// Animated spot illustrations for the /portfolio "Yang Membantu Kamu Dapat
// Interview" cards. Same flat-vector kit and palette as the QA Simulator
// landing (docs/DESIGN.md → Mentor.QA Adaptations), but each card gets its
// own composition and signature motion so the row doesn't read as five copies
// of one card: fanned cards + cursor, career stairs, gears, clipboard +
// pencil + stamp, medal + sparkles.

const Blob: React.FC<{ cx: number; cy: number; r: number }> = ({ cx, cy, r }) => (
  <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx={cx} cy={cy} r={r} fill={C.whisper} />
);

// ── Project: fanned cards, a cursor glides in and clicks, a star lands ──
const Project: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-fp" /></defs>
      <Blob cx={110} cy={84} r={60} />
      <motion.rect
        variants={{ hidden: { rotate: 0, opacity: 0 }, show: { rotate: -14, opacity: 1, transition: { duration: 0.6, delay: 0.15 } } }}
        style={{ originX: 0.5, originY: 0.5 }}
        x="56" y="34" width="96" height="84" rx="10" fill={C.wash}
      />
      <motion.rect
        variants={{ hidden: { rotate: 0, opacity: 0 }, show: { rotate: 11, opacity: 1, transition: { duration: 0.6, delay: 0.2 } } }}
        style={{ originX: 0.5, originY: 0.5 }}
        x="70" y="34" width="96" height="84" rx="10" fill={C.white} stroke={C.ash}
      />
      <motion.g variants={fadeUp(0.3)}>
        <g filter="url(#sh-fp)">
          <rect x="58" y="36" width="104" height="92" rx="10" fill={C.white} stroke={C.ash} />
        </g>
        <path d="M58 46 a10 10 0 0 1 10 -10 h84 a10 10 0 0 1 10 10 v2 h-104 z" fill={C.frost} />
        <circle cx="66" cy="42" r="1.8" fill="#ff5f57" />
        <circle cx="72" cy="42" r="1.8" fill="#febc2e" />
        <circle cx="78" cy="42" r="1.8" fill="#28c840" />
        <rect x="66" y="54" width="88" height="34" rx="5" fill={C.whisper} />
        <circle cx="140" cy="63" r="5" fill={C.wash} />
        <path d="M70 84 l16 -14 l10 8 l14 -12 l20 18 z" fill={C.blue} opacity="0.55" />
        <Bar delay={0.55} x="66" y="95" width="56" height="4.5" rx="2.25" fill={C.graphite} opacity="0.8" />
        <Bar delay={0.6} x="66" y="103" width="76" height="3.5" rx="1.75" fill={C.frost} />
      </motion.g>
      {/* button that gets "clicked" */}
      <motion.g variants={pop(0.75)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.rect
          {...loop({ scale: [1, 1, 0.92, 1] }, 2.4, 1.6)}
          style={{ originX: 0.5, originY: 0.5 }}
          x="66" y="111" width="40" height="10" rx="5" fill={C.blue}
        />
      </motion.g>
      <motion.g
        variants={{ hidden: { x: 60, y: 34, opacity: 0 }, show: { x: 0, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 120, damping: 16, delay: 1.0 } } }}
      >
        <motion.g {...loop({ y: [0, 0, 2, 0] }, 2.4, 1.6)}>
          <path d="M95 115 v15 l4 -4 l3 6.5 l3 -1.4 l-3 -6.4 h5.5 z" fill={C.graphite} stroke={C.white} strokeWidth="1.2" strokeLinejoin="round" />
        </motion.g>
      </motion.g>
      {/* star badge */}
      <motion.g variants={pop(1.5)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ y: [0, -3, 0] }, 2.6, 2)}>
          <circle cx="164" cy="36" r="12" fill={C.blue} />
          <path d="M164 29.5 l2 4.1 4.5 .6 -3.3 3.1 .8 4.5 -4 -2.1 -4 2.1 .8 -4.5 -3.3 -3.1 4.5 -.6 z" fill={C.white} />
        </motion.g>
      </motion.g>
    </>
  );
};

// ── Experience: career stairs grow, an avatar hops to the top, flag waves ──
const Experience: React.FC = () => {
  const loop = useLoop();
  const steps = [
    { x: 50, top: 104, fill: C.whisper, stroke: C.wash },
    { x: 92, top: 82, fill: C.wash, stroke: C.wash },
    { x: 134, top: 60, fill: C.blue, stroke: C.blue },
  ];
  return (
    <>
      <Blob cx={112} cy={88} r={58} />
      <motion.line variants={fadeUp(0)} x1="40" x2="182" y1="132" y2="132" stroke={C.ash} strokeWidth="2" strokeLinecap="round" />
      {steps.map((s, i) => (
        <motion.g
          key={s.x}
          variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.15 + i * 0.15 } } }}
          style={{ originX: 0.5, originY: 1 }}
        >
          <rect x={s.x} y={s.top} width="38" height={132 - s.top} rx="6" fill={s.fill} stroke={s.stroke} />
          <rect x={s.x + 8} y={s.top + 10} width="22" height="4" rx="2" fill={i === 2 ? C.white : C.graphite} opacity={i === 2 ? 0.9 : 0.55} />
          <rect x={s.x + 8} y={s.top + 18} width="14" height="3" rx="1.5" fill={i === 2 ? C.wash : C.ash} />
        </motion.g>
      ))}
      {/* flag on the top step */}
      <motion.g variants={pop(1.9)} style={{ originX: 0, originY: 1 }}>
        <line x1="166" y1="60" x2="166" y2="36" stroke={C.graphite} strokeWidth="2" strokeLinecap="round" />
        <motion.path
          {...loop({ skewY: [0, 6, 0] }, 1.4, 2.2)}
          style={{ originX: 0, originY: 0.5 }}
          d="M167 37 h14 l-4 5 l4 5 h-14 z" fill={C.graphite}
        />
      </motion.g>
      {/* avatar hops step to step */}
      <motion.g
        variants={{
          hidden: { x: 69, y: 104, opacity: 0 },
          show: {
            x: [69, 69, 90, 111, 132, 153],
            y: [104, 104, 74, 82, 52, 60],
            opacity: [0, 1, 1, 1, 1, 1],
            transition: { duration: 1.3, delay: 0.7, times: [0, 0.1, 0.3, 0.5, 0.75, 1], ease: 'easeInOut' },
          },
        }}
      >
        <motion.g {...loop({ y: [0, -2.5, 0] }, 1.6, 2.2)}>
          <circle cx="0" cy="-17" r="5" fill={C.graphite} />
          <path d="M-7 0 a7 8 0 0 1 14 0 z" fill={C.graphite} />
          <path d="M-7 0 v-3 a7 8 0 0 1 14 0 v3 z" fill={C.graphite} />
        </motion.g>
      </motion.g>
    </>
  );
};

// ── Automation: terminal ticks tests while two gears turn ──
const gearPath = (cx: number, cy: number, ro: number, ri: number, n: number) => {
  const step = (Math.PI * 2) / n;
  const pt = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  let d = '';
  for (let k = 0; k < n; k++) {
    const a = k * step;
    d += `${k === 0 ? 'M' : 'L'}${pt(ri, a)} L${pt(ro, a + step * 0.15)} L${pt(ro, a + step * 0.45)} L${pt(ri, a + step * 0.6)} `;
  }
  return `${d}Z`;
};

const Automation: React.FC = () => {
  const reduce = useReducedMotion();
  const spin = (deg: number, duration: number) =>
    reduce ? {} : { animate: { rotate: deg }, transition: { duration, repeat: Infinity, ease: 'linear' as const, delay: 0.8 } };
  return (
    <>
      <defs><Shadow id="sh-fa" /></defs>
      <Blob cx={108} cy={84} r={58} />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-fa)">
          <rect x="34" y="44" width="110" height="88" rx="10" fill="#1a1b25" />
        </g>
        <circle cx="46" cy="55" r="2.2" fill="#ff5f57" />
        <circle cx="53" cy="55" r="2.2" fill="#febc2e" />
        <circle cx="60" cy="55" r="2.2" fill="#28c840" />
      </motion.g>
      {[72, 88, 104].map((y, i) => (
        <g key={y}>
          <motion.g variants={pop(0.6 + i * 0.35)} style={{ originX: 0.5, originY: 0.5 }}>
            <circle cx="48" cy={y} r="4.5" fill={C.blue} />
            <motion.path variants={draw(0.72 + i * 0.35, 0.2)} d={`M45.8 ${y} l1.5 1.5 l3 -3`} stroke="#1a1b25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
          <Bar delay={0.4 + i * 0.35} x="58" y={y - 2} width={[60, 46, 68][i]} height="4" rx="2" fill={i === 1 ? C.wash : C.steel} opacity="0.85" />
        </g>
      ))}
      <motion.rect variants={fadeUp(1.7)} x="44" y="117" width="6" height="7" rx="1" fill={C.white} />
      {/* gears */}
      <motion.g variants={pop(0.35)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...spin(360, 9)} style={{ originX: 0.5, originY: 0.5 }}>
          <path d={gearPath(152, 54, 26, 20, 10)} fill={C.blue} />
          <circle cx="152" cy="54" r="8" fill={C.whisper} />
        </motion.g>
      </motion.g>
      <motion.g variants={pop(0.5)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...spin(-360, 6)} style={{ originX: 0.5, originY: 0.5 }}>
          <path d={gearPath(176, 92, 16, 12, 8)} fill={C.graphite} />
          <circle cx="176" cy="92" r="5" fill={C.whisper} />
        </motion.g>
      </motion.g>
    </>
  );
};

// ── Test case: clipboard checklist, pencil writes, PASS stamp lands ──
const TestCase: React.FC = () => {
  const loop = useLoop();
  const rows = [62, 80, 98];
  return (
    <>
      <defs><Shadow id="sh-ft" /></defs>
      <Blob cx={110} cy={86} r={58} />
      <motion.g variants={fadeUp(0)}>
        <g filter="url(#sh-ft)">
          <rect x="56" y="30" width="98" height="112" rx="10" fill={C.wash} />
        </g>
        <rect x="64" y="42" width="82" height="92" rx="6" fill={C.white} />
        <rect x="88" y="24" width="34" height="14" rx="5" fill={C.graphite} />
        <rect x="97" y="28" width="16" height="4" rx="2" fill={C.steel} />
      </motion.g>
      {rows.map((y, i) => (
        <g key={y}>
          <motion.rect variants={fadeUp(0.25 + i * 0.08)} x="72" y={y - 5} width="10" height="10" rx="2.5" fill={C.white} stroke={C.ash} strokeWidth="1.5" />
          <motion.path variants={draw(0.8 + i * 0.35, 0.25)} d={`M74 ${y} l2.5 2.5 l5 -6`} stroke={C.blue} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <Bar delay={0.3 + i * 0.08} x="88" y={y - 2} width={[46, 36, 42][i]} height="4" rx="2" fill={C.graphite} opacity="0.6" />
        </g>
      ))}
      <motion.rect variants={fadeUp(0.5)} x="72" y="111" width="10" height="10" rx="2.5" fill={C.white} stroke={C.ash} strokeWidth="1.5" />
      {/* line being written */}
      <motion.path variants={draw(1.0, 1.0)} d="M88 116 h34" stroke={C.graphite} strokeWidth="2.6" strokeLinecap="round" opacity="0.55" />
      {/* pencil writes across, then idles */}
      <motion.g
        variants={{ hidden: { x: -34, opacity: 0 }, show: { x: [-34, -34, 0], opacity: [0, 1, 1], transition: { duration: 1.2, delay: 0.85, times: [0, 0.15, 1] } } }}
      >
        <motion.g {...loop({ rotate: [0, -4, 0] }, 1.2, 2.2)} style={{ originX: 0, originY: 1 }}>
          <g transform="rotate(-40 122 116)">
            <rect x="122" y="88" width="8" height="24" rx="1.5" fill={C.blue} />
            <rect x="122" y="84" width="8" height="5" rx="1.5" fill={C.wash} />
            <path d="M122 112 h8 l-4 7 z" fill="#f4d9b5" />
            <path d="M125 117.2 l1 1.8 l1 -1.8 z" fill={C.graphite} />
          </g>
        </motion.g>
      </motion.g>
      {/* PASS stamp */}
      <motion.g
        variants={{ hidden: { scale: 1.8, opacity: 0 }, show: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 420, damping: 15, delay: 2.1 } } }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <g transform="rotate(-12 160 112)">
          <rect x="140" y="102" width="40" height="18" rx="5" fill={C.white} stroke={C.blue} strokeWidth="2.2" />
          <text x="160" y="115" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="10" letterSpacing="1" fill={C.blue}>PASS</text>
        </g>
      </motion.g>
    </>
  );
};

// ── Certification: tilted certificate, medal with swinging ribbons, sparkles ──
const Sparkle: React.FC<{ x: number; y: number; s: number; delay: number }> = ({ x, y, s, delay }) => {
  const loop = useLoop();
  return (
    <motion.g variants={pop(delay)} style={{ originX: 0.5, originY: 0.5 }}>
      <motion.path
        {...loop({ scale: [1, 0.4, 1], opacity: [1, 0.4, 1] }, 1.6, delay + 0.5)}
        style={{ originX: 0.5, originY: 0.5 }}
        d={`M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s} z`}
        fill={C.blue}
      />
    </motion.g>
  );
};

const Certification: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-fc" /></defs>
      <Blob cx={110} cy={86} r={58} />
      <motion.g
        variants={{ hidden: { rotate: 0, opacity: 0, y: 10 }, show: { rotate: -7, opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <g filter="url(#sh-fc)">
          <rect x="38" y="40" width="118" height="84" rx="10" fill={C.white} stroke={C.ash} />
        </g>
        <rect x="45" y="47" width="104" height="70" rx="6" fill="none" stroke={C.wash} strokeWidth="1.5" />
        <rect x="58" y="58" width="40" height="4" rx="2" fill={C.steel} />
        <rect x="58" y="68" width="62" height="7" rx="3.5" fill={C.graphite} opacity="0.85" />
        <rect x="58" y="82" width="52" height="3.5" rx="1.75" fill={C.frost} />
        <rect x="58" y="104" width="30" height="2" rx="1" fill={C.ash} />
      </motion.g>
      {/* medal */}
      <motion.g variants={pop(0.6)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ rotate: [-5, 5, -5] }, 2.6, 1.2)} style={{ originX: 0.5, originY: 0 }}>
          <path d="M141 92 l-7 28 l8 -4 l5 8 l7 -28 z" fill={C.blue} />
          <path d="M161 92 l7 28 l-8 -4 l-5 8 l-7 -28 z" fill={C.graphite} />
          <circle cx="151" cy="82" r="20" fill={C.wash} />
          <motion.circle variants={draw(0.85, 0.6)} cx="151" cy="82" r="15" stroke={C.blue} strokeWidth="3.5" />
          <motion.path
            variants={pop(1.35)}
            style={{ originX: 0.5, originY: 0.5 }}
            d="M151 73.5 l2.6 5.3 5.8 .8 -4.2 4.1 1 5.8 -5.2 -2.7 -5.2 2.7 1 -5.8 -4.2 -4.1 5.8 -.8 z"
            fill={C.blue}
          />
        </motion.g>
      </motion.g>
      <Sparkle x={182} y={56} s={6} delay={1.5} />
      <Sparkle x={120} y={50} s={4} delay={1.7} />
      <Sparkle x={184} y={110} s={4.5} delay={1.9} />
    </>
  );
};

export type FeatureIllustrationName = 'project' | 'experience' | 'automation' | 'testCase' | 'certification';

const ART: Record<FeatureIllustrationName, React.FC> = {
  project: Project,
  experience: Experience,
  automation: Automation,
  testCase: TestCase,
  certification: Certification,
};

const FeatureIllustration: React.FC<{ name: FeatureIllustrationName; className?: string }> = ({ name, className }) => {
  const Art = ART[name];
  return <IllustrationFrame className={className}><Art /></IllustrationFrame>;
};

export default FeatureIllustration;
