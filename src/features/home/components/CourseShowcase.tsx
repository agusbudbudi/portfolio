import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { BookOpen, Check, Clock, FlaskConical, Link2, Lock, PartyPopper } from 'lucide-react';
import { QaCourseIcon, QaPortfolioIcon } from '../../../components/illustration/ProductIcons';
import { fetchCourses } from '../../qa-course/lib/courseApi';
import { QA_COURSE_LEVEL_LABEL, type QaCourseSummary } from '../../../types/qaCourse';

// Home "QA Course" row art, same grammar as the other showcases: three
// stacked, non-overlapping pieces (course card left → lesson path full width
// → graduation card right). One course told in ~3s: lessons tick off in
// order (Belajar, Praktik), the next one pulses, the progress ring fills,
// then the "Lulus" card pops in with the portfolio link. Uses the first
// published course when the API answers; neutral fallback copy otherwise.
// Plays once on mount (mounted when scrolled into view). Decorative only.

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

type LessonState = 'done' | 'next' | 'locked';
const LESSONS: { kind: 'Belajar' | 'Praktik'; title: string; state: LessonState }[] = [
  { kind: 'Belajar', title: 'Membaca PRD seperti QA', state: 'done' },
  { kind: 'Praktik', title: 'Misi: temukan gap requirement', state: 'done' },
  { kind: 'Belajar', title: 'Teknik test design dasar', state: 'done' },
  { kind: 'Praktik', title: 'Misi: tulis test case', state: 'next' },
  { kind: 'Belajar', title: 'Bug report yang jelas', state: 'locked' },
];
const DONE = LESSONS.filter((l) => l.state === 'done').length;
const PCT = Math.round((DONE / LESSONS.length) * 100);
const TICK = 0.75; // first tick delay
const STEP = 0.32; // between ticks

const RING_R = 17;
const RING_C = 2 * Math.PI * RING_R;

