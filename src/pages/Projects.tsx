import React from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers, Rocket } from 'lucide-react';
import projectsData from '../data/projects.json';
import deliverablesData from '../data/deliverables.json';
import SectionHeader from '../components/common/SectionHeader';
import ProjectCard from '../components/common/ProjectCard';
import './Projects.css';

const Projects: React.FC = () => {
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="projects-page container">
      {/* Deliverables Section */}
      <section id="deliverables" className="section-new fade-in visible">
        <SectionHeader 
          icon={<Layers size={20} />}
          iconClassName="deliverables-icon"
          title="Test"
          titleSpan="Deliverables"
          subtitle="Showcasing QA deliverables and outcomes from my latest work."
        />
        
        <div className="deliverables-slider-container">
          <button className="slider-nav-btn prev" onClick={() => scroll('left')}>
            <ChevronLeft size={24} />
          </button>
          
          <div className="deliverables-slider" ref={sliderRef}>
            {deliverablesData.map((item, index) => (
              <div key={index} className="deliverable-card">
                <div className="deliverable-banner">
                  <img src={item.image} alt={item.title} className="deliverable-img" />
                </div>
                <div className="deliverable-info">
                  <div className="deliverable-text">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                  <button className="see-btn">
                    See <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-nav-btn next" onClick={() => scroll('right')}>
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section-new fade-in visible">
        <SectionHeader 
          icon={<Rocket size={20} />}
          iconClassName="project-icon"
          title="Project"
          titleSpan="Showcase"
          subtitle="Highlighted projects, from career milestones to personal growth."
        />
        <div className="projects-grid">
          {projectsData.map((project, index) => (
            <ProjectCard 
              key={index} 
              project={project} 
              buttonText="See Project"
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Projects;
