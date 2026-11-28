import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Lock } from 'lucide-react';
import { track } from '../../../lib/analytics';
import type { QaLibraryArticlePreview } from '../../../types/qaLibrary';
import type { QaCourseMembership } from '../../../types/qaCourse';
import { useCourse } from '../hooks/useCourse';
import { courseLessonAnchorHref } from '../lib/courseOutline';
import CourseLockIllustration from '../../../components/illustration/CourseLockIllustration';

interface ArticlePreviewLockProps {
  articleId: string;
  articleSlug: string;
  preview: QaLibraryArticlePreview;
}

/**
 * The end of a course-only article read from the library: what's locked and
 * a way into the course that has the rest. The main CTA opens the lesson
 * directly when the reader may open it now (lesson 1, or a learner whose
 * earlier lessons are done); otherwise it goes to the course page with this
 * lesson highlighted, so a guest meets one step instead of a login wall
 * followed by a sequence lock.
 */
const ArticlePreviewLock: React.FC<ArticlePreviewLockProps> = ({ articleId, articleSlug, preview }) => {
  const [primary, ...others] = preview.courses;
  const { course, lessons, progressLoaded } = useCourse(primary?.slug);
  const cardRef = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);
  const [inView, setInView] = useState(false);

  const lesson = lessons.find((l) => l.item.kind === 'article' && l.item.articleId === articleId);
  const canOpenLesson = Boolean(progressLoaded && lesson && lesson.available && lesson.lock === null);
  const primaryHref = canOpenLesson && lesson ? lesson.href : primary ? courseLessonAnchorHref(primary.slug, articleSlug) : '/courses';
  const percent = Math.round(preview.previewWordRatio * 100);

  const baseProps = (m: QaCourseMembership) => ({
    article_slug: articleSlug,
    course_slug: m.slug,
    lesson_number: m.lessonNumber,
  });

  useEffect(() => {
    if (primary) track('article_preview_viewed', baseProps(primary));
    // Once per article view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let reported = false;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting) {
        setSeen(true);
        if (!reported && primary) {
          reported = true;
          track('article_lock_reached', { ...baseProps(primary), preview_word_ratio: preview.previewWordRatio });
        }
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId]);

  if (!primary) return null;

  const onCta = (m: QaCourseMembership, isPrimary: boolean, target: 'lesson' | 'course_detail') => () =>
    track('article_lock_cta_clicked', { ...baseProps(m), target, is_primary: isPrimary });
  const primaryTarget = canOpenLesson ? 'lesson' : 'course_detail';

  const articleCount = lessons.filter((l) => l.kind === 'article').length;
  const missionCount = lessons.length - articleCount;

  return (
    <>
      <section
        ref={cardRef}
        aria-labelledby="preview-lock-title"
        className="mt-5 rounded-2xl border border-ld-ash bg-white p-5 sm:p-7 flex flex-col gap-5 shadow-[0_12px_32px_-12px_rgba(39,40,53,0.18)]"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-center">
          <CourseLockIllustration className="shrink-0 w-44 sm:w-40 h-auto -my-2" />
          <div className="min-w-0 flex flex-col gap-1.5 text-center sm:text-left">
            <h2 id="preview-lock-title" className="m-0 font-ld-display font-semibold text-lg sm:text-xl text-ld-onyx tracking-[-0.02em] leading-snug">
              Lanjutan artikel ini ada di course {primary.title}
            </h2>
            <p className="m-0 text-sm sm:text-[15px] text-ld-slate leading-relaxed">
              Gratis. Lesson {primary.lessonNumber} dari {primary.totalLessons}, kamu sudah membaca sekitar {percent}% artikel.
              Lanjutkan di course supaya progress dan latihannya tersimpan.
            </p>
          </div>
        </div>

        {(preview.lockedHeadings.length > 0 || preview.hasAttachment) && (
          <div className="border-t border-ld-frost pt-4">
            <p className="m-0 mb-1.5 text-xs font-medium uppercase tracking-[0.06em] text-ld-steel">Yang belum kamu baca</p>
            <ul className="m-0 p-0 list-none flex flex-col">
              {preview.lockedHeadings.map((h) => (
                <li key={h} className="flex items-center gap-2.5 py-1.5 text-[15px] text-ld-slate">
                  <Lock size={15} className="shrink-0 text-ld-fog" aria-hidden="true" />
                  {h}
                </li>
              ))}
              {preview.hasAttachment && (
                <li className="flex items-center gap-2.5 py-1.5 text-[15px] text-ld-slate">
                  <FileText size={15} className="shrink-0 text-ld-fog" aria-hidden="true" />
                  Lampiran dokumen
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <Link
            to={primaryHref}
            onClick={onCta(primary, true, primaryTarget)}
            className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-[15px] font-medium no-underline transition-colors"
          >
            Lanjut baca di course <ArrowRight size={16} />
          </Link>
          <Link
            to={`/courses/${primary.slug}`}
            onClick={onCta(primary, true, 'course_detail')}
            className="text-center text-sm font-medium text-ld-graphite underline decoration-ld-fog underline-offset-[3px] hover:text-ld-violet"
          >
            Lihat semua materi course
          </Link>
        </div>

        {course && (
          <p className="m-0 -mt-1 text-[13px] text-ld-steel">
            {articleCount} artikel{missionCount > 0 ? ` dan ${missionCount} misi praktik di QA Simulator` : ''} · sekitar {course.estimatedHours} jam
          </p>
        )}

        {others.length > 0 && (
          <div className="border-t border-ld-frost pt-3 flex flex-col">
            <p className="m-0 text-[13px] text-ld-steel">Juga ada di course lain</p>
            {others.map((m) => (
              <Link
                key={m.slug}
                to={courseLessonAnchorHref(m.slug, articleSlug)}
                onClick={onCta(m, false, 'course_detail')}
                className="flex items-center justify-between gap-3 py-2 text-sm no-underline text-ld-graphite hover:text-ld-violet"
              >
                <span>
                  <strong className="font-semibold text-ld-onyx">{m.title}</strong>
                  <span className="text-ld-steel"> · lesson {m.lessonNumber} dari {m.totalLessons}</span>
                </span>
                <span className="shrink-0 font-medium text-ld-violet">Buka →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Phones: once the lock card has been seen, keep the way into the
          course at hand while the reader scrolls back up. */}
      {seen && !inView && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[900] bg-white border-t border-ld-frost shadow-[0_-8px_20px_-10px_rgba(39,40,53,0.2)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] flex items-center gap-3 font-ld-sans">
          <div className="flex-1 min-w-0">
            <p className="m-0 text-xs text-ld-steel">Course gratis</p>
            <p className="m-0 mt-0.5 text-sm font-semibold text-ld-onyx truncate">{primary.title}</p>
          </div>
          <Link
            to={primaryHref}
            onClick={onCta(primary, true, primaryTarget)}
            className="shrink-0 inline-flex items-center min-h-11 px-4 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline"
          >
            Lanjut baca
          </Link>
        </div>
      )}
    </>
  );
};

export default ArticlePreviewLock;
