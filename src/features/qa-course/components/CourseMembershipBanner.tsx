import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';
import type { QaCourseMembership } from '../../../types/qaCourse';
import { fetchCoursesForArticle } from '../lib/courseApi';
import { articleLessonHref } from '../lib/courseOutline';

/**
 * Shown on an article opened outside a course: "this is lesson N of course X",
 * with a link that reopens the same article in course mode. Renders nothing
 * when the article belongs to no published course.
 */
const CourseMembershipBanner: React.FC<{ articleId: string; articleSlug: string }> = ({ articleId, articleSlug }) => {
  const [result, setResult] = useState<{ articleId: string; memberships: QaCourseMembership[] } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCoursesForArticle(articleId).then((memberships) => {
      if (!cancelled) setResult({ articleId, memberships });
    });
    return () => { cancelled = true; };
  }, [articleId]);

  const memberships = result?.articleId === articleId ? result.memberships : [];
  if (memberships.length === 0) return null;

  // Phones: icon + stacked text (label, course, lesson), the link on its own
  // row under a divider. sm+: one row, link on the right.
  return (
    <div className="flex flex-col gap-2 mb-6">
      {memberships.map((m) => (
        <div key={m.slug} className="rounded-xl border border-ld-frost bg-ld-cloud/60 sm:flex sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
          <div className="flex items-start sm:items-center gap-3 px-4 pt-3.5 pb-3 sm:p-0 min-w-0">
            <span aria-hidden="true" className="shrink-0 w-9 h-9 rounded-lg bg-white border border-ld-frost flex items-center justify-center text-ld-violet">
              <GraduationCap size={18} />
            </span>
            <p className="m-0 min-w-0 text-sm leading-snug">
              <span className="block text-xs text-ld-steel sm:inline sm:text-sm sm:text-ld-graphite">Bagian dari course </span>
              <Link to={`/courses/${m.slug}`} className="font-semibold text-ld-onyx no-underline hover:text-ld-violet">{m.title}</Link>
              <span className="block mt-0.5 text-xs text-ld-steel sm:inline sm:mt-0 sm:text-sm sm:text-ld-fog">
                <span className="hidden sm:inline"> · </span>Lesson {m.lessonNumber} dari {m.totalLessons}
              </span>
            </p>
          </div>
          <Link
            to={articleLessonHref(m.slug, articleSlug)}
            className="flex sm:inline-flex items-center justify-between sm:justify-start gap-1 px-4 py-2.5 sm:p-0 border-t border-ld-frost sm:border-0 text-sm font-medium text-ld-violet no-underline shrink-0 hover:underline"
          >
            Baca dalam mode course <ArrowRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CourseMembershipBanner;
