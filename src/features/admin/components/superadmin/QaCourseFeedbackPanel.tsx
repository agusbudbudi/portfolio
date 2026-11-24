import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import LoadingState from '../../../../components/common/LoadingState';
import Select from '../../../../components/common/Select';
import { useAdminAuthStore } from '../../../../store/useAdminAuthStore';
import { apiGetFeedbackResults, apiGetQaCourseAdmin, apiGetQaCourseLearners, type FeedbackResults } from '../../../../lib/adminApi';
import type { QaCourseDetail, QaCourseLearner } from '../../../../types/qaCourse';
import type { ProjectProgress, SimulatorProject } from '../../../../types/qaSimulator';
import { FEEDBACK_TYPE_LABEL, type FeedbackQuestionPublic, type FeedbackResponseRow } from '../../../../types/feedback';
import { fetchSimulatorProject } from '../../../qa-simulator/lib/simulatorApi';
import { buildCheckpoints, buildLessons } from '../../../qa-course/lib/courseOutline';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY, ADMIN_BTN_SECONDARY } from '../shared/adminCard';
import StatusBadge from '../shared/StatusBadge';
import Checkbox from '../../../../components/common/Checkbox';

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; course: QaCourseDetail; results: FeedbackResults; passedBy: Record<string, number> }
  | { status: 'error'; message: string };

interface CheckpointOption { id: string; label: string }

/** Select value for the overview of every checkpoint (the default). */
const ALL = '__all';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const pct = (n: number, total: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

/** Median fill time of submitted responses that recorded one, or null. */
function medianDuration(rows: FeedbackResponseRow[]): number | null {
  const ms = rows.filter((r) => r.status === 'submitted' && typeof r.durationMs === 'number').map((r) => r.durationMs!).sort((a, b) => a - b);
  if (ms.length === 0) return null;
  const mid = Math.floor(ms.length / 2);
  return ms.length % 2 ? ms[mid] : (ms[mid - 1] + ms[mid]) / 2;
}

/** 75000 → "1m 15d" (menit, detik). */
function formatDuration(ms: number | null): string {
  if (ms === null) return '-';
  const sec = Math.round(ms / 1000);
  return sec < 60 ? `${sec}d` : `${Math.floor(sec / 60)}m ${sec % 60}d`;
}

/** PRD target: median fill time under 90 seconds. */
const DURATION_HINT = 'median, target < 1m 30d';

const Stat: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-ld-frost px-4 py-3">
    <p className="m-0 text-[11px] font-medium uppercase tracking-widest text-ld-fog">{label}</p>
    <p className="m-0 mt-1 text-2xl font-semibold text-ld-onyx tabular-nums leading-none">{value}</p>
    {hint && <p className="m-0 mt-1 text-[11px] text-ld-steel">{hint}</p>}
  </div>
);

const Bars: React.FC<{ rows: { label: string; count: number }[]; total: number }> = ({ rows, total }) => {
  const top = Math.max(0, ...rows.map((r) => r.count));
  return (
    <div className="grid grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto] gap-x-3 gap-y-2.5 items-center">
      {rows.map((r) => (
        <React.Fragment key={r.label}>
          <span className="text-[13px] text-ld-graphite truncate" title={r.label}>{r.label}</span>
          <span className="h-2 rounded-full bg-ld-frost overflow-hidden" aria-hidden="true">
            <span className={`block h-full rounded-full ${r.count === top && top > 0 ? 'bg-ld-violet' : 'bg-ld-lavender'}`} style={{ width: `${pct(r.count, total)}%` }} />
          </span>
          <span className="text-xs text-ld-slate tabular-nums text-right whitespace-nowrap">{r.count} · {pct(r.count, total)}%</span>
        </React.Fragment>
      ))}
    </div>
  );
};

