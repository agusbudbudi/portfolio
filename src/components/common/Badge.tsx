import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`badge ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
