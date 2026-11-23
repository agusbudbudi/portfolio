import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { AlertCircle, ChevronDown, Lock, User, X } from 'lucide-react';
import type { SimulatorField, SimulatorInputSpec } from '../../../types/qaSimulator';
import FieldControl from './FieldControl';

type ListSpec = Extract<SimulatorInputSpec, { type: 'list' }>;

interface JiraBugModalProps {
  spec: ListSpec;
  draft: Record<string, string>;
  onField: (id: string, value: string) => void;
  showErrors: boolean;
  missingCount: number;
  isNew: boolean;
  readOnly: boolean;
  displayNumber: number;
  fieldsRef: React.RefObject<HTMLDivElement | null>;
  requestClose: () => void;
  onClose: () => void;
  save: (addAnother: boolean) => void;
}

// Jira look-alike for the bug-report form, so filing a bug in the simulator
// feels like filing one at work: "Create issue" dialog for new bugs, issue
// detail view (main column + Details sidebar) for existing ones.
// Colours follow Atlassian's design tokens (text #172B4D, subtle #44546F,
// brand #0C66E4, danger #C9372C); radius bumped to 6px to match the Labs UI).

const PROJECTS: Record<string, { name: string; key: string; color: string }> = {
  splitbill: { name: 'SplitBill', key: 'SB', color: '#22a06b' },
  ewallet: { name: 'DompetKu', key: 'DK', color: '#6e5dc6' },
};

const J_INPUT =
  'w-full rounded-md border border-ld-ash bg-white px-2 py-1.5 text-sm text-[#172b4d] placeholder:text-ld-fog focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac disabled:bg-ld-cloud disabled:border-ld-frost disabled:text-ld-slate';
const J_INVALID = 'border-red-400 focus:border-red-400 focus:ring-red-100';
const J_LABEL = 'block mb-1 text-xs font-semibold text-[#44546f]';
const J_BTN_SUBTLE = 'px-3 py-1.5 rounded-md bg-transparent hover:bg-[#091e420f] text-sm font-medium text-[#44546f] border-none cursor-pointer';
const J_BTN_PRIMARY = 'px-3 py-1.5 rounded-md bg-[#0c66e4] hover:bg-[#0055cc] text-sm font-medium text-white border-none cursor-pointer';

const BugIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
    <rect width="16" height="16" rx="3" fill="#e2483d" />
    <circle cx="8" cy="8" r="3.5" fill="#fff" />
  </svg>
);

const ProjectAvatar: React.FC<{ color: string; label: string; size?: number }> = ({ color, label, size = 20 }) => (
  <span
    className="inline-flex items-center justify-center rounded-md text-white font-bold shrink-0"
    style={{ width: size, height: size, background: color, fontSize: size * 0.45 }}
    aria-hidden="true"
  >
    {label.charAt(0)}
  </span>
);

