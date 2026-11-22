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

  return (
    <div className="flex flex-col gap-2 mb-6">
      {memberships.map((m) => (
        <div key={m.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-ld-frost bg-ld-cloud/60">
          <p className="m-0 flex items-center gap-2.5 text-sm text-ld-graphite min-w-0">
            <GraduationCap size={17} className="text-ld-violet shrink-0" aria-hidden="true" />
            <span>
              Bagian dari course <Link to={`/courses/${m.slug}`} className="font-semibold text-ld-onyx no-underline hover:text-ld-violet">{m.title}</Link>
              <span className="text-ld-fog"> · lesson {m.lessonNumber} dari {m.totalLessons}</span>
            </span>
          </p>
          <Link
            to={articleLessonHref(m.slug, articleSlug)}
            className="inline-flex items-center gap-1 text-sm font-medium text-ld-violet no-underline shrink-0 hover:underline"
          >
            Baca dalam mode course <ArrowRight size={14} />
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CourseMembershipBanner;
