import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AtSign, Bold, ChevronDown, Hash, Italic, Link2, List, Pin, Plus, Send, Smile, Users, X } from 'lucide-react';
import type { SimulatorPhase, SimulatorTeamMember } from '../../../types/qaSimulator';
import Markdown from './Markdown';
import SquareAvatar from './SquareAvatar';
import { splitBriefBubbles } from '../lib/phaseIntro';

const typingDelay = (text: string) => Math.min(1700, 550 + text.length * 7);
const REPLY = 'Siap, aku kerjakan! 👍';

const formatTime = (d: Date) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const TypingDots: React.FC = () => (
  <span className="inline-flex items-center gap-0.5" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-1 h-1 rounded-full bg-ld-steel"
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

// First-visit intro per phase, styled as a Slack channel: the phase is the
// pinned channel topic, the team's brief is "typed out" message by message,
// and the learner answers from the composer.
const PhaseIntroModal: React.FC<PhaseIntroModalProps> = ({ phase, phaseNumber, totalPhases, team, channel, onClose }) => {
  const from = team.find((m) => m.id === phase.brief.fromId) ?? team[0];
  const bubbles = useMemo(() => splitBriefBubbles(phase.brief.message), [phase.brief.message]);
  const [shown, setShown] = useState(0);
  const [replied, setReplied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const done = shown >= bubbles.length;
  const time = useMemo(() => formatTime(new Date()), []);
  const firstName = from?.name.split(' ')[0] ?? '';

  // Reveal the next message after a "typing" pause sized to its length.
  // The first one waits a beat so the pinned phase card registers first.
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
    const t = window.setTimeout(onClose, 1100);
    return () => window.clearTimeout(t);
  }, [replied, onClose]);

  const canSend = done && !replied;

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-stretch sm:items-center justify-center bg-white sm:bg-ld-onyx/60 sm:backdrop-blur-sm sm:p-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="phase-intro-title"
        className="w-full sm:max-w-3xl h-dvh sm:h-[min(660px,90vh)] flex bg-white sm:rounded-xl overflow-hidden sm:shadow-2xl pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Workspace sidebar (desktop) ── */}
        <aside className="hidden sm:flex w-56 shrink-0 flex-col bg-ld-midnight text-white/70 text-sm">
          <div className="px-4 h-14 flex items-center gap-1 border-b border-white/10">
            <span className="font-semibold text-white truncate">QA Squad</span>
            <ChevronDown size={14} className="text-white/60" />
          </div>
          <div className="flex-1 overflow-y-auto py-3 space-y-5">
            <div>
              <p className="m-0 px-4 mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">Channels</p>
              <div className="px-2 space-y-px">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-ld-violet text-white font-medium">
                  <Hash size={14} className="shrink-0" /> <span className="truncate">{channel}</span>
                </span>
                {['general', 'bug-report', 'release'].map((c) => (
                  <span key={c} className="flex items-center gap-1.5 px-2 py-1 rounded-md">
                    <Hash size={14} className="shrink-0 opacity-60" /> <span className="truncate">{c}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="m-0 px-4 mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">Direct messages</p>
              <div className="px-2 space-y-px">
                {team.map((m) => (
                  <span key={m.id} className="flex items-center gap-2 px-2 py-1 rounded-md">
                    <span className="relative flex shrink-0">
                      <SquareAvatar initials={m.initials} color={m.color} src={m.avatar} size="sm" />
                      <span className="absolute -bottom-[3px] -right-[3px] w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-ld-midnight" />
                    </span>
                    <span className="truncate">{m.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-white/10 font-ld-mono text-[11px] uppercase tracking-[0.15em] text-emerald-300">
            Phase {phaseNumber} / {totalPhases}
          </div>
        </aside>

        {/* ── Channel ── */}
        <section className="flex-1 min-w-0 flex flex-col">
          <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-ld-frost">
            <div className="min-w-0 flex-1">
              <p className="m-0 flex items-center gap-1 text-[15px] font-bold text-ld-onyx">
                <Hash size={16} className="text-ld-slate shrink-0" /> <span className="truncate">{channel}</span>
              </p>
              <p className="m-0 text-xs text-ld-slate truncate">
                <span className="sm:hidden font-ld-mono text-emerald-600">P{phaseNumber}/{totalPhases} · </span>
                {phase.title}
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 h-8 pl-1 pr-2 rounded-md border border-ld-frost text-xs text-ld-graphite">
              <span className="flex items-center -space-x-1.5">
                {team.slice(0, 3).map((m) => (
                  <span key={m.id} className="flex rounded-md ring-2 ring-white">
                    <SquareAvatar initials={m.initials} color={m.color} src={m.avatar} size="sm" />
                  </span>
                ))}
              </span>
              {team.length + 1}
            </span>
            <span className="sm:hidden inline-flex items-center gap-1 text-xs text-ld-slate">
              <Users size={14} /> {team.length + 1}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto py-4">
            {/* Pinned phase card */}
            <motion.div
              className="mx-4 sm:mx-5 mb-4 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="m-0 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                <Pin size={12} className="rotate-45" /> Disematkan · Phase {phaseNumber} dari {totalPhases}
              </p>
              <h2 id="phase-intro-title" className="m-0 mt-1 text-lg font-bold tracking-[-0.01em] text-ld-onyx">
                {phase.title}
              </h2>
              <p className="m-0 mt-0.5 text-sm text-ld-slate">{phase.summary}</p>
            </motion.div>

            {/* Date divider */}
            <div className="relative flex items-center justify-center my-3 px-4">
              <span className="absolute inset-x-0 top-1/2 h-px bg-ld-frost" />
              <span className="relative px-3 py-0.5 rounded-full border border-ld-frost bg-white text-[11px] font-semibold text-ld-graphite">
                Hari ini
              </span>
            </div>

            {from && shown > 0 && (
              <div className="px-4 sm:px-5">
                <AnimatePresence initial={false}>
                  {bubbles.slice(0, shown).map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`group flex gap-2.5 -mx-4 sm:-mx-5 px-4 sm:px-5 hover:bg-ld-cloud ${i === 0 ? 'pt-1.5 pb-0.5' : 'py-0.5'}`}
                    >
                      {i === 0 ? (
                        <SquareAvatar initials={from.initials} color={from.color} src={from.avatar} />
                      ) : (
                        <span className="w-9 shrink-0 pt-1 text-right text-[10px] text-ld-fog opacity-0 group-hover:opacity-100">{time}</span>
                      )}
                      <div className="flex-1 min-w-0">
                        {i === 0 && (
                          <p className="m-0 flex flex-wrap items-baseline gap-x-1.5 leading-tight">
                            <span className="text-[15px] font-bold text-ld-onyx">{from.name}</span>
                            <span className="px-1 rounded bg-ld-frost text-[10px] font-medium text-ld-slate">{from.role}</span>
                            <span className="text-[11px] text-ld-fog">{time}</span>
                          </p>
                        )}
                        <Markdown className="text-[15px] text-ld-graphite">{b}</Markdown>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {replied && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 px-4 sm:px-5 pt-2 hover:bg-ld-cloud"
              >
                <SquareAvatar initials="KM" color="bg-ld-violet" />
                <div className="flex-1 min-w-0">
                  <p className="m-0 flex items-baseline gap-1.5 leading-tight">
                    <span className="text-[15px] font-bold text-ld-onyx">Kamu</span>
                    <span className="px-1 rounded bg-ld-frost text-[10px] font-medium text-ld-slate">QA Engineer</span>
                    <span className="text-[11px] text-ld-fog">{time}</span>
                  </p>
                  <p className="m-0 text-[15px] text-ld-graphite">{REPLY}</p>
                  {from && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.45, type: 'spring', stiffness: 400, damping: 15 }}
                      className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border border-ld-violet/40 bg-ld-lilac text-xs text-ld-violet"
                    >
                      🙌 1
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 px-4 sm:px-5 pb-3">
            <div className="rounded-lg border border-ld-ash focus-within:border-ld-steel bg-white">
              <div className="flex items-center gap-0.5 px-2 pt-1.5 text-ld-fog" aria-hidden="true">
                {[Bold, Italic, Link2, List].map((Icon, i) => (
                  <span key={i} className="w-7 h-7 flex items-center justify-center rounded"><Icon size={15} /></span>
                ))}
              </div>
              <div className={`px-3 py-1.5 text-[15px] min-h-[2.25rem] ${canSend ? 'text-ld-onyx' : 'text-ld-fog'}`}>
                {canSend ? REPLY : replied ? `Kirim pesan ke #${channel}` : `Tunggu ${firstName} selesai mengetik…`}
              </div>
              <div className="flex items-center justify-between px-2 pb-1.5">
                <div className="flex items-center gap-0.5 text-ld-fog" aria-hidden="true">
                  <span className="w-7 h-7 flex items-center justify-center rounded-full bg-ld-cloud"><Plus size={15} /></span>
                  <span className="w-7 h-7 flex items-center justify-center rounded"><Smile size={15} /></span>
                  <span className="w-7 h-7 flex items-center justify-center rounded"><AtSign size={15} /></span>
                </div>
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={() => setReplied(true)}
                  aria-label={`Kirim: ${REPLY}`}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-ld-violet hover:bg-[#1f87e6] disabled:bg-ld-frost disabled:text-ld-fog text-white text-sm font-medium border-none cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} /> <span className="hidden sm:inline">Kirim</span>
                </button>
              </div>
            </div>
            <div className="h-6 flex items-center justify-between gap-3 text-[11px] text-ld-slate">
              {!done && from ? (
                <>
                  <span className="inline-flex items-center gap-1.5"><TypingDots /> <b className="font-semibold">{firstName}</b> sedang mengetik…</span>
                  <button
                    type="button"
                    onClick={() => setShown(bubbles.length)}
                    className="bg-transparent border-none p-0 cursor-pointer text-[11px] font-medium text-ld-violet hover:underline"
                  >
                    Tampilkan semua
                  </button>
                </>
              ) : (
                <span className="text-ld-fog">Brief ini tetap bisa dibaca lagi di halaman.</span>
              )}
            </div>
          </div>
        </section>
      </motion.div>
    </motion.div>
  );
};

export default PhaseIntroModal;
