import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SIM_CARD } from '../lib/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle, ArrowRight, FileUser, ChevronDown, ChevronRight, Clock, Cloud, CloudOff, FileText, HardDrive, History, Loader2, X,
} from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';
import Seo from '../../../components/common/Seo';
import { useSimulatorProject } from '../hooks/useSimulatorData';
import { useSimulatorProgress, type SyncStatus } from '../hooks/useSimulatorProgress';
import { useLeaveGuard } from '../hooks/useLeaveGuard';
import { phaseScore, phaseState, projectCompletion, type PhaseState } from '../lib/progress';
import AssignmentCard from '../components/AssignmentCard';
import PhaseStepper from '../components/PhaseStepper';
import ReferencePanel from '../components/ReferencePanel';
import LoginPromptModal from '../components/LoginPromptModal';
import { useSnackbarStore } from '../../../store/useSnackbarStore';
import PhaseIntroModal from '../components/PhaseIntroModal';
import { hasSeenPhaseIntro, markPhaseIntroSeen } from '../lib/phaseIntro';
import TeamAvatar from '../components/TeamAvatar';
import TrophyIllustration from '../components/TrophyIllustration';
import LockIllustration from '../components/LockIllustration';
import Collapse from '../components/Collapse';
import PartyPopperIllustration from '../components/PartyPopperIllustration';
import { BriefCard, LearnCard, SandboxCard } from '../components/PhaseIntro';
import type { SimulatorProject } from '../../../types/qaSimulator';

const DIFFICULTY_LABEL = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' } as const;

const SyncIndicator: React.FC<{ status: SyncStatus; error: string | null }> = ({ status, error }) => {
  const map: Record<SyncStatus, { icon: React.ReactNode; label: string; cls: string }> = {
    loading: { icon: <Loader2 size={13} className="animate-spin" />, label: 'Memuat progress…', cls: 'text-ld-fog' },
    local: { icon: <HardDrive size={13} />, label: 'Tersimpan di browser ini', cls: 'text-ld-slate' },
    saving: { icon: <Loader2 size={13} className="animate-spin" />, label: 'Menyimpan…', cls: 'text-ld-fog' },
    saved: { icon: <Cloud size={13} />, label: 'Tersimpan di akunmu', cls: 'text-emerald-600' },
    error: { icon: <CloudOff size={13} />, label: error ?? 'Gagal sinkron', cls: 'text-red-500' },
  };
  const m = map[status];
  return <span className={`inline-flex items-center gap-1.5 text-xs ${m.cls}`} role="status">{m.icon}{m.label}</span>;
};

function defaultPhaseIndex(states: PhaseState[]): number {
  const next = states.findIndex((s) => s === 'available' || s === 'login-required');
  return next === -1 ? states.length - 1 : next;
}

const QaSimulatorProjectPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { project, loading, error, retry } = useSimulatorProject(projectId);

  if (loading) return <LoadingState label="Memuat project…" className="min-h-[60vh]" />;
  if (error || !project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 font-ld-sans text-center">
        <AlertCircle className="text-ld-fog" size={32} />
        <p className="m-0 text-sm text-ld-slate">{error ?? 'Project tidak ditemukan.'}</p>
        <div className="flex gap-2">
          <button onClick={retry} className="px-4 py-2 rounded-lg bg-ld-violet text-white text-sm font-medium border-none cursor-pointer">Coba lagi</button>
          <Link to="/qa-simulator" className="px-4 py-2 rounded-lg border border-ld-frost text-sm font-medium text-ld-graphite no-underline">Kembali</Link>
        </div>
      </div>
    );
  }
  return <ProjectWorkspace project={project} />;
};

