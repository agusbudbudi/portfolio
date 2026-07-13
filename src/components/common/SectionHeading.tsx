import React from 'react';

const SectionHeading: React.FC<{ icon: React.ReactNode; iconClassName: string; title: React.ReactNode; subtitle: string }> = ({
  icon, iconClassName, title, subtitle,
}) => (
  <div className="flex items-start gap-4 mb-6">
    <div className={`w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 ${iconClassName}`}>
      {icon}
    </div>
    <div>
      <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">{title}</h2>
      <p className="text-sm text-ld-slate">{subtitle}</p>
    </div>
  </div>
);

export default SectionHeading;
