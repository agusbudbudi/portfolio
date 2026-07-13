import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const navLinks = [
  { label: 'Topik', href: '#topics' },
  { label: 'Cara Kerja', href: '#how-it-works' },
  { label: 'Mentor', href: '#mentor' },
  { label: 'FAQ', href: '#faq' },
];

const portfolioLink = { label: 'Portfolio QA', to: '/portfolio' };

const LightdashNavbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-ld-canvas/90 backdrop-blur-md border-b border-ld-ash z-[1000] font-ld-sans">
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-lg font-medium text-ld-graphite tracking-tight no-underline font-ld-display">
          <img
            src="/shared/img/mentor-logo.webp"
            alt="Mentor.QA"
            width={28}
            height={28}
            loading="eager"
            decoding="async"
            className="w-7 h-7 object-contain"
          />
          <span>Mentor<span className="text-ld-violet">.QA</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <Link
            to={portfolioLink.to}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ld-graphite hover:text-ld-violet transition-colors no-underline"
          >
            {portfolioLink.label}
            <span className="inline-flex items-center px-1.5 py-1 rounded-sm bg-ld-violet text-white text-[10px] font-semibold leading-none tracking-wide">
              New
            </span>
          </Link>
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-ld-graphite hover:text-ld-violet transition-colors no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/mentoring/booking"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline hover:bg-[#1f87e6] transition-colors"
          >
            <Calendar size={15} />
            Book Session
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default LightdashNavbar;
