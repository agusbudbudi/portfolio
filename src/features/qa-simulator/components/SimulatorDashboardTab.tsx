import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import DashboardCard from '../../admin/components/shared/DashboardCard';
import DashboardBanner from '../../admin/components/shared/DashboardBanner';
import { CARD_ACTION_PRIMARY } from '../../admin/components/shared/DashboardCardHeader';
import type { ProjectProgress, SimulatorProject } from '../../../types/qaSimulator';
import { QaSimulatorIcon } from '../../../components/illustration/ProductIcons';
import SimulatorBannerIllustration from './SimulatorBannerIllustration';
import { apiListSimulatorProgress, fetchSimulatorIndex, fetchSimulatorProject } from '../lib/simulatorApi';
import { emptyProgress, isPhaseComplete, phaseScore, projectCompletion } from '../lib/progress';
import { DIFFICULTY_LABEL } from '../lib/ui';
import { PROJECT_MOCKUPS } from './landing/projectMockupMap';

const DIFFICULTY_STYLE = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-amber-50 text-amber-700',
  advanced: 'bg-rose-50 text-rose-700',
} as const;

interface Row {
  project: SimulatorProject;
  progress: ProjectProgress;
}

// Dashboard menu "QA Simulator": the learner's own progress per project plus
// a jump back into the workspace. The simulation itself runs on the public
// /qa-simulator/:id page (phase 1 must work without login).
const SimulatorDashboardTab: React.FC = () => {
  const token = useAdminAuthStore((s) => s.token);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [comingSoon, setComingSoon] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const index = await fetchSimulatorIndex();
        const available = index.projects.filter((p) => p.status === 'available');
        const [projects, records] = await Promise.all([
          Promise.all(available.map((p) => fetchSimulatorProject(p.id))),
          token ? apiListSimulatorProgress(token).catch(() => []) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setComingSoon(index.projects.filter((p) => p.status === 'coming-soon').map((p) => p.title));
        setRows(projects.map((project) => ({
          project,
          progress: records.find((r) => r.projectId === project.id)?.data ?? emptyProgress(),
        })));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat QA Simulator.');
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  if (error) return <p className="text-sm text-red-500 m-0 p-4">{error}</p>;
  if (!rows) return <LoadingState label="Memuat simulasi…" />;

  return (
    <div className="space-y-5">
      <DashboardBanner
        title="Simulasi kerja QA, satu sprint utuh"
        description="Kerjakan tugas QA nyata dari PRD sampai rilis, lalu dapatkan feedback dari mentor."
        illustration={<SimulatorBannerIllustration />}
      />

      <DashboardCard
        icon={<QaSimulatorIcon size={44} />}
        eyebrow="QA Simulator"
        title="Project Simulasi"
        actions={<span className="text-sm text-ld-slate">{rows.length} project tersedia</span>}
      >
        {rows.length === 0 ? (
          <p className="text-sm text-ld-fog m-0">Belum ada project simulasi yang tersedia.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map(({ project, progress }) => {
              const completion = projectCompletion(project, progress);
              const started = completion.done > 0 || Object.keys(progress.assignments).length > 0;
              const mock = PROJECT_MOCKUPS[project.id];
              return (
                <div key={project.id} className="group rounded-xl border border-ld-frost overflow-hidden">
                  {/* Header strip — same pattern as the booking list items. */}
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-ld-cloud/60 border-b border-ld-frost">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-widest bg-ld-lilac text-ld-violet shrink-0">{project.product}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${DIFFICULTY_STYLE[project.difficulty]}`}>{DIFFICULTY_LABEL[project.difficulty]}</span>
                      <span className="text-xs text-ld-ash shrink-0">|</span>
                      <span className="inline-flex items-center gap-1 text-xs text-ld-slate truncate"><Clock size={12} className="shrink-0" /> ±{project.estimatedHours} jam</span>
                    </div>
                    <span className="text-xs font-semibold text-ld-violet tabular-nums shrink-0">{completion.percent}%</span>
                  </div>

                  <div className="flex flex-col md:flex-row">
                    <div className="flex flex-col flex-1 min-w-0 p-3.5 md:p-4">
                      <p className="m-0 text-base font-semibold leading-snug text-ld-onyx">{project.title}</p>
                      <p className="m-0 mt-0.5 text-xs text-ld-steel">{project.domain}</p>

                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-ld-slate">{completion.done}/{completion.total} tugas selesai</span>
                          <span className="font-semibold text-ld-violet tabular-nums">{completion.percent}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-ld-frost overflow-hidden">
                          <div className="h-full rounded-full bg-ld-violet transition-all" style={{ width: `${completion.percent}%` }} />
                        </div>
                      </div>

                      <ol className="m-0 mt-4 p-0 list-none grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3 gap-2.5">
                        {project.phases.map((phase, i) => {
                          const done = isPhaseComplete(phase, progress);
                          const score = phaseScore(phase, progress);
                          return (
                            <li key={phase.id} className={`rounded-lg border px-3 py-2.5 flex items-center gap-2.5 ${done ? 'border-emerald-200 bg-emerald-50/50' : 'border-ld-frost'}`}>
                              {done ? <CheckCircle2 size={17} className="text-emerald-500 shrink-0" /> : <Circle size={17} className="text-ld-ash shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <p className="m-0 text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Phase {i + 1}</p>
                                <p className="m-0 text-sm font-medium text-ld-onyx truncate">{phase.shortTitle}</p>
                              </div>
                              {score !== null && <span className="text-xs font-semibold tabular-nums text-ld-slate">{score}%</span>}
                            </li>
                          );
                        })}
                      </ol>

                      <div className="mt-4 pt-3.5 border-t border-ld-frost/70 flex items-center justify-between gap-3">
                        <span className="text-xs text-ld-fog">
                          {completion.percent === 100 ? 'Semua phase selesai' : started ? 'Lanjutkan dari terakhir kamu berhenti' : 'Belum dimulai'}
                        </span>
                        <Link
                          to={`/qa-simulator/${project.id}`}
                          className={`${CARD_ACTION_PRIMARY} shrink-0`}
                        >
                          {completion.percent === 100 ? 'Lihat hasil' : started ? 'Lanjutkan' : 'Mulai'} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>

                    {mock && (
                      // Phone preview: top on narrow screens, left panel from md up.
                      // Its top sits at a fixed % so the lower part is cropped by the card edge.
                      <div className={`relative order-first shrink-0 h-[200px] md:h-auto md:w-[36%] lg:w-[32%] overflow-hidden border-b md:border-b-0 md:border-r border-ld-frost ${mock.bg}`}>
                        <div className="absolute top-[12%] left-1/2 -translate-x-1/2 transition-transform duration-300 ease-out group-hover:-translate-y-3">
                          <div className="scale-[1.15] origin-top"><mock.Mockup /></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {comingSoon.length > 0 && (
          <p className="m-0 mt-4 text-xs text-ld-fog">Segera hadir: {comingSoon.join(', ')}.</p>
        )}
      </DashboardCard>
    </div>
  );
};

export default SimulatorDashboardTab;
