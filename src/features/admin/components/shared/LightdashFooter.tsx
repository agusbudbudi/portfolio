import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Linkedin, Mail } from 'lucide-react';
import WhatsAppIcon from '../../../../components/illustration/WhatsAppIcon';

const WHATSAPP_NUMBER = '6285559496968';

const SOCIAL_LINKS = [
  { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/in/agus-budiman' },
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
                src="/shared/img/mentor-logo-96.webp"
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
              Platform karier QA Engineer: belajar terarah di QA Course, praktik lewat simulasi kerja QA, bangun portfolio, dan dibimbing mentor 1-on-1.
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
