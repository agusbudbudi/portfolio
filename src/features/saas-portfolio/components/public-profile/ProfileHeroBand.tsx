import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { thesvgIconUrl } from '../../../../lib/thesvgRegistry';
import type { PortfolioProfile } from '../../../../types/portfolio';

const ProfileHeroBand: React.FC<{
  profile: PortfolioProfile;
  whatsapp?: string;
  socialLinks: { key: string; href: string; icon: React.ReactNode; label: string }[];
}> = ({ profile, whatsapp, socialLinks }) => (
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
            src={profile.photo || '/saas-portfolio/img/portfolio-public/default-avatar-portfolio.webp'}
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
              <BadgeCheck size={18} className="text-blue-500" fill="currentColor" stroke="white" />
              <span className="text-xs font-medium text-ld-graphite">Verified by</span>
              <img src="/shared/img/mentor-logo.webp" alt="Mentor.QA" width={14} height={14} loading="lazy" decoding="async" className="w-3.5 h-3.5 object-contain" />
              <span className="text-xs font-semibold text-ld-graphite">Mentor<span className="text-ld-violet">.QA</span></span>
            </div>
          )}
        </div>
      </div>

      {(socialLinks.length > 0 || whatsapp) && (
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end shrink-0">
          {whatsapp && (
            <a
              href={`https://api.whatsapp.com/send?phone=${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat WhatsApp"
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white/10 border border-white/30 text-white text-sm font-medium no-underline hover:bg-white/20 backdrop-blur-md transition-colors"
            >
              <img src={thesvgIconUrl('whatsapp', 'mono')} alt="" className="w-4 h-4 brightness-0 invert" /> Chat WhatsApp
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
);

export default ProfileHeroBand;
