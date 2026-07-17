import React from 'react';
import { WORK_ARRANGEMENT_OPTIONS, type AvailabilityConfig, type EmploymentType, type WorkArrangement } from '../../../../types/portfolio';
import { EMPLOYMENT_TYPE_LABEL } from '../../../../lib/portfolioFormat';
import FormField from '../shared/FormField';

interface AvailabilityFieldProps {
  value: AvailabilityConfig;
  onChange: (value: AvailabilityConfig) => void;
}

const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_LABEL) as [EmploymentType, string][];

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const chipClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
    active ? 'border-ld-violet bg-ld-lilac text-ld-violet' : 'border-ld-frost bg-white text-ld-graphite hover:border-ld-violet'
  }`;

// HR-facing "can I even hire them" badge row (see ProfileHeroBand.tsx) — a
// handful of fixed fields, gated behind isAvailable like githubActivity.
const AvailabilityField: React.FC<AvailabilityFieldProps> = ({ value, onChange }) => {
  const toggleEmploymentType = (type: EmploymentType) => {
    const next = value.employmentTypes.includes(type)
      ? value.employmentTypes.filter((t) => t !== type)
      : [...value.employmentTypes, type];
    onChange({ ...value, employmentTypes: next });
  };

  const toggleWorkArrangement = (arrangement: WorkArrangement) => {
    const next = value.workArrangements.includes(arrangement)
      ? value.workArrangements.filter((w) => w !== arrangement)
      : [...value.workArrangements, arrangement];
    onChange({ ...value, workArrangements: next });
  };

  return (
    <div className="grid grid-cols-1 gap-y-4">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.showOpenToWork}
          onChange={(e) => onChange({ ...value, showOpenToWork: e.target.checked })}
          className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
        />
        <span className="text-xs text-ld-graphite">Tampilkan badge "Open to Work" di foto profil</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.showPreferences}
          onChange={(e) => onChange({ ...value, showPreferences: e.target.checked })}
          className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
        />
        <span className="text-xs text-ld-graphite">Tampilkan preferensi kerja (notice period, lokasi, tipe kerja) di halaman publik</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Notice Period (opsional)">
          <input
            type="text"
            value={value.noticePeriod ?? ''}
            onChange={(e) => onChange({ ...value, noticePeriod: e.target.value })}
            placeholder="Immediately, 2 Minggu, 1 Bulan, …"
            className={inputClass}
          />
        </FormField>
        <FormField label="Lokasi (opsional)">
          <input
            type="text"
            value={value.location ?? ''}
            onChange={(e) => onChange({ ...value, location: e.target.value })}
            placeholder="Jakarta, Indonesia"
            className={inputClass}
          />
        </FormField>
      </div>

      <div>
        <span className="block text-xs font-medium text-ld-graphite mb-1.5">Tipe Kerja yang Diinginkan</span>
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPE_OPTIONS.map(([type, label]) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleEmploymentType(type)}
              className={chipClass(value.employmentTypes.includes(type))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-xs font-medium text-ld-graphite mb-1.5">Preferensi Lokasi Kerja</span>
        <div className="flex flex-wrap gap-2">
          {WORK_ARRANGEMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleWorkArrangement(opt.value)}
              className={chipClass(value.workArrangements.includes(opt.value))}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityField;
