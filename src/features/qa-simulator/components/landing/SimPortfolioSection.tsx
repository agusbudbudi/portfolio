import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, FileCheck2, MessagesSquare, Sparkles } from 'lucide-react';
import { FEATURED_PROJECT_PATH } from './content';
import PortfolioIllustration from './PortfolioIllustration';

const BENEFITS = [
  {
    icon: Sparkles,
    title: 'Tersusun otomatis',
    body: 'Selesaikan semua phase, portfolio studi kasus langsung jadi dari hasil kerjamu. Tidak perlu menyusun dari nol.',
  },
  {
    icon: FileCheck2,
    title: 'Bukti kerja, bukan sekadar sertifikat',
    body: 'Berisi konteks project, pertanyaan klarifikasi, test case, bug report, dan rekomendasi rilis yang kamu tulis sendiri.',
  },
  {
    icon: Download,
    title: 'Siap dilampirkan',
    body: 'Download sebagai PDF A4 yang rapi untuk dilampirkan di lamaran, CV, atau profil LinkedIn.',
  },
  {
    icon: MessagesSquare,
    title: 'Bahan cerita saat interview',
    body: 'Saat ditanya pengalaman testing, kamu punya studi kasus konkret lengkap dengan keputusan dan alasannya.',
  },
];

const SimPortfolioSection: React.FC = () => (
  <section id="portfolio" className="py-16 md:py-24 bg-ld-cloud scroll-mt-16">
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center">
      <div className="order-2 lg:order-1">
        <PortfolioIllustration />
      </div>

      <div className="order-1 lg:order-2">
        <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Bonus: portfolio studi kasus</p>
        <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">
          Selesai simulasi, langsung punya portfolio studi kasus QA
        </h2>
        <p className="m-0 mt-4 text-ld-slate leading-relaxed">
          Recruiter ingin melihat cara kamu berpikir, bukan hanya daftar tools. Semua yang kamu kerjakan di simulasi otomatis dirangkum jadi
          dokumen studi kasus yang bisa langsung kamu tunjukkan.
        </p>

        <ul className="m-0 mt-8 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3">
              <span className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-ld-frost text-ld-violet"><Icon size={17} /></span>
              <div>
                <h3 className="m-0 text-sm font-semibold text-ld-graphite">{title}</h3>
                <p className="m-0 mt-1 text-sm text-ld-slate leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to={FEATURED_PROJECT_PATH}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors"
          >
            Mulai & dapatkan portfolionya <ArrowRight size={16} />
          </Link>
          <Link
            to="/portfolio"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-ld-frost bg-white text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
          >
            Lengkapi dengan Portfolio QA
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default SimPortfolioSection;
