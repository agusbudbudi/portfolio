import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SimulatorShowcase from '../../../home/components/SimulatorShowcase';
import { FEATURED_PROJECT_PATH } from './content';
import HeroBadge from '../../../../components/common/HeroBadge';

const TRUST_TAGS = ['Gratis', 'Phase 1 tanpa login', '±4 jam', 'Dapat portfolio studi kasus'];

const SimHeroSection: React.FC = () => (
  <section className="relative overflow-hidden bg-ld-canvas min-h-svh flex flex-col justify-center pt-28 pb-16 lg:pt-28 lg:pb-16">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-40 right-[-10%] w-[640px] h-[640px] rounded-full bg-ld-lilac blur-3xl opacity-60"
    />
    <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
      <div className="lg:col-span-7">
        <HeroBadge>QA Simulator · Gratis untuk pemula &amp; fresh graduate</HeroBadge>

        <h1 className="font-semibold text-[40px] sm:text-[54px] lg:text-[62px] leading-[1] tracking-[-0.025em] text-ld-graphite m-0 mb-5">
          Simulasi Kerja QA Engineer <span className="text-ld-violet">dengan Project Nyata</span>
        </h1>

        <p className="text-base sm:text-lg text-ld-slate leading-relaxed max-w-xl m-0 mb-8">
          Belajar software testing lewat praktik langsung: review PRD, tulis test case, cari bug di aplikasi
          staging, buat bug report, dan beri rekomendasi rilis Go / No-Go. Selesai simulasi, kamu punya
          portfolio studi kasus QA untuk melamar kerja.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <Link
            to={FEATURED_PROJECT_PATH}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
          >
            Mulai Simulasi Gratis
            <ArrowRight size={16} />
          </Link>
          <a
            href="#project"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-frost bg-white text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
          >
            Lihat semua project
          </a>
        </div>

        <ul className="m-0 p-0 list-none flex flex-wrap gap-2">
          {TRUST_TAGS.map((tag) => (
            <li key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ld-cloud text-ld-slate text-xs font-medium">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-5 relative pt-6 lg:pt-0">
        <SimulatorShowcase />
      </div>
    </div>
  </section>
);

export default SimHeroSection;
