import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { MentoringIcon, QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon } from '../../../components/illustration/ProductIcons';
import PremiumBadge from '../../../components/common/PremiumBadge';
import SimulatorShowcase from './SimulatorShowcase';
import LibraryShowcase from './LibraryShowcase';
import PortfolioShowcase from './PortfolioShowcase';
import MentoringShowcase from './MentoringShowcase';
import { useConfig } from '../../../hooks/useConfig';
import { MENTORING_PLANS } from '../../mentoring/data/pricingPlans';

// Cheapest mentoring price ("Rp99.000"), for the "Mulai dari …" link.
const LOWEST_PRICE = MENTORING_PLANS.reduce((min, p) =>
  Number(p.price.replace(/\D/g, '')) < Number(min.replace(/\D/g, '')) ? p.price : min, MENTORING_PLANS[0].price);

// The four products as full-width rows with the illustration zig-zagging
// (right, left, right, left on desktop; always below the copy on mobile).
// Each showcase plays an intro animation on mount, so it's mounted only once
// scrolled into view.

/** Mounts children the first time the slot scrolls into view. */
const InView: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-15% 0px' });
  return <div ref={ref} className={`min-h-[300px] ${className ?? ''}`}>{seen ? children : null}</div>;
};

// ── Rows ────────────────────────────────────────────────────────────────────

interface Product {
  key: string;
  n: string;
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  panel: string;
  title: string;
  body: string;
  bullets: string[];
  to: string;
  cta: string;
  visual: React.ReactNode;
  /** Paid product — shows the gold "Berbayar" label. */
  paid?: boolean;
  /** Secondary in-page link, e.g. "Mulai dari Rp99.000" → #harga. */
  secondary?: { label: string; targetId: string };
}

