import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { useAdminQaCourseStore } from '../../../../store/useAdminQaCourseStore';
import { useSnackbarStore } from '../../../../store/useSnackbarStore';
import type { QaCourseSummary } from '../../../../types/qaCourse';
import LoadingState from '../../../../components/common/LoadingState';
import QaCourseForm from './QaCourseForm';
import QaCourseLearnersPanel from './QaCourseLearnersPanel';
import QaCourseFeedbackPanel from './QaCourseFeedbackPanel';
import { ADMIN_CARD, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';
import { useConfirmStore } from '../../../../store/useConfirmStore';

export type CourseDetailTab = 'detail' | 'peserta' | 'feedback';

const TABS: { id: CourseDetailTab; label: string }[] = [
  { id: 'detail', label: 'Detail' },
  { id: 'peserta', label: 'Peserta' },
  { id: 'feedback', label: 'Feedback' },
];

const STATUS_TONE: Record<QaCourseSummary['status'], StatusBadgeTone> = { draft: 'slate', published: 'emerald' };

interface Props {
  slug: string;
  tab: CourseDetailTab;
  onTab: (tab: CourseDetailTab) => void;
  onBack: () => void;
  /** Slug changed on save: move the URL to the new one. */
  onSlugChange: (slug: string) => void;
}

/**
 * One course in the admin, with its views as tabs (Detail = editor, Peserta,
 * Feedback). Each tab has its own URL; a tab stays mounted once opened, so
 * unsaved edits in Detail survive a look at Peserta and back.
 */
const QaCourseDetailPage: React.FC<Props> = ({ slug, tab, onTab, onBack, onSlugChange }) => {
  const { courses, current, currentLoading, currentError, loadOne, clearCurrent, update, remove } = useAdminQaCourseStore();
  // From the admin list (loaded by QaCoursesTab); unknown while it loads, the server still refuses.
  const deleteLocked = Boolean(courses.find((c) => c.slug === slug)?.deleteLocked);
  const showSnackbar = useSnackbarStore((s) => s.show);
  const openConfirm = useConfirmStore((s) => s.open);
  const [visited, setVisited] = useState<Set<CourseDetailTab>>(() => new Set([tab]));
  const [deleting, setDeleting] = useState(false);

  // Load when the slug in the URL is not the course in memory (first open, or
  // another course); a save that renamed the slug already updated `current`.
  useEffect(() => {
    if (current?.slug !== slug) loadOne(slug);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearCurrent(), [clearCurrent]);

  const [seenTab, setSeenTab] = useState(tab);
  if (tab !== seenTab) {
    setSeenTab(tab);
    if (!visited.has(tab)) setVisited(new Set(visited).add(tab));
  }

  if (currentError) {
    return (
      <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY} flex flex-col items-start gap-3`}>
        <p className="m-0 text-sm text-red-600">{currentError}</p>
        <button type="button" onClick={onBack} className="text-sm text-ld-violet bg-transparent border-none p-0 cursor-pointer">Kembali ke daftar course</button>
      </div>
    );
  }
  if (currentLoading || !current || current.slug !== slug) {
    return <div className={`${ADMIN_CARD} ${ADMIN_CARD_BODY}`}><LoadingState label="Memuat course…" /></div>;
  }

  const handleDelete = () => openConfirm({
    mode: 'cta', variant: 'danger', icon: 'delete', confirmLabel: 'Hapus course',
    title: `Hapus course "${current.title}"?`,
    description: 'Course dihapus permanen, beserta progress peserta dan semua jawaban feedback-nya. Artikel dan misi simulator di dalamnya tetap ada.',
    onConfirm: async () => {
      setDeleting(true);
      const result = await remove(current.slug);
      setDeleting(false);
      if (!result.ok) { showSnackbar(result.reason ?? 'Gagal menghapus course.', 'error'); return; }
      showSnackbar('Course dihapus.', 'success');
      onBack();
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className={ADMIN_CARD}>
        <div className="flex items-center gap-3 px-4 md:px-6 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
            aria-label="Kembali ke daftar course"
          >
            <ArrowLeft size={17} />
          </button>
          {current.thumbnailUrl ? (
            <img src={current.thumbnailUrl} alt="" className="h-10 w-auto max-w-24 rounded-md border border-ld-frost shrink-0" />
          ) : (
            <span className="h-10 aspect-video rounded-md bg-ld-cloud border border-ld-frost shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="m-0 text-base font-semibold text-ld-onyx truncate">{current.title}</h2>
              <StatusBadge tone={STATUS_TONE[current.status]}>{current.status}</StatusBadge>
            </div>
            <p className="m-0 mt-0.5 text-xs text-ld-fog truncate">/courses/{current.slug}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {current.status === 'published' && (
              <a
                href={`/courses/${current.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-ld-fog hover:text-ld-violet hover:bg-ld-cloud transition-colors"
                aria-label="Buka halaman course"
                title="Buka halaman course"
              >
                <ExternalLink size={15} />
              </a>
            )}
            <span title={deleteLocked ? 'Tidak bisa dihapus: sudah ada peserta atau feedback. Ubah status ke draft untuk menyembunyikan.' : 'Hapus course'}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || deleteLocked}
                className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-ld-fog disabled:hover:bg-transparent"
                aria-label={deleteLocked ? 'Course tidak bisa dihapus, sudah ada peserta atau feedback' : 'Hapus course'}
              >
                <Trash2 size={15} />
              </button>
            </span>
          </div>
        </div>

        <div role="tablist" aria-label="Bagian course" className="flex gap-1 px-4 md:px-6 mt-3 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`course-tab-${t.id}`}
                aria-selected={active}
                aria-controls={`course-panel-${t.id}`}
                onClick={() => onTab(t.id)}
                className={`relative px-3 py-2.5 text-[13px] whitespace-nowrap bg-transparent border-none cursor-pointer transition-colors ${
                  active ? 'text-ld-onyx font-semibold' : 'text-ld-slate hover:text-ld-graphite'
                }`}
              >
                {t.label}
                <span className={`absolute left-2 right-2 bottom-0 h-0.5 rounded-full transition-colors ${active ? 'bg-ld-violet' : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {TABS.filter((t) => visited.has(t.id)).map((t) => (
        <div key={t.id} role="tabpanel" id={`course-panel-${t.id}`} aria-labelledby={`course-tab-${t.id}`} hidden={t.id !== tab}>
          {t.id === 'detail' && (
            <QaCourseForm
              key={current.id}
              course={current}
              onSubmit={(payload) => update(current.slug, payload)}
              onSaved={(saved) => {
                showSnackbar('Course tersimpan.', 'success');
                if (saved !== slug) onSlugChange(saved);
              }}
            />
          )}
          {/* Remount after a save so counts follow the edited outline. */}
          {t.id === 'peserta' && <QaCourseLearnersPanel key={current.updatedAt} slug={current.slug} />}
          {t.id === 'feedback' && <QaCourseFeedbackPanel key={current.updatedAt} slug={current.slug} />}
        </div>
      ))}
    </div>
  );
};

export default QaCourseDetailPage;
