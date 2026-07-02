import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ExternalLink } from 'lucide-react';

const WHATSAPP_NUMBER = '6285559496968';

const LightdashFooter: React.FC = () => {
  return (
    <footer className="bg-ld-canvas border-t border-ld-ash font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-lg font-medium text-ld-graphite tracking-tight font-ld-display">
              <img
                src="/img/mentor-logo.webp"
                alt="Mentor.QA"
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                className="w-7 h-7 object-contain"
              />
              <span>Mentor<span className="text-ld-violet">.QA</span></span>
            </span>
            <p className="text-sm text-ld-slate leading-relaxed">
              Membantu QA Engineer naik level dan mempercepat karir mereka.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ld-fog">Quick Links</p>
            <ul className="flex flex-col gap-2 list-none p-0 m-0">
              <li>
                <Link to="/mentoring/booking" className="text-sm text-ld-slate hover:text-ld-violet transition-colors no-underline">
                  Book a Session
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="inline-flex items-center gap-1.5 text-sm text-ld-slate hover:text-ld-violet transition-colors no-underline">
                  View Portfolio
                  <ExternalLink size={11} />
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-wide text-ld-fog">Contact</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-lg border border-ld-ash text-ld-graphite text-sm font-medium hover:border-ld-steel transition-colors no-underline"
            >
              <MessageCircle size={15} />
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs text-ld-fog text-center">
            &copy; {new Date().getFullYear()} Agus Budiman &middot; QA Mentoring
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LightdashFooter;