/** CSV of every response in the course, one row per learner per checkpoint. */
function toCsv(course: QaCourseDetail, rows: FeedbackResponseRow[], labels: Record<string, string>, hideNames: boolean): string {
  const questions = new Map<string, FeedbackQuestionPublic>();
  for (const r of rows) for (const q of r.snapshot) if (!questions.has(q.id)) questions.set(q.id, q);
  const optionLabel = (q: FeedbackQuestionPublic, id: string) => q.config.options?.find((o) => o.id === id)?.label ?? id;
  const cell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = ['Checkpoint', 'Peserta', 'Status', 'Tanggal', 'Waktu isi (detik)', ...[...questions.values()].map((q) => q.prompt)];
  const lines = rows.map((r) => [
    labels[r.checkpointId] ?? 'Checkpoint dihapus',
    hideNames ? r.userKey : r.userName,
    r.status,
    r.updatedAt,
    typeof r.durationMs === 'number' ? Math.round(r.durationMs / 1000) : '',
    ...[...questions.values()].map((q) => {
      const v = r.answers[q.id];
      if (v === undefined) return '';
      if (Array.isArray(v)) return v.map((id) => optionLabel(q, id)).join('; ');
      if (typeof v === 'string' && (q.type === 'scale' || q.type === 'single_choice')) return optionLabel(q, v);
      if (typeof v === 'boolean') return v ? 'ya' : 'tidak';
      return v;
    }),
  ].map(cell).join(','));
  return [`# ${course.title}`, header.map(cell).join(','), ...lines].join('\n');
}

/**
 * Admin "Feedback" view for one course: per checkpoint, how many learners
 * reached it, answered or skipped, and what they said. "Reached" is derived
 * here from each learner's progress (mission completion needs the static
 * simulator JSON the API can't read), same as the Peserta panel.
 */
