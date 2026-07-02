import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight, FlaskConical, BarChart3, Receipt, Briefcase, Camera, ExternalLink } from 'lucide-react';
import Modal from './Modal';

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
  maxTools?: number;
  buttonText?: string;
  buttonClass?: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  maxTools, 
  buttonText = 'See Project',
  buttonClass = 'see-btn'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const displayTools = maxTools ? project.tools.slice(0, maxTools) : project.tools;
  const remainingTools = maxTools ? project.tools.length - maxTools : 0;

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Determine button style class
  const isCustomSeeBtn = buttonClass === 'see-btn';
  const resolvedBtnClass = isCustomSeeBtn
    ? 'inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 text-blue-500 dark:text-blue-400 border border-slate-200 dark:border-slate-700/80 rounded-xl font-semibold text-xs cursor-pointer transition-all duration-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white hover:border-transparent whitespace-nowrap decoration-none'
    : 'inline-flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 text-blue-500 dark:text-blue-400 rounded-2xl font-semibold text-sm transition-all duration-200 hover:bg-blue-500/10 decoration-none';

  return (
    <>
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-[20px] overflow-hidden transition-all duration-300 ease-out flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/40"
        onClick={openModal}
      >
        <div className="relative w-full overflow-hidden group">
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-auto block bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/80 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white dark:bg-slate-900 text-blue-500 dark:text-blue-400 px-4 py-2 rounded-full font-bold text-xs shadow-md">
              View Details
            </span>
          </div>
        </div>
        <div className="p-6 pb-2 flex gap-4 items-start flex-grow">
          <div className="w-[50px] h-[50px] min-w-[50px] bg-blue-500 text-white rounded-xl flex items-center justify-center text-xl shadow-md shadow-blue-500/15">
            {project.icon === 'uil-flask' && <FlaskConical size={24} />}
            {project.icon === 'uil-graph-bar' && <BarChart3 size={24} />}
            {project.icon === 'uil-bill' && <Receipt size={24} />}
            {project.icon === 'uil-briefcase-alt' && <Briefcase size={24} />}
            {project.icon === 'uil-camera-rps' && <Camera size={24} />}
          </div>
          <div className="flex-grow">
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2.5">
              {project.title}
              <span className="bg-blue-500/10 text-blue-500 dark:bg-blue-500/25 dark:text-blue-400 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                {project.type}
              </span>
            </h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">{project.description}</p>
          </div>
        </div>
        <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex gap-2.5 flex-wrap">
            {displayTools.map((tool, i) => (
              <img key={i} src={tool.src} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="h-5 object-contain" />
            ))}
            {remainingTools > 0 && <span className="text-xs text-slate-555 dark:text-slate-500 font-medium">+{remainingTools}</span>}
          </div>
          <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={resolvedBtnClass} 
            onClick={(e) => e.stopPropagation()}
          >
            {buttonText} <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Project Details">
        <div className="flex flex-col">
          <div className="w-full max-h-[300px] sm:max-h-[400px] overflow-hidden bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center border-b border-slate-100 dark:border-slate-800/40">
            <img src={project.image} alt={project.title} loading="lazy" decoding="async" className="max-w-full max-h-[300px] sm:max-h-[400px] object-contain block" />
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start mb-6 gap-4">
              <div className="flex flex-col gap-2">
                <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-500 dark:bg-blue-500/25 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                  {project.type} Project
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white m-0">{project.title}</h2>
              </div>
              <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                {project.icon === 'uil-flask' && <FlaskConical size={32} />}
                {project.icon === 'uil-graph-bar' && <BarChart3 size={32} />}
                {project.icon === 'uil-bill' && <Receipt size={32} />}
                {project.icon === 'uil-briefcase-alt' && <Briefcase size={32} />}
                {project.icon === 'uil-camera-rps' && <Camera size={32} />}
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 relative pb-1.5 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-blue-500">Summary</h4>
              <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed">{project.description}</p>
            </div>

            {project['detail-project'] && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 relative pb-1.5 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-blue-500">Case Study & Details</h4>
                <div className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed markdown-body prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{project['detail-project']}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 relative pb-1.5 after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-blue-500">Technologies Used</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {project.tools.map((tool, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:-translate-y-0.5 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200">
                    <img src={tool.src} alt={tool.name} loading="lazy" decoding="async" className="w-6 h-6 object-contain" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-sky-400 text-white rounded-xl text-base font-semibold transition-all duration-300 shadow-md shadow-blue-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 hover:from-sky-400 hover:to-blue-500 decoration-none"
              >
                Visit Live Project <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProjectCard;
