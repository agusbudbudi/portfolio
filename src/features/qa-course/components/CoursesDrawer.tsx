import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Layers, X } from 'lucide-react';
import { QaCourseIcon } from '../../../components/illustration/ProductIcons';
import type { QaCourseSummary } from '../../../types/qaCourse';
import { QA_COURSE_LEVEL_LABEL } from '../../../types/qaCourse';
import { fetchCourses } from '../lib/courseApi';
import { COMING_SOON } from './landing/content';

// Right-side drawer listing every course (compact version of the /courses
// cards), opened from the course header's "Courses" button so a learner can
// switch courses without leaving the lesson. Mirrors QA Simulator's
// ProjectsDrawer.

type ListState = { status: 'loading' } | { status: 'ready'; courses: QaCourseSummary[] } | { status: 'error' };

const Thumb: React.FC<{ src?: string; dim?: boolean }> = ({ src, dim = false }) => (
  <div className={`relative w-[108px] shrink-0 self-stretch min-h-[96px] overflow-hidden flex items-center justify-center ${dim ? 'bg-ld-cloud' : 'bg-ld-lilac'}`}>
    {src ? (
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover object-left-top" loading="lazy" />
    ) : (
      <QaCourseIcon size={40} className={dim ? 'opacity-50 grayscale' : ''} />
    )}
  </div>
);

const CourseRow: React.FC<{ course: QaCourseSummary; current: boolean; onPick: () => void }> = ({ course, current, onPick }) => (
  <Link
    to={`/courses/${course.slug}`}
    onClick={onPick}
    aria-current={current ? 'page' : undefined}
    className={`group flex rounded-lg border overflow-hidden no-underline transition-colors ${
      current ? 'border-ld-violet ring-2 ring-ld-lilac bg-white' : 'border-ld-frost bg-white hover:border-ld-violet/50'
    }`}
  >
    <Thumb src={course.thumbnailUrl} />
    <div className="flex-1 min-w-0 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ld-violet">{QA_COURSE_LEVEL_LABEL[course.level]}</span>
        {current ? (
          <span className="text-[10px] font-medium text-ld-violet">Sedang dipelajari</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tersedia</span>
        )}
      </div>
      <p className="m-0 mt-1 text-sm font-semibold leading-snug line-clamp-2 text-ld-onyx group-hover:text-ld-violet transition-colors">{course.title}</p>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ld-steel">
        <span className="inline-flex items-center gap-1"><Layers size={11} /> {course.moduleCount} modul · {course.articleCount + course.missionCount} lesson</span>
        <span className="inline-flex items-center gap-1"><Clock size={11} /> ±{course.estimatedHours} jam</span>
      </div>
    </div>
  </Link>
);

const ComingSoonRow: React.FC<(typeof COMING_SOON)[number]> = ({ level, title }) => (
  <div aria-disabled="true" className="flex rounded-lg border border-dashed border-ld-ash bg-white/60 overflow-hidden">
    <Thumb dim />
    <div className="flex-1 min-w-0 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-ld-fog">{level}</span>
        <span className="text-[10px] font-medium text-ld-fog">Segera hadir</span>
      </div>
      <p className="m-0 mt-1 text-sm font-semibold leading-snug text-ld-slate">{title}</p>
    </div>
  </div>
);

const CoursesDrawer: React.FC<{ open: boolean; onClose: () => void; currentSlug: string | null }> = ({ open, onClose, currentSlug }) => {
  const [state, setState] = useState<ListState>({ status: 'loading' });

  // Fetch on first open only; the list rarely changes within a session.
  useEffect(() => {
    if (!open || state.status === 'ready') return;
    let cancelled = false;
    fetchCourses()
      .then((courses) => { if (!cancelled) setState({ status: 'ready', courses }); })
      .catch(() => { if (!cancelled) setState({ status: 'error' }); });
    return () => { cancelled = true; };
  }, [open, state.status]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const courses = state.status === 'ready' ? state.courses : [];
  const upcoming = COMING_SOON.filter((p) => !courses.some((c) => c.slug === p.slug));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1050] bg-ld-onyx/40 font-ld-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="courses-drawer-title"
            className="absolute top-0 right-0 h-full w-full max-w-[440px] bg-ld-canvas shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 h-14 border-b border-ld-frost shrink-0">
              <h2 id="courses-drawer-title" className="m-0 text-base font-semibold text-ld-onyx">Pilih course</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
              {state.status === 'loading' && [0, 1, 2].map((i) => <div key={i} className="h-[96px] rounded-lg bg-ld-cloud animate-pulse" />)}
              {state.status === 'error' && (
                <div className="text-center py-10">
                  <p className="m-0 mb-3 text-sm text-ld-slate">Gagal memuat course.</p>
                  <button onClick={() => setState({ status: 'loading' })} className="px-4 py-2 rounded-lg bg-ld-violet text-white text-sm font-medium border-none cursor-pointer">Coba lagi</button>
                </div>
              )}
              {state.status === 'ready' && (
                <>
                  {courses.map((c) => <CourseRow key={c.id} course={c} current={c.slug === currentSlug} onPick={onClose} />)}
                  {upcoming.map((p) => <ComingSoonRow key={p.slug} {...p} />)}
                </>
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-ld-frost shrink-0">
              <Link to="/courses#course" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-medium text-ld-violet no-underline hover:underline">
                Lihat semua course <ArrowRight size={14} />
              </Link>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoursesDrawer;
