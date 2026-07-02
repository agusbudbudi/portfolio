import React from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers, Rocket } from 'lucide-react';
import projectsData from '../../data/projects.json';
import deliverablesData from '../../data/deliverables.json';
import SectionHeader from '../../components/portfolio/common/SectionHeader';
import ProjectCard from '../../components/portfolio/common/ProjectCard';

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
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-8 bg-white dark:bg-slate-950 transition-colors">
      {/* Deliverables Section */}
      <section id="deliverables" className="mb-16 animate-fade-in">
        <SectionHeader
          icon={<Layers size={20} />}
          iconClassName="deliverables-icon"
          title="Test"
          titleSpan="Deliverables"
          subtitle="Showcasing QA deliverables and outcomes from my latest work."
        />

        <div className="relative px-0 md:px-10 md:mx-0 -mx-6 mt-8">
          <button
            className="absolute top-1/2 -translate-y-1/2 left-0 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-555 hover:border-transparent shadow-md z-10 hidden md:flex"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none py-4 px-6 md:px-2" ref={sliderRef}>
            {deliverablesData.map((item, index) => (
              <div key={index} className="w-[320px] md:w-[400px] flex-shrink-0 flex flex-col rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-full overflow-hidden">
                  <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
                </div>
                <div className="p-6 flex justify-between items-start gap-4 flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-b-2xl border-t-0">
                  <div className="flex-grow">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{item.description}</p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-blue-500 dark:text-blue-400 border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-xs cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white hover:border-transparent whitespace-nowrap">
                    See <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-555 hover:border-transparent shadow-md z-10 hidden md:flex"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="mb-16 animate-fade-in">
        <SectionHeader
          icon={<Rocket size={20} />}
          iconClassName="project-icon"
          title="Project"
          titleSpan="Showcase"
          subtitle="Highlighted projects, from career milestones to personal growth."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
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
