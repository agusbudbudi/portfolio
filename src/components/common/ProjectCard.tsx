import React from 'react';
import { ArrowUpRight, FlaskConical, BarChart3, Receipt, Briefcase } from 'lucide-react';
import './ProjectCard.css';

interface Tool {
  name: string;
  src: string;
}

interface Project {
  title: string;
  description: string;
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
  buttonText = 'View',
  buttonClass = 'btn-small'
}) => {
  const displayTools = maxTools ? project.tools.slice(0, maxTools) : project.tools;
  const remainingTools = maxTools ? project.tools.length - maxTools : 0;

  return (
    <div className="project-card">
      <img src={project.image} alt={project.title} className="project-img" />
      <div className="project-header">
        <div className="project-icon-wrapper">
          {project.icon === 'uil-flask' && <FlaskConical size={24} />}
          {project.icon === 'uil-graph-bar' && <BarChart3 size={24} />}
          {project.icon === 'uil-bill' && <Receipt size={24} />}
          {project.icon === 'uil-briefcase-alt' && <Briefcase size={24} />}
        </div>
        <div className="project-title-wrapper">
          <h4>
            {project.title}
            <span className="skill-chip">{project.type}</span>
          </h4>
          <p>{project.description}</p>
        </div>
      </div>
      <div className="project-footer">
        <div className="tools-list">
          {displayTools.map((tool, i) => (
            <img key={i} src={tool.src} alt={tool.name} title={tool.name} className="tool-logo" />
          ))}
          {remainingTools > 0 && <span className="more-tools">+{remainingTools}</span>}
        </div>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className={buttonClass}>
          {buttonText} <ArrowUpRight size={16} />
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
