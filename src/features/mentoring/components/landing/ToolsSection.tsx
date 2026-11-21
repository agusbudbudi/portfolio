import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Brand "Logo Grid" treatment (docs/DESIGN.md): Cloud band, left-aligned copy,
// flat white tiles with a hairline Ash border and no shadow. Blue is kept for
// the single CTA and the small check marks; the page's one blue band lives
// elsewhere, so this section stays neutral.

const highlights = [
  'Tools yang dipakai langsung di industri',
  'Dipraktikkan langsung bareng mentor',
  'Update sesuai kebutuhan kerja terkini',
];

const tools = [
  { name: 'Cypress', category: 'Web automation', logo: '/personal-portfolio/img/tools/cypress-logo.svg' },
  { name: 'Webdriver.io', category: 'Web automation', logo: '/personal-portfolio/img/tools/webdriver-io-logo.webp' },
  { name: 'Appium', category: 'Mobile automation', logo: '/personal-portfolio/img/tools/appium-logo.webp' },
  { name: 'Postman', category: 'API testing', logo: '/personal-portfolio/img/tools/postman-logo.webp' },
  { name: 'Charles Proxy', category: 'Network debugging', logo: '/personal-portfolio/img/tools/charles-proxy-logo.webp' },
  { name: 'Jira', category: 'Bug tracking', logo: '/personal-portfolio/img/tools/jira-logo.webp' },
  { name: 'TestRail', category: 'Test management', logo: '/personal-portfolio/img/tools/testrail-logo.webp' },
  { name: 'GitHub', category: 'Version control', logo: '/personal-portfolio/img/tools/github-logo.webp' },
  { name: 'VS Code', category: 'Code editor', logo: '/personal-portfolio/img/tools/vsc-logo.webp' },
];

const EASE = [0.4, 0, 0.2, 1] as const;

const ToolsSection: React.FC = () => {
  const reduce = useReducedMotion();

  const grid: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
  };
  const tile: Variants = {
    hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  };

  return (
    <section className="bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-ld-lilac text-ld-violet text-xs font-medium mb-4">
              {tools.length} tools industri
            </span>
            <h2 className="font-semibold text-3xl sm:text-4xl leading-[1.1] tracking-[-0.02em] text-ld-graphite mb-4">
              Tools yang Akan Dipelajari
            </h2>
            <p className="text-ld-slate max-w-md text-base leading-relaxed tracking-[-0.01em] mb-6">
              Bukan cuma teori. Kamu praktik langsung pakai tools yang dipakai QA Engineer di
              industri setiap hari.
            </p>

            <ul className="space-y-3 mb-8">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ld-lilac flex items-center justify-center">
                    <Check size={12} strokeWidth={3} className="text-ld-violet" />
                  </span>
                  <span className="text-sm text-ld-graphite">{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/mentoring/booking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
            >
              Mulai Belajar Sekarang
              <ArrowRight size={16} />
            </Link>
          </div>

          <motion.ul
            variants={grid}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            {tools.map((t) => (
              <motion.li
                key={t.name}
                variants={tile}
                className="flex flex-col bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden transition-colors duration-200 hover:border-ld-violet"
              >
                <span className="flex items-center justify-center h-16 sm:h-20 px-4 bg-ld-canvas">
                  <img
                    src={t.logo}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="max-h-8 sm:max-h-9 max-w-full object-contain"
                  />
                </span>
                <span className="block px-3 sm:px-4 py-2.5 border-t border-ld-frost bg-ld-cloud/60">
                  <span className="block text-sm font-medium text-ld-graphite tracking-[-0.01em] truncate">
                    {t.name}
                  </span>
                  <span className="block text-xs text-ld-steel truncate">{t.category}</span>
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
