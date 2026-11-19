import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { C, draw, fadeUp, pop, slide, useLoop } from '../../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame, Shadow } from '../../../../components/illustration/IllustrationParts';

// Animated flat-vector spot illustrations for the three simulator phases,
// drawn as miniature product UI (12px-radius cards, hairline Ash borders,
// slate-tinted shadow) — echoing DESIGN.md's "Product Preview Card".

// PRD card → ambiguous line gets highlighted + underlined → "?" bubble pops
// up for the PM → magnifier slides in and keeps scanning.
const Requirement: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-req" /></defs>
      <motion.g variants={fadeUp(0)}>
        <g filter="url(#sh-req)">
          <rect x="40" y="18" width="112" height="128" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <Bar delay={0.2} x="54" y="34" width="44" height="8" rx="4" fill={C.blue} />
        <Bar delay={0.3} x="54" y="50" width="70" height="5" rx="2.5" fill={C.frost} />
        <Bar delay={0.36} x="54" y="62" width="84" height="5" rx="2.5" fill={C.frost} />
        <Bar delay={0.42} x="54" y="104" width="76" height="5" rx="2.5" fill={C.frost} />
        <Bar delay={0.48} x="54" y="116" width="58" height="5" rx="2.5" fill={C.frost} />
        <Bar delay={0.54} x="54" y="128" width="68" height="5" rx="2.5" fill={C.frost} />
      </motion.g>

      <Bar delay={0.75} x="50" y="74" width="92" height="15" rx="5" fill={C.whisper} />
      <Bar delay={0.85} x="54" y="79" width="62" height="5" rx="2.5" fill={C.blue} opacity="0.55" />
      <motion.path
        variants={draw(1.0, 0.5)}
        d="M54 92 q4 -3 8 0 t8 0 t8 0 t8 0 t8 0 t8 0 t8 0"
        stroke={C.blue} strokeWidth="1.6" fill="none" strokeLinecap="round"
      />

      <motion.g variants={pop(1.4)} style={{ originX: 0.2, originY: 1 }}>
        <motion.g {...loop({ y: [0, -3, 0] }, 2.4, 1.8)}>
          <g filter="url(#sh-req)">
            <path d="M140 40 h44 a10 10 0 0 1 10 10 v20 a10 10 0 0 1 -10 10 h-30 l-10 9 v-9 h-4 a10 10 0 0 1 -10 -10 v-20 a10 10 0 0 1 10 -10 z" fill={C.blue} />
          </g>
          <motion.text
            {...loop({ rotate: [0, -12, 10, 0] }, 1.6, 2.2)}
            style={{ originX: 0.5, originY: 0.7 }}
            x="162" y="68" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="22" fill={C.white}
          >?</motion.text>
        </motion.g>
      </motion.g>

      <motion.g variants={slide(24, 24, 0.5)}>
        <motion.g {...loop({ x: [0, -6, 2, 0], y: [0, -3, 2, 0] }, 4, 1.2)}>
          <circle cx="150" cy="110" r="17" fill={C.white} fillOpacity="0.6" stroke={C.graphite} strokeWidth="5" />
          <path d="M162 122 l14 14" stroke={C.graphite} strokeWidth="7" strokeLinecap="round" />
          <path d="M141 103 a10 10 0 0 1 8 -4" stroke={C.wash} strokeWidth="3" fill="none" strokeLinecap="round" />
        </motion.g>
      </motion.g>
    </>
  );
};

const Check: React.FC<{ cx: number; cy: number; delay: number; r?: number }> = ({ cx, cy, delay, r = 7 }) => (
  <g>
    <motion.circle variants={pop(delay)} cx={cx} cy={cy} r={r} fill={C.blue} />
    <motion.path
      variants={draw(delay + 0.18, 0.3)}
      d={`M${cx - r * 0.43} ${cy} l${r * 0.3} ${r * 0.3} l${r * 0.57} -${r * 0.6}`}
      stroke={C.white} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
    />
  </g>
);

// Test case table: rows appear, then each case gets ticked one by one; the
// last one stays pending (spinning dashed ring); technique chip slides in.
const TestDesign: React.FC = () => {
  const loop = useLoop();
  const rows = [60, 84, 108];
  return (
    <>
      <defs><Shadow id="sh-td" /></defs>
      <motion.g variants={fadeUp(0)}>
        <g filter="url(#sh-td)">
          <rect x="30" y="22" width="140" height="120" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <path d="M30 34 a12 12 0 0 1 12 -12 h116 a12 12 0 0 1 12 12 v8 h-140 z" fill={C.frost} />
        <rect x="44" y="29" width="24" height="5" rx="2.5" fill={C.steel} />
        <rect x="88" y="29" width="40" height="5" rx="2.5" fill={C.ash} />
      </motion.g>

      {rows.map((y, i) => (
        <g key={y}>
          <Bar delay={0.25 + i * 0.1} x="68" y={y - 6} width="48" height="5" rx="2.5" fill={C.graphite} opacity="0.75" />
          <Bar delay={0.3 + i * 0.1} x="68" y={y + 2} width="76" height="4" rx="2" fill={C.frost} />
          <motion.line variants={fadeUp(0.3 + i * 0.1)} x1="44" x2="156" y1={y + 12} y2={y + 12} stroke={C.frost} />
          <Check cx={52} cy={y} delay={0.8 + i * 0.35} />
        </g>
      ))}

      <motion.g variants={fadeUp(0.55)}>
        <motion.circle
          {...loop({ rotate: 360 }, 6)}
          style={{ originX: 0.5, originY: 0.5 }}
          cx="52" cy="130" r="6.5" fill="none" stroke={C.ash} strokeWidth="1.5" strokeDasharray="3 2.5"
        />
        <Bar delay={0.6} x="68" y="127" width="40" height="5" rx="2.5" fill={C.ash} />
      </motion.g>

      <motion.g variants={slide(30, 0, 2.0)}>
        <motion.g {...loop({ y: [0, -3, 0] }, 3, 2.6)}>
          <g filter="url(#sh-td)">
            <rect x="136" y="96" width="62" height="30" rx="8" fill={C.graphite} />
          </g>
          <rect x="145" y="105" width="12" height="12" rx="3" fill={C.blue} />
          <rect x="162" y="105" width="28" height="4.5" rx="2.25" fill={C.white} />
          <rect x="162" y="113" width="18" height="4" rx="2" fill={C.steel} />
        </motion.g>
      </motion.g>
    </>
  );
};

