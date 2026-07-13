import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Building2, Award, Calendar, Clock, MessageCircle } from 'lucide-react';
import { useConfig } from '../../../hooks/useConfig';
import Seo from '../../../components/common/Seo';
import LoadingState from '../../../components/common/LoadingState';
import NotFoundState from '../../../components/common/NotFoundState';
import SectionHeading from '../../../components/common/SectionHeading';
import { EMPLOYMENT_TYPE_LABEL, formatMonth } from '../../../lib/portfolioFormat';

const dayLabelMap: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const mentorPlatforms = [
  { key: 'digitalSkola' as const, name: 'Digital Skola', logo: '/admin/img/logo-digitalskola.webp' },
  { key: 'dealls' as const, name: 'Dealls', logo: '/admin/img/logo-dealls.webp' },
];

const MentorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { config, loading, error, retry } = useConfig();

  if (loading) {
    return <LoadingState className="min-h-[60vh] pt-16" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 font-ld-sans">
        <div className="text-center">
          <p className="text-ld-slate text-sm mb-4">{error}</p>
          <button
            onClick={retry}
            className="px-5 py-2.5 rounded-lg bg-ld-violet text-white text-sm font-medium cursor-pointer border-none hover:bg-[#1f87e6] transition-colors"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const mentor = config?.mentors.find((m) => m.id === slug);

  if (!mentor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 font-ld-sans">
        <NotFoundState
          illustrationLabel="?"
          title="Mentor tidak ditemukan"
          description="Mentor yang kamu cari tidak tersedia atau sudah dipindahkan."
          actionTo="/#mentor"
          actionLabel="Kembali ke Semua Mentor"
          actionIcon={<ArrowLeft size={16} />}
        />
      </div>
    );
  }

  const topicLabelMap = Object.fromEntries((config?.topics ?? []).map((t) => [t.id, t.label]));
  const scheduleDays = dayOrder.filter((day) => (mentor.schedule[day] ?? []).length > 0);
  const activePlatforms = mentorPlatforms.filter((p) => mentor.platforms?.[p.key]);
  const workExperience = mentor.workExperience ?? [];

  return (
    <div className="font-ld-sans pb-12">
      <Seo
        path={`/mentor/${mentor.id}`}
        title={`${mentor.name} - Mentor QA | Agus Budiman`}
        description={mentor.bio}
      />

      {/* Profile Header — full-width band flush under the fixed navbar */}
      <div className="relative w-full bg-ld-violet pt-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-6">
              <div className="relative w-[140px] min-w-[140px] aspect-square">
                <img
                  src={mentor.avatar || '/admin/img/default-avatar-mentor.webp'}
                  alt={mentor.name}
                  width={140}
                  height={140}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover rounded-2xl border-[4px] border-ld-canvas shadow-ld-subtle-3"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="font-ld-display font-semibold text-3xl sm:text-5xl tracking-[-0.02em] text-white m-0 leading-tight">
                  {mentor.name}
                </h1>
                <p className="text-sm sm:text-base font-medium text-white/90 m-0 max-w-xl">{mentor.bio}</p>
                {mentor.verificationStatus === 'verified' && (
                  <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-lg bg-white border-2 border-blue-600 shadow-[3px_3px_0_0_#2563eb]">
                    <BadgeCheck size={18} className="text-blue-500" fill="currentColor" stroke="white" />
                    <span className="text-xs font-medium text-ld-graphite">Verified by</span>
                    <img src="/shared/img/mentor-logo.webp" alt="Mentor.QA" width={14} height={14} loading="lazy" decoding="async" className="w-3.5 h-3.5 object-contain" />
                    <span className="text-xs font-semibold text-ld-graphite">Mentor<span className="text-ld-violet">.QA</span></span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0">
              <Link
                to="/mentoring/booking"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white text-ld-violet text-sm font-medium no-underline hover:bg-white/90 transition-colors"
              >
                <Calendar size={15} /> Book Session
              </Link>
              <a
                href={`https://api.whatsapp.com/send?phone=${mentor.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium no-underline hover:bg-white/20 backdrop-blur-md transition-colors"
              >
                <MessageCircle size={16} /> Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Di — line banner */}
      {activePlatforms.length > 0 && (
        <div className="w-full bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-1.5 flex items-center flex-wrap gap-x-2.5 gap-y-1">
            <p className="text-xs font-medium text-blue-700 m-0">
              <span className="font-bold">{mentor.name}</span> juga aktif mentoring di platform
            </p>
            <div className="flex items-center gap-2.5">
              {activePlatforms.map((p) => (
                <img
                  key={p.key}
                  src={p.logo}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="h-5 w-auto object-contain"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16">
        <div className="lg:col-span-3 flex flex-col gap-10">
          {mentor.detailProfile && (
            <section>
              <SectionHeading
                icon={<Award size={20} />}
                iconClassName="bg-blue-500/10 text-blue-500"
                title="Tentang Mentor"
                subtitle="Latar belakang dan pengalaman mentor."
              />
              <p className="text-base text-ld-slate leading-relaxed whitespace-pre-line">{mentor.detailProfile}</p>
            </section>
          )}

          <section>
            <SectionHeading
              icon={<Clock size={20} />}
              iconClassName="bg-amber-500/10 text-amber-500"
              title="Jadwal Tersedia"
              subtitle="Slot waktu yang bisa dipilih untuk sesi mentoring."
            />
            {scheduleDays.length > 0 ? (
              <div className="rounded-xl border border-ld-ash divide-y divide-ld-ash overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-2 bg-ld-cloud/60">
                  <span className="w-14 flex-shrink-0 text-[11px] font-semibold text-ld-graphite uppercase tracking-wide">Hari</span>
                  <span className="text-[11px] font-semibold text-ld-graphite uppercase tracking-wide">Jam Tersedia</span>
                </div>
                {scheduleDays.map((day) => (
                  <div key={day} className="flex items-center gap-3 px-3.5 py-2.5 bg-ld-canvas">
                    <span className="w-14 flex-shrink-0 text-sm text-ld-slate">{dayLabelMap[day]}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.schedule[day].map((time) => (
                        <span
                          key={time}
                          className="px-2.5 py-1 rounded-md bg-ld-cloud text-ld-graphite text-xs font-medium tabular-nums"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ld-slate italic px-3.5 py-2.5 rounded-xl border border-ld-ash bg-ld-canvas">
                Belum ada jadwal yang tersedia
              </p>
            )}
          </section>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-10">
          <section>
            <SectionHeading
              icon={<Award size={20} />}
              iconClassName="bg-emerald-500/10 text-emerald-600"
              title="Area Keahlian"
              subtitle="Topik yang dikuasai oleh mentor ini."
            />
            <div className="flex flex-wrap gap-1.5">
              {mentor.expertise.map((id) => (
                <span key={id} className="px-2.5 py-1 rounded-lg border border-ld-ash text-ld-graphite text-xs font-medium">
                  {topicLabelMap[id] ?? id}
                </span>
              ))}
            </div>
          </section>

          {workExperience.length > 0 && (
            <section>
              <SectionHeading
                icon={<Building2 size={20} />}
                iconClassName="bg-ld-violet/10 text-ld-violet"
                title="Pernah Bekerja Di"
                subtitle="Perusahaan tempat mentor pernah berkontribusi."
              />
              <div className="flex flex-col gap-3">
                {workExperience.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-xl border border-ld-ash bg-ld-canvas p-3.5 transition-shadow hover:shadow-ld-subtle-3"
                  >
                    <div className={`w-10 h-10 min-w-10 flex items-center justify-center rounded-lg overflow-hidden ${entry.companyLogo ? 'bg-ld-canvas' : 'bg-ld-violet'}`}>
                      {entry.companyLogo ? (
                        <img src={entry.companyLogo} alt={entry.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                      ) : (
                        <Building2 size={16} className="text-white" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{entry.company}</h4>
                      <p className="text-xs text-ld-violet font-medium m-0">{entry.position}</p>
                      <span className="text-[11px] text-ld-fog">
                        {entry.employmentType && `${EMPLOYMENT_TYPE_LABEL[entry.employmentType]} · `}
                        {formatMonth(entry.startDate)} — {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default MentorDetailPage;
