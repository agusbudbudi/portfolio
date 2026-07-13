import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CertificationEntry } from '../../../../types/portfolio';
import ImageUploadField from '../superadmin/ImageUploadField';
import FormField from '../shared/FormField';
import { ADD_ITEM_BUTTON } from '../shared/adminCard';

interface CertificationListEditorProps {
  certifications: CertificationEntry[];
  onChange: (certifications: CertificationEntry[]) => void;
  submitted: boolean;
}

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const URL_RE = /^https?:\/\/\S+$/;

const emptyEntry = (): CertificationEntry => ({
  id: crypto.randomUUID(),
  name: '',
  issuer: '',
  issuerLogo: '',
  issueDate: '',
  credentialUrl: '',
});

const CertificationListEditor: React.FC<CertificationListEditorProps> = ({ certifications, onChange, submitted }) => {
  const update = (id: string, patch: Partial<CertificationEntry>) => {
    onChange(certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const remove = (id: string) => onChange(certifications.filter((c) => c.id !== id));
  const add = () => onChange([...certifications, emptyEntry()]);

  return (
    <div>
      <div className="space-y-3">
        {certifications.map((entry, i) => {
          const credentialTrimmed = (entry.credentialUrl ?? '').trim();
          const credentialInvalid = credentialTrimmed.length > 0 && !URL_RE.test(credentialTrimmed);

          return (
          <div key={entry.id} className="rounded-lg border border-ld-frost p-4 relative">
            <button
              type="button"
              onClick={() => remove(entry.id)}
              aria-label={`Hapus certification ${i + 1}`}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
            >
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-8">
              <ImageUploadField
                label="Logo Penerbit"
                value={entry.issuerLogo}
                onChange={(issuerLogo) => update(entry.id, { issuerLogo })}
                feature="portfolio"
                maxWidth={160}
                ratioHint="Rasio 1:1, mis. 160×160px"
                shape="rounded-md"
                objectFit="contain"
              />
              <FormField label="Nama Sertifikasi" required compact error={submitted && !entry.name.trim() ? 'Nama sertifikasi wajib diisi.' : null}>
                <input type="text" value={entry.name} onChange={(e) => update(entry.id, { name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Penerbit" required compact error={submitted && !entry.issuer.trim() ? 'Penerbit wajib diisi.' : null}>
                <input type="text" value={entry.issuer} onChange={(e) => update(entry.id, { issuer: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Tanggal Terbit (bulan-tahun)" required compact error={submitted && !entry.issueDate.trim() ? 'Tanggal terbit wajib diisi.' : null}>
                <input type="month" value={entry.issueDate} onChange={(e) => update(entry.id, { issueDate: e.target.value })} className={inputClass} />
              </FormField>
              <FormField
                label="URL Kredensial (opsional)"
                compact
                error={credentialInvalid ? 'URL harus valid, diawali http:// atau https://.' : null}
              >
                <input
                  type="url"
                  value={entry.credentialUrl ?? ''}
                  onChange={(e) => update(entry.id, { credentialUrl: e.target.value })}
                  placeholder="https://…"
                  className={inputClass}
                />
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
        <Plus size={13} /> Tambah Certification
      </button>
    </div>
  );
};

export default CertificationListEditor;
