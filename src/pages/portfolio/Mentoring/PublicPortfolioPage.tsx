import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Award, BadgeCheck, Briefcase, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Download, ExternalLink, GraduationCap,
  Github, ImageOff, Linkedin, Mail, MessageCircle, Newspaper, Quote, Rocket, User,
} from 'lucide-react';
import { usePortfolio } from '../../../hooks/usePortfolio';
import Seo from '../../../components/portfolio/common/Seo';
import LoadingState from '../../../components/portfolio/common/LoadingState';
import NotFoundState from '../../../components/portfolio/common/NotFoundState';
import type { EmploymentType, ToolConfig } from '../../../types/portfolio';

const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
};

function formatMonth(value?: string): string {
  if (!value) return '';
  const [year, month] = value.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

// Mirrors About.tsx's period-duration formatting, but off the structured
// YYYY-MM fields instead of a free-text "Mon YYYY - Mon YYYY" string.
function formatDuration(startDate: string, endDate: string | undefined, isCurrent: boolean): string | null {
  const [sy, sm] = startDate.split('-').map(Number);
  if (!sy || !sm) return null;

  const now = new Date();
  const [ey, em] = isCurrent ? [now.getFullYear(), now.getMonth() + 1] : (endDate ?? '').split('-').map(Number);
  if (!ey || !em) return null;

  const totalMonths = Math.max(1, (ey - sy) * 12 + (em - sm) + 1);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const yrs = `${years} thn`;
  const mos = `${months} bln`;

  if (years === 0) return mos;
  if (months === 0) return yrs;
  return `${yrs} ${mos}`;
}

const SectionHeading: React.FC<{ icon: React.ReactNode; iconClassName: string; title: React.ReactNode; subtitle: string }> = ({
  icon, iconClassName, title, subtitle,
}) => (
  <div className="flex items-start gap-4 mb-6">
    <div className={`w-10 h-10 min-w-10 rounded-lg flex items-center justify-center mt-1 ${iconClassName}`}>
      {icon}
    </div>
    <div>
      <h2 className="font-ld-display font-semibold text-2xl tracking-[-0.02em] text-ld-graphite mb-1">{title}</h2>
      <p className="text-sm text-ld-slate">{subtitle}</p>
    </div>
  </div>
);

const EndorsementCard: React.FC<{
  photo?: string; name: string; relation: string; message: string; linkedinUrl?: string;
}> = ({ photo, name, relation, message, linkedinUrl }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-8 flex flex-col gap-6 transition-shadow hover:shadow-ld-subtle-3">
      <div className="flex items-center gap-5">
        <div className="relative w-[60px] h-[60px] min-w-[60px] rounded-xl border-2 border-ld-canvas shadow-ld-subtle-2 bg-ld-cloud flex items-center justify-center overflow-hidden">
          {photo ? (
            <img src={photo} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <User size={22} className="text-ld-mist" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{name}</h3>
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-75 transition-opacity">
                <Linkedin size={16} />
              </a>
            )}
          </div>
          <p className="text-xs text-ld-slate m-0">{relation}</p>
        </div>
      </div>

      <div className="relative">
        <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expanded ? 'max-h-[1000px]' : 'max-h-[4.5rem]'}`}>
          <p className="text-ld-slate text-sm leading-relaxed italic m-0 whitespace-pre-line">{message}</p>
        </div>
        {message.length > 200 && (
          <button
            className="mt-3 bg-transparent border-none text-ld-violet font-medium text-xs cursor-pointer p-0 hover:opacity-75 transition-opacity"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
          </button>
        )}
      </div>
    </div>
  );
};

const ArticleSlider: React.FC<{
  articles: { id: string; url: string; title: string; description?: string; thumbnail?: string; source?: string }[];
}> = ({ articles }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex gap-5 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory pb-1"
      >
        {articles.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col no-underline transition-shadow hover:shadow-ld-subtle-3"
          >
            <div className="w-full aspect-video overflow-hidden bg-ld-frost border-b border-ld-ash flex items-center justify-center">
              {article.thumbnail ? (
                <img src={article.thumbnail} alt={article.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              ) : (
                <ImageOff size={24} className="text-ld-mist" />
              )}
            </div>
            <div className="p-4 flex flex-col gap-1.5 flex-grow">
              <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0 line-clamp-2">{article.title}</h4>
              {article.description && (
                <p className="text-ld-slate text-xs leading-relaxed m-0 line-clamp-2">{article.description}</p>
              )}
              {article.source && (
                <span className="inline-flex items-center gap-1 mt-auto pt-2 text-[11px] text-ld-fog">
                  <ExternalLink size={11} /> {article.source}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      {articles.length > 3 && (
        <div className="flex gap-1.5 justify-end mt-3">
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Sebelumnya"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Berikutnya"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-ld-ash bg-ld-canvas text-ld-slate hover:text-ld-violet hover:border-ld-violet cursor-pointer transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const PortfolioContent: React.FC<{ slug: string | undefined }> = ({ slug }) => {
  const { portfolio, tools, loading, notFound, error, retry } = usePortfolio(slug);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (loading) return <LoadingState className="min-h-[60vh] pt-16" />;

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

  if (notFound || !portfolio) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4 font-ld-sans">
        <NotFoundState
          illustrationLabel="?"
          title="Portfolio tidak ditemukan"
          description="Portfolio yang kamu cari tidak tersedia atau belum dipublikasikan."
          actionTo="/"
          actionLabel="Kembali ke Beranda"
        />
      </div>
    );
  }

  const { profile, experience, projects, endorsements, socials } = portfolio.data;
  const education = portfolio.data.education ?? [];
  const articles = portfolio.data.articles ?? [];
  const certifications = portfolio.data.certifications ?? [];
  const cta = portfolio.data.cta;
  const hasCta = Boolean(cta?.title.trim() || cta?.description.trim());
  const toolById = new Map<string, ToolConfig>(tools.map((t) => [t.id, t]));

  const hasExperience = experience.length > 0;
  const hasEducation = education.length > 0;
  const hasArticles = articles.length > 0;
  const hasCertifications = certifications.length > 0;
  const hasProjects = projects.length > 0;
  const hasEndorsements = endorsements.length > 0;

  const socialLinks: { key: string; href: string; icon: React.ReactNode; label: string }[] = [];
  if (socials.linkedin) socialLinks.push({ key: 'linkedin', href: socials.linkedin, icon: <Linkedin size={16} />, label: 'LinkedIn' });
  if (socials.github) socialLinks.push({ key: 'github', href: socials.github, icon: <Github size={16} />, label: 'GitHub' });
  if (socials.email) socialLinks.push({ key: 'email', href: `mailto:${socials.email}`, icon: <Mail size={16} />, label: 'Email' });
  if (socials.portfolioUrl) socialLinks.push({ key: 'portfolioUrl', href: socials.portfolioUrl, icon: <ExternalLink size={16} />, label: 'Website' });

  const usedToolIds = new Set<string>();
  projects.forEach((p) => p.toolIds.forEach((id) => usedToolIds.add(id)));
  const usedTools = Array.from(usedToolIds)
    .map((id) => toolById.get(id))
    .filter((t): t is ToolConfig => Boolean(t));

  const TOOLS_LIMIT = 20;
  const hasMoreTools = usedTools.length > TOOLS_LIMIT;
  const visibleTools = hasMoreTools ? usedTools.slice(0, TOOLS_LIMIT - 1) : usedTools;
  const remainingToolsCount = usedTools.length - visibleTools.length;

  return (
    <div className="font-ld-sans bg-ld-canvas">
      <Seo
        path={`/portfolio/${portfolio.slug}`}
        title={`${profile.name} - Portfolio QA | Mentor.QA`}
        description={profile.bio}
        image={profile.photo}
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
        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-4 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-6">
            <div className="relative w-[140px] min-w-[140px] h-[140px] sm:h-auto">
              <img
                src={profile.photo || '/img/portfolio-public/default-avatar-portfolio.webp'}
                alt={profile.name}
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
                {profile.name}
              </h1>
              {(profile.role || typeof profile.yearsOfExperience === 'number') && (
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.role && (
                    <p className="text-sm sm:text-base font-medium text-white/90 m-0">{profile.role}</p>
                  )}
                  {profile.role && typeof profile.yearsOfExperience === 'number' && (
                    <span className="text-white/50">•</span>
                  )}
                  {typeof profile.yearsOfExperience === 'number' && (
                    <p className="text-sm sm:text-base font-medium text-white/90 m-0 whitespace-nowrap">
                      {profile.yearsOfExperience}+ Years Exp
                    </p>
                  )}
                </div>
              )}
              {profile.isVerified && (
                <div className="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-lg bg-white border-2 border-blue-600 shadow-[3px_3px_0_0_#2563eb]">
                  <BadgeCheck size={14} className="text-blue-500" />
                  <span className="text-xs font-medium text-ld-graphite">Verified by</span>
                  <img src="/img/mentor-logo.webp" alt="Mentor.QA" width={14} height={14} loading="lazy" decoding="async" className="w-3.5 h-3.5 object-contain" />
                  <span className="text-xs font-semibold text-ld-graphite">Mentor<span className="text-ld-violet">.QA</span></span>
                </div>
              )}
            </div>
          </div>

          {(socialLinks.length > 0 || socials.whatsapp) && (
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0">
              {socials.whatsapp && (
                <a
                  href={`https://api.whatsapp.com/send?phone=${socials.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat WhatsApp"
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium no-underline hover:bg-white/20 backdrop-blur-md transition-colors"
                >
                  <MessageCircle size={16} /> Chat WhatsApp
                </a>
              )}
              {socialLinks.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 border border-white/30 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 mb-14">
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div className="max-w-[800px] text-base text-ld-slate leading-relaxed">
              <p className="whitespace-pre-line">{profile.bio}</p>
            </div>
          </div>

          {usedTools.length > 0 && (
            <div className="lg:col-span-2">
              <div className="grid grid-cols-5 gap-3">
                {visibleTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="aspect-square flex items-center justify-center rounded-2xl border border-ld-ash/50 p-1 transition-shadow hover:shadow-ld-subtle-3"
                  >
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="w-1/2 h-1/2 object-contain" />
                    ) : (
                      <span className="text-[10px] font-medium text-ld-graphite text-center leading-tight">{tool.name}</span>
                    )}
                  </div>
                ))}
                {remainingToolsCount > 0 && (
                  <div className="aspect-square flex items-center justify-center rounded-2xl border border-ld-ash/50 p-1">
                    <span className="text-sm font-semibold text-ld-violet text-center leading-tight">+{remainingToolsCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Experience */}
        {hasExperience && (
          <section className="mb-14">
            <SectionHeading
              icon={<Briefcase size={20} />}
              iconClassName="bg-blue-500/10 text-blue-500"
              title={<>Pengalaman <span className="text-ld-violet">Kerja</span></>}
              subtitle="Riwayat karier profesional dan kontribusi utama."
            />

            <div className="flex flex-col relative">
              {experience.map((entry, index) => {
                const duration = formatDuration(entry.startDate, entry.endDate, entry.isCurrent);
                return (
                  <div key={entry.id} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full z-10 mt-6 ${entry.isCurrent ? 'bg-ld-violet' : 'bg-ld-ash border-2 border-ld-canvas'}`} />
                      {index < experience.length - 1 && <div className="flex-grow w-0.5 bg-ld-frost my-1" />}
                    </div>

                    <div
                      className="flex-grow bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6 mb-6 cursor-pointer transition-shadow relative overflow-hidden hover:shadow-ld-subtle-3"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                        <div className="flex items-start gap-5">
                          <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas border border-ld-ash rounded-lg overflow-hidden">
                            {entry.companyLogo ? (
                              <img src={entry.companyLogo} alt={entry.company} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                            ) : (
                              <Briefcase size={20} className="text-ld-mist" />
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{entry.company}</h3>
                              {entry.isCurrent && (
                                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-[10px] font-semibold">Current</span>
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-ld-violet m-0">{entry.position}</h4>
                            {entry.employmentType && (
                              <span className="text-xs text-ld-fog">{EMPLOYMENT_TYPE_LABEL[entry.employmentType]}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-row items-center sm:flex-col sm:items-end gap-2 sm:gap-1 text-xs text-ld-fog">
                          <span>{formatMonth(entry.startDate)} — {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}</span>
                          {duration && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-ld-cloud text-ld-graphite text-[10px] font-medium">
                              {duration}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`grid transition-all duration-300 ease-in-out ${expandedIndex === index ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-dashed border-ld-ash' : 'grid-rows-[0fr] opacity-0 overflow-hidden'}`}>
                        <div className="overflow-hidden">
                          <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line">{entry.jobDesc}</p>
                        </div>
                      </div>

                      <div className="absolute bottom-3 right-4 text-ld-fog opacity-60">
                        {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education */}
        {hasEducation && (
          <section className="mb-14">
            <SectionHeading
              icon={<GraduationCap size={20} />}
              iconClassName="bg-emerald-500/10 text-emerald-600"
              title={<>Riwayat <span className="text-ld-violet">Pendidikan</span></>}
              subtitle="Latar belakang akademik dan bidang studi."
            />

            <div className="flex flex-col relative">
              {education.map((entry, index) => (
                <div key={entry.id} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full z-10 mt-6 ${entry.isCurrent ? 'bg-ld-violet' : 'bg-ld-ash border-2 border-ld-canvas'}`} />
                    {index < education.length - 1 && <div className="flex-grow w-0.5 bg-ld-frost my-1" />}
                  </div>

                  <div className="flex-grow bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-6 mb-6 relative overflow-hidden hover:shadow-ld-subtle-3 transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                      <div className="flex items-start gap-5">
                        <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas border border-ld-ash rounded-lg overflow-hidden">
                          {entry.institutionLogo ? (
                            <img src={entry.institutionLogo} alt={entry.institution} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                          ) : (
                            <GraduationCap size={20} className="text-ld-mist" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{entry.institution}</h3>
                            {entry.isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-[10px] font-semibold">Current</span>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-ld-violet m-0">
                            {entry.degree}{entry.fieldOfStudy ? ` — ${entry.fieldOfStudy}` : ''}
                          </h4>
                        </div>
                      </div>
                      <div className="flex flex-row items-center sm:flex-col sm:items-end gap-2 sm:gap-1 text-xs text-ld-fog">
                        <span>{formatMonth(entry.startDate)} — {entry.isCurrent ? 'Sekarang' : formatMonth(entry.endDate)}</span>
                      </div>
                    </div>

                    {entry.description && (
                      <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line mt-4 pt-4 border-t border-dashed border-ld-ash">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {hasProjects && (
          <section className="mb-14">
            <SectionHeading
              icon={<Rocket size={20} />}
              iconClassName="bg-amber-500/10 text-amber-500"
              title={<>Project <span className="text-ld-violet">Showcase</span></>}
              subtitle="Kumpulan project yang pernah dikerjakan."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => {
                const projectTools = project.toolIds
                  .map((id) => toolById.get(id))
                  .filter((t): t is ToolConfig => Boolean(t?.logo));
                const visibleProjectTools = projectTools.slice(0, 5);
                const extraProjectToolsCount = projectTools.length - visibleProjectTools.length;

                return (
                  <div key={project.id} className="bg-ld-canvas border border-ld-ash rounded-xl overflow-hidden flex flex-col transition-shadow hover:shadow-ld-subtle-3">
                    <div className="w-full aspect-video overflow-hidden bg-ld-frost border-b border-ld-ash flex items-center justify-center">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <Rocket size={28} className="text-ld-mist" />
                      )}
                    </div>
                    <div className="p-4 pb-2 flex-grow">
                      <h4 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] mb-2">{project.name}</h4>
                      <p className="text-ld-slate text-xs leading-relaxed mb-4">{project.description}</p>
                    </div>
                    <div className="px-4 py-3 flex justify-between items-center border-t border-ld-ash bg-ld-cloud/50 gap-3">
                      <div className="flex gap-2.5 flex-wrap items-center">
                        {visibleProjectTools.map((tool) => (
                          <img key={tool.id} src={tool.logo} alt={tool.name} title={tool.name} loading="lazy" decoding="async" className="h-5 object-contain" />
                        ))}
                        {extraProjectToolsCount > 0 && (
                          <span className="text-xs font-medium text-ld-violet">+{extraProjectToolsCount}</span>
                        )}
                      </div>
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-ld-canvas text-ld-violet border border-ld-ash rounded-lg font-medium text-xs no-underline transition-colors hover:bg-ld-violet hover:text-white hover:border-ld-violet whitespace-nowrap"
                        >
                          Lihat Project <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Endorsements */}
        {hasEndorsements && (
          <section>
            <SectionHeading
              icon={<Quote size={20} />}
              iconClassName="bg-blue-500/10 text-blue-500"
              title="Endorsement"
              subtitle="Testimoni dari kolega dan atasan yang pernah bekerja sama."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {endorsements.map((entry) => (
                <EndorsementCard
                  key={entry.id}
                  photo={entry.photo}
                  name={entry.name}
                  relation={entry.relation}
                  message={entry.message}
                  linkedinUrl={entry.linkedinUrl}
                />
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {hasCertifications && (
          <section className="mt-14">
            <SectionHeading
              icon={<Award size={20} />}
              iconClassName="bg-emerald-500/10 text-emerald-600"
              title="Certification"
              subtitle="Sertifikasi profesional yang pernah diperoleh."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-5 flex items-start gap-4 transition-shadow hover:shadow-ld-subtle-3"
                >
                  <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas rounded-lg overflow-hidden">
                    {cert.issuerLogo ? (
                      <img src={cert.issuerLogo} alt={cert.issuer} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                    ) : (
                      <Award size={20} className="text-ld-mist" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 min-w-0">
                    <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{cert.name}</h4>
                    <p className="text-xs text-ld-violet font-medium m-0">{cert.issuer}</p>
                    <span className="text-[11px] text-ld-fog">{formatMonth(cert.issueDate)}</span>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-ld-violet no-underline hover:opacity-75 transition-opacity"
                      >
                        Lihat Kredensial <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {hasArticles && (
          <section className="mt-14">
            <SectionHeading
              icon={<Newspaper size={20} />}
              iconClassName="bg-amber-500/10 text-amber-500"
              title="Article"
              subtitle="Tulisan dan publikasi yang pernah dibuat."
            />
            <ArticleSlider articles={articles} />
          </section>
        )}
      </div>

      {/* CTA */}
      {hasCta && cta && (
        <section className="relative bg-ld-violet py-12 md:py-20 overflow-hidden text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none z-0" />

          <div className="max-w-[1200px] mx-auto px-4 relative z-10">
            <div className="flex flex-col items-center gap-5 text-center">
              <div className="flex flex-col items-center gap-4">
                <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl lg:text-[2.8rem] text-white m-0 tracking-[-0.02em] leading-tight">
                  {cta.title}
                </h2>
              </div>
              <p className="text-base sm:text-lg text-white/90 max-w-[800px] m-0 leading-relaxed whitespace-pre-line">
                {cta.description}
              </p>

              {(cta.showViewCv && profile.cvUrl) || (cta.showConnectLinkedin && socials.linkedin) ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6 w-full sm:w-auto">
                  {cta.showViewCv && profile.cvUrl && (
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ld-violet rounded-lg font-medium text-sm no-underline transition-colors hover:bg-white/90 w-full sm:w-auto"
                    >
                      <Download size={20} /> View CV
                    </a>
                  )}
                  {cta.showConnectLinkedin && socials.linkedin && (
                    <a
                      href={socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-medium text-sm no-underline transition-colors hover:bg-white/20 backdrop-blur-md w-full sm:w-auto"
                    >
                      <Linkedin size={20} /> Connect LinkedIn
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// Keyed on slug so slug-to-slug navigation remounts this component instead
// of reusing usePortfolio's stale state.
const PublicPortfolioPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <PortfolioContent key={slug} slug={slug} />;
};

export default PublicPortfolioPage;
