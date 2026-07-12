import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { EmploymentType, ExperienceEntry } from '../../../../../types/portfolio';
import ImageUploadField from './ImageUploadField';
import FormField from './FormField';
import { ADD_ITEM_BUTTON } from './adminCard';

interface ExperienceListEditorProps {
  experience: ExperienceEntry[];
  onChange: (experience: ExperienceEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
};

const emptyEntry = (): ExperienceEntry => ({
  id: crypto.randomUUID(),
  company: '',
  companyLogo: '',
  position: '',
  employmentType: 'full-time',
  jobDesc: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
});

const ExperienceListEditor: React.FC<ExperienceListEditorProps> = ({ experience, onChange, submitted }) => {
  const update = (id: string, patch: Partial<ExperienceEntry>) => {
    onChange(experience.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const remove = (id: string) => onChange(experience.filter((e) => e.id !== id));
  const add = () => onChange([...experience, emptyEntry()]);

  return (
    <div>
      <div className="space-y-3">
        {experience.map((entry, i) => (
          <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
            <button
              type="button"
              onClick={() => remove(entry.id)}
              aria-label={`Hapus experience ${i + 1}`}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
              <ImageUploadField
                label="Logo Perusahaan"
                value={entry.companyLogo}
                onChange={(companyLogo) => update(entry.id, { companyLogo })}
                shape="rounded-md"
              />
              <FormField label="Perusahaan" required compact error={submitted && !entry.company.trim() ? 'Perusahaan wajib diisi.' : null}>
                <input type="text" value={entry.company} onChange={(e) => update(entry.id, { company: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Posisi" required compact error={submitted && !entry.position.trim() ? 'Posisi wajib diisi.' : null}>
                <input type="text" value={entry.position} onChange={(e) => update(entry.id, { position: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Employment Type" compact>
                <select
                  value={entry.employmentType ?? 'full-time'}
                  onChange={(e) => update(entry.id, { employmentType: e.target.value as EmploymentType })}
                  className={inputClass}
                >
                  {Object.entries(EMPLOYMENT_TYPE_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Mulai (bulan-tahun)" required compact error={submitted && !entry.startDate.trim() ? 'Tanggal mulai wajib diisi.' : null}>
                <input type="month" value={entry.startDate} onChange={(e) => update(entry.id, { startDate: e.target.value })} className={inputClass} />
              </FormField>
              <FormField
                label="Selesai"
                required={!entry.isCurrent}
                compact
                error={submitted && !entry.isCurrent && !entry.endDate?.trim() ? 'Tanggal selesai wajib diisi saat tidak "Masih bekerja di sini".' : null}
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
                <span className="text-xs text-ld-graphite">Masih bekerja di sini</span>
              </label>
              <FormField label="Job Desk" required compact className="md:col-span-2" error={submitted && !entry.jobDesc.trim() ? 'Job desk wajib diisi.' : null}>
                <textarea value={entry.jobDesc} onChange={(e) => update(entry.id, { jobDesc: e.target.value })} rows={3} className={inputClass} />
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
        <Plus size={13} /> Tambah Experience
      </button>
    </div>
  );
};

export default ExperienceListEditor;
