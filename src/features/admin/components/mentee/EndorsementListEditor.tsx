import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EndorsementEntry } from '../../../../types/portfolio';
import ImageUploadField from '../superadmin/ImageUploadField';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

interface EndorsementListEditorProps {
  endorsements: EndorsementEntry[];
  onChange: (endorsements: EndorsementEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const URL_RE = /^https?:\/\/\S+$/;

const emptyEntry = (): EndorsementEntry => ({
  id: crypto.randomUUID(),
  photo: '',
  name: '',
  relation: '',
  message: '',
  linkedinUrl: '',
  date: '',
});

// Endorsements are entered by the admin on the mentee's behalf (no
// self-service flow from the endorser) — same manual-entry model as every
// other array here.
const EndorsementListEditor: React.FC<EndorsementListEditorProps> = ({ endorsements, onChange, submitted }) => {
  const update = (id: string, patch: Partial<EndorsementEntry>) => {
    onChange(endorsements.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => onChange(endorsements.filter((e) => e.id !== id));
  const add = () => onChange([...endorsements, emptyEntry()]);

  return (
    <div>
      <div className="space-y-3">
        {endorsements.map((entry, i) => {
          const linkedinTrimmed = (entry.linkedinUrl ?? '').trim();
          const linkedinInvalid = linkedinTrimmed.length > 0 && !URL_RE.test(linkedinTrimmed);

          return (
          <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
            <button
              type="button"
              onClick={() => remove(entry.id)}
              aria-label={`Hapus endorsement ${i + 1}`}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
              <ImageUploadField
                label="Foto"
                value={entry.photo}
                onChange={(photo) => update(entry.id, { photo })}
                feature="portfolio"
                maxWidth={200}
                ratioHint="Rasio 1:1, mis. 200×200px"
                shape="rounded-md"
              />
              <FormField label="Nama" required compact error={submitted && !entry.name.trim() ? 'Nama wajib diisi.' : null}>
                <input type="text" value={entry.name} onChange={(e) => update(entry.id, { name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Relasi" required compact error={submitted && !entry.relation.trim() ? 'Relasi wajib diisi.' : null}>
                <input
                  type="text"
                  value={entry.relation}
                  onChange={(e) => update(entry.id, { relation: e.target.value })}
                  placeholder="Team Lead, Rekan kerja, …"
                  className={inputClass}
                />
              </FormField>
              <FormField
                label="LinkedIn (opsional)"
                compact
                error={linkedinInvalid ? 'URL harus valid, diawali http:// atau https://.' : null}
              >
                <input
                  type="url"
                  value={entry.linkedinUrl ?? ''}
                  onChange={(e) => update(entry.id, { linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/…"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Pesan" required compact className="md:col-span-2" error={submitted && !entry.message.trim() ? 'Pesan wajib diisi.' : null}>
                <textarea value={entry.message} onChange={(e) => update(entry.id, { message: e.target.value })} rows={3} className={inputClass} />
              </FormField>
            </div>
          </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={add}
        className={ADD_ITEM_BUTTON}
      >
        <Plus size={13} /> Tambah Endorsement
      </button>
    </div>
  );
};

export default EndorsementListEditor;
