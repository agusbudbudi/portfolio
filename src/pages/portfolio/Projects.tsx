import React from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Layers, Rocket } from 'lucide-react';
import projectsData from '../../data/projects.json';
import deliverablesData from '../../data/deliverables.json';
import ProjectCard from './components/ProjectCard';

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
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-16 font-ld-sans bg-ld-canvas">
      {/* Deliverables Section */}
      <section id="deliverables" className="mb-14">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-indigo-500/10 text-indigo-500">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Test <span className="text-ld-violet">Deliverables</span>
            </h2>
            <p className="text-sm text-ld-slate">Showcasing QA deliverables and outcomes from my latest work.</p>
          </div>
        </div>

        <div className="relative px-0 md:px-10 md:mx-0 -mx-6 mt-8">
          <button
            className="absolute top-1/2 -translate-y-1/2 left-0 w-10 h-10 rounded-full border border-ld-ash bg-ld-canvas text-ld-graphite flex items-center justify-center cursor-pointer transition-colors hover:bg-ld-violet hover:text-white hover:border-ld-violet shadow-ld-subtle-2 z-10 hidden md:flex"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-none py-4 px-6 md:px-2" ref={sliderRef}>
            {deliverablesData.map((item, index) => (
              <div key={index} className="w-[320px] md:w-[400px] flex-shrink-0 flex flex-col rounded-xl overflow-hidden group">
                <div className="w-full overflow-hidden">
                  <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-full h-auto object-cover" />
                </div>
                <div className="p-5 flex justify-between items-start gap-4 flex-grow bg-ld-canvas border border-ld-ash rounded-b-xl border-t-0">
                  <div className="flex-grow">
                    <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2 leading-snug">{item.title}</h4>
                    <p className="text-ld-slate text-xs leading-relaxed">{item.description}</p>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 bg-ld-cloud text-ld-violet border border-ld-ash rounded-lg font-medium text-xs cursor-pointer transition-colors hover:bg-ld-violet hover:text-white hover:border-ld-violet whitespace-nowrap">
                    See <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="absolute top-1/2 -translate-y-1/2 right-0 w-10 h-10 rounded-full border border-ld-ash bg-ld-canvas text-ld-graphite flex items-center justify-center cursor-pointer transition-colors hover:bg-ld-violet hover:text-white hover:border-ld-violet shadow-ld-subtle-2 z-10 hidden md:flex"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-amber-500/10 text-amber-500">
            <Rocket size={20} />
          </div>
          <div>
            <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">
              Project <span className="text-ld-violet">Showcase</span>
            </h2>
            <p className="text-sm text-ld-slate">Highlighted projects, from career milestones to personal growth.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
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