const CourseShowcase: React.FC = () => {
  const reduce = !!useReducedMotion();
  const [course, setCourse] = useState<QaCourseSummary | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCourses()
      .then((list) => { if (alive) setCourse(list.find((c) => c.status === 'published') ?? list[0] ?? null); })
      .catch(() => { /* decorative: keep fallback copy */ });
    return () => { alive = false; };
  }, []);

  const title = course?.title ?? 'Junior QA Ready';
  const level = course ? QA_COURSE_LEVEL_LABEL[course.level] : 'Pemula';
  const lessons = course ? course.articleCount + course.missionCount : 12;
  const hours = course?.estimatedHours ?? 8;

  return (
    <motion.div
      aria-hidden="true"
      className="relative w-full max-w-[520px] mx-auto flex flex-col gap-7 py-6 select-none font-ld-sans"
      initial={reduce ? 'show' : 'hidden'}
      animate="show"
    >
      {/* course card — left */}
      <motion.div variants={rise(0.05)} className={`relative z-[1] w-[80%] rounded-xl bg-white border border-ld-frost p-3 flex items-center gap-3 ${SHADOW}`}>
        <QaCourseIcon size={40} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="inline-block px-1.5 py-0.5 rounded bg-ld-lilac text-ld-violet text-[8.5px] font-semibold uppercase tracking-widest">{level}</span>
          <p className="m-0 mt-1 text-[12.5px] font-semibold text-ld-onyx leading-snug truncate">{title}</p>
          <p className="m-0 mt-0.5 flex items-center gap-1.5 text-[9px] text-ld-slate">
            <span>{lessons} lesson</span><span className="text-ld-ash">•</span>
            <span className="inline-flex items-center gap-0.5"><Clock size={9} /> {hours} jam</span>
          </p>
        </div>
        {/* progress ring */}
        <div className="relative w-11 h-11 shrink-0">
          <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
            <circle cx="20" cy="20" r={RING_R} fill="none" stroke="var(--color-ld-frost)" strokeWidth="4" />
            <motion.circle
              cx="20" cy="20" r={RING_R} fill="none" stroke="var(--color-ld-violet)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={RING_C}
              initial={{ strokeDashoffset: reduce ? RING_C * (1 - PCT / 100) : RING_C }}
              animate={{ strokeDashoffset: RING_C * (1 - PCT / 100) }}
              transition={{ duration: 1.1, ease: EASE, delay: TICK }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-ld-mono text-[9.5px] font-semibold text-ld-onyx">{PCT}%</span>
        </div>
      </motion.div>

      {/* lesson path — full width */}
      <motion.div variants={rise(0.35, 26)} className={`relative z-[1] w-full rounded-xl bg-white border border-ld-frost p-3.5 ${SHADOW}`}>
        <div className="flex items-center justify-between">
          <p className="m-0 text-[10px] font-semibold text-ld-onyx">Modul 1 · Dari PRD ke test case</p>
          <span className="font-ld-mono text-[9px] text-ld-fog">{DONE}/{LESSONS.length}</span>
        </div>
        <ol className="relative m-0 mt-2.5 p-0 list-none">
          {/* rail */}
          {/* rows are equal height, so dot centres sit at 10%, 30%, ... of the list */}
          <span className="absolute left-[11px] top-[10%] bottom-[10%] w-0.5 rounded-full bg-ld-frost" />
          <motion.span
            className="absolute left-[11px] top-[10%] w-0.5 rounded-full bg-emerald-500 origin-top"
            style={{ height: `${(DONE * 100) / LESSONS.length}%` }}
            initial={{ scaleY: reduce ? 1 : 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: STEP * DONE, ease: 'linear', delay: TICK }}
          />
          {LESSONS.map((l, i) => {
            const KindIcon = l.kind === 'Belajar' ? BookOpen : FlaskConical;
            const at = TICK + i * STEP;
            return (
              <li key={l.title} className="relative flex items-center gap-2.5 py-1">
                {/* status dot */}
                <span className="relative z-[1] w-6 h-6 shrink-0 flex items-center justify-center">
                  {l.state === 'done' && (
                    <>
                      <span className="absolute inset-0 rounded-full bg-white border-2 border-ld-frost" />
                      <motion.span
                        className="absolute inset-0 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                        initial={reduce ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 16, delay: at }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </motion.span>
                    </>
                  )}
                  {l.state === 'next' && (
                    <>
                      <motion.span
                        className="absolute inset-0 rounded-full bg-ld-violet/25"
                        animate={reduce ? undefined : { scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ duration: 1.6, repeat: Infinity, delay: at }}
                      />
                      <span className="relative w-6 h-6 rounded-full bg-ld-violet border-[5px] border-ld-lavender" />
                    </>
                  )}
                  {l.state === 'locked' && (
                    <span className="w-6 h-6 rounded-full bg-ld-cloud border border-ld-frost text-ld-fog flex items-center justify-center"><Lock size={10} /></span>
                  )}
                </span>
                {/* row */}
                <span
                  className={`flex-1 min-w-0 flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                    l.state === 'next' ? 'bg-ld-lilac border border-ld-lavender' : 'border border-transparent'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider ${
                      l.kind === 'Belajar' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    } ${l.state === 'locked' ? 'opacity-50' : ''}`}
                  >
                    <KindIcon size={9} /> {l.kind}
                  </span>
                  <span className={`text-[10.5px] truncate ${l.state === 'locked' ? 'text-ld-fog' : 'text-ld-graphite'} ${l.state === 'next' ? 'font-semibold text-ld-onyx' : ''}`}>
                    {l.title}
                  </span>
                  {l.state === 'next' && (
                    <motion.span
                      variants={pop(TICK + DONE * STEP + 0.1)}
                      className="ml-auto shrink-0 px-2 py-0.5 rounded-md bg-ld-violet text-white text-[8.5px] font-semibold"
                    >
                      Lanjut
                    </motion.span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </motion.div>

      {/* graduation — right */}
      <motion.div variants={pop(TICK + DONE * STEP + 0.6)} className={`relative z-[1] w-[70%] self-end origin-top-right rounded-xl bg-white border border-ld-frost p-3 ${SHADOW}`}>
        {/* confetti */}
        {!reduce && [
          { x: -10, y: -8, c: 'bg-ld-violet', d: 0 },
          { x: 18, y: -14, c: 'bg-emerald-500', d: 0.08 },
          { x: 'calc(100% - 4px)', y: -10, c: 'bg-amber-400', d: 0.04 },
          { x: 'calc(100% + 6px)', y: 14, c: 'bg-ld-violet', d: 0.12 },
        ].map((p, i) => (
          <motion.span
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-sm ${p.c}`}
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 1], scale: [0, 1.2, 1], rotate: 45 }}
            transition={{ duration: 0.6, delay: TICK + DONE * STEP + 0.8 + p.d }}
          />
        ))}
        <div className="flex items-center gap-2.5">
          <QaPortfolioIcon size={34} className="shrink-0" />
          <div className="min-w-0">
            <p className="m-0 flex items-center gap-1 text-[10.5px] font-semibold text-ld-onyx">
              Lulus! <PartyPopper size={11} className="text-amber-500" />
            </p>
            <p className="m-0 mt-0.5 text-[9px] text-ld-slate leading-snug">Portfolio studi kasus siap dibagikan</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-ld-cloud border border-ld-frost px-2 py-1.5">
          <Link2 size={10} className="text-ld-violet shrink-0" />
          <span className="font-ld-mono text-[8.5px] text-ld-graphite truncate">mentorqa.com/portfolio/kamu</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourseShowcase;
