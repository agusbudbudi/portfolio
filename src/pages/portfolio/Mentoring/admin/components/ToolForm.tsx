import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { ToolConfig } from '../../../../../types/portfolio';
import ToolLogoField from './ToolLogoField';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';
import { loadThesvgRegistry, searchThesvgIcons, thesvgIconUrl, type ThesvgIcon } from '../../../../../lib/thesvgRegistry';

interface ToolFormProps {
  onClose: () => void;
  onSubmit: (tool: ToolConfig) => Promise<{ ok: boolean; reason?: string }>;
  tool: ToolConfig | null; // null = create
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

const emptyTool: ToolConfig = { id: '', name: '', logo: '', category: '' };

const ToolForm: React.FC<ToolFormProps> = ({ onClose, onSubmit, tool, existingIds }) => {
  const isEdit = tool !== null;
  const [form, setForm] = useState<ToolConfig>(tool ?? emptyTool);
  const [idTouched, setIdTouched] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Name → icon-name autocomplete against the thesvg.org registry (create
  // mode only — editing an existing tool keeps its id/logo choice fixed).
  const registryRef = useRef<ThesvgIcon[] | null>(null);
  const [suggestions, setSuggestions] = useState<ThesvgIcon[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  useEffect(() => {
    if (isEdit) return;
    loadThesvgRegistry().then((icons) => { registryRef.current = icons; });
  }, [isEdit]);

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, id: idTouched ? f.id : slugify(name) }));
    if (!isEdit && registryRef.current) {
      setSuggestions(searchThesvgIcons(registryRef.current, name));
      setSuggestionsOpen(true);
    }
  };

  const pickSuggestion = (icon: ThesvgIcon) => {
    setForm((f) => ({ ...f, name: icon.title, id: icon.slug }));
    setIdTouched(true);
    setSuggestionsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SLUG_RE.test(form.id)) {
      setError('ID harus slug lowercase, contoh: cypress');
      return;
    }
    if (!isEdit && existingIds.includes(form.id)) {
      setError(`ID "${form.id}" sudah dipakai tool lain.`);
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
      logo: form.logo?.trim() || undefined,
      category: form.category?.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason ?? 'Gagal menyimpan tool.');
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
          aria-label="Kembali ke daftar tool"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{isEdit ? 'Edit Tool' : 'Tambah Tool'}</h2>
          {isEdit && <p className="text-sm font-semibold text-ld-onyx m-0">{tool.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${ADMIN_CARD_BODY} w-full max-w-lg`}>
        <div className="grid grid-cols-1 gap-y-4">
          <label className="block relative">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Nama</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setSuggestionsOpen(true); }}
              onBlur={() => { setTimeout(() => setSuggestionsOpen(false), 150); }}
              placeholder="Cypress"
              autoComplete="off"
              className={inputClass}
            />
            {suggestionsOpen && suggestions.length > 0 && (
              <ul className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-ld-frost bg-white shadow-lg max-h-56 overflow-y-auto py-1">
                {suggestions.map((icon) => (
                  <li key={icon.slug}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickSuggestion(icon)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm text-ld-onyx hover:bg-ld-cloud cursor-pointer border-none bg-transparent"
                    >
                      <img
                        src={thesvgIconUrl(icon.slug)}
                        alt=""
                        className="w-5 h-5 object-contain shrink-0"
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                      <span>{icon.title}</span>
                      <code className="ml-auto text-[11px] text-ld-fog">{icon.slug}</code>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">ID (slug, tidak bisa diubah setelah dibuat)</span>
            <input
              type="text"
              value={form.id}
              disabled={isEdit}
              onChange={(e) => { setIdTouched(true); setForm({ ...form, id: e.target.value }); }}
              placeholder="cypress"
              className={`${inputClass} disabled:bg-ld-cloud disabled:text-ld-fog`}
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ld-graphite mb-1.5">Kategori (opsional)</span>
            <input
              type="text"
              value={form.category ?? ''}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Automation, API Testing, Bug Tracking, …"
              className={inputClass}
            />
          </label>
          <ToolLogoField
            value={form.logo}
            onChange={(logo) => setForm({ ...form, logo })}
            defaultSlug={form.id || form.name}
          />
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
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Tool' : 'Tambah Tool'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ToolForm;
