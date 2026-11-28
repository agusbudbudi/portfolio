import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Award, BookOpen, ChevronRight, Clock, FlaskConical, Layers } from 'lucide-react';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import { QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../components/illustration/ProductIcons';
import Seo from '../../../components/common/Seo';
import LoadingState from '../../../components/common/LoadingState';
import NotFoundState from '../../../components/common/NotFoundState';
import { QA_COURSE_LEVEL_LABEL } from '../../../types/qaCourse';
import { useCourse } from '../hooks/useCourse';
import { nextLesson, type Lesson } from '../lib/courseOutline';
import CourseOutline from '../components/CourseOutline';
import CourseLoginModal from '../components/CourseLoginModal';

// Each step maps to the product it uses, so it shows that product's brand
// icon (same set as the header "Program" menu).
const OUTCOMES = [
  { icon: QaLibraryIcon, title: 'Belajar', body: 'Materi singkat per topik, 5 sampai 10 menit sekali baca.' },
  { icon: QaSimulatorIcon, title: 'Praktik', body: 'Misi di QA Simulator: PRD, tim, dan aplikasi untuk dites.' },
  { icon: QaPortfolioIcon, title: 'Bukti', body: 'Lulus dengan portfolio publik berisi hasil kerjamu sendiri.' },
];

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { state, course, lessons, completion, loggedIn, progressLoaded } = useCourse(slug);
  const [lockedLesson, setLockedLesson] = useState<Lesson | null>(null);

  // #lesson-<articleSlug>: came from that article's library preview. Open its
  // module, scroll to it and ring it for 2 seconds.
  const { hash } = useLocation();
  const hashSlug = hash.startsWith('#lesson-') ? decodeURIComponent(hash.slice('#lesson-'.length)) : null;
  const highlightIndex = hashSlug && course
    ? lessons.find((l) => l.item.kind === 'article' && course.articles[l.item.articleId]?.slug === hashSlug)?.index
    : undefined;
  const [highlightOn, setHighlightOn] = useState(false);
  useEffect(() => {
    if (highlightIndex === undefined) return;
    // After the module's expand transition has started, so the row is laid out.
    let fade: number | undefined;
    const scroll = window.setTimeout(() => {
      document.getElementById('highlighted-lesson')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightOn(true);
      fade = window.setTimeout(() => setHighlightOn(false), 2000);
    }, 150);
    return () => {
      window.clearTimeout(scroll);
      window.clearTimeout(fade);
      setHighlightOn(false);
    };
  }, [highlightIndex]);

  if (state.status === 'loading') return <LoadingState className="min-h-[60vh] pt-16" />;
  if (state.status === 'error') return <p className="pt-28 px-4 text-center text-sm text-ld-slate">{state.message}</p>;
  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 font-ld-sans">
        <NotFoundState
          illustrationLabel="?"
          title="Course tidak ditemukan"
          description="Course yang kamu cari tidak tersedia atau belum dipublikasikan."
          actionTo="/courses"
          actionLabel="Lihat semua course"
          actionIcon={<ArrowLeft size={16} />}
        />
      </div>
    );
  }

  const target = nextLesson(lessons);
  const started = completion.done > 0;
  const ctaLabel = completion.allDone ? 'Lihat hasil kelulusan' : started ? 'Lanjutkan belajar' : 'Mulai Belajar Gratis';
  const ctaHref = completion.allDone ? `/courses/${course.slug}/selesai` : target?.href;
  // "Langsung praktik" opens the simulator project this course practices on.
  const firstMission = course.modules.flatMap((m) => m.items).find((i) => i.kind === 'mission');
  const simulatorHref = firstMission?.kind === 'mission' ? `/qa-simulator/${firstMission.projectId}` : '/qa-simulator';

  // Hero copy (left column). Kept as a variable so the archived hero
  // (components/archive/CourseDetailHeroLegacy) can be restored around it.
  const heroCopy = (
    <>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="m-0 p-0 list-none flex flex-wrap items-center gap-1.5 text-[13px] text-ld-steel">
          <li><Link to="/courses" className="text-ld-slate hover:text-ld-violet no-underline">QA Course</Link></li>
          <li aria-hidden="true"><ChevronRight size={14} className="text-ld-mist" /></li>
          <li aria-current="page" className="text-ld-graphite font-medium truncate max-w-[60vw]">{course.title}</li>
        </ol>
      </nav>
      <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">QA Course · {QA_COURSE_LEVEL_LABEL[course.level]}</p>
      <h1 className="m-0 mt-3 font-ld-display font-semibold text-[40px] sm:text-[52px] text-ld-onyx tracking-[-0.025em] leading-[1.05]">{course.title}</h1>
      <p className="m-0 mt-4 text-ld-slate text-sm sm:text-base leading-relaxed max-w-2xl whitespace-pre-line">{course.description}</p>
      <ul className="m-0 mt-5 p-0 list-none flex flex-wrap gap-x-5 gap-y-2 text-sm text-ld-graphite">
        <li className="inline-flex items-center gap-1.5"><Layers size={15} className="text-ld-violet" /> {course.modules.length} modul</li>
        <li className="inline-flex items-center gap-1.5"><BookOpen size={15} className="text-ld-violet" /> {lessons.filter((l) => l.kind === 'article').length} artikel</li>
        <li className="inline-flex items-center gap-1.5"><FlaskConical size={15} className="text-ld-violet" /> {lessons.filter((l) => l.kind === 'mission').length} misi praktik</li>
        <li className="inline-flex items-center gap-1.5"><Clock size={15} className="text-ld-violet" /> ±{course.estimatedHours} jam</li>
      </ul>

      <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
        {ctaHref && (
          <Link
            to={ctaHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-semibold no-underline transition-colors"
          >
            {completion.allDone ? <Award size={16} /> : null}{ctaLabel} <ArrowRight size={16} />
          </Link>
        )}
        {loggedIn && progressLoaded && (
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-ld-slate mb-1.5">
              <span>Progress</span><span className="tabular-nums">{completion.done}/{completion.total} selesai</span>
            </div>
            <div className="h-2 rounded-full bg-white border border-ld-frost overflow-hidden" role="progressbar" aria-valuenow={completion.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-ld-violet transition-all" style={{ width: `${completion.percent}%` }} />
            </div>
          </div>
        )}
        {!loggedIn && <p className="m-0 text-xs text-ld-slate">Lesson pertama bisa dibaca tanpa login.</p>}
      </div>
    </>
  );

  return (
    <div className="font-ld-sans pb-16">
      <Seo
        path={`/courses/${course.slug}`}
        title={course.seoMetaTitle || `${course.title} | QA Course`}
        description={course.seoMetaDescription || course.description}
        image={course.seoOgImage || course.thumbnailUrl}
      />

      <div className="relative overflow-hidden bg-ld-canvas">
        {/* Lilac glow top-right, as on the home hero. The text side stays
            clean: the pixel mosaics only hug the photo (see below). */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] w-[620px] h-[620px] rounded-full bg-ld-lilac/60 blur-3xl" />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 md:pt-24 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end">
          <div className="lg:col-span-7 min-w-0 self-center lg:pb-16">
            {heroCopy}
          </div>
          {/* The cut-out photo sits on the hero's bottom edge (he is cropped at
              the waist); a soft blue glow sits behind him. */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] aspect-square rounded-full bg-ld-violet/15 blur-3xl" />
            {/* Hugs the photo's top-right corner (dense tiles point into it). */}
            <PixelMosaic
              variant="blue"
              className="absolute top-4 -right-2 lg:-right-8 opacity-70 w-[45%] sm:w-[62%] max-w-[280px]"
            />
            {/* Second mosaic at the photo's bottom-left, flipped on both axes so
                its dense tiles point into that corner. */}
            <PixelMosaic
              variant="blue"
              className="absolute bottom-4 -left-2 sm:-left-4 lg:-left-6 opacity-70 w-[55%] sm:w-[80%] max-w-[380px]"
              style={{ transform: 'scale(-1, -1)' }}
            />
            <img
              src="/qa-course/hero-junior-qa.webp"
              alt=""
              width={1000}
              height={1000}
              decoding="async"
              fetchPriority="high"
              className="relative block w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px] h-auto"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h2 className="m-0 mb-5 font-ld-display text-xl font-semibold text-ld-onyx">Kurikulum</h2>
          <CourseOutline course={course} lessons={lessons} onLocked={setLockedLesson} highlightIndex={highlightIndex} highlightOn={highlightOn} />
        </section>
        {/* Sticky beside the (long) curriculum from lg up; top clears the fixed navbar. */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="m-0 mb-5 font-ld-display text-xl font-semibold text-ld-onyx">Cara belajarnya</h2>
          <ol className="m-0 p-0 list-none flex flex-col gap-3">
            {OUTCOMES.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex items-start gap-3 rounded-xl border border-ld-frost bg-white p-4">
                <Icon size={40} className="shrink-0" />
                <span>
                  <span className="block text-sm font-semibold text-ld-onyx">{i + 1}. {title}</span>
                  <span className="block mt-0.5 text-[13px] text-ld-slate leading-relaxed">{body}</span>
                </span>
              </li>
            ))}
          </ol>

          {/* Shortcut for learners who already know the theory */}
          <div className="relative overflow-hidden mt-5 rounded-xl bg-ld-midnight p-5">
            <PixelMosaic variant="white" className="absolute top-3 right-3" style={{ width: 96 }} />
            <QaSimulatorIcon size={44} className="relative" />
            <p className="relative m-0 mt-4 text-base font-semibold text-white">Sudah paham teorinya?</p>
            <p className="relative m-0 mt-1.5 text-[13px] leading-relaxed text-ld-fog">
              Langsung praktik di QA Simulator. Materi course tetap tertaut di setiap phase.
            </p>
            <Link
              to={simulatorHref}
              className="relative mt-4 flex w-full items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-white text-ld-violet text-sm font-medium no-underline hover:bg-ld-lilac transition-colors"
            >
              Buka QA Simulator <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>

      {lockedLesson && (
        <CourseLoginModal
          courseTitle={course.title}
          lessonTitle={lockedLesson.title}
          onClose={() => setLockedLesson(null)}
          onLoggedIn={() => { const href = lockedLesson.href; setLockedLesson(null); navigate(href); }}
        />
      )}
    </div>
  );
};

export default CourseDetailPage;
