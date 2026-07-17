import React from 'react';
import { Sparkles } from 'lucide-react';
import { SKILL_LEVEL_LABELS, type SkillConfig, type SkillLevel } from '../../../../types/portfolio';

const LEVEL_BADGE: Record<SkillLevel, string> = {
  beginner: 'bg-ld-cloud text-ld-slate',
  intermediate: 'bg-blue-500/10 text-blue-600',
  expert: 'bg-ld-violet text-white',
};

// Full-bleed violet band via the same self-contained breakout trick as
// ProjectsSection's gradient (isolate + absolute left-1/2 w-screen) — this
// keeps the section nestable inside the shared max-w-[1200px] content
// container alongside every other reorderable section (see
// PublicPortfolioPage.tsx's sectionOrder loop), instead of needing to be a
// page-level full-width sibling.
// flushBottom: true when the next visible section is also a banded
// (full-bleed violet) section — drops the bottom margin so the two colored
// bands sit flush against each other instead of showing a white seam.
const SkillsSection: React.FC<{ skills: (SkillConfig & { level: SkillLevel })[]; flushBottom?: boolean }> = ({ skills, flushBottom }) => (
  <section className={`relative isolate py-12 sm:py-14 ${flushBottom ? '' : 'mb-14'}`}>
    <div className="absolute -z-10 inset-y-0 left-1/2 w-screen -translate-x-1/2 bg-ld-violet" />
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 bg-white/10 text-white">
        <Sparkles size={20} />
      </div>
      <div>
        <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-white mb-1">Skills</h2>
        <p className="text-sm text-white/70">Kompetensi dan kemampuan yang dikuasai.</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-3">
      {skills.map((skill) => (
        <div
          key={skill.id}
          className="inline-flex items-center gap-2 px-3.5 py-3 rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.12)] text-sm font-semibold text-ld-graphite transition-transform hover:-translate-y-0.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-ld-violet shrink-0" />
          {skill.name}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${LEVEL_BADGE[skill.level]}`}>
            {SKILL_LEVEL_LABELS[skill.level]}
          </span>
        </div>
      ))}
    </div>
  </section>
);

export default SkillsSection;
