import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, Check, ClipboardCheck, KeyRound, Sparkles, X } from 'lucide-react';
import type { SimulatorAssignment } from '../../../types/qaSimulator';
import { rubricScore } from '../lib/progress';
import SubmittedIllustration from './SubmittedIllustration';
import { DIALOG_BODY, DIALOG_FOOTER, DIALOG_HEADER } from '../../../lib/dialogLayout';

export type AssessmentStep = { kind: 'intro' } | { kind: 'rubric'; i: number } | { kind: 'result' } | { kind: 'key' };

interface SelfAssessmentModalProps {
  assignment: SimulatorAssignment;
  checkedRubric: string[];
  /** Previous assessment exists — seed "Belum" answers for unchecked items. */
  previouslyAssessed: boolean;
  initialStep: AssessmentStep;
  onSetRubric: (id: string, met: boolean) => void;
  onAssessed: () => void;
  onClose: () => void;
}

const stepKey = (s: AssessmentStep) => (s.kind === 'rubric' ? `rubric-${s.i}` : s.kind);

const ScoreRing: React.FC<{ percent: number }> = ({ percent }) => {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => `${Math.round(v)}`);
  const dash = useTransform(mv, (v) => `${(v / 100) * 289} 289`);
  useEffect(() => {
    const controls = animate(mv, percent, { duration: 1.1, ease: 'easeOut', delay: 0.15 });
    return () => controls.stop();
  }, [mv, percent]);
  const color = percent >= 80 ? '#10b981' : percent >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#eceff3" strokeWidth="8" />
        <motion.circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" style={{ strokeDasharray: dash }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-baseline font-semibold text-ld-onyx tabular-nums leading-none">
          <motion.span className="text-2xl">{rounded}</motion.span>
          <span className="text-sm ml-0.5 text-ld-slate">%</span>
        </span>
      </span>
    </div>
  );
};

const verdict = (pct: number) =>
  pct >= 80
    ? { title: 'Mantap! 🔥', body: 'Hasilmu sudah setara standar QA di tim. Cek kunci jawaban untuk insight tambahan.' }
    : pct >= 50
      ? { title: 'Lumayan, tinggal dipoles 💪', body: 'Fondasinya sudah ada. Fokus ke kriteria yang belum terpenuhi di bawah.' }
      : { title: 'Masih banyak ruang belajar 🌱', body: 'Wajar di awal. Bandingkan dengan kunci jawaban, lalu coba revisi jawabanmu.' };

