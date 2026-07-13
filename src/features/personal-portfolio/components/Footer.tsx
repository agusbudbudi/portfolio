import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/personal-portfolio' || location.pathname === '/personal-portfolio/' || location.pathname === '/';

  return (
    <footer className={`py-8 text-center ${isHomePage
        ? 'bg-ld-violet border-none text-white'
        : 'bg-ld-canvas border-t border-ld-ash'
      }`}>
      <div className="max-w-[1200px] mx-auto px-4">
        <p className={`text-sm ${isHomePage ? 'text-white/90' : 'text-ld-slate'}`}>
          &copy; {new Date().getFullYear()} | Crafted with <span className={isHomePage ? 'text-white font-semibold' : 'text-ld-violet font-semibold'}>⚡ Passion</span> by Agus Budiman | QA Engineer Portfolio
        </p>
      </div>
    </footer>
  );
};

export default Footer;
