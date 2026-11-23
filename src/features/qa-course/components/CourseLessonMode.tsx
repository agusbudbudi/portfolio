import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ListTree, Lock, X } from 'lucide-react';
import { useCourse } from '../hooks/useCourse';
import { addPendingArticle } from '../lib/courseApi';
import type { Lesson } from '../lib/courseOutline';
import CourseOutline from './CourseOutline';
import CourseLoginModal from './CourseLoginModal';
import LoadingState from '../../../components/common/LoadingState';
import { DialogBody, DialogHeader } from '../../../components/common/DialogLayout';

interface CourseLessonModeProps {
  courseSlug: string;
  articleId: string;
  /** Title, meta row and thumbnail: always shown. */
  head: React.ReactNode;
  /** The article body; replaced by a lock card when the lesson isn't open yet. */
  children: React.ReactNode;
  /** Attachment + tags under the body; hidden while the lesson is locked. */
  extras?: React.ReactNode;
}

const BackLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link to={to} className="inline-flex items-center gap-1.5 text-sm text-ld-slate hover:text-ld-violet no-underline mb-6">
    <ArrowLeft size={15} /> {label}
  </Link>
);

const DRAWER_EASE = [0.4, 0, 0.2, 1] as const;

// Outline drawer for small screens: backdrop fades, the panel slides in from
// the right (and back out on close, via AnimatePresence at the call site).
// Page scroll is locked while open; reduced motion skips the slide.
const OutlineDrawer: React.FC<{ onClose: () => void; children: React.ReactNode; title: string }> = ({ onClose, children, title }) => {
  const reduce = !!useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return (
    <motion.div
      className="fixed inset-0 z-[1050] flex justify-end bg-ld-onyx/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.25, ease: DRAWER_EASE }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Outline ${title}`}
        className="w-full sm:max-w-sm h-full flex flex-col bg-white font-ld-sans shadow-[-12px_0_32px_-12px_rgba(39,40,53,0.25)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        initial={reduce ? false : { x: '100%' }}
        animate={{ x: 0 }}
        exit={reduce ? { opacity: 0 } : { x: '100%' }}
        transition={{ duration: reduce ? 0 : 0.32, ease: DRAWER_EASE }}
      >
        <DialogHeader className="flex items-center justify-between gap-3 px-4 h-14 border-b border-ld-frost">
          <p className="m-0 text-sm font-semibold text-ld-onyx truncate">{title}</p>
          <button type="button" onClick={onClose} aria-label="Tutup outline" className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border-none bg-transparent hover:bg-ld-cloud cursor-pointer">
            <X size={18} />
          </button>
        </DialogHeader>
        <DialogBody className="px-4 py-5">{children}</DialogBody>
      </motion.div>
    </motion.div>
  );
};

/**
 * Layout for an article opened from a course (?course=slug). Desktop (lg+):
 * two columns, a sticky course sidebar (progress + module outline) on the
 * left and the article on the right. Smaller screens: one column with a
 * position card whose Outline button opens the outline as a drawer. Both end
 * with a sticky Prev / Selesai & lanjut bar.
 */
