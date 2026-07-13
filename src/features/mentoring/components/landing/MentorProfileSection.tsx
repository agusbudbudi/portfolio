import React, { useMemo } from 'react';
import { ArrowRight, Award, BadgeCheck, Building2, Clock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useConfig } from '../../../../hooks/useConfig';
import LoadingState from '../../../../components/common/LoadingState';

const mentorPlatforms = [
  { key: 'digitalSkola' as const, name: 'Digital Skola', logo: '/admin/img/logo-digitalskola.webp' },
  { key: 'dealls' as const, name: 'Dealls', logo: 'https://i.imgur.com/uRMmt6z.jpeg' },
];

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const weekend = ['saturday', 'sunday'];

function deriveSchedule(schedule: Record<string, string[]>) {
  const weekdaySlots = weekdays.flatMap(d => schedule[d] ?? []);
  const weekendSlots = weekend.flatMap(d => schedule[d] ?? []);

  const fmt = (slots: string[]) => {
    if (!slots.length) return null;
    const sorted = [...new Set(slots)].sort();
    return `${sorted[0]} – ${sorted[sorted.length - 1]} WIB`;
  };

  return { weekday: fmt(weekdaySlots), weekend: fmt(weekendSlots) };
}

const MentorProfileSection: React.FC = () => {
  const { config, loading } = useConfig();
  const mentors = config?.mentors ?? [];
  const navigate = useNavigate();

  const topicLabelMap = useMemo(
    () => Object.fromEntries((config?.topics ?? []).map(topic => [topic.id, topic.label])),
    [config]
  );

  return (
    <section id="mentor" className="py-8 md:py-20 bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-0 sm:px-6">
        <div className="text-center mb-8 sm:mb-14 sm:mb-14 px-4">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Belajar Langsung dari Praktisi
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Bukan instruktur generik. Mentor adalah QA Engineer aktif yang masih bekerja di industri.
          </p>
        </div>

        {loading && <LoadingState className="py-16" />}

        {!loading && mentors.length > 0 && (
          <div className={`flex gap-4 pt-2 pb-4 md:pt-0 md:pb-0 md:overflow-visible md:snap-none md:grid md:gap-6 ${mentors.length === 1
            ? 'justify-center px-4 sm:px-6 md:grid-cols-1 md:max-w-4xl md:mx-auto'
            : `overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none px-4 sm:px-6 scroll-pl-4 sm:scroll-pl-6 scroll-smooth md:px-0 ${mentors.length === 2
              ? 'md:grid-cols-2 md:max-w-4xl md:mx-auto'
              : 'md:grid-cols-2 lg:grid-cols-3'
            }`
            }`}>
            {mentors.map(mentor => {
              const sched = deriveSchedule(mentor.schedule);
              const workExperience = mentor.workExperience ?? [];
              const activePlatforms = mentorPlatforms.filter(p => mentor.platforms?.[p.key]);
              return (
                <div
                  key={mentor.id}
                  onClick={() => navigate(`/mentor/${mentor.id}`)}
                  className={`${mentors.length === 1
                    ? 'w-full max-w-sm sm:w-[320px]'
                    : 'flex-shrink-0 w-[85%] sm:w-[320px] snap-start'
                    } md:w-auto md:flex-shrink bg-ld-canvas rounded-2xl border border-ld-ash overflow-hidden flex flex-col cursor-pointer transition-shadow hover:shadow-[0_12px_28px_rgba(30,27,75,0.12)]`}
                >
                  <div className="bg-ld-onyx flex items-stretch gap-4 min-h-32 overflow-hidden">
                    <div className="w-32 flex-shrink-0 self-stretch overflow-hidden bg-white">
                      <img
                        src={mentor.avatar || '/admin/img/default-avatar-mentor.webp'}
                        alt={mentor.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-6 py-3 flex flex-col justify-center gap-1.5">
                      <div>
                        <h3 className="text-base font-ld-display font-semibold text-white mb-0.5 truncate">{mentor.name}</h3>
                        <p className="text-ld-fog text-xs leading-snug line-clamp-2">{mentor.bio}</p>
                      </div>
                      {mentor.verificationStatus === 'verified' && (
                        <div className="inline-flex items-center gap-1.5 w-fit px-2 py-1 rounded-lg bg-white border-2 border-blue-600 shadow-[2px_2px_0_0_#2563eb]">
                          <BadgeCheck size={13} className="text-blue-500" fill="currentColor" stroke="white" />
                          <span className="text-[10px] font-medium text-ld-graphite">Verified by</span>
                          <img src="/shared/img/mentor-logo.webp" alt="Mentor.QA" width={11} height={11} loading="lazy" decoding="async" className="w-[11px] h-[11px] object-contain" />
                          <span className="text-[10px] font-semibold text-ld-graphite">Mentor<span className="text-ld-violet">.QA</span></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {activePlatforms.length > 0 && (
                    <div className="w-full bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent">
                      <div className="px-6 py-1.5 flex items-center flex-wrap gap-x-2.5 gap-y-1">
                        <p className="text-xs font-medium text-blue-700 m-0">
                          Aktif mentoring di
                        </p>
                        <div className="flex items-center gap-2.5">
                          {activePlatforms.map(p => (
                            <img
                              key={p.key}
                              src={p.logo}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              className="h-4 w-auto object-contain"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex flex-col gap-5 flex-1 text-left">
                    {workExperience.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ld-lilac flex items-center justify-center flex-shrink-0">
                          <Building2 size={15} className="text-ld-violet" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-ld-graphite mb-2">
                            Pernah Bekerja Di
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5">
                            {workExperience.map(entry => (
                              <div
                                key={entry.id}
                                className={`h-8 px-1.5 min-w-8 rounded-lg overflow-hidden flex items-center justify-center ${entry.companyLogo ? '' : 'bg-ld-violet'}`}
                                title={entry.company}
                              >
                                {entry.companyLogo ? (
                                  <img
                                    src={entry.companyLogo}
                                    alt={entry.company}
                                    loading="lazy"
                                    decoding="async"
                                    className="h-full object-contain"
                                  />
                                ) : (
                                  <Building2 size={14} className="text-white" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3 border-t border-ld-ash pt-5">
                      <div className="w-8 h-8 rounded-lg bg-ld-lilac flex items-center justify-center flex-shrink-0">
                        <Award size={15} className="text-ld-violet" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ld-graphite mb-2">
                          Area Keahlian
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {mentor.expertise.slice(0, 4).map(id => (
                            <span
                              key={id}
                              className="px-2 py-0.5 rounded-lg border border-ld-ash text-ld-graphite text-[11px] font-medium"
                            >
                              {topicLabelMap[id] ?? id}
                            </span>
                          ))}
                          {mentor.expertise.length > 4 && (
                            <span className="px-2 py-0.5 rounded-lg border border-ld-ash text-ld-fog text-[11px] font-medium">
                              +{mentor.expertise.length - 4} lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border-t border-ld-ash pt-5">
                      <div className="w-8 h-8 rounded-lg bg-ld-lilac flex items-center justify-center flex-shrink-0">
                        <Clock size={15} className="text-ld-violet" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ld-graphite mb-2">
                          Jadwal Tersedia
                        </p>
                        {sched.weekday && (
                          <p className="text-sm text-ld-slate">
                            Weekday <span className="font-medium text-ld-graphite">{sched.weekday}</span>
                          </p>
                        )}
                        {sched.weekend && (
                          <p className="text-sm text-ld-slate">
                            Weekend <span className="font-medium text-ld-graphite">{sched.weekend}</span>
                          </p>
                        )}
                        {!sched.weekday && !sched.weekend && (
                          <p className="text-sm text-ld-slate italic">Belum ada jadwal yang tersedia</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 px-6 pb-6 pt-1">
                    <Link
                      to={`/mentor/${mentor.id}`}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-ld-cloud text-ld-graphite border border-ld-ash font-medium rounded-lg text-xs no-underline hover:bg-ld-ash transition-colors"
                    >
                      <User size={12} />
                      Lihat Profile
                    </Link>
                    <Link
                      to="/mentoring/booking"
                      onClick={e => e.stopPropagation()}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-ld-violet text-white font-medium rounded-lg text-xs no-underline hover:bg-[#1f87e6] transition-colors"
                    >
                      Book Session
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MentorProfileSection;
