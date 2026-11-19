import React from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, slide, useLoop } from '../../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame, Shadow } from '../../../../components/illustration/IllustrationParts';

// Animated art for the /portfolio "3 Langkah, Portfolio Siap Tayang" steps:
// sign in → fill the profile → publish & share. Same flat-vector kit and
// no-panel + Whisper-circle treatment as FeatureIllustration
// (docs/DESIGN.md → Mentor.QA Adaptations). Each step has its own
// composition and signature motion.

const Blob: React.FC = () => (
  <motion.circle variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }} cx="110" cy="84" r="60" fill={C.whisper} />
);

// ── 1. Login: lock opens, Google button clicked, avatar lands with a tick ──
const Login: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-sl" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-sl)">
          <rect x="58" y="34" width="104" height="100" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <circle cx="110" cy="62" r="15" fill={C.frost} />
        <Bar delay={0.35} x="84" y="84" width="52" height="5" rx="2.5" fill={C.graphite} opacity="0.8" />
        <Bar delay={0.4} x="92" y="94" width="36" height="3.5" rx="1.75" fill={C.frost} />
      </motion.g>
      {/* Google button */}
      <motion.g variants={pop(0.55)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ scale: [1, 1, 0.94, 1] }, 2.6, 1.4)} style={{ originX: 0.5, originY: 0.5 }}>
          <rect x="72" y="106" width="76" height="16" rx="8" fill={C.white} stroke={C.ash} />
          <circle cx="84" cy="114" r="4.5" fill="none" stroke={C.blue} strokeWidth="2" />
          <rect x="84" y="113" width="5" height="2" fill={C.blue} />
          <rect x="94" y="112" width="44" height="4" rx="2" fill={C.graphite} opacity="0.7" />
        </motion.g>
      </motion.g>
      {/* avatar fills in once signed in */}
      <motion.g variants={pop(1.3)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="110" cy="62" r="15" fill={C.wash} />
        <circle cx="110" cy="58" r="5.5" fill={C.blue} />
        <path d="M100 72 a10 9 0 0 1 20 0" fill={C.blue} />
      </motion.g>
      <motion.g variants={pop(1.6)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="122" cy="73" r="6" fill={C.blue} stroke={C.white} strokeWidth="2" />
        <motion.path variants={draw(1.75, 0.25)} d="M119.5 73 l1.8 1.8 l3.4 -3.6" stroke={C.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
      {/* lock unlocks */}
      <motion.g variants={pop(0.3)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ y: [0, -3, 0] }, 2.6, 2)}>
          <motion.path
            variants={{ hidden: { y: 0, rotate: 0 }, show: { y: -5, rotate: -22, transition: { delay: 1.0, type: 'spring', stiffness: 260, damping: 12 } } }}
            style={{ originX: 0, originY: 1 }}
            d="M160 40 v-6 a8 8 0 0 1 16 0 v6" stroke={C.graphite} strokeWidth="3.5" fill="none" strokeLinecap="round"
          />
          <rect x="155" y="39" width="26" height="22" rx="5" fill={C.blue} />
          <circle cx="168" cy="48" r="2.6" fill={C.white} />
          <rect x="167" y="49" width="2" height="5" rx="1" fill={C.white} />
        </motion.g>
      </motion.g>
    </>
  );
};

