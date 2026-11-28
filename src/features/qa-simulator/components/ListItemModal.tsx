import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { SimulatorInputSpec } from '../../../types/qaSimulator';
import { isItemFilled } from '../lib/progress';
import FieldControl from './FieldControl';
import JiraBugModal from './JiraBugModal';
import { useLeaveGuard } from '../hooks/useLeaveGuard';
import { DIALOG_BODY, DIALOG_FOOTER, DIALOG_HEADER } from '../../../lib/dialogLayout';
import { confirmAction, useConfirmStore } from '../../../store/useConfirmStore';

type ListSpec = Extract<SimulatorInputSpec, { type: 'list' }>;

interface ListItemModalProps {
  spec: ListSpec;
  /** Null when adding a new item. */
  index: number | null;
  /** 1-based number shown in the title ("Gap #3"). */
  displayNumber: number;
  initial: Record<string, string>;
  readOnly: boolean;
  onSave: (item: Record<string, string>, addAnother: boolean) => void;
  onClose: () => void;
}

// Add/edit form for one list item (gap, scenario, test case, bug). Edits are
// held in a local draft and only committed on Save, so Cancel discards them.
const ListItemModal: React.FC<ListItemModalProps> = ({ spec, index, displayNumber, initial, readOnly, onSave, onClose }) => {
  const [draft, setDraft] = useState<Record<string, string>>(initial);
  const [showErrors, setShowErrors] = useState(false);
  const firstFieldRef = useRef<HTMLDivElement>(null);
  const isNew = index === null;
  const dirty = spec.fields.some((f) => (draft[f.id] ?? '') !== (initial[f.id] ?? ''));
  const complete = isItemFilled(spec, draft);
  const missing = spec.fields.filter((f) => f.required && !(draft[f.id] ?? '').trim());
  // The draft only reaches progress on Save — closing the tab would lose it.
  useLeaveGuard(!readOnly && dirty);

  const requestClose = async () => {
    // Esc while the confirm dialog is open belongs to that dialog.
    if (useConfirmStore.getState().options) return;
    if (!readOnly && dirty) {
      const ok = await confirmAction({
        title: 'Tutup tanpa menyimpan?',
        description: 'Perubahan yang belum disimpan akan hilang.',
        confirmLabel: 'Tutup',
        cancelLabel: 'Lanjut edit',
        variant: 'warning',
        icon: 'alert',
      });
      if (!ok) return;
    }
    onClose();
  };
  const closeRef = useRef(requestClose);
  useEffect(() => { closeRef.current = requestClose; });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    window.addEventListener('keydown', onKey);
    firstFieldRef.current?.querySelector<HTMLElement>('[role="combobox"], select, input, textarea')?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, []);

  const save = (addAnother: boolean) => {
    if (!complete) { setShowErrors(true); return; }
    onSave(draft, addAnother);
    if (addAnother) { setDraft({}); setShowErrors(false); firstFieldRef.current?.querySelector<HTMLElement>('[role="combobox"], select, input, textarea')?.focus(); }
  };

  // Bug reports get a Jira look-alike so the simulation feels like real work.
  if (spec.itemLabel.toLowerCase() === 'bug') {
    return (
      <JiraBugModal
        spec={spec}
        draft={draft}
        onField={(id, value) => setDraft((d) => ({ ...d, [id]: value }))}
        showErrors={showErrors}
        missingCount={missing.length}
        isNew={isNew}
        readOnly={readOnly}
        displayNumber={displayNumber}
        fieldsRef={firstFieldRef}
        requestClose={requestClose}
        onClose={onClose}
        save={save}
      />
    );
  }

  const title = isNew ? `Tambah ${spec.itemLabel.toLowerCase()}` : `${readOnly ? '' : 'Edit '}${spec.itemLabel} #${displayNumber}`;

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-ld-onyx/50 backdrop-blur-sm sm:p-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-item-modal-title"
        className="w-full sm:max-w-2xl h-dvh sm:h-auto sm:max-h-[92vh] flex flex-col bg-white sm:rounded-lg pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 overflow-hidden shadow-2xl"
        initial={{ y: 32, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onSubmit={(e) => { e.preventDefault(); if (!readOnly) save(false); }}
      >
        <div className={`${DIALOG_HEADER} flex items-center justify-between gap-3 px-5 py-4 border-b border-ld-frost`}>
          <div className="min-w-0">
            <h3 id="list-item-modal-title" className="m-0 text-base font-semibold text-ld-onyx truncate">{title}</h3>
            {!readOnly && <p className="m-0 mt-0.5 text-xs text-ld-fog">Field bertanda <span className="text-red-500">*</span> wajib diisi.</p>}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Tutup"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-transparent hover:bg-ld-cloud text-ld-slate hover:text-ld-onyx border-none cursor-pointer shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div ref={firstFieldRef} className={`${DIALOG_BODY} px-5 py-5 grid grid-cols-1 md:grid-cols-2 gap-4`}>
          {spec.fields.map((field) => {
            const inputId = `modal-${spec.itemLabel}-${field.id}`;
            const invalid = showErrors && !!field.required && !(draft[field.id] ?? '').trim();
            return (
              <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label htmlFor={inputId} className="block text-xs font-medium text-ld-slate mb-1.5">
                  {field.label}{field.required && <span className="text-red-500"> *</span>}
                </label>
                <FieldControl
                  field={field}
                  inputId={inputId}
                  value={draft[field.id] ?? ''}
                  disabled={readOnly}
                  invalid={invalid}
                  onChange={(value) => setDraft((d) => ({ ...d, [field.id]: value }))}
                />
                {invalid && <p className="m-0 mt-1 text-[11px] text-red-500">Wajib diisi.</p>}
              </div>
            );
          })}
        </div>

        <div className={`${DIALOG_FOOTER} px-5 py-4 border-t border-ld-frost bg-ld-cloud/50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3`}>
          {readOnly ? (
            <>
              <span className="text-xs text-ld-fog">Tugas sudah disubmit — klik "Edit jawaban" di kartu tugas untuk mengubah.</span>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white border border-ld-ash text-sm font-medium text-ld-graphite cursor-pointer">Tutup</button>
            </>
          ) : (
            <>
              <span className="text-xs text-ld-fog">
                {showErrors && missing.length > 0 ? <span className="text-red-500">Lengkapi {missing.length} field wajib dulu.</span> : 'Isian baru tersimpan setelah klik Simpan.'}
              </span>
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <button type="button" onClick={requestClose} className="px-4 py-2 rounded-lg bg-white border border-ld-ash text-sm font-medium text-ld-graphite cursor-pointer hover:bg-ld-cloud">
                  Batal
                </button>
                {isNew && (
                  <button type="button" onClick={() => save(true)} className="px-4 py-2 rounded-lg bg-white border border-ld-violet text-sm font-medium text-ld-violet cursor-pointer hover:bg-ld-lilac/40">
                    Simpan & tambah lagi
                  </button>
                )}
                <button type="submit" className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer transition-colors">
                  {isNew ? 'Simpan' : 'Simpan perubahan'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.form>
    </motion.div>
  );
};

export default ListItemModal;
