import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Beranda', to: '/' },
  { label: 'Cari Mentor', to: '/mentoring/booking' },
  { label: 'Booking Sesi', to: '/mentoring/booking' },
];

const PublicPortfolioFooter: React.FC = () => {
  return (
    <footer className="bg-ld-canvas border-t border-ld-ash font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ld-fog">
              Portfolio ini didukung oleh
            </p>
            <p className="text-sm text-ld-slate leading-relaxed">
              <span className="font-semibold text-ld-graphite">Mentor.QA</span> - platform mentoring 1-on-1 buat QA Engineer belajar langsung dari mentor berpengalaman.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 w-fit mt-1 px-4 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium no-underline hover:bg-[#1f87e6] transition-colors"
            >
              Mulai Mentoring
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ld-fog">Quick Links</p>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-ld-slate hover:text-ld-violet transition-colors no-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img
                src="/img/mentor-logo.webp"
                alt="Mentor.QA"
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                className="w-7 h-7 object-contain"
              />
              <span className="text-lg font-medium text-ld-graphite tracking-tight font-ld-display">
                Mentor<span className="text-ld-violet">.QA</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs text-ld-fog text-center">
            &copy; {new Date().getFullYear()} Mentor.QA &middot; Platform Mentoring QA Engineer
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicPortfolioFooter;
