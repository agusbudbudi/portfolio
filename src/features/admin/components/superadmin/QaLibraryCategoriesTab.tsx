import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminQaLibraryCategoriesStore } from '../../../../store/useAdminQaLibraryCategoriesStore';
import type { QaLibraryCategory } from '../../../../types/qaLibrary';
import { usePagination } from '../../../../hooks/usePagination';
import LoadingState from '../../../../components/common/LoadingState';
import QaLibraryCategoryForm from './QaLibraryCategoryForm';
import Pagination from '../shared/Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

const QaLibraryCategoriesTab: React.FC = () => {
  const { categories, loading, loadError, load, upsertCategory, deleteCategory } = useAdminQaLibraryCategoriesStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<QaLibraryCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { page, setPage, totalPages, pageItems: pagedCategories } = usePagination(categories);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (category: QaLibraryCategory) => { setEditing(category); setFormOpen(true); };

  if (formOpen) {
    return (
      <QaLibraryCategoryForm
        onClose={() => setFormOpen(false)}
        onSubmit={upsertCategory}
        category={editing}
        existingIds={categories.map((c) => c.id)}
      />
    );
  }

  const handleDelete = async (category: QaLibraryCategory) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus category "${category.label}"?`)) return;
    setDeletingId(category.id);
    const result = await deleteCategory(category.id);
    setDeletingId(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus category.');
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Article Categories</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{categories.length} category tersedia untuk artikel QA Library.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Category
        </button>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {loadError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{loadError}</p>
        )}
        {deleteError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{deleteError}</p>
        )}

        {loading ? (
          <LoadingState label="Memuat categories…" />
        ) : (
          <>
            <div className="overflow-x-auto border border-ld-frost rounded-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ld-cloud text-left">
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Label</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">ID</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Deskripsi</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCategories.map((category) => (
                    <tr key={category.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openEdit(category)}
                          className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                        >
                          {category.label}
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <code className="text-[11px] text-ld-slate">{category.id}</code>
                      </td>
                      <td className="px-4 py-3 text-xs text-ld-fog">{category.description ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(category)}
                            className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                            aria-label={`Edit ${category.label}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            disabled={deletingId === category.id}
                            className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Hapus ${category.label}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada category.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={categories.length} pageSize={10} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default QaLibraryCategoriesTab;
