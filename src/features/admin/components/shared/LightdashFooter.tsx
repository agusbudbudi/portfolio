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

// Footer link groups. In-app routes use <Link>; `external` opens a new tab.
const LINK_GROUPS: { title: string; links: { label: string; to: string; external?: boolean }[] }[] = [
  {
    title: 'Program',
    links: [
      { label: 'QA Course', to: '/courses' },
      { label: 'QA Simulator', to: '/qa-simulator' },
      { label: 'QA Library', to: '/qa-library' },
      { label: 'Portfolio QA', to: '/portfolio' },
      { label: 'Mentoring 1-on-1', to: '/mentoring' },
    ],
  },
  {
    title: 'Mentoring',
    links: [
      { label: 'Booking sesi', to: '/mentoring/booking' },
      { label: 'Mentor', to: '/mentoring#mentor' },
      { label: 'Topik', to: '/mentoring#topics' },
      { label: 'Harga', to: '/mentoring#pricing' },
      { label: 'FAQ', to: '/mentoring#faq' },
    ],
  },
  {
    title: 'Akun',
    links: [
      { label: 'Masuk / Daftar', to: '/login' },
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Contoh portfolio', to: '/portfolio/agus-budiman' },
    ],
  },
];

const LightdashFooter: React.FC = () => {
  return (
    <footer className="bg-ld-canvas border-t border-ld-frost font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
          {/* brand */}
          <div className="col-span-2 md:col-span-5 flex flex-col gap-4 max-w-sm">
            <Link to="/" className="flex items-center gap-2 text-lg font-medium text-ld-graphite tracking-tight no-underline">
              <img
                src="/shared/img/mentor-logo.webp"
                alt="Mentor.QA"
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
                className="w-7 h-7 object-contain"
              />
              <span>Mentor<span className="text-ld-violet">.QA</span></span>
            </Link>
            <p className="m-0 text-sm text-ld-slate leading-relaxed">
              Platform karier QA Engineer: belajar di QA Library, praktik lewat simulasi kerja QA, bangun portfolio, dan dibimbing mentor 1-on-1.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ name, icon: Icon, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-ld-frost text-ld-slate hover:text-ld-violet hover:border-ld-violet transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* link groups */}
          {LINK_GROUPS.map((group) => (
            <nav key={group.title} aria-label={group.title} className="md:col-span-2 flex flex-col gap-3">
              <p className="m-0 text-xs font-semibold uppercase tracking-widest text-ld-fog">{group.title}</p>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {group.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a href={l.to} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-ld-slate hover:text-ld-violet transition-colors no-underline">
                        {l.label} <ExternalLink size={11} />
                      </a>
                    ) : (
                      <Link to={l.to} className="text-sm text-ld-slate hover:text-ld-violet transition-colors no-underline">{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-ld-frost flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ld-fog">
          <p className="m-0">&copy; {new Date().getFullYear()} Mentor.QA &middot; Platform karier QA Engineer Indonesia</p>
          <a href="/personal-portfolio" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-ld-fog hover:text-ld-violet no-underline transition-colors">
            Dibuat oleh Agus Budiman <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default LightdashFooter;
