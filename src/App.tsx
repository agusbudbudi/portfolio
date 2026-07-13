import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';

import PortfolioNavbar from './features/personal-portfolio/components/Navbar';
import PortfolioFooter from './features/personal-portfolio/components/Footer';
import LightdashNavbar from './features/admin/components/shared/LightdashNavbar';
import LightdashFooter from './features/admin/components/shared/LightdashFooter';
import PublicPortfolioNavbar from './features/saas-portfolio/components/PublicPortfolioNavbar';
import PublicPortfolioScrollBanner from './features/saas-portfolio/components/PublicPortfolioScrollBanner';
import PublicPortfolioFooter from './features/saas-portfolio/components/PublicPortfolioFooter';
import Seo from './components/common/Seo';
import LoadingState from './components/common/LoadingState';

const MentoringPage = lazy(() => import('./features/mentoring/pages/MentoringPage'));
const PortfolioHome = lazy(() => import('./features/personal-portfolio/pages/Home'));
const PortfolioAbout = lazy(() => import('./features/personal-portfolio/pages/About'));
const PortfolioProjects = lazy(() => import('./features/personal-portfolio/pages/Projects'));
const PortfolioCertifications = lazy(() => import('./features/personal-portfolio/pages/Certifications'));
const PortfolioBookingPage = lazy(() => import('./features/mentoring/pages/BookingPage'));
const MentorDetailPage = lazy(() => import('./features/mentoring/pages/MentorDetailPage'));
const PortfolioLandingPage = lazy(() => import('./features/saas-portfolio/pages/PortfolioLandingPage'));
const PublicPortfolioPage = lazy(() => import('./features/saas-portfolio/pages/PublicPortfolioPage'));
const AdminPage = lazy(() => import('./features/admin/pages/AdminPage'));
const LoginScreen = lazy(() => import('./features/admin/components/shared/LoginScreen'));
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
  url: 'https://portfolio-qa-agus.vercel.app/personal-portfolio',
  image: 'https://portfolio-qa-agus.vercel.app/personal-portfolio/img/profile/profile-agus.webp',
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
    '@type': 'Person',
    name: 'Agus Budiman',
    sameAs: SAME_AS,
  },
  areaServed: 'ID',
  url: 'https://portfolio-qa-agus.vercel.app/',
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
  url: 'https://portfolio-qa-agus.vercel.app/portfolio',
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
      <Routes>
        <Route
          path="/"
          element={
            <LightdashLayout>
              <Seo
                path="/"
                title="Mentoring QA & Kursus QA Online 1-on-1 | Agus Budiman"
                description="Mentoring QA Engineer 1-on-1 bareng praktisi 6+ tahun pengalaman. Kursus QA online: manual testing, automation testing Cypress, API testing. Booking sesi mentor QA sekarang."
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
                path="/personal-portfolio"
                title="Portfolio QA Engineer - Agus Budiman | Automation & Manual Testing"
                description="Portfolio QA Engineer Agus Budiman: 6+ tahun pengalaman automation testing, manual testing, dan API testing. Lihat proyek, skill, dan pengalaman kerja QA Engineer."
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
                path="/personal-portfolio/about"
                title="Tentang Agus Budiman | Portfolio QA Engineer"
                description="Kenali perjalanan karier, pengalaman kerja, dan latar belakang pendidikan Agus Budiman sebagai QA Engineer dengan 6+ tahun pengalaman testing."
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
                path="/personal-portfolio/projects"
                title="Proyek QA Engineer | Portfolio Agus Budiman"
                description="Kumpulan proyek automation testing, manual testing, dan tooling QA yang dikerjakan Agus Budiman, QA Engineer berpengalaman 6+ tahun."
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
                path="/personal-portfolio/certifications"
                title="Sertifikasi QA Engineer | Agus Budiman"
                description="Daftar sertifikasi profesional Agus Budiman di bidang Quality Assurance, software testing, dan automation testing."
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
                path="/mentoring/booking"
                title="Booking Mentoring QA - Pilih Mentor & Jadwal | Agus Budiman"
                description="Booking sesi mentoring QA 1-on-1. Pilih topik, mentor QA berpengalaman, dan jadwal yang sesuai untuk kelas atau kursus QA kamu."
                jsonLd={mentoringServiceJsonLd}
              />
              <PortfolioBookingPage />
            </LightdashLayout>
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
          path="/portfolio"
          element={
            <LightdashLayout>
              <Seo
                path="/portfolio"
                title="Buat Portfolio QA Engineer Gratis | Mentor.QA"
                description="Buat portfolio QA Engineer gratis di Mentor.QA: showcase proyek, sertifikasi, dan pengalaman kerja dengan link portfolio sendiri. Untuk fresh graduate hingga QA berpengalaman."
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
          path="/dashboard/*"
          element={
            <Suspense fallback={<LoadingState className="min-h-screen" />}>
              <Seo
                path="/dashboard"
                title="Admin Dashboard | Mentor.QA"
                description="Dashboard admin mentoring QA."
                noindex
              />
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="/mentoring/admin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/mentoring" element={<Navigate to="/" replace />} />
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
                title="Halaman Tidak Ditemukan | Agus Budiman"
                description="Halaman yang kamu cari tidak ditemukan. Kembali ke halaman utama Agus Budiman, QA Engineer."
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
