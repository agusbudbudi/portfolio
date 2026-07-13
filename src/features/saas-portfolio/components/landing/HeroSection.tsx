import React from 'react';
import { ArrowRight, Briefcase, FolderKanban, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-ld-canvas pt-24 pb-16 lg:pt-32 lg:pb-16 font-ld-sans">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-8 items-center">
          {/* Left two-thirds: headline + sub + CTAs */}
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ld-lilac text-ld-violet text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ld-violet" />
              100% Gratis · Untuk Fresh Graduate &amp; QA Praktisi
            </div>

            <h1 className="font-ld-display font-semibold text-[42px] sm:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.025em] text-ld-graphite mb-5">
              Portfolio QA Engineer yang Bikin Kamu Dilirik Recruiter
            </h1>

            <p className="text-base sm:text-lg text-ld-slate leading-relaxed max-w-lg mb-8 tracking-[-0.01em]">
              Satu halaman portfolio profesional untuk showcase proyek, sertifikasi, dan pengalaman QA-mu.
              Gratis selamanya, tinggal isi profil dan publish dengan link sendiri.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
              >
                Buat Portfolio Gratis
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-ash text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
              >
                Cara Kerja
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Setup 5 Menit', 'Custom URL', 'SEO-Friendly'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-ld-cloud text-ld-slate text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right two-fifths: mock portfolio preview card (browser-frame) */}
          <div className="lg:col-span-2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm rounded-xl bg-white border border-ld-ash overflow-hidden shadow-[var(--shadow-ld-lg)]">
              <div className="border-b border-ld-ash px-5 py-3 flex items-center gap-2 bg-ld-cloud">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-ld-steel text-xs font-ld-mono truncate">mentor.qa/portfolio/nama-kamu</span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/personal-portfolio/img/profile/profile-agus.webp"
                    alt="Agus Budiman"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="m-0 text-sm font-semibold text-ld-graphite truncate">Agus Budiman</p>
                    <p className="m-0 text-xs text-ld-slate truncate">QA Engineer · Manual &amp; Automation Testing</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {['Cypress', 'Postman', 'Selenium', 'API Testing'].map(skill => (
                    <span key={skill} className="px-2 py-0.5 rounded-full bg-ld-cloud text-ld-slate text-[11px] font-medium">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-ash">
                    <FolderKanban size={15} className="text-ld-violet shrink-0" />
                    <span className="text-xs text-ld-graphite font-medium">3 Proyek Ditampilkan</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-ash">
                    <Award size={15} className="text-ld-violet shrink-0" />
                    <span className="text-xs text-ld-graphite font-medium">2 Sertifikasi</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-ash">
                    <Briefcase size={15} className="text-ld-violet shrink-0" />
                    <span className="text-xs text-ld-graphite font-medium">Riwayat Pengalaman Kerja</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
