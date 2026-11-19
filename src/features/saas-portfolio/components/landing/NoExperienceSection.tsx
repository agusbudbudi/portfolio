import React from 'react';
import {
  ApiTestingIcon, AutomationIcon, BootcampIcon, CapstoneIcon, DummyProjectIcon, LearningIcon,
} from '../../../../components/illustration/ProjectTypeIcons';

// Each project type gets a brand illustration icon (ProjectTypeIcons, same
// style as the product icons) instead of a generic checkmark.
const items = [
  { label: 'Capstone Project', icon: CapstoneIcon },
  { label: 'Automation Practice', icon: AutomationIcon },
  { label: 'API Testing', icon: ApiTestingIcon },
  { label: 'Bootcamp Project', icon: BootcampIcon },
  { label: 'Personal Learning', icon: LearningIcon },
  { label: 'Dummy Project', icon: DummyProjectIcon },
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
          {items.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 rounded-lg border border-ld-ash bg-ld-canvas"
            >
              <Icon size={40} className="shrink-0" />
              <span className="text-sm font-medium text-ld-graphite">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NoExperienceSection;