const ProductRow: React.FC<{ p: Product; flip: boolean }> = ({ p, flip }) => {
  const Icon = p.icon;
  return (
    <article className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-ld-frost bg-white overflow-hidden">
      <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
        <div className="flex items-center gap-3">
          <Icon size={44} className="shrink-0" />
          <span>
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ld-graphite">
              {p.label}
              {p.paid && <PremiumBadge className="normal-case tracking-normal" />}
            </span>
            <span className="block mt-0.5 font-ld-mono text-[11px] text-ld-fog">{p.n} / 04</span>
          </span>
        </div>
        <h3 className="m-0 mt-5 text-2xl sm:text-3xl font-semibold text-ld-onyx tracking-[-0.02em] leading-tight">{p.title}</h3>
        <p className="m-0 mt-3 text-ld-slate leading-relaxed">{p.body}</p>
        <ul className="m-0 mt-6 p-0 list-none space-y-2.5">
          {p.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-ld-graphite">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"><Check size={12} strokeWidth={3} /></span>
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
          <Link
            to={p.to}
            className="group inline-flex w-fit items-center gap-2 px-5 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium no-underline transition-colors"
          >
            {p.cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          {p.secondary && (
            <a
              href={`#${p.secondary.targetId}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(p.secondary!.targetId)?.scrollIntoView({ behavior: 'smooth' });
                window.history.replaceState(null, '', `#${p.secondary!.targetId}`);
              }}
              className="inline-flex w-fit items-center gap-2 px-5 py-2.5 rounded-lg border border-ld-ash bg-white text-ld-graphite text-sm font-medium no-underline hover:border-ld-steel transition-colors"
            >
              {p.secondary.label}
            </a>
          )}
        </div>
      </div>
      <div className={`relative flex items-center justify-center p-6 sm:p-10 min-h-[320px] overflow-hidden ${p.panel} ${flip ? 'lg:order-first' : ''}`}>
        {p.visual}
      </div>
    </article>
  );
};

const HomeProducts: React.FC = () => {
  const { config } = useConfig();
  const minutes = config?.bookingRules.sessionDurationMinutes ?? 60;
  const topicCount = config?.topics.length ?? 7;

  const products: Product[] = [
    {
      key: 'simulator', n: '01', icon: QaSimulatorIcon, label: 'QA Simulator',
      panel: 'bg-gradient-to-br from-ld-lilac/70 via-white to-ld-cloud',
      title: 'Rasakan jadi QA di tim produk sungguhan',
      body: 'Project simulasi lengkap dengan PRD, tim squad, dan aplikasi staging yang sengaja berisi bug. Gratis, dan Phase 1 bisa dicoba tanpa login.',
      bullets: ['Review PRD dan temukan gap requirement', 'Tulis test scenario & test case', 'Bug hunting dan bug report di staging', 'Beri rekomendasi rilis Go / No-Go'],
      to: '/qa-simulator', cta: 'Mulai simulasi gratis',
      visual: <InView className="w-full"><SimulatorShowcase /></InView>,
    },
    {
      key: 'library', n: '02', icon: QaLibraryIcon, label: 'QA Library',
      panel: 'bg-gradient-to-br from-emerald-50 via-white to-ld-cloud',
      title: 'Materi QA yang langsung kepakai',
      body: 'Artikel praktis dari fundamental testing sampai automation dan AI di QA, ditulis oleh praktisi berdasarkan pengalaman nyata.',
      bullets: ['Fundamental & teknik test design', 'API testing dan automation', 'Tips karier dan workflow QA modern'],
      to: '/qa-library', cta: 'Baca QA Library',
      visual: <InView className="w-full"><LibraryShowcase /></InView>,
    },
    {
      key: 'portfolio', n: '03', icon: QaPortfolioIcon, label: 'Portfolio QA',
      panel: 'bg-gradient-to-br from-amber-50 via-white to-ld-cloud',
      title: 'Tunjukkan skill-mu, bukan cuma CV',
      body: 'Portfolio online gratis dengan link sendiri. Tampilkan project, test case, sertifikasi, dan studi kasus dari QA Simulator dalam satu halaman.',
      bullets: ['Link portfolio pribadi siap dibagikan', 'Project, tools, dan sertifikasi rapi', 'Gratis, tanpa perlu coding'],
      to: '/portfolio', cta: 'Buat portfolio gratis',
      visual: <InView className="w-full"><PortfolioShowcase /></InView>,
    },
    {
      key: 'mentoring', n: '04', paid: true, icon: MentoringIcon, label: 'Mentoring 1-on-1',
      panel: 'bg-gradient-to-br from-ld-cloud via-white to-ld-lilac/60',
      title: 'Dibimbing langsung oleh praktisi QA',
      body: 'Sesi personal untuk review CV dan portfolio, latihan interview, sampai belajar automation. Pilih jadwal sendiri, lanjut ngobrol lewat WhatsApp.',
      bullets: [`${minutes} menit per sesi, 1-on-1`, `${topicCount} topik QA & automation`, 'Jadwal fleksibel, termasuk akhir pekan'],
      to: '/mentoring', cta: 'Lihat mentoring',
      secondary: { label: `Mulai dari ${LOWEST_PRICE}`, targetId: 'harga' },
      visual: <InView className="w-full"><MentoringShowcase /></InView>,
    },
  ];

  return (
    <section id="program" className="py-16 md:py-24 bg-ld-cloud border-y border-ld-frost scroll-mt-16 font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-10 md:mb-14">
          <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-widest text-ld-violet">Semua di Mentor.QA</p>
          <h2 className="m-0 font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite leading-tight">
            Empat cara untuk naik level sebagai QA
          </h2>
          <p className="m-0 mt-3 text-ld-slate leading-relaxed">Pakai salah satu, atau semuanya. Semuanya saling terhubung dalam satu akun.</p>
        </div>
        <div className="space-y-6">
          {products.map((p, i) => <ProductRow key={p.key} p={p} flip={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  );
};

export default HomeProducts;
