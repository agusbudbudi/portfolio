import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminSkillsStore } from '../../../../store/useAdminSkillsStore';
import type { SkillConfig } from '../../../../types/portfolio';
import { usePagination } from '../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../components/common/LoadingState';
import SkillForm from './SkillForm';
import Pagination from '../shared/Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

const SkillsTab: React.FC = () => {
  const { skills, loading, loadError, load, upsertSkill, deleteSkill } = useAdminSkillsStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SkillConfig | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sorted = sortByUpdatedAtDesc(skills);
  const { page, setPage, totalPages, pageItems: pagedSkills } = usePagination(sorted);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (skill: SkillConfig) => { setEditing(skill); setFormOpen(true); };

  if (formOpen) {
    return (
      <SkillForm
        onClose={() => setFormOpen(false)}
        onSubmit={upsertSkill}
        skill={editing}
        existingIds={skills.map((s) => s.id)}
      />
    );
  }

  const handleDelete = async (skill: SkillConfig) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus skill "${skill.name}"? Portfolio yang masih mereferensikan skill ini tidak akan diperbarui otomatis.`)) return;
    setDeletingId(skill.id);
    const result = await deleteSkill(skill.id);
    setDeletingId(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus skill.');
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Skills</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{skills.length} skill tersedia untuk dipilih di Portfolio.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Skill
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
          <LoadingState label="Memuat skills…" />
        ) : (
          <>
          <div className="overflow-x-auto border border-ld-frost rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ld-cloud text-left">
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel">Skill</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">ID</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Kategori</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedSkills.map((skill) => (
                  <tr key={skill.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openEdit(skill)}
                        className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                      >
                        {skill.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <code className="text-[11px] text-ld-slate">{skill.id}</code>
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-fog whitespace-nowrap">{skill.category ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(skill)}
                          className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill)}
                          disabled={deletingId === skill.id}
                          className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Hapus ${skill.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {skills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada skill.</td>
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

export default SkillsTab;
