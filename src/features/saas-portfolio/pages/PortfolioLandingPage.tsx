import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ForWhoSection from '../components/landing/ForWhoSection';
import NoExperienceSection from '../components/landing/NoExperienceSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import MentoringTeaserSection from '../components/landing/MentoringTeaserSection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTASection from '../components/landing/FinalCTASection';

const PortfolioLandingPage: React.FC = () => {
  return (
    <div className="w-full bg-ld-canvas">
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <ForWhoSection />
      <NoExperienceSection />
      <HowItWorksSection />
      <MentoringTeaserSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
};

export default PortfolioLandingPage;
