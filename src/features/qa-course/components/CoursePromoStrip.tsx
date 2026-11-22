import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import type { QaCourseSummary } from '../../../types/qaCourse';
import { fetchCourses } from '../lib/courseApi';

/**
 * Entry point to /courses from the QA Library index. Hidden until at least
 * one course is published, so the library never links to an empty page.
 */
const CoursePromoStrip: React.FC = () => {
  const [courses, setCourses] = useState<QaCourseSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCourses()
      .then((list) => { if (!cancelled) setCourses(list); })
      .catch(() => { /* optional strip: stay hidden */ });
    return () => { cancelled = true; };
  }, []);

  if (courses.length === 0) return null;
  const first = courses[0];
  const to = courses.length === 1 ? `/courses/${first.slug}` : '/courses';

  return (
    <Link
      to={to}
      className="group mb-8 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-xl border border-ld-violet/30 bg-white px-5 py-4 no-underline transition-colors hover:border-ld-violet"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-ld-lilac text-ld-violet shrink-0"><GraduationCap size={20} /></span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-ld-onyx">
          {courses.length === 1 ? `QA Course: ${first.title}` : `${courses.length} QA Course tersedia`}
        </span>
        <span className="block mt-0.5 text-[13px] text-ld-slate">
          Baru belajar QA? Ikuti artikel ini secara berurutan, praktik di QA Simulator, dan lulus dengan portfolio.
        </span>
      </span>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-ld-violet shrink-0">
        Lihat course <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};

export default CoursePromoStrip;
