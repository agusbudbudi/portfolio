import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useAdminConfigStore } from '../../../../../store/useAdminConfigStore';
import type { MentorConfig } from '../../../../../types/mentoring';
import MentorForm from './MentorForm';

const MentorsTab: React.FC = () => {
  const { topics, mentors, availableDays, upsertMentor, deleteMentor } = useAdminConfigStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MentorConfig | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? id;
  const weeklySlots = (mentor: MentorConfig) =>
    Object.values(mentor.schedule).reduce((sum, slots) => sum + slots.length, 0);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (mentor: MentorConfig) => { setEditing(mentor); setFormOpen(true); };

  if (formOpen) {
    return (
      <MentorForm
        onClose={() => setFormOpen(false)}
        onSubmit={upsertMentor}
        mentor={editing}
        existingIds={mentors.map((m) => m.id)}
        topics={topics}
        availableDays={availableDays}
      />
    );
  }

  const handleDelete = (mentor: MentorConfig) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus mentor "${mentor.name}"?`)) return;
    const result = deleteMentor(mentor.id);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus mentor.');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ld-fog m-0">Mentors</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{mentors.length} mentor aktif.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Mentor
        </button>
      </div>

      {deleteError && (
        <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{deleteError}</p>
      )}

      <div className="overflow-x-auto border border-ld-ash rounded-xl">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-ld-cloud text-left">
              <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Mentor</th>
              <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">WhatsApp</th>
              <th className="px-4 py-3 text-xs font-medium text-ld-steel">Expertise</th>
              <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Slot/minggu</th>
              <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((mentor) => (
              <tr key={mentor.id} className="border-t border-ld-ash bg-white hover:bg-ld-cloud/50 transition-colors">
                <td className="px-4 py-3 align-top">
                  <div className="flex items-start gap-3 min-w-[220px]">
                    {mentor.avatar ? (
                      <img src={mentor.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-ld-ash shrink-0" />
                    ) : (
                      <span className="w-10 h-10 rounded-full bg-ld-cloud border border-ld-ash shrink-0 flex items-center justify-center text-sm text-ld-fog">
                        {mentor.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="block text-sm font-medium text-ld-onyx">{mentor.name}</span>
                      <p className="text-xs text-ld-fog m-0 mt-0.5 line-clamp-2">{mentor.bio}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-xs text-ld-slate whitespace-nowrap">{mentor.whatsapp}</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1.5 min-w-[160px]">
                    {mentor.expertise.map((topicId) => (
                      <span key={topicId} className="px-2 py-0.5 rounded-full bg-ld-lilac text-ld-violet text-[10px] font-medium">
                        {topicLabel(topicId)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-xs text-ld-slate whitespace-nowrap">{weeklySlots(mentor)} slot</td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(mentor)}
                      className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                      aria-label={`Edit ${mentor.name}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(mentor)}
                      className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors"
                      aria-label={`Hapus ${mentor.name}`}
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

    </div>
  );
};

export default MentorsTab;
