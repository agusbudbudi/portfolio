import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { TopicConfig } from '../../../../../types/mentoring';

// Rendered conditionally by TopicsTab so form state re-initializes from
// props on every open — no reset effect needed.
interface TopicFormProps {
  onClose: () => void;
  onSubmit: (topic: TopicConfig) => void;
  topic: TopicConfig | null; // null = create
  existingIds: string[];
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-ash bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptyTopic: TopicConfig = { id: '', label: '', description: '', image: '', popular: false, materials: [] };

const TopicForm: React.FC<TopicFormProps> = ({ onClose, onSubmit, topic, existingIds }) => {
  const isEdit = topic !== null;
  const [form, setForm] = useState<TopicConfig>(topic ?? emptyTopic);
  const [materialsText, setMaterialsText] = useState((topic?.materials ?? []).join('\n'));
  const [error, setError] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!SLUG_RE.test(form.id)) {
      setError('ID harus slug lowercase, contoh: fundamental-qa');
      return;
    }
    if (!isEdit && existingIds.includes(form.id)) {
      setError(`ID "${form.id}" sudah dipakai topic lain.`);
      return;
    }
    if (!form.label.trim() || !form.description.trim()) {
      setError('Label dan description wajib diisi.');
      return;
    }
    const materials = materialsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    onSubmit({
      ...form,
      image: form.image?.trim() || undefined,
      popular: form.popular || undefined,
      materials: materials.length > 0 ? materials : undefined,
    });
    onClose();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar topic"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ld-fog m-0">
            {isEdit ? 'Edit Topic' : 'Tambah Topic'}
          </h2>
          {isEdit && <p className="text-xs text-ld-fog m-0 mt-1">{topic.label}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-3">Detail Topic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
              <label className="block">
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">ID (slug, tidak bisa diubah setelah dibuat)</span>
                <input
                  type="text"
                  value={form.id}
                  disabled={isEdit}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  placeholder="fundamental-qa"
                  className={`${inputClass} disabled:bg-ld-cloud disabled:text-ld-fog`}
                />
              </label>
              <label className="block">
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">Label</span>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">Materi yang dibahas (satu baris = satu materi)</span>
                <textarea
                  value={materialsText}
                  onChange={(e) => setMaterialsText(e.target.value)}
                  rows={4}
                  placeholder={'Konsep SDLC & STLC\nJenis-jenis testing\n...'}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="pt-6 border-t border-ld-ash/60">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Tampilan</h3>
            <p className="text-xs text-ld-fog m-0 mb-3">Gambar & penanda popular di form booking.</p>
            <div className="space-y-4">
              <label className="block">
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">Image URL (opsional)</span>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={form.image ?? ''}
                    onChange={(e) => { setForm({ ...form, image: e.target.value }); setImageBroken(false); }}
                    placeholder="https://…"
                    className={inputClass}
                  />
                  {form.image && !imageBroken ? (
                    <img
                      src={form.image}
                      alt="preview"
                      onError={() => setImageBroken(true)}
                      className="w-12 h-12 rounded-lg object-cover border border-ld-ash shrink-0"
                    />
                  ) : (
                    <span className="w-12 h-12 rounded-lg bg-ld-cloud border border-ld-ash shrink-0 flex items-center justify-center text-[10px] text-ld-fog">
                      {imageBroken ? 'rusak' : '—'}
                    </span>
                  )}
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.popular}
                  onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                  className="accent-[var(--tw-color-ld-violet,#3b9eff)] w-4 h-4"
                />
                <span className="text-sm text-ld-graphite">Tandai sebagai popular</span>
              </label>
            </div>
          </section>

          {error && <p className="text-sm text-red-500 m-0">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-ld-ash/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ld-ash bg-white text-sm text-ld-graphite cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none"
          >
            {isEdit ? 'Simpan Topic' : 'Tambah Topic'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TopicForm;
