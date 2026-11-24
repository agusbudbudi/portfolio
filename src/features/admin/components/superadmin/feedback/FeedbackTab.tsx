import React, { useEffect, useState } from 'react';
import { Archive, Copy, Lock, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useAdminFeedbackStore } from '../../../../../store/useAdminFeedbackStore';
import { FEEDBACK_TYPE_LABEL, type FeedbackQuestionSummary, type FeedbackQuestionType } from '../../../../../types/feedback';
import LoadingState from '../../../../../components/common/LoadingState';
import Select from '../../../../../components/common/Select';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../../shared/adminCard';
import StatusBadge from '../../shared/StatusBadge';
import FeedbackQuestionForm from './FeedbackQuestionForm';
import FeedbackFlowForm from './FeedbackFlowForm';
import { TypeTag } from './feedbackUi';
import TabToggle from '../../../../../components/common/TabToggle';
import { useConfirmStore } from '../../../../../store/useConfirmStore';

type View = 'flows' | 'questions';
type Editing = { kind: 'question' | 'flow'; id: string | null } | null;

const actionBtn = 'p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
const primaryBtn = 'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors';
const searchInput = 'w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';
const filterSelect = 'px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx';

/**
 * Admin > Feedback: the question bank and the flows built from it. A flow is
 * attached to a course from the course editor (+ Feedback); results live on
 * the course list (Feedback action per course).
 */