const PRIORITY_ICON: Record<string, React.ReactNode> = {
  P1: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 9l5-5 5 5M3 13l5-5 5 5" fill="none" stroke="#c9372c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  P2: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10l5-5 5 5" fill="none" stroke="#e56910" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  P3: <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="#1d7afc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

const FieldError: React.FC = () => (
  <p className="m-0 mt-1 inline-flex items-center gap-1 text-xs text-[#ae2e24]">
    <AlertCircle size={12} /> Wajib diisi.
  </p>
);

const JiraBugModal: React.FC<JiraBugModalProps> = ({
  spec, draft, onField, showErrors, missingCount, isNew, readOnly, displayNumber, fieldsRef, requestClose, onClose, save,
}) => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const project = PROJECTS[projectId] ?? { name: projectId || 'QA Project', key: (projectId || 'QA').slice(0, 2).toUpperCase(), color: '#1d7afc' };
  const issueKey = `${project.key}-${displayNumber}`;
  const [createAnother, setCreateAnother] = useState(false);
  const summaryRef = useRef<HTMLTextAreaElement>(null);

  const summaryField = spec.fields.find((f) => f.id === 'title') ?? spec.fields.find((f) => f.type === 'text');
  const summaryValue = summaryField ? draft[summaryField.id] ?? '' : '';
  // Summary grows with its text up to 2 lines (2 × 32px line + 8px padding +
  // 4px border), then scrolls.
  useLayoutEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight + 4, 2 * 32 + 8 + 4)}px`;
  }, [summaryValue, isNew]);
  const rest = spec.fields.filter((f) => f !== summaryField);
  const mainFields = rest.filter((f) => f.type !== 'select');
  const detailFields = rest.filter((f) => f.type === 'select');
  const invalid = (f: SimulatorField) => showErrors && !!f.required && !(draft[f.id] ?? '').trim();
  const idOf = (f: SimulatorField) => `jira-${projectId}-${f.id}`;

  const label = (f: SimulatorField) => (
    <label htmlFor={idOf(f)} className={J_LABEL}>
      {f.label}{f.required && <span className="text-[#c9372c]"> *</span>}
    </label>
  );
  const control = (f: SimulatorField, extra?: Partial<React.ComponentProps<typeof FieldControl>>) => (
    <FieldControl
      field={f}
      inputId={idOf(f)}
      value={draft[f.id] ?? ''}
      disabled={readOnly}
      invalid={invalid(f)}
      onChange={(v) => onField(f.id, v)}
      baseClass={J_INPUT}
      invalidClass={J_INVALID}
      {...extra}
    />
  );

  const errorSummary = showErrors && missingCount > 0 && (
    <span className="inline-flex items-center gap-1 text-xs text-[#ae2e24]">
      <AlertCircle size={13} /> Lengkapi {missingCount} field wajib dulu.
    </span>
  );

  return (
    <motion.div
      className="fixed inset-0 z-[1100] flex items-end sm:items-start justify-center bg-[#091e427d] sm:pt-[6vh] sm:px-4 font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="jira-modal-title"
        className={`w-full ${isNew ? 'sm:max-w-[600px]' : 'sm:max-w-[960px]'} h-dvh sm:h-auto sm:max-h-[88vh] flex flex-col bg-white text-[#172b4d] sm:rounded-lg pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 overflow-hidden shadow-[0_8px_12px_#091e4226,0_0_1px_#091e424f]`}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 12, opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onSubmit={(e) => { e.preventDefault(); if (!readOnly) save(isNew && createAnother); }}
      >
        {isNew ? (
          <>
            {/* Create issue */}
            <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-3">
              <h3 id="jira-modal-title" className="m-0 text-xl font-medium">Create issue</h3>
              <button type="button" onClick={requestClose} aria-label="Tutup" className={`${J_BTN_SUBTLE} !p-1.5`}><X size={18} /></button>
            </div>

            <div ref={fieldsRef} className="flex-1 min-h-0 overflow-y-auto px-6 pb-5 space-y-4">
              <p className="m-0 text-xs text-[#44546f]">Required fields are marked with an asterisk <span className="text-[#c9372c]">*</span></p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className={J_LABEL}>Project <span className="text-[#c9372c]">*</span></span>
                  <div className={`${J_INPUT} flex items-center gap-2 !bg-ld-cloud !border-ld-frost cursor-default`}>
                    <ProjectAvatar color={project.color} label={project.name} size={18} />
                    <span className="truncate">{project.name} ({project.key})</span>
                    <Lock size={12} className="ml-auto text-[#626f86]" />
                  </div>
                </div>
                <div>
                  <span className={J_LABEL}>Issue type <span className="text-[#c9372c]">*</span></span>
                  <div className={`${J_INPUT} flex items-center gap-2 !bg-ld-cloud !border-ld-frost cursor-default`}>
                    <BugIcon /> Bug
                    <Lock size={12} className="ml-auto text-[#626f86]" />
                  </div>
                </div>
              </div>

              <hr className="m-0 border-0 border-t border-ld-frost" />

              {spec.fields.map((f) => (
                <div key={f.id}>
                  {label(f)}
                  {control(f, f.type === 'textarea' ? { textareaClass: 'min-h-[88px]' } : undefined)}
                  {invalid(f) && <FieldError />}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-ld-frost">
              <label className="inline-flex items-center gap-2 text-sm text-[#44546f] cursor-pointer select-none">
                <input type="checkbox" checked={createAnother} onChange={(e) => setCreateAnother(e.target.checked)} className="w-4 h-4 accent-[#0c66e4]" />
                Create another
              </label>
              <div className="flex items-center gap-2 ml-auto">
                {errorSummary}
                <button type="button" onClick={requestClose} className={J_BTN_SUBTLE}>Cancel</button>
                <button type="submit" className={J_BTN_PRIMARY}>Create</button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Issue view */}
            <div className="flex items-center justify-between gap-3 px-6 py-3">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#44546f] min-w-0">
                <ProjectAvatar color={project.color} label={project.name} size={16} />
                <span className="truncate">{project.name}</span>
                <span className="text-[#8590a2]">/</span>
                <BugIcon size={14} />
                <span id="jira-modal-title" className="font-medium text-[#44546f]">{issueKey}</span>
              </nav>
              <button type="button" onClick={requestClose} aria-label="Tutup" className={`${J_BTN_SUBTLE} !p-1.5`}><X size={18} /></button>
            </div>

            <div ref={fieldsRef} className="flex-1 min-h-0 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-x-8 gap-y-6 px-6 pb-6">
                {/* main column */}
                <div className="min-w-0 space-y-5">
                  {summaryField && (
                    <div>
                      <label htmlFor={idOf(summaryField)} className="sr-only">{summaryField.label}</label>
                      <textarea
                        ref={summaryRef}
                        id={idOf(summaryField)}
                        rows={1}
                        value={draft[summaryField.id] ?? ''}
                        disabled={readOnly}
                        placeholder={summaryField.placeholder ?? 'Summary'}
                        // Single-line field that wraps visually: no newlines.
                        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                        onChange={(e) => onField(summaryField.id, e.target.value.replace(/\s*\n\s*/g, ' '))}
                        className={`block w-full -ml-2 px-2 py-1 rounded-md border-2 bg-transparent text-2xl leading-8 font-medium resize-none overflow-y-auto text-[#172b4d] placeholder:text-[#8590a2] focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac disabled:text-[#172b4d] ${
                          invalid(summaryField) ? 'border-red-400' : 'border-transparent hover:bg-[#f1f2f4] focus:bg-white disabled:hover:bg-transparent'
                        }`}
                      />
                      {invalid(summaryField) && <FieldError />}
                    </div>
                  )}

                  {mainFields.map((f) => (
                    <section key={f.id}>
                      <h4 className="m-0 mb-1.5 text-sm font-semibold text-[#172b4d]">
                        <label htmlFor={idOf(f)}>{f.label}{f.required && <span className="text-[#c9372c]"> *</span>}</label>
                      </h4>
                      {control(f, f.type === 'textarea' ? { textareaClass: 'min-h-[96px]' } : undefined)}
                      {invalid(f) && <FieldError />}
                    </section>
                  ))}
                </div>

                {/* sidebar */}
                <aside className="space-y-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#091e420f] text-sm font-medium text-[#44546f]">
                    To Do <ChevronDown size={14} />
                  </span>

                  <div className="rounded-md border border-ld-frost">
                    <p className="m-0 px-3 py-2.5 border-b border-ld-frost text-sm font-semibold">Details</p>
                    <dl className="m-0 px-3 py-3 grid grid-cols-[96px_minmax(0,1fr)] gap-x-3 gap-y-3 items-center text-sm">
                      <dt className="text-xs font-semibold text-[#44546f]">Assignee</dt>
                      <dd className="m-0 flex items-center gap-2 text-[#44546f]">
                        <span className="w-6 h-6 rounded-full bg-ld-frost text-ld-steel flex items-center justify-center shrink-0" aria-hidden="true"><User size={14} /></span> Unassigned
                      </dd>
                      <dt className="text-xs font-semibold text-[#44546f]">Reporter</dt>
                      <dd className="m-0 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0c66e4] text-white text-[10px] font-bold flex items-center justify-center shrink-0" aria-hidden="true">QA</span> Kamu
                      </dd>
                      {detailFields.map((f) => (
                        <React.Fragment key={f.id}>
                          <dt className="text-xs font-semibold text-[#44546f] self-start pt-2">
                            <label htmlFor={idOf(f)}>{f.label}{f.required && <span className="text-[#c9372c]"> *</span>}</label>
                          </dt>
                          <dd className="m-0 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {f.id === 'priority' && PRIORITY_ICON[draft[f.id] ?? '']}
                              <div className="flex-1 min-w-0">{control(f)}</div>
                            </div>
                            {invalid(f) && <FieldError />}
                          </dd>
                        </React.Fragment>
                      ))}
                    </dl>
                  </div>
                </aside>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 px-6 py-3 border-t border-ld-frost">
              {readOnly ? (
                <>
                  <span className="mr-auto text-xs text-[#44546f]">Tugas sudah disubmit. Klik "Edit jawaban" di kartu tugas untuk mengubah.</span>
                  <button type="button" onClick={onClose} className={J_BTN_SUBTLE}>Close</button>
                </>
              ) : (
                <>
                  <span className="mr-auto">{errorSummary}</span>
                  <button type="button" onClick={requestClose} className={J_BTN_SUBTLE}>Cancel</button>
                  <button type="submit" className={J_BTN_PRIMARY}>Save</button>
                </>
              )}
            </div>
          </>
        )}
      </motion.form>
    </motion.div>
  );
};

export default JiraBugModal;
