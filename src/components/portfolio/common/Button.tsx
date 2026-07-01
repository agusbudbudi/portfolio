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
  id?: string;
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
  to,
  id
}) => {
  const baseClass = 'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-base transition-all duration-300 ease-out cursor-pointer border';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500 to-sky-400 text-white border-transparent shadow-md shadow-blue-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 hover:from-sky-400 hover:to-blue-500',
    secondary: 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400',
    outline: 'bg-transparent text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-400'
  };

  const combinedClassName = `${baseClass} ${variantClasses[variant]} ${className}`.trim();

  if (to) {
    return (
      <NavLink id={id} to={to} className={combinedClassName} onClick={onClick}>
        {children}
      </NavLink>
    );
  }

  if (href) {
    return (
      <a 
        id={id}
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
    <button id={id} type={type} className={combinedClassName} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
