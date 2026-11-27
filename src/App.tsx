import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

import PortfolioNavbar from './features/personal-portfolio/components/Navbar';
import PortfolioFooter from './features/personal-portfolio/components/Footer';
import LightdashNavbar from './features/admin/components/shared/LightdashNavbar';
import LightdashFooter from './features/admin/components/shared/LightdashFooter';
import PublicPortfolioNavbar from './features/saas-portfolio/components/PublicPortfolioNavbar';
import PublicPortfolioScrollBanner from './features/saas-portfolio/components/PublicPortfolioScrollBanner';
import PublicPortfolioFooter from './features/saas-portfolio/components/PublicPortfolioFooter';
import { pageSeo } from './lib/pageSeo';
import Seo from './components/common/Seo';
import LoadingState from './components/common/LoadingState';
import { loadedHomePage, preloadHomePage } from './features/home/homePageLoader';
import { loadedProgramsPage, preloadProgramsPage } from './features/programs/programsPageLoader';

// Code-split, but preloaded by main.tsx on "/" so the first render uses the
// loaded module directly (no Suspense fallback, no layout shift). See homePageLoader.
const LazyHomePage = lazy(preloadHomePage);
const HomePage: React.FC = () => {
  const mod = loadedHomePage();
  return mod ? <mod.default /> : <LazyHomePage />;
};

// Same preload pattern for the /programs ad landing page.
const LazyProgramsPage = lazy(preloadProgramsPage);
const ProgramsPage: React.FC = () => {
  const mod = loadedProgramsPage();
  return mod ? <mod.default /> : <LazyProgramsPage />;
};

const CareerPathPage = lazy(() => import('./features/home/pages/CareerPathPage'));
const MentoringPage = lazy(() => import('./features/mentoring/pages/MentoringPage'));
const PortfolioHome = lazy(() => import('./features/personal-portfolio/pages/Home'));
const PortfolioAbout = lazy(() => import('./features/personal-portfolio/pages/About'));
const PortfolioProjects = lazy(() => import('./features/personal-portfolio/pages/Projects'));
const PortfolioCertifications = lazy(() => import('./features/personal-portfolio/pages/Certifications'));
const PortfolioBookingPage = lazy(() => import('./features/mentoring/pages/BookingPage'));
const MentorDetailPage = lazy(() => import('./features/mentoring/pages/MentorDetailPage'));
const PortfolioLandingPage = lazy(() => import('./features/saas-portfolio/pages/PortfolioLandingPage'));
const PublicPortfolioPage = lazy(() => import('./features/saas-portfolio/pages/PublicPortfolioPage'));
const QaLibraryIndexPage = lazy(() => import('./features/qa-library/pages/QaLibraryIndexPage'));
const QaLibraryArticleDetailPage = lazy(() => import('./features/qa-library/pages/QaLibraryArticleDetailPage'));
const CoursesIndexPage = lazy(() => import('./features/qa-course/pages/CoursesIndexPage'));
const CourseDetailPage = lazy(() => import('./features/qa-course/pages/CourseDetailPage'));
const CourseCompletePage = lazy(() => import('./features/qa-course/pages/CourseCompletePage'));
const QaSimulatorIndexPage = lazy(() => import('./features/qa-simulator/pages/QaSimulatorIndexPage'));
const QaSimulatorProjectPage = lazy(() => import('./features/qa-simulator/pages/QaSimulatorProjectPage'));
const QaSimulatorPortfolioPage = lazy(() => import('./features/qa-simulator/pages/QaSimulatorPortfolioPage'));
const QaSimulatorSharedPortfolioPage = lazy(() => import('./features/qa-simulator/pages/QaSimulatorSharedPortfolioPage'));
import SimulatorLayout from './features/qa-simulator/components/SimulatorLayout';
import CourseLayout from './features/qa-course/components/CourseLayout';
import { HOME_FAQ } from './features/home/data/homeFaq';
const SplitBillSandboxPage = lazy(() => import('./features/qa-simulator/pages/SplitBillSandboxPage'));
const DompetKuApiSandboxPage = lazy(() => import('./features/qa-simulator/pages/DompetKuApiSandboxPage'));
const DompetKuAppSandboxPage = lazy(() => import('./features/qa-simulator/pages/DompetKuAppSandboxPage'));
const TokoKitaAppSandboxPage = lazy(() => import('./features/qa-simulator/pages/TokoKitaAppSandboxPage'));
const TokoKitaDesignPage = lazy(() => import('./features/qa-simulator/pages/TokoKitaDesignPage'));
const AdminPage = lazy(() => import('./features/admin/pages/AdminPage'));
const LoginScreen = lazy(() => import('./features/admin/components/shared/LoginScreen'));
const OnboardingPage = lazy(() => import('./features/onboarding/pages/OnboardingPage'));
import OnboardingGate from './features/onboarding/components/OnboardingGate';
import OnboardingClaimSync from './features/onboarding/components/OnboardingClaimSync';
const Snackbar = lazy(() => import('./features/admin/components/shared/Snackbar').then((m) => ({ default: m.Snackbar })));
const NotFound = lazy(() => import('./components/NotFound'));