const ProjectWorkspace: React.FC<{ project: SimulatorProject }> = ({ project }) => {
  const { progress, status, error, updateAssignment, loggedIn } = useSimulatorProgress(project.id);
  const [searchParams, setSearchParams] = useSearchParams();

  const states = project.phases.map((_, i) => phaseState(project, i, progress, loggedIn));
  const requested = project.phases.findIndex((p) => p.id === searchParams.get('phase'));
  const targetIndex = requested >= 0 && states[requested] !== 'locked' ? requested : defaultPhaseIndex(states);
  // Guests never land *on* a login-required phase: they stay on the last open
  // phase and get a login modal instead (auto-shown only for an explicit ?phase= link).
  let activeIndex = targetIndex;
  while (activeIndex > 0 && (states[activeIndex] === 'login-required' || states[activeIndex] === 'locked')) activeIndex--;
  const [loginPrompt, setLoginPrompt] = useState<number | null>(null);
  const [linkPromptDismissed, setLinkPromptDismissed] = useState(false);
  const [prdOpen, setPrdOpen] = useState(false);
  // Auto-prompt only for a deep link that was already login-gated when the
  // page loaded. Otherwise finishing phase 1 as a guest would flip a stale
  // ?phase=<next> param from "locked" to "login-required" and pop the login
  // modal on top of the "Tugas terkirim!" popup. After load, the login modal
  // opens only from an explicit action (stepper / "Lanjut" button).
  const linkGatedNow = requested >= 0 && requested === targetIndex && targetIndex !== activeIndex;
  const [linkGatedAtLoad] = useState(linkGatedNow);
  const linkGated = linkGatedAtLoad && linkGatedNow;
  const promptIndex = loginPrompt ?? (linkGated && !linkPromptDismissed ? targetIndex : null);
  const phase = project.phases[activeIndex];
  const state = states[activeIndex];
  const completion = projectCompletion(project, progress);
  const allDone = states.every((s) => s === 'completed');
  const nextIndex = activeIndex + 1 < project.phases.length ? activeIndex + 1 : null;

  const selectPhase = (i: number) => {
    if (states[i] === 'login-required') { setLoginPrompt(i); return; }
    setSearchParams({ phase: project.phases[i].id }, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeLoginPrompt = () => {
    setLoginPrompt(null);
    setLinkPromptDismissed(true);
    if (linkGated) setSearchParams({ phase: project.phases[activeIndex].id }, { replace: true });
  };
  const showSnackbar = useSnackbarStore((s) => s.show);
  // Signed in from the modal: jump straight to the phase they were trying to open.
  // Guest progress is merged into the account by useSimulatorProgress.
  const handleLoggedIn = (target: number) => {
    setLoginPrompt(null);
    setLinkPromptDismissed(true);
    setSearchParams({ phase: project.phases[target].id }, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showSnackbar('Login berhasil! Progress kamu sekarang tersimpan di akun.', 'success');
  };
  const score = phaseScore(phase, progress);

  const isOpen = state !== 'locked' && state !== 'login-required';


  // Phase intro popup: auto-plays the first time a learner opens each phase
  // (remembered per browser), and can be replayed from the brief card.
  const [introClosed, setIntroClosed] = useState<Record<string, boolean>>({});
  const [replayPhase, setReplayPhase] = useState<string | null>(null);
  const showIntro = isOpen && (replayPhase === phase.id || (!introClosed[phase.id] && !hasSeenPhaseIntro(project.id, phase.id)));
  const closeIntro = useCallback(() => {
    markPhaseIntroSeen(project.id, phase.id);
    setIntroClosed((m) => ({ ...m, [phase.id]: true }));
    setReplayPhase(null);
  }, [project.id, phase.id]);
  const referencePhase = isOpen ? activeIndex : 0;
  const unassessed = phase.assignments.filter((a) => progress.assignments[a.id]?.status === 'submitted' && !progress.assignments[a.id]?.assessedAt).length;
  const doneInPhase = phase.assignments.filter((a) => progress.assignments[a.id]?.status === 'submitted').length;

  // Logged in: an edit is still debouncing / in flight to the server. It's
  // safe in this browser's localStorage, but closing now means the account
  // (other devices) won't have it — so confirm before leaving.
  useLeaveGuard(status === 'saving');

  // ── Resume: "continue where you left off" ──
  // Decided once, after progress has loaded (logged-in users wait for the
  // server copy), so it doesn't flip on the learner's first keystroke.
  const [returning, setReturning] = useState<boolean | null>(null);
  if (returning === null && status !== 'loading') setReturning(Object.keys(progress.assignments).length > 0);
  const resumeIndex = isOpen && state !== 'completed'
    ? phase.assignments.findIndex((a) => progress.assignments[a.id]?.status !== 'submitted')
    : -1;
  const resumeTask = resumeIndex >= 0 ? phase.assignments[resumeIndex] : null;
  const resumeId = resumeTask?.id ?? null;
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const goToTask = useCallback((id: string) => {
    document.getElementById(`task-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setHighlightId(id);
    window.setTimeout(() => setHighlightId((h) => (h === id ? null : h)), 2200);
  }, []);
  // Auto-scroll once per visit for returning learners (not over the intro popup).
  const autoResumed = useRef(false);
  useEffect(() => {
    if (autoResumed.current || !returning || !resumeId || showIntro) return;
    const t = window.setTimeout(() => {
      autoResumed.current = true;
      goToTask(resumeId);
    }, 450);
    return () => window.clearTimeout(t);
  }, [returning, resumeId, showIntro, goToTask]);
  const showResume = !!returning && !!resumeTask && !resumeDismissed;

  // Sections are numbered in reading order so the page reads like a checklist.
  let sectionNo = 0;
  const nextNo = () => ++sectionNo;

  return (
    <div className="font-ld-sans pb-16">
      <Seo
        path={`/qa-simulator/${project.id}`}
        title={`${project.title} | QA Simulator — Mentor.QA`}
        description={project.summary}
      />

      <AnimatePresence>
        {promptIndex !== null && (
          <LoginPromptModal
            key="login-prompt"
            phase={project.phases[promptIndex]}
            phaseNumber={promptIndex + 1}
            onLoggedIn={() => handleLoggedIn(promptIndex)}
            onClose={closeLoginPrompt}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIntro && promptIndex === null && (
          <PhaseIntroModal
            key={phase.id}
            phase={phase}
            phaseNumber={activeIndex + 1}
            totalPhases={project.phases.length}
            team={project.team}
            channel={`squad-${project.product.toLowerCase()}`}
            onClose={closeIntro}
          />
        )}
      </AnimatePresence>

      {/* ── Project bar: where am I + overall progress + phase navigation ── */}
      {/* Resume bar: one line, full width, glued right under the 56px Labs
          header. Fixed 44px height so the sticky PRD panel can offset below it. */}
      {showResume && resumeTask && (
        <div
          className="print:hidden sticky top-14 z-[900] h-11 flex items-center gap-2.5 px-4 sm:px-6 lg:px-8 border-b border-ld-lavender bg-ld-lilac shadow-[0_8px_20px_-14px_rgba(39,40,53,0.35)]"
          role="status"
        >
          <History size={15} className="text-ld-violet shrink-0" aria-hidden="true" />
          <p className="m-0 flex-1 min-w-0 truncate text-sm text-ld-slate">
            <span className="font-semibold text-ld-onyx">Selamat datang kembali!</span>{' '}
            {doneInPhase}/{phase.assignments.length} tugas selesai · Berikutnya: Tugas {resumeIndex + 1} – {resumeTask.title}
          </p>
          <button
            type="button"
            onClick={() => { goToTask(resumeTask.id); setResumeDismissed(true); }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-xs font-medium border-none cursor-pointer transition-colors shrink-0"
          >
            Lanjutkan <ArrowRight size={13} />
          </button>
          <button
            type="button"
            onClick={() => setResumeDismissed(true)}
            aria-label="Tutup"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent hover:bg-white text-ld-fog hover:text-ld-slate border-none cursor-pointer transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="bg-white border-b border-ld-frost">
        <div className="px-4 sm:px-6 lg:px-8 pt-5 pb-4">
          <nav className="flex items-center gap-1.5 text-xs text-ld-fog mb-3" aria-label="Breadcrumb">
            <Link to="/qa-simulator" className="text-ld-slate hover:text-ld-violet no-underline">Projects</Link>
            <ChevronRight size={13} />
            <span className="text-ld-graphite font-medium truncate">{project.product}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8 justify-between">
            <div className="min-w-0">
              <h1 className="m-0 font-semibold text-xl sm:text-2xl text-ld-onyx tracking-[-0.02em] leading-tight">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet">{project.product}</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-ld-cloud text-ld-slate">{project.domain}</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-ld-cloud text-ld-slate">{DIFFICULTY_LABEL[project.difficulty]}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-ld-cloud text-ld-slate"><Clock size={11} /> ±{project.estimatedHours} jam</span>
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0">
              <div className="hidden sm:flex -space-x-2" title="Tim squad kamu">
                {project.team.map((m) => <TeamAvatar key={m.id} member={m} size="sm" />)}
              </div>
              <div className="w-full sm:w-64">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-ld-graphite">Progress {completion.done}/{completion.total} tugas</span>
                  <span className="font-semibold text-ld-violet tabular-nums">{completion.percent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-ld-frost overflow-hidden">
                  <div className="h-full rounded-full bg-ld-violet transition-all duration-500" style={{ width: `${completion.percent}%` }} />
                </div>
                <div className="mt-1.5"><SyncIndicator status={status} error={error} /></div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <PhaseStepper phases={project.phases} states={states} activeIndex={activeIndex} onSelect={selectPhase} />
          </div>
        </div>
      </section>

      {/* ── Workspace: left = what to do, right = what to read ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(380px,42%)] 2xl:grid-cols-[minmax(0,1fr)_640px] gap-6 items-start">
        <div className="min-w-0 space-y-8">
          {/* Phase header */}
          <div className={`${SIM_CARD} p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between`}>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">Phase {activeIndex + 1} dari {project.phases.length}</p>
              <h2 className="m-0 mt-1 text-xl sm:text-2xl font-semibold text-ld-onyx tracking-[-0.01em]">{phase.title}</h2>
              <p className="m-0 mt-1.5 text-sm text-ld-slate">{phase.summary}</p>
            </div>
            {isOpen && (
              <div className="shrink-0 md:text-right">
                <p className="m-0 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Tugas phase ini</p>
                <p className="m-0 mt-0.5 text-2xl font-semibold text-ld-onyx tabular-nums">
                  {doneInPhase}<span className="text-ld-fog text-lg">/{phase.assignments.length}</span>
                </p>
              </div>
            )}
          </div>

          {state === 'locked' ? (
            <div className={`${SIM_CARD} p-6 text-center`}>
              <LockIllustration className="mx-auto mb-2 w-28 h-auto" />
              <p className="m-0 text-sm text-ld-slate">Selesaikan phase sebelumnya dulu.</p>
            </div>
          ) : (
            <>
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setPrdOpen((v) => !v)}
                  aria-expanded={prdOpen}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-white border border-ld-frost cursor-pointer text-sm font-semibold text-ld-onyx text-left"
                >
                  <span className="inline-flex items-center gap-2"><FileText size={16} className="text-ld-violet" /> Baca PRD & konteks project</span>
                  <ChevronDown size={16} className={`text-ld-fog transition-transform duration-300 ${prdOpen ? 'rotate-180' : ''}`} />
                </button>
                <Collapse open={prdOpen} className="pt-2">
                  <ReferencePanel project={project} phaseIndex={referencePhase} className="h-[70vh]" />
                </Collapse>
              </div>

              <WorkSection no={nextNo()} title="Chat dari tim" hint="Brief dari tim untuk phase ini. Klik untuk buka percakapan.">
                <BriefCard key={phase.id} phase={phase} team={project.team} onReplay={() => setReplayPhase(phase.id)} />
              </WorkSection>

              <WorkSection no={nextNo()} title="Pelajari konsepnya" hint="Materi singkat sebelum mulai mengerjakan.">
                <LearnCard key={phase.id} phase={phase} defaultOpen={!phase.assignments.some((a) => progress.assignments[a.id])} />
              </WorkSection>

              {phase.sandbox && (
                <WorkSection no={nextNo()} title="Environment testing" hint="Aplikasi staging yang kamu uji di phase ini.">
                  <SandboxCard sandbox={phase.sandbox} />
                </WorkSection>
              )}

              <WorkSection
                no={nextNo()}
                title="Kerjakan tugas"
                hint="Tulis jawaban → Submit → nilai sendiri pakai rubric → bandingkan dengan kunci jawaban."
              >
                <div className="space-y-5">
                  {phase.assignments.map((assignment, i) => (
                    <AssignmentCard
                      key={assignment.id}
                      number={i + 1}
                      assignment={assignment}
                      progress={progress.assignments[assignment.id]}
                      highlight={highlightId === assignment.id}
                      onUpdate={(updater) => {
                        // Pin the phase in the URL on first interaction — otherwise
                        // submitting the last task re-derives the default phase and
                        // jumps away before the learner sees their self-assessment.
                        if (!searchParams.get('phase')) setSearchParams({ phase: phase.id }, { replace: true });
                        updateAssignment(assignment.id, updater);
                      }}
                    />
                  ))}
                </div>
              </WorkSection>

            </>
          )}
        </div>

        {/* Sticky below the Labs header (56px) — and below the 44px resume bar when it's showing. */}
        <aside className={`hidden lg:block sticky ${showResume ? 'top-[116px]' : 'top-[72px]'}`}>
          <ReferencePanel
            project={project}
            phaseIndex={referencePhase}
            className={
              showResume
                ? state === 'completed' ? 'h-[calc(100vh-212px)]' : 'h-[calc(100vh-132px)]'
                : state === 'completed' ? 'h-[calc(100vh-168px)]' : 'h-[calc(100vh-88px)]'
            }
          />
        </aside>
      </div>

      {/* ── Completion bar: sticks to the viewport bottom while the workspace is in view ── */}
      <AnimatePresence>
        {state === 'completed' && (
          <motion.div
            key={allDone ? 'all-done' : phase.id}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="sticky bottom-0 z-40 mt-8 -mb-16 border-t border-emerald-200 bg-emerald-50"
            role="status"
          >
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
              {allDone ? (
                <TrophyIllustration className="w-12 h-10 sm:w-[60px] sm:h-[50px] shrink-0 -my-1" />
              ) : (
                <PartyPopperIllustration className="w-12 h-10 sm:w-[60px] sm:h-[50px] shrink-0 -my-1" />
              )}
              <div className="flex-1 min-w-[180px]">
                <p className="m-0 text-sm font-semibold text-emerald-800 truncate">
                  {allDone ? 'Selamat, kamu menyelesaikan seluruh simulasi! 🎉' : `Phase ${activeIndex + 1} selesai!`}
                </p>
                <p className="m-0 mt-0.5 text-xs text-emerald-700 line-clamp-2 sm:line-clamp-1">
                  {unassessed > 0
                    ? <>{unassessed} tugas belum di-self-assess.</>
                    : <>Skor self-assessment phase ini: <strong>{score ?? 0}%</strong>.</>}
                  {allDone ? ' Bawa hasil kerjamu ke sesi mentoring untuk di-review mentor.' : ' Lanjutkan ke phase berikutnya.'}
                </p>
              </div>
              {nextIndex !== null ? (
                <button
                  type="button"
                  onClick={() => selectPhase(nextIndex)}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium border-none cursor-pointer transition-colors shrink-0"
                >
                  <span className="hidden sm:inline">Lanjut:</span> {project.phases[nextIndex].shortTitle} <ArrowRight size={14} />
                </button>
              ) : (
                <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {allDone && (
                    <Link
                      to={`/qa-simulator/${project.id}/portfolio`}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg border border-emerald-600 bg-white hover:bg-emerald-100 text-emerald-700 text-sm font-medium no-underline transition-colors"
                    >
                      <FileUser size={15} /> Buat portfolio
                    </Link>
                  )}
                  <Link to="/mentoring/booking" className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium no-underline transition-colors">
                    Booking <span className="hidden sm:inline">review</span> mentor <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkSection: React.FC<{ no: number; title: string; hint: string; children: React.ReactNode }> = ({ no, title, hint, children }) => (
  <section>
    <div className="flex items-start gap-3 mb-3">
      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-ld-onyx text-white text-xs font-bold font-ld-mono shrink-0">{no}</span>
      <div className="min-w-0">
        <h3 className="m-0 text-base font-semibold text-ld-onyx leading-7">{title}</h3>
        <p className="m-0 text-xs text-ld-slate">{hint}</p>
      </div>
    </div>
    {children}
  </section>
);

export default QaSimulatorProjectPage;
