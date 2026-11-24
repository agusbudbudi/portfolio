import React, { useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react';
import { useAdminFeedbackStore } from '../../../../../store/useAdminFeedbackStore';
import {
  CREATABLE_FEEDBACK_TYPES, FEEDBACK_LIMITS, FEEDBACK_TYPE_LABEL,
  type FeedbackOption, type FeedbackQuestionConfig, type FeedbackQuestionData, type FeedbackQuestionType,
} from '../../../../../types/feedback';
import { lockedQuestionChange, validateFeedbackQuestion } from '../../../../../lib/feedbackValidation';
import FormField, { RequiredMark } from '../../shared/FormField';
import StatusBadge from '../../shared/StatusBadge';
import Select from '../../../../../components/common/Select';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY, ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY, ADMIN_FORM_FOOTER, ADD_ITEM_BUTTON } from '../../shared/adminCard';
import { iconBtn, infoBox, infoLabel, inputClass, move, newOptionId, smallInputClass } from './feedbackStyles';
import Checkbox from '../../../../../components/common/Checkbox';

interface Props {
  questionId: string | null; // null = create
  onClose: () => void;
  /** Called with the new question's id after a create (flow editor adds it). */
  onCreated?: (id: string) => void;
  backLabel?: string;
}

const blankOptions = (n: number): FeedbackOption[] => Array.from({ length: n }, () => ({ id: newOptionId(), label: '' }));

function defaultConfig(type: FeedbackQuestionType): FeedbackQuestionConfig {
  if (type === 'scale') return { options: blankOptions(4) };
  if (type === 'single_choice') return { options: blankOptions(3) };
  if (type === 'multi_choice') return { options: blankOptions(4), maxSelect: 2 };
  if (type === 'text') return { multiline: false, maxLength: FEEDBACK_LIMITS.defaultTextMaxLength };
  return {};
}

