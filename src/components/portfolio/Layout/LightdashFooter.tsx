import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Linkedin, Github, Mail } from 'lucide-react';

const WHATSAPP_NUMBER = '6285559496968';

// Lucide has no WhatsApp brand icon — use the official glyph as inline SVG.
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11-.41-.13-.94-.31-1.62-.6-2.85-1.23-4.7-4.1-4.84-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.38.26-.28.57-.35.76-.35h.55c.18 0 .41-.07.64.49.24.57.8 1.98.87 2.12.07.14.11.3.02.49-.09.19-.14.3-.28.46-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.28.71 1.17 1.53 1.89 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.28.36-.23.6-.14.24.09 1.53.72 1.79.85.26.14.44.21.5.32.06.11.06.65-.18 1.33z" />
  </svg>
);

const SOCIAL_LINKS = [
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/in/agus-budiman' },
  { name: 'GitHub', icon: Github, url: 'https://github.com/agusbudbudi' },
  { name: 'Email', icon: Mail, url: 'mailto:agus.buddiman@gmail.com' },
  { name: 'WhatsApp', icon: WhatsAppIcon, url: `https://wa.me/${WHATSAPP_NUMBER}` },
];

const LightdashFooter: React.FC = () => {
  return (
    <footer className="bg-ld-canvas border-t border-ld-ash font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-6">
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
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ name, icon: Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-ld-ash text-ld-slate hover:text-ld-violet hover:border-ld-violet transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-xs text-ld-fog text-center">
            &copy; {new Date().getFullYear()} Agus Budiman &middot; Mentor.QA
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LightdashFooter;
