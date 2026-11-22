import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import PhaseIllustration, { type PhaseIllustrationName } from './PhaseIllustration';
import TeamAvatar from '../TeamAvatar';
import { SPLITBILL_TEAM, firstName } from '../../data/splitbillTeam';

const PHASES: {
  art: PhaseIllustrationName;
  title: string;
  body: string;
  deliverables: string[];
  free: boolean;
}[] = [
  {
    art: 'requirement',
    title: 'Requirement Analysis',
    body: 'Baca PRD Split Bill v2, temukan gap, ambiguitas, dan edge case sebelum satu baris kode ditulis. Kirim pertanyaan klarifikasi ke PM.',
    deliverables: ['Daftar pertanyaan klarifikasi', 'Ringkasan pemahaman fitur'],
    free: true,
  },
  {
    art: 'testDesign',
    title: 'Test Scenario & Test Case Design',
    body: 'PM menjawab pertanyaanmu. Ubah requirement yang sudah jelas menjadi test scenario dan test case dengan boundary value analysis dan equivalence partitioning.',
    deliverables: ['Test scenario', 'Test case detail'],
    free: false,
  },
  {
    art: 'bugHunting',
    title: 'Test Execution & Bug Reporting',
    body: 'Uji aplikasi staging yang sengaja diberi bug. Laporkan temuanmu dengan severity yang tepat, lalu tulis test summary dan rekomendasi Go / No-Go.',
    deliverables: ['Bug report', 'Test summary & rekomendasi rilis'],
    free: false,
  },
];

// Avatars/colours come from the shared squad data; short labels are landing copy.
const TEAM = [
  { member: SPLITBILL_TEAM.pm, role: 'Product Manager' },
  { member: SPLITBILL_TEAM.lead, role: 'Engineering Lead' },
  { member: SPLITBILL_TEAM.qaLead, role: 'QA Lead (mentor)' },
];

const SimHowItWorksSection: React.FC = () => (
  <section id="cara-kerja" className="py-16 md:py-24 bg-ld-canvas scroll-mt-16">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Cara kerja</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">
          Satu sprint, tiga phase, alur kerja QA yang utuh
        </h2>
        <p className="m-0 mt-4 text-ld-slate leading-relaxed">
          Setiap phase diawali materi singkat, lalu tugas yang sama persis dengan pekerjaan QA sehari-hari, ditutup kunci jawaban dan rubrik penilaian.
        </p>
      </div>

      <ol className="m-0 p-0 list-none grid grid-cols-1 lg:grid-cols-3 gap-5 relative">
        {PHASES.map(({ art, title, body, deliverables, free }, i) => (
          <li key={title} className="relative rounded-2xl border border-ld-frost/70 bg-white p-6 flex flex-col shadow-[0_4px_18px_rgba(30,27,75,0.035)]">
            <div className="relative -mx-2 -mt-2 mb-5 rounded-xl bg-ld-cloud flex items-center justify-center h-40 overflow-hidden">
              <PhaseIllustration name={art} className="h-36 w-auto" />
              <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${free ? 'bg-emerald-50 text-emerald-700' : 'bg-white text-ld-slate'}`}>
                {free ? <Unlock size={11} /> : <Lock size={11} />}
                {free ? 'Tanpa login' : 'Login gratis'}
              </span>
            </div>
            <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-fog">Phase {i + 1}</p>
            <h3 className="m-0 mt-1 text-lg font-semibold text-ld-graphite leading-snug">{title}</h3>
            <p className="m-0 mt-2 text-sm text-ld-slate leading-relaxed flex-1">{body}</p>
            <div className="mt-5 pt-4 border-t border-ld-frost/70">
              <p className="m-0 mb-2 text-xs font-medium text-ld-steel">Yang kamu hasilkan:</p>
              <ul className="m-0 p-0 list-none flex flex-wrap gap-1.5">
                {deliverables.map((d) => (
                  <li key={d} className="px-2 py-0.5 rounded-md bg-ld-lilac text-ld-violet text-[11px] font-medium">{d}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-6 rounded-2xl bg-ld-cloud p-4 sm:px-6 sm:py-5">
        <p className="m-0 px-1 sm:px-0 text-sm text-ld-slate leading-snug">Kamu bekerja bersama tim fiktif yang merespons pekerjaanmu:</p>
        <ul className="m-0 p-0 list-none grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
          {TEAM.map(({ member, role }) => (
            <li
              key={member.id}
              className="flex items-center gap-3 sm:gap-2 rounded-xl bg-white sm:bg-transparent px-3 py-2.5 sm:p-0 border border-ld-frost/70 sm:border-0"
            >
              <TeamAvatar member={member} />
              <span className="text-sm sm:text-xs leading-tight min-w-0">
                <span className="block font-semibold text-ld-graphite">{firstName(member)}</span>
                <span className="block text-ld-slate">{role}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default SimHowItWorksSection;
