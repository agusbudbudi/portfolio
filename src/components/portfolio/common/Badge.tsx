import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex items-center text-xs px-3 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/80 rounded-full font-semibold whitespace-nowrap transition-colors ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
