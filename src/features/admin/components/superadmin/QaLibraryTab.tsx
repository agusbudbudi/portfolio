import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminQaLibraryStore } from '../../../../store/useAdminQaLibraryStore';
import { useAdminQaLibraryCategoriesStore } from '../../../../store/useAdminQaLibraryCategoriesStore';
import type { QaLibraryArticleSummary } from '../../../../types/qaLibrary';
import { usePagination } from '../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../components/common/LoadingState';
import QaLibraryArticleForm from './QaLibraryArticleForm';
import Pagination from '../shared/Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';

const STATUS_TONE: Record<QaLibraryArticleSummary['status'], StatusBadgeTone> = {
  draft: 'slate',
  published: 'emerald',
};

const QaLibraryTab: React.FC = () => {
  const { articles, loading, loadError, load, current, currentLoading, loadOne, clearCurrent, create, update, remove } = useAdminQaLibraryStore();
  const { categories, load: loadCategories } = useAdminQaLibraryCategoriesStore();
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const sorted = sortByUpdatedAtDesc(articles);
  const { page, setPage, totalPages, pageItems: pagedArticles } = usePagination(sorted);
  const categoryLabel = (id: string) => categories.find((c) => c.id === id)?.label ?? id;

  useEffect(() => { load(); loadCategories(); }, [load, loadCategories]);

  const openCreate = () => { clearCurrent(); setMode('create'); setFormOpen(true); };
  const openEdit = async (slug: string) => {
    setMode('edit');
    setFormOpen(true);
    await loadOne(slug);
  };
  const closeForm = () => { setFormOpen(false); clearCurrent(); };

  const handleDelete = async (article: QaLibraryArticleSummary) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return;
    setDeletingSlug(article.slug);
    const result = await remove(article.slug);
    setDeletingSlug(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus artikel.');
  };

  if (formOpen) {
    if (mode === 'edit' && currentLoading) {
      return (
        <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}>
          <LoadingState label="Memuat artikel…" />
        </div>
      );
    }
    return (
      <QaLibraryArticleForm
        onClose={closeForm}
        onSubmit={(payload) => (mode === 'edit' && current ? update(current.slug, payload) : create(payload))}
        article={mode === 'edit' ? current : null}
        categories={categories}
      />
    );
  }

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Articles</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{articles.length} artikel QA Library.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Artikel
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
          <LoadingState label="Memuat artikel…" />
        ) : (
          <>
            <div className="overflow-x-auto border border-ld-frost rounded-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ld-cloud text-left">
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Title</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Category</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Author</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Diperbarui</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedArticles.map((article) => (
                    <tr key={article.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[180px]">
                          {article.thumbnailUrl ? (
                            <img src={article.thumbnailUrl} alt="" className="w-9 h-9 rounded-lg object-cover object-top border border-ld-frost shrink-0" />
                          ) : (
                            <span className="w-9 h-9 rounded-lg bg-ld-cloud border border-ld-frost shrink-0" />
                          )}
                          <button
                            onClick={() => openEdit(article.slug)}
                            className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                          >
                            {article.title}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-ld-fog whitespace-nowrap">{categoryLabel(article.categoryId)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {article.authorAvatarUrl ? (
                            <img src={article.authorAvatarUrl} alt="" className="w-6 h-6 rounded-full object-cover object-top border border-ld-frost shrink-0" />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-ld-cloud border border-ld-frost shrink-0" />
                          )}
                          <span className="text-xs text-ld-fog">{article.authorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge tone={STATUS_TONE[article.status]}>{article.status}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">
                        {new Date(article.updatedAt).toLocaleDateString('id-ID')}{' '}
                        {new Date(article.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(article.slug)}
                            className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                            aria-label={`Edit ${article.title}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(article)}
                            disabled={deletingSlug === article.slug}
                            className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Hapus ${article.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {articles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada artikel.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalItems={sorted.length} pageSize={10} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default QaLibraryTab;