const FeedbackTab: React.FC = () => {
  const openConfirm = useConfirmStore((st) => st.open);
  const { questions, flows, loaded, loadError, load, duplicateQuestion, deleteQuestion, saveQuestion, deleteFlow } = useAdminFeedbackStore();
  const [view, setView] = useState<View>('flows');
  const [editing, setEditing] = useState<Editing>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | FeedbackQuestionType>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | ''>('active');
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  const run = async (id: string, fn: () => Promise<{ ok: boolean; reason?: string }>) => {
    setActionError(null);
    setBusyId(id);
    const result = await fn();
    setBusyId(null);
    if (!result.ok) setActionError(result.reason ?? 'Aksi gagal.');
  };

  const setQuestionStatus = (q: FeedbackQuestionSummary, status: FeedbackQuestionSummary['status']) =>
    run(q.id, () => saveQuestion(q.id, { type: q.type, prompt: q.prompt, helpText: q.helpText, config: q.config, status }));

  // Every destructive or copying action asks first (brand ConfirmationDialog, not window.confirm).
  const short = (text: string) => (text.length > 70 ? `${text.slice(0, 70)}…` : text);
  const confirmArchive = (q: FeedbackQuestionSummary) => {
    if (q.status === 'archived') {
      openConfirm({
        mode: 'cta', variant: 'info', icon: 'archive', confirmLabel: 'Aktifkan lagi',
        title: 'Aktifkan lagi pertanyaan ini?',
        description: `"${short(q.prompt)}" akan muncul lagi di pilihan saat menyusun flow.`,
        onConfirm: () => setQuestionStatus(q, 'active'),
      });
      return;
    }
    openConfirm({
      mode: 'cta', variant: 'warning', icon: 'archive', confirmLabel: 'Arsipkan',
      title: 'Arsipkan pertanyaan ini?',
      description: `"${short(q.prompt)}" tidak muncul lagi di pilihan flow baru. Flow yang sudah memakainya dan jawaban lama tetap aman.`,
      onConfirm: () => setQuestionStatus(q, 'archived'),
    });
  };
  const confirmDuplicate = (q: FeedbackQuestionSummary) => openConfirm({
    mode: 'cta', variant: 'info', icon: 'duplicate', confirmLabel: 'Duplikat',
    title: 'Duplikat pertanyaan ini?',
    description: `Salinan "${short(q.prompt)}" dibuat sebagai pertanyaan baru tanpa jawaban, bisa diubah bebas termasuk tipe dan opsinya.`,
    onConfirm: () => run(q.id, () => duplicateQuestion(q.id)),
  });
  const confirmDeleteQuestion = (q: FeedbackQuestionSummary) => openConfirm({
    mode: 'cta', variant: 'danger', icon: 'delete', confirmLabel: 'Hapus',
    title: 'Hapus pertanyaan ini?',
    description: `"${short(q.prompt)}" dihapus permanen dari bank pertanyaan.`,
    onConfirm: () => run(q.id, () => deleteQuestion(q.id)),
  });
  const confirmDeleteFlow = (f: { id: string; name: string }) => openConfirm({
    mode: 'cta', variant: 'danger', icon: 'delete', confirmLabel: 'Hapus flow',
    title: `Hapus flow "${short(f.name)}"?`,
    description: 'Flow dihapus permanen. Pertanyaan di dalamnya tetap ada di bank pertanyaan.',
    onConfirm: () => run(f.id, () => deleteFlow(f.id)),
  });

  if (editing?.kind === 'question') return <FeedbackQuestionForm questionId={editing.id} onClose={() => setEditing(null)} />;
  if (editing?.kind === 'flow') return <FeedbackFlowForm flowId={editing.id} onClose={() => setEditing(null)} />;

  if (!loaded) {
    return (
      <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}>
        {loadError ? <p className="m-0 text-sm text-red-600">{loadError}</p> : <LoadingState label="Memuat feedback…" />}
      </div>
    );
  }

  const q = query.trim().toLowerCase();
  const visibleQuestions = questions.filter((x) =>
    (!q || x.prompt.toLowerCase().includes(q)) && (!typeFilter || x.type === typeFilter) && (!statusFilter || x.status === statusFilter));

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between flex-wrap`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{view === 'flows' ? 'Flow feedback' : 'Bank pertanyaan'}</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">
            {view === 'flows'
              ? `${flows.length} flow. Flow = urutan pertanyaan dari bank yang dipasang di checkpoint course.`
              : `${questions.length} pertanyaan. Tulis sekali, pakai di banyak flow.`}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <TabToggle
            label="Feedback"
            value={view}
            onChange={(v) => { setView(v); setActionError(null); }}
            options={[
              { value: 'flows', label: 'Flow', count: flows.length },
              { value: 'questions', label: 'Bank pertanyaan', count: questions.length },
            ]}
          />
          <button type="button" onClick={() => setEditing({ kind: view === 'flows' ? 'flow' : 'question', id: null })} className={primaryBtn}>
            <Plus size={15} /> {view === 'flows' ? 'Tambah flow' : 'Tambah pertanyaan'}
          </button>
        </div>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {actionError && <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{actionError}</p>}

        {view === 'flows' ? (
          <div className="overflow-x-auto border border-ld-frost rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ld-cloud text-left">
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel">Flow</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Isi</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Dipakai di</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Jawaban</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {flows.map((f) => (
                  <tr key={f.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setEditing({ kind: 'flow', id: f.id })} className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left">
                        {f.name}
                      </button>
                      <p className="m-0 mt-0.5 text-xs text-ld-steel">Judul popup: {f.title}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">
                      {f.items.length} pertanyaan{f.askConsent ? ' + consent' : ''}
                    </td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      {f.usedIn.length > 0
                        ? <span className="text-ld-violet" title={f.usedIn.map((u) => u.courseTitle).join(', ')}>{f.usedIn.length} checkpoint</span>
                        : <span className="text-ld-fog">Belum dipakai</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-slate tabular-nums">{f.answerCount}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge tone={f.status === 'active' ? 'emerald' : 'slate'}>{f.status}</StatusBadge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" onClick={() => setEditing({ kind: 'flow', id: f.id })} className={actionBtn} aria-label={`Edit flow ${f.name}`}><Pencil size={15} /></button>
                        <button
                          type="button"
                          disabled={busyId === f.id || f.usedIn.length > 0}
                          title={f.usedIn.length > 0 ? 'Masih dipakai checkpoint course' : undefined}
                          onClick={() => confirmDeleteFlow(f)}
                          className={`${actionBtn} hover:text-red-500 hover:bg-red-50`}
                          aria-label={`Hapus flow ${f.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {flows.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada flow. Mulai dengan menulis pertanyaan di Bank pertanyaan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <label className="relative flex-1 min-w-[220px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ld-fog" aria-hidden="true" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pertanyaan" aria-label="Cari pertanyaan" className={searchInput} />
              </label>
              <Select
                value={typeFilter}
                onChange={(v) => setTypeFilter(v as '' | FeedbackQuestionType)}
                options={[{ value: '', label: 'Semua tipe' }, ...Object.entries(FEEDBACK_TYPE_LABEL).map(([value, label]) => ({ value, label }))]}
                className={`${filterSelect} w-48`}
                aria-label="Filter tipe"
              />
              <Select
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as 'active' | 'archived' | '')}
                options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }, { value: '', label: 'Semua status' }]}
                className={`${filterSelect} w-40`}
                aria-label="Filter status"
              />
            </div>
            <div className="overflow-x-auto border border-ld-frost rounded-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ld-cloud text-left">
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Pertanyaan</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Tipe</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Dipakai di</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Jawaban</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleQuestions.map((x) => (
                    <tr key={x.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                      <td className="px-4 py-3 min-w-[280px]">
                        <button type="button" onClick={() => setEditing({ kind: 'question', id: x.id })} className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left">
                          {x.prompt}
                        </button>
                      </td>
                      <td className="px-4 py-3"><TypeTag type={x.type} /></td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        {x.flowCount > 0 ? <span className="text-ld-violet">{x.flowCount} flow</span> : <span className="text-ld-fog">Belum dipakai</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-ld-slate tabular-nums">{x.answerCount}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {x.isSystem
                          ? <StatusBadge tone="violet">sistem</StatusBadge>
                          : <StatusBadge tone={x.status === 'active' ? 'emerald' : 'slate'}>{x.status}</StatusBadge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setEditing({ kind: 'question', id: x.id })} className={actionBtn} aria-label="Edit pertanyaan"><Pencil size={15} /></button>
                          {x.isSystem ? (
                            <span className="p-2 text-ld-fog" title="Pertanyaan sistem tidak bisa diduplikat atau diarsipkan"><Lock size={15} aria-label="Pertanyaan sistem" /></span>
                          ) : (
                            <>
                              <button type="button" disabled={busyId === x.id} onClick={() => confirmDuplicate(x)} className={actionBtn} aria-label="Duplikat pertanyaan"><Copy size={15} /></button>
                              {x.answerCount > 0 || x.flowCount > 0 ? (
                                <button type="button" disabled={busyId === x.id} onClick={() => confirmArchive(x)} className={actionBtn} aria-label={x.status === 'archived' ? 'Aktifkan lagi' : 'Arsipkan pertanyaan'} title={x.status === 'archived' ? 'Aktifkan lagi' : 'Arsipkan'}><Archive size={15} /></button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={busyId === x.id}
                                  onClick={() => confirmDeleteQuestion(x)}
                                  className={`${actionBtn} hover:text-red-500 hover:bg-red-50`}
                                  aria-label="Hapus pertanyaan"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visibleQuestions.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-ld-fog">Tidak ada pertanyaan yang cocok.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="m-0 mt-3 text-xs text-ld-steel">Pertanyaan yang sudah punya jawaban atau dipakai flow tidak bisa dihapus, hanya diarsipkan. Arsip tidak muncul di pilihan flow baru.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackTab;
