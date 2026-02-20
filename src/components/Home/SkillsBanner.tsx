import React from 'react';
import './SkillsBanner.css';

const SKILLS = [
  'MANUAL TESTING', 'AUTOMATION', 'API TESTING', 'JAVASCRIPT', 
  'CYPRESS', 'APPIUM', 'POSTMAN', 'JIRA', 'GIT', 'JENKINS'
];

const SkillsBanner: React.FC = () => {
  return (
    <div className="skills-banner">
      <div className="skills-scroll">
        {/* Render twice for seamless loop */}
        {[...SKILLS, ...SKILLS].map((skill, index) => (
          <span key={index} className="skill-item">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsBanner;
