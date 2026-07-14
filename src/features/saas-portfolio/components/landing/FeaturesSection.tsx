import React from 'react';
import { Link2, Search, MessageSquareQuote } from 'lucide-react';

const coreFeatures = [
  {
    icon: '/saas-portfolio/img/portfolio-public/project.png',
    title: 'Project',
    description: 'Test case & automation script yang pernah kamu kerjakan.',
  },
  {
    icon: '/saas-portfolio/img/portfolio-public/experience.png',
    title: 'Experience',
    description: 'Timeline kerja dan pendidikan.',
  },
  {
    icon: '/saas-portfolio/img/portfolio-public/automation.png',
    title: 'Automation',
    description: 'Tools yang kamu kuasai — Cypress, Selenium, Playwright.',
  },
  {
    icon: '/saas-portfolio/img/portfolio-public/test-case.png',
    title: 'Test Case',
    description: 'Test case & test plan yang pernah kamu buat.',
  },
  {
    icon: '/saas-portfolio/img/portfolio-public/certificate.png',
    title: 'Certification',
    description: 'Sertifikasi ISTQB, kursus, dan training.',
  },
];

const bonusFeatures = [
  {
    icon: Search,
    title: 'SEO-Friendly',
    description: 'Portfolio-mu muncul di hasil pencarian Google.',
  },
  {
    icon: Link2,
    title: 'Custom URL',
    description: 'Link sendiri, gampang dibagikan ke recruiter.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Endorsement',
    description: 'Rekomendasi dari rekan kerja atau mentor.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Semua yang Recruiter Ingin Lihat Ada di Sini
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Bukan cuma CV digital - portfolio yang benar-benar menunjukkan cara kerja dan kemampuan QA-mu.
          </p>
        </div>

        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ld-violet">
            Yang Membantu Kamu Dapat Interview
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          {coreFeatures.map(({ icon, title, description }, idx) => (
            <div
              key={title}
              className={`p-4 lg:p-6 rounded-xl bg-ld-canvas border border-ld-ash text-left ${idx === 0 ? 'col-span-2 lg:col-span-1' : ''}`}
            >
              <div className="w-16 h-16 flex items-center justify-center mb-4">
                <img src={icon} alt="" className="w-14 h-14 object-contain" />
              </div>
              <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-1.5">{title}</h3>
              <p className="text-sm text-ld-slate leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-ld-fog">
            Bonus
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {bonusFeatures.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-4 rounded-xl bg-ld-cloud/60 text-left"
            >
              <Icon size={16} className="text-ld-fog shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-0.5">{title}</h3>
                <p className="text-xs text-ld-slate leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
