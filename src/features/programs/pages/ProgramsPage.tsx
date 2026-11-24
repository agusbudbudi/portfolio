import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import PremiumBadge from '../../../components/common/PremiumBadge';
import FaqAccordion, { type FaqItem } from '../../../components/common/FaqAccordion';
import { LOWEST_MENTORING_PRICE, pageSeo } from '../../../lib/pageSeo';
import { fetchCourse } from '../../qa-course/lib/courseApi';
import { DEFAULT_FEATURED, PROGRAMS, isProgramKey, type Program, type ProgramKey } from '../data/programs';
import { applyCourse } from '../lib/courseProgram';
import { track } from '../../../lib/analytics';

// Ad landing page: a short list of program cards, each linking straight into
// the first action (lesson 1, simulator phase 1, booking form). No site nav,
// so ad traffic doesn't leak to other pages. `?p=<key>` lets each campaign
// put its own program on top as the featured card.
//
// Styling follows docs/DESIGN.md: white hero with the pixel mosaic, brand
// product icons, one filled blue CTA (the featured card), 12px cards with a
// hairline border, slate-tinted shadows, Canvas/Cloud section rhythm.

// Featured card sits on the blue band: solid white with a blue-tinted shadow
// (docs/DESIGN.md "Blue highlight band"), same shadow as the home catalog cards.
// Hover keeps the card solid (a translucent tint would let the blue bleed
// through); only the shadow deepens.
const ELEVATED =
  'shadow-[0_10px_24px_rgba(16,60,120,0.28)] hover:shadow-[0_18px_36px_rgba(16,60,120,0.38)]';

// Paid program: the gold card from the header "Program" tray (ProductsTray.tsx).
const PAID_TONE = 'border-amber-200 bg-gradient-to-br from-white via-white to-amber-50 hover:border-amber-400';

// Featured card on the blue band: always an opaque surface.
const featuredTone = (paid?: boolean) => (paid ? PAID_TONE : 'border-white bg-white');

// Same card + hover treatment as the header tray: free programs get a frost
// border that turns blue.
const cardTone = (paid?: boolean) =>
  paid ? PAID_TONE : 'border-ld-frost bg-white hover:border-ld-violet/50 hover:bg-ld-cloud/50';

// All hero text (header, badge, h1, subtitle) sits in the top half on solid
// #0f6fd1: white is ~5:1 there and the lavender accent ~3.8:1 (large text).
// Brand blue #3b9eff only comes in below, behind the white featured card
// (white on #3b9eff alone is ~2.7:1, see docs/DESIGN.md). The /programs OG
// image keeps its text on the same dark stop (scripts/og/build.tsx TONES.blue).
const BLUE_BAND = 'bg-gradient-to-b from-[#0f6fd1] from-50% to-ld-violet';

const Title: React.FC<{ program: Program; as: 'h2' | 'h3'; className: string }> = ({ program, as: Tag, className }) => (
  <Tag className={`m-0 flex flex-wrap items-center gap-2 leading-snug text-ld-graphite group-hover:text-ld-violet transition-colors ${className}`}>
    {program.title} {program.paid && <PremiumBadge />}
  </Tag>
);

const Facts: React.FC<{ facts: string[] }> = ({ facts }) => (
  <div className="flex flex-wrap gap-1.5">
    {facts.map((f) => (
      <span key={f} className="px-2 py-0.5 rounded-md text-xs font-medium bg-ld-cloud text-ld-slate">
        {f}
      </span>
    ))}
  </div>
);

// One event for both card types, so "which card gets clicked most" is a single
// breakdown by program_key. position 0 = featured, then the "Program lainnya" order;
// campaign = the ad's ?p= (null for organic visits).
type CardClick = { position: number; campaign: string | null };

function trackCardClick(program: Program, variant: 'featured' | 'list', { position, campaign }: CardClick) {
  track('program_card_clicked', {
    program_key: program.key,
    program_title: program.title,
    paid: Boolean(program.paid),
    variant,
    position,
    campaign,
  });
}

