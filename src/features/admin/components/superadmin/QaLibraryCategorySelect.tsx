import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Loader2, Plus, Search } from 'lucide-react';
import type { QaLibraryCategory } from '../../../../types/qaLibrary';
import { slugify } from '../../../../lib/portfolioValidation';
import { useAdminQaLibraryCategoriesStore } from '../../../../store/useAdminQaLibraryCategoriesStore';

// Searchable single-select for the article Category field, with inline
// "add category" — mirrors PortfolioSkillsField.tsx's create-on-the-fly UX
// (typing a name that doesn't match an existing category offers to create
// it via the categories store, same as the dedicated Article Categories tab).
interface QaLibraryCategorySelectProps {
  categories: QaLibraryCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  error?: string | null;
}

const QaLibraryCategorySelect: React.FC<QaLibraryCategorySelectProps> = ({ categories, value, onChange, error }) => {
  const upsertCategory = useAdminQaLibraryCategoriesStore((s) => s.upsertCategory);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const closeDropdown = () => { setOpen(false); setQuery(''); setCreateError(null); };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const selectedCategory = categories.find((c) => c.id === value) ?? null;
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () => (q ? categories.filter((c) => c.label.toLowerCase().includes(q)) : categories),
    [categories, q]
  );
  const exactMatch = q.length > 0 && categories.some((c) => c.label.toLowerCase() === q);
  const canCreate = q.length > 0 && !exactMatch;

  const select = (categoryId: string) => {
    onChange(categoryId);
    closeDropdown();
  };

  const createAndSelect = async () => {
    const label = query.trim();
    if (!label) return;
    const id = slugify(label);

    // Different labels can slugify to the same id (e.g. "API Testing!" vs an
    // existing "API Testing") — upsertCategory replaces by id, so creating
    // here would silently rename/overwrite that unrelated existing category.
    // Reuse it instead of writing.
    const collision = categories.find((c) => c.id === id);
    if (collision) {
      select(collision.id);
      return;
    }

    setCreateError(null);
    setCreating(true);
    const result = await upsertCategory({ id, label });
    setCreating(false);
    if (!result.ok) {
      setCreateError(result.reason ?? `Gagal menambah category "${label}".`);
      return;
    }
    select(id);
  };

  return (
    <div ref={rootRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => (open ? closeDropdown() : setOpen(true))}
          aria-expanded={open}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border bg-white text-left text-sm cursor-pointer transition-colors ${
            error ? 'border-red-500' : 'border-ld-frost hover:border-ld-violet'
          }`}
        >
          <span className={selectedCategory ? 'text-ld-onyx font-medium truncate' : 'text-ld-fog'}>
            {selectedCategory ? selectedCategory.label : 'Pilih category…'}
          </span>
          <ChevronDown size={15} className={`text-ld-fog flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1.5 w-full rounded-xl border border-ld-frost bg-white shadow-[rgba(39,40,53,0.1)_0px_0px_0px_1px,rgba(39,40,53,0.12)_0px_12px_24px_-8px]">
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-ld-frost/60">
              <Search size={14} className="text-ld-fog flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari category… (atau ketik nama baru)"
                className="w-full text-sm outline-none border-none bg-transparent text-ld-onyx placeholder:text-ld-fog"
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-1.5">
              {filtered.length === 0 && !canCreate && (
                <p className="px-2.5 py-3 text-xs text-ld-fog text-center m-0">Category tidak ditemukan.</p>
              )}
              {filtered.map((category) => {
                const selected = category.id === value;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => select(category.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border-none transition-colors ${
                      selected ? 'bg-ld-lilac/60' : 'bg-transparent hover:bg-ld-cloud'
                    }`}
                  >
                    <span className="text-sm font-medium text-ld-onyx truncate">{category.label}</span>
                  </button>
                );
              })}
              {canCreate && (
                <button
                  type="button"
                  onClick={createAndSelect}
                  disabled={creating}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left cursor-pointer border-none bg-transparent hover:bg-ld-cloud text-ld-violet disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Plus size={14} className="shrink-0" />}
                  <span className="text-sm">Tambah category "{query.trim()}"</span>
                </button>
              )}
            </div>
            {createError && <p className="text-xs text-red-500 px-3 pb-2.5 m-0">{createError}</p>}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1.5" role="alert">{error}</p>}
    </div>
  );
};

export default QaLibraryCategorySelect;
