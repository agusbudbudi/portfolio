import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingState from '../../../components/common/LoadingState';
import NotFoundState from '../../../components/common/NotFoundState';
import type { PublicSimulatorPortfolio } from '../../../types/qaSimulator';
import { useSimulatorProject } from '../hooks/useSimulatorData';
import { apiGetPublicSimulatorPortfolio } from '../lib/simulatorApi';
import { summarizePortfolio } from '../lib/portfolioSummary';
import PortfolioDocument from '../components/PortfolioDocument';
import MadeWithBanner from '../components/MadeWithBanner';
import { completedCourses } from '../../qa-course/lib/completedCourses';
import CoursePortfolioView from '../../qa-course/components/CoursePortfolioView';

type FetchState =
  | { status: 'loading' }
  | { status: 'ready'; portfolio: PublicSimulatorPortfolio }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

const NotShared: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh] px-4 font-ld-sans">
    <NotFoundState
      illustrationLabel="?"
      title="Portfolio tidak tersedia"
      description="Link ini sudah tidak aktif, atau pemiliknya belum membagikan portfolio ini."
      actionTo="/qa-simulator"
      actionLabel="Lihat QA Simulator"
    />
  </div>
);

// Public, read-only copy of a finished simulator portfolio, reachable only
// while the owner keeps its share link on. Needs no SaaS portfolio.
const QaSimulatorSharedPortfolioPage: React.FC = () => {
  const { projectId = '', shareId = '' } = useParams<{ projectId: string; shareId: string }>();
  const { project, loading, error } = useSimulatorProject(projectId);
  const [state, setState] = useState<FetchState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    apiGetPublicSimulatorPortfolio(shareId)
      .then((portfolio) => {
        if (cancelled) return;
        setState(portfolio ? { status: 'ready', portfolio } : { status: 'not-found' });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ status: 'error', message: e instanceof Error ? e.message : 'Gagal memuat portfolio.' });
      });
    return () => { cancelled = true; };
  }, [shareId]);

  if (loading || state.status === 'loading') return <LoadingState label="Memuat portfolio…" className="min-h-[60vh]" />;
  if (state.status === 'error') return <p className="p-10 text-center text-sm text-ld-slate">{state.message}</p>;
  if (error || !project || state.status === 'not-found') return <NotShared />;

  const { portfolio } = state;
  // The token belongs to one project: a share link pasted under another
  // project's URL must not render that project's document.
  if (portfolio.projectId !== project.id || !summarizePortfolio(project, portfolio.data).allDone) return <NotShared />;

  const author = portfolio.owner.name;
  const finished = completedCourses(portfolio.courses ?? [], project, portfolio.data);

  return (
    <PortfolioDocument
      project={project}
      progress={portfolio.data}
      author={author}
      avatarUrl={portfolio.owner.avatarUrl}
      seoPath={`/qa-simulator/${project.id}/portfolio/${shareId}`}
      banner={<MadeWithBanner />}
      courseView={finished.length > 0 ? (showSimulator) => (
        <CoursePortfolioView courses={finished} project={project} author={author} avatarUrl={portfolio.owner.avatarUrl} onShowSimulator={showSimulator} />
      ) : undefined}
    />
  );
};

export default QaSimulatorSharedPortfolioPage;
