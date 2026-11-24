import React from 'react';
import type { QaLibraryCategory } from '../../../../types/qaLibrary';
import { slugify } from '../../../../lib/portfolioValidation';
import { useAdminQaLibraryCategoriesStore } from '../../../../store/useAdminQaLibraryCategoriesStore';
import Combobox from '../../../../components/common/Combobox';

// Searchable category picker for the article Category field, with inline
// "add category": typing a name that matches no category offers to create
// it via the categories store (same as the Article Categories tab).
interface QaLibraryCategorySelectProps {
  categories: QaLibraryCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  error?: string | null;
}

const QaLibraryCategorySelect: React.FC<QaLibraryCategorySelectProps> = ({ categories, value, onChange, error }) => {
  const upsertCategory = useAdminQaLibraryCategoriesStore((s) => s.upsertCategory);

  const createAndSelect = async (label: string): Promise<string | void> => {
    const id = slugify(label);
    // Different labels can slugify to the same id (e.g. "API Testing!" vs an
    // existing "API Testing"). upsertCategory replaces by id, so creating
    // here would silently overwrite that existing category. Reuse it instead.
    if (categories.some((c) => c.id === id)) {
      onChange(id);
      return;
    }
    const result = await upsertCategory({ id, label });
    if (!result.ok) return result.reason ?? `Gagal menambah category "${label}".`;
    onChange(id);
  };

  return (
    <div>
      <Combobox
        options={categories.map((c) => ({ value: c.id, label: c.label }))}
        value={value}
        onChange={onChange}
        onCreate={createAndSelect}
        createLabel={(q) => `Tambah category "${q}"`}
        placeholder="Pilih category…"
        searchPlaceholder="Cari category… (atau ketik nama baru)"
        emptyLabel="Category tidak ditemukan."
        aria-label="Category"
        invalid={!!error}
      />
      {error && <p className="text-xs text-red-500 mt-1.5 m-0" role="alert">{error}</p>}
    </div>
  );
};

export default QaLibraryCategorySelect;
