import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { QaLibraryCategory } from '../../../../types/qaLibrary';
import { slugify, isValidSlug } from '../../../../lib/portfolioValidation';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

interface QaLibraryCategoryFormProps {
  onClose: () => void;
  onSubmit: (category: QaLibraryCategory) => Promise<{ ok: boolean; reason?: string }>;
  category: QaLibraryCategory | null; // null = create
  existingIds: string[];
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptyCategory: QaLibraryCategory = { id: '', label: '', description: '' };

const QaLibraryCategoryForm: React.FC<QaLibraryCategoryFormProps> = ({ onClose, onSubmit, category, existingIds }) => {
  const isEdit = category !== null;
  const [form, setForm] = useState<QaLibraryCategory>(category ?? emptyCategory);
  const [idTouched, setIdTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleLabelChange = (label: string) => {
    setForm((f) => ({ ...f, label, id: idTouched ? f.id : slugify(label) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidSlug(form.id)) {
      setError('ID harus slug lowercase, contoh: manual-testing');
      return;
    }
    if (!isEdit && existingIds.includes(form.id)) {
      setError(`ID "${form.id}" sudah dipakai category lain.`);
      return;
    }
    if (!form.label.trim()) {
      setError('Label wajib diisi.');
      return;
    }
    setError(null);
    setSaving(true);
    const result = await onSubmit({ ...form, description: form.description?.trim() || undefined });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason ?? 'Gagal menyimpan category.');
      return;
    }
    onClose();
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={ADMIN_CARD_HEADER}>
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar category"
        >
          <ArrowLeft size={17} />
        </button>
        <h2 className="text-sm font-semibold text-ld-onyx m-0">{isEdit ? 'Edit Category' : 'Tambah Category'}</h2>
      </div>

      <form onSubmit={handleSubmit} className={`${ADMIN_CARD_BODY} w-full max-w-lg`}>
        <div className="grid grid-cols-1 gap-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Label</span>
            <input
              type="text"
              value={form.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Manual Testing"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">ID (slug, tidak bisa diubah setelah dibuat)</span>
            <input
              type="text"
              value={form.id}
              disabled={isEdit}
              onChange={(e) => { setIdTouched(true); setForm({ ...form, id: e.target.value }); }}
              placeholder="manual-testing"
              className={`${inputClass} disabled:bg-ld-cloud disabled:text-ld-fog`}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Deskripsi (opsional)</span>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Artikel seputar teknik manual testing…"
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-500 m-0 mt-6">{error}</p>}

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-ld-frost/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Category' : 'Tambah Category'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QaLibraryCategoryForm;
