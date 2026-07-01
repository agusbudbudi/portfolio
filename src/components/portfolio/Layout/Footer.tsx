import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/portfolio' || location.pathname === '/portfolio/' || location.pathname === '/';

  return (
    <footer className={`py-8 text-center transition-all duration-300 ${isHomePage
        ? 'bg-gradient-to-br from-blue-500 to-blue-700 border-none text-white'
        : 'bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80'
      }`}>
      <div className="max-w-[1200px] mx-auto px-4">
        <p className={`text-sm ${isHomePage ? 'text-white/90' : 'text-slate-500 dark:text-slate-400'}`}>
          &copy; {new Date().getFullYear()} | Crafted with <span className={isHomePage ? 'text-white font-semibold' : 'text-blue-500 font-semibold'}>⚡ Passion</span> by Agus Budiman | QA Engineer Portfolio
        </p>
      </div>
    </footer>
  );
};

export default Footer;
