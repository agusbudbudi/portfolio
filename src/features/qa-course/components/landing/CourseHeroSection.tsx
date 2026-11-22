import React from 'react';
import { Link } from 'react-router-dom';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import type { QaCourseSummary } from '../../../../types/qaCourse';
import { useCourse } from '../../hooks/useCourse';
import { nextLesson } from '../../lib/courseOutline';

// "Lanjutkan belajar" strip for a signed-in learner who has started (but not
// finished) a course. v1 has one course, so it tracks the first listed one.
const ContinueCard: React.FC<{ slug: string }> = ({ slug }) => {
  const { course, lessons, completion, loggedIn, progressLoaded } = useCourse(slug);
  if (!loggedIn || !progressLoaded || !course) return null;
  if (completion.done === 0 || completion.allDone) return null;
  const target = nextLesson(lessons);
  if (!target) return null;

  return (
    <div className="mt-6 md:mt-8">
      <div className="rounded-xl border border-ld-ash bg-white px-5 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 shadow-[0_3px_7px_rgba(39,40,53,0.05)]">
        <div className="flex flex-col gap-2 flex-[1_1_320px] min-w-0">
          <p className="m-0 text-[13px] text-ld-steel">Lanjutkan belajar</p>
          <p className="m-0 text-[17px] font-semibold text-ld-graphite">
            {course.title} · Modul {target.moduleIndex + 1} dari {course.modules.length}, lesson {target.index + 1} dari {lessons.length}
          </p>
          <div
            className="h-1.5 max-w-[420px] rounded-full bg-ld-frost overflow-hidden"
            role="progressbar"
            aria-label={`Progress ${course.title}`}
            aria-valuenow={completion.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-ld-violet" style={{ width: `${completion.percent}%` }} />
          </div>
        </div>
        <Link
          to={target.href}
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-[15px] font-medium no-underline transition-colors"
        >
          Lanjutkan →
        </Link>
      </div>
    </div>
  );
};

// Compact hero (design: canvas "QA Course" › 1. Daftar course): eyebrow,
// two-tone headline, one line of copy, brand pixel mosaic top-right. The
// course list right below is the call to action.
const CourseHeroSection: React.FC<{ courses: QaCourseSummary[] | null }> = ({ courses }) => (
  <>
    <section className="relative overflow-hidden">
      <PixelMosaic
        variant="blue"
        className="!hidden md:!grid absolute top-24 right-6 lg:right-14"
        style={{ width: 'min(28%, 220px)' }}
      />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-28 md:pt-[136px] pb-14 md:pb-20">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-xs font-medium uppercase tracking-[0.06em] text-ld-steel">QA Course</p>
          <h1 className="m-0 max-w-[760px] text-[40px] sm:text-[56px] leading-none tracking-[-0.025em] font-semibold text-ld-graphite">
            Course QA Engineer <span className="text-ld-violet">yang lulusannya bawa portfolio.</span>
          </h1>
          <p className="m-0 max-w-[620px] text-base sm:text-lg leading-[1.55] text-ld-slate">
            Jalur belajar software testing dari artikel QA Library dan misi QA Simulator. Hasilnya test case, bug report,
            dan analisis PRD yang bisa kamu bagikan.
          </p>
        </div>
        {/* Inside the hero so its bottom padding sits under the card when shown. */}
        {courses && courses.length > 0 && <ContinueCard slug={courses[0].slug} />}
      </div>
    </section>
  </>
);

export default CourseHeroSection;
