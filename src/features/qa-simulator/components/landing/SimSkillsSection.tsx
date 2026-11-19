import React from 'react';
import { Check, X } from 'lucide-react';

const SKILLS = [
  { title: 'Requirement analysis', body: 'Membaca PRD dengan kacamata QA dan menulis pertanyaan klarifikasi yang tajam.' },
  { title: 'Test design technique', body: 'Boundary value analysis, equivalence partitioning, dan positive / negative case.' },
  { title: 'Test case writing', body: 'Precondition, langkah, dan expected result yang bisa dieksekusi orang lain.' },
  { title: 'Bug reporting', body: 'Steps to reproduce, severity vs priority, dan bukti yang memudahkan developer.' },
  { title: 'Risk-based decision', body: 'Menulis test summary dan membela rekomendasi Go / No-Go di depan tim.' },
  { title: 'Cerita untuk interview', body: 'Pengalaman konkret yang bisa kamu ceritakan dengan metode STAR.' },
];

const COMPARISON: { label: string; tutorial: boolean; sim: boolean }[] = [
  { label: 'PRD dan konteks bisnis nyata', tutorial: false, sim: true },
  { label: 'Diskusi dan klarifikasi dengan PM', tutorial: false, sim: true },
  { label: 'Aplikasi staging dengan bug tersembunyi', tutorial: false, sim: true },
  { label: 'Kunci jawaban dan rubrik dari QA Lead', tutorial: false, sim: true },
  { label: 'Hasil kerja jadi portfolio', tutorial: false, sim: true },
  { label: 'Penjelasan teori testing', tutorial: true, sim: true },
];

const SimSkillsSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-ld-cloud">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
      <div>
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Skill yang kamu latih</p>
        <h2 className="m-0 mb-8 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">
          Skill yang benar-benar ditanyakan saat interview QA
        </h2>
        <dl className="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
          {SKILLS.map((s) => (
            <div key={s.title} className="border-l-2 border-ld-violet pl-4">
              <dt className="text-sm font-semibold text-ld-graphite">{s.title}</dt>
              <dd className="m-0 mt-1 text-sm text-ld-slate leading-relaxed">{s.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl bg-white border border-ld-frost/70 overflow-hidden shadow-[0_4px_18px_rgba(30,27,75,0.035)]">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">Perbandingan tutorial biasa dan QA Simulator</caption>
          <thead>
            <tr className="bg-ld-cloud">
              <th scope="col" className="text-left font-medium text-ld-steel px-4 sm:px-5 py-3.5"> </th>
              <th scope="col" className="font-medium text-ld-steel px-2 py-3.5 w-24 text-center">Tutorial</th>
              <th scope="col" className="font-semibold text-ld-violet px-2 py-3.5 w-28 text-center">QA Simulator</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON.map((row) => (
              <tr key={row.label} className="border-t border-ld-frost/70">
                <th scope="row" className="text-left font-normal text-ld-graphite px-4 sm:px-5 py-3.5">{row.label}</th>
                <td className="text-center px-2">
                  {row.tutorial ? <Check size={16} className="inline text-ld-steel" aria-label="Ya" /> : <X size={16} className="inline text-ld-ash" aria-label="Tidak" />}
                </td>
                <td className="text-center px-2 bg-ld-lilac/40">
                  {row.sim ? <Check size={16} className="inline text-ld-violet" aria-label="Ya" /> : <X size={16} className="inline text-ld-ash" aria-label="Tidak" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </section>
);

export default SimSkillsSection;
