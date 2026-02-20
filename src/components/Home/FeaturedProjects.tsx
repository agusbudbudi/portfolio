import React from 'react';
import projectsData from '../../data/projects.json';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Rocket } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import ProjectCard from '../common/ProjectCard';
import './FeaturedProjects.css';

const FeaturedProjects: React.FC = () => {
  // Take first 4 projects for featured section
  const featuredProjects = projectsData.slice(0, 4);

  return (
    <section className="featured-projects section">
      <div className="container">
        <div className="section-header-row">
          <SectionHeader 
            icon={<Rocket size={20} />}
            iconClassName="project-icon"
            title="Featured"
            titleSpan="Projects"
            subtitle="A glimpse of my latest work and contributions."
          />
          <NavLink to="/projects" className="btn btn-outline view-all-btn">
            Lihat Semua <ArrowUpRight size={18} />
          </NavLink>
        </div>
        <div className="projects-grid">
          {featuredProjects.map((project, index) => (
            <ProjectCard 
              key={index} 
              project={project} 
              maxTools={3} 
              buttonText="See Project"
              buttonClass="btn-small"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
export default FeaturedProjects;
