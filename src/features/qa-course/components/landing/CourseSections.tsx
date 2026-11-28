import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, ChevronLeft, ChevronRight, Clock, FlaskConical, Layers, X } from 'lucide-react';
import FaqAccordion from '../../../../components/common/FaqAccordion';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { QaCourseIcon } from '../../../../components/illustration/ProductIcons';
import { CourseLevelIcon } from '../../../../components/illustration/CourseLevelIcons';
import type { QaCourseSummary } from '../../../../types/qaCourse';
import { QA_COURSE_LEVEL_LABEL } from '../../../../types/qaCourse';
import { COMING_SOON, FAQ_ITEMS } from './content';

// ── Course list (blue band, mirrors the QA Simulator projects band) ─────────

const CourseCard: React.FC<{ course: QaCourseSummary }> = ({ course }) => (
  <Link
    to={`/courses/${course.slug}`}
    className="group flex flex-col h-full rounded-2xl bg-white border border-white overflow-hidden no-underline shadow-[0_2px_8px_rgba(16,60,120,0.10)] hover:shadow-[0_6px_16px_rgba(16,60,120,0.16)] transition-shadow"
  >
    {course.thumbnailUrl && <img src={course.thumbnailUrl} alt="" className="w-full aspect-video object-cover" loading="lazy" />}
    <div className="flex flex-col flex-1 p-6">
      <span className="self-start inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet">
        <CourseLevelIcon level={course.level} size={28} tile={false} className="shrink-0 -my-1" />
        {QA_COURSE_LEVEL_LABEL[course.level]}
      </span>
      <h3 className="m-0 mt-4 text-lg font-semibold leading-snug text-ld-graphite group-hover:text-ld-violet transition-colors">{course.title}</h3>
      <p className="m-0 mt-2 text-sm leading-relaxed text-ld-slate flex-1 line-clamp-3">{course.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ld-steel">
        <span className="inline-flex items-center gap-1"><Layers size={12} /> {course.moduleCount} modul</span>
        <span className="inline-flex items-center gap-1"><BookOpen size={12} /> {course.articleCount} materi</span>
        <span className="inline-flex items-center gap-1"><FlaskConical size={12} /> {course.missionCount} misi</span>
        <span className="inline-flex items-center gap-1"><Clock size={12} /> ±{course.estimatedHours} jam</span>
      </div>
      <div className="mt-5 pt-4 border-t border-ld-frost/70">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ld-violet">
          Lihat kurikulum <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </div>
  </Link>
);



// Thumbnail slot art: a skeleton course card (brand QA Course icon, content
// lines, an empty progress bar) in white tints on the blue band, with a few
// pixel-mosaic tiles in the corner. Decorative.
const ComingSoonArt: React.FC = () => (
  <div aria-hidden="true" className="relative w-full aspect-video border-b border-dashed border-white/25 flex items-center justify-center overflow-hidden">
    <div className="absolute top-4 right-4 grid grid-cols-4 gap-1">
      {['', 'bg-white/15', 'bg-white/25', 'bg-white/15', '', '', 'bg-white/15', 'bg-white/25', '', '', '', 'bg-white/15'].map((tone, i) => (
        <span key={i} className={`w-2.5 h-2.5 rounded-[2px] ${tone}`} />
      ))}
    </div>
    <div className="w-[58%] max-w-[200px] rounded-xl border border-white/30 bg-white/15 p-3 flex flex-col gap-2 -rotate-3 shadow-[0_12px_24px_-12px_rgba(16,60,120,0.45)]">
      <div className="flex items-center gap-2">
        <QaCourseIcon size={28} className="shrink-0 opacity-90" />
        <span className="h-2 w-[55%] rounded-full bg-white/50" />
      </div>
      <span className="h-1.5 w-[90%] rounded-full bg-white/30" />
      <span className="h-1.5 w-[70%] rounded-full bg-white/30" />
      <span className="mt-1 h-1.5 w-full rounded-full bg-white/15 overflow-hidden"><span className="block h-full w-[12%] bg-white/50" /></span>
    </div>
  </div>
);

// Same anatomy as CourseCard (16:9 thumbnail slot, then body) so all cards in
// the row line up.
const ComingSoonCard: React.FC<(typeof COMING_SOON)[number]> = ({ level, title, description }) => (
  <div aria-disabled="true" className="flex flex-col h-full rounded-2xl border border-dashed border-white/35 bg-white/10 backdrop-blur-sm overflow-hidden">
    <ComingSoonArt />
    <div className="flex flex-col flex-1 p-6">
      <span className="self-start px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest bg-white/15 text-white">{level}</span>
      <h3 className="m-0 mt-4 text-lg font-semibold leading-snug text-white">{title}</h3>
      <p className="m-0 mt-2 text-sm leading-relaxed text-white/85 flex-1">{description}</p>
      <div className="mt-5 pt-4 border-t border-white/20">
        <span className="text-sm font-medium text-white/75">Segera hadir</span>
      </div>
    </div>
  </div>
);

// Horizontal, scroll-snapping slider at every breakpoint (same pattern as the
// QA Simulator projects band): native scroll so swipe/trackpad/keyboard work,
// prev/next buttons that disable at the ends and hide when everything fits.
// The track is full-bleed while the first card lines up with the content
// column: --bleed = viewport edge to that column (1200px max + px-4/sm:px-6).
// py-4 -my-4 keeps the cards' shadow from being clipped by the scroll box.
const TRACK = 'flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-[var(--bleed)] px-[var(--bleed)] scroll-px-[var(--bleed)] [--bleed:calc(max(0px,(100vw-1200px)/2)+1rem)] sm:[--bleed:calc(max(0px,(100vw-1200px)/2)+1.5rem)] py-4 -my-4';
const SLIDE = 'shrink-0 snap-start w-[82%] sm:w-[340px] lg:w-[372px]';
const NAV_BTN = 'w-10 h-10 flex items-center justify-center rounded-full border border-white/40 bg-white/10 text-white cursor-pointer transition-colors hover:bg-white hover:text-ld-violet active:bg-white active:text-ld-violet disabled:opacity-35 disabled:cursor-default disabled:hover:bg-white/10 disabled:hover:text-white disabled:active:bg-white/10 disabled:active:text-white';

const CourseSlider: React.FC<{ children: React.ReactNode; count: number; label: string }> = ({ children, count, label }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update, count]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    el.scrollBy({ left: dir * (slide.offsetWidth + 20), behavior: 'smooth' });
  };

  return (
    <div>
      <div ref={trackRef} onScroll={update} className={TRACK} aria-label={label}>
        {children}
      </div>
      {!(edge.start && edge.end) && (
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={() => scrollBy(-1)} disabled={edge.start} aria-label="Course sebelumnya" className={NAV_BTN}><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => scrollBy(1)} disabled={edge.end} aria-label="Course berikutnya" className={NAV_BTN}><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
};

export const CourseListSection: React.FC<{
  courses: QaCourseSummary[] | null;
  error: string | null;
}> = ({ courses, error }) => (
  <section id="course" className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-ld-violet to-[#1f87e6] scroll-mt-16">
    <PixelMosaic variant="white" className="absolute top-10 right-6 lg:right-12" style={{ width: 'min(48%, 400px)' }} />
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />
    <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div className="max-w-2xl">
          <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">Pilih course</p>
          <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white leading-tight">Jalur belajar yang bisa kamu ikuti</h2>
        </div>
        <p className="m-0 text-sm text-white/90 max-w-sm">Lesson pertama bisa dibaca tanpa login. Login gratis untuk menyimpan progress.</p>
      </div>

      {courses === null && !error && (
        <div className={TRACK} role="status" aria-label="Memuat course…">
          {[0, 1, 2].map((i) => <div key={i} className={`${SLIDE} h-[360px] rounded-2xl bg-white/15 animate-pulse`} />)}
        </div>
      )}
      {error && <p className="text-center text-sm text-white/90 py-16 m-0">{error}</p>}
      {courses && courses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/35 bg-white/10 px-6 py-12 text-center">
          <p className="m-0 text-base font-semibold text-white">Course pertama sedang disiapkan</p>
          <p className="m-0 mt-2 text-sm text-white/85">
            Sambil menunggu, coba praktik langsung di <Link to="/qa-simulator" className="text-white font-medium">QA Simulator</Link>.
          </p>
        </div>
      )}
      {courses && courses.length > 0 && (
        <CourseSlider count={courses.length} label="Daftar course">
          {courses.map((c) => <div key={c.id} className={SLIDE}><CourseCard course={c} /></div>)}
          {COMING_SOON.filter((p) => !courses.some((c) => c.slug === p.slug)).map((p) => (
            <div key={p.slug} className={SLIDE}><ComingSoonCard {...p} /></div>
          ))}
        </CourseSlider>
      )}
    </div>
  </section>
);

// ── How it works ────────────────────────────────────────────────────────────

// Each step leads with a 3:2 photo (public/qa-course/step-*.webp). The photos
// are decorative: the title and body below carry the meaning, so alt is empty.
const STEPS = [
  { image: '/qa-course/step-belajar.webp', title: 'Belajar', body: 'Materi singkat 5 sampai 10 menit per topik, ditulis praktisi dengan contoh dari aplikasi sehari-hari.' },
  { image: '/qa-course/step-praktik.webp', title: 'Praktik', body: 'Setiap modul diakhiri misi di QA Simulator: PRD, tim, dan aplikasi staging yang benar-benar bisa kamu tes.' },
  { image: '/qa-course/step-bukti.webp', title: 'Bukti', body: 'Hasil misi tersusun jadi portfolio studi kasus. Bagikan lewat link publik atau unduh sebagai PDF.' },
];

export const CourseHowItWorksSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-ld-canvas">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 md:mb-14">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Cara kerja</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite">Belajar, praktik, lalu buktikan</h2>
        <p className="m-0 mt-4 text-ld-slate max-w-xl mx-auto leading-relaxed">Setiap modul mengulang tiga langkah ini, sampai semua skill dasar QA terkumpul jadi satu portfolio.</p>
      </div>
      {/* Mobile: one card per row. md+: 3 columns. */}
      <ol className="m-0 p-0 list-none grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        {STEPS.map(({ image, title, body }, i) => (
          <li key={title} className="flex flex-col rounded-2xl border border-ld-frost bg-white p-3">
            <img
              src={image}
              alt=""
              width={1200}
              height={800}
              loading="lazy"
              decoding="async"
              className="block w-full aspect-[3/2] object-cover rounded-xl bg-ld-cloud"
            />
            <div className="px-2 pt-4 pb-2 md:px-3 md:pt-5 md:pb-3">
              <p className="m-0 text-sm font-semibold text-ld-violet tabular-nums">Langkah {i + 1}</p>
              <h3 className="m-0 mt-1 text-xl md:text-2xl font-semibold tracking-[-0.01em] text-ld-graphite">{title}</h3>
              <p className="m-0 mt-2 md:mt-3 text-[15px] md:text-base text-ld-slate leading-relaxed">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

// ── Comparison: why this course is different ────────────────────────────────

const COMPARE: { label: string; typical: string; ours: string }[] = [
  { label: 'Format belajar', typical: 'Video panjang', ours: 'Materi singkat yang nyaman dibaca di HP' },
  { label: 'Latihan', typical: 'Kuis pilihan ganda', ours: 'Misi kerja QA dengan PRD dan aplikasi staging' },
  { label: 'Hasil akhir', typical: 'Sertifikat', ours: 'Portfolio berisi test case dan bug report buatanmu' },
  { label: 'Konteks', typical: 'Contoh generik', ours: 'Studi kasus produk lokal: fintech dan e-commerce' },
];

export const CourseCompareSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-ld-cloud">
    <div className="max-w-[900px] mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Kenapa berbeda</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite">Recruiter tidak mencari sertifikat</h2>
        <p className="m-0 mt-4 text-ld-slate max-w-xl mx-auto leading-relaxed">Mereka ingin melihat cara kamu bekerja. Karena itu QA Course berakhir dengan bukti kerja, bukan kuis.</p>
      </div>
      <div className="rounded-2xl border border-ld-frost bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr] sm:grid-cols-[160px_1fr_1fr] text-xs font-semibold uppercase tracking-widest">
          <span className="hidden sm:block px-5 py-3 text-ld-fog" />
          <span className="px-5 py-3 text-ld-fog">Course pada umumnya</span>
          <span className="px-5 py-3 text-ld-violet bg-ld-lilac/50">QA Course</span>
        </div>
        {COMPARE.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_1fr] sm:grid-cols-[160px_1fr_1fr] border-t border-ld-frost text-sm">
            {/* Mobile: the label is its own row, so a hairline separates it from the two cells. */}
            <span className="col-span-2 sm:col-span-1 px-5 py-2.5 sm:py-4 border-b border-ld-frost sm:border-b-0 text-xs sm:text-sm font-semibold text-ld-onyx">{row.label}</span>
            <span className="px-5 py-3 sm:py-4 flex items-start gap-2 text-ld-slate"><X size={15} className="text-ld-fog mt-0.5 shrink-0" />{row.typical}</span>
            <span className="px-5 py-3 sm:py-4 flex items-start gap-2 text-ld-graphite bg-ld-lilac/30"><Check size={15} className="text-emerald-600 mt-0.5 shrink-0" />{row.ours}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── FAQ + final CTA ─────────────────────────────────────────────────────────

export const CourseFaqSection: React.FC = () => (
  <section id="faq" className="py-16 md:py-24 bg-ld-canvas scroll-mt-16">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="text-center mb-10 md:mb-14">
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">Pertanyaan umum</h2>
        <p className="m-0 text-ld-slate max-w-xl mx-auto leading-relaxed">Hal yang sering ditanyakan sebelum mulai belajar.</p>
      </div>
      <FaqAccordion items={FAQ_ITEMS} />
    </div>
  </section>
);

export const CourseFinalCtaSection: React.FC<{ startHref: string }> = ({ startHref }) => (
  <section className="py-16 md:py-24 bg-ld-cloud">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-ld-midnight px-6 sm:px-10 py-12 text-center">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full bg-ld-violet/30 blur-3xl" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="m-0 font-semibold text-3xl sm:text-4xl lg:text-5xl text-white tracking-[-0.025em] leading-[1.05] mb-4">
            Langkah pertamamu jadi QA dimulai dari satu artikel.
          </h2>
          <p className="m-0 text-ld-fog text-base sm:text-lg mb-8 leading-relaxed">
            Baca lesson pertama sekarang, tanpa daftar. Lanjutkan kapan pun kamu siap.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={startHref}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
            >
              Mulai Belajar Gratis <ArrowRight size={18} />
            </Link>
            <Link
              to="/qa-simulator"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white font-medium rounded-lg no-underline hover:bg-white/5 transition-colors text-sm"
            >
              Sudah paham teori? Langsung ke QA Simulator
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
