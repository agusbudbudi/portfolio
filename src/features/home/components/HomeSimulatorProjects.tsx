import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Layers } from 'lucide-react';
import { useSimulatorIndex } from '../../qa-simulator/hooks/useSimulatorData';
import { PROJECT_MOCKUPS } from '../../qa-simulator/components/landing/projectMockupMap';
import { DIFFICULTY_LABEL } from '../../qa-simulator/lib/ui';
import type { SimulatorProjectSummary } from '../../../types/qaSimulator';
import PixelMosaic from '../../../components/illustration/PixelMosaic';

// Catalog of QA Simulator projects (from /qa-simulator/config/index.json), so
// visitors see concrete projects — domain, level, duration, phases — before
// clicking through. Renders nothing if the index can't be loaded.

const DIFFICULTY_STYLE = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
} as const;

const CatalogCard: React.FC<{ project: SimulatorProjectSummary }> = ({ project }) => {
  const available = project.status === 'available';
  const mock = PROJECT_MOCKUPS[project.id];
  const body = (
    <>
      {mock && (
        <div className={`relative shrink-0 h-[200px] overflow-hidden ${mock.bg}`}>
          <div className="absolute top-[14%] left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out group-hover:-translate-y-3">
            <div className="scale-[1.15] origin-top"><mock.Mockup /></div>
          </div>
        </div>
      )}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet">{project.product}</span>
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${DIFFICULTY_STYLE[project.difficulty]}`}>{DIFFICULTY_LABEL[project.difficulty]}</span>
        </div>
        <h3 className="m-0 mt-4 text-lg font-semibold leading-snug text-ld-graphite group-hover:text-ld-violet transition-colors">{project.title}</h3>
        <p className="m-0 mt-1 text-xs text-ld-steel">{project.domain}</p>
        <p className="m-0 mt-3 text-sm text-ld-slate leading-relaxed line-clamp-3 flex-1">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ld-steel">
          <span className="inline-flex items-center gap-1"><Clock size={12} /> ±{project.estimatedHours} jam</span>
          <span className="inline-flex items-center gap-1"><Layers size={12} /> {project.phaseTitles.length} phase</span>
        </div>
        <p className="m-0 mt-2 font-ld-mono text-[11px] text-ld-fog leading-relaxed">{project.phaseTitles.join(' → ')}</p>
        <div className="mt-5 pt-4 border-t border-ld-frost/70">
          {available ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ld-violet">
              Mulai simulasi <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          ) : (
            <span className="text-sm font-medium text-ld-fog">Segera hadir</span>
          )}
        </div>
      </div>
    </>
  );
  const cls = 'group flex flex-col h-full rounded-2xl border border-white bg-white overflow-hidden no-underline shadow-[0_2px_8px_rgba(16,60,120,0.10)]';
  return available ? (
    <Link to={`/qa-simulator/${project.id}`} className={`${cls} hover:shadow-[0_10px_24px_rgba(16,60,120,0.22)] transition-shadow`}>{body}</Link>
  ) : (
    <div className={`${cls} opacity-70`} aria-disabled="true">{body}</div>
  );
};

const HomeSimulatorProjects: React.FC = () => {
  const { index, loading, error } = useSimulatorIndex();
  if (!loading && (error || !index || index.projects.length === 0)) return null;

  return (
    <section id="project-simulasi" className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-ld-violet to-[#1f87e6] scroll-mt-16 font-ld-sans">
      {/* same blue band as the /qa-simulator "Pilih project" section */}
      <PixelMosaic variant="white" className="absolute top-10 right-6 lg:right-12" style={{ width: 'min(48%, 400px)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full bg-white/10 blur-3xl" />
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">Katalog QA Simulator</p>
            <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white leading-tight">
              Pilih project, mulai dari level yang pas
            </h2>
            <p className="m-0 mt-3 text-white/90 leading-relaxed">Semua project gratis. Phase 1 bisa dicoba tanpa login.</p>
          </div>
          <Link to="/qa-simulator" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white no-underline hover:underline shrink-0">
            Lihat QA Simulator <ArrowRight size={15} />
          </Link>
        </div>
        {/* Below md: horizontal snap slider bleeding to the screen edges, the
            next card peeking in as a swipe hint. md+: regular grid. */}
        <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 pb-2 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3">
          {loading || !index
            ? [0, 1, 2].map((i) => <div key={i} className="shrink-0 w-[82%] sm:w-[60%] snap-start h-[480px] rounded-2xl bg-white/15 animate-pulse md:w-auto" />)
            : index.projects.map((p) => (
                <div key={p.id} className="shrink-0 w-[82%] sm:w-[60%] snap-start md:w-auto">
                  <CatalogCard project={p} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default HomeSimulatorProjects;
