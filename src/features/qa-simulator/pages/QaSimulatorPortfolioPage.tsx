import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import LoadingState from '../../../components/common/LoadingState';
import { useAdminAuthStore } from '../../../store/useAdminAuthStore';
import type { SimulatorProject } from '../../../types/qaSimulator';
import { useSimulatorProject } from '../hooks/useSimulatorData';
import { useSimulatorProgress } from '../hooks/useSimulatorProgress';
import { isPhaseComplete } from '../lib/progress';
import LockIllustration from '../components/LockIllustration';
import PortfolioDocument from '../components/PortfolioDocument';
import { portfolioDocTitle, printPortfolio } from '../lib/printPortfolio';
import ShareBanner from '../components/ShareBanner';
import type { QaCourseWithProgress } from '../../../types/qaCourse';
import { fetchMyCoursesForProject } from '../../qa-course/lib/courseApi';
import { completedCourses } from '../../qa-course/lib/completedCourses';
import CoursePortfolioView from '../../qa-course/components/CoursePortfolioView';

// Owner view of the QA case study: built from the learner's own progress,
// with the share toggle. The public, read-only copy lives at
// /qa-simulator/:projectId/portfolio/:shareId (QaSimulatorSharedPortfolioPage).
const QaSimulatorPortfolioPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { project, loading, error } = useSimulatorProject(projectId);
  if (loading) return <LoadingState label="Menyusun portfolio…" className="min-h-[60vh]" />;
  if (error || !project) return <p className="p-10 text-center text-sm text-ld-slate">{error ?? 'Project tidak ditemukan.'}</p>;
  return <Portfolio project={project} />;
};

const Portfolio: React.FC<{ project: SimulatorProject }> = ({ project }) => {
  const { progress, status } = useSimulatorProgress(project.id);
  const user = useAdminAuthStore((s) => s.user);
  const token = useAdminAuthStore((s) => s.token);
  // The learner's courses on this project, for the "QA Course" tab.
  const [courseRecords, setCourseRecords] = useState<{ token: string; records: QaCourseWithProgress[] } | null>(null);
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchMyCoursesForProject(project.id, token)
      .then((records) => { if (!cancelled) setCourseRecords({ token, records }); })
      .catch(() => { /* no tab on failure: the case study still renders */ });
    return () => { cancelled = true; };
  }, [project.id, token]);

  if (status === 'loading') return <LoadingState label="Memuat hasil kerjamu…" className="min-h-[60vh]" />;

  const allDone = project.phases.every((p) => isPhaseComplete(p, progress));
  if (!allDone) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 px-4 text-center font-ld-sans">
        <LockIllustration className="w-36 h-auto" />
        <h1 className="m-0 text-lg font-semibold text-ld-onyx">Portfolio belum tersedia</h1>
        <p className="m-0 text-sm text-ld-slate max-w-sm">Selesaikan semua phase di project ini dulu, lalu portfolio otomatis tersusun dari hasil kerjamu.</p>
        <Link to={`/qa-simulator/${project.id}`} className="mt-2 px-4 py-2 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline">Lanjutkan simulasi</Link>
      </div>
    );
  }

  const author = user?.name ?? 'QA Engineer';
  const finished = courseRecords && courseRecords.token === token ? completedCourses(courseRecords.records, project, progress) : [];

  return (
    <PortfolioDocument
      project={project}
      progress={progress}
      author={author}
      avatarUrl={user?.avatarUrl ?? undefined}
      seoPath={`/qa-simulator/${project.id}/portfolio`}
      banner={<ShareBanner projectId={project.id} />}
      courseView={finished.length > 0 ? (showSimulator) => (
        <CoursePortfolioView courses={finished} project={project} author={author} avatarUrl={user?.avatarUrl ?? undefined} onShowSimulator={showSimulator} />
      ) : undefined}
      toolbar={(
        <>
          <button
            type="button"
            onClick={() => printPortfolio(portfolioDocTitle(author, project))}
            title="Pilih Save as PDF, lalu matikan Headers and footers."
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer transition-colors"
          >
            <Download size={15} /> Download PDF
          </button>
        </>
      )}
    />
  );
};

export default QaSimulatorPortfolioPage;
