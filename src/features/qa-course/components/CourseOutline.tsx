import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Lock } from 'lucide-react';
import { QaLibraryIcon, QaSimulatorIcon, FeedbackIcon } from '../../../components/illustration/ProductIcons';
import type { QaCourseDetail } from '../../../types/qaCourse';
import type { Checkpoint, Lesson } from '../lib/courseOutline';

interface CourseOutlineProps {
  course: QaCourseDetail;
  lessons: Lesson[];
  /** Highlights the lesson being read (lesson drawer). */
  activeIndex?: number;
  /** Guest clicked a lesson past the first: ask them to log in. */
  onLocked: (lesson: Lesson) => void;
  /** Called after any lesson link is followed (e.g. close a drawer). */
  onNavigate?: () => void;
  /** 'full' = detail page cards with module intros; 'compact' = lesson drawer. */
  variant?: 'full' | 'compact';
  /** Feedback checkpoints to show between lessons (logged-in learners). */
  checkpoints?: Checkpoint[];
  onOpenCheckpoint?: (checkpointId: string) => void;
  /**
   * Lesson to point out (detail page opened from a library preview's lock
   * card): its module opens and the row carries id "highlighted-lesson" so
   * the page can scroll to it. `highlightOn` = the ring is showing.
   */
  highlightIndex?: number;
  highlightOn?: boolean;
}

// A checkpoint sits between lessons: FeedbackIcon on its Honey tile (articles
// are Sky, missions dark), no lesson number, not
// counted in the module's x/y. Its state is in the meta line.
const CheckpointRow: React.FC<{ cp: Checkpoint; compact: boolean; first: boolean; onOpen?: (id: string) => void }> = ({ cp, compact, first, onOpen }) => {
  const meta = cp.state?.status === 'submitted' ? 'Checkpoint · terkirim, klik untuk ubah'
    : cp.state?.status === 'skipped' ? 'Checkpoint · dilewati, klik untuk isi'
      : cp.reached ? 'Checkpoint · belum diisi'
        : 'Checkpoint · terbuka setelah lesson sebelumnya';
  const open = Boolean(onOpen && cp.reached);
  const row = `flex items-center w-full text-left no-underline ${compact ? 'gap-2.5 px-3 py-2.5' : 'gap-3.5 px-5 sm:px-6 py-3.5'} ${first ? '' : 'border-t border-ld-frost'}`;
  const body = (
    <>
      <FeedbackIcon size={compact ? 24 : 32} className="shrink-0" />
      <span className="flex-1 min-w-0">
        <span className={`block leading-snug ${compact ? 'text-[13px]' : 'text-[15px]'} ${open ? 'text-ld-graphite' : 'text-ld-slate'}`}>{cp.flow?.title}</span>
        <span className={`block mt-0.5 text-ld-steel ${compact ? 'text-[11px]' : 'text-xs'}`}>{meta}</span>
      </span>
      {cp.state?.status === 'submitted' && <CheckCircle2 size={compact ? 15 : 17} className="text-emerald-600 shrink-0" aria-label="Terkirim" />}
    </>
  );
  return (
    <li>
      {open ? (
        <button type="button" onClick={() => onOpen?.(cp.item.id)} className={`${row} border-x-0 border-b-0 ${first ? 'border-t-0' : ''} bg-transparent cursor-pointer hover:bg-ld-cloud`}>
          {body}
        </button>
      ) : (
        <div className={row} aria-disabled="true">{body}</div>
      )}
    </li>
  );
};

