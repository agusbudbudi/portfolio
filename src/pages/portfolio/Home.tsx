import React from 'react';
import Hero from '../../components/portfolio/Home/Hero';
import AutomationPlayground from '../../components/portfolio/Home/AutomationPlayground';
import MetricsSection from '../../components/portfolio/Home/MetricsSection';
import StlcPipeline from '../../components/portfolio/Home/StlcPipeline';
import CompatibilityMatrix from '../../components/portfolio/Home/CompatibilityMatrix';
import FeaturedProjects from '../../components/portfolio/Home/FeaturedProjects';
import WorkExperienceTimeline from '../../components/portfolio/Home/WorkExperienceTimeline';
import SkillsTools from '../../components/portfolio/Home/SkillsTools';
import FeaturedEndorsements from '../../components/portfolio/Home/FeaturedEndorsements';
import KnowledgeHub from '../../components/portfolio/Home/KnowledgeHub';
import ContactSection from '../../components/portfolio/Home/ContactSection';
import CtaSection from '../../components/portfolio/Home/CtaSection';

const Home: React.FC = () => {
  return (
    <div className="w-full bg-ld-canvas font-ld-sans">
      <Hero />
      <AutomationPlayground />
      <MetricsSection />
      <StlcPipeline />
      <CompatibilityMatrix />
      <FeaturedProjects />
      <WorkExperienceTimeline />
      <SkillsTools />
      <FeaturedEndorsements />
      <KnowledgeHub />
      <ContactSection />
      <CtaSection />
    </div>
  );
};

export default Home;