const FeedbackQuestionForm: React.FC<Props> = ({ questionId, onClose, onCreated, backLabel = 'Kembali ke bank pertanyaan' }) => {
  const { questions, flows, saveQuestion, duplicateQuestion } = useAdminFeedbackStore();
  const existing = questionId ? questions.find((q) => q.id === questionId) ?? null : null;
  const answered = (existing?.answerCount ?? 0) > 0;
  const isSystem = Boolean(existing?.isSystem);

  const [data, setData] = useState<FeedbackQuestionData>(() => existing
    ? { type: existing.type, prompt: existing.prompt, helpText: existing.helpText, config: existing.config, status: existing.status }
    : { type: 'scale', prompt: '', config: defaultConfig('scale'), status: 'active' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const usedBy = existing ? flows.filter((f) => f.items.some((i) => i.questionId === existing.id) || (isSystem && f.askConsent)) : [];
  const options = data.config.options ?? [];
  const hasOptions = data.type === 'scale' || data.type === 'single_choice' || data.type === 'multi_choice';
  const optionWord = data.type === 'scale' ? 'Level' : 'Opsi';

  const setConfig = (patch: Partial<FeedbackQuestionConfig>) => setData((d) => ({ ...d, config: { ...d.config, ...patch } }));
  const setOptions = (next: FeedbackOption[]) => setConfig({ options: next });
  const updateOption = (i: number, patch: Partial<FeedbackOption>) => setOptions(options.map((o, j) => (j === i ? { ...o, ...patch } : o)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateFeedbackQuestion(data);
    if (!result.ok) { setError(result.errors.join(' ')); return; }
    if (existing && answered) {
      const locked = lockedQuestionChange(existing, result.question);
      if (locked) { setError(locked); return; }
    }
    setError(null);
    setSaving(true);
    const saved = await saveQuestion(questionId, result.question);
    setSaving(false);
    if (!saved.ok) { setError(saved.reason ?? 'Gagal menyimpan pertanyaan.'); return; }
    if (!questionId && saved.id) onCreated?.(saved.id);
    onClose();
  };

  const handleDuplicate = async () => {
    if (!existing) return;
    setSaving(true);
    const result = await duplicateQuestion(existing.id);
    setSaving(false);
    if (!result.ok) setError(result.reason ?? 'Gagal menduplikat.');
    else onClose();
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
            aria-label={backLabel}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-ld-onyx m-0">{existing ? 'Edit pertanyaan' : 'Tambah pertanyaan'}</h2>
            <p className="text-xs text-ld-fog m-0 mt-0.5">Bank pertanyaan</p>
          </div>
        </div>
        {existing && (isSystem ? <StatusBadge tone="violet">sistem</StatusBadge> : <StatusBadge tone={data.status === 'active' ? 'emerald' : 'slate'}>{data.status}</StatusBadge>)}
      </div>

      <form onSubmit={handleSubmit} className={ADMIN_CARD_BODY}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 flex flex-col gap-4">
            <FormField
              label="Tipe"
              required
              hint={answered || isSystem ? <span className="block text-[11px] text-ld-steel mt-1">{isSystem ? 'Pertanyaan sistem, hanya teksnya yang bisa diubah.' : 'Tipe dikunci karena pertanyaan ini sudah punya jawaban.'}</span> : undefined}
            >
              <Select
                value={data.type}
                onChange={(v) => { const type = v as FeedbackQuestionType; setData((d) => ({ ...d, type, config: defaultConfig(type) })); }}
                options={(isSystem ? (['consent'] as FeedbackQuestionType[]) : CREATABLE_FEEDBACK_TYPES).map((t) => ({ value: t, label: FEEDBACK_TYPE_LABEL[t] }))}
                disabled={answered || isSystem}
                className={inputClass}
                aria-label="Tipe pertanyaan"
              />
            </FormField>

            <FormField label={isSystem ? 'Teks consent' : 'Pertanyaan'} required>
              <textarea
                rows={2}
                value={data.prompt}
                onChange={(e) => setData((d) => ({ ...d, prompt: e.target.value }))}
                maxLength={FEEDBACK_LIMITS.promptLength}
                placeholder="Seberapa yakin kamu…"
                className={`${inputClass} resize-y`}
              />
            </FormField>

            {!isSystem && (
              <FormField label="Teks bantuan">
                <input
                  value={data.helpText ?? ''}
                  onChange={(e) => setData((d) => ({ ...d, helpText: e.target.value || undefined }))}
                  maxLength={FEEDBACK_LIMITS.helpLength}
                  placeholder="Opsional, tampil kecil di bawah pertanyaan"
                  className={inputClass}
                />
              </FormField>
            )}

            {hasOptions && (
              <div>
                <p className="m-0 mb-1.5 text-xs font-medium text-ld-graphite">
                  {optionWord}<RequiredMark />{' '}
                  <span className="font-normal text-ld-steel">
                    {FEEDBACK_LIMITS.minOptions} sampai {FEEDBACK_LIMITS.maxOptions}{data.type === 'scale' ? ', urut dari paling rendah' : ''}
                  </span>
                </p>
                <ol className="m-0 p-0 list-none flex flex-col gap-2">
                  {options.map((opt, i) => (
                    <li key={opt.id} className="flex items-center gap-2 rounded-lg border border-ld-frost bg-white p-2.5">
                      <span className="w-6 h-6 shrink-0 rounded-full bg-ld-cloud text-[11px] font-semibold text-ld-slate flex items-center justify-center">{i + 1}</span>
                      <input
                        value={opt.label}
                        onChange={(e) => updateOption(i, { label: e.target.value })}
                        maxLength={FEEDBACK_LIMITS.optionLabelLength}
                        placeholder={data.type === 'scale' ? 'Label, misal: Bisa sendiri' : 'Label opsi'}
                        aria-label={`Label ${optionWord.toLowerCase()} ${i + 1}`}
                        className={`${smallInputClass} flex-1`}
                      />
                      {data.type === 'scale' && (
                        <input
                          value={opt.description ?? ''}
                          onChange={(e) => updateOption(i, { description: e.target.value || undefined })}
                          maxLength={FEEDBACK_LIMITS.optionDescLength}
                          placeholder="Deskripsi, misal: untuk fitur sederhana"
                          aria-label={`Deskripsi level ${i + 1}`}
                          className={`${smallInputClass} flex-[1.6]`}
                        />
                      )}
                      <div className="flex items-center shrink-0">
                        <button type="button" onClick={() => setOptions(move(options, i, -1))} disabled={answered || i === 0} className={iconBtn} aria-label={`Naikkan ${optionWord.toLowerCase()} ${i + 1}`}><ArrowUp size={14} /></button>
                        <button type="button" onClick={() => setOptions(move(options, i, 1))} disabled={answered || i === options.length - 1} className={iconBtn} aria-label={`Turunkan ${optionWord.toLowerCase()} ${i + 1}`}><ArrowDown size={14} /></button>
                        <button type="button" onClick={() => setOptions(options.filter((_, j) => j !== i))} disabled={answered || options.length <= FEEDBACK_LIMITS.minOptions} className={`${iconBtn} hover:text-red-500`} aria-label={`Hapus ${optionWord.toLowerCase()} ${i + 1}`}><Trash2 size={14} /></button>
                      </div>
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => setOptions([...options, { id: newOptionId(), label: '' }])}
                  disabled={answered || options.length >= FEEDBACK_LIMITS.maxOptions}
                  className={`${ADD_ITEM_BUTTON} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <Plus size={14} /> Tambah {optionWord.toLowerCase()}
                </button>
              </div>
            )}

            {data.type === 'multi_choice' && (
              <FormField label="Maks. pilihan" required>
                <input
                  type="number"
                  min={1}
                  max={options.length}
                  value={data.config.maxSelect ?? 1}
                  disabled={answered}
                  onChange={(e) => setConfig({ maxSelect: Number(e.target.value) })}
                  className={`${inputClass} max-w-[120px]`}
                />
              </FormField>
            )}

            {data.type === 'text' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Panjang maks. (karakter)" required>
                  <input
                    type="number"
                    min={10}
                    max={FEEDBACK_LIMITS.textMaxLength}
                    value={data.config.maxLength ?? FEEDBACK_LIMITS.defaultTextMaxLength}
                    onChange={(e) => setConfig({ maxLength: Number(e.target.value) })}
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Placeholder">
                  <input value={data.config.placeholder ?? ''} onChange={(e) => setConfig({ placeholder: e.target.value || undefined })} className={inputClass} />
                </FormField>
                <Checkbox checked={Boolean(data.config.multiline)} onChange={(c) => setConfig({ multiline: c })} size="sm" align="center" className="sm:col-span-2" labelClassName="text-sm text-ld-graphite">
                  Isian panjang (textarea), cocok untuk review
                </Checkbox>
              </div>
            )}

            {data.type === 'rating' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Label di bintang 1">
                  <input value={data.config.lowLabel ?? ''} onChange={(e) => setConfig({ lowLabel: e.target.value || undefined })} placeholder="Kurang puas" className={inputClass} />
                </FormField>
                <FormField label="Label di bintang 5">
                  <input value={data.config.highLabel ?? ''} onChange={(e) => setConfig({ highLabel: e.target.value || undefined })} placeholder="Sangat puas" className={inputClass} />
                </FormField>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            {!isSystem && (
              <FormField label="Status" required>
                <Select
                  value={data.status}
                  onChange={(v) => setData((d) => ({ ...d, status: v as FeedbackQuestionData['status'] }))}
                  options={[{ value: 'active', label: 'Active' }, { value: 'archived', label: 'Archived' }]}
                  className={inputClass}
                  aria-label="Status pertanyaan"
                />
              </FormField>
            )}

            {answered && !isSystem && (
              <div role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col gap-2.5">
                <p className="m-0 flex items-center gap-2 text-[13px] font-semibold text-amber-700"><AlertTriangle size={16} /> Sudah ada {existing?.answerCount} jawaban</p>
                <p className="m-0 text-[13px] leading-relaxed text-ld-graphite">
                  Perbaikan kata (typo, ejaan) aman dan berlaku di semua flow. Kalau arti pertanyaan atau levelnya berubah, buat pertanyaan baru supaya data lama tidak tercampur.
                </p>
                <button type="button" onClick={handleDuplicate} disabled={saving} className={`${ADMIN_BTN_SECONDARY} self-start inline-flex items-center gap-1.5`}>
                  <Copy size={15} /> Duplikat jadi pertanyaan baru
                </button>
              </div>
            )}

            {existing && (
              <div className={infoBox}>
                <p className={infoLabel}>Dipakai di {usedBy.length} flow</p>
                {usedBy.length === 0 && <p className="m-0 text-[13px] text-ld-steel">Belum dipakai flow mana pun.</p>}
                {usedBy.map((f) => <p key={f.id} className="m-0 text-[13px] text-ld-violet">{f.name}</p>)}
              </div>
            )}

            <div className={`${infoBox} bg-ld-cloud`}>
              <p className={infoLabel}>Preview di popup</p>
              <p className="m-0 text-[15px] font-semibold leading-snug text-ld-onyx">{data.prompt || 'Teks pertanyaan'}</p>
              {data.helpText && <p className="m-0 text-xs text-ld-slate">{data.helpText}</p>}
              {hasOptions && options.slice(0, 3).map((o) => (
                <span key={o.id} className="px-3 py-2 rounded-lg border-2 border-ld-frost bg-white text-[13px] font-semibold text-ld-onyx">
                  {o.label || '…'}{o.description && <span className="block text-xs font-normal text-ld-slate">{o.description}</span>}
                </span>
              ))}
              {hasOptions && options.length > 3 && <span className="text-xs text-ld-steel">+ {options.length - 3} lainnya</span>}
              {data.type === 'rating' && <span className="text-lg tracking-widest text-ld-violet" aria-hidden="true">★★★★☆</span>}
              {data.type === 'consent' && <Checkbox checked={false} onChange={() => undefined} disabled size="sm" labelClassName="text-[13px] text-ld-graphite">{data.prompt}</Checkbox>}
            </div>
          </div>
        </div>

        {error && <p role="alert" className="m-0 mt-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</p>}
        <div className={`${ADMIN_FORM_FOOTER} mt-6`}>
          <button type="button" onClick={onClose} className={ADMIN_BTN_SECONDARY}>Batal</button>
          <button type="submit" disabled={saving} className={ADMIN_BTN_PRIMARY}>{saving ? 'Menyimpan…' : 'Simpan pertanyaan'}</button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackQuestionForm;
