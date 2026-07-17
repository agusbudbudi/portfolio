import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { SkillConfig } from '../../../../types/portfolio';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

interface SkillFormProps {
  onClose: () => void;
  onSubmit: (skill: SkillConfig) => Promise<{ ok: boolean; reason?: string }>;
  skill: SkillConfig | null; // null = create
  existingIds: string[];
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptySkill: SkillConfig = { id: '', name: '', category: '' };

const SkillForm: React.FC<SkillFormProps> = ({ onClose, onSubmit, skill, existingIds }) => {
  const isEdit = skill !== null;
  const [form, setForm] = useState<SkillConfig>(skill ?? emptySkill);
  const [idTouched, setIdTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, id: idTouched ? f.id : slugify(name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SLUG_RE.test(form.id)) {
      setError('ID harus slug lowercase, contoh: manual-testing');
      return;
    }
    if (!isEdit && existingIds.includes(form.id)) {
      setError(`ID "${form.id}" sudah dipakai skill lain.`);
      return;
    }
    if (!form.name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    setError(null);
    setSaving(true);
    const result = await onSubmit({
      ...form,
      category: form.category?.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason ?? 'Gagal menyimpan skill.');
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
          aria-label="Kembali ke daftar skill"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{isEdit ? 'Edit Skill' : 'Tambah Skill'}</h2>
          {isEdit && <p className="text-sm font-semibold text-ld-onyx m-0">{skill.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${ADMIN_CARD_BODY} w-full max-w-lg`}>
        <div className="grid grid-cols-1 gap-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Nama</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Manual Testing"
              autoComplete="off"
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
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Kategori (opsional)</span>
            <input
              type="text"
              value={form.category ?? ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Testing, Automation, Soft Skill, …"
              className={inputClass}
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
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Skill' : 'Tambah Skill'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillForm;
