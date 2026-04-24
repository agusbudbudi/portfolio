import React from 'react';
import Hero from '../components/Home/Hero';
import AutomationPlayground from '../components/Home/AutomationPlayground';
import MetricsSection from '../components/Home/MetricsSection';
import StlcPipeline from '../components/Home/StlcPipeline';
import CompatibilityMatrix from '../components/Home/CompatibilityMatrix';

import KnowledgeHub from '../components/Home/KnowledgeHub';

import FeaturedProjects from '../components/Home/FeaturedProjects';
import WorkExperienceTimeline from '../components/Home/WorkExperienceTimeline';
import SkillsTools from '../components/Home/SkillsTools';
import FeaturedEndorsements from '../components/Home/FeaturedEndorsements';
import ContactSection from '../components/Home/ContactSection';
import CtaSection from '../components/Home/CtaSection';

const Home: React.FC = () => {
  return (
    <div className="home-page">
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