// ── 2. Fill profile: fields type in one by one, chips slide into the form ──
const Fill: React.FC = () => {
  const loop = useLoop();
  const fields = [
    { y: 62, w: 48, d: 0.55 },
    { y: 84, w: 62, d: 0.95 },
    { y: 106, w: 40, d: 1.35 },
  ];
  return (
    <>
      <defs><Shadow id="sh-sf" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-sf)">
          <rect x="44" y="28" width="116" height="112" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <circle cx="64" cy="44" r="9" fill={C.wash} />
        <circle cx="64" cy="41.5" r="3.2" fill={C.blue} />
        <path d="M58 50 a6 5.5 0 0 1 12 0" fill={C.blue} />
        <rect x="78" y="40" width="40" height="4.5" rx="2.25" fill={C.graphite} opacity="0.8" />
        <rect x="78" y="48" width="26" height="3" rx="1.5" fill={C.frost} />
      </motion.g>
      {fields.map((f, i) => (
        <g key={f.y}>
          <motion.rect variants={fadeUp(0.25 + i * 0.08)} x="54" y={f.y - 7} width="96" height="14" rx="5" fill={C.white} stroke={i === 2 ? C.blue : C.ash} strokeWidth={i === 2 ? 1.6 : 1} />
          <Bar delay={f.d} x="60" y={f.y - 2} width={f.w} height="4" rx="2" fill={C.graphite} opacity="0.65" />
        </g>
      ))}
      {/* typing caret in the active field */}
      <motion.rect variants={fadeUp(1.5)} x="102" y="101" width="1.6" height="10" fill={C.blue} {...loop({ opacity: [1, 0, 1] }, 1, 1.8)} />
      {/* chips slide into the form */}
      <motion.g variants={slide(26, 0, 1.6)}>
        <rect x="140" y="58" width="44" height="14" rx="7" fill={C.blue} />
        <rect x="148" y="63" width="28" height="4" rx="2" fill={C.white} />
      </motion.g>
      <motion.g variants={slide(26, 0, 1.8)}>
        <rect x="146" y="78" width="40" height="14" rx="7" fill={C.graphite} />
        <rect x="154" y="83" width="22" height="4" rx="2" fill={C.wash} />
      </motion.g>
    </>
  );
};

// ── 3. Publish & share: URL fills, live dot pulses, a paper plane flies off ──
const Publish: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-sp" /></defs>
      <Blob />
      <motion.g variants={fadeUp(0.1)}>
        <g filter="url(#sh-sp)">
          <rect x="34" y="46" width="128" height="92" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <path d="M34 58 a12 12 0 0 1 12 -12 h104 a12 12 0 0 1 12 12 v6 h-128 z" fill={C.frost} />
        <circle cx="45" cy="55" r="2.2" fill="#ff5f57" />
        <circle cx="52" cy="55" r="2.2" fill="#febc2e" />
        <circle cx="59" cy="55" r="2.2" fill="#28c840" />
        <rect x="68" y="50" width="86" height="10" rx="5" fill={C.white} />
        <circle cx="48" cy="84" r="8" fill={C.wash} />
        <Bar delay={0.5} x="62" y="80" width="46" height="4.5" rx="2.25" fill={C.graphite} opacity="0.8" />
        <Bar delay={0.55} x="62" y="89" width="30" height="3.5" rx="1.75" fill={C.frost} />
        <Bar delay={0.6} x="44" y="104" width="104" height="22" rx="6" fill={C.whisper} />
      </motion.g>
      {/* URL types in */}
      <Bar delay={0.45} x="80" y="53.5" width="52" height="3" rx="1.5" fill={C.blue} />
      {/* live dot */}
      <motion.g variants={pop(0.9)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.circle
          cx="74" cy="55" r="4" fill="#10b981" opacity="0.3"
          style={{ originX: 0.5, originY: 0.5 }}
          {...loop({ scale: [1, 2, 1], opacity: [0.35, 0, 0.35] }, 1.6, 1.2)}
        />
        <circle cx="74" cy="55" r="2.4" fill="#10b981" />
      </motion.g>
      {/* paper plane carries the link out */}
      <motion.path
        variants={draw(1.2, 0.8)}
        d="M150 98 C 166 92, 170 70, 184 56"
        stroke={C.blue} strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round"
      />
      <motion.g variants={slide(-30, 30, 1.2)}>
        <motion.g {...loop({ x: [0, 4, 0], y: [0, -4, 0] }, 2.2, 2.2)}>
          <path d="M178 44 L204 34 L192 60 L188 50 z" fill={C.blue} />
          <path d="M188 50 L204 34 L184 47 z" fill={C.graphite} opacity="0.35" />
        </motion.g>
      </motion.g>
    </>
  );
};

export type StepIllustrationName = 'login' | 'fill' | 'publish';

const ART: Record<StepIllustrationName, React.FC> = { login: Login, fill: Fill, publish: Publish };

const StepIllustration: React.FC<{ name: StepIllustrationName; className?: string }> = ({ name, className }) => {
  const Art = ART[name];
  return <IllustrationFrame className={className}><Art /></IllustrationFrame>;
};

export default StepIllustration;
