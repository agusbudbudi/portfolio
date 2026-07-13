import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ForWhoSection from '../components/landing/ForWhoSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTASection from '../components/landing/FinalCTASection';

const PortfolioLandingPage: React.FC = () => {
  return (
    <div className="w-full bg-ld-canvas">
      <HeroSection />
      <FeaturesSection />
      <ForWhoSection />
      <HowItWorksSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
};

export default PortfolioLandingPage;
