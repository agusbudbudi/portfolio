import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import { ADMIN_CARD, ADMIN_CARD_BODY, ADMIN_CARD_HEADER } from '../../admin/components/shared/adminCard';
import type { ProjectProgress, SimulatorProject } from '../../../types/qaSimulator';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import SimulatorBannerIllustration from './SimulatorBannerIllustration';
import { apiListSimulatorProgress, fetchSimulatorIndex, fetchSimulatorProject } from '../lib/simulatorApi';
import { emptyProgress, isPhaseComplete, phaseScore, projectCompletion } from '../lib/progress';

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
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-ld-violet to-[#1f87e6] text-white">
        <PixelMosaic variant="white" className="absolute -top-2 right-4 opacity-80" style={{ width: 'min(40%, 220px)' }} />
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4 p-5 md:p-6">
          <div className="min-w-0">
            <p className="m-0 text-base md:text-lg font-semibold leading-snug">Simulasi kerja QA, satu sprint utuh</p>
            <p className="m-0 mt-1 text-sm text-white/90 leading-relaxed max-w-xl">
              Analisis PRD, desain test case, berburu bug di staging, sampai rekomendasi rilis. Nilai hasilmu dengan rubric, lalu bawa ke sesi mentoring.
            </p>
            <ol className="m-0 mt-3 p-0 list-none flex flex-wrap gap-1.5">
              {['Requirement', 'Test Design', 'Bug Hunting'].map((t, i) => (
                <li key={t} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/15 text-xs font-medium">
                  <span className="w-4 h-4 rounded-full bg-white text-ld-violet text-[10px] font-semibold flex items-center justify-center">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
          <SimulatorBannerIllustration className="hidden md:block w-[220px] h-auto -my-8" />
        </div>
      </div>

      {rows.map(({ project, progress }) => {
        const completion = projectCompletion(project, progress);
        const started = completion.done > 0 || Object.keys(progress.assignments).length > 0;
        return (
          <div key={project.id} className={ADMIN_CARD}>
            <div className={`${ADMIN_CARD_HEADER} justify-between flex-wrap`}>
              <div className="min-w-0">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-violet">{project.product}</p>
                <h2 className="m-0 text-sm font-semibold text-ld-onyx">{project.title}</h2>
              </div>
              <Link
                to={`/qa-simulator/${project.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium no-underline transition-colors"
              >
                {completion.percent === 100 ? 'Lihat hasil' : started ? 'Lanjutkan' : 'Mulai'} <ArrowRight size={14} />
              </Link>
            </div>
            <div className={ADMIN_CARD_BODY}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ld-slate">{completion.done}/{completion.total} tugas selesai · <Clock size={11} className="inline -mt-0.5" /> ±{project.estimatedHours} jam</span>
                <span className="font-semibold text-ld-violet tabular-nums">{completion.percent}%</span>
              </div>
              <div className="h-2 rounded-full bg-ld-frost overflow-hidden mb-5">
                <div className="h-full rounded-full bg-ld-violet transition-all" style={{ width: `${completion.percent}%` }} />
              </div>
              <ol className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-3 gap-3">
                {project.phases.map((phase, i) => {
                  const done = isPhaseComplete(phase, progress);
                  const score = phaseScore(phase, progress);
                  return (
                    <li key={phase.id} className="rounded-lg border border-ld-frost px-3 py-2.5 flex items-center gap-2.5">
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
            </div>
          </div>
        );
      })}

      {comingSoon.length > 0 && (
        <p className="m-0 text-xs text-ld-fog">Segera hadir: {comingSoon.join(', ')}.</p>
      )}
    </div>
  );
};

export default SimulatorDashboardTab;
