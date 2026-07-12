import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminPortfolioStore } from '../../../../../store/useAdminPortfolioStore';
import { useAdminToolsStore } from '../../../../../store/useAdminToolsStore';
import type { PortfolioSummary } from '../../../../../types/portfolio';
import { usePagination } from '../../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../../components/portfolio/common/LoadingState';
import PortfolioForm from './PortfolioForm';
import Pagination from './Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

const STATUS_BADGE: Record<PortfolioSummary['status'], string> = {
  draft: 'bg-ld-cloud text-ld-slate',
  published: 'bg-green-50 text-green-600',
};

const PortfoliosTab: React.FC = () => {
  const {
    portfolios, loading, loadError, load, current, currentLoading, loadOne, clearCurrent, create, update, remove,
  } = useAdminPortfolioStore();
  const { tools, load: loadTools } = useAdminToolsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const sorted = sortByUpdatedAtDesc(portfolios);
  const { page, setPage, totalPages, pageItems: pagedPortfolios } = usePagination(sorted);

  useEffect(() => { load(); loadTools(); }, [load, loadTools]);

  const openCreate = () => { clearCurrent(); setMode('create'); setFormOpen(true); };
  const openEdit = async (slug: string) => {
    setMode('edit');
    setFormOpen(true);
    await loadOne(slug);
  };
  const closeForm = () => { setFormOpen(false); clearCurrent(); };

  const handleDelete = async (portfolio: PortfolioSummary) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus portfolio "${portfolio.name}"?`)) return;
    setDeletingSlug(portfolio.slug);
    const result = await remove(portfolio.slug);
    setDeletingSlug(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus portfolio.');
  };

  if (formOpen) {
    if (mode === 'edit' && currentLoading) {
      return (
        <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}>
          <LoadingState label="Memuat portfolio…" />
        </div>
      );
    }
    return (
      <PortfolioForm
        onClose={closeForm}
        onSubmit={(payload) => (mode === 'edit' && current ? update(current.slug, payload) : create(payload))}
        record={mode === 'edit' ? current : null}
        tools={tools}
      />
    );
  }

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Portfolios</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{portfolios.length} portfolio mentee.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Portfolio
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
          <LoadingState label="Memuat portfolios…" />
        ) : (
          <>
          <div className="overflow-x-auto border border-ld-frost rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ld-cloud text-left">
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel">Mentee</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Slug</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Diperbarui</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedPortfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <img
                          src={portfolio.photo || '/img/portfolio-public/default-avatar-portfolio.webp'}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-ld-frost shrink-0"
                        />
                        <button
                          onClick={() => openEdit(portfolio.slug)}
                          className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                        >
                          {portfolio.name || '(tanpa nama)'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-[11px] text-ld-slate">{portfolio.slug}</code>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest ${STATUS_BADGE[portfolio.status]}`}>
                        {portfolio.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">
                      {new Date(portfolio.updatedAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(portfolio.slug)}
                          className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                          aria-label={`Edit ${portfolio.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(portfolio)}
                          disabled={deletingSlug === portfolio.slug}
                          className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Hapus ${portfolio.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {portfolios.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada portfolio.</td>
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

export default PortfoliosTab;
