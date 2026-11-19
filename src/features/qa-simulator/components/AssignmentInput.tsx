import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AlertTriangle, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import type { AssignmentContent, SimulatorInputSpec } from '../../../types/qaSimulator';
import { isItemFilled } from '../lib/progress';
import { SIM_INPUT } from '../lib/ui';
import ListItemModal from './ListItemModal';

interface AssignmentInputProps {
  spec: SimulatorInputSpec;
  content: AssignmentContent;
  disabled: boolean;
  onChange: (content: AssignmentContent) => void;
}

const AssignmentInput: React.FC<AssignmentInputProps> = ({ spec, content, disabled, onChange }) => {
  if (spec.type === 'textarea') {
    const len = (content.text ?? '').trim().length;
    const min = spec.minLength ?? 0;
    const met = len >= min;
    return (
      <div>
        <textarea
          className={`${SIM_INPUT} min-h-[200px] resize-y leading-relaxed`}
          value={content.text ?? ''}
          placeholder={spec.placeholder}
          disabled={disabled}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          aria-label="Jawaban"
        />
        {min > 0 && (
          <p className={`m-0 mt-1.5 text-right text-[11px] tabular-nums ${met ? 'text-emerald-600' : 'text-ld-fog'}`}>
            {met && '✓ '}{len} / {min}
          </p>
        )}
      </div>
    );
  }

  if (spec.type === 'link') {
    return (
      <div>
        <input
          type="url"
          className={SIM_INPUT}
          value={content.url ?? ''}
          placeholder={spec.placeholder ?? 'https://docs.google.com/…'}
          disabled={disabled}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          aria-label="Link dokumen"
        />
        {spec.hint && <p className="mt-1.5 text-xs text-ld-fog m-0">{spec.hint}</p>}
      </div>
    );
  }

  return <ListInput spec={spec} content={content} disabled={disabled} onChange={onChange} />;
};

type ListSpec = Extract<SimulatorInputSpec, { type: 'list' }>;

// Pick what a preview card shows: a headline (first text field, else first
// required textarea), select values as chips, and the rest as short lines.
function previewParts(spec: ListSpec, item: Record<string, string>) {
  const val = (id: string) => (item[id] ?? '').trim();
  const headline =
    spec.fields.find((f) => f.type === 'text' && val(f.id)) ??
    spec.fields.find((f) => f.type === 'textarea' && f.required && val(f.id));
  const chips = spec.fields.filter((f) => f.type === 'select' && val(f.id));
  const lines = spec.fields.filter((f) => (f.type === 'textarea' || f.type === 'url') && f !== headline && val(f.id)).slice(0, 2);
  return { headline, chips, lines, val };
}

const ListInput: React.FC<{ spec: ListSpec; content: AssignmentContent; disabled: boolean; onChange: (c: AssignmentContent) => void }> = ({
  spec, content, disabled, onChange,
}) => {
  const items = content.items ?? [];
  // null = closed, -1 = adding, n = editing/viewing item n
  const [editing, setEditing] = useState<number | null>(null);
  const label = spec.itemLabel.toLowerCase();

  const removeItem = (index: number) => {
    if (!window.confirm(`Hapus ${spec.itemLabel} #${index + 1}?`)) return;
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };
  const saveItem = (item: Record<string, string>, addAnother: boolean) => {
    if (editing === null) return;
    const next = editing === -1 ? [...items, item] : items.map((it, i) => (i === editing ? item : it));
    onChange({ ...content, items: next });
    if (!addAnother) setEditing(null);
  };

  return (
    <div className="space-y-2.5">
      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-ld-ash px-4 py-6 text-center">
          <p className="m-0 text-sm text-ld-slate">Belum ada {label}.</p>
          {!disabled && <p className="m-0 mt-0.5 text-xs text-ld-fog">Klik "Tambah {label}" untuk mulai.</p>}
        </div>
      )}

      {items.map((item, index) => {
        const { headline, chips, lines, val } = previewParts(spec, item);
        const complete = isItemFilled(spec, item);
        return (
          <div
            key={index}
            className="flex gap-1 rounded-lg border border-ld-frost bg-white hover:border-ld-ash hover:shadow-[0_4px_14px_rgba(30,27,75,0.06)] transition-all"
          >
            <button
              type="button"
              onClick={() => setEditing(index)}
              aria-label={`${disabled ? 'Lihat' : 'Buka'} ${spec.itemLabel} #${index + 1}`}
              className="flex-1 min-w-0 flex gap-3 p-3 md:p-4 pr-1 md:pr-1 text-left bg-transparent border-none cursor-pointer rounded-lg font-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-ld-lilac"
            >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-ld-cloud text-[11px] font-bold text-ld-slate font-ld-mono shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                {chips.map((f) => (
                  <span key={f.id} title={f.label} className="px-1.5 py-0.5 rounded-md bg-ld-lilac/70 text-ld-violet text-[11px] font-medium max-w-full truncate">
                    {val(f.id)}
                  </span>
                ))}
                {!complete && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium">
                    <AlertTriangle size={11} /> Belum lengkap
                  </span>
                )}
              </div>
              <p className={`m-0 mt-1.5 text-sm leading-snug line-clamp-2 ${headline ? 'font-medium text-ld-onyx' : 'italic text-ld-fog'}`}>
                {headline ? val(headline.id) : `${spec.itemLabel} #${index + 1} masih kosong`}
              </p>
              {lines.map((f) => (
                <p key={f.id} className="m-0 mt-1 text-xs text-ld-slate truncate">
                  <span className="text-ld-fog">{f.label}:</span> {val(f.id)}
                </p>
              ))}
            </div>
            {disabled && <span className="p-1.5 text-ld-fog shrink-0" aria-hidden="true"><Eye size={15} /></span>}
            </button>
            {!disabled && (
              <div className="flex items-start gap-0.5 shrink-0 p-2 md:p-3 pl-0 md:pl-0">
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(index)}
                    aria-label={`Edit ${spec.itemLabel} #${index + 1}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-ld-slate hover:text-ld-violet hover:bg-ld-lilac/50 bg-transparent border-none cursor-pointer"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    aria-label={`Hapus ${spec.itemLabel} #${index + 1}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-ld-slate hover:text-red-500 hover:bg-red-50 bg-transparent border-none cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              </div>
            )}
          </div>
        );
      })}

      {!disabled && (
        <button
          type="button"
          onClick={() => setEditing(-1)}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-dashed border-ld-violet text-sm font-medium text-ld-violet hover:bg-ld-lilac/30 cursor-pointer bg-transparent transition-colors"
        >
          <Plus size={15} /> Tambah {label}
        </button>
      )}

      <AnimatePresence>
        {editing !== null && (
          <ListItemModal
            key={editing}
            spec={spec}
            index={editing === -1 ? null : editing}
            displayNumber={editing === -1 ? items.length + 1 : editing + 1}
            initial={editing === -1 ? {} : items[editing] ?? {}}
            readOnly={disabled}
            onSave={saveItem}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentInput;
