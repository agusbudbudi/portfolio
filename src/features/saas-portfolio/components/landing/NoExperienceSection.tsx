import React from 'react';
import { Check } from 'lucide-react';

const items = [
  'Capstone Project',
  'Automation Practice',
  'API Testing',
  'Bootcamp Project',
  'Personal Learning',
  'Dummy Project',
];

const NoExperienceSection: React.FC = () => {
  return (
    <section className="py-8 md:py-20 bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Belum Pernah Kerja? Tidak Masalah.
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Recruiter tetap bisa menilai kemampuanmu melalui project latihan yang terdokumentasi dengan baik.
          </p>
        </div>

        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          {items.map(item => (
            <div
              key={item}
              className="flex items-center gap-2.5 p-3.5 rounded-lg border border-ld-ash bg-ld-canvas"
            >
              <span className="w-5 h-5 shrink-0 rounded-full bg-ld-violet flex items-center justify-center">
                <Check size={13} className="text-white" strokeWidth={3} />
              </span>
              <span className="text-sm font-medium text-ld-graphite">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NoExperienceSection;
