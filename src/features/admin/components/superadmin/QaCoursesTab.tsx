import React, { useEffect, useState } from 'react';
import { ExternalLink, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useAdminQaCourseStore } from '../../../../store/useAdminQaCourseStore';
import type { QaCourseSummary } from '../../../../types/qaCourse';
import { QA_COURSE_LEVEL_LABEL } from '../../../../types/qaCourse';
import LoadingState from '../../../../components/common/LoadingState';
import QaCourseForm from './QaCourseForm';
import QaCourseLearnersPanel from './QaCourseLearnersPanel';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';

const STATUS_TONE: Record<QaCourseSummary['status'], StatusBadgeTone> = { draft: 'slate', published: 'emerald' };

const QaCoursesTab: React.FC = () => {
  const { courses, loading, loadError, load, current, currentLoading, currentError, loadOne, clearCurrent, create, update, remove } = useAdminQaCourseStore();
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [learnersFor, setLearnersFor] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { clearCurrent(); setMode('create'); setFormOpen(true); };
  const openEdit = async (slug: string) => { setMode('edit'); setFormOpen(true); await loadOne(slug); };
  const closeForm = () => { setFormOpen(false); clearCurrent(); };

  const handleDelete = async (course: QaCourseSummary) => {
    setDeleteError(null);
    if (!window.confirm(`Hapus course "${course.title}"? Progress peserta di course ini ikut terhapus.`)) return;
    setDeletingSlug(course.slug);
    const result = await remove(course.slug);
    setDeletingSlug(null);
    if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus course.');
  };

  if (learnersFor) return <QaCourseLearnersPanel slug={learnersFor} onClose={() => setLearnersFor(null)} />;

  if (formOpen) {
    if (mode === 'edit' && (currentLoading || !current)) {
      return (
        <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}>
          {currentError ? <p className="m-0 text-sm text-red-600">{currentError}</p> : <LoadingState label="Memuat course…" />}
        </div>
      );
    }
    return (
      <QaCourseForm
        key={current?.id ?? 'new'}
        onClose={closeForm}
        onSubmit={(payload) => (mode === 'edit' && current ? update(current.slug, payload) : create(payload))}
        course={mode === 'edit' ? current : null}
      />
    );
  }

  return (
    <div className={ADMIN_CARD}>
      <div className={`${ADMIN_CARD_HEADER} justify-between`}>
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Courses</h2>
          <p className="text-xs text-ld-fog m-0 mt-1">{courses.length} course. Susun artikel library dan misi simulator jadi jalur belajar.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors"
        >
          <Plus size={14} /> Tambah Course
        </button>
      </div>

      <div className={ADMIN_CARD_BODY}>
        {loadError && <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{loadError}</p>}
        {deleteError && <p className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{deleteError}</p>}

        {loading ? (
          <LoadingState label="Memuat course…" />
        ) : (
          <div className="overflow-x-auto border border-ld-frost rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ld-cloud text-left">
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel">Course</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Level</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Isi</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        {course.thumbnailUrl ? (
                          <img src={course.thumbnailUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-ld-frost shrink-0" />
                        ) : (
                          <span className="w-9 h-9 rounded-lg bg-ld-cloud border border-ld-frost shrink-0" />
                        )}
                        <button
                          onClick={() => openEdit(course.slug)}
                          className="text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0 text-left"
                        >
                          {course.title}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-fog whitespace-nowrap">{QA_COURSE_LEVEL_LABEL[course.level]}</td>
                    <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">
                      {course.moduleCount} modul · {course.articleCount} artikel · {course.missionCount} misi
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge tone={STATUS_TONE[course.status]}>{course.status}</StatusBadge></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {course.status === 'published' && (
                          <a
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud transition-colors"
                            aria-label={`Buka ${course.title}`}
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => setLearnersFor(course.slug)}
                          className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                          aria-label={`Peserta ${course.title}`}
                          title="Peserta"
                        >
                          <Users size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(course.slug)}
                          className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
                          aria-label={`Edit ${course.title}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(course)}
                          disabled={deletingSlug === course.slug}
                          className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Hapus ${course.title}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada course.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QaCoursesTab;
