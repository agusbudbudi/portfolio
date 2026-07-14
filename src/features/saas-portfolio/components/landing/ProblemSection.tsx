import React from 'react';
import { ArrowDown } from 'lucide-react';

const problems = [
  {
    icon: '❌',
    title: 'CV Hanya Berisi Tulisan',
    description: 'Recruiter tidak bisa melihat bagaimana kamu testing.',
  },
  {
    icon: '📁',
    title: 'Tidak Punya Tempat Showcase Project',
    description: 'Semua hasil belajar hanya tersimpan di laptop.',
  },
  {
    icon: '😵',
    title: 'Bingung Harus Mulai dari Mana',
    description: 'Mau bikin website sendiri terlalu ribet.',
  },
];

const ProblemSection: React.FC = () => {
  return (
    <section className="relative py-8 md:py-20 bg-ld-violet font-ld-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.15),transparent_55%)] pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-white mb-4">
            Kenapa Banyak QA Sulit Dipanggil Interview?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto text-base leading-relaxed">
            Bukan karena skill kamu kurang. Ini masalah yang paling sering bikin QA dilewati recruiter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {problems.map(({ icon, title, description }, idx) => (
            <div
              key={title}
              className="relative overflow-hidden p-6 rounded-xl bg-ld-canvas text-left shadow-[0_12px_30px_rgba(30,27,75,0.1)]"
            >
              <span className="absolute -top-6 -right-3 font-ld-display font-semibold text-9xl text-ld-violet/[0.08] leading-none select-none">
                0{idx + 1}
              </span>

              <div className="relative w-16 h-16 flex items-center justify-center mb-4 text-5xl leading-none">
                {icon}
              </div>
              <h3 className="relative text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-1.5">{title}</h3>
              <p className="relative text-sm text-ld-slate leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2.5 mt-10">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center animate-bounce">
            <ArrowDown size={16} className="text-white" />
          </div>
          <span className="text-sm text-white/80">Ada solusinya</span>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
