import React from 'react';
import { ArrowRight, Briefcase, FolderKanban, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-ld-canvas min-h-screen flex items-center pt-24 pb-16 lg:pt-32 lg:pb-16 font-ld-sans">
      <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-8 items-center">
          {/* Left two-thirds: pain-first headline + sub + CTAs */}
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ld-lilac text-ld-violet text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ld-violet" />
              100% Gratis · Untuk Fresh Graduate &amp; QA Praktisi
            </div>

            <h1 className="font-ld-display font-semibold text-[42px] sm:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.025em] text-ld-graphite mb-5">
              Recruiter Tidak Bisa Menilai Skill QA Hanya dari CV.
            </h1>

            <p className="text-base sm:text-lg text-ld-slate leading-relaxed max-w-lg mb-8 tracking-[-0.01em]">
              Tampilkan project testing, automation, test case, dan sertifikasi dalam satu portfolio profesional agar recruiter lebih mudah memahami kemampuanmu.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
              >
                Buat Portfolio Gratis
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/portfolio/agus-budiman"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-frost/70 text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
              >
                Lihat Demo Portfolio
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Gratis Selamanya', 'Gak Perlu Coding', 'Siap dalam 10 Menit'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-ld-cloud text-ld-slate text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right two-fifths: mock portfolio preview card + storytelling floating card */}
          <div className="lg:col-span-2 relative flex justify-center lg:justify-end">
            {/* Floating tool logos */}
            <div className="hidden sm:flex absolute top-2/5 -right-6 w-12 h-12 items-center justify-center rounded-xl bg-white shadow-[0_8px_24px_rgba(59,158,255,0.2)] p-2.5 z-10">
              <img src="/personal-portfolio/img/tools/postman-logo-new.svg" alt="Postman" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:flex absolute top-1/2 -left-8 w-16 h-16 items-center justify-center rounded-xl bg-white shadow-[0_8px_24px_rgba(59,158,255,0.2)] p-3 z-10">
              <img src="/personal-portfolio/img/tools/jira-logo-new.svg" alt="Jira" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:flex absolute -top-8 right-6 w-11 h-11 items-center justify-center rounded-xl bg-white shadow-[0_8px_24px_rgba(59,158,255,0.2)] p-2 z-10">
              <img src="/personal-portfolio/img/tools/figma-logo-new.svg" alt="Figma" className="w-full h-full object-contain" />
            </div>

            {/* Floating "Interview Invitation" storytelling card */}
            <div className="hidden sm:flex absolute -bottom-10 -right-14 items-center gap-3 px-5 py-3.5 rounded-xl bg-white shadow-[0_8px_24px_rgba(59,158,255,0.2)] z-20">
              <span className="text-3xl leading-none">📩</span>
              <div className="min-w-0">
                <p className="m-0 text-sm font-semibold text-ld-graphite leading-tight">Interview Invitation</p>
                <p className="m-0 text-xs text-ld-slate leading-tight pt-1">PT Mentor.QA · QA Engineer</p>
              </div>
            </div>

            {/* Floating "Portfolio Viewed" storytelling card */}
            <div className="hidden sm:flex absolute -top-14 -left-6 items-center gap-2 px-4 py-2.5 rounded-xl bg-white shadow-[0_8px_24px_rgba(59,158,255,0.2)] z-20">
              <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs leading-none shrink-0">✓</span>
              <p className="m-0 text-sm font-semibold text-ld-graphite leading-tight">Viewed by Recruiter</p>
            </div>

            <div className="relative w-full max-w-sm rounded-xl bg-white border border-ld-frost/70 overflow-hidden shadow-[0_20px_50px_rgba(59,158,255,0.2)]">
              <div className="border-b border-ld-frost/70 px-5 py-3 flex items-center gap-2 bg-ld-cloud">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-ld-steel text-xs font-ld-mono truncate">mentor.qa/portfolio/nama-kamu</span>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/personal-portfolio/img/profile/profile-agus.webp"
                      alt="Agus Budiman"
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-semibold text-ld-graphite truncate">Agus Budiman</p>
                      <p className="m-0 text-xs text-ld-slate truncate">QA Engineer · Manual &amp; Automation Testing</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-11 h-11">
                      <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
                        <circle cx="22" cy="22" r="18" fill="none" strokeWidth="4" className="stroke-ld-frost" />
                        <circle
                          cx="22" cy="22" r="18" fill="none" strokeWidth="4" strokeLinecap="round"
                          className="stroke-green-500"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={2 * Math.PI * 18 * (1 - 0.92)}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-green-600">92%</span>
                    </div>
                    <span className="mt-1 text-[9px] text-ld-slate leading-none whitespace-nowrap">Score</span>
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
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-frost/70">
                    <FolderKanban size={15} className="text-ld-violet shrink-0" />
                    <span className="text-xs text-ld-graphite font-medium">3 Proyek Ditampilkan</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-frost/70">
                    <Award size={15} className="text-ld-violet shrink-0" />
                    <span className="text-xs text-ld-graphite font-medium">2 Sertifikasi</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-ld-frost/70">
                    <Briefcase size={15} className="text-ld-violet shrink-0" />
                    <span className="text-xs text-ld-graphite font-medium">5 Riwayat Pengalaman Kerja</span>
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
