import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import DashboardCard from '../../admin/components/shared/DashboardCard';
import DashboardBanner from '../../admin/components/shared/DashboardBanner';
import { CARD_ACTION_PRIMARY } from '../../admin/components/shared/DashboardCardHeader';
import { QaCourseIcon } from '../../../components/illustration/ProductIcons';
import { QA_COURSE_LEVEL_LABEL } from '../../../types/qaCourse';
import { courseCompletion, nextLesson } from '../lib/courseOutline';
import { useLearnerCourses } from '../hooks/useLearnerCourses';
import { COMING_SOON } from './landing/content';
import CourseBannerIllustration from './CourseBannerIllustration';
import { CourseLevelIcon } from '../../../components/illustration/CourseLevelIcons';

const LEVEL_STYLE = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
} as const;

// Dashboard menu "QA Course": the learner's progress per published course and
// a jump straight to the next lesson. Same layout as the QA Simulator tab
// (banner, then one block per item with a progress bar and step chips).
const CourseDashboardTab: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const { rows, error } = useLearnerCourses(token);

  if (error) return <p className="text-sm text-red-500 m-0 p-4">{error}</p>;
  if (!rows) return <LoadingState label="Memuat course…" />;

  const upcoming = COMING_SOON.filter((p) => !rows.some((r) => r.course.slug === p.slug)).map((p) => p.title);

  return (
    <div className="space-y-5">
      <DashboardBanner
        title="Belajar QA terstruktur, lulus bawa portfolio"
        description="Baca materi singkat, praktik di QA Simulator, lalu kumpulkan hasil kerjamu jadi portfolio."
        illustration={<CourseBannerIllustration />}
      />

      <DashboardCard
        icon={<QaCourseIcon size={44} />}
        eyebrow="QA Course"
        title="Course Saya"
        actions={<span className="text-sm text-ld-slate">{rows.length} course tersedia</span>}
      >
        {rows.length === 0 ? (
          <p className="text-sm text-ld-fog m-0">
            Belum ada course yang tersedia. <Link to="/courses" className="text-ld-violet">Lihat QA Course</Link>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map(({ course, lessons }) => {
              const completion = courseCompletion(lessons);
              const started = completion.done > 0;
              const target = nextLesson(lessons);
              const ctaHref = completion.allDone ? `/courses/${course.slug}/selesai` : started && target ? target.href : `/courses/${course.slug}`;
              const ctaLabel = completion.allDone ? 'Lihat hasil' : started ? 'Lanjutkan' : 'Mulai';
              return (
                <div key={course.id} className="rounded-xl border border-ld-frost overflow-hidden">
                  {/* Header strip, same pattern as the QA Simulator tab. */}
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-ld-cloud/60 border-b border-ld-frost">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${LEVEL_STYLE[course.level]}`}>{QA_COURSE_LEVEL_LABEL[course.level]}</span>
                      <span className="text-xs text-ld-ash shrink-0">|</span>
                      <span className="inline-flex items-center gap-1 text-xs text-ld-slate truncate"><Clock size={12} className="shrink-0" /> ±{course.estimatedHours} jam · {lessons.length} lesson</span>
                    </div>
                    <span className="text-xs font-semibold text-ld-violet tabular-nums shrink-0">{completion.percent}%</span>
                  </div>

                  <div className="p-3.5 md:p-4">
                    <div className="flex items-center gap-3">
                      <CourseLevelIcon level={course.level} size={48} className="shrink-0" />
                      <div className="min-w-0">
                        <Link to={`/courses/${course.slug}`} className="text-base font-semibold leading-snug text-ld-onyx no-underline hover:text-ld-violet">{course.title}</Link>
                        <p className="m-0 mt-0.5 text-xs text-ld-steel line-clamp-2 sm:line-clamp-1">{course.description}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-ld-slate">{completion.done}/{completion.total} lesson selesai</span>
                        <span className="font-semibold text-ld-violet tabular-nums">{completion.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-ld-frost overflow-hidden">
                        <div className="h-full rounded-full bg-ld-violet transition-all" style={{ width: `${completion.percent}%` }} />
                      </div>
                    </div>

                    <ol className="m-0 mt-4 p-0 list-none grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {course.modules.map((mod, mi) => {
                        const moduleLessons = lessons.filter((l) => l.moduleIndex === mi);
                        const done = moduleLessons.filter((l) => l.done).length;
                        const complete = moduleLessons.length > 0 && done === moduleLessons.length;
                        return (
                          <li key={mod.id} className={`rounded-lg border px-3 py-2.5 flex items-center gap-2.5 ${complete ? 'border-emerald-200 bg-emerald-50/50' : 'border-ld-frost'}`}>
                            {complete ? <CheckCircle2 size={17} className="text-emerald-500 shrink-0" /> : <Circle size={17} className="text-ld-ash shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <p className="m-0 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Modul {mi + 1}</p>
                              <p className="m-0 text-sm font-medium text-ld-onyx truncate">{mod.title}</p>
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-ld-slate">{done}/{moduleLessons.length}</span>
                          </li>
                        );
                      })}
                    </ol>

                    <div className="mt-4 pt-3.5 border-t border-ld-frost/70 flex items-center justify-between gap-3">
                      <span className="text-xs text-ld-fog truncate">
                        {completion.allDone ? 'Course selesai, portfolio siap dibagikan' : started && target ? `Berikutnya: ${target.title}` : 'Belum dimulai'}
                      </span>
                      <Link to={ctaHref} className={`${CARD_ACTION_PRIMARY} shrink-0`}>
                        {ctaLabel} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {upcoming.length > 0 && <p className="m-0 mt-4 text-xs text-ld-fog">Segera hadir: {upcoming.join(', ')}.</p>}
      </DashboardCard>
    </div>
  );
};

export default CourseDashboardTab;
