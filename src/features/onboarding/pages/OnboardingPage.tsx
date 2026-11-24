import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight, CircleCheck, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { useSnackbarStore } from '../../../store/useSnackbarStore';
import { ApiError, UnauthorizedError, apiSkipOnboarding, apiSubmitOnboarding } from '../../../lib/adminApi';
import { track } from '../../../lib/analytics';
import GoogleSignInButton from '../../../components/common/GoogleSignInButton';
import { armClaim, clearParkedClaim, hasPendingClaim, parkClaim, readParkedClaim, useOnboardingClaimStore } from '../claimStore';
import {
  QUESTION_IDS,
  emptyAnswers,
  isAnswersComplete,
  programHref,
  safeInternalPath,
  scoreOnboarding,
} from '../../../lib/onboarding';
import type {
  OnboardingAnswers,
  OnboardingQuestion,
  OnboardingRecommendation,
  ProgramCatalogEntry,
  ProgramId,
} from '../../../types/onboarding';
import { useOnboardingConfig } from '../hooks/useOnboardingConfig';
import ProgramIcon from '../components/ProgramIcon';
import PriceBadge from '../components/PriceBadge';

type Step = 'welcome' | OnboardingQuestion['id'] | 'calc' | 'result';

const AUTO_ADVANCE_MS = 240;
const MIN_CALC_MS = 900;

interface Draft { step: Step; answers: OnboardingAnswers }

const RESUMABLE_STEPS: Step[] = ['welcome', ...QUESTION_IDS];

/** Draft owner: the user id, or 'guest' before login (PRD Onboarding Guest G2).
 *  The guest draft lives in sessionStorage (this tab only), so another guest
 *  on a shared device never resumes it. */
function draftKey(userId: string) { return `onboarding-draft:${userId}`; }
const GUEST = 'guest';
const draftStore = (userId: string) => (userId === GUEST ? sessionStorage : localStorage);

