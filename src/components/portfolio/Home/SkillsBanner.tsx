import React from 'react';

const SKILLS = [
  'MANUAL TESTING', 'AUTOMATION', 'API TESTING', 'JAVASCRIPT', 
  'CYPRESS', 'APPIUM', 'POSTMAN', 'JIRA', 'GIT', 'JENKINS'
];

const SkillsBanner: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/30 border-y border-slate-200 dark:border-slate-800/80 py-8 overflow-hidden">
      <div 
        className="flex gap-12 items-center w-max"
        style={{
          animation: 'scroll-banner 30s linear infinite'
        }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll-banner {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}} />
        {/* Render twice for seamless loop */}
        {[...SKILLS, ...SKILLS].map((skill, index) => (
          <span key={index} className="text-slate-400 dark:text-slate-555 font-semibold text-sm uppercase tracking-wider whitespace-nowrap">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SkillsBanner;
