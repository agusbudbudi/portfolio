import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminConfigStore } from '../../../../../store/useAdminConfigStore';
import type { TopicConfig } from '../../../../../types/mentoring';
import { usePagination } from '../../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../../lib/sortByUpdatedAt';
import TopicForm from './TopicForm';
import Pagination from './Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

const TopicsTab: React.FC = () => {
  const { topics, upsertTopic, deleteTopic } = useAdminConfigStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TopicConfig | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const sorted = sortByUpdatedAtDesc(topics);
  const { page, setPage, totalPages, pageItems: pagedTopics } = usePagination(sorted);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (topic: TopicConfig) => { setEditing(topic); setFormOpen(true); };

  if (formOpen) {
    return (
      <TopicForm
        onClose={() => setFormOpen(false)}
        onSubmit={upsertTopic}
        topic={editing}
        existingIds={topics.map((t) => t.id)}
      />
    );
  }

  const handleDelete = async (topic: TopicConfig) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus topic "${topic.label}"?`)) return;
    setDeletingId(topic.id);
    const result = await deleteTopic(topic.id);
    setDeletingId(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus topic.');
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Topics</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{topics.length} topic tersedia di form booking.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Topic
        </button>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {deleteError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{deleteError}</p>
        )}

        <div className="overflow-x-auto border border-ld-frost rounded-xl">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-ld-cloud text-left">
                <th className="px-4 py-3 text-xs font-medium text-ld-steel">Topic</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel">Deskripsi</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pagedTopics.map((topic) => (
                <tr key={topic.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      {topic.image ? (
                        <img src={topic.image} alt="" className="w-9 h-9 rounded-lg object-cover border border-ld-frost shrink-0" />
                      ) : (
                        <span className="w-9 h-9 rounded-lg bg-ld-cloud border border-ld-frost shrink-0" />
                      )}
                      <button
                        onClick={() => openEdit(topic)}
                        className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                      >
                        {topic.label}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <code className="text-[11px] text-ld-slate">{topic.id}</code>
                  </td>
                  <td className="px-4 py-3 text-xs text-ld-fog">
                    <span className="line-clamp-2 min-w-[200px]">{topic.description}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {topic.popular ? (
                      <span className="px-2 py-0.5 rounded-full bg-ld-lilac text-ld-violet text-[10px] font-medium uppercase tracking-widest">
                        Popular
                      </span>
                    ) : (
                      <span className="text-xs text-ld-fog">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(topic)}
                        className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                        aria-label={`Edit ${topic.label}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic)}
                        disabled={deletingId === topic.id}
                        className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`Hapus ${topic.label}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} totalItems={sorted.length} pageSize={10} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default TopicsTab;
