import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  iconClassName?: string;
  title: string;
  titleSpan: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, iconClassName = '', title, titleSpan, subtitle }) => {
  return (
    <div className="section-header">
      <div className={`header-icon-wrapper ${iconClassName}`}>
        {icon}
      </div>
      <div className="header-text-group">
        <h2 className="section-title-new">{title} <span>{titleSpan}</span></h2>
        <p className="section-subtitle-new">{subtitle}</p>
      </div>
    </div>
  );
};

export default SectionHeader;