function readDraft(userId: string): Draft | null {
  try {
    const raw = draftStore(userId).getItem(draftKey(userId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<Draft> | null;
    // Only resume into a screen that exists (never the transient calc/result
    // screens, nor a step id from an older build), else the page renders blank.
    if (!draft || !RESUMABLE_STEPS.includes(draft.step as Step)) return null;
    if (typeof draft.answers !== 'object' || draft.answers === null) return null;
    const answers = emptyAnswers();
    for (const id of QUESTION_IDS) {
      const value = (draft.answers as Partial<OnboardingAnswers>)[id];
      if (Array.isArray(value)) answers[id] = value.filter((v): v is string => typeof v === 'string');
    }
    return { step: draft.step as Step, answers };
  } catch {
    return null;
  }
}

function writeDraft(userId: string, draft: Draft | null) {
  try {
    if (draft) draftStore(userId).setItem(draftKey(userId), JSON.stringify(draft));
    else draftStore(userId).removeItem(draftKey(userId));
  } catch { /* storage unavailable — draft is a convenience only */ }
}

const OnboardingPage: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const user = useAdminAuthStore((s) => s.user);
  const setOnboardingStatus = useAdminAuthStore((s) => s.setOnboardingStatus);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeInternalPath(searchParams.get('next'));
  const config = useOnboardingConfig();
  // Back from a redirect login (in-app browsers) with armed guest answers:
  // show that result (being claimed, or already claimed by the sync) instead
  // of starting over.
  const [initialResult] = useState<{ answers: OnboardingAnswers; serverRec: OnboardingRecommendation | null } | null>(() => {
    if (!user) return null;
    const { claimed } = useOnboardingClaimStore.getState();
    if (claimed) return { answers: claimed.answers, serverRec: claimed.recommendation };
    const parked = hasPendingClaim() ? readParkedClaim() : null;
    return parked ? { answers: parked.answers, serverRec: null } : null;
  });
  const [initialDraft] = useState(() => (initialResult ? null : readDraft(user?.id ?? GUEST)));
  const [step, setStep] = useState<Step>(initialResult ? 'result' : initialDraft?.step ?? 'welcome');
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialResult?.answers ?? initialDraft?.answers ?? emptyAnswers());
  const [recommendation, setRecommendation] = useState<OnboardingRecommendation | null>(null);
  /** The shown result came from the guest flow, so it offers the claim card. */
  const [guestResult, setGuestResult] = useState(initialResult !== null);
  /** The server's recommendation once the guest answers were claimed. */
  const [serverRec, setServerRec] = useState<OnboardingRecommendation | null>(initialResult?.serverRec ?? null);

  // A guest result is scored with the live config (the remote one replaces
  // the bundled default after load) until the claim returns the server's.
  const shownRec = guestResult ? serverRec ?? scoreOnboarding(answers, config) : recommendation;

  // Take the claim result: one already finished before this page mounted, and
  // any that finishes while it is open.
  useEffect(() => {
    const apply = () => {
      const taken = useOnboardingClaimStore.getState().takeClaimed();
      if (taken) setServerRec(taken.recommendation);
    };
    apply();
    return useOnboardingClaimStore.subscribe((s) => { if (s.claimed) apply(); });
  }, []);
  const [showAll, setShowAll] = useState(false);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current); }, []);

  // Keyed on the id (not the user object): setOnboardingStatus replaces the
  // object, which would otherwise re-save a draft right after skip clears it.
  const userId = user?.id ?? GUEST;
  useEffect(() => {
    if (step === 'calc' || step === 'result') return;
    writeDraft(userId, { step, answers });
  }, [userId, step, answers]);
  // Logged in mid-flow: the answers carry over in state (saved under the
  // account above), so drop the tab's guest copy.
  useEffect(() => { if (userId !== GUEST) writeDraft(GUEST, null); }, [userId]);

  const catalog = useMemo(() => new Map<ProgramId, ProgramCatalogEntry>(config.catalog.map((c) => [c.id, c])), [config.catalog]);
  const qIndex = QUESTION_IDS.indexOf(step as OnboardingQuestion['id']);
  const question = qIndex >= 0 ? config.questions[qIndex] : null;

  const submit = useCallback(async (final: OnboardingAnswers) => {
    setStep('calc');
    const started = Date.now();
    const finish = async (rec: OnboardingRecommendation, guest: boolean) => {
      const wait = MIN_CALC_MS - (Date.now() - started);
      if (wait > 0) await new Promise((r) => window.setTimeout(r, wait));
      track('onboarding_completed', { guest, primary: rec.primary.id });
      setRecommendation(rec);
      setServerRec(null);
      setGuestResult(guest);
      setShowAll(false);
      setStep('result');
    };

    if (!token || !user) {
      // Guest (PRD G4/S1): score locally, park the answers for the claim.
      const rec = scoreOnboarding(final, config);
      parkClaim(final, config.version);
      writeDraft(GUEST, null);
      await finish(rec, true);
      return;
    }

    let rec: OnboardingRecommendation;
    try {
      const { result } = await apiSubmitOnboarding(final, token);
      rec = result.recommendation;
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        // Session expired: nothing was saved. Keep the draft (it already holds
        // these answers) and come back here after logging in again.
        showSnackbar('Sesi kamu habis. Login lagi untuk menyimpan hasilnya.', 'error');
        const returnTo = next ? `/onboarding?next=${encodeURIComponent(next)}` : '/onboarding';
        navigate(`/login?redirect=${encodeURIComponent(returnTo)}`, { replace: true });
        return;
      }
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        // Rejected answers, typically a draft made against an older config.
        // Showing a local result here would hide that nothing was stored.
        writeDraft(user.id, null);
        setAnswers(emptyAnswers());
        setStep('q1');
        showSnackbar('Pertanyaannya sudah diperbarui. Isi ulang sebentar ya.', 'info');
        return;
      }
      // PRD edge case (network down / server error / no /api in plain dev):
      // still show a result scored locally. The server keeps the user
      // 'pending', so onboarding comes back on the next login.
      rec = scoreOnboarding(final, config);
    }
    writeDraft(user.id, null);
    setOnboardingStatus('completed');
    await finish(rec, false);
  }, [token, user, config, next, navigate, showSnackbar, setOnboardingStatus]);

  const pick = (q: OnboardingQuestion, optionId: string) => {
    const current = answers[q.id];
    if (q.maxSelect > 1) {
      const selected = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : current.length < q.maxSelect ? [...current, optionId] : current;
      setAnswers({ ...answers, [q.id]: selected });
      return;
    }
    const nextAnswers = { ...answers, [q.id]: [optionId] };
    setAnswers(nextAnswers);
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      const nextQ = QUESTION_IDS[qIndex + 1];
      if (nextQ) setStep(nextQ);
      else if (isAnswersComplete(nextAnswers)) void submit(nextAnswers);
    }, AUTO_ADVANCE_MS);
  };

  const goNextFromMulti = () => {
    const nextQ = QUESTION_IDS[qIndex + 1];
    if (nextQ) setStep(nextQ);
    else if (isAnswersComplete(answers)) void submit(answers);
  };

  const back = () => {
    // A pending auto-advance from the option just picked must not fire after
    // going back (it would jump ahead, or submit from q4).
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
    if (qIndex <= 0) setStep('welcome');
    else setStep(QUESTION_IDS[qIndex - 1]);
  };

  const skip = async () => {
    if (!token || !user) {
      // Guest: nothing to record server-side (PRD G3); abandoning drops any
      // earlier unclaimed answers too.
      writeDraft(GUEST, null);
      clearParkedClaim();
      navigate(next ?? '/', { replace: true });
      return;
    }
    try {
      const { status } = await apiSkipOnboarding(token);
      setOnboardingStatus(status);
    } catch {
      // Offline/no API: stop the redirect loop for this session anyway.
      setOnboardingStatus('skipped');
    }
    writeDraft(user.id, null);
    showSnackbar('Oke! Kamu bisa mengisinya nanti dari dashboard.', 'info');
    navigate(next ?? '/dashboard', { replace: true });
  };

  const restart = () => {
    // Retaking replaces the unclaimed answers; they must not be claimed later.
    if (guestResult && !serverRec) clearParkedClaim();
    setAnswers(emptyAnswers());
    setRecommendation(null);
    setServerRec(null);
    setGuestResult(false);
    setStep('q1');
  };

  const inFlow = question !== null;

  return (
    <div className="min-h-screen bg-ld-canvas font-ld-sans text-ld-graphite flex flex-col">
      <header className="h-14 md:h-16 shrink-0 flex items-center justify-between px-5 md:px-10">
        {inFlow ? (
          <button
            type="button"
            onClick={back}
            aria-label="Kembali"
            className="-ml-3 w-11 h-11 flex items-center justify-center rounded-lg text-ld-graphite hover:bg-ld-cloud transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2 font-ld-display font-semibold text-[19px] tracking-[-0.02em] text-ld-onyx no-underline cursor-pointer">
            {/* Decorative: the wordmark next to it already names the link. */}
            <img
              src="/shared/img/mentor-logo-96.webp"
              alt=""
              width={28}
              height={28}
              loading="eager"
              decoding="async"
              className="w-7 h-7 object-contain"
            />
            <span>Mentor<span className="text-ld-violet">.QA</span></span>
          </Link>
        )}
        {inFlow && <span className="font-ld-mono text-[13px] text-ld-slate">{qIndex + 1} / {QUESTION_IDS.length}</span>}
        {inFlow ? (
          <button type="button" onClick={skip} className="h-11 px-1 text-sm font-medium text-ld-slate hover:text-ld-graphite transition-colors cursor-pointer">
            Lewati
          </button>
        ) : (
          <span className="w-11" aria-hidden="true" />
        )}
      </header>
      {inFlow && (
        <div className="h-[3px] bg-ld-frost" role="progressbar" aria-valuemin={0} aria-valuemax={4} aria-valuenow={qIndex + 1}>
          <div className="h-full bg-ld-violet transition-[width] duration-300" style={{ width: `${((qIndex + 1) / QUESTION_IDS.length) * 100}%` }} />
        </div>
      )}

      {step === 'welcome' && (
        <main className="flex-1 w-full max-w-[600px] mx-auto px-5 md:px-10 pb-16 flex flex-col items-center justify-center text-center gap-4">
          <PixelMark />
          <h1 className="m-0 font-ld-display font-semibold text-[30px] md:text-[44px] leading-[1.05] tracking-[-0.02em] text-ld-onyx">
            Temukan program QA yang cocok untukmu
          </h1>
          <p className="m-0 text-base leading-relaxed text-ld-slate">4 pertanyaan singkat, kurang dari 1 menit.</p>
          <div className="mt-4 w-full sm:w-[280px] flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setStep('q1')}
              className="w-full h-12 rounded-lg bg-ld-midnight text-white text-base font-medium hover:bg-ld-onyx transition-colors cursor-pointer"
            >
              Mulai
            </button>
            <button type="button" onClick={skip} className="h-11 px-2 text-[15px] font-medium text-ld-slate hover:text-ld-graphite transition-colors cursor-pointer">
              Nanti saja
            </button>
          </div>
        </main>
      )}

      {question && (
        <main className="flex-1 w-full max-w-[600px] mx-auto px-5 md:px-10 pt-6 md:pt-14 pb-12 flex flex-col gap-6 md:gap-7">
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-ld-display font-semibold text-[26px] md:text-[34px] leading-[1.12] tracking-[-0.02em] text-ld-onyx">
              {question.title}
            </h2>
            {question.maxSelect > 1 && <p className="m-0 text-sm text-ld-slate">Pilih maksimal {question.maxSelect}</p>}
          </div>
          <div role="group" aria-label={question.title} className="flex flex-col gap-2.5">
            {question.options.map((option) => {
              const selected = answers[question.id].includes(option.id);
              const multi = question.maxSelect > 1;
              const full = multi && answers[question.id].length >= question.maxSelect;
              const disabled = full && !selected;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => pick(question, option.id)}
                  className={`flex items-center gap-4 w-full min-h-[60px] px-5 rounded-xl text-left text-base font-medium text-ld-onyx border transition-all ${
                    selected
                      ? 'bg-[#f2f9ff] border-ld-violet shadow-[0_0_0_3px_rgba(59,158,255,0.18)]'
                      : 'bg-ld-canvas border-ld-ash hover:border-ld-steel'
                  } ${disabled ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="flex-1">{option.label}</span>
                  {multi ? (
                    <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${selected ? 'bg-ld-violet' : 'border-[1.5px] border-ld-fog'}`}>
                      {selected && <Check size={12} strokeWidth={3.5} className="text-white" />}
                    </span>
                  ) : (
                    <span className={`shrink-0 w-5 h-5 rounded-full box-border ${selected ? 'border-[6px] border-ld-violet' : 'border-[1.5px] border-ld-fog'}`} />
                  )}
                </button>
              );
            })}
          </div>
          {question.maxSelect > 1 && (
            <button
              type="button"
              onClick={goNextFromMulti}
              disabled={answers[question.id].length === 0}
              className="w-full h-12 rounded-lg text-white text-base font-medium transition-colors bg-ld-midnight hover:bg-ld-onyx cursor-pointer disabled:bg-ld-fog disabled:cursor-not-allowed"
            >
              Lanjut
            </button>
          )}
        </main>
      )}

      {step === 'calc' && (
        <main className="flex-1 flex flex-col items-center justify-center gap-4 pb-16 px-5 text-center" aria-live="polite">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-[3px] bg-ld-violet animate-pulse" />
            <span className="w-3 h-3 rounded-[3px] bg-ld-lavender animate-pulse [animation-delay:150ms]" />
            <span className="w-3 h-3 rounded-[3px] bg-ld-lilac animate-pulse [animation-delay:300ms]" />
          </div>
          <h2 className="m-0 font-ld-display font-semibold text-[26px] md:text-[34px] tracking-[-0.02em] text-ld-onyx">Menyusun rekomendasi…</h2>
        </main>
      )}

      {step === 'result' && shownRec && (
        <ResultView
          recommendation={shownRec}
          catalog={catalog}
          showAll={showAll}
          onToggleAll={() => setShowAll((v) => !v)}
          next={next}
          onRestart={restart}
          claimable={guestResult}
        />
      )}
    </div>
  );
};

