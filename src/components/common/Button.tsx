import React from 'react';
import { NavLink } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  onClick?: () => void;
  href?: string;
  download?: string | boolean;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  to?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  href,
  download,
  target,
  rel,
  type = 'button',
  to
}) => {
  const combinedClassName = `btn btn-${variant} ${className}`.trim();

  if (to) {
    return (
      <NavLink to={to} className={combinedClassName} onClick={onClick}>
        {children}
      </NavLink>
    );
  }

  if (href) {
    return (
      <a 
        href={href} 
        className={combinedClassName} 
        download={download} 
        target={target} 
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={combinedClassName} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
