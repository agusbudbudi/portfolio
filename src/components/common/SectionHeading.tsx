import React from 'react';

const SectionHeading: React.FC<{ icon: React.ReactNode; iconClassName: string; title: React.ReactNode; subtitle: string; action?: React.ReactNode }> = ({
  icon, iconClassName, title, subtitle, action,
}) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div className="flex items-start gap-4">
      <div className={`w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 ${iconClassName}`}>
        {icon}
      </div>
      <div>
        <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">{title}</h2>
        <p className="text-sm text-ld-slate">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

export default SectionHeading;
