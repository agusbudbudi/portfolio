import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import PortfolioNavbar from './components/portfolio/Layout/Navbar';
import PortfolioFooter from './components/portfolio/Layout/Footer';
import LightdashNavbar from './components/portfolio/Layout/LightdashNavbar';
import LightdashFooter from './components/portfolio/Layout/LightdashFooter';
import Seo from './components/portfolio/common/Seo';

const MentoringPage = lazy(() => import('./pages/portfolio/Mentoring/MentoringPage'));
const PortfolioHome = lazy(() => import('./pages/portfolio/Home'));
const PortfolioAbout = lazy(() => import('./pages/portfolio/About'));
const PortfolioProjects = lazy(() => import('./pages/portfolio/Projects'));
const PortfolioCertifications = lazy(() => import('./pages/portfolio/Certifications'));
const PortfolioBookingPage = lazy(() => import('./pages/portfolio/Mentoring/BookingPage'));
const NotFound = lazy(() => import('./pages/portfolio/NotFound'));

const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24" role="status">
    <div
      className="w-10 h-10 rounded-full border-[3px] border-ld-ash border-t-ld-violet animate-spin"
      aria-hidden="true"
    />
  </div>
);

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
  url: 'https://portfolio-qa-agus.vercel.app/portfolio',
  image: 'https://portfolio-qa-agus.vercel.app/img/profile/profile-agus.webp',
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

interface LayoutProps {
  children: React.ReactNode;
}

const PortfolioLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-ld-canvas">
      <PortfolioNavbar />
      <main className="flex-grow pt-[70px]">
        {children}
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
        {children}
      </main>
      <LightdashFooter />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
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
          path="/portfolio"
          element={
            <PortfolioLayout>
              <Seo
                path="/portfolio"
                title="Portfolio QA Engineer - Agus Budiman | Automation & Manual Testing"
                description="Portfolio QA Engineer Agus Budiman: 6+ tahun pengalaman automation testing, manual testing, dan API testing. Lihat proyek, skill, dan pengalaman kerja QA Engineer."
                jsonLd={personJsonLd}
              />
              <PortfolioHome />
            </PortfolioLayout>
          }
        />
        <Route
          path="/portfolio/about"
          element={
            <PortfolioLayout>
              <Seo
                path="/portfolio/about"
                title="Tentang Agus Budiman | Portfolio QA Engineer"
                description="Kenali perjalanan karier, pengalaman kerja, dan latar belakang pendidikan Agus Budiman sebagai QA Engineer dengan 6+ tahun pengalaman testing."
                jsonLd={personJsonLd}
              />
              <PortfolioAbout />
            </PortfolioLayout>
          }
        />
        <Route
          path="/portfolio/projects"
          element={
            <PortfolioLayout>
              <Seo
                path="/portfolio/projects"
                title="Proyek QA Engineer | Portfolio Agus Budiman"
                description="Kumpulan proyek automation testing, manual testing, dan tooling QA yang dikerjakan Agus Budiman, QA Engineer berpengalaman 6+ tahun."
              />
              <PortfolioProjects />
            </PortfolioLayout>
          }
        />
        <Route
          path="/portfolio/certifications"
          element={
            <PortfolioLayout>
              <Seo
                path="/portfolio/certifications"
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
        <Route path="/mentoring" element={<Navigate to="/" replace />} />
        <Route path="/portfolio/mentoring/booking" element={<Navigate to="/mentoring/booking" replace />} />
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
      </Suspense>
    </Router>
  );
}

export default App;
