import React from 'react';
import projectsData from '../../../data/projects.json';
import { NavLink } from 'react-router-dom';
import { ArrowUpRight, Rocket } from 'lucide-react';
import ProjectCard from '../../../pages/portfolio/components/ProjectCard';

const FeaturedProjects: React.FC = () => {
  // Take first 4 projects for featured section
  const featuredProjects = projectsData.slice(0, 4);

  return (
    <section className="py-12 md:py-20 bg-ld-canvas overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-amber-500/10 text-amber-500">
              <Rocket size={20} />
            </div>
            <div>
              <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
                Featured <span className="text-ld-violet">Projects</span>
              </h2>
              <p className="text-sm text-ld-slate">A glimpse of my latest work and contributions.</p>
            </div>
          </div>
          <NavLink
            to="/portfolio/projects"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-ld-canvas text-ld-graphite border border-ld-ash hover:border-ld-violet rounded-lg font-medium text-sm transition-colors w-full sm:w-auto justify-center sm:justify-start whitespace-nowrap no-underline"
          >
            Lihat Semua <ArrowUpRight size={18} />
          </NavLink>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
              buttonText="See Project"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProjects;
