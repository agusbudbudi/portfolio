import React from 'react';
import HeroSection from './components/landing/HeroSection';
import StatsStrip from './components/landing/StatsStrip';
import BenefitsSection from './components/landing/BenefitsSection';
import TopicsSection from './components/landing/TopicsSection';
import HowItWorksSection from './components/landing/HowItWorksSection';
import MentorProfileSection from './components/landing/MentorProfileSection';
import FAQSection from './components/landing/FAQSection';
import FinalCTASection from './components/landing/FinalCTASection';

const MentoringPage: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-950 transition-colors">
      <HeroSection />
      <StatsStrip />
      <BenefitsSection />
      <TopicsSection />
      <HowItWorksSection />
      <MentorProfileSection />
      <FAQSection />
      <FinalCTASection />
    </div>
  );
};

export default MentoringPage;
