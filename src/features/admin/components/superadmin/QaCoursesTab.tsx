import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useAdminQaCourseStore } from '../../../../store/useAdminQaCourseStore';
import type { QaCourseSummary } from '../../../../types/qaCourse';
import { QA_COURSE_LEVEL_LABEL } from '../../../../types/qaCourse';
import LoadingState from '../../../../components/common/LoadingState';
import QaCourseForm from './QaCourseForm';
import QaCourseDetailPage, { type CourseDetailTab } from './QaCourseDetailPage';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';
import { useConfirmStore } from '../../../../store/useConfirmStore';

const STATUS_TONE: Record<QaCourseSummary['status'], StatusBadgeTone> = { draft: 'slate', published: 'emerald' };

const BASE = '/dashboard/qa-courses';
const DETAIL_TABS: CourseDetailTab[] = ['detail', 'peserta', 'feedback'];

/**
 * Routes under /dashboard/qa-courses:
 *   (none)          list
 *   new             create form
 *   :slug           course page, Detail tab (editor)
 *   :slug/peserta   course page, Peserta tab
 *   :slug/feedback  course page, Feedback tab
 */
function parseRoute(pathname: string): { view: 'list' } | { view: 'new' } | { view: 'course'; slug: string; tab: CourseDetailTab } {
  const [slug, sub] = pathname.slice(BASE.length).split('/').filter(Boolean);
  if (!slug) return { view: 'list' };
  if (slug === 'new') return { view: 'new' };
  return { view: 'course', slug, tab: DETAIL_TABS.includes(sub as CourseDetailTab) ? (sub as CourseDetailTab) : 'detail' };
}

const coursePath = (slug: string, tab: CourseDetailTab = 'detail') => `${BASE}/${slug}${tab === 'detail' ? '' : `/${tab}`}`;

/** A count that opens the matching tab of the course page; 0 stays plain text. */
const CountLink: React.FC<{ to: string; value: number | undefined; label: string }> = ({ to, value, label }) =>
  value ? (
    <Link to={to} aria-label={`${label}: ${value}`} className="text-sm font-medium text-ld-graphite tabular-nums no-underline hover:text-ld-violet hover:underline">
      {value}
    </Link>
  ) : (
    <span className="text-sm text-ld-fog tabular-nums">{value === undefined ? '-' : 0}</span>
  );

const QaCoursesTab: React.FC = () => {
  const { courses, loading, loadError, load, clearCurrent, create, remove } = useAdminQaCourseStore();
  const openConfirm = useConfirmStore((s) => s.open);
  const location = useLocation();
  const navigate = useNavigate();
  const route = parseRoute(location.pathname);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => { load(); }, [load]);

  const toList = () => navigate(BASE);

  const handleDelete = (course: QaCourseSummary) => {
    setDeleteError(null);
    openConfirm({
      mode: 'cta', variant: 'danger', icon: 'delete', confirmLabel: 'Hapus course',
      title: `Hapus course "${course.title}"?`,
      description: 'Course dihapus permanen, beserta progress peserta dan semua jawaban feedback-nya. Artikel dan misi simulator di dalamnya tetap ada.',
      onConfirm: async () => {
        setDeletingSlug(course.slug);
        const result = await remove(course.slug);
        setDeletingSlug(null);
        if (!result.ok) setDeleteError(result.reason ?? 'Gagal menghapus course.');
      },
    });
  };

  if (route.view === 'course') {
    return (
      <QaCourseDetailPage
        slug={route.slug}
        tab={route.tab}
        onTab={(tab) => navigate(coursePath(route.slug, tab))}
        onBack={toList}
        onSlugChange={(slug) => navigate(coursePath(slug, route.tab), { replace: true })}
      />
    );
  }

  if (route.view === 'new') {
    return (
      <QaCourseForm
        key="new"
        course={null}
        onClose={() => { clearCurrent(); toList(); }}
        onSubmit={create}
        onSaved={(slug) => navigate(coursePath(slug), { replace: true })}
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
          onClick={() => { clearCurrent(); navigate(`${BASE}/new`); }}
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
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap text-right">Peserta</th>
                  <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap text-right">Feedback</th>
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
                          <img src={course.thumbnailUrl} alt="" className="h-9 w-auto max-w-20 rounded-md border border-ld-frost shrink-0" />
                        ) : (
                          <span className="h-9 aspect-video rounded-md bg-ld-cloud border border-ld-frost shrink-0" />
                        )}
                        <Link
                          to={coursePath(course.slug)}
                          className="text-sm font-semibold text-ld-violet no-underline underline-offset-2 decoration-ld-lavender hover:underline hover:text-[#1f87e6] focus-visible:underline"
                        >
                          {course.title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ld-fog whitespace-nowrap">{QA_COURSE_LEVEL_LABEL[course.level]}</td>
                    <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">
                      {course.moduleCount} modul · {course.articleCount} artikel · {course.missionCount} misi
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CountLink to={coursePath(course.slug, 'peserta')} value={course.learnerCount} label={`Peserta ${course.title}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CountLink to={coursePath(course.slug, 'feedback')} value={course.feedbackCount} label={`Feedback ${course.title}`} />
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
                            aria-label={`Lihat halaman publik ${course.title}`}
                            title="Lihat halaman publik"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        {/* Title on a wrapper: disabled buttons get no hover tooltip in some browsers. */}
                        <span title={course.deleteLocked ? 'Tidak bisa dihapus: sudah ada peserta atau feedback. Ubah status ke draft untuk menyembunyikan.' : 'Hapus course'}>
                          <button
                            onClick={() => handleDelete(course)}
                            disabled={deletingSlug === course.slug || Boolean(course.deleteLocked)}
                            className="p-2 rounded-lg text-ld-fog hover:text-red-500 hover:bg-red-50 cursor-pointer border-none bg-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-ld-fog disabled:hover:bg-transparent"
                            aria-label={course.deleteLocked ? `${course.title} tidak bisa dihapus, sudah ada peserta atau feedback` : `Hapus ${course.title}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-sm text-ld-fog">Belum ada course.</td></tr>
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
