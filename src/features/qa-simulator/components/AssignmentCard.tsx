import React, { useState } from 'react';
import { SIM_CARD } from '../lib/ui';
import { AnimatePresence } from 'framer-motion';
import { CheckCircle2, ClipboardCheck, KeyRound, Pencil, RotateCcw, Send } from 'lucide-react';
import type { AssignmentProgress, SimulatorAssignment } from '../../../types/qaSimulator';
import StatusBadge from '../../admin/components/shared/StatusBadge';
import { blankAssignment, rubricScore, submitBlocker } from '../lib/progress';
import AssignmentInput from './AssignmentInput';
import Markdown from './Markdown';
import NumberedTable from './NumberedTable';
import SelfAssessmentModal, { type AssessmentStep } from './SelfAssessmentModal';

interface AssignmentCardProps {
  number: number;
  assignment: SimulatorAssignment;
  progress: AssignmentProgress | undefined;
  onUpdate: (updater: (prev: AssignmentProgress) => AssignmentProgress) => void;
  /** Briefly ring the card (resume / "continue where you left off"). */
  highlight?: boolean;
}

const SECONDARY_BTN =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer transition-colors';

const scoreTone = (pct: number) => (pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500');

const AssignmentCard: React.FC<AssignmentCardProps> = ({ number, assignment, progress, onUpdate, highlight }) => {
  const current = progress ?? blankAssignment();
  const submitted = current.status === 'submitted';
  const blocker = submitBlocker(assignment.input, current.content);
  const score = rubricScore(assignment, current.checkedRubric);
  const [assessStep, setAssessStep] = useState<AssessmentStep | null>(null);
  const [triedSubmit, setTriedSubmit] = useState(false);

  const handleSubmit = () => {
    setTriedSubmit(true);
    if (blocker) return;
    // A fresh submission needs a fresh assessment; keep old ticks as a starting point.
    onUpdate((prev) => ({ ...prev, status: 'submitted', submittedAt: new Date().toISOString(), assessedAt: undefined }));
    setAssessStep({ kind: 'intro' });
  };

  const setRubric = (id: string, met: boolean) =>
    onUpdate((prev) => {
      const rest = prev.checkedRubric.filter((r) => r !== id);
      return { ...prev, checkedRubric: met ? [...rest, id] : rest };
    });

  return (
    <section
      id={`task-${assignment.id}`}
      className={`${SIM_CARD} scroll-mt-32 transition-shadow duration-500 ${highlight ? 'ring-2 ring-ld-violet ring-offset-2' : ''}`}
      aria-labelledby={`assignment-${assignment.id}`}
    >
      <div className="flex items-start gap-3 px-4 md:px-6 py-4 border-b border-ld-frost/60">
        <span className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 ${submitted ? 'bg-emerald-50 text-emerald-600' : 'bg-ld-lilac text-ld-violet'}`}>
          {submitted ? <CheckCircle2 size={15} /> : number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-widest text-ld-fog">Tugas {number}</p>
          <h3 id={`assignment-${assignment.id}`} className="m-0 text-sm md:text-base font-semibold text-ld-onyx leading-snug">{assignment.title}</h3>
        </div>
        {submitted ? <StatusBadge tone="emerald">Submitted</StatusBadge> : <StatusBadge tone="slate">Draft</StatusBadge>}
      </div>

      <div className="p-4 md:p-6 space-y-5">
        <Markdown>{assignment.instructions}</Markdown>

        <div>
          <p className="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-ld-graphite">Hasil yang diharapkan</p>
          <NumberedTable label="Output" items={assignment.expectedOutput} />
        </div>

        <AssignmentInput
          spec={assignment.input}
          content={current.content}
          disabled={submitted}
          onChange={(content) => onUpdate((prev) => ({ ...prev, content }))}
        />

        {!submitted ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <p className={`m-0 text-xs ${triedSubmit && blocker ? 'text-red-500' : 'text-ld-fog'}`}>
              {blocker ?? 'Siap di-submit. Setelah submit kamu akan menilai hasilmu sendiri dengan rubric.'}
            </p>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none transition-colors shrink-0"
            >
              <Send size={14} /> Submit tugas
            </button>
          </div>
        ) : (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onUpdate((prev) => ({ ...prev, status: 'draft' }))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer transition-colors"
            >
              <Pencil size={13} /> Edit jawaban
            </button>
          </div>
        )}

        {submitted && (
          current.assessedAt ? (
            <div className="rounded-lg border border-ld-frost bg-ld-cloud/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-center shrink-0 w-16">
                  <p className={`m-0 text-2xl font-semibold tabular-nums ${scoreTone(score.percent)}`}>{score.percent}%</p>
                  <p className="m-0 text-[10px] text-ld-fog tabular-nums">{score.score}/{score.max} poin</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 inline-flex items-center gap-1.5 text-sm font-semibold text-ld-onyx">
                    <ClipboardCheck size={15} className="text-ld-violet" /> Self-assessment selesai
                  </p>
                  <div className="mt-1.5 flex gap-1" aria-hidden="true">
                    {assignment.rubric.map((r) => (
                      <span key={r.id} title={r.label} className={`h-1.5 flex-1 rounded-full ${current.checkedRubric.includes(r.id) ? 'bg-emerald-400' : 'bg-red-200'}`} />
                    ))}
                  </div>
                  <p className="m-0 mt-1 text-[11px] text-ld-slate">
                    {assignment.rubric.filter((r) => current.checkedRubric.includes(r.id)).length} dari {assignment.rubric.length} kriteria terpenuhi
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => setAssessStep({ kind: 'rubric', i: 0 })} className={SECONDARY_BTN}>
                  <RotateCcw size={13} /> Nilai ulang
                </button>
                {assignment.answerKey && (
                  <button type="button" onClick={() => setAssessStep({ kind: 'key' })} className={SECONDARY_BTN}>
                    <KeyRound size={13} className="text-amber-500" /> Kunci jawaban
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-semibold text-amber-800">Belum dinilai</p>
                <p className="m-0 mt-0.5 text-xs text-amber-700">Nilai hasilmu sendiri dengan {assignment.rubric.length} kriteria, lalu buka kunci jawaban.</p>
              </div>
              <button
                type="button"
                onClick={() => setAssessStep({ kind: 'rubric', i: 0 })}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium border-none cursor-pointer transition-colors shrink-0"
              >
                <ClipboardCheck size={14} /> Mulai self-assessment
              </button>
            </div>
          )
        )}

        <AnimatePresence>
          {assessStep && (
            <SelfAssessmentModal
              assignment={assignment}
              checkedRubric={current.checkedRubric}
              previouslyAssessed={!!current.assessedAt}
              initialStep={assessStep}
              onSetRubric={setRubric}
              onAssessed={() => onUpdate((prev) => ({ ...prev, assessedAt: new Date().toISOString() }))}
              onClose={() => setAssessStep(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AssignmentCard;
