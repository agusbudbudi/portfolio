import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Calendar } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const MentoringNavbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 w-full h-[70px] bg-white/60 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 z-[1000] transition-colors duration-200 shadow-sm shadow-slate-100/40 dark:shadow-none">
      <nav className="max-w-[1200px] mx-auto px-4 h-full flex justify-between items-center">
        <Link to="/" className="flex items-center text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight no-underline">
          <div className="relative w-9 h-9 mr-3">
            <img
              src="/img/profile/logo-portfolio.png"
              alt="Logo"
              className="w-full h-full rounded-full object-contain border-2 border-blue-500/10 dark:bg-white p-[2px]"
            />
            <span className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full bottom-0.5 right-0.5 border-2 border-white dark:border-slate-900 animate-pulse"></span>
          </div>
          Mentor.<span className="text-blue-500">QA</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all duration-200 no-underline hover:-translate-y-0.5 shadow-sm shadow-blue-500/20"
          >
            <Calendar size={16} />
            Book Session
          </Link>

          <button
            className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default MentoringNavbar;
