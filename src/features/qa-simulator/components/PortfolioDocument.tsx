import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Seo from '../../../components/common/Seo';
import type {
  AssignmentProgress, ProjectProgress, SimulatorAssignment, SimulatorField, SimulatorInputSpec, SimulatorProject,
} from '../../../types/qaSimulator';
import { rubricScore } from '../lib/progress';
import { summarizePortfolio } from '../lib/portfolioSummary';
import Markdown from './Markdown';
import TeamAvatar from './TeamAvatar';

type ListSpec = Extract<SimulatorInputSpec, { type: 'list' }>;

const DIFFICULTY_LABEL = { beginner: 'Pemula', intermediate: 'Menengah', advanced: 'Lanjutan' } as const;

// A4 print setup. "Download PDF" uses the browser's print → Save as PDF, which
// keeps text selectable and sharp. The document is laid out at ~830px CSS
// width and scaled to the printable area with `zoom`, so screen and PDF share
// one layout. Page margin boxes add a running footer with page numbers.
const printCss = (footerLeft: string) => `
@page {
  size: A4;
  margin: 16mm 14mm 18mm;
  @bottom-left { content: "${footerLeft.replace(/"/g, "'")}"; font: 8pt Inter, sans-serif; color: #a4abb8; }
  @bottom-right { content: "Hal. " counter(page) " / " counter(pages); font: 8pt Inter, sans-serif; color: #a4abb8; }
}
@media print {
  html, body { background: #fff !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pf-doc { zoom: 0.82; }
  .pf-doc thead { display: table-header-group; }
  .pf-doc tr, .pf-doc article, .pf-avoid { break-inside: avoid; }
  .pf-doc h2, .pf-doc h3, .pf-keep { break-after: avoid; }
  .pf-chapter { break-before: page; }
}
`;

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const val = (item: Record<string, string>, f: SimulatorField) => (item[f.id] ?? '').trim();

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ld-steel">{children}</h2>
);