// React Router doesn't reset scroll on navigate — restore top-of-page on
// path change, but skip when a hash is present so anchor-scroll effects
// (e.g. MentoringPage, About) can take over.
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

const SAME_AS = [
  'https://linkedin.com/in/agus-budiman',
  'https://github.com/agusbudbudi',
  'https://www.instagram.com/agus.budimaan/',
];

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Agus Budiman',
  jobTitle: 'QA Engineer',
  url: 'https://www.mentorqa.com/personal-portfolio',
  image: 'https://www.mentorqa.com/personal-portfolio/img/profile/profile-agus.webp',
  sameAs: SAME_AS,
};

const mentoringServiceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Mentoring QA Engineer',
  name: 'Mentoring QA & Kursus QA Online 1-on-1',
  description:
    'Mentoring dan kursus QA online 1-on-1 bersama praktisi QA Engineer berpengalaman 6+ tahun: manual testing, automation testing, API testing.',
  provider: {
    '@type': 'Organization',
    name: 'Mentor.QA',
    sameAs: SAME_AS,
  },
  areaServed: 'ID',
  url: 'https://www.mentorqa.com/mentoring',
};

const homeFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mentor.QA',
  url: 'https://www.mentorqa.com/',
  description:
    'Platform karier QA Engineer: QA Course, simulasi kerja QA, QA Library, portfolio QA online, dan mentoring 1-on-1.',
  publisher: { '@type': 'Organization', name: 'Mentor.QA', sameAs: SAME_AS },
};

const portfolioPlatformJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Portfolio QA Engineer - Mentor.QA',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'Buat portfolio QA Engineer gratis: showcase proyek, sertifikasi, dan pengalaman kerja dengan link portfolio sendiri.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IDR',
  },
  url: 'https://www.mentorqa.com/portfolio',
};

interface LayoutProps {
  children: React.ReactNode;
}

