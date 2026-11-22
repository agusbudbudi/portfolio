import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Link2 } from 'lucide-react';
import LoadingState from '../../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { apiGetQaCourseAdmin, apiGetQaCourseLearners } from '../../../../lib/adminApi';
import type { QaCourseDetail, QaCourseLearner } from '../../../../types/qaCourse';
import type { ProjectProgress, SimulatorProject } from '../../../../types/qaSimulator';
import { fetchSimulatorProject } from '../../../qa-simulator/lib/simulatorApi';
import { buildLessons, courseCompletion } from '../../../qa-course/lib/courseOutline';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

interface LearnerRow {
  learner: QaCourseLearner;
  done: number;
  total: number;
  percent: number;
  graduated: boolean;
}

type LoadState = { status: 'loading' } | { status: 'ready'; course: QaCourseDetail; rows: LearnerRow[] } | { status: 'error'; message: string };

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Stat: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-ld-frost px-4 py-3">
    <p className="m-0 text-[11px] font-medium uppercase tracking-widest text-ld-fog">{label}</p>
    <p className="m-0 mt-1 text-2xl font-semibold text-ld-onyx tabular-nums leading-none">{value}</p>
    {hint && <p className="m-0 mt-1 text-[11px] text-ld-steel">{hint}</p>}
  </div>
);

/**
 * Admin "Peserta" view for one course: who started it, how far they got,
 * who graduated and who shared a portfolio. Covers the PRD's success metrics
 * (started, completion rate, shared portfolios) from data already stored.
 */
const QaCourseLearnersPanel: React.FC<{ slug: string; onClose: () => void }> = ({ slug, onClose }) => {
  const token = useAdminAuthStore((s) => s.token);
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [course, { learners }] = await Promise.all([apiGetQaCourseAdmin(slug, token), apiGetQaCourseLearners(slug, token)]);
        const projectIds = [...new Set(course.modules.flatMap((m) => m.items).flatMap((i) => (i.kind === 'mission' ? [i.projectId] : [])))];
        const projects = await Promise.all(projectIds.map((id) => fetchSimulatorProject(id).catch(() => null)));
        const projectMap: Record<string, SimulatorProject> = Object.fromEntries(
          projects.filter((p): p is SimulatorProject => Boolean(p)).map((p) => [p.id, p])
        );
        const rows = learners.map((learner) => {
          const lessons = buildLessons({
            course,
            projects: projectMap,
            simulatorProgress: learner.simulator as Record<string, ProjectProgress>,
            completedArticleIds: new Set(learner.completedArticleIds),
            loggedIn: true,
          });
          const c = courseCompletion(lessons);
          return { learner, done: c.done, total: c.total, percent: c.percent, graduated: c.allDone };
        });
        if (!cancelled) setState({ status: 'ready', course, rows });
      } catch (e) {
        if (!cancelled) setState({ status: 'error', message: e instanceof Error ? e.message : 'Gagal memuat peserta.' });
      }
    })();
    return () => { cancelled = true; };
  }, [slug, token]);

  const header = (
    <div className={`${ADMIN_CARD_HEADER} justify-between`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar course"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Peserta{state.status === 'ready' ? `: ${state.course.title}` : ''}</h2>
          <p className="text-xs text-ld-fog m-0 mt-0.5">Peserta = akun yang sudah menandai minimal satu lesson selesai.</p>
        </div>
      </div>
    </div>
  );

  if (state.status !== 'ready') {
    return (
      <div className={ADMIN_CARD}>
        {header}
        <div className={ADMIN_CARD_BODY}>
          {state.status === 'loading' ? <LoadingState label="Memuat peserta…" /> : <p className="m-0 text-sm text-red-600">{state.message}</p>}
        </div>
      </div>
    );
  }

  const { rows } = state;
  const graduated = rows.filter((r) => r.graduated).length;
  const shared = rows.filter((r) => r.learner.sharedProjectIds.length > 0).length;
  const rate = rows.length === 0 ? 0 : Math.round((graduated / rows.length) * 100);

  return (
    <div className={ADMIN_CARD}>
      {header}
      <div className={ADMIN_CARD_BODY}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Stat label="Peserta" value={String(rows.length)} hint="Mulai course" />
          <Stat label="Lulus" value={String(graduated)} hint="Semua lesson selesai" />
          <Stat label="Completion" value={`${rate}%`} hint="Lulus / peserta" />
          <Stat label="Portfolio dibagikan" value={String(shared)} hint="Link share aktif" />
        </div>

        <div className="overflow-x-auto border border-ld-frost rounded-xl">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ld-cloud text-left">
                <th className="px-4 py-3 text-xs font-medium text-ld-steel">Peserta</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Progress</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Terakhir aktif</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ learner, done, total, percent, graduated: isGraduate }) => (
                <tr key={learner.key} className="border-t border-ld-frost bg-white">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-[160px]">
                      {learner.avatarUrl ? (
                        <img src={learner.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-ld-frost shrink-0" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-ld-cloud border border-ld-frost shrink-0" />
                      )}
                      <span className="text-sm text-ld-onyx">{learner.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-ld-frost overflow-hidden"><div className="h-full bg-ld-violet" style={{ width: `${percent}%` }} /></div>
                      <span className="text-xs text-ld-slate tabular-nums whitespace-nowrap">{done}/{total}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-xs">
                      {isGraduate
                        ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 size={13} /> Lulus</span>
                        : <span className="text-ld-slate">Sedang belajar</span>}
                      {learner.sharedProjectIds.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-ld-violet" title="Link share portfolio aktif"><Link2 size={12} /> Share</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">{formatDate(learner.lastActiveAt)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada peserta.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QaCourseLearnersPanel;
