import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Star, X } from 'lucide-react';
import { FeedbackIcon } from '../../components/illustration/ProductIcons';
import type { FeedbackAnswers, FeedbackAnswerValue, FeedbackFlowPublic, FeedbackQuestionPublic } from '../../types/feedback';
import { isAnswered } from '../../lib/feedbackValidation';
import { DIALOG_BODY, DIALOG_FOOTER, DIALOG_HEADER } from '../../lib/dialogLayout';
import Checkbox from '../../components/common/Checkbox';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import TrophyIllustration from '../qa-simulator/components/TrophyIllustration';
import PartyPopperIllustration from '../qa-simulator/components/PartyPopperIllustration';
import SubmittedIllustration from '../qa-simulator/components/SubmittedIllustration';

type FlowQuestion = FeedbackFlowPublic['questions'][number];

interface Props {
  flow: FeedbackFlowPublic;
  /** e.g. "Junior QA Ready · Modul 1: Requirement" */
  contextLabel: string;
  /** Heading on the intro screen, e.g. "Modul 1 selesai!" */
  introTitle: string;
  /** Picks the intro illustration: trophy after the course, party popper after a module. */
  introVariant?: 'start' | 'module' | 'course';
  initialAnswers: FeedbackAnswers;
  /** Reopened from the outline: go straight to the questions. */
  skipIntro?: boolean;
  onAnswersChange: (answers: FeedbackAnswers) => void;
  /** Resolves to an error message, or null when saved. */
  /** `durationMs`: time the tab was visible from the first question to Kirim. */
  onSubmit: (answers: FeedbackAnswers, durationMs: number) => Promise<string | null>;
  /** "Nanti saja", the close button, Esc, or a click outside. */
  onSnooze: () => void;
  onDontAsk: () => void;
  /** After the thank-you screen. */
  onDone: () => void;
  /** Admin preview: shows a "Mode pratinjau" tag. The caller passes no-op callbacks. */
  previewMode?: boolean;
}

/**
 * 1-5 stars. Hovering (or focusing) star N previews 1..N in Honey with a
 * short colour fade; leaving falls back to the saved rating.
 */
