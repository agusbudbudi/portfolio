import React from 'react';
import projectsData from '../../../data/projects.json';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Rocket } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';
import ProjectCard from '../common/ProjectCard';

const FeaturedProjects: React.FC = () => {
  // Take first 4 projects for featured section
  const featuredProjects = projectsData.slice(0, 4);

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-blue-500/5 dark:to-blue-500/0 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <SectionHeader
            icon={<Rocket size={20} />}
            iconClassName="project-icon"
            title="Featured"
            titleSpan="Projects"
            subtitle="A glimpse of my latest work and contributions."
          />
          <NavLink
            to="/portfolio/projects"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-transparent text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl font-semibold text-sm transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start whitespace-nowrap decoration-none"
          >
            Lihat Semua <ArrowUpRight size={18} />
          </NavLink>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              maxTools={3}
              buttonText="See Project"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