const PixelMark: React.FC = () => (
  <div className="relative w-[76px] h-14" aria-hidden="true">
    {[
      [40, 0, 'bg-ld-lavender'], [60, 0, 'bg-ld-violet'],
      [20, 20, 'bg-ld-lilac'], [40, 20, 'bg-ld-violet'],
      [0, 40, 'bg-ld-lavender'], [20, 40, 'bg-ld-violet'], [60, 40, 'bg-ld-lilac'],
    ].map(([x, y, color]) => (
      <span key={`${x}-${y}`} className={`absolute w-4 h-4 rounded-[3px] ${color}`} style={{ left: x as number, top: y as number }} />
    ))}
  </div>
);

interface ResultViewProps {
  recommendation: OnboardingRecommendation;
  catalog: Map<ProgramId, ProgramCatalogEntry>;
  showAll: boolean;
  onToggleAll: () => void;
  next: string | null;
  onRestart: () => void;
  /** Result of the guest flow: show the claim card (login to save it). */
  claimable: boolean;
}

const ResultView: React.FC<ResultViewProps> = ({ recommendation, catalog, showAll, onToggleAll, next, onRestart, claimable }) => {
  const signedIn = useAdminAuthStore((s) => !!s.token);
  const isAdmin = useAdminAuthStore((s) => !!s.user?.roles.includes('admin'));
  // Guests have no dashboard yet: program CTAs go to the public landing page
  // (programHref's fallback), switching to the dashboard once they log in.
  const publicLinks = isAdmin || !signedIn;
  const primary = catalog.get(recommendation.primary.id);
  const listed = showAll ? [...recommendation.secondary, ...recommendation.others] : recommendation.secondary;
  if (!primary) return null;

  return (
    <main className="flex-1 w-full max-w-[600px] mx-auto px-5 md:px-10 pt-6 md:pt-14 pb-12 flex flex-col gap-6 md:gap-7">
      <h1 className="m-0 font-ld-display font-semibold text-[30px] md:text-[44px] leading-[1.05] tracking-[-0.02em] text-ld-onyx">
        Paling cocok untukmu
      </h1>

      <article className="rounded-xl bg-ld-canvas p-6 flex flex-col gap-4 shadow-ld-subtle-3">
        <div className="flex items-center gap-3.5">
          <ProgramIcon id={primary.id} size={44} className="shrink-0" />
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="font-ld-display text-[22px] font-semibold tracking-[-0.02em] text-ld-onyx">{primary.name}</span>
            <PriceBadge program={primary} />
          </div>
        </div>
        <p className="m-0 text-[15px] leading-relaxed text-ld-slate">{recommendation.primary.reason}</p>
        <Link
          to={programHref(primary, 'onboarding', publicLinks)}
          className="flex items-center justify-center gap-2.5 h-12 rounded-lg bg-ld-midnight text-white text-base font-medium no-underline hover:bg-ld-onyx transition-colors cursor-pointer"
        >
          {primary.cta}
          <ArrowRight size={18} />
        </Link>
      </article>

      {claimable && <ClaimCard />}

      <div className="flex flex-col">
        <span className="pb-1 text-[13px] font-semibold text-ld-slate">Coba juga</span>
        {listed.map((item) => {
          const program = catalog.get(item.id);
          if (!program) return null;
          return (
            <Link
              key={item.id}
              to={programHref(program, 'onboarding', publicLinks)}
              className="flex items-center gap-3.5 min-h-16 border-b border-ld-frost no-underline text-inherit group cursor-pointer"
            >
              <ProgramIcon id={program.id} size={32} className="shrink-0" />
              <span className="flex-1 min-w-0 text-[15px] font-semibold text-ld-onyx group-hover:underline underline-offset-4">{program.name}</span>
              <PriceBadge program={program} />
              <ChevronRight size={18} className="shrink-0 text-ld-steel" />
            </Link>
          );
        })}
        {recommendation.others.length > 0 && (
          <button
            type="button"
            onClick={onToggleAll}
            aria-expanded={showAll}
            className="self-start h-11 text-sm font-medium text-ld-slate hover:text-ld-graphite transition-colors cursor-pointer"
          >
            {showAll ? 'Sembunyikan' : 'Lihat semua program'}
          </button>
        )}
      </div>

      <div className="flex justify-center gap-6 pt-1">
        {(next || signedIn) && (
          <Link
            to={next ?? '/dashboard'}
            className="inline-flex items-center h-11 text-sm font-medium text-ld-graphite underline underline-offset-4 decoration-ld-fog hover:decoration-ld-graphite cursor-pointer"
          >
            {next ? 'Lanjut ke halaman tadi' : 'Ke dashboard'}
          </Link>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="h-11 text-sm font-medium text-ld-graphite underline underline-offset-4 decoration-ld-fog hover:decoration-ld-graphite cursor-pointer"
        >
          Ulangi pertanyaan
        </button>
      </div>
    </main>
  );
};

const CLAIM_BENEFITS = [
  'Tersimpan di dashboard, buka dari mana pun.',
  'Progress program ikut tersimpan.',
  'Cukup login pakai akun Google.',
];

// Guest result → "claim" the recommendation by logging in right here (Google
// popup; same-tab redirect in in-app browsers). Showing this card to a guest
// arms the claim for this tab; OnboardingClaimSync saves the answers as soon
// as the session exists, and this card mirrors its state.
const ClaimCard: React.FC = () => {
  const signedIn = useAdminAuthStore((s) => !!s.token);
  const state = useOnboardingClaimStore((s) => s.state);
  const claim = useOnboardingClaimStore((s) => s.claim);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!signedIn) armClaim(); }, [signedIn]);

  const retry = () => { void claim(); };

  // Brand guideline (docs/DESIGN.md): white card, 12px radius, 1px Ash
  // border, no shadow; slate text plus one blue; the pixel mosaic is the only
  // ornament. Exception, by request: the benefit ticks are filled green
  // (same "done" green as the QA Simulator); error/outdated states stay neutral.
  const box = 'relative overflow-hidden rounded-xl border border-ld-ash bg-ld-canvas p-5 md:p-6 flex flex-col gap-4';

  if (signedIn && state === 'saved') {
    return (
      <section className={box} aria-live="polite">
        <ClaimPixels />
        <div className="flex items-start gap-3 pr-14">
          <span className="shrink-0 w-9 h-9 rounded-lg bg-ld-lilac text-ld-violet flex items-center justify-center"><CircleCheck size={18} /></span>
          <div className="flex flex-col gap-1">
            <h2 className="m-0 font-ld-display text-lg font-semibold tracking-[-0.01em] text-ld-onyx">Tersimpan di akunmu</h2>
            <p className="m-0 text-sm text-ld-slate leading-relaxed">Rekomendasi ini sekarang ada di dashboard.</p>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="self-start inline-flex items-center gap-1.5 h-10 px-4 rounded-lg border border-ld-ash text-sm font-medium text-ld-graphite no-underline hover:border-ld-violet hover:text-ld-violet transition-colors"
        >
          Ke dashboard <ArrowRight size={15} />
        </Link>
      </section>
    );
  }

  if (signedIn && state === 'outdated') {
    return (
      <section className={box} aria-live="polite">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-ld-display text-lg font-semibold tracking-[-0.01em] text-ld-onyx">Pertanyaannya sudah diperbarui</h2>
          <p className="m-0 text-sm text-ld-slate leading-relaxed">Jawaban tadi tidak bisa disimpan. Ulangi pertanyaan di bawah ya.</p>
        </div>
      </section>
    );
  }

  if (signedIn && state === 'error') {
    return (
      <section className={box} aria-live="polite">
        <div className="flex flex-col gap-1">
          <h2 className="m-0 font-ld-display text-lg font-semibold tracking-[-0.01em] text-ld-onyx">Gagal menyimpan</h2>
          <p className="m-0 text-sm text-ld-slate leading-relaxed">Koneksi terputus. Jawabanmu masih aman, coba lagi.</p>
        </div>
        <button
          type="button"
          onClick={retry}
          className="self-start h-10 px-4 rounded-lg bg-ld-violet text-white text-sm font-medium border-none hover:bg-[#1f87e6] transition-colors cursor-pointer"
        >
          Coba lagi
        </button>
      </section>
    );
  }

  if (signedIn) {
    return (
      <section className={box} aria-live="polite">
        <p className="m-0 flex items-center gap-2 text-sm text-ld-slate"><Loader2 size={16} className="animate-spin text-ld-violet" /> Menyimpan ke akunmu…</p>
      </section>
    );
  }

  return (
    <section className={box}>
      <ClaimPixels />
      <div className="flex flex-col gap-1">
        <span className="pr-14 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">Gratis</span>
        <h2 className="m-0 font-ld-display text-lg md:text-xl font-semibold tracking-[-0.01em] text-ld-onyx">Klaim program personalmu</h2>
        <p className="m-0 text-sm text-ld-slate">Login sekali, rekomendasi jadi milikmu.</p>
      </div>
      <ul className="m-0 p-0 list-none flex flex-col gap-2">
        {CLAIM_BENEFITS.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-ld-graphite">
            <span className="mt-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0">
              <Check size={11} strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>
      <GoogleSignInButton onSuccess={() => setError(null)} onError={setError} />
      {error && <p className="m-0 text-xs text-red-500 text-center">{error}</p>}
    </section>
  );
};

/** Small brand pixel mosaic, inset in the card's top-right corner. */
const ClaimPixels: React.FC = () => (
  <div aria-hidden="true" className="absolute top-5 right-5 md:top-6 md:right-6 grid grid-cols-4 gap-[3px]">
    {['bg-ld-lilac', 'bg-ld-lavender', 'bg-ld-violet', 'bg-ld-violet', '', 'bg-ld-lilac', 'bg-ld-lavender', 'bg-ld-violet'].map((c, i) => (
      <span key={i} className={`w-[7px] h-[7px] rounded-[2px] ${c}`} />
    ))}
  </div>
);

export default OnboardingPage;