const RatingStars: React.FC<{ rating: number; labelledBy: string; onPick: (n: number) => void }> = ({ rating, labelledBy, onPick }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || rating;
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="mt-6 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= shown;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} bintang`}
            onClick={() => onPick(n)}
            onMouseEnter={() => setHover(n)}
            onFocus={() => setHover(n)}
            onBlur={() => setHover(0)}
            className="group w-[52px] h-[52px] flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer focus-visible:outline-2 focus-visible:outline-ld-honey"
          >
            <Star
              size={36}
              strokeWidth={1.5}
              style={{ transitionDelay: hover && on ? `${(n - 1) * 30}ms` : '0ms' }}
              className={`transition-[color,fill,transform] duration-200 ease-out motion-reduce:transition-none group-hover:scale-115 group-active:scale-95 ${
                on ? 'fill-ld-honey text-ld-honey' : 'fill-transparent text-ld-fog'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

/**
 * Stopwatch that only runs while the tab is visible (a learner who switches
 * tabs mid-form is not "filling"). Starts the first time `active` is true;
 * returns a reader for the elapsed ms.
 */
function useVisibleStopwatch(active: boolean) {
  const acc = useRef(0);
  const since = useRef<number | null>(null);
  const started = useRef(false);
  useEffect(() => {
    const onVis = () => {
      if (!started.current) return;
      if (document.hidden && since.current !== null) { acc.current += performance.now() - since.current; since.current = null; }
      else if (!document.hidden && since.current === null) since.current = performance.now();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;
    if (!document.hidden) since.current = performance.now();
  }, [active]);
  return () => Math.round(acc.current + (since.current === null ? 0 : performance.now() - since.current));
}

type Step = { kind: 'intro' } | { kind: 'screen'; i: number } | { kind: 'done' };

const AUTO_ADVANCE: ReadonlySet<FeedbackQuestionPublic['type']> = new Set(['scale', 'single_choice', 'rating']);

/**
 * One screen per question; the consent checkbox rides along on the last
 * screen (it is about the review written there).
 */
function toScreens(questions: FlowQuestion[]): FlowQuestion[][] {
  const screens: FlowQuestion[][] = [];
  for (const q of questions) {
    if (q.type === 'consent' && screens.length > 0) screens[screens.length - 1].push(q);
    else screens.push([q]);
  }
  return screens;
}

const btnPrimary = 'inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
const btnGhost = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-transparent hover:bg-ld-cloud text-sm font-medium text-ld-slate border-none cursor-pointer';

const QuestionInput: React.FC<{
  q: FlowQuestion;
  value: FeedbackAnswerValue | undefined;
  onChange: (value: FeedbackAnswerValue | undefined, auto?: boolean) => void;
  showPrompt: boolean;
}> = ({ q, value, onChange, showPrompt }) => {
  const options = q.config.options ?? [];
  const promptId = `fb-q-${q.id}`;
  const prompt = showPrompt && q.type !== 'consent' && (
    <>
      <p id={promptId} className="m-0 mt-3 text-xl sm:text-[22px] font-semibold text-ld-onyx leading-snug">{q.prompt}</p>
      {q.helpText && <p className="m-0 mt-1.5 text-sm text-ld-slate">{q.helpText}</p>}
    </>
  );

  switch (q.type) {
    case 'scale':
    case 'single_choice':
      return (
        <>
          {prompt}
          <div role="radiogroup" aria-labelledby={promptId} className="mt-5 flex flex-col gap-2">
            {options.map((o) => {
              const on = value === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange(o.id, true)}
                  className={`text-left px-4 py-3 min-h-[52px] rounded-lg border-2 cursor-pointer transition-colors ${
                    on ? 'border-ld-violet bg-ld-lilac' : 'border-ld-frost bg-white hover:border-ld-lavender'
                  }`}
                >
                  <span className="block text-sm font-semibold text-ld-onyx">{o.label}</span>
                  {o.description && <span className="block mt-0.5 text-[13px] text-ld-slate">{o.description}</span>}
                </button>
              );
            })}
          </div>
        </>
      );
    case 'multi_choice': {
      const picked = Array.isArray(value) ? value : [];
      const max = q.config.maxSelect ?? options.length;
      return (
        <>
          {prompt}
          <p className="m-0 mt-1.5 text-[13px] text-ld-slate">Pilih maksimal {max}.</p>
          <div className="mt-5 flex flex-wrap gap-2" role="group" aria-labelledby={promptId}>
            {options.map((o) => {
              const on = picked.includes(o.id);
              const blocked = !on && picked.length >= max;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={on}
                  disabled={blocked}
                  onClick={() => {
                    const next = on ? picked.filter((x) => x !== o.id) : [...picked, o.id];
                    onChange(next.length ? next : undefined);
                  }}
                  className={`min-h-[44px] px-4 rounded-full border-2 text-sm cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    on ? 'border-ld-violet bg-ld-lilac text-ld-onyx font-semibold' : 'border-ld-frost bg-white text-ld-graphite hover:border-ld-lavender'
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </>
      );
    }
    case 'text': {
      const text = typeof value === 'string' ? value : '';
      const max = q.config.maxLength ?? 500;
      const common = {
        id: `fb-in-${q.id}`,
        value: text,
        maxLength: max,
        placeholder: q.config.placeholder,
        'aria-labelledby': promptId,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value || undefined),
        className: 'w-full mt-5 px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx leading-relaxed focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac',
      };
      return (
        <>
          {prompt}
          {q.config.multiline ? <textarea rows={4} {...common} className={`${common.className} resize-y`} /> : <input type="text" {...common} />}
          <p className="m-0 mt-1 text-right text-xs text-ld-steel tabular-nums">{text.length} / {max}</p>
        </>
      );
    }
    case 'rating': {
      const rating = typeof value === 'number' ? value : 0;
      return (
        <>
          {prompt}
          <RatingStars rating={rating} labelledBy={promptId} onPick={(n) => onChange(n, true)} />
          {(q.config.lowLabel || q.config.highLabel) && (
            <div className="mx-auto mt-1.5 w-[280px] flex justify-between text-xs text-ld-steel">
              <span>{q.config.lowLabel}</span><span>{q.config.highLabel}</span>
            </div>
          )}
        </>
      );
    }
    case 'consent':
      return (
        <Checkbox checked={value === true} onChange={(c) => onChange(c)} boxed className="mt-3">
          {q.prompt}
        </Checkbox>
      );
  }
};

/**
 * Feedback checkpoint popup: intro, one question per screen (same pattern
 * as the simulator's SelfAssessmentModal), then a thank-you screen.
 * Full screen on phones, a 512px modal from sm up.
 */
