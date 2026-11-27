import React from 'react';
import { Check } from 'lucide-react';
import type { ProgramId } from '../data/programs';

// Static mini mock-ups for the ecosystem cards. Illustrative only: no real
// names or numbers. Decorative (aria-hidden). Accents (green, red, amber,
// onyx) match the "Kenapa Mentor.QA?" illustrations.

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-ld-frost bg-white p-3 shadow-ld-subtle-2 ${className}`}>{children}</div>
);

const Bar: React.FC<{ className: string }> = ({ className }) => <span className={`block h-1.5 rounded-full ${className}`} />;

const Tick: React.FC<{ done?: boolean }> = ({ done }) => (
  <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-500 text-white' : 'border border-ld-ash bg-white'}`}>
    {done && <Check size={10} strokeWidth={3.5} />}
  </span>
);

/** QA Simulator team portraits, reused as stand-ins in the portfolio and chat mock-ups. */
const Avatar: React.FC<{ name: string }> = ({ name }) => (
  <img src={`/qa-simulator/team/${name}.webp`} alt="" width={32} height={32} loading="lazy" decoding="async" className="h-8 w-8 shrink-0 rounded-full object-cover" />
);

const PREVIEWS: Record<ProgramId, React.ReactNode> = {
  course: (
    <Panel className="w-[230px]">
      {['Membaca PRD', 'Menulis test case', 'Bug report'].map((label, i) => (
        <span key={label} className="flex items-center gap-2 py-1 text-[11px] text-ld-graphite">
          <Tick done={i < 2} /> {label}
        </span>
      ))}
      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-ld-frost"><Bar className="w-2/3 bg-ld-violet" /></span>
    </Panel>
  ),
  simulator: (
    <Panel className="w-[230px]">
      <span className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-ld-onyx">Total tidak sesuai</span>
        <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-600">Open</span>
      </span>
      <span className="mt-1 flex items-center gap-1 text-[10px] text-ld-slate"><span className="h-2 w-2 rounded-full bg-red-500" /> Severity: High</span>
      <span className="mt-2.5 flex flex-col gap-1.5"><Bar className="w-full bg-ld-frost" /><Bar className="w-4/5 bg-red-100" /></span>
      <span className="mt-3 inline-block rounded-md bg-ld-onyx px-2.5 py-1 text-[10px] font-medium text-white">Kirim bug report</span>
    </Panel>
  ),
  library: (
    <Panel className="w-[200px]">
      {[['Template test case', 'bg-ld-violet'], ['Panduan API testing', 'bg-emerald-500'], ['Checklist rilis', 'bg-amber-400']].map(([label, color]) => (
        <span key={label} className="flex items-center gap-2 py-1 text-[11px] text-ld-graphite">
          <span className={`h-4 w-3 shrink-0 rounded-[3px] ${color}`} /> {label}
        </span>
      ))}
    </Panel>
  ),
  portfolio: (
    <Panel className="w-[200px]">
      <span className="flex items-center gap-2">
        <Avatar name="nadia-kusuma" />
        <span className="flex flex-1 flex-col gap-1.5"><Bar className="w-3/4 bg-ld-onyx" /><Bar className="w-1/2 bg-ld-frost" /></span>
      </span>
      <span className="mt-3 grid grid-cols-3 gap-1.5">
        {['bg-ld-violet', 'bg-emerald-500', 'bg-ld-onyx'].map((c) => <span key={c} className={`h-9 rounded-md ${c}`} />)}
      </span>
    </Panel>
  ),
  mentoring: (
    <div className="flex w-[230px] flex-col gap-2">
      <div className="flex items-end gap-1.5 self-start">
        <Avatar name="sari-wulandari" />
        <Panel className="rounded-bl-sm !py-2 text-[11px] text-ld-graphite">Mulai dari mana, ya?</Panel>
      </div>
      <div className="flex items-end gap-1.5 self-end">
        <div className="rounded-xl rounded-br-sm bg-ld-violet px-3 py-2 text-[11px] text-white shadow-ld-subtle-2">Kita susun rencananya.</div>
        <Avatar name="reza-firmansyah" />
      </div>
    </div>
  ),
};

const ProgramPreview: React.FC<{ id: ProgramId }> = ({ id }) => (
  <div aria-hidden="true" className="flex h-40 select-none items-center justify-center bg-ld-lilac px-4">
    {PREVIEWS[id]}
  </div>
);

export default ProgramPreview;
