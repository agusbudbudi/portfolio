import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { QaPortfolioIcon } from '../../../components/illustration/ProductIcons';
import TrophyIllustration from '../../qa-simulator/components/TrophyIllustration';
import Seo from '../../../components/common/Seo';
import LoadingState from '../../../components/common/LoadingState';
import { useCourse } from '../hooks/useCourse';

// Graduation page: points the learner at their simulator portfolio(s), where
// they turn on the public share link and post it.
const CourseCompletePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state, course, lessons, completion, loggedIn, progressLoaded } = useCourse(slug);

  if (state.status === 'loading' || (loggedIn && !progressLoaded)) return <LoadingState className="min-h-[60vh]" />;
  if (!course) return <p className="pt-12 md:pt-16 px-4 text-center text-sm text-ld-slate">Course tidak ditemukan.</p>;

  const projects = new Map<string, string>();
  lessons.forEach((l) => {
    if (l.item.kind === 'mission' && !projects.has(l.item.projectId)) projects.set(l.item.projectId, l.product ?? l.item.projectId);
  });

  if (!completion.allDone) {
    return (
      <div className="font-ld-sans max-w-xl mx-auto px-4 pt-12 md:pt-16 pb-16 text-center">
        <h1 className="m-0 font-ld-display text-2xl font-semibold text-ld-onyx">Sedikit lagi</h1>
        <p className="m-0 mt-3 text-sm text-ld-slate">
          {loggedIn ? `Kamu sudah menyelesaikan ${completion.done} dari ${completion.total} lesson di ${course.title}.` : 'Login dan selesaikan semua lesson untuk membuka halaman kelulusan.'}
        </p>
        <Link to={`/courses/${course.slug}`} className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline">
          <ArrowLeft size={15} /> Kembali ke course
        </Link>
      </div>
    );
  }

  return (
    <div className="font-ld-sans max-w-2xl mx-auto px-4 pt-12 md:pt-16 pb-16">
      <Seo path={`/courses/${course.slug}/selesai`} title={`Lulus: ${course.title} | QA Course`} description={course.description} noindex />
      <div className="text-center">
        {/* Same animated trophy as QA Simulator's "all phases done" bar:
            springs in, confetti bursts, then a shine + twinkle loop. */}
        <TrophyIllustration className="mx-auto w-40 h-auto" />
        <h1 className="m-0 mt-4 font-ld-display text-3xl font-semibold text-ld-onyx tracking-[-0.02em]">Selamat, kamu lulus!</h1>
        <p className="m-0 mt-3 text-sm sm:text-base text-ld-slate leading-relaxed">
          Kamu menyelesaikan {course.title}: {completion.total} lesson, termasuk misi praktik di QA Simulator.
          Sekarang tunjukkan hasil kerjamu.
        </p>
      </div>

      {projects.size > 0 && (
        <section className="mt-10">
          <h2 className="m-0 mb-1 text-base font-semibold text-ld-onyx">Portfolio dari course ini</h2>
          <p className="m-0 mb-4 text-sm text-ld-slate">Buka portfolio, nyalakan <strong>Publik</strong>, lalu salin link-nya ke CV atau LinkedIn.</p>
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {[...projects].map(([projectId, product]) => (
              <li key={projectId}>
                <Link
                  to={`/qa-simulator/${projectId}/portfolio`}
                  target="_blank"
                  rel="noopener"
                  aria-label={`QA Case Study: ${product} (buka di tab baru)`}
                  className="group flex items-center gap-4 rounded-xl border border-ld-frost bg-white p-4 no-underline hover:border-ld-violet transition-colors"
                >
                  <QaPortfolioIcon size={44} className="shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-ld-onyx">QA Case Study: {product}</span>
                    <span className="block text-xs text-ld-slate">Test plan, test case, dan bug report yang kamu tulis</span>
                  </span>
                  <ArrowUpRight size={16} className="text-ld-fog group-hover:text-ld-violet shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="m-0 mt-8 text-center text-sm text-ld-slate">
        Punya portfolio di Mentor.QA? Tampilkan hasil simulasi ini lewat section <strong>QA Simulator</strong> di form portfolio.
      </p>
      <div className="mt-6 text-center">
        <Link to="/courses" className="text-sm text-ld-violet no-underline">Lihat course lain</Link>
      </div>
    </div>
  );
};

export default CourseCompletePage;
