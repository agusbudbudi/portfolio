import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LightdashNavbar from '../../admin/components/shared/LightdashNavbar';
import NewHomeHero from '../career-path/components/NewHomeHero';
import JourneySection from '../career-path/components/JourneySection';
import EcosystemSection from '../career-path/components/EcosystemSection';
import BenefitsSection from '../career-path/components/BenefitsSection';
import CareerPathQuiz from '../career-path/components/CareerPathQuiz';
import TestimonialsSection from '../career-path/components/TestimonialsSection';
import FinalCta from '../career-path/components/FinalCta';
import LightdashFooter from '../../admin/components/shared/LightdashFooter';

// Career-path landing ("/career-path"), for campaign/social traffic: helps
// visitors pick one of the five programs and captures leads. "/" stays the homepage.
// Uses the shared site header and footer; the hero clears the fixed header with
// the same top padding as the homepage hero.
// Testimonials render in production only once real, publishable ones exist
// (see data/testimonials.ts).
const CareerPathPage: React.FC = () => {
  const { hash } = useLocation();

  // App's ScrollToTop skips hashed URLs, so in-page anchors scroll here.
  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 100);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-ld-sans">
      <LightdashNavbar />
      <main id="main" className="flex-grow">
        <NewHomeHero />
        {/* primary content: the free career consultation quiz */}
        <CareerPathQuiz />
        <JourneySection />
        <EcosystemSection />
        <TestimonialsSection />
        <BenefitsSection />
        <FinalCta />
      </main>
      <LightdashFooter />
    </div>
  );
};

export default CareerPathPage;
