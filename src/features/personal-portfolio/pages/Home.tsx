import Hero from '../components/Hero';
import AutomationPlayground from '../components/AutomationPlayground';
import MetricsSection from '../components/MetricsSection';
import StlcPipeline from '../components/StlcPipeline';
import CompatibilityMatrix from '../components/CompatibilityMatrix';
import FeaturedProjects from '../components/FeaturedProjects';
import WorkExperienceTimeline from '../components/WorkExperienceTimeline';
import SkillsTools from '../components/SkillsTools';
import FeaturedEndorsements from '../components/FeaturedEndorsements';
import KnowledgeHub from '../components/KnowledgeHub';
import ContactSection from '../components/ContactSection';
import CtaSection from '../components/CtaSection';

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
