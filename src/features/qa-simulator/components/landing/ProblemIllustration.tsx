import React from 'react';
import { motion } from 'framer-motion';
import { C, draw, fadeUp, pop, slide, useLoop } from '../../../../components/illustration/illustrationKit';
import { Bar, IllustrationFrame, Shadow } from '../../../../components/illustration/IllustrationParts';

// Animated spot illustrations for the "Kenapa simulasi?" pain points. Same
// flat-vector language and motion kit as PhaseIllustration.

// Course video finished + certificate earned… but the project slot is empty.
const Theory: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-th" /></defs>
      <motion.g variants={fadeUp(0)}>
        <g filter="url(#sh-th)">
          <rect x="24" y="18" width="124" height="96" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <rect x="32" y="26" width="108" height="58" rx="8" fill={C.whisper} />
        <Bar delay={0.25} x="32" y="100" width="64" height="5" rx="2.5" fill={C.graphite} opacity="0.75" />
      </motion.g>
      <motion.g variants={pop(0.3)} style={{ originX: 0.5, originY: 0.5 }}>
        <motion.g {...loop({ scale: [1, 1.08, 1] }, 1.8, 1)} style={{ originX: 0.5, originY: 0.5 }}>
          <circle cx="86" cy="55" r="14" fill={C.blue} />
          <path d="M81 48 l12 7 l-12 7 z" fill={C.white} />
        </motion.g>
      </motion.g>
      <rect x="32" y="90" width="108" height="4" rx="2" fill={C.frost} />
      <Bar delay={0.45} x="32" y="90" width="108" height="4" rx="2" fill={C.blue} />

      {/* certificate badge */}
      <motion.g variants={pop(1.0)} style={{ originX: 0.5, originY: 0.5 }}>
        <path d="M144 48 l-6 20 l8 -4 l4 7 l4 -18 z M164 48 l6 20 l-8 -4 l-4 7 l-4 -18 z" fill={C.blue} opacity="0.85" />
        <circle cx="154" cy="38" r="17" fill={C.wash} />
        <circle cx="154" cy="38" r="12" fill={C.blue} />
        <motion.path variants={draw(1.3, 0.3)} d="M148.5 38 l4 4 l7 -8" stroke={C.white} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>

      {/* the missing piece: an empty project slot */}
      <motion.g variants={slide(16, 16, 1.5)}>
        <rect x="108" y="96" width="92" height="46" rx="10" fill={C.white} />
        <motion.rect
          {...loop({ strokeDashoffset: [0, -16] }, 1.4, 0, 'linear')}
          x="108" y="96" width="92" height="46" rx="10" stroke={C.steel} strokeWidth="1.5" strokeDasharray="5 3"
        />
        <motion.g {...loop({ opacity: [1, 0.35, 1] }, 1.8, 2)}>
          <path d="M154 111 v16 M146 119 h16" stroke={C.steel} strokeWidth="2.4" strokeLinecap="round" />
        </motion.g>
      </motion.g>
    </>
  );
};