const FeaturedCard: React.FC<{ program: Program; click: CardClick }> = ({ program, click }) => {
  const Icon = program.icon;
  return (
    <Link to={program.href} onClick={() => trackCardClick(program, 'featured', click)} className={`group block rounded-xl border p-5 no-underline transition-[box-shadow,border-color] duration-200 ${featuredTone(program.paid)} ${ELEVATED}`}>
      <div className="flex items-start gap-3">
        <Icon size={48} className="shrink-0" />
        <div className="min-w-0">
          <p className="m-0 text-xs font-medium text-ld-violet">Rekomendasi · {program.category}</p>
          <Title program={program} as="h2" className="mt-1 text-xl font-semibold tracking-[-0.01em]" />
        </div>
      </div>
      <p className="m-0 mt-3 text-sm text-ld-slate leading-relaxed">{program.description}</p>
      <div className="mt-4">
        <Facts facts={program.facts} />
      </div>
      <span className="mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-ld-violet text-white text-[15px] font-medium group-hover:bg-[#1f87e6] transition-colors">
        {program.cta}
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
};

const ProgramCard: React.FC<{ program: Program; click: CardClick }> = ({ program, click }) => {
  const Icon = program.icon;
  return (
    <Link
      to={program.href}
      onClick={() => trackCardClick(program, 'list', click)}
      className={`group flex gap-3 rounded-xl border p-4 no-underline transition-colors ${cardTone(program.paid)}`}
    >
      <Icon size={40} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-xs font-medium text-ld-steel">{program.category}</p>
        <Title program={program} as="h3" className="mt-0.5 text-base font-semibold" />
        <p className="m-0 mt-1 text-sm text-ld-slate leading-relaxed">{program.description}</p>
        <div className="mt-3">
          <Facts facts={program.facts} />
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ld-violet">
          {program.cta}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
};

// Last doubts before the click. Answers stay in the DOM (FaqAccordion) and
// mirror the FAQPage JSON-LD below.
const FAQ: FaqItem[] = [
  {
    q: 'Beneran gratis?',
    a: `QA Course, QA Simulator, dan Portfolio QA gratis. Yang berbayar hanya Mentoring 1-on-1, mulai ${LOWEST_MENTORING_PRICE} per sesi.`,
  },
  {
    q: 'Perlu bisa coding?',
    a: 'Tidak. Materi dimulai dari dasar: membaca PRD, menulis test case, dan bug report. Automation bisa dipelajari belakangan, misalnya lewat mentoring.',
  },
  {
    q: 'Harus daftar dulu?',
    a: 'Tidak untuk mulai. Lesson pertama QA Course dan phase 1 QA Simulator bisa langsung dicoba tanpa login. Masuk pakai akun Google saat ingin menyimpan progres.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

/**
 * PROGRAMS with each course card filled from the live course (lesson-1 link,
 * hours, level). Cards render immediately with their static fallback; a failed
 * fetch (no /api in plain `npm run dev`, course renamed) just keeps it.
 */
function usePrograms(): Program[] {
  const [courses, setCourses] = useState<Partial<Record<ProgramKey, Program>>>({});
  useEffect(() => {
    let cancelled = false;
    for (const program of PROGRAMS) {
      if (!program.course) continue;
      fetchCourse(program.course)
        .then((course) => {
          if (!cancelled && course) setCourses((prev) => ({ ...prev, [program.key]: applyCourse(program, course) }));
        })
        .catch(() => undefined);
    }
    return () => { cancelled = true; };
  }, []);
  return PROGRAMS.map((p) => courses[p.key] ?? p);
}

const ProgramsPage: React.FC = () => {
  const [params] = useSearchParams();
  const p = params.get('p');
  const featuredKey: ProgramKey = isProgramKey(p) ? p : DEFAULT_FEATURED;
  const programs = usePrograms();
  const featured = programs.find((x) => x.key === featuredKey)!;
  const rest = programs.filter((x) => x.key !== featuredKey);

  return (
    <div className="relative min-h-screen flex flex-col bg-ld-canvas font-ld-sans">
      <Seo {...pageSeo('/programs')} jsonLd={faqJsonLd} />

      {/* Transparent header laid over the hero's blue band, so the top of the
          page reads as one block (same as the home navbar's "onBlue" state). */}
      <header className="absolute top-0 inset-x-0 z-10 h-16 border-b border-white/15">
        <div className="max-w-[560px] mx-auto px-4 h-full flex items-center">
          <Link to="/" className="flex items-center gap-2 text-lg font-medium tracking-tight no-underline text-white">
            <img
              src="/shared/img/mentor-logo-96.webp"
              alt="Mentor.QA"
              width={28}
              height={28}
              loading="eager"
              decoding="async"
              className="w-7 h-7 object-contain rounded-md ring-2 ring-white/80"
            />
            <span>Mentor<span className="text-ld-lilac">.QA</span></span>
          </Link>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero + featured program on the page's one blue band (matches the ad's OG image) */}
        <section className={`relative overflow-hidden pt-16 ${BLUE_BAND}`}>
          <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-white/10 blur-3xl" />
          <PixelMosaic
            variant="white"
            className="absolute top-[88px] right-4"
            style={{ width: 'min(46vw, 240px)' }}
          />
          <div className="relative max-w-[560px] mx-auto px-4 pt-8 pb-10">
            <h1 className="m-0 text-[32px] sm:text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
              {/* Headline follows the ad (?p=) so the click lands on matching copy */}
              {featured.hero.before}<span className="text-ld-lavender">{featured.hero.accent}</span>{featured.hero.after}
            </h1>
            <p className="m-0 mt-3 text-base text-white leading-relaxed">{featured.hero.subtitle}</p>
            <div className="mt-7">
              <FeaturedCard program={featured} click={{ position: 0, campaign: p }} />
            </div>
          </div>
        </section>

        {/* Other programs on the Cloud band */}
        <section className="bg-ld-cloud border-t border-ld-frost">
          <div className="max-w-[560px] mx-auto px-4 py-8">
            <h2 className="m-0 mb-4 text-lg font-semibold tracking-[-0.01em] text-ld-graphite">Program lainnya</h2>
            <div className="flex flex-col gap-3">
              {rest.map((program, i) => (
                <ProgramCard key={program.key} program={program} click={{ position: i + 1, campaign: p }} />
              ))}
            </div>
            <Link
              to="/qa-library"
              className="group mt-4 inline-flex items-center gap-1 text-sm font-medium text-ld-slate no-underline hover:text-ld-violet transition-colors"
            >
              Atau baca materi QA gratis di QA Library
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            <div className="mt-6 flex items-center gap-3 rounded-xl bg-white border border-ld-ash p-4">
              <img
                src="/personal-portfolio/img/profile/profile-agus.webp"
                alt="Agus Budiman"
                width={48}
                height={48}
                loading="lazy"
                className="shrink-0 w-12 h-12 rounded-full object-cover"
              />
              <p className="m-0 text-sm text-ld-slate leading-relaxed">
                Materi disusun oleh <span className="font-medium text-ld-graphite">Agus Budiman</span>, QA Engineer dengan 6+ tahun pengalaman di produk digital.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-ld-canvas">
          <div className="max-w-[560px] mx-auto px-4 py-8">
            <h2 className="m-0 mb-4 text-lg font-semibold tracking-[-0.01em] text-ld-graphite">Pertanyaan umum</h2>
            <FaqAccordion items={FAQ} defaultOpen={null} />
          </div>
        </section>
      </main>

      <footer className="bg-ld-canvas pb-8 text-center text-xs text-ld-steel">
        © {new Date().getFullYear()} Mentor.QA
      </footer>
    </div>
  );
};

export default ProgramsPage;
