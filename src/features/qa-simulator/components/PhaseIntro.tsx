import React, { useState } from 'react';
import { SIM_CARD } from '../lib/ui';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronDown, ExternalLink, GraduationCap, MessageSquare, PlayCircle } from 'lucide-react';
import type { SimulatorPhase, SimulatorTeamMember } from '../../../types/qaSimulator';
import Markdown from './Markdown';
import Collapse from './Collapse';
import NumberedTable from './NumberedTable';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import SandboxIllustration from './SandboxIllustration';
import SquareAvatar from './SquareAvatar';
import { splitBriefBubbles } from '../lib/phaseIntro';

interface BriefCardProps {
  phase: SimulatorPhase;
  team: SimulatorTeamMember[];
  /** Re-open the animated intro popup. */
  onReplay?: () => void;
}

// Collapsible chat transcript of the phase brief — the animated version
// plays once in PhaseIntroModal; this is the "scroll back in the channel" view.
export const BriefCard: React.FC<BriefCardProps> = ({ phase, team, onReplay }) => {
  const [open, setOpen] = useState(false);
  const from = team.find((m) => m.id === phase.brief.fromId) ?? team[0];
  const bubbles = splitBriefBubbles(phase.brief.message);
  const preview = bubbles[0]?.replace(/[*_`#>]/g, '') ?? '';

  return (
    <div className={SIM_CARD}>
      <div className="flex items-center gap-3 px-4 md:px-5 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center gap-3 bg-transparent border-none cursor-pointer text-left p-0"
        >
          {from && <SquareAvatar initials={from.initials} color={from.color} src={from.avatar} title={`${from.name} · ${from.role}`} />}
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm">
              <span className="text-[15px] font-bold text-ld-onyx truncate">{from?.name}</span>
              <span className="px-1 rounded bg-ld-frost text-[10px] font-medium text-ld-slate truncate hidden sm:inline">{from?.role}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-ld-lilac text-ld-violet text-[10px] font-semibold shrink-0">
                <MessageSquare size={10} /> {bubbles.length} pesan
              </span>
            </span>
            <Collapse open={!open}>
              <span className="block text-xs text-ld-slate truncate mt-0.5">{preview}</span>
            </Collapse>
          </span>
          <ChevronDown size={18} className={`text-ld-fog shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <Collapse open={open} className="pb-4 pt-2 border-t border-ld-frost/60">
          <div>
            {bubbles.map((b, i) => (
              <div key={i} className="pl-16 md:pl-17 pr-4 md:pr-5 py-1 hover:bg-ld-cloud transition-colors">
                <Markdown className="text-[15px] text-ld-graphite">{b}</Markdown>
              </div>
            ))}
          </div>
          {onReplay && (
            <div className="pl-16 md:pl-17 pr-4 mt-2">
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex items-center gap-1.5 px-0 bg-transparent border-none cursor-pointer text-xs font-medium text-ld-violet hover:underline"
              >
                <PlayCircle size={13} /> Putar ulang intro phase
              </button>
            </div>
          )}
      </Collapse>
    </div>
  );
};

export const LearnCard: React.FC<{ phase: SimulatorPhase; defaultOpen: boolean }> = ({ phase, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={SIM_CARD}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 md:px-6 py-4 bg-transparent border-none cursor-pointer text-left"
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 text-amber-500 shrink-0">
          <GraduationCap size={17} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-semibold text-ld-onyx">Materi: {phase.title}</span>
          <span className="block text-xs text-ld-fog">{phase.learn.keyPoints.length} poin penting · baca sebelum mengerjakan</span>
        </span>
        <ChevronDown size={18} className={`text-ld-fog transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <Collapse open={open} className="px-4 md:px-6 pb-5 space-y-4 border-t border-ld-frost/60 pt-4">
          <div>
            <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-ld-graphite">Setelah phase ini kamu bisa</p>
            <NumberedTable label="Kemampuan" items={phase.learn.objectives} />
          </div>
          <div className="grid grid-cols-1 gap-3">
            {phase.learn.keyPoints.map((kp) => (
              <div key={kp.title} className="border-l-2 border-ld-violet bg-ld-cloud/60 px-4 py-3">
                <p className="m-0 mb-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-ld-onyx">
                  <BookOpen size={14} className="text-ld-violet" /> {kp.title}
                </p>
                <Markdown className="text-ld-slate">{kp.body}</Markdown>
              </div>
            ))}
          </div>
          {phase.learn.resources && phase.learn.resources.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {phase.learn.resources.map((r) => (
                <Link key={r.url} to={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite no-underline hover:border-ld-violet hover:text-ld-violet transition-colors">
                  <ExternalLink size={12} /> {r.label}
                </Link>
              ))}
            </div>
          )}
      </Collapse>
    </div>
  );
};

// Dark "tool" banner linking to the buggy staging app for the phase. Midnight
// surface + white mosaic + animated bug-hunt art (docs/DESIGN.md → Mentor.QA
// Adaptations). Illustration hides below md so the copy keeps its room.
export const SandboxCard: React.FC<{
  sandbox: NonNullable<SimulatorPhase['sandbox']>;
  design?: SimulatorPhase['design'];
}> = ({ sandbox, design }) => (
  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-ld-midnight to-[#1f3a5f] text-white">
    <PixelMosaic variant="white" className="absolute -top-2 right-4 opacity-60" style={{ width: 'min(40%, 220px)' }} />
    <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-4 p-5 md:p-6">
      <div className="min-w-0">
        <p className="m-0 text-base md:text-lg font-semibold leading-snug">{design ? 'File desain & environment staging' : 'Environment staging'}</p>
        {design && <p className="m-0 mt-1 text-sm text-white/75 leading-relaxed max-w-xl">{design.description}</p>}
        <p className="m-0 mt-1 text-sm text-white/75 leading-relaxed max-w-xl">{sandbox.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {design && (
            <a
              href={design.path}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white text-ld-onyx text-sm font-semibold no-underline hover:bg-ld-lilac transition-colors"
            >
              {design.label} <ExternalLink size={14} />
            </a>
          )}
          <a
            href={sandbox.path}
            target="_blank"
            rel="noreferrer"
            className={design
              ? 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-white/60 text-white text-sm font-semibold no-underline hover:bg-white/10 transition-colors'
              : 'inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-white text-ld-onyx text-sm font-semibold no-underline hover:bg-ld-lilac transition-colors'}
          >
            {sandbox.label} <ExternalLink size={14} />
          </a>
        </div>
      </div>
      <SandboxIllustration className="hidden md:block w-[220px] h-auto -my-8" />
    </div>
  </div>
);