// Interactive self-assessment: opens right after submit and walks the learner
// through each rubric criterion one at a time, then reveals the score and the
// answer key. Every answer is saved immediately, so closing midway is safe.
const SelfAssessmentModal: React.FC<SelfAssessmentModalProps> = ({
  assignment, checkedRubric, previouslyAssessed, initialStep, onSetRubric, onAssessed, onClose,
}) => {
  const rubric = assignment.rubric;
  const [step, setStep] = useState<AssessmentStep>(initialStep);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => {
    const seed: Record<string, boolean> = {};
    for (const r of rubric) {
      if (checkedRubric.includes(r.id)) seed[r.id] = true;
      else if (previouslyAssessed) seed[r.id] = false;
    }
    return seed;
  });
  const advanceTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const go = (next: AssessmentStep, direction = 1) => {
    window.clearTimeout(advanceTimer.current);
    setDir(direction);
    if (next.kind === 'result') onAssessed();
    setStep(next);
  };

  const answer = (id: string, met: boolean, i: number) => {
    setAnswers((a) => ({ ...a, [id]: met }));
    onSetRubric(id, met);
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => go(i + 1 < rubric.length ? { kind: 'rubric', i: i + 1 } : { kind: 'result' }), 320);
  };

  // Keyboard: Y/N answer, ← back, Esc close. Read latest state through a ref.
  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (step.kind !== 'rubric') return;
      const r = rubric[step.i];
      if (e.key === 'y' || e.key === 'Y') answer(r.id, true, step.i);
      else if (e.key === 'n' || e.key === 'N') answer(r.id, false, step.i);
      else if (e.key === 'ArrowLeft' && step.i > 0) go({ kind: 'rubric', i: step.i - 1 }, -1);
    };
  });
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, []);

  const score = rubricScore(assignment, rubric.filter((r) => answers[r.id]).map((r) => r.id));
  const unmet = rubric.filter((r) => !answers[r.id]);
  const answeredCount = rubric.filter((r) => r.id in answers).length;

  const body = (() => {
    switch (step.kind) {
      case 'intro':
        return (
          <div className="px-6 py-8 text-center">
            <SubmittedIllustration className="mx-auto w-52 h-auto -mt-2 -mb-2" />
            <h3 className="m-0 mt-2 text-2xl font-semibold text-ld-onyx">Tugas terkirim!</h3>
            <p className="m-0 mt-2 text-sm text-ld-slate max-w-sm mx-auto">
              Sekarang nilai hasilmu sendiri, seperti self-review sebelum kirim ke lead. Ada <strong>{rubric.length} kriteria</strong>, cukup jawab
              <em> terpenuhi</em> atau <em>belum</em>.
            </p>
            <p className="m-0 mt-3 text-xs text-ld-fog">Jujur ke diri sendiri, ya. Skor ini cuma untuk kamu.</p>
          </div>
        );
      case 'rubric': {
        const r = rubric[step.i];
        const current = answers[r.id];
        return (
          <div className="px-6 py-7">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">Kriteria {step.i + 1} dari {rubric.length}</p>
            <p className="m-0 mt-3 text-xl sm:text-2xl font-semibold text-ld-onyx leading-snug min-h-[64px]">{r.label}</p>
            <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-ld-cloud text-[11px] font-semibold text-ld-slate">{r.weight} poin</span>
            <p className="m-0 mt-6 text-sm text-ld-slate">Apakah jawabanmu memenuhi kriteria ini?</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => answer(r.id, false, step.i)}
                aria-keyshortcuts="N"
                className={`flex flex-col items-center gap-1.5 px-4 py-5 rounded-lg border-2 cursor-pointer transition-all ${
                  current === false ? 'border-red-400 bg-red-50 text-red-600' : 'border-ld-frost bg-white text-ld-graphite hover:border-red-200 hover:bg-red-50/40'
                }`}
              >
                <X size={22} />
                <span className="text-sm font-semibold">Belum</span>
              </button>
              <button
                type="button"
                onClick={() => answer(r.id, true, step.i)}
                aria-keyshortcuts="Y"
                className={`flex flex-col items-center gap-1.5 px-4 py-5 rounded-lg border-2 cursor-pointer transition-all ${
                  current === true ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-ld-frost bg-white text-ld-graphite hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <Check size={22} />
                <span className="text-sm font-semibold">Terpenuhi</span>
              </button>
            </div>
          </div>
        );
      }
      case 'result': {
        const v = verdict(score.percent);
        return (
          <div className="px-6 py-7">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <ScoreRing percent={score.percent} />
              <div>
                <h3 className="m-0 text-xl font-semibold text-ld-onyx">{v.title}</h3>
                <p className="m-0 mt-1 text-sm text-ld-slate">{v.body}</p>
                <p className="m-0 mt-2 text-xs text-ld-fog tabular-nums">{score.score} / {score.max} poin</p>
              </div>
            </div>
            {unmet.length > 0 ? (
              <div className="mt-6">
                <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-widest text-ld-fog">Yang bisa ditingkatkan</p>
                <ul className="m-0 p-0 list-none space-y-1.5">
                  {unmet.map((r, idx) => (
                    <motion.li
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.08 }}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 text-sm text-amber-800"
                    >
                      <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      <span className="flex-1">{r.label}</span>
                      <button
                        type="button"
                        onClick={() => go({ kind: 'rubric', i: rubric.indexOf(r) }, -1)}
                        className="text-[11px] font-medium text-amber-700 underline bg-transparent border-none cursor-pointer shrink-0 p-0"
                      >
                        ubah
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="m-0 mt-6 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-sm text-emerald-700"
              >
                <Sparkles size={15} /> Semua kriteria terpenuhi.
              </motion.p>
            )}
          </div>
        );
      }
      case 'key': {
        const key = assignment.answerKey;
        return (
          <div className="px-6 py-6 space-y-2">
            {key?.intro && <p className="m-0 mb-3 text-sm text-ld-slate">{key.intro}</p>}
            {key?.items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                className="rounded-lg bg-white border border-ld-frost px-3.5 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {item.tag && <span className="px-1.5 py-0.5 rounded-md bg-ld-cloud text-[10px] font-semibold text-ld-slate uppercase tracking-wide">{item.tag}</span>}
                  <p className="m-0 text-sm font-medium text-ld-onyx">{item.title}</p>
                </div>
                <p className="m-0 mt-1 text-xs text-ld-slate leading-relaxed">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        );
      }
    }
  })();

  const headerTitle =
    step.kind === 'key' ? `Kunci jawaban (${assignment.answerKey?.items.length ?? 0})` : step.kind === 'result' ? 'Hasil self-assessment' : 'Self-assessment';

  const btnPrimary = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer transition-colors';
  const btnGhost = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-transparent hover:bg-ld-cloud text-sm font-medium text-ld-slate border-none cursor-pointer';

  const footer = (() => {
    switch (step.kind) {
      case 'intro':
        return (
          <>
            <button type="button" onClick={onClose} className={btnGhost}>Nanti saja</button>
            <button type="button" onClick={() => go({ kind: 'rubric', i: 0 })} className={btnPrimary}>Mulai self-assessment</button>
          </>
        );
      case 'rubric':
        return (
          <>
            <button
              type="button"
              disabled={step.i === 0}
              onClick={() => go({ kind: 'rubric', i: step.i - 1 }, -1)}
              className={`${btnGhost} disabled:opacity-0`}
            >
              <ArrowLeft size={15} /> Sebelumnya
            </button>
            {answeredCount === rubric.length ? (
              <button type="button" onClick={() => go({ kind: 'result' })} className={btnPrimary}>Lihat hasil</button>
            ) : (
              <span className="text-xs text-ld-fog">{answeredCount}/{rubric.length} dijawab</span>
            )}
          </>
        );
      case 'result':
        return (
          <>
            {assignment.answerKey ? (
              <button type="button" onClick={() => go({ kind: 'key' })} className={btnGhost}>
                <KeyRound size={15} className="text-amber-500" /> Lihat kunci jawaban
              </button>
            ) : <span />}
            <button type="button" onClick={onClose} className={btnPrimary}>Selesai</button>
          </>
        );
      case 'key':
        return (
          <>
            <button type="button" onClick={() => go({ kind: 'result' }, -1)} className={btnGhost}><ArrowLeft size={15} /> Hasil</button>
            <button type="button" onClick={onClose} className={btnPrimary}>Selesai</button>
          </>
        );
    }
  })();

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ld-onyx/50 backdrop-blur-sm sm:p-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={headerTitle}
        className="w-full sm:max-w-lg h-dvh sm:h-auto sm:max-h-[92vh] flex flex-col bg-white sm:rounded-lg pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 overflow-hidden shadow-2xl"
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        <div className={`${DIALOG_HEADER} flex items-center gap-3 px-5 py-3.5 border-b border-ld-frost`}>
          <ClipboardCheck size={17} className="text-ld-violet shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-sm font-semibold text-ld-onyx truncate">{headerTitle}</p>
            <p className="m-0 text-[11px] text-ld-fog truncate">{assignment.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {step.kind === 'rubric' && (
          <div className={`${DIALOG_HEADER} flex gap-1 px-5 pt-3`} aria-hidden="true">
            {rubric.map((r, i) => (
              <span
                key={r.id}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i === step.i ? 'bg-ld-violet' : answers[r.id] === true ? 'bg-emerald-400' : answers[r.id] === false ? 'bg-red-300' : 'bg-ld-frost'
                }`}
              />
            ))}
          </div>
        )}

        <div className={`${DIALOG_BODY} overflow-x-hidden`}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={stepKey(step)}
              custom={dir}
              initial={{ opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.18 }}
            >
              {body}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={`${DIALOG_FOOTER} px-5 py-3.5 border-t border-ld-frost bg-ld-cloud/50 flex items-center justify-between gap-3`}>{footer}</div>
      </motion.div>
    </motion.div>
  );
};

export default SelfAssessmentModal;
