import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Globe, Loader2 } from 'lucide-react';
import type { QaSimulatorPortfolioConfig } from '../../../../types/portfolio';
import type { ProjectProgressRecord, SimulatorProject } from '../../../../types/qaSimulator';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import {
  apiListSimulatorProgress, apiSetSimulatorShare, fetchSimulatorProject,
} from '../../../qa-simulator/lib/simulatorApi';
import { isPortfolioReady, projectCompletion } from '../../../qa-simulator/lib/progress';
import Checkbox from '../../../../components/common/Checkbox';

interface QaSimulatorPortfolioFieldProps {
  value: QaSimulatorPortfolioConfig;
  onChange: (value: QaSimulatorPortfolioConfig) => void;
  /** Portfolio owner; null while creating (the creator becomes the owner). */
  ownerId: string | null;
}

interface Row {
  project: SimulatorProject;
  record: ProjectProgressRecord;
  percent: number;
  done: boolean;
}

type LoadState = { status: 'loading' } | { status: 'ready'; rows: Row[] } | { status: 'error' };

// Lists the signed-in owner's QA Simulator projects so they can pick which
// finished ones appear as cards. Ticking a project that isn't shared yet turns
// its public link on; unticking only hides the card (the link stays as is,
// it's managed on the simulator portfolio page).
const QaSimulatorPortfolioField: React.FC<QaSimulatorPortfolioFieldProps> = ({ value, onChange, ownerId }) => {
  const token = useAdminAuthStore((s) => s.token);
  const userId = useAdminAuthStore((s) => s.user?.id ?? null);
  const isOwner = Boolean(userId && (ownerId === null || ownerId === userId));
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOwner || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const records = await apiListSimulatorProgress(token);
        const projects = await Promise.all(records.map((r) => fetchSimulatorProject(r.projectId).catch(() => null)));
        const rows: Row[] = [];
        records.forEach((record, i) => {
          const project = projects[i];
          if (!project) return;
          const { percent } = projectCompletion(project, record.data);
          rows.push({ project, record, percent, done: isPortfolioReady(project, record.data) });
        });
        if (!cancelled) setState({ status: 'ready', rows });
      } catch {
        if (!cancelled) setState({ status: 'error' });
      }
    })();
    return () => { cancelled = true; };
  }, [isOwner, token]);

  if (!isOwner) {
    return (
      <p className="m-0 text-sm text-ld-slate">
        Section ini diatur oleh pemilik portfolio dari dashboard member mereka, karena berisi hasil QA Simulator di akun mereka.
      </p>
    );
  }
  if (state.status === 'loading') return <Loader2 size={18} className="animate-spin text-ld-fog" aria-label="Memuat project QA Simulator" />;
  if (state.status === 'error') return <p className="m-0 text-sm text-red-600">Gagal memuat project QA Simulator. Coba muat ulang halaman.</p>;

  const { rows } = state;
  if (rows.length === 0) {
    return (
      <p className="m-0 text-sm text-ld-slate">
        Kamu belum mengerjakan project di <Link to="/qa-simulator" className="text-ld-violet">QA Simulator</Link>. Selesaikan satu project, lalu tampilkan hasilnya di sini.
      </p>
    );
  }

  const selected = new Set(value.projectIds);

  const setRowShare = (projectId: string, shareId: string | null) => {
    setState((prev) => (prev.status === 'ready'
      ? { ...prev, rows: prev.rows.map((r) => (r.project.id === projectId ? { ...r, record: { ...r.record, shareId } } : r)) }
      : prev));
  };

  const enableShare = async (row: Row) => {
    if (!token) return false;
    setBusyId(row.project.id);
    setError(null);
    try {
      const record = await apiSetSimulatorShare(row.project.id, true, token);
      setRowShare(row.project.id, record.shareId ?? null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membuat link publik.');
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const toggle = async (row: Row) => {
    const id = row.project.id;
    if (selected.has(id)) {
      onChange({ projectIds: value.projectIds.filter((p) => p !== id) });
      return;
    }
    if (!row.record.shareId && !(await enableShare(row))) return;
    onChange({ projectIds: [...value.projectIds, id] });
  };

  return (
    <div>
      <p className="m-0 mb-4 text-sm text-ld-slate">
        Pilih project yang sudah selesai untuk ditampilkan sebagai card. Mencentang project yang belum dibagikan akan membuat link publiknya.
      </p>
      <ul className="m-0 p-0 list-none space-y-2">
        {rows.map((row) => {
          const id = row.project.id;
          const checked = selected.has(id);
          const linkOff = checked && !row.record.shareId;
          return (
            <li key={id} className={`rounded-lg border p-3 sm:p-4 ${checked ? 'border-ld-violet bg-ld-lilac/30' : 'border-ld-frost'}`}>
              <Checkbox
                checked={checked}
                disabled={!row.done || busyId === id}
                onChange={() => toggle(row)}
                size="sm"
                className="!gap-3"
                labelClassName="flex items-start gap-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ld-onyx">{row.project.title}</span>
                  <span className="block mt-0.5 text-xs text-ld-slate">
                    {row.done ? 'Selesai' : `Progress ${row.percent}%. Selesaikan semua phase dulu.`}
                    {row.done && row.record.shareId && (
                      <span className="inline-flex items-center gap-1 ml-2 text-emerald-700"><Globe size={12} /> Link publik aktif</span>
                    )}
                  </span>
                </span>
                {busyId === id && <Loader2 size={16} className="animate-spin text-ld-fog shrink-0" />}
              </Checkbox>
              {linkOff && (
                <div className="mt-2 ml-7 flex flex-wrap items-center gap-2 text-xs text-amber-700">
                  <AlertTriangle size={13} /> Link publiknya sedang dimatikan, jadi card ini tidak tampil.
                  <button
                    type="button"
                    onClick={() => enableShare(row)}
                    disabled={busyId === id}
                    className="px-2 py-1 rounded-md border border-amber-300 bg-white text-amber-800 cursor-pointer"
                  >
                    Nyalakan lagi
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className="m-0 mt-3 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default QaSimulatorPortfolioField;
