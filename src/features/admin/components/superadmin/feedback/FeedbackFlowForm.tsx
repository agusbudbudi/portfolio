import React, { useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowUp, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useAdminFeedbackStore } from '../../../../../store/useAdminFeedbackStore';
import { FEEDBACK_LIMITS, type FeedbackFlowData } from '../../../../../types/feedback';
import { buildPublicFlow, validateFeedbackFlow } from '../../../../../lib/feedbackValidation';
import FeedbackCheckpointModal from '../../../../feedback/FeedbackCheckpointModal';
import FormField from '../../shared/FormField';
import StatusBadge from '../../shared/StatusBadge';
import Select from '../../../../../components/common/Select';
import {
  ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY, ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY, ADMIN_FORM_FOOTER, ADD_ITEM_BUTTON,
} from '../../shared/adminCard';
import FeedbackQuestionForm from './FeedbackQuestionForm';
import { iconBtn, infoBox, infoLabel, inputClass, move, smallInputClass } from './feedbackStyles';
import { TypeTag } from './feedbackUi';
import Checkbox from '../../../../../components/common/Checkbox';

interface Props {
  flowId: string | null; // null = create
  onClose: () => void;
}

const FeedbackFlowForm: React.FC<Props> = ({ flowId, onClose }) => {
  const { questions, flows, saveFlow } = useAdminFeedbackStore();
  const existing = flowId ? flows.find((f) => f.id === flowId) ?? null : null;
  const [data, setData] = useState<FeedbackFlowData>(() => existing
    ? { name: existing.name, title: existing.title, intro: existing.intro, status: existing.status, items: existing.items, askConsent: existing.askConsent }
    : { name: '', title: 'Feedback modul', intro: '', status: 'draft', items: [], askConsent: true });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [pickQuery, setPickQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const byId = useMemo(() => Object.fromEntries(questions.map((q) => [q.id, q])), [questions]);
  // The flow as a learner would get it right now, unsaved edits included.
  const previewFlow = useMemo(
    () => buildPublicFlow({ ...data, id: existing?.id ?? 'preview', createdAt: '', updatedAt: '' }, byId),
    [data, existing?.id, byId],
  );
  const inFlow = new Set(data.items.map((i) => i.questionId));
  const originalIds = new Set(existing?.items.map((i) => i.questionId) ?? []);
  // The bank minus the system consent question (it has its own toggle) and archived ones.
  const pickable = questions.filter((q) => !q.isSystem && q.status === 'active' && q.prompt.toLowerCase().includes(pickQuery.trim().toLowerCase()));
  const requiredCount = data.items.filter((i) => i.required).length;
  const full = data.items.length >= FEEDBACK_LIMITS.maxFlowItems;

  const setItems = (items: FeedbackFlowData['items']) => setData((d) => ({ ...d, items }));
  const addQuestions = (ids: string[]) => {
    const fresh = ids.filter((id) => !inFlow.has(id)).slice(0, FEEDBACK_LIMITS.maxFlowItems - data.items.length);
    setItems([...data.items, ...fresh.map((questionId) => ({ questionId, required: byId[questionId]?.type !== 'text' }))]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateFeedbackFlow(data);
    if (!result.ok) { setError(result.errors.join(' ')); return; }
    setError(null);
    setSaving(true);
    const saved = await saveFlow(flowId, result.flow);
    setSaving(false);
    if (!saved.ok) { setError(saved.reason ?? 'Gagal menyimpan flow.'); return; }
    onClose();
  };

  if (creating) {
    return (
      <FeedbackQuestionForm
        questionId={null}
        backLabel="Kembali ke flow"
        onClose={() => setCreating(false)}
        onCreated={(id) => addQuestions([id])}
      />
    );
  }

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Kembali ke daftar flow"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">{existing ? 'Edit flow' : 'Tambah flow'}</h2>
            <p className="text-xs text-ld-fog m-0 mt-0.5">Flow feedback</p>
          </div>
        </div>
        <StatusBadge tone={data.status === 'active' ? 'emerald' : 'slate'}>{data.status}</StatusBadge>
      </div>

      <form onSubmit={handleSubmit} className={ADMIN_CARD_BODY}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nama flow" required hint={<span className="block text-[11px] text-ld-steel mt-1">Hanya terlihat admin.</span>}>
                <input value={data.name} onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))} maxLength={FEEDBACK_LIMITS.nameLength} placeholder="Refleksi akhir modul" className={inputClass} />
              </FormField>
              <FormField label="Judul di popup" required>
                <input value={data.title} onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))} maxLength={FEEDBACK_LIMITS.titleLength} className={inputClass} />
              </FormField>
            </div>
            <FormField label="Teks pembuka">
              <textarea
                rows={2}
                value={data.intro ?? ''}
                onChange={(e) => setData((d) => ({ ...d, intro: e.target.value }))}
                maxLength={FEEDBACK_LIMITS.introLength}
                placeholder="Bantu kami memperbaiki materi. Ada 5 pertanyaan singkat, sekitar 1 menit."
                className={`${inputClass} resize-y`}
              />
            </FormField>

            <div>
              <p className="m-0 mb-1.5 text-xs font-medium text-ld-graphite">
                Urutan pertanyaan <span className="font-normal text-ld-steel">1 pertanyaan per layar, {FEEDBACK_LIMITS.minFlowItems} sampai {FEEDBACK_LIMITS.maxFlowItems} (disarankan maks. 6)</span>
              </p>
              {data.items.length === 0 && <p className="m-0 px-4 py-3 rounded-lg border border-dashed border-ld-ash text-sm text-ld-steel">Belum ada pertanyaan. Pilih dari bank atau buat baru.</p>}
              <ol className="m-0 p-0 list-none flex flex-col gap-2">
                {data.items.map((item, i) => {
                  const q = byId[item.questionId];
                  return (
                    <li key={item.questionId} className="flex items-center gap-2.5 rounded-lg border border-ld-frost bg-white p-2.5">
                      <span className="w-5 shrink-0 text-xs font-semibold text-ld-steel text-center">{i + 1}</span>
                      {q && <TypeTag type={q.type} />}
                      <span className={`flex-1 min-w-0 text-sm ${q ? 'text-ld-onyx' : 'text-red-600'}`}>
                        {q ? q.prompt : 'Pertanyaan sudah dihapus dari bank'}
                        {q?.status === 'archived' && <span className="ml-1.5 text-xs text-ld-steel">(diarsipkan)</span>}
                      </span>
                      <Checkbox
                        checked={item.required}
                        onChange={(c) => setItems(data.items.map((it, j) => (j === i ? { ...it, required: c } : it)))}
                        size="sm"
                        align="center"
                        className="shrink-0 !gap-1.5"
                        labelClassName="text-xs text-ld-slate whitespace-nowrap"
                      >
                        Wajib
                      </Checkbox>
                      <div className="flex items-center shrink-0">
                        <button type="button" onClick={() => setItems(move(data.items, i, -1))} disabled={i === 0} className={iconBtn} aria-label={`Naikkan pertanyaan ${i + 1}`}><ArrowUp size={14} /></button>
                        <button type="button" onClick={() => setItems(move(data.items, i, 1))} disabled={i === data.items.length - 1} className={iconBtn} aria-label={`Turunkan pertanyaan ${i + 1}`}><ArrowDown size={14} /></button>
                        <button type="button" onClick={() => setItems(data.items.filter((_, j) => j !== i))} className={`${iconBtn} hover:text-red-500`} aria-label={`Keluarkan pertanyaan ${i + 1} dari flow`}><Trash2 size={14} /></button>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="flex flex-wrap gap-2">
                <button type="button" aria-expanded={pickerOpen} disabled={full} onClick={() => { setPickerOpen((o) => !o); setPicked([]); }} className={`${ADD_ITEM_BUTTON} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <Plus size={14} /> Pilih dari bank
                </button>
                <button type="button" disabled={full} onClick={() => setCreating(true)} className={`${ADD_ITEM_BUTTON} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <Plus size={14} /> Buat pertanyaan baru
                </button>
              </div>
              {pickerOpen && (
                <div className="mt-2 rounded-xl border border-ld-frost bg-white overflow-hidden shadow-[0_8px_24px_rgba(39,40,53,0.08)]">
                  <label className="relative block p-3">
                    <Search size={15} className="absolute left-6 top-1/2 -translate-y-1/2 text-ld-fog" aria-hidden="true" />
                    <input value={pickQuery} onChange={(e) => setPickQuery(e.target.value)} placeholder="Cari di bank pertanyaan" aria-label="Cari di bank pertanyaan" className={`${smallInputClass} pl-9`} />
                  </label>
                  <ul className="m-0 p-0 list-none max-h-72 overflow-y-auto">
                    {pickable.map((q) => {
                      const already = inFlow.has(q.id);
                      return (
                        <li key={q.id}>
                          <Checkbox
                            disabled={already}
                            checked={already || picked.includes(q.id)}
                            onChange={(c) => setPicked((p) => (c ? [...p, q.id] : p.filter((x) => x !== q.id)))}
                            size="sm"
                            align="center"
                            className={`px-3 py-2.5 border-t border-ld-frost ${already ? '' : 'hover:bg-ld-cloud'}`}
                            labelClassName="flex items-center gap-2.5"
                          >
                            <TypeTag type={q.type} />
                            <span className={`flex-1 text-[13px] ${already ? 'text-ld-fog' : 'text-ld-onyx'}`}>{q.prompt}</span>
                            {already && <span className="text-[11px] text-ld-fog">Sudah di flow</span>}
                          </Checkbox>
                        </li>
                      );
                    })}
                    {pickable.length === 0 && <li className="px-3 py-3 border-t border-ld-frost text-sm text-ld-steel">Tidak ada pertanyaan aktif yang cocok.</li>}
                  </ul>
                  <div className="flex justify-end gap-2 px-3 py-2.5 border-t border-ld-frost bg-ld-cloud">
                    <button type="button" onClick={() => setPickerOpen(false)} className={`${ADMIN_BTN_SECONDARY} !px-3 !py-1.5 text-[13px]`}>Batal</button>
                    <button type="button" disabled={picked.length === 0} onClick={() => { addQuestions(picked); setPickerOpen(false); setPicked([]); }} className={`${ADMIN_BTN_PRIMARY} !px-3 !py-1.5 text-[13px]`}>
                      Tambahkan{picked.length ? ` (${picked.length})` : ''}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Checkbox
              checked={data.askConsent}
              onChange={(c) => setData((d) => ({ ...d, askConsent: c }))}
              className="!gap-3 p-4 rounded-xl border border-ld-frost bg-ld-cloud"
              labelClassName="block text-[13px] font-semibold text-ld-onyx"
              description={<span className="leading-relaxed text-ld-slate">Checkbox consent (pertanyaan sistem) tampil di layar review. Default tidak tercentang.</span>}
            >
              Minta izin testimoni
            </Checkbox>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <FormField label="Status" required hint={<span className="block text-[11px] text-ld-steel mt-1">Flow draft tidak tampil ke learner.</span>}>
              <Select
                value={data.status}
                onChange={(v) => setData((d) => ({ ...d, status: v as FeedbackFlowData['status'] }))}
                options={[{ value: 'draft', label: 'Draft' }, { value: 'active', label: 'Active' }]}
                className={inputClass}
                aria-label="Status flow"
              />
            </FormField>
            <div className={infoBox}>
              <p className={infoLabel}>Dipakai di {existing?.usedIn.length ?? 0} checkpoint</p>
              {(existing?.usedIn ?? []).map((u) => <p key={u.checkpointId} className="m-0 text-[13px] text-ld-violet">{u.courseTitle}</p>)}
              <p className="m-0 text-xs leading-relaxed text-ld-steel">Pasang flow dari editor course lewat tombol + Feedback. Flow yang dipakai course tidak bisa dihapus.</p>
            </div>
            <div className={infoBox}>
              <p className={infoLabel}>Ringkasan</p>
              <p className="m-0 text-[13px] text-ld-graphite">{data.items.length} pertanyaan, {requiredCount} wajib{data.askConsent ? ', + consent' : ''}</p>
              {[...originalIds].some((id) => !inFlow.has(id)) && existing && existing.answerCount > 0 && (
                <p className="m-0 text-xs text-amber-700">Pertanyaan yang dikeluarkan tetap terbaca di hasil lama.</p>
              )}
            </div>
          </div>
        </div>

        {error && <p role="alert" className="m-0 mt-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</p>}
        <div className={`${ADMIN_FORM_FOOTER} mt-6`}>
          <button
            type="button"
            onClick={() => setPreviewing(true)}
            disabled={previewFlow.questions.length === 0}
            className={`${ADMIN_BTN_SECONDARY} inline-flex items-center gap-1.5 mr-auto disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Eye size={15} /> Pratinjau
          </button>
          <button type="button" onClick={onClose} className={ADMIN_BTN_SECONDARY}>Batal</button>
          <button type="submit" disabled={saving} className={ADMIN_BTN_PRIMARY}>{saving ? 'Menyimpan…' : 'Simpan flow'}</button>
        </div>
      </form>

      {/* Same popup learners get; nothing is sent or stored. */}
      <AnimatePresence>
        {previewing && (
          <FeedbackCheckpointModal
            previewMode
            flow={previewFlow}
            contextLabel={`Pratinjau · ${data.name || 'Flow baru'}`}
            introTitle="Modul 1 selesai!"
            introVariant="module"
            initialAnswers={{}}
            onAnswersChange={() => undefined}
            onSubmit={async () => null}
            onSnooze={() => setPreviewing(false)}
            onDontAsk={() => setPreviewing(false)}
            onDone={() => setPreviewing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackFlowForm;
