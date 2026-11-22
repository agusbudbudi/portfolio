import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Layers } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import { useSimulatorIndex } from '../hooks/useSimulatorData';
import type { SimulatorProjectSummary } from '../../../types/qaSimulator';
import SimHeroSection from '../components/landing/SimHeroSection';
import SimProblemSection from '../components/landing/SimProblemSection';
import SimHowItWorksSection from '../components/landing/SimHowItWorksSection';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import SimPortfolioSection from '../components/landing/SimPortfolioSection';
import SimSkillsSection from '../components/landing/SimSkillsSection';
import SimFaqSection from '../components/landing/SimFaqSection';
import SimFinalCtaSection from '../components/landing/SimFinalCtaSection';
import { FAQ_ITEMS, SIM_PATH } from '../components/landing/content';
import { PROJECT_MOCKUPS } from '../components/landing/projectMockupMap';
import { DIFFICULTY_LABEL } from '../lib/ui';

const SITE_URL = 'https://www.mentorqa.com';
const SEO_TITLE = 'QA Simulator: Simulasi Kerja QA Engineer Gratis | Mentor.QA';
const SEO_DESCRIPTION =
  'Simulasi kerja QA Engineer gratis: review PRD, tulis test case, cari bug di staging, beri rekomendasi Go / No-Go, lalu dapatkan portfolio studi kasus QA siap PDF.';

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'QA Simulator: Simulasi Kerja QA Engineer',
    description: SEO_DESCRIPTION,
    url: `${SITE_URL}${SIM_PATH}`,
    inLanguage: 'id',
    isAccessibleForFree: true,
    educationalLevel: 'Beginner',
    teaches: [
      'Requirement analysis',
      'Test scenario dan test case design',
      'Boundary value analysis',
      'Bug reporting',
      'Test summary dan rekomendasi rilis',
      'Test plan & risk-based testing',
      'API testing',
      'Regression testing',
    ],
    provider: { '@type': 'Organization', name: 'Mentor.QA', url: SITE_URL },
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'IDR', category: 'Free' },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT4H',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Mentor.QA', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'QA Simulator', item: `${SITE_URL}${SIM_PATH}` },
    ],
  },
];