// ≤4 fields read best as a table (gaps, scenarios); richer items (test cases,
// bugs) as cards so long steps/expected results stay readable.
const ListAnswer: React.FC<{ spec: ListSpec; items: Record<string, string>[] }> = ({ spec, items }) => {
  if (items.length === 0) return <p className="m-0 text-sm italic text-ld-fog">Tidak ada isian.</p>;

  if (spec.fields.length <= 4) {
    return (
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-left border-b-2 border-ld-graphite">
              <th className="py-2 pr-3 font-semibold text-ld-onyx w-8">#</th>
              {spec.fields.map((f) => <th key={f.id} className="py-2 pr-3 font-semibold text-ld-onyx">{f.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-ld-frost align-top">
                <td className="py-2.5 pr-3 text-ld-fog font-ld-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                {spec.fields.map((f) => (
                  <td key={f.id} className={`py-2.5 pr-3 text-ld-graphite whitespace-pre-wrap leading-relaxed ${f.type === 'select' ? 'min-w-[90px]' : ''}`}>
                    {val(item, f) || <span className="text-ld-mist">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const titleField = spec.fields.find((f) => f.type === 'text');
  const chipFields = spec.fields.filter((f) => f.type === 'select');
  const bodyFields = spec.fields.filter((f) => f !== titleField && f.type !== 'select');

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <article key={i} className="rounded-lg border border-ld-frost">
          <header className="px-4 py-3 border-b border-ld-frost">
            <p className="m-0 text-sm font-semibold text-ld-onyx">
              <span className="font-ld-mono text-[11px] font-semibold text-ld-violet mr-2">
                {spec.itemLabel.toUpperCase().replace(/\s+/g, '-')}-{String(i + 1).padStart(2, '0')}
              </span>
              {titleField ? val(item, titleField) : null}
            </p>
            {chipFields.some((f) => val(item, f)) && (
              <p className="m-0 mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ld-slate">
                {chipFields.filter((f) => val(item, f)).map((f) => (
                  <span key={f.id}>{f.label}: <strong className="font-semibold text-ld-graphite">{val(item, f)}</strong></span>
                ))}
              </p>
            )}
          </header>
          <dl className="m-0 px-4 py-3 grid grid-cols-1 sm:grid-cols-[150px_1fr] gap-x-4 gap-y-2 text-[13px]">
            {bodyFields.filter((f) => val(item, f)).map((f) => (
              <React.Fragment key={f.id}>
                <dt className="font-medium text-ld-steel">{f.label}</dt>
                <dd className="m-0 text-ld-graphite whitespace-pre-wrap break-words leading-relaxed">
                  {f.type === 'url' ? <a href={val(item, f)} className="text-ld-violet break-all" rel="noopener noreferrer nofollow">{val(item, f)}</a> : val(item, f)}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
};

const AssignmentAnswer: React.FC<{ assignment: SimulatorAssignment; progress: AssignmentProgress }> = ({ assignment, progress }) => {
  const spec = assignment.input;
  const { content } = progress;
  if (spec.type === 'textarea') {
    return (
      <div className="pf-avoid border-l-2 border-ld-violet pl-4 text-sm text-ld-graphite leading-relaxed whitespace-pre-wrap">
        {content.text}
      </div>
    );
  }
  if (spec.type === 'link') {
    return <a href={content.url} className="text-sm text-ld-violet break-all" rel="noopener noreferrer nofollow">{content.url}</a>;
  }
  return <ListAnswer spec={spec} items={content.items ?? []} />;
};

interface PortfolioDocumentProps {
  project: SimulatorProject;
  progress: ProjectProgress;
  author: string;
  avatarUrl?: string;
  /** Screen-only page actions, right side of the tab bar (e.g. Download PDF). */
  toolbar?: React.ReactNode;
  seoPath: string;
  /**
   * "QA Course" tab content (finished courses on this project). When given,
   * the page gets QA Course | QA Simulator tabs and opens on QA Course; when
   * absent, the page is the plain case study, no tabs.
   */
  courseView?: (showSimulator: () => void) => React.ReactNode;
  /** Screen-only strip above the document (owner's share banner). */
  banner?: React.ReactNode;
}

type DocTab = 'course' | 'simulator';

/** The QA case-study document, shared by the owner page and the public share page. */
const PortfolioDocument: React.FC<PortfolioDocumentProps> = ({ project, progress, author, avatarUrl, toolbar, seoPath, courseView, banner }) => {
  const [tab, setTab] = useState<DocTab>('course');
  const activeTab: DocTab = courseView ? tab : 'simulator';
  const tabs: readonly DocTab[] = courseView ? ['course', 'simulator'] : ['simulator'];
  const showSimulator = () => { setTab('simulator'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const { phases, overall, phaseScores, stats, startedAt, finishedAt } = summarizePortfolio(project, progress);
  const competencies = phases.flatMap((p) => p.learn.objectives);

  const meta = [
    { label: 'Peran', value: 'QA Engineer' },
    { label: 'Produk', value: project.product },
    { label: 'Domain', value: project.domain },
    { label: 'Periode', value: startedAt === finishedAt ? formatDate(finishedAt) : `${formatDate(startedAt)} – ${formatDate(finishedAt)}` },
    { label: 'Level', value: `${DIFFICULTY_LABEL[project.difficulty]} · ±${project.estimatedHours} jam` },
  ];

  return (
    <div className="font-ld-sans bg-ld-cloud print:bg-white pb-16 print:pb-0">
      <Seo path={seoPath} title={`Portfolio QA — ${project.title}`} description={project.summary} noindex />
      <style>{printCss(`${author} · QA Case Study · ${project.product}`)}</style>

      {/* Screen-only bar: underline tabs on the left (QA Course appears only
          when a course is finished), page actions on the right. */}
      <div className="print:hidden bg-white border-b border-ld-frost">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-3">
          <div role="tablist" aria-label="Jenis portfolio" className="flex items-stretch gap-6 self-stretch">
            {tabs.map((id, i) => {
              const selected = activeTab === id;
              return (
                <button
                  key={id}
                  id={`pf-tab-${id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="pf-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={(e) => {
                    // WAI-ARIA tabs: arrows move between tabs (and focus them).
                    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                    e.preventDefault();
                    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
                    setTab(next);
                    document.getElementById(`pf-tab-${next}`)?.focus();
                  }}
                  className={`relative py-4 bg-transparent border-none cursor-pointer text-sm font-medium transition-colors ${
                    selected ? 'text-ld-onyx' : 'text-ld-slate hover:text-ld-violet'
                  }`}
                >
                  {id === 'course' ? 'QA Course' : 'QA Simulator'}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-ld-violet transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}
                  />
                </button>
              );
            })}
          </div>
          {toolbar && <div className="flex flex-wrap items-center gap-2 py-3">{toolbar}</div>}
        </div>
      </div>

      <main className="pf-doc max-w-[900px] mx-auto px-4 sm:px-6 pt-8 print:p-0 print:max-w-none">
        {banner}
        <div
          id="pf-tabpanel"
          role="tabpanel"
          aria-labelledby={`pf-tab-${activeTab}`}
          className="bg-white rounded-lg border border-ld-frost print:border-0 print:rounded-none px-6 sm:px-12 py-10 sm:py-12 print:p-0"
        >
          {activeTab === 'course' && courseView ? courseView(showSimulator) : (
          <>
          {/* ── Overview (page 1) ── */}
          <section className="pf-avoid">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-ld-frost">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-ld-slate">
                <img src="/shared/img/mentor-logo-96.webp" alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain" />
                Mentor.QA · QA Simulator
              </span>
              <span className="font-ld-mono text-[11px] uppercase tracking-[0.18em] text-ld-violet">QA Case Study</span>
            </div>

            <div className="pt-8 flex flex-col-reverse sm:flex-row sm:items-start gap-6 justify-between">
              <div className="min-w-0 max-w-[560px]">
                <h1 className="m-0 text-3xl sm:text-[34px] font-semibold text-ld-onyx tracking-[-0.02em] leading-[1.15]">{project.title}</h1>
                <p className="m-0 mt-3 text-[15px] text-ld-slate leading-relaxed">{project.summary}</p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="m-0 text-4xl font-semibold text-ld-violet tabular-nums leading-none">{overall}%</p>
                <p className="m-0 mt-1 text-[11px] text-ld-steel">Skor self-assessment</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="w-10 h-10 rounded-full bg-ld-violet text-white flex items-center justify-center font-semibold">{author.charAt(0).toUpperCase()}</span>
              )}
              <div>
                <p className="m-0 text-sm font-semibold text-ld-onyx">{author}</p>
                <p className="m-0 text-xs text-ld-steel">QA Engineer · Squad {project.product}</p>
              </div>
            </div>

            <dl className="m-0 mt-6 grid grid-cols-2 sm:grid-cols-5 border-y border-ld-frost">
              {meta.map((m, i) => (
                <div key={m.label} className={`py-3 pr-3 ${i > 0 ? 'sm:pl-4 sm:border-l sm:border-ld-frost' : ''}`}>
                  <dt className="text-[10px] font-semibold uppercase tracking-widest text-ld-fog">{m.label}</dt>
                  <dd className="m-0 mt-1 text-xs font-medium text-ld-graphite">{m.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-ld-frost px-4 py-3">
                  <p className="m-0 text-2xl font-semibold text-ld-onyx tabular-nums leading-none">{s.count}</p>
                  <p className="m-0 mt-1.5 text-[11px] text-ld-steel">{s.label} ditulis</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pf-avoid mt-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="sm:col-span-2">
              <Eyebrow>Konteks project</Eyebrow>
              <Markdown className="text-[13px]">{project.context}</Markdown>
            </div>
            <div>
              <Eyebrow>Tim</Eyebrow>
              <ul className="m-0 p-0 list-none space-y-2.5">
                {project.team.map((m) => (
                  <li key={m.id} className="flex items-center gap-2.5">
                    <TeamAvatar member={m} size="sm" />
                    <span className="text-xs"><span className="block font-medium text-ld-onyx">{m.name}</span><span className="text-ld-fog">{m.role}</span></span>
                  </li>
                ))}
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-ld-violet text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">{author.charAt(0).toUpperCase()}</span>
                  <span className="text-xs"><span className="block font-medium text-ld-onyx">{author}</span><span className="text-ld-fog">QA Engineer</span></span>
                </li>
              </ul>
            </div>
          </section>

          <section className="pf-avoid mt-10">
            <Eyebrow>Kompetensi yang ditunjukkan</Eyebrow>
            <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              {competencies.map((c) => (
                <li key={c} className="flex items-start gap-2 text-[13px] text-ld-graphite leading-snug">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {c}
                </li>
              ))}
            </ul>
          </section>

          {/* ── One chapter per phase ── */}
          {phases.map((phase, pi) => (
            <section key={phase.id} className="pf-chapter mt-14 print:mt-0">
              <div className="pf-keep flex items-start justify-between gap-6 pb-4 mb-6 border-b border-ld-onyx">
                <div className="flex items-start gap-4 min-w-0">
                  <span className="text-4xl font-semibold text-ld-violet/40 leading-none tabular-nums">{String(pi + 1).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <h2 className="m-0 text-2xl font-semibold text-ld-onyx tracking-[-0.01em] leading-tight">{phase.title}</h2>
                    <p className="m-0 mt-1.5 text-[13px] text-ld-slate leading-relaxed">{phase.summary}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="m-0 text-xl font-semibold text-ld-onyx tabular-nums leading-none">{phaseScores[pi]}%</p>
                  <p className="m-0 mt-1 text-[10px] text-ld-fog">Skor phase</p>
                </div>
              </div>

              <div className="space-y-9">
                {phase.assignments.map((a, ai) => {
                  const ap = progress.assignments[a.id];
                  if (!ap) return null;
                  const s = rubricScore(a, ap.checkedRubric);
                  return (
                    <div key={a.id}>
                      <div className="pf-keep flex items-baseline justify-between gap-3 mb-3">
                        <h3 className="m-0 text-[15px] font-semibold text-ld-onyx">
                          <span className="text-ld-fog font-normal mr-1.5">{pi + 1}.{ai + 1}</span> {a.title}
                        </h3>
                        <span className="text-[11px] text-ld-fog shrink-0 tabular-nums">
                          {ap.assessedAt ? `Self-assessment ${s.percent}%` : 'Belum dinilai'}
                        </span>
                      </div>
                      <AssignmentAnswer assignment={a} progress={ap} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <p className="pf-avoid mt-12 pt-4 border-t border-ld-frost text-[11px] text-ld-fog leading-relaxed m-0">
            Disusun otomatis dari hasil simulasi kerja QA di QA Simulator · Mentor.QA Labs. Studi kasus fiktif berbasis produk {project.product}
            {project.productUrl ? ` (${project.productUrl.replace(/^https?:\/\//, '')})` : ''}.
          </p>
          </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PortfolioDocument;
