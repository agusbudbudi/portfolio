import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight, FlaskConical, BarChart3, Receipt, Briefcase, Camera, ExternalLink } from 'lucide-react';
import Modal from './Modal';
import './ProjectCard.css';

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

  return (
    <>
      <div className="project-card" onClick={openModal}>
        <div className="project-img-wrapper">
          <img src={project.image} alt={project.title} className="project-img" />
          <div className="project-card-overlay">
            <span>View Details</span>
          </div>
        </div>
        <div className="project-header">
          <div className="project-icon-wrapper">
            {project.icon === 'uil-flask' && <FlaskConical size={24} />}
            {project.icon === 'uil-graph-bar' && <BarChart3 size={24} />}
            {project.icon === 'uil-bill' && <Receipt size={24} />}
            {project.icon === 'uil-briefcase-alt' && <Briefcase size={24} />}
            {project.icon === 'uil-camera-rps' && <Camera size={24} />}
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
          <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={buttonClass} 
            onClick={(e) => e.stopPropagation()}
          >
            {buttonText} <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Project Details">
        <div className="project-detail-popup">
          <div className="popup-image-container">
            <img src={project.image} alt={project.title} className="popup-project-image" />
          </div>
          <div className="popup-info">
            <div className="popup-header">
              <div className="popup-title-group">
                <span className="popup-type-badge">{project.type} Project</span>
                <h2>{project.title}</h2>
              </div>
              <div className="popup-icon-container">
                {project.icon === 'uil-flask' && <FlaskConical size={32} />}
                {project.icon === 'uil-graph-bar' && <BarChart3 size={32} />}
                {project.icon === 'uil-bill' && <Receipt size={32} />}
                {project.icon === 'uil-briefcase-alt' && <Briefcase size={32} />}
                {project.icon === 'uil-camera-rps' && <Camera size={32} />}
              </div>
            </div>
            
            <div className="popup-section">
              <h4>Summary</h4>
              <p>{project.description}</p>
            </div>

            {project['detail-project'] && (
              <div className="popup-section markdown-content">
                <h4>Case Study & Details</h4>
                <div className="markdown-body">
                  <ReactMarkdown>{project['detail-project']}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="popup-section">
              <h4>Technologies Used</h4>
              <div className="popup-tools-grid">
                {project.tools.map((tool, i) => (
                  <div key={i} className="popup-tool-item">
                    <img src={tool.src} alt={tool.name} />
                    <span>{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="popup-actions">
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary popup-link-btn"
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