const FeedbackCheckpointModal: React.FC<Props> = ({
  flow, contextLabel, introTitle, introVariant = 'start', initialAnswers, skipIntro, onAnswersChange, onSubmit, onSnooze, onDontAsk, onDone, previewMode,
}) => {
  const screens = useMemo(() => toScreens(flow.questions), [flow.questions]);
  const [step, setStep] = useState<Step>(skipIntro ? { kind: 'screen', i: 0 } : { kind: 'intro' });
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<FeedbackAnswers>(initialAnswers);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const questionCount = flow.questions.filter((q) => q.type !== 'consent').length;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Fill time starts at the first question, not the intro screen.
  const readFillTime = useVisibleStopwatch(step.kind === 'screen');

  const go = (next: Step, direction = 1) => {
    window.clearTimeout(timer.current);
    setDir(direction);
    setError(null);
    setStep(next);
  };

  const screen = step.kind === 'screen' ? screens[step.i] : null;
  const isLast = step.kind === 'screen' && step.i === screens.length - 1;
  const screenReady = screen ? screen.every((q) => !q.required || isAnswered(q, answers[q.id])) : true;
  const screenOptional = screen ? screen.every((q) => !q.required) : false;

  const submit = async () => {
    setSending(true);
    setError(null);
    const message = await onSubmit(answers, readFillTime());
    setSending(false);
    if (message) setError(message);
    else go({ kind: 'done' });
  };

  const next = () => {
    if (step.kind !== 'screen') return;
    if (isLast) void submit();
    else go({ kind: 'screen', i: step.i + 1 });
  };

  const setAnswer = (q: FlowQuestion, value: FeedbackAnswerValue | undefined, auto?: boolean) => {
    const nextAnswers = { ...answers };
    if (value === undefined) delete nextAnswers[q.id];
    else nextAnswers[q.id] = value;
    setAnswers(nextAnswers);
    onAnswersChange(nextAnswers);
    // Single-question screens of a pick-one type move on by themselves.
    if (auto && step.kind === 'screen' && !isLast && screen?.length === 1 && AUTO_ADVANCE.has(q.type)) {
      const at = step.i;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => go({ kind: 'screen', i: at + 1 }), 320);
    }
  };

  // Keyboard: Esc = Nanti saja, ← = Sebelumnya. Latest state via ref.
  const keyHandler = useRef<(e: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    keyHandler.current = (e) => {
      if (e.key === 'Escape') { if (step.kind === 'done') onDone(); else onSnooze(); return; }
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT';
      if (e.key === 'ArrowLeft' && !typing && step.kind === 'screen' && step.i > 0) go({ kind: 'screen', i: step.i - 1 }, -1);
    };
  });
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => keyHandler.current(e);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, []);

  const dialogRef = useFocusTrap<HTMLDivElement>();

  const stepKey = step.kind === 'screen' ? `s${step.i}` : step.kind;
  const firstQuestionNumber = (i: number) => screens.slice(0, i).reduce((n, s) => n + s.filter((q) => q.type !== 'consent').length, 0) + 1;

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ld-onyx/50 backdrop-blur-sm sm:p-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) { if (step.kind === 'done') onDone(); else onSnooze(); } }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={flow.title}
        className="w-full sm:max-w-lg h-dvh sm:h-auto sm:max-h-[92vh] flex flex-col outline-none bg-white sm:rounded-lg pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 overflow-hidden shadow-2xl"
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        <div className={`${DIALOG_HEADER} flex items-center gap-3 px-5 py-3.5 border-b border-ld-frost`}>
          <FeedbackIcon size={32} className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="m-0 flex items-center gap-2 text-sm font-semibold text-ld-onyx min-w-0">
              <span className="truncate">{flow.title}</span>
              {previewMode && <span className="shrink-0 px-2 py-0.5 rounded-full bg-ld-cream border border-ld-butter text-[10px] font-semibold uppercase tracking-wider text-ld-honey-deep">Mode pratinjau</span>}
            </p>
            <p className="m-0 text-[11px] text-ld-steel truncate">{contextLabel}</p>
          </div>
          <button
            type="button"
            onClick={step.kind === 'done' ? onDone : onSnooze}
            aria-label={step.kind === 'done' ? 'Tutup' : 'Tutup, isi nanti'}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {step.kind === 'screen' && (
          <div className={`${DIALOG_HEADER} flex gap-1 px-5 pt-3`} aria-hidden="true">
            {screens.map((s, i) => {
              const done = s.every((q) => !q.required || isAnswered(q, answers[q.id])) && s.some((q) => isAnswered(q, answers[q.id]));
              return <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i === step.i ? 'bg-ld-violet' : done ? 'bg-ld-lavender' : 'bg-ld-frost'}`} />;
            })}
          </div>
        )}

        <div className={`${DIALOG_BODY} overflow-x-hidden`}>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={stepKey}
              custom={dir}
              initial={{ opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.18 }}
            >
              {step.kind === 'intro' && (
                <div className="px-6 py-9 text-center">
                  {introVariant === 'course' ? (
                    <TrophyIllustration className="mx-auto w-36 h-auto -mt-2" />
                  ) : introVariant === 'module' ? (
                    <PartyPopperIllustration className="mx-auto w-36 h-auto -mt-2" />
                  ) : (
                    <FeedbackIcon size={72} className="mx-auto block" />
                  )}
                  <h3 className="m-0 mt-4 text-2xl font-semibold text-ld-onyx">{introTitle}</h3>
                  <p className="m-0 mt-2 text-sm text-ld-slate max-w-sm mx-auto leading-relaxed">
                    {flow.intro ?? <>Bantu kami memperbaiki materi. Ada <strong className="text-ld-graphite">{questionCount} pertanyaan singkat</strong>, sekitar 1 menit.</>}
                  </p>
                  <p className="m-0 mt-3 text-xs text-ld-steel">Jawabanmu bisa diubah lagi dari outline course.</p>
                </div>
              )}

              {screen && step.kind === 'screen' && (
                <div className="px-6 py-7">
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">
                    Pertanyaan {firstQuestionNumber(step.i)} dari {questionCount}{screenOptional ? ' · opsional' : ''}
                  </p>
                  {screen.map((q) => (
                    <QuestionInput key={q.id} q={q} value={answers[q.id]} onChange={(v, auto) => setAnswer(q, v, auto)} showPrompt />
                  ))}
                  {error && (
                    <p role="alert" className="m-0 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
                      {error} Jawabanmu masih tersimpan.
                    </p>
                  )}
                </div>
              )}

              {step.kind === 'done' && (
                <div role="status" className="px-6 py-10 text-center">
                  <SubmittedIllustration className="mx-auto w-52 h-auto -mt-2 -mb-2" />
                  <h3 className="m-0 mt-2 text-2xl font-semibold text-ld-onyx">Terima kasih!</h3>
                  <p className="m-0 mt-2 text-sm text-ld-slate max-w-xs mx-auto">Feedback-mu terkirim dan membantu kami memperbaiki materi.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={`${DIALOG_FOOTER} px-5 py-3.5 border-t border-ld-frost bg-ld-cloud/50 flex items-center justify-between gap-3`}>
          {step.kind === 'intro' && (
            <>
              <div className="flex items-center gap-1">
                <button type="button" onClick={onSnooze} className={btnGhost}>Nanti saja</button>
                <button type="button" onClick={onDontAsk} className="px-2 py-2 bg-transparent border-none text-xs text-ld-steel underline underline-offset-2 cursor-pointer hover:text-ld-graphite">Jangan tanya lagi</button>
              </div>
              <button type="button" autoFocus onClick={() => go({ kind: 'screen', i: 0 })} className={btnPrimary}>Mulai</button>
            </>
          )}
          {step.kind === 'screen' && (
            <>
              <button
                type="button"
                disabled={step.i === 0 || sending}
                onClick={() => go({ kind: 'screen', i: step.i - 1 }, -1)}
                className={`${btnGhost} disabled:opacity-0`}
              >
                <ArrowLeft size={15} /> Sebelumnya
              </button>
              <div className="flex items-center gap-1.5">
                {screenOptional && !isLast && <button type="button" onClick={next} className={btnGhost}>Lewati</button>}
                <button type="button" onClick={next} disabled={!screenReady || sending} className={btnPrimary}>
                  {isLast ? (sending ? 'Mengirim…' : error ? 'Coba kirim lagi' : 'Kirim feedback') : 'Lanjut'}
                </button>
              </div>
            </>
          )}
          {step.kind === 'done' && (
            <>
              <span />
              <button type="button" autoFocus onClick={onDone} className={btnPrimary}>Lanjut belajar</button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackCheckpointModal;
