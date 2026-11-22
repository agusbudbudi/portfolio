import React from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { QaCourseIcon } from '../../../../components/illustration/ProductIcons';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { useLearnerCourses } from '../../hooks/useLearnerCourses';
import { pickHeroCourse } from '../../lib/heroCourse';

// Mobile: content stacks and the CTA goes full width; sm+: one row.
const CARD = 'rounded-xl border bg-white p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 shadow-[0_3px_7px_rgba(39,40,53,0.05)]';
const PRIMARY = 'inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-lg text-white text-[15px] font-medium no-underline transition-colors';

const ProgressBar: React.FC<{ percent: number; label: string; color: string }> = ({ percent, label, color }) => (
  <div
    className="h-1.5 w-full sm:max-w-[420px] rounded-full bg-ld-frost overflow-hidden"
    role="progressbar"
    aria-label={label}
    aria-valuenow={percent}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
  </div>
);

// Signed-in learner's card under the hero (pickHeroCourse): "Lanjutkan
// belajar" for a course in progress, which always wins, else a graduation
// card for a finished course. Nothing for guests or before lesson 1 is done.
const LearnerCourseCard: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const { rows } = useLearnerCourses(token);
  const hero = token && rows ? pickHeroCourse(rows) : null;
  if (!hero) return null;
  const { course, completion } = hero;

  if (hero.kind === 'in-progress') {
    const { target } = hero;
    return (
      <div className="mt-6 md:mt-8">
        <div className={`${CARD} border-ld-ash`}>
          <div className="flex flex-col gap-2 sm:flex-[1_1_320px] min-w-0">
            <p className="m-0 text-[13px] text-ld-steel">Lanjutkan belajar</p>
            <p className="m-0 text-[17px] font-semibold text-ld-graphite leading-snug">
              {course.title}
              <span className="block sm:inline text-sm sm:text-[17px] font-normal sm:font-semibold text-ld-slate sm:text-ld-graphite">
                <span className="hidden sm:inline"> · </span>Modul {target.moduleIndex + 1} dari {course.modules.length}, lesson {target.index + 1} dari {hero.lessons.length}
              </span>
            </p>
            <ProgressBar percent={completion.percent} label={`Progress ${course.title}`} color="bg-ld-violet" />
          </div>
          <Link to={target.href} className={`${PRIMARY} bg-ld-violet hover:bg-[#1f87e6]`}>
            Lanjutkan →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 md:mt-8">
      <div className={`${CARD} border-emerald-200`}>
        <div className="flex items-center gap-3 sm:gap-4 sm:flex-[1_1_320px] min-w-0">
          <QaCourseIcon size={44} className="shrink-0" />
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <p className="m-0 inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
              <PartyPopper size={14} /> Kamu sudah lulus
            </p>
            <p className="m-0 text-[17px] font-semibold text-ld-graphite leading-snug">
              {course.title}
              <span className="block sm:inline text-sm sm:text-[17px] font-normal sm:font-semibold text-ld-slate sm:text-ld-graphite">
                <span className="hidden sm:inline"> · </span>{completion.total} lesson selesai
              </span>
            </p>
            <ProgressBar percent={100} label={`Progress ${course.title}`} color="bg-emerald-500" />
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center gap-2.5 sm:gap-3">
          {hero.otherCourses > 0 && (
            <a
              href="#course"
              className="inline-flex w-full sm:w-auto items-center justify-center px-5 py-3 rounded-lg border border-ld-ash bg-white text-ld-graphite text-[15px] font-medium no-underline hover:border-ld-steel transition-colors"
            >
              Pilih course berikutnya
            </a>
          )}
          <Link to={`/courses/${course.slug}/selesai`} className={`${PRIMARY} bg-emerald-600 hover:bg-emerald-700`}>
            Lihat hasil kelulusan →
          </Link>
        </div>
      </div>
    </div>
  );
};

// Compact hero (design: canvas "QA Course" › 1. Daftar course): eyebrow,
// two-tone headline, one line of copy, brand pixel mosaic
// top-right (smaller and fainter on mobile). The course list right below is
// the call to action.
const CourseHeroSection: React.FC = () => (
  <>
    <section className="relative overflow-hidden">
      <PixelMosaic
        variant="blue"
        className="absolute top-[72px] right-3 opacity-40 md:opacity-100 md:top-24 md:right-6 lg:right-14 w-[24%] max-w-[220px] md:w-[28%]"
      />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-24 md:pt-[136px] pb-12 md:pb-20">
        <div className="flex flex-col gap-4">
          <p className="m-0 text-xs font-medium uppercase tracking-[0.06em] text-ld-steel">QA Course</p>
          <h1 className="m-0 max-w-[760px] text-[34px] sm:text-[48px] md:text-[56px] leading-[1.08] md:leading-none tracking-[-0.025em] font-semibold text-ld-graphite">
            Course QA Engineer <span className="text-ld-violet">yang lulusannya bawa portfolio.</span>
          </h1>
          <p className="m-0 max-w-[620px] text-base sm:text-lg leading-[1.55] text-ld-slate">
            Jalur belajar software testing dari artikel QA Library dan misi QA Simulator. Hasilnya test case, bug report,
            dan analisis PRD yang bisa kamu bagikan.
          </p>
        </div>
        {/* Inside the hero so its bottom padding sits under the card when shown. */}
        <LearnerCourseCard />
      </div>
    </section>
  </>
);

export default CourseHeroSection;
