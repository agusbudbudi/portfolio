import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const highlights = [
  'Tools yang dipakai langsung di industri',
  'Dipraktikkan langsung bareng mentor',
  'Update sesuai kebutuhan kerja terkini',
];

const tools = [
  { name: 'Cypress', logo: '/img/tools/cypress-logo.svg' },
  { name: 'Postman', logo: '/img/tools/postman-logo.webp' },
  { name: 'Appium', logo: '/img/tools/appium-logo.webp' },
  { name: 'Webdriver.io', logo: '/img/tools/webdriver-io-logo.webp' },
  { name: 'Jira', logo: '/img/tools/jira-logo.webp' },
  { name: 'TestRail', logo: '/img/tools/testrail-logo.webp' },
  { name: 'GitHub', logo: '/img/tools/github-logo.webp' },
  { name: 'Charles Proxy', logo: '/img/tools/charles-proxy-logo.webp' },
  { name: 'VS Code', logo: '/img/tools/vsc-logo.webp' },
];

const tilts = ['-rotate-3', 'rotate-2', 'rotate-3', '-rotate-2', 'rotate-1', '-rotate-1'];
const floats = ['translate-y-0', '-translate-y-2', 'translate-y-2', '-translate-y-1', 'translate-y-1', 'translate-y-0', 'translate-y-1'];
const sizes = ['scale-100', 'scale-90', 'scale-110', 'scale-95', 'scale-105', 'scale-90', 'scale-100'];

const ToolsSection: React.FC = () => {
  return (
    <section className="bg-ld-violet font-ld-sans overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white mb-4">
              Tools yang Akan Dipelajari
            </h2>
            <p className="text-white/80 max-w-md mx-auto lg:mx-0 text-base leading-relaxed mb-6">
              Bukan cuma teori — tools yang sama dipakai QA Engineer di industri sehari-hari.
            </p>

            <ul className="space-y-3 mb-8 max-w-md mx-auto lg:mx-0">
              {highlights.map(item => (
                <li key={item} className="flex items-center justify-center lg:justify-start gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </span>
                  <span className="text-sm text-white/90">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/mentoring/booking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ld-violet font-medium rounded-lg no-underline hover:bg-ld-lilac transition-colors text-sm"
            >
              Mulai Belajar Sekarang
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-5 py-4">
            {tools.map((tool, idx) => (
              <div
                key={tool.name}
                className={`group flex flex-col items-center justify-center gap-2 bg-ld-canvas border border-ld-ash rounded-xl p-3 shadow-[0_8px_18px_rgba(30,27,75,0.08)] transition-all duration-300 ease-out ${tilts[idx % tilts.length]} ${floats[idx % floats.length]} ${sizes[idx % sizes.length]} hover:rotate-0 hover:-translate-y-1.5 hover:scale-110 hover:border-ld-violet hover:shadow-[0_16px_32px_rgba(93,74,255,0.22)] hover:z-10`}
              >
                <img
                  src={tool.logo}
                  alt={tool.name}
                  loading="lazy"
                  decoding="async"
                  className="h-7 w-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-[10px] font-medium text-ld-slate text-center group-hover:text-ld-violet transition-colors">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
