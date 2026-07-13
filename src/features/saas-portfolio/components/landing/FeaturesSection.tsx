import React from 'react';
import { FolderKanban, Award, Briefcase, Wrench, Link2, Search, GraduationCap, MessageSquareQuote } from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Showcase Proyek',
    description: 'Test case, automation script, dan proyek QA lengkap dengan tools yang dipakai.',
  },
  {
    icon: Award,
    title: 'Sertifikasi & Skill',
    description: 'Pajang sertifikasi ISTQB, kursus, dan training yang sudah kamu selesaikan.',
  },
  {
    icon: Briefcase,
    title: 'Pengalaman Kerja',
    description: 'Timeline kerja dan pendidikan, rapi dan mudah dibaca recruiter.',
  },
  {
    icon: Wrench,
    title: 'Tools & Teknologi',
    description: 'Highlight tools yang kamu kuasai Cypress, Postman, Selenium, JMeter, dll.',
  },
  {
    icon: MessageSquareQuote,
    title: 'Endorsement',
    description: 'Rekomendasi dari rekan kerja, mentor, atau atasan langsung.',
  },
  {
    icon: Link2,
    title: 'Custom URL',
    description: 'Link portfolio sendiri, gampang dibagikan ke recruiter atau di CV.',
  },
  {
    icon: Search,
    title: 'SEO-Friendly',
    description: 'Dioptimasi supaya portfolio-mu muncul di hasil pencarian Google.',
  },
  {
    icon: GraduationCap,
    title: 'Untuk Semua Level QA',
    description: 'Cocok buat fresh graduate sampai QA berpengalaman.',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Semua yang Kamu Butuhkan dalam Satu Portfolio
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Bukan cuma CV digital - portfolio yang benar-benar menunjukkan cara kerja dan kemampuan QA-mu.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="p-4 lg:p-6 rounded-xl bg-ld-canvas border border-ld-ash text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-ld-lilac flex items-center justify-center mb-4">
                <Icon size={18} className="text-ld-violet" />
              </div>
              <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-1.5">{title}</h3>
              <p className="text-sm text-ld-slate leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
