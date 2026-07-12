import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminToolsStore } from '../../../../../store/useAdminToolsStore';
import type { ToolConfig } from '../../../../../types/portfolio';
import { usePagination } from '../../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../../components/portfolio/common/LoadingState';
import ToolForm from './ToolForm';
import Pagination from './Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

const ToolsTab: React.FC = () => {
  const { tools, loading, loadError, load, upsertTool, deleteTool } = useAdminToolsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ToolConfig | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sorted = sortByUpdatedAtDesc(tools);
  const { page, setPage, totalPages, pageItems: pagedTools } = usePagination(sorted);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (tool: ToolConfig) => { setEditing(tool); setFormOpen(true); };

  if (formOpen) {
    return (
      <ToolForm
        onClose={() => setFormOpen(false)}
        onSubmit={upsertTool}
        tool={editing}
        existingIds={tools.map((t) => t.id)}
      />
    );
  }

  const handleDelete = async (tool: ToolConfig) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus tool "${tool.name}"? Project yang masih mereferensikan tool ini tidak akan diperbarui otomatis.`)) return;
    setDeletingId(tool.id);
    const result = await deleteTool(tool.id);
    setDeletingId(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus tool.');
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Tools</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{tools.length} tool tersedia untuk dipilih di Project.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Tool
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
          <LoadingState label="Memuat tools…" />
        ) : (
          <>
          <div className="overflow-x-auto border border-ld-frost rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ld-cloud text-left">
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel">Tool</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Kategori</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedTools.map((tool) => (
                  <tr key={tool.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[180px]">
                        {tool.logo ? (
                          <img src={tool.logo} alt="" className="w-8 h-8 rounded-lg object-contain border border-ld-frost shrink-0" />
                        ) : (
                          <span className="w-8 h-8 rounded-lg bg-ld-cloud border border-ld-frost shrink-0" />
                        )}
                        <button
                          onClick={() => openEdit(tool)}
                          className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                        >
                          {tool.name}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-[11px] text-ld-slate">{tool.id}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-fog whitespace-nowrap">{tool.category ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(tool)}
                          className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                          aria-label={`Edit ${tool.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(tool)}
                          disabled={deletingId === tool.id}
                          className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Hapus ${tool.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tools.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada tool.</td>
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

export default ToolsTab;