// Brand product icons: an article lives in QA Library, a mission in QA
// Simulator. Missions sit on a dark Midnight tile (as in the course design)
// so practice rows stand out from the light reading rows.
const LessonTile: React.FC<{ lesson: Lesson; compact: boolean }> = ({ lesson, compact }) => {
  const size = compact ? 24 : 32;
  return lesson.kind === 'article' ? (
    <QaLibraryIcon size={size} className="shrink-0" />
  ) : (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center bg-ld-midnight shrink-0 ${compact ? 'w-6 h-6 rounded-md' : 'w-8 h-8 rounded-lg'}`}
    >
      <QaSimulatorIcon size={size} tile={false} />
    </span>
  );
};

// Compact (lesson sidebar/drawer) drops the text badges: the active row is
// already highlighted and the column is narrow.
const LessonStatus: React.FC<{ lesson: Lesson; loggedInView: boolean; compact: boolean }> = ({ lesson, loggedInView, compact }) => {
  const icon = compact ? 13 : 15;
  if (lesson.done) return <CheckCircle2 size={compact ? 15 : 17} className="text-emerald-600 shrink-0" aria-label="Selesai" />;
  if (lesson.lock === 'login') return <Lock size={icon} className="text-ld-steel shrink-0" aria-label="Perlu login" />;
  if (lesson.lock === 'sequence') return <Lock size={icon} className="text-ld-steel shrink-0" aria-label="Terkunci, selesaikan lesson sebelumnya" />;
  if (compact) return null;
  if (!loggedInView && lesson.index === 0) {
    return <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">Gratis</span>;
  }
  if (lesson.isNext) return <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-ld-lilac text-ld-graphite text-xs font-medium">Lanjut di sini</span>;
  return null;
};

/**
 * Course outline as a module accordion. Each module opens by default when it
 * holds the lesson the learner is on (or the next one to do); the learner can
 * open or close any module after that. Lessons past the next unfinished one
 * are locked and only open by finishing the lesson before them.
 */
const CourseOutline: React.FC<CourseOutlineProps> = ({
  course, lessons, activeIndex, onLocked, onNavigate, variant = 'full', checkpoints, onOpenCheckpoint, highlightIndex, highlightOn,
}) => {
  const compact = variant === 'compact';
  const focus = lessons.find((l) => l.index === activeIndex)
    ?? lessons.find((l) => l.index === highlightIndex)
    ?? lessons.find((l) => l.isNext);
  const highlightProps = (lesson: Lesson) => lesson.index === highlightIndex
    ? {
        id: 'highlighted-lesson',
        className: `scroll-mt-28 transition-[background-color,box-shadow] duration-700 ${highlightOn ? 'bg-ld-lilac/70 shadow-[inset_0_0_0_2px_var(--color-ld-violet)]' : ''}`,
      }
    : {};
  const defaultOpen = focus?.moduleIndex ?? 0;
  // Only explicit toggles are stored, so the default follows progress as it loads.
  const [toggled, setToggled] = useState<Record<number, boolean>>({});
  const isOpen = (mi: number) => toggled[mi] ?? mi === defaultOpen;
  const loggedInView = !lessons.some((l) => l.lock === 'login');

  return (
    <ol className={`m-0 p-0 list-none flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
      {course.modules.map((mod, mi) => {
        const moduleLessons = lessons.filter((l) => l.moduleIndex === mi);
        const doneCount = moduleLessons.filter((l) => l.done).length;
        const articleCount = moduleLessons.filter((l) => l.kind === 'article').length;
        const missionCount = moduleLessons.length - articleCount;
        const open = isOpen(mi);
        const panelId = `module-${mod.id}`;
        return (
          <li
            key={mod.id}
            className={`rounded-xl border bg-white overflow-hidden transition-colors duration-300 ${open ? 'border-ld-lavender' : 'border-ld-ash'}`}
          >
            <button
              type="button"
              onClick={() => setToggled((t) => ({ ...t, [mi]: !open }))}
              aria-expanded={open}
              aria-controls={panelId}
              className={`w-full flex items-center justify-between gap-3 text-left border-none cursor-pointer transition-colors duration-300 ${
                open ? 'bg-ld-cloud' : 'bg-white hover:bg-ld-cloud'
              } ${compact ? 'px-3 py-2.5' : 'px-5 sm:px-6 py-5'}`}
            >
              <span className="min-w-0">
                <span className={`flex items-center gap-2 font-medium uppercase tracking-[0.06em] text-ld-steel ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  Modul {mi + 1}
                  {/* Progress only for signed-in learners: "0/4" reads as failure
                      to a first-time visitor. The dot is its own flex item so the
                      gap is equal on both sides. */}
                  {loggedInView && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="normal-case tracking-normal tabular-nums">{doneCount}/{moduleLessons.length}</span>
                    </>
                  )}
                </span>
                <span className={`block font-semibold tracking-[-0.01em] text-ld-graphite ${compact ? 'mt-0.5 text-[13px]' : 'mt-1 text-xl'}`}>{mod.title}</span>
                {!compact && (
                  <span className="block mt-1 text-sm text-ld-slate leading-relaxed">
                    {articleCount} artikel{missionCount ? ` · ${missionCount} misi praktik` : ''}
                  </span>
                )}
              </span>
              <span
                aria-hidden="true"
                className={`flex items-center justify-center shrink-0 rounded-lg border border-ld-ash bg-white text-ld-graphite ${compact ? 'w-7 h-7' : 'w-11 h-11'}`}
              >
                <ChevronDown size={compact ? 15 : 18} className={`transition-transform duration-300 ease-out ${open ? 'rotate-180 text-ld-violet' : ''}`} />
              </span>
            </button>

            {/* Smooth expand/collapse, same technique as FaqAccordion: a CSS
                grid-rows 0fr → 1fr transition animates the real height
                without measuring. Collapsed content stays mounted but inert
                (not focusable, hidden from assistive tech). */}
            <div
              id={panelId}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className={`min-h-0 overflow-hidden transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}>
                {!compact && mod.intro && (
                  <p className="m-0 px-5 sm:px-6 pb-4 bg-ld-cloud text-sm text-ld-slate leading-relaxed">{mod.intro}</p>
                )}
                <ul className="m-0 p-0 list-none border-t border-ld-frost">
                  {mod.items.map((modItem, li) => {
                    if (modItem.kind === 'feedback') {
                      const cp = checkpoints?.find((c) => c.item.id === modItem.id);
                      return cp?.flow ? <CheckpointRow key={modItem.id} cp={cp} compact={compact} first={li === 0} onOpen={onOpenCheckpoint} /> : null;
                    }
                    const lesson = moduleLessons.find((l) => l.item.id === modItem.id);
                    if (!lesson) return null;
                    const active = lesson.index === activeIndex;
                    const row = `flex items-center w-full text-left no-underline ${compact ? 'gap-2.5 px-3 py-2.5' : 'gap-3.5 px-5 sm:px-6 py-3.5'} ${
                      li > 0 ? 'border-t border-ld-frost' : ''
                    }`;
                    const body = (
                      <>
                        <LessonTile lesson={lesson} compact={compact} />
                        <span className="flex-1 min-w-0">
                          <span className={`block leading-snug ${compact ? 'text-[13px]' : 'text-[15px]'} ${active || lesson.kind === 'mission' ? 'font-semibold' : ''} ${lesson.lock ? 'text-ld-slate' : 'text-ld-graphite'}`}>
                            {lesson.title}
                          </span>
                          {lesson.meta && <span className={`block mt-0.5 text-ld-steel ${compact ? 'text-[11px]' : 'text-xs'}`}>{lesson.meta}</span>}
                          {!lesson.available && <span className="block mt-0.5 text-xs text-amber-700">Sedang tidak tersedia</span>}
                        </span>
                        {lesson.index === highlightIndex && !compact && (
                          <span className="hidden sm:inline shrink-0 text-xs font-medium text-ld-graphite">Kamu baca preview ini</span>
                        )}
                        <LessonStatus lesson={lesson} loggedInView={loggedInView} compact={compact} />
                      </>
                    );

                    if (!lesson.available || lesson.lock === 'sequence') {
                      return (
                        <li key={lesson.item.id} {...highlightProps(lesson)}>
                          <div
                            className={`${row} cursor-not-allowed`}
                            aria-disabled="true"
                            title={lesson.lock === 'sequence' ? 'Terbuka setelah kamu menyelesaikan lesson sebelumnya' : undefined}
                          >
                            {body}
                          </div>
                        </li>
                      );
                    }
                    if (lesson.lock === 'login') {
                      return (
                        <li key={lesson.item.id} {...highlightProps(lesson)}>
                          <button type="button" onClick={() => onLocked(lesson)} className={`${row} border-x-0 border-b-0 bg-transparent cursor-pointer hover:bg-ld-cloud`}>
                            {body}
                          </button>
                        </li>
                      );
                    }
                    return (
                      <li key={lesson.item.id} {...highlightProps(lesson)}>
                        <Link
                          to={lesson.href}
                          onClick={onNavigate}
                          aria-current={active ? 'step' : undefined}
                          className={`${row} transition-colors ${active ? 'bg-ld-lilac/60' : 'hover:bg-ld-cloud'}`}
                        >
                          {body}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default CourseOutline;
