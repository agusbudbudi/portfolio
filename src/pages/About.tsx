import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Briefcase, MapPin, GraduationCap, ChevronDown, ChevronUp, Quote, Linkedin } from 'lucide-react';
import experienceData from '../data/experience.json';
import educationData from '../data/education.json';
import endorsementData from '../data/endorsements.json';
import SectionHeader from '../components/common/SectionHeader';
import Badge from '../components/common/Badge';
import './About.css';

const About: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [expandedEndorsement, setExpandedEndorsement] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleEndorsement = (index: number) => {
    setExpandedEndorsement(expandedEndorsement === index ? null : index);
  };

  return (
    <div className="about-page container">
      {/* Profile Header Section */}
      <section className="profile-header-section fade-in visible">
        <div className="profile-card">
          <div className="profile-image-wrapper">
            <img src="/img/profile/profile-agus.png" alt="Agus Budiman" className="profile-image-new" />
            <span className="status-dot"></span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name-new">Agus <span>Budiman</span></h1>
            <div className="profile-location">
              <MapPin size={16} />
              <span>Jakarta, Indonesia</span>
            </div>
            <div className="profile-badges">
              <Badge>QA Engineer</Badge>
              <Badge>Fullstack QA</Badge>
              <Badge>5+ Years Exp</Badge>
            </div>
          </div>
        </div>
        <div className="profile-description">
          <p>
            <strong>QA Engineer</strong> with 6+ years of experience in Manual and Automation
            Testing across Healthcare, FinTech, OTA, EduTech, and ITSM
            domains. Proven ability to analyze requirements, design and
            execute comprehensive test plans, and collaborate effectively with
            cross-functional teams.
          </p>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="section-new fade-in visible">
        <SectionHeader 
          icon={<Briefcase size={20} />}
          title="Work"
          titleSpan="Experience"
          subtitle="A timeline of my professional career, milestones, and key contributions."
        />
        
        <div className="timeline-container">
          {experienceData.map((exp, index) => (
            <div key={index} className={`timeline-item ${expandedIndex === index ? 'expanded' : ''}`}>
              <div className="timeline-marker">
                <div className="marker-dot"></div>
                <div className="marker-line"></div>
              </div>
              
              <div className="experience-card-new" onClick={() => toggleExpand(index)}>
                <div className="card-top">
                  <div className="card-main-info">
                    <div className="company-logo-wrapper-new">
                      <img src={exp.logo} alt={exp.company} className="company-logo-new" />
                    </div>
                    <div className="company-text-group">
                      <div className="company-info-row">
                        <h3 className="company-name">{exp.company}</h3>
                        {index === 0 && <span className="current-badge">Current</span>}
                      </div>
                      <h4 className="role-title-new">{exp.role}</h4>
                    </div>
                  </div>
                  <div className="card-side-info">
                    <span className="period-text">{exp.period}</span>
                  </div>
                </div>
                
                <div className="card-meta">
                  <span>{exp.employmentType} · {exp.locationType}</span>
                  <span className="meta-separator">•</span>
                  <MapPin size={12} />
                  <span>{exp.location}</span>
                </div>

                <div className={`expandable-content ${expandedIndex === index ? 'is-expanded' : ''}`}>
                  <div className="card-details-inner">
                    <ul className="responsibilities-list">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="card-expand-indicator">
                  {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="section-new fade-in visible">
        <SectionHeader 
          icon={<GraduationCap size={20} />}
          iconClassName="edu-icon"
          title="Education"
          titleSpan=""
          subtitle="Academic foundations and certifications that shaped my technical expertise."
        />
        
        <div className="education-grid">
          {educationData.map((edu, index) => (
            <div key={index} className="education-card-new">
              <div className="education-card-header">
                <div className="edu-logo-wrapper">
                  <img src={edu.logo} alt={edu.institution} className="edu-logo" />
                </div>
                <div className="edu-info">
                  <h3 className="institution-name">{edu.institution}</h3>
                  <p className="degree-text">
                    <strong>{edu.degree}</strong> · {edu.major}
                  </p>
                  <span className="edu-period">{edu.period}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Endorsement Section */}
      <section id="endorsement" className="section-new fade-in visible">
        <SectionHeader 
          icon={<Quote size={20} />}
          iconClassName="endorsement-icon"
          title="Endorsements"
          titleSpan=""
          subtitle="Testimonials from colleagues and leaders I've collaborated with."
        />

        <div className="endorsement-grid">
          {endorsementData.map((endorsement, index) => (
            <div key={index} className="endorsement-card">
              <div className="endorsement-header">
                <div className="endorsement-profile-wrapper">
                  <img src={endorsement.image} alt={endorsement.name} className="endorsement-img" />
                  <div className="endorsement-company-badge">
                    <img src={endorsement.logo} alt={endorsement.company} />
                  </div>
                </div>
                <div className="endorsement-author-info">
                  <div className="author-name-row">
                    <h3 className="author-name">{endorsement.name}</h3>
                    <a href={endorsement.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                      <Linkedin size={16} />
                    </a>
                  </div>
                  <p className="author-relation">{endorsement.relation}</p>
                </div>
              </div>

              <div className="endorsement-content-wrapper">
                <div className={`endorsement-text ${expandedEndorsement === index ? 'is-expanded' : ''}`}>
                  <p>{endorsement.content}</p>
                </div>
                {endorsement.content.length > 200 && (
                  <button className="read-more-btn" onClick={() => toggleEndorsement(index)}>
                    {expandedEndorsement === index ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