// Interviewer asks; the candidate's reply is stuck on "typing…".
const Interview: React.FC = () => {
  const loop = useLoop();
  return (
    <>
      <defs><Shadow id="sh-iv" /></defs>
      <motion.g variants={pop(0)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="36" cy="46" r="15" fill={C.frost} />
        <circle cx="36" cy="42" r="5.5" fill={C.graphite} />
        <path d="M26 55 a10 9 0 0 1 20 0" fill={C.graphite} />
      </motion.g>
      <motion.g variants={pop(0.2)} style={{ originX: 0, originY: 0.6 }}>
        <g filter="url(#sh-iv)">
          <path d="M58 26 h118 a12 12 0 0 1 12 12 v18 a12 12 0 0 1 -12 12 h-104 a12 12 0 0 1 -12 -12 v-14 l-8 -6 z" fill={C.white} stroke={C.ash} />
        </g>
        <Bar delay={0.5} x="74" y="38" width="74" height="5" rx="2.5" fill={C.graphite} opacity="0.75" />
        <Bar delay={0.6} x="74" y="50" width="58" height="5" rx="2.5" fill={C.frost} />
        <motion.g variants={pop(0.8)} style={{ originX: 0.5, originY: 0.5 }}>
          <circle cx="166" cy="47" r="8" fill={C.blue} />
          <text x="166" y="51.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" fill={C.white}>?</text>
        </motion.g>
      </motion.g>

      <motion.g variants={pop(1.2)} style={{ originX: 1, originY: 0.6 }}>
        <g filter="url(#sh-iv)">
          <path d="M80 92 h80 a12 12 0 0 1 12 12 v6 l8 6 l-8 2 a12 12 0 0 1 -12 10 h-80 a12 12 0 0 1 -12 -12 v-12 a12 12 0 0 1 12 -12 z" fill={C.blue} />
        </g>
        {[104, 120, 136].map((cx, i) => (
          <motion.circle key={cx} cx={cx} cy="110" r="4" fill={C.white} {...loop({ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }, 0.9, i * 0.15)} />
        ))}
      </motion.g>
      <motion.g variants={pop(1.0)} style={{ originX: 0.5, originY: 0.5 }}>
        <circle cx="196" cy="118" r="15" fill={C.wash} />
        <circle cx="196" cy="114" r="5.5" fill={C.blue} />
        <path d="M186 127 a10 9 0 0 1 20 0" fill={C.blue} />
      </motion.g>
    </>
  );
};

// Job post demands experience ↔ empty experience: an endless loop.
const Loop: React.FC = () => {
  const loop = useLoop();
  const flow = (delay: number) => loop({ strokeDashoffset: [0, -16] }, 1, delay, 'linear');
  return (
    <>
      <defs><Shadow id="sh-lp" /></defs>
      <motion.g variants={fadeUp(0)}>
        <g filter="url(#sh-lp)">
          <rect x="18" y="34" width="92" height="94" rx="12" fill={C.white} stroke={C.ash} />
        </g>
        <rect x="30" y="47" width="18" height="13" rx="3" fill={C.graphite} />
        <path d="M35 47 v-3 h8 v3" stroke={C.graphite} strokeWidth="2" fill="none" />
        <Bar delay={0.2} x="54" y="47" width="44" height="5" rx="2.5" fill={C.graphite} opacity="0.75" />
        <Bar delay={0.25} x="54" y="55" width="28" height="4" rx="2" fill={C.frost} />
        <Bar delay={0.35} x="30" y="94" width="62" height="4" rx="2" fill={C.frost} />
        <Bar delay={0.4} x="30" y="103" width="46" height="4" rx="2" fill={C.frost} />
        <rect x="30" y="113" width="30" height="8" rx="4" fill={C.blue} />
      </motion.g>
      <Bar delay={0.6} x="26" y="70" width="76" height="16" rx="5" fill={C.whisper} />
      <Bar delay={0.75} x="32" y="76" width="58" height="4.5" rx="2.25" fill={C.blue} opacity="0.65" />

      <motion.g variants={slide(16, 0, 0.5)}>
        <rect x="132" y="50" width="70" height="62" rx="12" fill={C.white} stroke={C.ash} strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="167" y="84" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="17" fill={C.steel}>0 thn</text>
        <rect x="150" y="93" width="34" height="4" rx="2" fill={C.ash} />
      </motion.g>

      {/* cycle arrows, flowing forever */}
      <motion.g variants={fadeUp(1.1)}>
        <motion.path {...flow(0)} d="M68 30 C 90 4, 150 4, 166 44" stroke={C.blue} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="5 3" />
        <path d="M159 38 L166 46 L170 36" stroke={C.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <motion.path {...flow(0.5)} d="M167 118 C 150 152, 92 152, 70 134" stroke={C.blue} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="5 3" />
        <path d="M70 143 L68 132 L78 131" stroke={C.blue} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </>
  );
};

export type ProblemIllustrationName = 'theory' | 'interview' | 'loop';

const ART: Record<ProblemIllustrationName, React.FC> = { theory: Theory, interview: Interview, loop: Loop };

const ProblemIllustration: React.FC<{ name: ProblemIllustrationName; className?: string }> = ({ name, className }) => {
  const Art = ART[name];
  return <IllustrationFrame className={className}><Art /></IllustrationFrame>;
};

export default ProblemIllustration;