const CourseLessonMode: React.FC<CourseLessonModeProps> = ({ courseSlug, articleId, head, children, extras }) => {
  const navigate = useNavigate();
  const { course, lessons, completion, loggedIn, progressLoaded, setArticleDone, state } = useCourse(courseSlug);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const closeOutline = useCallback(() => setOutlineOpen(false), []);
  const [loginFor, setLoginFor] = useState<Lesson | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = lessons.find((l) => l.item.kind === 'article' && l.item.articleId === articleId);

  // Until progress is in, every lesson past the first looks locked: hold the
  // body back (no flash of a locked lesson) but show the article head.
  if (state.status === 'loading' || (state.status === 'ready' && !progressLoaded)) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-10">
        <BackLink to={`/courses/${courseSlug}`} label="Kembali ke course" />
        {head}
        <LoadingState label="Memuat lesson…" className="min-h-[30vh]" />
      </div>
    );
  }
  // Course missing/unpublished, or this article isn't in it: plain article.
  if (!course || !current) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-10">
        <BackLink to="/qa-library" label="Kembali ke QA Library" />
        {head}
        {children}
        {extras}
      </div>
    );
  }

  // A locked lesson's predecessor can be locked too; never offer a dead end.
  const prevCandidate = lessons.slice(0, current.index).reverse().find((l) => l.available);
  const prev = prevCandidate?.lock === 'sequence' ? undefined : prevCandidate;
  const next = lessons.slice(current.index + 1).find((l) => l.available);
  const loginGated = current.lock === 'login';
  // Opened by URL before finishing the lessons in front of it.
  const sequenceLocked = current.lock === 'sequence';
  const frontier = lessons.find((l) => l.isNext);

  const go = (lesson: Lesson) => {
    if (lesson.lock === 'login') { setLoginFor(lesson); return; }
    navigate(lesson.href);
  };

  const finishAndContinue = async () => {
    setSaveError(null);
    // Guest finishing lesson 1: remember it, it syncs right after login.
    if (!loggedIn && current.item.kind === 'article') addPendingArticle(course.slug, current.item.articleId);
    if (loggedIn && !current.done) {
      setSaving(true);
      const ok = await setArticleDone(articleId, true);
      setSaving(false);
      if (!ok) { setSaveError('Gagal menyimpan progress. Coba lagi.'); return; }
    }
    // The next lesson was locked only because this one wasn't done; finishing
    // it here is exactly what unlocks it, so follow it directly.
    if (next) {
      if (next.lock === 'login') { setLoginFor(next); return; }
      navigate(next.href);
      return;
    }
    // Last lesson: the graduation page checks completion itself.
    navigate(completion.allDone || !loggedIn ? `/courses/${course.slug}/selesai` : `/courses/${course.slug}`);
  };

  const locked = sequenceLocked || loginGated;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-8 md:pt-10 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12">
      {/* Desktop course sidebar */}
      <aside className="hidden lg:block" aria-label={`Outline ${course.title}`}>
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pb-6 pr-1">
          <Link to={`/courses/${course.slug}`} className="inline-flex items-center gap-1.5 text-sm text-ld-slate hover:text-ld-violet no-underline">
            <ArrowLeft size={15} /> Kembali ke course
          </Link>
          <p className="m-0 mt-5 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">QA Course</p>
          <p className="m-0 mt-1 text-lg font-semibold text-ld-onyx leading-snug">{course.title}</p>
          {loggedIn && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-ld-slate mb-1.5">
                <span>Progress</span><span className="tabular-nums">{completion.done}/{completion.total} selesai</span>
              </div>
              <div className="h-1.5 rounded-full bg-ld-frost overflow-hidden" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full bg-ld-violet transition-all" style={{ width: `${completion.percent}%` }} />
              </div>
            </div>
          )}
          <div className="mt-5">
            <CourseOutline
              course={course}
              lessons={lessons}
              variant="compact"
              activeIndex={current.index}
              onLocked={setLoginFor}
            />
          </div>
        </div>
      </aside>

      <div className="min-w-0 max-w-3xl">
        {/* Small screens: back link + position card with the outline drawer */}
        <div className="lg:hidden">
          <BackLink to={`/courses/${course.slug}`} label="Kembali ke course" />
        </div>
        <div className="lg:hidden flex flex-wrap items-center justify-between gap-3 mb-6 px-4 py-3 rounded-xl border border-ld-frost bg-ld-cloud/60">
          <div className="min-w-0">
            <Link to={`/courses/${course.slug}`} className="block text-[11px] font-semibold uppercase tracking-widest text-ld-violet no-underline truncate">
              {course.title}
            </Link>
            <p className="m-0 mt-0.5 text-xs text-ld-slate">
              Modul {current.moduleIndex + 1}: {current.moduleTitle} · Lesson {current.index + 1} dari {lessons.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOutlineOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer hover:border-ld-violet"
          >
            <ListTree size={15} /> Outline
          </button>
        </div>
        <p className="hidden lg:block m-0 mb-3 text-xs font-medium text-ld-steel">
          Modul {current.moduleIndex + 1}: {current.moduleTitle} · Lesson {current.index + 1} dari {lessons.length}
        </p>

        {head}

        {sequenceLocked ? (
          <div className="rounded-xl border border-ld-frost bg-white px-6 py-10 text-center">
            <Lock size={22} className="mx-auto text-ld-violet" />
            <h2 className="m-0 mt-3 text-lg font-semibold text-ld-onyx">Lesson ini belum terbuka</h2>
            <p className="m-0 mt-2 text-sm text-ld-slate">
              Course ini dibuka berurutan. Selesaikan {frontier ? <strong className="font-semibold text-ld-graphite">{frontier.title}</strong> : 'lesson sebelumnya'} dulu, lalu klik Selesai &amp; lanjut.
            </p>
            {frontier && (
              <Link
                to={frontier.href}
                className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium no-underline"
              >
                Buka lesson yang harus diselesaikan <ArrowRight size={15} />
              </Link>
            )}
          </div>
        ) : loginGated ? (
          <div className="rounded-xl border border-ld-frost bg-white px-6 py-10 text-center">
            <Lock size={22} className="mx-auto text-ld-violet" />
            <h2 className="m-0 mt-3 text-lg font-semibold text-ld-onyx">Login untuk lanjut belajar</h2>
            <p className="m-0 mt-2 text-sm text-ld-slate">Lesson pertama bisa dibaca tanpa login. Login gratis supaya progress-mu tersimpan.</p>
            <button
              type="button"
              onClick={() => setLoginFor(current)}
              className="mt-5 px-5 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer"
            >
              Login dengan Google
            </button>
          </div>
        ) : children}

        {!locked && extras}

        {/* Sticky lesson navigation */}
        <div className="sticky bottom-0 z-30 mt-10 -mx-4 px-4 py-3 bg-white/95 backdrop-blur border-t border-ld-frost">
          <div className="flex items-center justify-between gap-2">
            {prev ? (
              <button type="button" onClick={() => go(prev)} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer hover:border-ld-violet min-w-0">
                <ArrowLeft size={15} className="shrink-0" /> <span className="hidden sm:inline truncate max-w-[180px]">{prev.title}</span><span className="sm:hidden">Sebelumnya</span>
              </button>
            ) : <span />}
            {!loginGated && !sequenceLocked && (
              <button
                type="button"
                onClick={finishAndContinue}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {current.done ? <Check size={15} /> : null}
                {next ? (current.done || !loggedIn ? 'Lanjut' : 'Selesai & lanjut') : 'Selesaikan course'}
                <ArrowRight size={15} />
              </button>
            )}
          </div>
          {saveError && <p className="m-0 mt-2 text-xs text-red-600 text-right">{saveError}</p>}
        </div>
      </div>

      <AnimatePresence>
      {outlineOpen && (
        <OutlineDrawer key="outline-drawer" title={course.title} onClose={closeOutline}>
          <CourseOutline
            course={course}
            lessons={lessons}
            variant="compact"
            activeIndex={current.index}
            onLocked={(l) => { setOutlineOpen(false); setLoginFor(l); }}
            onNavigate={() => setOutlineOpen(false)}
          />
        </OutlineDrawer>
      )}
      </AnimatePresence>

      {loginFor && (
        <CourseLoginModal
          courseTitle={course.title}
          lessonTitle={loginFor === current ? undefined : loginFor.title}
          onClose={() => setLoginFor(null)}
          onLoggedIn={() => {
            const target = loginFor;
            setLoginFor(null);
            if (target !== current) navigate(target.href);
          }}
        />
      )}
    </div>
  );
};

export default CourseLessonMode;
