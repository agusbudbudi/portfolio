import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { BadgeCheck, Check, Copy, FlaskConical, Linkedin, Mail } from 'lucide-react';

// Home "Portfolio QA" row art, same grammar as the other showcases: three
// stacked, non-overlapping pieces — share link (left) → portfolio profile
// (full width) → recruiter invite (right). Sample content only; plays once
// on mount (mounted when scrolled into view). Decorative only.

const EASE = [0.4, 0, 0.2, 1] as const;
const SHADOW = 'shadow-[0_18px_40px_-12px_rgba(39,40,53,0.2)]';

const rise = (delay: number, y = 18): Variants => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } },
});
const pop = (delay: number): Variants => ({
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 18, delay } },
});

const SKILLS = ['Manual Testing', 'API Testing', 'Cypress', 'Test Planning'];
const TOOLS = ['postman-logo-new.svg', 'jira-logo-new.svg', 'cypress-logo.svg', 'figma-logo-new.svg'];

const PortfolioShowcase: React.FC = () => {
  const reduce = !!useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[520px] mx-auto flex flex-col gap-7 py-6 select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      {/* share link — left */}
      <motion.div variants={rise(0.05)} className={`relative w-[78%] flex items-center gap-2 rounded-xl bg-white border border-ld-frost p-2 ${SHADOW}`}>
        <span className="flex-1 min-w-0 rounded-lg bg-ld-cloud border border-ld-frost px-2.5 py-2 font-ld-mono text-[10.5px] text-ld-graphite truncate">
          mentorqa.com/portfolio/<span className="text-ld-violet">kamu</span>
        </span>
        <span className="relative shrink-0 h-[30px] w-[78px]">
          <motion.span
            className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-ld-violet text-white text-[10px] font-medium"
            variants={{ hidden: { opacity: 1 }, show: { opacity: 0, transition: { delay: 1.9, duration: 0.2 } } }}
          >
            <Copy size={11} /> Salin link
          </motion.span>
          <motion.span
            className="absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-emerald-500 text-white text-[10px] font-medium"
            variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1, transition: { delay: 1.95, type: 'spring', stiffness: 320, damping: 18 } } }}
          >
            <Check size={11} strokeWidth={3} /> Tersalin
          </motion.span>
        </span>
      </motion.div>

      {/* portfolio profile — full width */}
      <motion.div variants={rise(0.35, 26)} className={`relative w-full rounded-xl bg-white border border-ld-frost overflow-hidden ${SHADOW}`}>
        {/* hero band — miniature of the real public portfolio header
            (saas-portfolio ProfileHeroBand): blue band + grid, square photo
            with Open to Work strip, name, role · exp, Verified pill, socials */}
        <div className="relative bg-ld-violet px-4 py-4 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'linear-gradient(to right, transparent, black)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
            }}
          />
          <div className="relative flex items-center gap-3">
            <span className="relative w-[68px] h-[68px] shrink-0">
              <img src="/saas-portfolio/img/portfolio-public/default-avatar-portfolio.webp" alt="" className="w-full h-full object-cover rounded-xl border-[3px] border-white" />
              <span className="absolute inset-x-[3px] bottom-[3px] flex items-center justify-center gap-1 py-0.5 rounded-b-[9px] bg-emerald-500/85 text-white text-[7px] font-semibold">
                <span className="w-1 h-1 rounded-full bg-white" /> Open to Work
              </span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[17px] font-semibold text-white leading-tight tracking-[-0.02em]">Nama Kamu</span>
              <span className="block mt-0.5 text-[9.5px] font-medium text-white/90">QA Engineer Manual &amp; API <span className="text-white/50">•</span> 1+ Years Exp</span>
              <span className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border-[1.5px] border-blue-600 shadow-[2px_2px_0_0_#2563eb]">
                <BadgeCheck size={11} className="text-blue-500" fill="currentColor" stroke="white" />
                <span className="text-[8px] font-medium text-ld-graphite">Verified by</span>
                <img src="/shared/img/mentor-logo-96.webp" alt="" className="w-2.5 h-2.5 object-contain" />
                <span className="text-[8px] font-semibold text-ld-graphite">Mentor<span className="text-ld-violet">.QA</span></span>
              </span>
            </span>
            <span className="hidden sm:flex flex-col gap-1.5 self-end">
              <span className="w-6 h-6 rounded-md bg-white/10 border border-white/30 text-white flex items-center justify-center"><Linkedin size={11} /></span>
              <span className="w-6 h-6 rounded-md bg-white/10 border border-white/30 text-white flex items-center justify-center"><Mail size={11} /></span>
            </span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="mt-3 flex flex-wrap gap-1.5">
            {['Jakarta, Indonesia', 'Full Time', 'Remote, Hybrid'].map((m) => (
              <span key={m} className="px-1.5 py-0.5 rounded-md border border-ld-frost text-[8.5px] text-ld-slate">{m}</span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {SKILLS.map((s, i) => (
              <motion.span key={s} variants={pop(0.75 + i * 0.1)} className="px-2 py-0.5 rounded-md bg-ld-cloud border border-ld-frost text-[9.5px] text-ld-graphite">{s}</motion.span>
            ))}
          </div>

          <motion.div variants={rise(1.2, 10)} className="mt-3 flex items-center gap-2.5 rounded-lg border border-ld-frost p-2">
            <span className="w-9 h-9 rounded-md bg-ld-lilac text-ld-violet flex items-center justify-center shrink-0"><FlaskConical size={16} /></span>
            <span className="flex-1 min-w-0">
              <span className="block text-[10.5px] font-semibold text-ld-onyx truncate">Studi kasus: Split Bill v2</span>
              <span className="block text-[9px] text-ld-slate truncate">32 test case · 8 bug ditemukan · Rekomendasi No-Go</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-ld-lilac text-ld-violet text-[8px] font-semibold shrink-0">QA Simulator</span>
          </motion.div>

          <div className="mt-3 flex items-center gap-1.5">
            {TOOLS.map((t, i) => (
              <motion.span key={t} variants={pop(1.4 + i * 0.08)} className="w-7 h-7 rounded-md border border-ld-frost bg-white p-1.5">
                <img src={`/personal-portfolio/img/tools/${t}`} alt="" className="w-full h-full object-contain" />
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* recruiter invite — right */}
      <motion.div variants={pop(2.2)} className={`relative w-[70%] self-end origin-top-right flex items-start gap-2.5 rounded-xl bg-white border border-ld-frost p-3 ${SHADOW}`}>
        <span className="w-8 h-8 rounded-full bg-ld-violet text-white flex items-center justify-center shrink-0"><Mail size={14} /></span>
        <span className="min-w-0">
          <span className="block text-[10.5px] font-semibold text-ld-onyx">Undangan interview</span>
          <span className="block mt-0.5 text-[9.5px] text-ld-slate leading-snug">Recruiter melihat portfolio-mu dan mengundang ke interview QA Engineer.</span>
        </span>
      </motion.div>
    </motion.div>
  );
};

export default PortfolioShowcase;