// Staging window → bug crawls in → dashed selection draws around it and keeps
// "marching" → bug report card pops up.
const BugHunting: React.FC = () => {
  const loop = useLoop();
  const reduce = useReducedMotion();
  return (
    <>
      <defs><Shadow id="sh-bug" /></defs>
      <motion.g variants={fadeUp(0)}>
        <g filter="url(#sh-bug)">
          <rect x="22" y="20" width="150" height="116" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <path d="M22 32 a12 12 0 0 1 12 -12 h126 a12 12 0 0 1 12 12 v6 h-150 z" fill={C.frost} />
        <circle cx="34" cy="29" r="2.6" fill="#ff5f57" />
        <circle cx="43" cy="29" r="2.6" fill="#febc2e" />
        <circle cx="52" cy="29" r="2.6" fill="#28c840" />
        <Bar delay={0.2} x="36" y="50" width="54" height="6" rx="3" fill={C.graphite} opacity="0.75" />
        <Bar delay={0.28} x="36" y="62" width="40" height="5" rx="2.5" fill={C.frost} />
        <motion.rect variants={fadeUp(0.35)} x="36" y="78" width="54" height="40" rx="8" fill={C.whisper} />
        <Bar delay={0.45} x="44" y="88" width="30" height="5" rx="2.5" fill={C.wash} />
        <Bar delay={0.5} x="44" y="99" width="20" height="8" rx="4" fill={C.blue} />
      </motion.g>

      {/* bug: crawls in, then idles with a wobble + leg shuffle */}
      <motion.g variants={slide(-40, 20, 0.5)}>
        <g transform="translate(132 86)">
          <motion.g {...loop({ rotate: [-5, 5, -5] }, 1.2)}>
            {[-8, 0, 8].map((dy, i) => (
              <motion.g
                key={dy}
                stroke={C.graphite} strokeWidth="2.4" strokeLinecap="round"
                {...loop({ scaleX: [1, 0.85, 1] }, 0.4, i * 0.13)}
              >
                <path d={`M-9 ${dy} h-7 l-3 ${dy === 0 ? 0 : dy > 0 ? 3 : -3}`} fill="none" />
                <path d={`M9 ${dy} h7 l3 ${dy === 0 ? 0 : dy > 0 ? 3 : -3}`} fill="none" />
              </motion.g>
            ))}
            <path d="M-4 -15 l-4 -6 M4 -15 l4 -6" stroke={C.graphite} strokeWidth="2.2" strokeLinecap="round" />
            <ellipse cx="0" cy="-12" rx="7" ry="5" fill={C.graphite} />
            <ellipse cx="0" cy="2" rx="11" ry="14" fill={C.blue} />
            <line x1="0" y1="-11" x2="0" y2="16" stroke={C.graphite} strokeWidth="2" />
            <circle cx="-5" cy="-2" r="2" fill={C.whisper} />
            <circle cx="5" cy="6" r="2" fill={C.whisper} />
          </motion.g>
        </g>
      </motion.g>

      <motion.g variants={pop(1.2)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.rect
          {...(reduce ? {} : { animate: { strokeDashoffset: [0, -18] }, transition: { duration: 1.2, repeat: Infinity, ease: 'linear' } })}
          x="104" y="58" width="56" height="56" rx="10" fill="none" stroke={C.blue} strokeWidth="2" strokeDasharray="5 4"
        />
      </motion.g>

      <motion.g variants={pop(1.7)} style={{ originX: 0.1, originY: 0.5 }}>
        <g filter="url(#sh-bug)">
          <rect x="134" y="118" width="64" height="26" rx="8" fill={C.white} stroke={C.ash} />
        </g>
        <motion.circle {...loop({ scale: [1, 1.35, 1] }, 1.4, 2)} style={{ originX: 0.5, originY: 0.5 }} cx="146" cy="131" r="4" fill={C.blue} />
        <Bar delay={1.9} x="156" y="125" width="34" height="5" rx="2.5" fill={C.graphite} opacity="0.75" />
        <Bar delay={2.0} x="156" y="133" width="22" height="4" rx="2" fill={C.ash} />
      </motion.g>
    </>
  );
};

export type PhaseIllustrationName = 'requirement' | 'testDesign' | 'bugHunting';

const ART: Record<PhaseIllustrationName, React.FC> = {
  requirement: Requirement,
  testDesign: TestDesign,
  bugHunting: BugHunting,
};

const PhaseIllustration: React.FC<{ name: PhaseIllustrationName; className?: string }> = ({ name, className }) => {
  const Art = ART[name];
  return <IllustrationFrame className={className}><Art /></IllustrationFrame>;
};

export default PhaseIllustration;