/** `onClose` adds a back arrow; omitted when shown as a tab of the course detail page. */
const QaCourseFeedbackPanel: React.FC<{ slug: string; onClose?: () => void }> = ({ slug, onClose }) => {
  const token = useAdminAuthStore((s) => s.token);
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [checkpointId, setCheckpointId] = useState('');
  const [hideNames, setHideNames] = useState(false);
  const [textQuestionId, setTextQuestionId] = useState('');
  const [testimonialOnly, setTestimonialOnly] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [course, { learners }, results] = await Promise.all([
          apiGetQaCourseAdmin(slug, token),
          apiGetQaCourseLearners(slug, token),
          apiGetFeedbackResults(slug, token),
        ]);
        const projectIds = [...new Set(course.modules.flatMap((m) => m.items).flatMap((i) => (i.kind === 'mission' ? [i.projectId] : [])))];
        const projects = await Promise.all(projectIds.map((id) => fetchSimulatorProject(id).catch(() => null)));
        const projectMap: Record<string, SimulatorProject> = Object.fromEntries(projects.filter((p): p is SimulatorProject => Boolean(p)).map((p) => [p.id, p]));
        // Reached = every lesson before the checkpoint done (flows here include drafts).
        const withFlows = { ...course, feedbackFlows: results.flows };
        const passedBy: Record<string, number> = {};
        learners.forEach((learner: QaCourseLearner) => {
          const lessons = buildLessons({
            course: withFlows, projects: projectMap, simulatorProgress: learner.simulator as Record<string, ProjectProgress>,
            completedArticleIds: new Set(learner.completedArticleIds), loggedIn: true,
          });
          for (const cp of buildCheckpoints(withFlows, lessons, {})) if (cp.reached) passedBy[cp.item.id] = (passedBy[cp.item.id] ?? 0) + 1;
        });
        if (!cancelled) setState({ status: 'ready', course: withFlows, results, passedBy });
      } catch (e) {
        if (!cancelled) setState({ status: 'error', message: e instanceof Error ? e.message : 'Gagal memuat feedback.' });
      }
    })();
    return () => { cancelled = true; };
  }, [slug, token]);

  const options: CheckpointOption[] = useMemo(() => {
    if (state.status !== 'ready') return [];
    const out: CheckpointOption[] = [];
    state.course.modules.forEach((mod, mi) => {
      const lessonCount = mod.items.filter((i) => i.kind !== 'feedback').length;
      let seen = 0;
      mod.items.forEach((item) => {
        if (item.kind !== 'feedback') { seen += 1; return; }
        const where = seen === 0 ? 'awal' : seen === lessonCount ? 'akhir' : 'tengah';
        const flow = state.results.flows[item.flowId];
        out.push({ id: item.id, label: `Modul ${mi + 1} · ${where} · ${flow?.title ?? 'flow dihapus'}` });
      });
    });
    const orphan = [...new Set(state.results.responses.map((r) => r.checkpointId))].filter((id) => !out.some((o) => o.id === id));
    orphan.forEach((id) => out.push({ id, label: 'Checkpoint yang sudah dihapus' }));
    return out;
  }, [state]);

  const header = (
    <div className={`${ADMIN_CARD_HEADER} justify-between flex-wrap`}>
      <div className="flex items-center gap-3">
        {onClose && (
          <button type="button" onClick={onClose} className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors" aria-label="Kembali ke daftar course">
            <ArrowLeft size={17} />
          </button>
        )}
        <div>
          <h2 className="text-sm font-semibold text-ld-onyx m-0">Feedback{onClose && state.status === 'ready' ? `: ${state.course.title}` : ''}</h2>
          <p className="text-xs text-ld-fog m-0 mt-0.5">Response rate = terkirim dibagi peserta yang sudah sampai di checkpoint.</p>
        </div>
      </div>
      {state.status === 'ready' && state.results.responses.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Checkbox checked={hideNames} onChange={setHideNames} size="sm" align="center" labelClassName="text-[13px] text-ld-graphite whitespace-nowrap">Sembunyikan nama</Checkbox>
          <button
            type="button"
            onClick={() => {
              const labels = Object.fromEntries(options.map((o) => [o.id, o.label]));
              const blob = new Blob([toCsv(state.course, state.results.responses, labels, hideNames)], { type: 'text/csv;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `feedback-${state.course.slug}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className={`${ADMIN_BTN_SECONDARY} inline-flex items-center gap-1.5`}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      )}
    </div>
  );

  if (state.status !== 'ready') {
    return (
      <div className={ADMIN_CARD}>
        {header}
        <div className={ADMIN_CARD_BODY}>
          {state.status === 'loading' ? <LoadingState label="Memuat feedback…" /> : <p className="m-0 text-sm text-red-600">{state.message}</p>}
        </div>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className={ADMIN_CARD}>
        {header}
        <div className={ADMIN_CARD_BODY}>
          <p className="m-0 text-sm text-ld-slate">Course ini belum punya checkpoint feedback. Tambahkan lewat tab Detail, tombol + Feedback di modul.</p>
        </div>
      </div>
    );
  }

  const all = state.results.responses;
  const selectOptions = [{ value: ALL, label: 'Semua checkpoint' }, ...options.map((o) => ({ value: o.id, label: o.label }))];
  const picker = (value: string) => (
    <label className="block max-w-md">
      <span className="block text-xs font-medium text-ld-graphite mb-1.5">Checkpoint</span>
      <Select value={value} onChange={setCheckpointId} options={selectOptions} className="w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx" aria-label="Pilih checkpoint" />
    </label>
  );

  if (!options.some((o) => o.id === checkpointId)) {
    // Overview: one row per checkpoint in course order; a row opens its detail.
    const summaries = options.map((o) => {
      const cpRows = all.filter((r) => r.checkpointId === o.id);
      const sent = cpRows.filter((r) => r.status === 'submitted');
      const ratingId = sent[0]?.snapshot.find((q) => q.type === 'rating')?.id;
      const ratings = ratingId ? sent.map((r) => r.answers[ratingId]).filter((v): v is number => typeof v === 'number') : [];
      return {
        ...o,
        passed: Math.max(state.passedBy[o.id] ?? 0, cpRows.length),
        submitted: sent.length,
        skipped: cpRows.length - sent.length,
        rating: ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
        duration: medianDuration(cpRows),
      };
    });
    const sum = (k: 'passed' | 'submitted' | 'skipped') => summaries.reduce((n, x) => n + x[k], 0);
    const th = 'px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap';
    const td = 'px-4 py-3 text-[13px] text-ld-slate tabular-nums whitespace-nowrap';
    return (
      <div className={ADMIN_CARD}>
        {header}
        <div className={`${ADMIN_CARD_BODY} flex flex-col gap-5`}>
          {picker(ALL)}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Stat label="Checkpoint" value={String(summaries.length)} />
            <Stat label="Terkirim" value={String(sum('submitted'))} hint="semua checkpoint" />
            <Stat label="Dilewati" value={String(sum('skipped'))} hint="termasuk 3x Nanti saja" />
            <Stat label="Response rate" value={`${pct(sum('submitted'), sum('passed'))}%`} hint="terkirim / melewati, gabungan" />
            <Stat label="Waktu isi" value={formatDuration(medianDuration(all))} hint={DURATION_HINT} />
          </div>
          <div className="overflow-x-auto border border-ld-frost rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ld-cloud text-left">
                  <th className={th}>Checkpoint</th>
                  <th className={`${th} text-right`}>Melewati</th>
                  <th className={`${th} text-right`}>Terkirim</th>
                  <th className={`${th} text-right`}>Dilewati</th>
                  <th className={`${th} text-right`}>Response rate</th>
                  <th className={`${th} text-right`}>Waktu isi</th>
                  <th className={`${th} text-right`}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((x) => (
                  <tr key={x.id} className="border-t border-ld-frost bg-white hover:bg-ld-cloud/50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setCheckpointId(x.id)}
                        className="text-left text-sm font-medium text-ld-onyx hover:text-ld-violet hover:underline cursor-pointer border-none bg-transparent p-0"
                      >
                        {x.label}
                      </button>
                    </td>
                    <td className={`${td} text-right`}>{x.passed}</td>
                    <td className={`${td} text-right`}>{x.submitted}</td>
                    <td className={`${td} text-right`}>{x.skipped}</td>
                    <td className={`${td} text-right`}>{pct(x.submitted, x.passed)}%</td>
                    <td className={`${td} text-right`}>{formatDuration(x.duration)}</td>
                    <td className={`${td} text-right`}>{x.rating === null ? '-' : `${x.rating.toFixed(1)} dari 5`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="m-0 text-xs text-ld-steel">Klik nama checkpoint untuk melihat distribusi jawaban dan isian.</p>
        </div>
      </div>
    );
  }

  const activeId = checkpointId;
  const rows = all.filter((r) => r.checkpointId === activeId);
  const submitted = rows.filter((r) => r.status === 'submitted');
  const skipped = rows.length - submitted.length;
  const passed = Math.max(state.passedBy[activeId] ?? 0, rows.length);
  // Questions as the newest answer saw them; else the current flow.
  const item = state.course.modules.flatMap((m) => m.items).find((i) => i.id === activeId);
  const flowQuestions = item?.kind === 'feedback' ? state.results.flows[item.flowId]?.questions ?? [] : [];
  const questions: FeedbackQuestionPublic[] = submitted[0]?.snapshot ?? flowQuestions;
  const textQuestions = questions.filter((q) => q.type === 'text');
  const activeTextId = textQuestions.some((q) => q.id === textQuestionId) ? textQuestionId : textQuestions[0]?.id ?? '';
  const consentId = state.results.consentQuestionId;
  const ratingQ = questions.find((q) => q.type === 'rating');
  const name = (r: FeedbackResponseRow) => (hideNames ? `Peserta ${r.userKey.replace('learner-', '')}` : r.userName);

  /** Average scale level of a question at another checkpoint (bank questions are shared). */
  const otherAverages = (q: FeedbackQuestionPublic) => options.filter((o) => o.id !== activeId).flatMap((o) => {
    const levels = all.filter((r) => r.checkpointId === o.id && r.status === 'submitted' && typeof r.answers[q.id] === 'string')
      .map((r) => (q.config.options ?? []).findIndex((x) => x.id === r.answers[q.id]) + 1).filter((n) => n > 0);
    return levels.length ? [{ label: o.label, avg: levels.reduce((a, b) => a + b, 0) / levels.length, n: levels.length }] : [];
  });

  return (
    <div className={ADMIN_CARD}>
      {header}
      <div className={`${ADMIN_CARD_BODY} flex flex-col gap-5`}>
        {picker(activeId)}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Stat label="Melewati" value={String(passed)} hint="peserta sampai di checkpoint" />
          <Stat label="Terkirim" value={String(submitted.length)} />
          <Stat label="Dilewati" value={String(skipped)} hint="termasuk 3x Nanti saja" />
          <Stat label="Response rate" value={`${pct(submitted.length, passed)}%`} />
          <Stat label="Waktu isi" value={formatDuration(medianDuration(rows))} hint={DURATION_HINT} />
        </div>

        {submitted.length === 0 ? (
          <p className="m-0 px-4 py-6 rounded-xl border border-dashed border-ld-ash text-center text-sm text-ld-steel">Belum ada feedback terkirim untuk checkpoint ini.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {questions.filter((q) => q.type !== 'text' && q.type !== 'consent').map((q) => {
              const answered = submitted.filter((r) => r.answers[q.id] !== undefined);
              let body: React.ReactNode;
              let summary: React.ReactNode = null;
              if (q.type === 'rating') {
                const values = answered.map((r) => r.answers[q.id] as number);
                const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
                summary = <p className="m-0 text-[13px] text-ld-slate">Rata-rata <strong className="text-ld-onyx">{avg.toFixed(1)} dari 5</strong> · {values.length} jawaban</p>;
                body = <Bars total={values.length} rows={[5, 4, 3, 2, 1].map((n) => ({ label: `${n} bintang`, count: values.filter((v) => v === n).length }))} />;
              } else {
                const opts = q.config.options ?? [];
                const count = (id: string) => answered.filter((r) => (Array.isArray(r.answers[q.id]) ? (r.answers[q.id] as string[]).includes(id) : r.answers[q.id] === id)).length;
                if (q.type === 'scale') {
                  const levels = answered.map((r) => opts.findIndex((o) => o.id === r.answers[q.id]) + 1).filter((n) => n > 0);
                  const avg = levels.reduce((a, b) => a + b, 0) / (levels.length || 1);
                  const others = otherAverages(q);
                  summary = (
                    <p className="m-0 text-[13px] text-ld-slate">
                      Rata-rata level <strong className="text-ld-onyx">{avg.toFixed(1)} dari {opts.length}</strong>
                      {others.map((o) => <span key={o.label}> · {o.label}: <strong className="text-ld-onyx">{o.avg.toFixed(1)}</strong></span>)}
                    </p>
                  );
                }
                body = <Bars total={answered.length} rows={opts.map((o) => ({ label: o.label, count: count(o.id) }))} />;
              }
              return (
                <section key={q.id} className={`rounded-xl border border-ld-frost px-5 py-4 flex flex-col gap-3 ${q.type === 'multi_choice' ? 'lg:col-span-2' : ''}`}>
                  <div className="flex justify-between gap-3 items-start">
                    <h3 className="m-0 text-sm font-semibold leading-snug text-ld-onyx">{q.prompt}</h3>
                    <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-ld-cloud text-[10px] font-semibold uppercase tracking-wide text-ld-slate">{FEEDBACK_TYPE_LABEL[q.type]}</span>
                  </div>
                  {summary}
                  {body}
                </section>
              );
            })}
          </div>
        )}

        {textQuestions.length > 0 && submitted.length > 0 && (
          <div>
            <div className="flex justify-between items-center gap-3 flex-wrap mb-2.5">
              <h3 className="m-0 text-sm font-semibold text-ld-onyx">Jawaban isian</h3>
              <div className="flex gap-3 flex-wrap items-center">
                {textQuestions.length > 1 && (
                  <Select value={activeTextId} onChange={setTextQuestionId} options={textQuestions.map((q) => ({ value: q.id, label: q.prompt }))} className="px-3 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx max-w-xs" aria-label="Pilih pertanyaan isian" />
                )}
                <Checkbox checked={testimonialOnly} onChange={setTestimonialOnly} size="sm" align="center" labelClassName="text-[13px] text-ld-graphite whitespace-nowrap">Hanya yang boleh jadi testimoni</Checkbox>
              </div>
            </div>
            <div className="overflow-x-auto border border-ld-frost rounded-xl">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ld-cloud text-left">
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Peserta</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel">Jawaban</th>
                    {ratingQ && <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Rating</th>}
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Testimoni</th>
                    <th className="px-4 py-3 text-xs font-medium text-ld-steel whitespace-nowrap">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {submitted
                    .filter((r) => typeof r.answers[activeTextId] === 'string' && (!testimonialOnly || r.answers[consentId] === true))
                    .map((r) => (
                      <tr key={r.userKey} className="border-t border-ld-frost bg-white align-top">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {r.avatarUrl && !hideNames
                              ? <img src={r.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover border border-ld-frost shrink-0" referrerPolicy="no-referrer" />
                              : <span className="w-7 h-7 rounded-full bg-ld-cloud border border-ld-frost shrink-0" />}
                            <span className="text-sm text-ld-onyx">{name(r)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm leading-relaxed text-ld-graphite min-w-[260px] whitespace-pre-line">{r.answers[activeTextId] as string}</td>
                        {ratingQ && <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">{typeof r.answers[ratingQ.id] === 'number' ? `${r.answers[ratingQ.id]} dari 5` : '-'}</td>}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.answers[consentId] === true ? <StatusBadge tone="violet">boleh</StatusBadge> : <StatusBadge tone="slate">internal</StatusBadge>}
                        </td>
                        <td className="px-4 py-3 text-xs text-ld-slate whitespace-nowrap">{formatDate(r.updatedAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QaCourseFeedbackPanel;
