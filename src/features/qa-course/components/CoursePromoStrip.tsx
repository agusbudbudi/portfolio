import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { QaCourseIcon } from '../../../components/illustration/ProductIcons';
import type { QaCourseSummary } from '../../../types/qaCourse';
import { fetchCourses } from '../lib/courseApi';

const DEFAULT_BODY = 'Baru belajar QA? Ikuti artikel ini secara berurutan, praktik di QA Simulator, dan lulus dengan portfolio.';

/**
 * Entry point to /courses from the QA Library and QA Simulator indexes.
 * Hidden until at least one course is published, so it never links to an
 * empty page. `body` tailors the pitch per page; `className` sets spacing.
 */
const CoursePromoStrip: React.FC<{ body?: string; className?: string }> = ({ body = DEFAULT_BODY, className = 'mb-8' }) => {
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
      className={`group ${className} flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-xl border border-ld-violet/30 bg-white px-5 py-4 no-underline transition-colors hover:border-ld-violet`}
    >
      <QaCourseIcon size={40} className="shrink-0" />
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold text-ld-onyx">
          {courses.length === 1 ? `QA Course: ${first.title}` : `${courses.length} QA Course tersedia`}
        </span>
        <span className="block mt-0.5 text-[13px] text-ld-slate">
          {body}
        </span>
      </span>
      <span className="inline-flex items-center gap-1 text-sm font-medium text-ld-violet shrink-0">
        Lihat course <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};

export default CoursePromoStrip;
