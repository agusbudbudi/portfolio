import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight, FlaskConical, BarChart3, Receipt, Briefcase, Camera, ExternalLink, X } from 'lucide-react';

interface Tool {
  name: string;
  src: string;
}

interface Project {
  title: string;
  description: string;
  'detail-project'?: string;
  type: string;
  image: string;
  icon: string;
  link: string;
  tools: Tool[];
}

interface ProjectCardProps {
  project: Project;
  buttonText?: string;
}

const ProjectIcon: React.FC<{ icon: string; size: number }> = ({ icon, size }) => (
  <>
    {icon === 'uil-flask' && <FlaskConical size={size} />}
    {icon === 'uil-graph-bar' && <BarChart3 size={size} />}
    {icon === 'uil-bill' && <Receipt size={size} />}
    {icon === 'uil-briefcase-alt' && <Briefcase size={size} />}
    {icon === 'uil-camera-rps' && <Camera size={size} />}
  </>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ project, buttonText = 'See Project' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div
        className="bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden transition-shadow flex flex-col cursor-pointer hover:shadow-ld-subtle-3"
        onClick={openModal}
      >
        <div className="relative w-full overflow-hidden group">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block bg-ld-frost border-b border-ld-ash transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-ld-violet/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-ld-canvas text-ld-violet px-4 py-2 rounded-full font-medium text-xs shadow-ld-subtle-2">
              View Details
            </span>
          </div>
        </div>
        <div className="p-4 pb-2 flex gap-4 items-start flex-grow">
          <div className="w-[44px] h-[44px] min-w-[44px] bg-ld-violet text-white rounded-lg flex items-center justify-center">
            <ProjectIcon icon={project.icon} size={22} />
          </div>
          <div className="flex-grow">
            <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2 flex items-center gap-2.5">
              {project.title}
              <span className="bg-ld-lilac text-ld-violet text-[10px] px-2 py-0.5 rounded font-medium uppercase tracking-wider">
                {project.type}
              </span>
            </h4>
            <p className="text-ld-slate text-xs leading-relaxed mb-4">{project.description}</p>
          </div>
        </div>
        <div className="px-4 py-3 flex justify-between items-center border-t border-ld-ash bg-ld-cloud/50">
          <div className="flex gap-2.5 flex-wrap">
            {project.tools.map((tool, i) => (
              <img key={i} src={tool.src} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="h-5 object-contain" />
            ))}
          </div>
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-ld-canvas text-ld-violet border border-ld-ash rounded-lg font-medium text-xs no-underline transition-colors hover:bg-ld-violet hover:text-white hover:border-ld-violet whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            {buttonText} <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      {isModalOpen && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-ld-onyx/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-0"
          onClick={closeModal}
        >
          <div
            className="bg-ld-canvas md:rounded-xl w-full max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto relative shadow-ld-lg font-ld-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6 flex items-center justify-between sticky top-0 bg-ld-canvas z-10 border-b border-ld-ash">
              <h3 className="text-xl md:text-2xl font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">Project Details</h3>
              <button
                className="bg-transparent border-none text-ld-slate hover:text-ld-graphite cursor-pointer p-1 rounded-full flex items-center justify-center transition-colors hover:bg-ld-cloud"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div>
              <div className="w-full max-h-[300px] sm:max-h-[400px] overflow-hidden bg-ld-frost flex items-center justify-center border-b border-ld-ash">
                <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="max-w-full max-h-[300px] sm:max-h-[400px] object-contain block" />
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="inline-block px-3 py-1 bg-ld-lilac text-ld-violet rounded-full text-xs font-medium uppercase tracking-wider w-fit">
                      {project.type} Project
                    </span>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-ld-display font-semibold text-ld-graphite tracking-[-0.02em] m-0">{project.title}</h2>
                  </div>
                  <div className="w-14 h-14 bg-ld-violet text-white rounded-xl flex items-center justify-center">
                    <ProjectIcon icon={project.icon} size={30} />
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-ld-graphite mb-3 relative pb-1.5 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-ld-violet">Summary</h4>
                  <p className="text-ld-slate text-sm leading-relaxed">{project.description}</p>
                </div>

                {project['detail-project'] && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-ld-graphite mb-3 relative pb-1.5 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-ld-violet">Case Study & Details</h4>
                    <div className="text-ld-slate text-sm leading-relaxed markdown-body prose max-w-none">
                      <ReactMarkdown>{project['detail-project']}</ReactMarkdown>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h4 className="text-sm font-medium text-ld-graphite mb-4 relative pb-1.5 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-ld-violet">Technologies Used</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                    {project.tools.map((tool, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-ld-cloud border border-ld-ash rounded-lg hover:border-ld-violet transition-colors">
                        <img src={tool.src} alt={tool.name} loading="lazy" decoding="async" className="w-6 h-6 object-contain" />
                        <span className="text-xs font-medium text-ld-graphite">{tool.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-ld-violet text-white rounded-lg text-base font-medium no-underline transition-colors hover:bg-[#1f87e6]"
                  >
                    Visit Live Project <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProjectCard;