// Legacy /:slug/portfolio links (indexed, shared) now resolve under /portfolio/:slug.
const LegacySlugPortfolioRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/portfolio/${slug}`} replace />;
};

// Suspense sits inside each layout (not around <Routes>) so the fixed
// Navbar/Footer stay mounted across a lazy chunk load — only the content
// area shows the loading state, instead of the whole page unmounting and
// reflowing once the chunk resolves.
const PortfolioLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ld-canvas">
      <PortfolioNavbar />
      <main className="flex-grow pt-[70px]">
        <Suspense fallback={<LoadingState className="min-h-[60vh]" />}>
          {children}
        </Suspense>
      </main>
      <PortfolioFooter />
    </div>
  );
};

const LightdashLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ld-canvas">
      <LightdashNavbar />
      <main className="flex-grow">
        <Suspense fallback={<LoadingState className="min-h-[60vh] pt-16" />}>
          {children}
        </Suspense>
      </main>
      <LightdashFooter />
    </div>
  );
};

// /qa-library/:slug opened as a course lesson (?course=slug) is a focused
// reading view in the QA Course shell (dark "Labs"-style header like QA
// Simulator, no site footer); a plain library article keeps the site layout.
const QaLibraryArticleLayout: React.FC<LayoutProps> = ({ children }) => {
  const { search } = useLocation();
  const inCourse = new URLSearchParams(search).has('course');
  return inCourse ? <CourseLayout>{children}</CourseLayout> : <LightdashLayout>{children}</LightdashLayout>;
};

// Dedicated mentee-facing layout: same navbar, but a lighter, general
// footer (no booking-flow links) since this page stands on its own outside
// the mentoring booking funnel.
const PublicPortfolioLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ld-canvas">
      <PublicPortfolioNavbar />
      <PublicPortfolioScrollBanner />
      <main className="flex-grow">
        <Suspense fallback={<LoadingState className="min-h-[60vh] pt-16" />}>
          {children}
        </Suspense>
      </main>
      <PublicPortfolioFooter />
    </div>
  );
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <OnboardingGate />
      <OnboardingClaimSync />
      <Routes>
        <Route
          path="/"
          element={
            <LightdashLayout>
              <Seo
                {...pageSeo('/')}
                jsonLd={[homeJsonLd, homeFaqJsonLd]}
              />
              <HomePage />
            </LightdashLayout>
          }
        />
        <Route
          path="/career-path"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <Seo {...pageSeo('/career-path')} />
              <CareerPathPage />
              <Snackbar />
            </Suspense>
          }
        />
        <Route
          path="/mentoring"
          element={
            <LightdashLayout>
              <Seo
                {...pageSeo('/mentoring')}
                jsonLd={mentoringServiceJsonLd}
              />
              <MentoringPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/personal-portfolio"
          element={
            <PortfolioLayout>
              <Seo
                {...pageSeo('/personal-portfolio')}
                jsonLd={personJsonLd}
              />
              <PortfolioHome />
            </PortfolioLayout>
          }
        />
        <Route
          path="/personal-portfolio/about"
          element={
            <PortfolioLayout>
              <Seo
                {...pageSeo('/personal-portfolio/about')}
                jsonLd={personJsonLd}
              />
              <PortfolioAbout />
            </PortfolioLayout>
          }
        />
        <Route
          path="/personal-portfolio/projects"
          element={
            <PortfolioLayout>
              <Seo
                {...pageSeo('/personal-portfolio/projects')}
              />
              <PortfolioProjects />
            </PortfolioLayout>
          }
        />
        <Route
          path="/personal-portfolio/certifications"
          element={
            <PortfolioLayout>
              <Seo
                {...pageSeo('/personal-portfolio/certifications')}
              />
              <PortfolioCertifications />
            </PortfolioLayout>
          }
        />
        <Route
          path="/mentoring/booking"
          element={
            <LightdashLayout>
              <Seo
                {...pageSeo('/mentoring/booking')}
                jsonLd={mentoringServiceJsonLd}
              />
              <PortfolioBookingPage />
            </LightdashLayout>
          }
        />
        {/* Ad landing page: own minimal header/footer, no site nav */}
        <Route
          path="/programs"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <ProgramsPage />
            </Suspense>
          }
        />
        <Route
          path="/mentor/:slug"
          element={
            <LightdashLayout>
              <MentorDetailPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/qa-library"
          element={
            <LightdashLayout>
              <Seo
                {...pageSeo('/qa-library')}
              />
              <QaLibraryIndexPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/qa-library/:slug"
          element={
            <QaLibraryArticleLayout>
              <QaLibraryArticleDetailPage />
            </QaLibraryArticleLayout>
          }
        />
        <Route
          path="/courses"
          element={
            <LightdashLayout>
              {/* Seo + JSON-LD (ItemList, FAQPage) rendered inside the page */}
              <CoursesIndexPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/courses/:slug"
          element={
            <LightdashLayout>
              <CourseDetailPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/courses/:slug/selesai"
          element={
            <CourseLayout>
              <CourseCompletePage />
            </CourseLayout>
          }
        />
        <Route
          path="/qa-simulator"
          element={
            <LightdashLayout>
              {/* Seo + JSON-LD (Course, FAQPage) rendered inside the page */}
              <QaSimulatorIndexPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/qa-simulator/sandbox/splitbill"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <SplitBillSandboxPage />
            </Suspense>
          }
        />
        <Route
          path="/qa-simulator/sandbox/dompetku-api"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <DompetKuApiSandboxPage />
            </Suspense>
          }
        />
        <Route
          path="/qa-simulator/sandbox/dompetku"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <DompetKuAppSandboxPage />
            </Suspense>
          }
        />
        <Route
          path="/qa-simulator/sandbox/tokokita"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <TokoKitaAppSandboxPage />
            </Suspense>
          }
        />
        <Route
          path="/qa-simulator/sandbox/tokokita-design"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <TokoKitaDesignPage />
            </Suspense>
          }
        />
        <Route
          path="/qa-simulator/:projectId/portfolio"
          element={
            <SimulatorLayout>
              <QaSimulatorPortfolioPage />
            </SimulatorLayout>
          }
        />
        <Route
          path="/qa-simulator/:projectId/portfolio/:shareId"
          element={
            <SimulatorLayout>
              <QaSimulatorSharedPortfolioPage />
            </SimulatorLayout>
          }
        />
        <Route
          path="/qa-simulator/:projectId"
          element={
            <SimulatorLayout>
              <QaSimulatorProjectPage />
            </SimulatorLayout>
          }
        />
        <Route
          path="/portfolio"
          element={
            <LightdashLayout>
              <Seo
                {...pageSeo('/portfolio')}
                jsonLd={portfolioPlatformJsonLd}
              />
              <PortfolioLandingPage />
            </LightdashLayout>
          }
        />
        <Route
          path="/portfolio/:slug"
          element={
            <PublicPortfolioLayout>
              <PublicPortfolioPage />
            </PublicPortfolioLayout>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <Seo
                path="/login"
                title="Login | Mentor.QA"
                description="Login ke dashboard admin Mentor.QA."
                noindex
              />
              <LoginScreen />
              <Snackbar />
            </Suspense>
          }
        />
        <Route
          path="/onboarding"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <Seo
                path="/onboarding"
                title="Temukan Program yang Cocok | Mentor.QA"
                description="Jawab 4 pertanyaan singkat dan dapatkan rekomendasi program QA yang paling cocok untukmu."
                noindex
              />
              <OnboardingPage />
              <Snackbar />
            </Suspense>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              {/* Seo lives in AdminPage: title depends on the user's role. */}
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="/mentoring/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/portfolio/mentoring/booking" element={<Navigate to="/mentoring/booking" replace />} />
        <Route path="/portfolio/about" element={<Navigate to="/personal-portfolio/about" replace />} />
        <Route path="/portfolio/projects" element={<Navigate to="/personal-portfolio/projects" replace />} />
        <Route path="/portfolio/certifications" element={<Navigate to="/personal-portfolio/certifications" replace />} />
        <Route path="/:slug/portfolio" element={<LegacySlugPortfolioRedirect />} />
        <Route
          path="*"
          element={
            <LightdashLayout>
              <Seo
                path="/404"
                title="Halaman Tidak Ditemukan | Mentor.QA"
                description="Halaman yang kamu cari tidak ditemukan. Kembali ke halaman utama Mentor.QA, platform mentoring dan portfolio QA Engineer."
              />
              <NotFound />
            </LightdashLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
