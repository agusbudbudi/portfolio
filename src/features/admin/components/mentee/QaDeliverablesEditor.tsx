import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { QaDeliverableEntry, QaDeliverablesConfig } from '../../../../types/portfolio';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

interface QaDeliverablesEditorProps {
  value: QaDeliverablesConfig;
  onChange: (value: QaDeliverablesConfig) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const URL_RE = /^https?:\/\/\S+$/;

const emptyEntry = (): QaDeliverableEntry => ({
  id: crypto.randomUUID(),
  title: '',
  subtitle: '',
  url: '',
});

// Fixed-template deliverables list — QA docs (test case, test plan, bug
// report, …) instead of freeform Project entries. Section title/subtitle
// are admin-editable but ship pre-filled (see QA_DELIVERABLES_DEFAULT_*)
// so a mentee doesn't have to write header copy from scratch.
const QaDeliverablesEditor: React.FC<QaDeliverablesEditorProps> = ({ value, onChange, submitted }) => {
  const items = value.items;

  const update = (id: string, patch: Partial<QaDeliverableEntry>) => {
    onChange({ ...value, items: items.map((item) => (item.id === id ? { ...item, ...patch } : item)) });
  };

  const remove = (id: string) => onChange({ ...value, items: items.filter((item) => item.id !== id) });
  const add = () => onChange({ ...value, items: [...items, emptyEntry()] });

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 mb-5 pb-5 border-b border-dashed border-ld-frost">
        <FormField label="Judul Section" required error={submitted && !value.title.trim() ? 'Judul section wajib diisi.' : null}>
          <input type="text" value={value.title} onChange={(e) => onChange({ ...value, title: e.target.value })} className={inputClass} />
        </FormField>
        <FormField label="Subjudul Section" required error={submitted && !value.subtitle.trim() ? 'Subjudul section wajib diisi.' : null}>
          <input type="text" value={value.subtitle} onChange={(e) => onChange({ ...value, subtitle: e.target.value })} className={inputClass} />
        </FormField>
      </div>

      <div className="space-y-3">
        {items.map((entry, i) => {
          const urlTrimmed = entry.url.trim();
          const urlInvalid = urlTrimmed.length > 0 && !URL_RE.test(urlTrimmed);

          return (
            <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Hapus deliverable ${i + 1}`}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
              >
                <Trash2 size={14} />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
                <FormField label="Title" required compact error={submitted && !entry.title.trim() ? 'Title wajib diisi.' : null}>
                  <input
                    type="text"
                    value={entry.title}
                    onChange={(e) => update(entry.id, { title: e.target.value })}
                    placeholder="Test Case - Login Module"
                    className={inputClass}
                  />
                </FormField>
                <FormField label="Subtitle (opsional)" compact>
                  <input
                    type="text"
                    value={entry.subtitle ?? ''}
                    onChange={(e) => update(entry.id, { subtitle: e.target.value })}
                    placeholder="Google Sheet, 40 test cases"
                    className={inputClass}
                  />
                </FormField>
                <FormField
                  label="URL"
                  required
                  compact
                  className="md:col-span-2"
                  error={
                    submitted && !urlTrimmed
                      ? 'URL wajib diisi.'
                      : urlInvalid
                        ? 'URL harus valid, diawali http:// atau https://.'
                        : null
                  }
                >
                  <input
                    type="url"
                    value={entry.url}
                    onChange={(e) => update(entry.id, { url: e.target.value })}
                    placeholder="https://…"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={add} className={ADD_ITEM_BUTTON}>
        <Plus size={13} /> Tambah Deliverable
      </button>
    </div>
  );
};

export default QaDeliverablesEditor;
