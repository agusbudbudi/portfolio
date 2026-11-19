import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Layers, X } from 'lucide-react';
import { useSimulatorIndex } from '../hooks/useSimulatorData';
import type { SimulatorProjectSummary } from '../../../types/qaSimulator';
import { PROJECT_MOCKUPS } from './landing/projectMockupMap';

// Right-side drawer listing every simulator project (compact version of the
// landing page's "Pilih project" cards), opened from the Labs header so the
// learner can switch projects without leaving the workspace.

const DIFFICULTY_LABEL = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' } as const;

const Thumb: React.FC<{ id: string; dim: boolean }> = ({ id, dim }) => {
  const mock = PROJECT_MOCKUPS[id];
  return (
    <div className={`relative w-[108px] shrink-0 self-stretch min-h-[104px] overflow-hidden ${mock ? (dim ? 'bg-ld-cloud' : mock.bg) : 'bg-ld-cloud'}`}>
      {mock && (
        <div className={`absolute left-1/2 top-3 -translate-x-1/2 transition-transform duration-300 group-hover:-translate-y-1 ${dim ? 'opacity-60 grayscale' : ''}`}>
          <div className="scale-[0.5] origin-top"><mock.Mockup /></div>
        </div>
      )}
    </div>
  );
};

const CompactCard: React.FC<{ project: SimulatorProjectSummary; current: boolean; onPick: () => void }> = ({ project, current, onPick }) => {
  const available = project.status === 'available';
  const inner = (
    <>
      <Thumb id={project.id} dim={!available} />
      <div className="flex-1 min-w-0 p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${available ? 'text-ld-violet' : 'text-ld-fog'}`}>{project.product}</span>
          {current ? (
            <span className="text-[10px] font-medium text-ld-violet">Sedang dibuka</span>
          ) : available ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Tersedia</span>
          ) : (
            <span className="text-[10px] font-medium text-ld-fog">Segera hadir</span>
          )}
        </div>
        <p className={`m-0 mt-1 text-sm font-semibold leading-snug line-clamp-2 ${available ? 'text-ld-onyx group-hover:text-ld-violet' : 'text-ld-slate'} transition-colors`}>{project.title}</p>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-ld-steel">
          <span className="inline-flex items-center gap-1"><Clock size={11} /> ±{project.estimatedHours} jam</span>
          <span className="inline-flex items-center gap-1"><Layers size={11} /> {project.phaseTitles.length} phase · {DIFFICULTY_LABEL[project.difficulty]}</span>
        </div>
      </div>
    </>
  );
  const cls = `group flex rounded-lg border overflow-hidden no-underline transition-colors ${
    current ? 'border-ld-violet ring-2 ring-ld-lilac bg-white' : available ? 'border-ld-frost bg-white hover:border-ld-violet/50' : 'border-dashed border-ld-ash bg-white/60'
  }`;
  return available ? (
    <Link to={`/qa-simulator/${project.id}`} onClick={onPick} className={cls} aria-current={current ? 'page' : undefined}>{inner}</Link>
  ) : (
    <div className={cls} aria-disabled="true">{inner}</div>
  );
};

const ProjectsDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { index, loading, error, retry } = useSimulatorIndex();
  const { pathname } = useLocation();
  const currentId = pathname.match(/^\/qa-simulator\/([^/]+)/)?.[1];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1050] bg-ld-onyx/40 font-ld-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="projects-drawer-title"
            className="absolute top-0 right-0 h-full w-full max-w-[440px] bg-ld-canvas shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-5 h-14 border-b border-ld-frost shrink-0">
              <h2 id="projects-drawer-title" className="m-0 text-base font-semibold text-ld-onyx">Pilih project</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3">
              {loading ? (
                [0, 1, 2].map((i) => <div key={i} className="h-[104px] rounded-lg bg-ld-cloud animate-pulse" />)
              ) : error || !index ? (
                <div className="text-center py-10">
                  <p className="m-0 mb-3 text-sm text-ld-slate">{error ?? 'Gagal memuat project.'}</p>
                  <button onClick={retry} className="px-4 py-2 rounded-lg bg-ld-violet text-white text-sm font-medium border-none cursor-pointer">Coba lagi</button>
                </div>
              ) : (
                index.projects.map((p) => (
                  <CompactCard key={p.id} project={p} current={p.id === currentId} onPick={onClose} />
                ))
              )}
            </div>

            <div className="px-5 py-3.5 border-t border-ld-frost shrink-0">
              <Link to="/qa-simulator#project" onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-medium text-ld-violet no-underline hover:underline">
                Lihat detail semua project <ArrowRight size={14} />
              </Link>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectsDrawer;
