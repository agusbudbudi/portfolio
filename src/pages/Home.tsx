import React from 'react';
import Hero from '../components/Home/Hero';
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
      <FeaturedProjects />
      <WorkExperienceTimeline />
      <SkillsTools />
      <FeaturedEndorsements />
      <ContactSection />
      <CtaSection />
    </div>
  );
};

export default Home;
