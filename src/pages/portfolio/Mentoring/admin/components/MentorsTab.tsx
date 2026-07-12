import React, { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useAdminConfigStore } from '../../../../../store/useAdminConfigStore';
import { useAdminMentorStore } from '../../../../../store/useAdminMentorStore';
import type { MentorConfig, MentorVerificationStatus } from '../../../../../types/mentoring';
import { usePagination } from '../../../../../hooks/usePagination';
import { sortByUpdatedAtDesc } from '../../../../../lib/sortByUpdatedAt';
import LoadingState from '../../../../../components/portfolio/common/LoadingState';
import MentorForm from './MentorForm';
import Pagination from './Pagination';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

const STATUS_BADGE: Record<MentorVerificationStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  verified: 'bg-green-50 text-green-600',
  rejected: 'bg-red-50 text-red-500',
};

const MentorsTab: React.FC = () => {
  const { topics, availableDays } = useAdminConfigStore();
  const { mentors, loading, loadError, load, create, update, remove, review } = useAdminMentorStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MentorConfig | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? id;
  const weeklySlots = (mentor: MentorConfig) =>
    Object.values(mentor.schedule).reduce((sum, slots) => sum + slots.length, 0);
  const sorted = sortByUpdatedAtDesc(mentors);
  const { page, setPage, totalPages, pageItems: pagedMentors } = usePagination(sorted);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (mentor: MentorConfig) => { setEditing(mentor); setFormOpen(true); };

  if (formOpen) {
    return (
      <MentorForm
        onClose={() => setFormOpen(false)}
        onSubmit={(mentor) => (editing ? update(editing.id, mentor) : create(mentor))}
        mentor={editing}
        existingIds={mentors.map((m) => m.id)}
        topics={topics}
        availableDays={availableDays}
      />
    );
  }

  const handleDelete = async (mentor: MentorConfig) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus mentor "${mentor.name}"?`)) return;
    setDeletingId(mentor.id);
    const result = await remove(mentor.id);
    setDeletingId(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus mentor.');
  };

  const handleVerify = async (mentor: MentorConfig) => {
    setReviewError(null);
    setReviewingId(mentor.id);
    const result = await review(mentor.id, 'verified', null);
    setReviewingId(null);
    if (!result.ok) setReviewError(result.reason ?? 'Gagal memverifikasi mentor.');
  };

  const handleReject = async (mentor: MentorConfig) => {
    setReviewError(null);
    const reason = window.prompt(`Alasan menolak "${mentor.name}":`);
    if (!reason || !reason.trim()) return;
    setReviewingId(mentor.id);
    const result = await review(mentor.id, 'rejected', reason.trim());
    setReviewingId(null);
    if (!result.ok) setReviewError(result.reason ?? 'Gagal menolak mentor.');
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Mentors</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{mentors.length} mentor aktif.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Mentor
        </button>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {loadError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{loadError}</p>
        )}
        {deleteError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{deleteError}</p>
        )}
        {reviewError && (
          <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{reviewError}</p>
        )}

        {loading ? (
          <LoadingState label="Memuat mentors…" />
        ) : (
          <>
            <div className="overflow-x-auto border border-ld-frost rounded-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ld-cloud text-left">
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Mentor</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">WhatsApp</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Expertise</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Slot/minggu</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedMentors.map((mentor) => (
                    <tr key={mentor.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-start gap-3 min-w-[220px]">
                          {mentor.avatar ? (
                            <img src={mentor.avatar} alt="" className="w-10 h-10 rounded-lg object-cover border border-ld-frost shrink-0" />
                          ) : (
                            <span className="w-10 h-10 rounded-lg bg-ld-cloud border border-ld-frost shrink-0 flex items-center justify-center text-sm text-ld-fog">
                              {mentor.name.charAt(0)}
                            </span>
                          )}
                          <div className="min-w-0">
                            <button
                              onClick={() => openEdit(mentor)}
                              className="block text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                            >
                              {mentor.name}
                            </button>
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
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest ${STATUS_BADGE[mentor.verificationStatus ?? 'verified']}`}>
                          {mentor.verificationStatus ?? 'verified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-end gap-1">
                          {mentor.verificationStatus && mentor.verificationStatus !== 'verified' && (
                            <>
                              <button
                                onClick={() => handleVerify(mentor)}
                                disabled={reviewingId === mentor.id}
                                className="p-2 rounded-lg text-ld-fog hover:text-green-600 hover:bg-green-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label={`Verifikasi ${mentor.name}`}
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={() => handleReject(mentor)}
                                disabled={reviewingId === mentor.id}
                                className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label={`Tolak ${mentor.name}`}
                              >
                                <X size={15} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openEdit(mentor)}
                            className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                            aria-label={`Edit ${mentor.name}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(mentor)}
                            disabled={deletingId === mentor.id}
                            className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
            <Pagination page={page} totalPages={totalPages} totalItems={sorted.length} pageSize={10} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
};

export default MentorsTab;
