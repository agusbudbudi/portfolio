import React from 'react';
import { Check, Lock, LogIn } from 'lucide-react';
import type { SimulatorPhase } from '../../../types/qaSimulator';
import type { PhaseState } from '../lib/progress';

interface PhaseStepperProps {
  phases: SimulatorPhase[];
  states: PhaseState[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const PhaseStepper: React.FC<PhaseStepperProps> = ({ phases, states, activeIndex, onSelect }) => (
  <ol className="m-0 p-0 list-none flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" aria-label="Phase">
    {phases.map((phase, i) => {
      const state = states[i];
      const active = i === activeIndex;
      const disabled = state === 'locked';
      return (
        <li key={phase.id} className="flex-1 min-w-[150px]">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(i)}
            aria-current={active ? 'step' : undefined}
            className={`w-full h-full flex items-center gap-3 px-3 py-3 rounded-lg border text-left transition-colors ${
              active
                ? 'bg-white border-ld-violet shadow-[0_0_0_3px_rgba(59,158,255,0.12)]'
                : disabled
                  ? 'bg-ld-cloud/60 border-ld-frost cursor-not-allowed'
                  : 'bg-white border-ld-frost hover:border-ld-ash cursor-pointer'
            }`}
          >
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                state === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : active
                    ? 'bg-ld-violet text-white'
                    : disabled
                      ? 'bg-ld-frost text-ld-fog'
                      : 'bg-ld-lilac text-ld-violet'
              }`}
            >
              {state === 'completed' ? <Check size={15} /> : state === 'locked' ? <Lock size={13} /> : state === 'login-required' ? <LogIn size={13} /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-ld-fog">Phase {i + 1}</span>
              <span className={`block text-sm font-semibold truncate ${disabled ? 'text-ld-fog' : 'text-ld-onyx'}`}>{phase.shortTitle}</span>
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

export default PhaseStepper;
