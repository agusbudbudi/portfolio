import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type { SimulatorProject } from '../../../types/qaSimulator';
import { QA_COURSE_LEVEL_LABEL } from '../../../types/qaCourse';
import { QaLibraryIcon, QaSimulatorIcon } from '../../../components/illustration/ProductIcons';
import type { CompletedCourse } from '../lib/completedCourses';

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ld-steel">{children}</h2>
);

interface CoursePortfolioViewProps {
  courses: CompletedCourse[];
  project: SimulatorProject;
  author: string;
  avatarUrl?: string;
  /** Switch the portfolio to its "QA Simulator" tab (mission results). */
  onShowSimulator: () => void;
}

/**
 * "QA Course" tab of the simulator portfolio: one completion record per
 * finished course that practiced on this project. Same document language as
 * the QA case study (PortfolioDocument), so the two tabs read as one file.
 */
const CoursePortfolioView: React.FC<CoursePortfolioViewProps> = ({ courses, project, author, avatarUrl, onShowSimulator }) => (
  <>
    {courses.map(({ record, lessons, finishedAt }, ci) => {
      const { course } = record;
      const articleCount = lessons.filter((l) => l.kind === 'article').length;
      const missionLessons = lessons.filter((l) => l.kind === 'mission');
      const missionPhaseIds = new Set(missionLessons.map((l) => (l.item.kind === 'mission' ? l.item.phaseId : '')));
      const competencies = project.phases.filter((p) => missionPhaseIds.has(p.id)).flatMap((p) => p.learn.objectives);
      const meta = [
        { label: 'Level', value: QA_COURSE_LEVEL_LABEL[course.level] },
        { label: 'Modul', value: `${course.modules.length} modul` },
        { label: 'Materi', value: `${articleCount} artikel` },
        { label: 'Misi praktik', value: `${missionLessons.length} misi · ${project.product}` },
        { label: 'Lulus', value: formatDate(finishedAt) },
      ];

      return (
        <section key={course.id} className={ci > 0 ? 'pf-chapter mt-14 print:mt-0' : ''}>
          <div className="pf-avoid">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-ld-frost">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-ld-slate">
                <img src="/shared/img/mentor-logo-96.webp" alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain" />
                Mentor.QA · QA Course
              </span>
              <span className="font-ld-mono text-[11px] uppercase tracking-[0.18em] text-ld-violet">Course Completion</span>
            </div>

            <div className="pt-8 flex flex-col-reverse sm:flex-row sm:items-start gap-6 justify-between">
              <div className="min-w-0 max-w-[560px]">
                <h1 className="m-0 text-3xl sm:text-[34px] font-semibold text-ld-onyx tracking-[-0.02em] leading-[1.15]">{course.title}</h1>
                <p className="m-0 mt-3 text-[15px] text-ld-slate leading-relaxed">{course.description}</p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <p className="m-0 inline-flex items-center gap-1.5 text-2xl font-semibold text-emerald-600 leading-none">
                  <CheckCircle2 size={22} /> Lulus
                </p>
                <p className="m-0 mt-1.5 text-[11px] text-ld-steel">{lessons.length}/{lessons.length} lesson selesai</p>
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
                <p className="m-0 text-xs text-ld-steel">Peserta QA Course</p>
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
          </div>

          <section className="mt-10">
            <Eyebrow>Kurikulum yang diselesaikan</Eyebrow>
            <ol className="m-0 p-0 list-none flex flex-col gap-6">
              {course.modules.map((mod, mi) => (
                <li key={mod.id} className="pf-avoid">
                  <p className="m-0 flex items-baseline gap-3 pb-2 border-b border-ld-frost">
                    <span className="text-xl font-semibold text-ld-violet/40 tabular-nums leading-none">{String(mi + 1).padStart(2, '0')}</span>
                    <span className="text-[15px] font-semibold text-ld-onyx">{mod.title}</span>
                  </p>
                  <ul className="m-0 mt-2 p-0 list-none">
                    {lessons.filter((l) => l.moduleIndex === mi).map((lesson) => (
                      <li key={lesson.item.id} className="flex items-center gap-3 py-2">
                        {lesson.kind === 'article' ? <QaLibraryIcon size={24} className="shrink-0" /> : <QaSimulatorIcon size={24} className="shrink-0" />}
                        <span className="flex-1 min-w-0 text-[13px] text-ld-graphite">
                          {lesson.title}
                          {lesson.kind === 'mission' && (
                            <button
                              type="button"
                              onClick={onShowSimulator}
                              className="print:hidden ml-2 inline-flex items-center gap-1 text-[12px] text-ld-violet bg-transparent border-none p-0 cursor-pointer hover:underline"
                            >
                              Lihat hasil kerja <ArrowRight size={12} />
                            </button>
                          )}
                        </span>
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" aria-label="Selesai" />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>

          {competencies.length > 0 && (
            <section className="pf-avoid mt-10">
              <Eyebrow>Kompetensi yang dipraktikkan</Eyebrow>
              <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {competencies.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-[13px] text-ld-graphite leading-snug">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" /> {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="pf-avoid mt-12 pt-4 border-t border-ld-frost text-[11px] text-ld-fog leading-relaxed m-0">
            Disusun otomatis dari progress QA Course di Mentor.QA: materi QA Library yang diselesaikan dan misi praktik di QA Simulator ({project.product}).
            Hasil kerja misi ada di tab QA Simulator.
          </p>
        </section>
      );
    })}
  </>
);

export default CoursePortfolioView;
