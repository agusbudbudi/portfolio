import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EducationEntry } from '../../../../types/portfolio';
import ImageUploadField from '../superadmin/ImageUploadField';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

interface EducationListEditorProps {
  education: EducationEntry[];
  onChange: (education: EducationEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptyEntry = (): EducationEntry => ({
  id: crypto.randomUUID(),
  institution: '',
  institutionLogo: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
});

const EducationListEditor: React.FC<EducationListEditorProps> = ({ education, onChange, submitted }) => {
  const update = (id: string, patch: Partial<EducationEntry>) => {
    onChange(education.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => onChange(education.filter((e) => e.id !== id));
  const add = () => onChange([...education, emptyEntry()]);

  return (
    <div>
      <div className="space-y-3">
        {education.map((entry, i) => (
          <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
            <button
              type="button"
              onClick={() => remove(entry.id)}
              aria-label={`Hapus education ${i + 1}`}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
              <ImageUploadField
                label="Logo Institusi"
                value={entry.institutionLogo}
                onChange={(institutionLogo) => update(entry.id, { institutionLogo })}
                feature="portfolio"
                maxWidth={160}
                ratioHint="Rasio 1:1, mis. 160×160px"
                shape="rounded-md"
              />
              <FormField label="Institusi" required compact error={submitted && !entry.institution.trim() ? 'Institusi wajib diisi.' : null}>
                <input type="text" value={entry.institution} onChange={(e) => update(entry.id, { institution: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Gelar / Jenjang" required compact error={submitted && !entry.degree.trim() ? 'Gelar / jenjang wajib diisi.' : null}>
                <input type="text" value={entry.degree} onChange={(e) => update(entry.id, { degree: e.target.value })} placeholder="S1, D3, SMA…" className={inputClass} />
              </FormField>
              <FormField label="Bidang Studi (opsional)" compact>
                <input type="text" value={entry.fieldOfStudy ?? ''} onChange={(e) => update(entry.id, { fieldOfStudy: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Mulai (bulan-tahun)" required compact error={submitted && !entry.startDate.trim() ? 'Tanggal mulai wajib diisi.' : null}>
                <input type="month" value={entry.startDate} onChange={(e) => update(entry.id, { startDate: e.target.value })} className={inputClass} />
              </FormField>
              <FormField
                label="Selesai"
                required={!entry.isCurrent}
                compact
                error={submitted && !entry.isCurrent && !entry.endDate?.trim() ? 'Tanggal selesai wajib diisi saat tidak "Masih menempuh pendidikan di sini".' : null}
              >
                <input
                  type="month"
                  value={entry.endDate ?? ''}
                  disabled={entry.isCurrent}
                  onChange={(e) => update(entry.id, { endDate: e.target.value })}
                  className={`${inputClass} disabled:bg-ld-cloud disabled:text-ld-fog`}
                />
              </FormField>
              <label className="flex items-center gap-2 md:col-span-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={entry.isCurrent}
                  onChange={(e) => update(entry.id, { isCurrent: e.target.checked, endDate: e.target.checked ? undefined : entry.endDate })}
                  className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
                />
                <span className="text-xs text-ld-graphite">Masih menempuh pendidikan di sini</span>
              </label>
              <FormField label="Deskripsi (opsional)" compact className="md:col-span-2">
                <textarea value={entry.description ?? ''} onChange={(e) => update(entry.id, { description: e.target.value })} rows={3} className={inputClass} />
              </FormField>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className={ADD_ITEM_BUTTON}
      >
        <Plus size={13} /> Tambah Education
      </button>
    </div>
  );
};

export default EducationListEditor;