// Sits on the blue Projects band: available projects are solid white cards
// (the one thing to click), coming-soon ones are frosted glass so they read as
// "not yet" without competing.
const ProjectCard: React.FC<{ project: SimulatorProjectSummary }> = ({ project }) => {
  const available = project.status === 'available';
  const mock = PROJECT_MOCKUPS[project.id];
  const content = (
    <>
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest ${available ? 'bg-ld-lilac text-ld-violet' : 'bg-white/15 text-white'}`}>
          {project.product}
        </span>
        {available && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tersedia
          </span>
        )}
      </div>
      <h3 className={`m-0 text-lg font-semibold leading-snug ${available ? 'text-ld-graphite group-hover:text-ld-violet' : 'text-white'} transition-colors`}>{project.title}</h3>
      <p className={`m-0 mt-2 text-sm leading-relaxed flex-1 ${available ? 'text-ld-slate' : 'text-white/85'}`}>{project.summary}</p>
      <div className={`mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs ${available ? 'text-ld-steel' : 'text-white/75'}`}>
        <span className="inline-flex items-center gap-1"><Clock size={12} /> ±{project.estimatedHours} jam</span>
        <span className="inline-flex items-center gap-1"><Layers size={12} /> {project.phaseTitles.length} phase · {DIFFICULTY_LABEL[project.difficulty]}</span>
        <span>{project.domain}</span>
      </div>
      <div className={`mt-5 pt-4 border-t ${available ? 'border-ld-frost/70' : 'border-white/20'}`}>
        {available ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ld-violet">
            Mulai simulasi <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        ) : (
          <span className="text-sm font-medium text-white/75">Segera hadir</span>
        )}
      </div>
    </>
  );
  // With a mockup: phone preview on the left (top when the card is narrow),
  // its top sits at a fixed % of the panel height so it scales with the card,
  // and the lower part is cropped by the card's bottom edge.
  const body = mock ? (
    <>
      <div className={`relative shrink-0 h-[230px] sm:h-auto sm:min-h-[220px] sm:w-[42%] overflow-hidden ${available ? mock.bg : 'bg-white/5'}`}>
        <div className="absolute top-[14%] left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out group-hover:-translate-y-3">
          <div className="scale-[1.3] origin-top"><mock.Mockup /></div>
        </div>
      </div>
      <div className="flex flex-col flex-1 min-w-0 p-6">{content}</div>
    </>
  ) : content;
  const cls = `group flex h-full rounded-2xl border no-underline ${mock ? 'flex-col sm:flex-row overflow-hidden' : 'flex-col p-6'}`;
  return available ? (
    <Link
      to={`/qa-simulator/${project.id}`}
      className={`${cls} bg-white border-white shadow-[0_2px_8px_rgba(16,60,120,0.10)] hover:shadow-[0_6px_16px_rgba(16,60,120,0.16)] transition-shadow`}
    >
      {body}
    </Link>
  ) : (
    <div className={`${cls} bg-white/10 border-dashed border-white/35 backdrop-blur-sm`} aria-disabled="true">{body}</div>
  );
};

// Each slide: near full width on phones, a fixed comfortable width above.
const SLIDE = 'shrink-0 snap-start w-[86%] sm:w-[620px] lg:w-[680px]';

// Horizontal, scroll-snapping carousel of project cards with prev/next
// buttons (native scroll, so swipe/trackpad/keyboard all work too). The track
// is full-bleed (viewport edge to edge) while the first card still lines up
// with the section's content column: --bleed = distance from the viewport
// edge to that column (1200px max width + px-4/sm:px-6). It's an absolute
// length on purpose; a % would resolve differently for scroll-padding.
const ProjectSlider: React.FC<{ projects: SimulatorProjectSummary[] }> = ({ projects }) => {
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
  }, [update, projects.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    el.scrollBy({ left: dir * (slide.offsetWidth + 20), behavior: 'smooth' });
  };

  const btn = 'w-10 h-10 flex items-center justify-center rounded-full border border-white/40 bg-white/10 text-white cursor-pointer transition-colors hover:bg-white hover:text-ld-violet active:bg-white active:text-ld-violet disabled:opacity-35 disabled:cursor-default disabled:hover:bg-white/10 disabled:hover:text-white disabled:active:bg-white/10 disabled:active:text-white';

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={update}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-[var(--bleed)] px-[var(--bleed)] scroll-px-[var(--bleed)] [--bleed:calc(max(0px,(100vw-1200px)/2)+1rem)] sm:[--bleed:calc(max(0px,(100vw-1200px)/2)+1.5rem)] py-4 -my-4"
        aria-label="Daftar project"
      >
        {projects.map((p) => (
          <div key={p.id} className={SLIDE}><ProjectCard project={p} /></div>
        ))}
      </div>
      {!(edge.start && edge.end) && (
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={() => scrollBy(-1)} disabled={edge.start} aria-label="Project sebelumnya" className={btn}><ChevronLeft size={18} /></button>
          <button type="button" onClick={() => scrollBy(1)} disabled={edge.end} aria-label="Project berikutnya" className={btn}><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
};

const ProjectsSection: React.FC = () => {
  const { index, loading, error, retry } = useSimulatorIndex();
  return (
    <section id="project" className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-ld-violet to-[#1f87e6] scroll-mt-16">
      {/* brand pixel mosaic (white tints on blue) + glow, decorative */}
      <PixelMosaic
        variant="white"
        className="absolute top-10 right-6 lg:right-12"
        style={{ width: 'min(48%, 400px)' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">Pilih project</p>
            <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white leading-tight">
              Project simulasi QA yang bisa kamu kerjakan
            </h2>
          </div>
          <p className="m-0 text-sm text-white/90 max-w-sm">
            Phase 1 bisa dicoba tanpa login. Login gratis untuk lanjut dan menyimpan progress.
          </p>
        </div>

        {loading ? (
          <div className="flex gap-5 overflow-hidden" role="status" aria-label="Memuat project…">
            {[0, 1].map((i) => (
              <div key={i} className={`${SLIDE} h-[400px] rounded-2xl bg-white/15 animate-pulse`} />
            ))}
          </div>
        ) : error || !index ? (
          <div className="text-center py-16">
            <p className="text-sm text-white/90 mb-4">{error ?? 'Gagal memuat project.'}</p>
            <button onClick={retry} className="px-5 py-2.5 rounded-lg bg-white text-ld-violet text-sm font-medium cursor-pointer border-none hover:bg-ld-lilac transition-colors">Coba lagi</button>
          </div>
        ) : (
          <ProjectSlider projects={index.projects} />
        )}
      </div>
    </section>
  );
};

const QaSimulatorIndexPage: React.FC = () => {
  const { hash } = useLocation();

  // Deep links like /qa-simulator#project (the Labs header "Projects" link).
  // App's ScrollToTop skips hashed URLs so this effect owns the scroll.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    const t = window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="w-full bg-ld-canvas font-ld-sans">
      <Seo path={SIM_PATH} title={SEO_TITLE} description={SEO_DESCRIPTION} jsonLd={JSON_LD} />
      <SimHeroSection />
      <ProjectsSection />
      <SimProblemSection />
      <SimHowItWorksSection />
      <SimPortfolioSection />
      <SimSkillsSection />
      <SimFaqSection />
      <SimFinalCtaSection />
    </div>
  );
};

export default QaSimulatorIndexPage;
