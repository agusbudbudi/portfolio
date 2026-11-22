import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Check, Clock, FlaskConical, Layers, X } from 'lucide-react';
import FaqAccordion from '../../../../components/common/FaqAccordion';
import PixelMosaic from '../../../../components/illustration/PixelMosaic';
import { QaCourseIcon, QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../../components/illustration/ProductIcons';
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
      <span className="self-start px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet">
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

// Mobile: horizontal snap slider bleeding to the screen edges, the next card
// peeking in as a swipe hint (same pattern as the home sliders). md+: grid.
// pb-2 keeps the cards' shadow from being clipped by the scroll container.
const LIST = '-mx-4 px-4 pb-2 flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5 md:overflow-visible';
const SLIDE = 'shrink-0 w-[82%] sm:w-[60%] snap-start md:w-auto';

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
        <div className={LIST} role="status" aria-label="Memuat course…">
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
        <div className={LIST}>
          {courses.map((c) => <div key={c.id} className={SLIDE}><CourseCard course={c} /></div>)}
          {COMING_SOON.filter((p) => !courses.some((c) => c.slug === p.slug)).map((p) => (
            <div key={p.slug} className={SLIDE}><ComingSoonCard {...p} /></div>
          ))}
        </div>
      )}
    </div>
  </section>
);

// ── How it works ────────────────────────────────────────────────────────────

// Each step uses the brand icon of the product behind it (same set as the
// header "Program" menu and the course detail page).
const STEPS = [
  { icon: QaLibraryIcon, title: 'Belajar', body: 'Materi singkat 5 sampai 10 menit per topik, ditulis praktisi dengan contoh dari aplikasi sehari-hari.' },
  { icon: QaSimulatorIcon, title: 'Praktik', body: 'Setiap modul diakhiri misi di QA Simulator: PRD, tim, dan aplikasi staging yang benar-benar bisa kamu tes.' },
  { icon: QaPortfolioIcon, title: 'Bukti', body: 'Hasil misi tersusun jadi portfolio studi kasus. Bagikan lewat link publik atau unduh sebagai PDF.' },
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
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <li key={title} className="rounded-2xl border border-ld-frost bg-white p-5 md:p-6">
            <div className="flex items-center gap-3">
              <Icon size={44} className="shrink-0" />
              <div className="min-w-0">
                <p className="m-0 text-xs font-semibold text-ld-fog tabular-nums">Langkah {i + 1}</p>
                <h3 className="m-0 mt-0.5 text-base md:text-lg font-semibold text-ld-graphite">{title}</h3>
              </div>
            </div>
            <p className="m-0 mt-3 md:mt-4 text-sm text-ld-slate leading-relaxed">{body}</p>
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
