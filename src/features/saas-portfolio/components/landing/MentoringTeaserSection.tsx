import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const points = ['Review Portfolio', 'Review CV', 'Mock Interview', 'Career Advice'];
// Placeholder credentials — swap for real mentor data once available.
const industries = ['Healthcare', 'Fintech', 'OTA', 'Automation'];

const MentoringTeaserSection: React.FC = () => {
  return (
    <section className="bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-ld-lilac grid grid-cols-1 lg:grid-cols-2 items-center">
          <div className="relative z-10 px-5 py-6 lg:py-14 lg:px-12 text-center lg:text-left">
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ld-graphite">
                <img
                  src="/shared/img/mentor-logo.webp"
                  alt="Mentor.QA"
                  width={16}
                  height={16}
                  loading="lazy"
                  decoding="async"
                  className="w-4 h-4 object-contain"
                />
                <span>Mentor<span className="text-ld-violet">.QA</span></span>
              </span>
              <span className="text-ld-ash">·</span>
              <span className="text-xs font-medium text-ld-slate">5+ Tahun Pengalaman</span>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 mb-5">
              {industries.map(tag => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-white/70 border border-ld-lavender text-ld-graphite text-xs font-medium">
                  {tag}
                </span>
              ))}
            </div>

            <h2 className="font-ld-display font-semibold text-2xl sm:text-3xl tracking-[-0.02em] text-ld-graphite leading-[1.1] mb-3">
              Portfolio Sudah Jadi. Sekarang Saatnya Di-review.
            </h2>
            <p className="text-ld-slate text-base leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Setelah portfolio-mu online, mentor QA praktisi bisa bantu memastikan kamu lebih siap dilirik recruiter.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 mb-8">
              {points.map(point => (
                <div key={point} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-ld-violet shrink-0" />
                  <span className="text-sm font-medium text-ld-graphite">{point}</span>
                </div>
              ))}
            </div>

            <Link
              to="/mentoring/booking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
            >
              Book Mentoring
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="relative h-64 sm:h-80 lg:h-full order-first lg:order-last">
            <img
              src="/mentoring/img/image-benefit.webp"
              alt="Review portfolio bersama mentor QA"
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 hidden lg:block bg-gradient-to-l from-transparent via-transparent to-ld-lavender/40" />
            <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-ld-lilac/50 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-[0_8px_24px_rgba(59,158,255,0.2)]">
              <span className="font-ld-display font-semibold text-2xl text-ld-violet leading-none">200+</span>
              <span className="text-xs font-medium text-ld-graphite leading-tight max-w-[6rem]">Interview Coaching</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentoringTeaserSection;
