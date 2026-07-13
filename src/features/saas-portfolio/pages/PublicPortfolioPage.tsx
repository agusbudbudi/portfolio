import React from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, Github, Linkedin, Mail } from 'lucide-react';
import { usePortfolio } from '../../../hooks/usePortfolio';
import Seo from '../../../components/common/Seo';
import LoadingState from '../../../components/common/LoadingState';
import NotFoundState from '../../../components/common/NotFoundState';
import ProfileHeroBand from '../components/public-profile/ProfileHeroBand';
import BioAndToolsPanel from '../components/public-profile/BioAndToolsPanel';
import ExperienceSection from '../components/public-profile/ExperienceSection';
import EducationSection from '../components/public-profile/EducationSection';
import ProjectsSection from '../components/public-profile/ProjectsSection';
import EndorsementsSection from '../components/public-profile/EndorsementsSection';
import CertificationsSection from '../components/public-profile/CertificationsSection';
import ArticlesSection from '../components/public-profile/ArticlesSection';
import GithubActivitySection from '../components/public-profile/GithubActivitySection';
import CtaSection from '../components/public-profile/CtaSection';
import type { ToolConfig } from '../../../types/portfolio';

const PortfolioContent: React.FC<{ slug: string | undefined }> = ({ slug }) => {
  const { portfolio, tools, loading, notFound, error, retry } = usePortfolio(slug);

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

  return (
    <div className="font-ld-sans bg-ld-canvas">
      <Seo
        path={`/portfolio/${portfolio.slug}`}
        title={`${profile.name} - Portfolio QA | Mentor.QA`}
        description={profile.bio}
        image={profile.photo}
      />

      <ProfileHeroBand profile={profile} whatsapp={socials.whatsapp} socialLinks={socialLinks} />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-8 pb-16">
        <BioAndToolsPanel bio={profile.bio} tools={usedTools} />

        {hasExperience && <ExperienceSection experience={experience} />}
        {hasEducation && <EducationSection education={education} />}
        {hasProjects && <ProjectsSection projects={projects} toolById={toolById} />}
        {hasEndorsements && <EndorsementsSection endorsements={endorsements} />}
        {hasCertifications && <CertificationsSection certifications={certifications} />}
        {hasArticles && <ArticlesSection articles={articles} />}

        {portfolio.data.githubActivity?.showActivity && portfolio.data.githubActivity.username && (
          <GithubActivitySection username={portfolio.data.githubActivity.username} />
        )}
      </div>

      {hasCta && cta && (
        <CtaSection cta={cta} cvUrl={profile.cvUrl} linkedinUrl={socials.linkedin} />
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
