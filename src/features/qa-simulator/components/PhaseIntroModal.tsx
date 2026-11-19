import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hash, X } from 'lucide-react';
import type { SimulatorPhase, SimulatorTeamMember } from '../../../types/qaSimulator';
import Markdown from './Markdown';
import TeamAvatar from './TeamAvatar';
import { splitBriefBubbles } from '../lib/phaseIntro';

const typingDelay = (text: string) => Math.min(1700, 550 + text.length * 7);

const TypingDots: React.FC = () => (
  <span className="inline-flex items-center gap-1" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-ld-steel"
        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </span>
);

interface PhaseIntroModalProps {
  phase: SimulatorPhase;
  phaseNumber: number;
  totalPhases: number;
  team: SimulatorTeamMember[];
  channel: string;
  onClose: () => void;
}

// First-visit intro per phase: phase title, then the team's brief "typed out"
// bubble by bubble like a chat channel, ending with the learner's reply.
const PhaseIntroModal: React.FC<PhaseIntroModalProps> = ({ phase, phaseNumber, totalPhases, team, channel, onClose }) => {
  const from = team.find((m) => m.id === phase.brief.fromId) ?? team[0];
  const bubbles = useMemo(() => splitBriefBubbles(phase.brief.message), [phase.brief.message]);
  const [shown, setShown] = useState(0);
  const [replied, setReplied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const done = shown >= bubbles.length;

  // Reveal the next bubble after a "typing" pause sized to its length.
  // The first one waits a beat so the phase title registers first.
  useEffect(() => {
    if (done) return;
    const delay = (shown === 0 ? 700 : 0) + typingDelay(bubbles[shown]);
    const t = window.setTimeout(() => setShown((n) => n + 1), delay);
    return () => window.clearTimeout(t);
  }, [shown, done, bubbles]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [shown, replied]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  useEffect(() => {
    if (!replied) return;
    const t = window.setTimeout(onClose, 900);
    return () => window.clearTimeout(t);
  }, [replied, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ld-onyx/60 backdrop-blur-sm sm:p-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="phase-intro-title"
        className="w-full sm:max-w-xl h-[85dvh] sm:h-[min(640px,88vh)] flex flex-col bg-white rounded-t-2xl sm:rounded-lg overflow-hidden shadow-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Phase title */}
        <div className="relative bg-ld-onyx text-white px-6 pt-6 pb-5 overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-10 w-48 h-48 rounded-full bg-ld-violet/25 blur-2xl" aria-hidden="true" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-none cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-white/60"
          >
            <X size={18} />
          </button>
          <motion.p
            className="relative m-0 pr-12 font-ld-mono text-[11px] uppercase tracking-[0.2em] text-emerald-300"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            Phase {phaseNumber} / {totalPhases}
          </motion.p>
          <motion.h2
            id="phase-intro-title"
            className="relative m-0 mt-1.5 pr-12 text-2xl sm:text-3xl font-semibold tracking-[-0.02em]"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            {phase.title}
          </motion.h2>
          <motion.p
            className="relative m-0 mt-2 text-sm text-white/70"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          >
            {phase.summary}
          </motion.p>
        </div>

        {/* Channel */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b border-ld-frost text-xs font-semibold text-ld-graphite bg-white">
          <Hash size={13} className="text-ld-fog" /> {channel}
          <span className="ml-auto font-normal text-ld-fog">{team.length + 1} anggota</span>
        </div>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto bg-ld-cloud px-4 sm:px-5 py-4 space-y-2">
          {from && (
            <div className="flex items-start gap-3">
              <TeamAvatar member={from} />
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="m-0 text-xs text-ld-slate">
                  <span className="font-semibold text-ld-onyx">{from.name}</span> · {from.role}
                </p>
                <AnimatePresence initial={false}>
                  {bubbles.slice(0, shown).map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="w-fit max-w-full rounded-2xl rounded-tl-sm bg-white border border-ld-frost px-3.5 py-2.5 text-sm"
                    >
                      <Markdown className="text-sm">{b}</Markdown>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!done && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="inline-flex px-3 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-ld-frost"><TypingDots /></span>
                    <span className="text-[11px] text-ld-fog">{from.name.split(' ')[0]} sedang mengetik…</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {replied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end pt-2"
            >
              <span className="rounded-2xl rounded-tr-sm bg-ld-violet text-white px-3.5 py-2.5 text-sm">Siap, aku kerjakan! 👍</span>
            </motion.div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-ld-frost bg-white flex items-center justify-between gap-3">
          {done ? (
            <>
              <span className="text-xs text-ld-fog">Brief ini tetap bisa dibaca lagi di halaman.</span>
              <button
                type="button"
                disabled={replied}
                onClick={() => setReplied(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] disabled:opacity-60 text-white text-sm font-medium border-none cursor-pointer transition-colors shrink-0"
              >
                Siap, aku kerjakan! 👍
              </button>
            </>
          ) : (
            <>
              <span className="text-xs text-ld-fog">Pesan masuk dari tim…</span>
              <button
                type="button"
                onClick={() => setShown(bubbles.length)}
                className="px-3 py-2.5 rounded-lg bg-transparent hover:bg-ld-cloud text-sm font-medium text-ld-slate border-none cursor-pointer shrink-0"
              >
                Tampilkan semua
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhaseIntroModal;
