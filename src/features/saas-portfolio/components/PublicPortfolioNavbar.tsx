import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PublicPortfolioNavbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-ld-canvas/90 backdrop-blur-md border-b border-ld-ash z-[1000] font-ld-sans">
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 h-full flex justify-between items-center">
        <Link to="/" className="flex flex-col justify-center gap-0.5 no-underline">
          <span className="text-[10px] leading-none text-ld-fog">Powered by:</span>
          <span className="flex items-center gap-2 text-lg font-medium text-ld-graphite tracking-tight leading-none font-ld-display">
            <img
              src="/shared/img/mentor-logo.webp"
              alt="Mentor.QA"
              width={24}
              height={24}
              loading="eager"
              decoding="async"
              className="w-6 h-6 object-contain"
            />
            <span>Mentor<span className="text-ld-violet">.QA</span></span>
          </span>
        </Link>

        <Link
          to="/portfolio"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline hover:bg-[#1f87e6] transition-colors"
        >
          Buat Portfolio
          <ArrowRight size={15} />
        </Link>
      </nav>
    </header>
  );
};

export default PublicPortfolioNavbar;
