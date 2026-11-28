import React, { useEffect, useState } from 'react';
import { ArrowUpRight, FlaskConical } from 'lucide-react';
import SectionHeading from '../../../../components/common/SectionHeading';
import type { PublicSimulatorPortfolio, SimulatorProject } from '../../../../types/qaSimulator';
import { fetchSimulatorProject } from '../../../qa-simulator/lib/simulatorApi';
import { summarizePortfolio } from '../../../qa-simulator/lib/portfolioSummary';

const DIFFICULTY_LABEL = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' } as const;

// Project content (title, phases, assignment specs) is static JSON, so the
// API only ships the learner's progress and the card resolves the rest here.
function useProjects(ids: string[]) {
  const key = ids.join(',');
  const [projects, setProjects] = useState<Record<string, SimulatorProject>>({});
  useEffect(() => {
    let cancelled = false;
    Promise.all(key.split(',').filter(Boolean).map((id) => fetchSimulatorProject(id).catch(() => null)))
      .then((list) => {
        if (cancelled) return;
        setProjects(Object.fromEntries(list.filter((p): p is SimulatorProject => Boolean(p)).map((p) => [p.id, p])));
      });
    return () => { cancelled = true; };
  }, [key]);
  return projects;
}

const QaSimulatorCard: React.FC<{ share: PublicSimulatorPortfolio; project: SimulatorProject }> = ({ share, project }) => {
  const { phases, overall, stats } = summarizePortfolio(project, share.data);
  return (
    <a
      href={`/qa-simulator/${project.id}/portfolio/${share.shareId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-5 flex flex-col gap-3 no-underline transition-shadow hover:shadow-ld-subtle-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[11px] font-medium uppercase tracking-wider text-ld-violet">
            {project.product} · {DIFFICULTY_LABEL[project.difficulty]}
          </p>
          <h4 className="m-0 mt-1 text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] group-hover:text-ld-violet transition-colors">
            {project.title}
          </h4>
        </div>
        <div className="text-right shrink-0">
          <p className="m-0 text-lg font-semibold text-ld-violet tabular-nums leading-none">{overall}%</p>
          <p className="m-0 mt-1 text-[10px] text-ld-slate">Self-assessment</p>
        </div>
      </div>

      <p className="m-0 text-xs text-ld-slate">
        {phases.length} phase selesai: {phases.map((p) => p.shortTitle).join(', ')}
      </p>

      {stats.some((s) => s.count > 0) && (
        <ul className="m-0 p-0 list-none flex flex-wrap gap-1.5">
          {stats.filter((s) => s.count > 0).map((s) => (
            <li key={s.label} className="px-2 py-1 rounded-md bg-ld-cloud text-[11px] text-ld-graphite">
              <span className="font-semibold tabular-nums">{s.count}</span> {s.label}
            </li>
          ))}
        </ul>
      )}

      <span className="inline-flex items-center gap-1 mt-auto text-[11px] font-medium text-ld-violet">
        Lihat case study <ArrowUpRight size={12} />
      </span>
    </a>
  );
};

const QaSimulatorSection: React.FC<{ shares: PublicSimulatorPortfolio[] }> = ({ shares }) => {
  const projects = useProjects(shares.map((s) => s.projectId));
  const ready = shares.filter((s) => projects[s.projectId] && summarizePortfolio(projects[s.projectId], s.data).allDone);
  if (ready.length === 0) return null;

  return (
    <section className="mb-14">
      <SectionHeading
        icon={<FlaskConical size={20} />}
        iconClassName="bg-violet-500/10 text-violet-600"
        title="QA Simulator"
        subtitle="Studi kasus kerja QA yang diselesaikan di QA Simulator: dari review PRD sampai bug report."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ready.map((share) => (
          <QaSimulatorCard key={share.shareId} share={share} project={projects[share.projectId]} />
        ))}
      </div>
    </section>
  );
};

export default QaSimulatorSection;
