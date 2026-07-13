import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import StatsStrip from '../components/landing/StatsStrip';
import WhyDifferentSection from '../components/landing/WhyDifferentSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import TopicsSection from '../components/landing/TopicsSection';
import ToolsSection from '../components/landing/ToolsSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import MentorProfileSection from '../components/landing/MentorProfileSection';
import PricingSection from '../components/landing/PricingSection';
import PromotionSection from '../components/landing/PromotionSection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTASection from '../components/landing/FinalCTASection';

const MentoringPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <div className="w-full bg-ld-canvas">
      <HeroSection />
      <StatsStrip />
      <WhyDifferentSection />
      <BenefitsSection />
      <TopicsSection />
      <ToolsSection />
      <HowItWorksSection />
      <MentorProfileSection />
      <PricingSection />
      <PromotionSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
};

export default MentoringPage;
