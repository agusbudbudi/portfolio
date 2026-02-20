import React from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import experienceData from '../../data/experience.json';
import SectionHeader from '../common/SectionHeader';
import './WorkExperienceTimeline.css';

const WorkExperienceTimeline: React.FC = () => {
  const calculateDuration = (period: string) => {
    const parts = period.split(' - ');
    const startStr = parts[0];
    const endStr = parts[1] === 'Present' ? new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : parts[1];
    
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    
    // Add 1 month to include both start and end months
    months += 1;
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    let durationStr = '';
    if (years > 0) durationStr += `${years} yr${years > 1 ? 's' : ''} `;
    if (remainingMonths > 0) durationStr += `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    
    return durationStr.trim();
  };

  return (
    <section className="experience-timeline section">
      <div className="timeline-wrapper">
        <div className="timeline-bg-text">EXPERIENCE</div>
        <div className="container">
          <div className="section-header-row">
            <SectionHeader 
              icon={<Briefcase size={20} />}
              iconClassName="exp-icon"
              title="Work"
              titleSpan="Experience"
              subtitle="My professional journey and career growth."
            />
            <NavLink to="/about#experience" className="btn btn-outline view-detail-btn">
              Lihat Detail <ArrowUpRight size={18} />
            </NavLink>
          </div>
        </div>

        <div className="timeline-scroll-container">
          <div className="timeline-items">
            <div className="timeline-rail"></div>
            {experienceData.map((exp, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-node">
                  <div className="timeline-dot"></div>
                </div>
                <div className="timeline-content-card">
                  <div className="timeline-card-main">
                    <div className="timeline-logo-wrapper">
                      <img src={exp.logo} alt={exp.company} className="timeline-logo" />
                    </div>
                    <div className="timeline-info">
                      <h3 className="timeline-role">{exp.role}</h3>
                      <p className="timeline-company">{exp.company}</p>
                    </div>
                  </div>
                  
                  <div className="timeline-meta">
                    <span className="timeline-period">{exp.period}</span>
                    <span className="timeline-duration">{calculateDuration(exp.period)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkExperienceTimeline;
