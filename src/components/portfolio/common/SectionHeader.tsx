import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  iconClassName?: string; // We can accept custom classes, or match the name to set the theme
  title: string;
  titleSpan: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, iconClassName = '', title, titleSpan, subtitle }) => {
  // Map legacy icon classes to Tailwind classes
  let bgIconClass = 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/25 dark:text-blue-400';
  
  if (iconClassName.includes('deliverables-icon') || iconClassName.includes('skills-icon')) {
    bgIconClass = 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/25 dark:text-indigo-450';
  } else if (iconClassName.includes('project-icon')) {
    bgIconClass = 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/25 dark:text-amber-400';
  } else if (iconClassName.includes('cert-icon')) {
    bgIconClass = 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/25 dark:text-teal-400';
  } else if (iconClassName.includes('contact-icon')) {
    bgIconClass = 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/25 dark:text-emerald-400';
  }

  return (
    <div className="flex items-start gap-4 mb-8 md:mb-6">
      <div className={`w-10 h-10 min-w-10 rounded-xl flex items-center justify-center mt-1 transition-colors ${bgIconClass} ${iconClassName}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white m-0">
          {title} <span className="font-normal italic text-slate-500 dark:text-slate-400">{titleSpan}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 m-0">{subtitle}</p>
      </div>
    </div>
  );
};

export default SectionHeader;
