import React, { useEffect, useId, useRef, useState } from 'react';
import {
  AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue,
} from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BatteryFull,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Code2,
  ExternalLink,
  FileText,
  Hand,
  Link2,
  Loader2,
  Lock,
  Mouse,
  MousePointer2,
  Linkedin,
  Search,
  Timer,
  Wifi,
  X,
} from 'lucide-react';
import HeroBadge from '../../../components/common/HeroBadge';
import PixelMosaic from '../../../components/illustration/PixelMosaic';
import {
  ApiTestingIcon, AutomationIcon, BootcampIcon, CapstoneIcon, CareerAdviceIcon, DummyProjectIcon, FreeGiftIcon, LearningIcon, MockInterviewIcon, PdfFileIcon,
  ReviewCvIcon, ReviewPortfolioIcon,
} from '../../../components/illustration/ProjectTypeIcons';
import FaqAccordion from '../../../components/common/FaqAccordion';
import { SKILL_LEVEL_LABELS, type SkillLevel } from '../../../types/portfolio';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { apiCheckSlug } from '../../../lib/adminApi';
import { finalizeSlug, parkPortfolioClaim, sanitizeSlugInput, SLUG_MAX_LENGTH, suggestSlug } from '../../../lib/portfolioClaim';
import { track } from '../../../lib/analytics';

// /portfolio: landing for the portfolio builder (design: Design canvas page
// "Portfolio Landing Revamp"). The previous landing (PortfolioLandingPage) is
// kept at /portfolio-lama, noindex.
//
// The device mockups show full-page screenshots of the real demo portfolio
// (/portfolio/agus-budiman). The stage pins while the page scroll drives the
// screenshot through the screen (reduced motion: a plain scroll box). An <iframe> is not
// possible: the site sends X-Frame-Options DENY + frame-ancestors 'none'.
// Re-shoot public/qa-portfolio/img/demo-*.webp when the demo profile changes.

const DEMO_SLUG = 'agus-budiman';
const DEMO_DESKTOP = '/qa-portfolio/img/demo-desktop.webp';
const DEMO_MOBILE = '/qa-portfolio/img/demo-mobile.webp';

const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-[10px] bg-ld-violet text-white text-[15px] font-semibold no-underline shadow-[0_8px_20px_rgba(59,158,255,0.28)] hover:bg-[#1f87e6] transition-colors';
const H2 = 'font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite m-0 text-balance';
const LEAD = 'text-base leading-relaxed text-ld-slate m-0';
const SCROLL_AREA = 'overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#a4abb8_transparent]';

/* ------------------------------------------------------------------ */
/* Hero + devices                                                      */
/* ------------------------------------------------------------------ */

/**
 * The demo screenshot inside a device screen. Normally it is driven by the
 * page scroll (`progress` 0..1 moves it from top to bottom of the image); with
 * `manual` (reduced motion) it is a plain scroll box instead.
 */
const ScreenImage: React.FC<{
  progress: MotionValue<number>;
  manual: boolean;
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
  className?: string;
}> = ({ progress, manual, src, alt, label, width, height, className = '' }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const travel = useMotionValue(0);
  const y = useTransform(() => -progress.get() * travel.get());

  useEffect(() => {
    if (manual) return;
    const box = boxRef.current;
    const img = imgRef.current;
    if (!box || !img) return;
    const measure = () => travel.set(Math.max(0, img.offsetHeight - box.clientHeight));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(img);
    return () => ro.disconnect();
  }, [manual, travel]);

  return (
    <div
      ref={boxRef}
      className={`relative ${manual ? SCROLL_AREA : 'overflow-hidden'} ${className}`}
      {...(manual ? { tabIndex: 0, 'aria-label': label } : {})}
    >
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        className="block h-auto w-full will-change-transform"
        style={manual ? undefined : { y }}
      />
    </div>
  );
};

/**
 * Scroll-pinned stage: the device sticks under the fixed navbar (4rem) while
 * the page scrolls `scrollLength` further; that scroll drives the screenshot
 * (progress 0..1). Once the screenshot reaches its end the page moves on.
 */
const PinnedStage: React.FC<{
  className: string;
  scrollLength: string;
  children: (progress: MotionValue<number>, manual: boolean) => React.ReactNode;
}> = ({ className, scrollLength, children }) => {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 64px', 'end end'] });

  if (reduce) return <div className={className}>{children(scrollYProgress, true)}</div>;
  return (
    <div ref={ref} className={`relative ${className}`} style={{ height: `calc(100svh - 4rem + ${scrollLength})` }}>
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col items-center justify-center gap-4 py-4 sm:gap-6 sm:py-6">
        {children(scrollYProgress, false)}
      </div>
    </div>
  );
};

const DemoHint: React.FC<{ manual: boolean; touch?: boolean }> = ({ manual, touch = false }) => {
  const Icon = touch ? Hand : Mouse;
  const scrollHint = touch
    ? (manual ? 'Geser layar HP-nya.' : 'Terus geser, layar ikut bergulir.')
    : (manual ? 'Scroll di dalam layar.' : 'Terus scroll, layar ikut bergulir.');
  return (
    <div className="flex flex-col items-center justify-center gap-2 text-sm text-ld-slate sm:flex-row sm:gap-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-ld-frost bg-white px-3.5 py-2">
        <Icon size={16} className="shrink-0 text-ld-violet" />
        {scrollHint}
      </span>
      <span className="inline-flex items-center gap-4">
        <Link
          to={`/portfolio/${DEMO_SLUG}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 font-semibold text-ld-violet no-underline hover:text-[#1f87e6]"
        >
          Buka demo penuh
          <ExternalLink size={15} />
        </Link>
        {/* The pinned demo holds the page for a few screens; let people jump past it. */}
        <a href="#kenapa" className="inline-flex items-center gap-1 font-medium text-ld-slate no-underline hover:text-ld-graphite">
          Lewati demo
          <ChevronDown size={15} />
        </a>
      </span>
    </div>
  );
};

/** Modern phone: titanium rim, side buttons, Dynamic Island, status bar, home indicator. */
const PhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative aspect-[270/556] h-[min(640px,calc(100svh-11rem))]">
    {/* Side buttons sit behind the rim so only their edges show. */}
    <span aria-hidden="true" className="absolute -left-[3px] top-[17%] h-[5%] w-[4px] rounded-l-sm bg-gradient-to-b from-[#a9aeb8] to-[#6b707a]" />
    <span aria-hidden="true" className="absolute -left-[3px] top-[25%] h-[9%] w-[4px] rounded-l-sm bg-gradient-to-b from-[#a9aeb8] to-[#6b707a]" />
    <span aria-hidden="true" className="absolute -left-[3px] top-[36%] h-[9%] w-[4px] rounded-l-sm bg-gradient-to-b from-[#a9aeb8] to-[#6b707a]" />
    <span aria-hidden="true" className="absolute -right-[3px] top-[28%] h-[13%] w-[4px] rounded-r-sm bg-gradient-to-b from-[#a9aeb8] to-[#6b707a]" />
    <div className="relative h-full rounded-[50px] bg-gradient-to-br from-[#e6e9ee] via-[#9aa0aa] to-[#4a4f59] p-[3px] shadow-[0_40px_80px_-20px_rgba(26,27,37,0.45),0_12px_24px_rgba(26,27,37,0.14)]">
      <div className="h-full rounded-[47px] bg-[#0b0c10] p-[9px]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[38px] bg-white">
          {/* Status bar */}
          <div aria-hidden="true" className="relative flex h-[38px] shrink-0 items-center justify-between bg-white px-6 text-[12px] font-semibold text-ld-onyx">
            <span className="w-12 font-ld-sans tracking-tight">9:41</span>
            <span className="absolute left-1/2 top-[9px] h-[22px] w-[78px] -translate-x-1/2 rounded-full bg-[#0b0c10]" />
            <span className="flex w-12 items-center justify-end gap-1">
              <Wifi size={13} strokeWidth={2.6} />
              <BatteryFull size={17} strokeWidth={2} />
            </span>
          </div>
          {children}
          {/* Home indicator + glass sheen */}
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-1/2 h-[4px] w-[34%] -translate-x-1/2 rounded-full bg-ld-onyx/80" />
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[38px] bg-gradient-to-br from-white/[0.12] via-transparent to-transparent" />
        </div>
      </div>
    </div>
  </div>
);

const DeviceShowcase: React.FC = () => {
  // Below md: phone mockup; md and up: MacBook only. Rendered (not just CSS-hidden)
  // one at a time so each viewport downloads only its own ~0.6MB screenshot.
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return (
  <div id="demo" className="relative z-10 mt-10 text-left sm:mt-14">
    {!isDesktop && (
    <PinnedStage className="md:hidden" scrollLength="170svh">
      {(progress, manual) => (
        <>
          <PhoneFrame>
            <ScreenImage
              progress={progress}
              manual={manual}
              src={DEMO_MOBILE}
              alt="Tampilan mobile portfolio Agus Budiman di Mentor.QA"
              label="Pratinjau portfolio versi mobile, bisa di-scroll"
              width={690}
              height={14077}
              className="min-h-0 flex-1 bg-white"
            />
          </PhoneFrame>
          <DemoHint manual={manual} touch />
        </>
      )}
    </PinnedStage>
    )}

    {isDesktop && (
    <PinnedStage className="hidden md:block" scrollLength="200svh">
      {(progress, manual) => (
        <>
          {/* Width capped by the viewport height so the whole laptop fits while pinned. */}
          <div className="relative mx-auto w-full" style={{ maxWidth: 'min(1040px, calc((100svh - 14rem) * 1.6))' }}>
            <div className="relative rounded-t-[26px] rounded-b-md border border-[#2b2d36] bg-[#0f1015] px-5 pb-[26px] pt-5 shadow-[0_40px_80px_rgba(26,27,37,0.22),0_12px_24px_rgba(26,27,37,0.12)]">
              <div className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#2b2d36]" />
              <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-md bg-white">
                <div className="flex h-10 shrink-0 items-center gap-3.5 border-b border-ld-frost bg-ld-cloud px-3.5">
                  <span className="flex gap-[7px]">
                    <span className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
                    <span className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
                    <span className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
                  </span>
                  <span className="mx-auto flex h-[26px] max-w-[460px] flex-1 items-center justify-center gap-1.5 truncate rounded-[7px] border border-ld-frost bg-white font-ld-mono text-xs text-ld-slate">
                    <Lock size={12} />
                    mentorqa.com/portfolio/<span className="font-medium text-ld-onyx">{DEMO_SLUG}</span>
                  </span>
                  <span className="w-[47px]" />
                </div>
                <ScreenImage
                  progress={progress}
                  manual={manual}
                  src={DEMO_DESKTOP}
                  alt="Tampilan asli portfolio Agus Budiman di Mentor.QA"
                  label="Pratinjau portfolio desktop, bisa di-scroll"
                  width={2940}
                  height={10744}
                  className="min-h-0 flex-1"
                />
              </div>
            </div>
            {/* MacBook base */}
            <div className="relative -mx-[7.7%] h-[22px] rounded-b-[18px] rounded-t-sm bg-gradient-to-b from-[#e4e7ec] to-[#b9bec7] shadow-[0_18px_30px_rgba(26,27,37,0.16)]">
              <div className="absolute left-1/2 top-0 h-[9px] w-[150px] -translate-x-1/2 rounded-b-[10px] bg-[#c9ced6]" />
            </div>
          </div>
          <DemoHint manual={manual} />
        </>
      )}
    </PinnedStage>
    )}
  </div>
  );
};

const HeroSection: React.FC = () => (
  <section className="relative overflow-clip bg-gradient-to-b from-white to-ld-cloud pb-16 pt-24 sm:pb-20 lg:pt-32">
    {/* Same decoration as the home hero (HomeHero): lilac glow + large pixel
        mosaics top-left (faint, behind the headline) and bottom-right. */}
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-ld-lilac/60 blur-3xl" />
    <PixelMosaic
      variant="blue"
      className="absolute left-4 top-20 opacity-20 sm:left-8 lg:left-10 lg:top-24"
      style={{ width: 'min(62vw, 640px)', transform: 'scaleX(-1)' }}
    />
    <PixelMosaic
      variant="blue"
      className="absolute bottom-6 right-4 hidden opacity-40 sm:right-8 sm:grid lg:right-10"
      style={{ width: 'min(48vw, 520px)', transform: 'scaleY(-1)' }}
    />
    <div className="relative mx-auto max-w-[1200px] px-4 text-center sm:px-6">
      <HeroBadge icon={<FreeGiftIcon size={18} />}>100% Gratis · Untuk Fresh Graduate &amp; QA Praktisi</HeroBadge>
      <h1 className="mx-auto mb-5 max-w-[920px] font-ld-display text-[42px] font-semibold leading-[0.98] tracking-[-0.025em] text-ld-graphite sm:text-[56px] lg:text-[64px]">
        Recruiter Tidak Bisa Menilai Skill QA <span className="text-ld-violet">Hanya dari CV.</span>
      </h1>
      <p className={`${LEAD} mx-auto mb-8 max-w-[780px] text-pretty sm:text-balance sm:text-lg`}>
        Tampilkan project testing, automation, test case, dan sertifikasi dalam satu link portfolio. Recruiter langsung
        lihat cara kamu bekerja, bukan cuma daftar skill.
      </p>
      <div id="hero-claim" className="mb-5">
        <ClaimUrlForm className="border border-ld-ash shadow-[0_12px_30px_rgba(59,158,255,0.14)] focus-within:border-ld-violet" />
      </div>
      <div className="flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm font-medium text-ld-slate">
        <span className="inline-flex items-center gap-2"><Check size={18} className="text-ld-violet" />Gratis selamanya</span>
        <span className="inline-flex items-center gap-2"><Code2 size={18} className="text-ld-violet" />Gak perlu coding</span>
        <span className="inline-flex items-center gap-2"><Timer size={18} className="text-ld-violet" />Siap dalam 10 menit</span>
      </div>

      <DeviceShowcase />
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Before / after                                                      */
/* ------------------------------------------------------------------ */

const BEFORE = [
  { title: 'Hanya berisi tulisan.', desc: 'Recruiter tidak bisa melihat bagaimana kamu testing.' },
  { title: 'Project tersimpan di laptop.', desc: 'Hasil belajar tidak pernah dilihat siapa pun.' },
  { title: 'Bikin website sendiri ribet.', desc: 'Akhirnya tidak pernah mulai.' },
];
const AFTER = [
  { title: 'Bukti kerja nyata.', desc: 'Test case, automation script, dan bug report bisa dibuka.' },
  { title: 'Satu link untuk semua.', desc: 'Proyek, sertifikasi, pengalaman, dan kontak.' },
  { title: 'Jadi dalam 10 menit.', desc: 'Isi form, publish, tempel link di CV.' },
];

// Tool chips on the "Sesudah" card. Postman/Jira logos come from the real portfolio's
// tool set (public/personal-portfolio/img/tools); Cypress uses its round "cy" icon.
const AFTER_TOOLS = [
  { name: 'Cypress', logo: '/qa-portfolio/img/cypress-icon.webp' },
  { name: 'Postman', logo: '/personal-portfolio/img/tools/postman-logo-new.svg' },
  { name: 'Jira', logo: '/personal-portfolio/img/tools/jira-logo-new.svg' },
];

const BeforeAfterSection: React.FC = () => (
  <section id="kenapa" className="scroll-mt-16 bg-white py-8 md:py-20">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="mb-8 text-center sm:mb-14">
        <h2 className={H2}>Kenapa Banyak QA Sulit Dipanggil Interview?</h2>
        <p className={`${LEAD} mx-auto mt-4 max-w-xl`}>
          Bukan karena skill kamu kurang. Recruiter cuma punya beberapa detik, dan CV tidak menunjukkan cara kamu testing.
        </p>
      </div>
      {/* lg: each card is a 3-row subgrid (label / illustration / list), so the two
          white illustration boxes always share one height. */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] border border-ld-frost bg-ld-cloud p-4 sm:p-9 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-0">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-ld-slate">Sebelum: CV biasa</span>
          <div className="my-6 flex flex-col justify-center gap-2 rounded-xl border border-ld-frost bg-white p-[18px]" aria-hidden="true">
            <div className="mb-1.5 flex items-center gap-3.5">
              <PdfFileIcon size={44} className="shrink-0" />
              <div className="min-w-0">
                <div className="truncate font-ld-mono text-sm font-medium text-ld-graphite">CV_Final_v3.pdf</div>
                <div className="text-[13px] text-ld-slate">1 halaman · cuma teks</div>
              </div>
            </div>
            <div className="h-2.5 w-[45%] rounded bg-ld-ash" />
            <div className="h-2 w-[90%] rounded bg-ld-frost" />
            <div className="h-2 w-[70%] rounded bg-ld-frost" />
            <div className="mt-1 truncate font-ld-mono text-xs text-ld-slate">Skills: Manual Testing, Postman, Selenium...</div>
          </div>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {BEFORE.map(({ title, desc }) => (
              <li key={title} className="flex items-start gap-3 text-[15px] leading-normal">
                <X size={18} className="mt-0.5 shrink-0 text-[#c2410c]" />
                <span><b className="text-ld-onyx">{title}</b> <span className="text-ld-slate">{desc}</span></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[20px] bg-[#0f2c4f] p-4 text-white sm:p-9 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-0">
          <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-[#9fd0ff]">Sesudah: Portfolio Mentor.QA</span>
          <div className="my-6 overflow-hidden rounded-xl bg-white">
            {/* Same "Powered by" brand mark as the real portfolio navbar (PublicPortfolioNavbar). */}
            <div className="flex items-center justify-between border-b border-ld-frost px-[18px] py-2.5">
              <span className="flex flex-col gap-0.5">
                <span className="text-[9px] leading-none text-ld-fog">Powered by:</span>
                <span className="flex items-center gap-1.5 font-ld-display text-sm font-medium leading-none tracking-tight text-ld-graphite">
                  <img src="/shared/img/mentor-logo-96.webp" alt="" width={18} height={18} loading="lazy" decoding="async" className="h-[18px] w-[18px] object-contain" />
                  <span>Mentor<span className="text-ld-violet">.QA</span></span>
                </span>
              </span>
              <span className="rounded-md bg-[#e7f8ee] px-2 py-1 font-ld-mono text-[11px] text-[#16803c]">Live</span>
            </div>
            <div className="flex items-start gap-3.5 p-[18px]">
            <img
              src="/personal-portfolio/img/profile/profile-agus.webp"
              alt="Foto profil Agus Budiman"
              width={52}
              height={52}
              loading="lazy"
              className="h-[52px] w-[52px] shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold text-ld-onyx">Agus Budiman</div>
              <div className="text-[13px] text-ld-slate">QA Engineer · Manual &amp; Automation</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AFTER_TOOLS.map(({ name, logo }) => (
                  <span key={name} className="inline-flex items-center gap-1.5 rounded-full border border-ld-frost bg-white py-0.5 pl-1 pr-2 text-[11px] font-semibold text-ld-graphite">
                    <img src={logo} alt="" width={14} height={14} loading="lazy" decoding="async" className="h-3.5 w-3.5 object-contain" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            </div>
          </div>
          <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
            {AFTER.map(({ title, desc }) => (
              <li key={title} className="flex items-start gap-3 text-[15px] leading-normal">
                <Check size={18} className="mt-0.5 shrink-0 text-[#7cc2ff]" />
                <span><b>{title}</b> <span className="text-ld-lavender">{desc}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Features bento                                                      */
/* ------------------------------------------------------------------ */

// Colour lives outside TILE_BASE so tinted tiles don't fight bg-white/border-ld-frost.
const TILE_BASE = 'relative overflow-hidden rounded-[20px] border p-4 sm:p-7';
const TILE = `${TILE_BASE} flex flex-col gap-5 border-ld-frost bg-white`;
// Features bento: below md the tiles go edge to edge like native app sections
// (no borders or radius, thin gaps of the section background between them);
// from md they are the usual rounded cards.
const FEATURE_TILE_BASE = 'relative overflow-hidden -mx-4 border-0 p-4 sm:-mx-6 sm:px-6 sm:py-7 md:mx-0 md:rounded-[20px] md:border md:p-7';
const FEATURE_TILE = `${FEATURE_TILE_BASE} flex flex-col gap-5 border-ld-frost bg-white`;
const TILE_H3_BASE = 'm-0 mb-1.5 font-ld-display font-semibold tracking-[-0.01em]';
const TILE_H3 = `${TILE_H3_BASE} text-base text-ld-graphite`;
const TILE_P_BASE = 'm-0 text-sm leading-relaxed';
const TILE_P = `${TILE_P_BASE} text-ld-slate`;
// Feature tile titles: bigger on mobile, where each tile is a full-width section.
const FEATURE_H3_SIZE = 'text-xl md:text-base';
const FEATURE_H3 = `${TILE_H3_BASE} ${FEATURE_H3_SIZE} text-ld-graphite`;

/** A window onto one section of the real demo screenshot. */
// Same chips and level badges as the real Skills section (public-profile/SkillsSection).
const SKILLS: { name: string; level: SkillLevel }[] = [
  { name: 'Manual Testing', level: 'expert' },
  { name: 'Automation Testing', level: 'intermediate' },
  { name: 'API Testing', level: 'expert' },
  { name: 'Database Testing', level: 'beginner' },
];
const SKILL_BADGE: Record<SkillLevel, string> = {
  beginner: 'bg-ld-cloud text-ld-slate',
  intermediate: 'bg-blue-500/10 text-blue-600',
  expert: 'bg-ld-violet text-white',
};

const FeaturesSection: React.FC = () => (
  <section id="fitur" className="bg-ld-cloud py-8 md:py-20">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="mb-8 text-center sm:mb-14">
        <h2 className={H2}>Semua yang Recruiter Ingin Lihat, Ada di Satu Halaman</h2>
        <p className={`${LEAD} mx-auto mt-4 max-w-xl`}>
          Bukan cuma CV digital. Setiap bagian dirancang untuk menunjukkan cara kerja QA kamu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:auto-rows-[minmax(240px,auto)]">
        <div className={`${FEATURE_TILE} md:col-span-2 lg:row-span-2`}>
          <div>
            <h3 className={FEATURE_H3}>Project Showcase</h3>
            <p className={TILE_P}>Tampilkan test case, automation framework, dan studi kasus lengkap dengan tools dan link ke repo.</p>
          </div>
          {/* Real Project Showcase section, anchored top-left; the right side crops on narrow tiles. */}
          <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-xl border border-ld-frost bg-ld-violet sm:min-h-[380px]">
            <img
              src="/qa-portfolio/img/project-showcase.webp"
              alt="Bagian Project Showcase pada portfolio asli"
              width={1500}
              height={829}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-left-top"
            />
          </div>
        </div>

        <div className={FEATURE_TILE}>
          <div>
            <h3 className={FEATURE_H3}>Experience</h3>
            <p className={TILE_P}>Timeline kerja dan pendidikan yang rapi.</p>
          </div>
          {/* Real Pengalaman Kerja section: header + the current job card. */}
          <div className="overflow-hidden rounded-xl border border-ld-frost bg-white">
            <img
              src="/qa-portfolio/img/experience.webp"
              alt="Bagian Pengalaman Kerja pada portfolio asli"
              width={690}
              height={470}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </div>
        </div>

        <div className={`${FEATURE_TILE_BASE} flex flex-col gap-5 border-ld-violet bg-ld-violet`}>
          <div>
            <h3 className={`${TILE_H3_BASE} ${FEATURE_H3_SIZE} text-white`}>Skills &amp; Tools</h3>
            <p className={`${TILE_P_BASE} text-white`}>Tunjukkan level tiap skill, dari Beginner sampai Expert.</p>
          </div>
          <div className="flex flex-wrap gap-2" aria-hidden="true">
            {SKILLS.map(({ name, level }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-semibold text-ld-graphite shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ld-violet" />
                {name}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SKILL_BADGE[level]}`}>
                  {SKILL_LEVEL_LABELS[level]}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className={FEATURE_TILE}>
          <div>
            <h3 className={FEATURE_H3}>Test Case &amp; Dokumen</h3>
            <p className={TILE_P}>Test plan dan test case yang bisa langsung dibuka recruiter.</p>
          </div>
          <div className="flex flex-col gap-2">
            {['Test Plan Checkout.pdf', 'Test Case Login (42 skenario)'].map(doc => (
              <div key={doc} className="flex items-center gap-2.5 rounded-[10px] border border-ld-frost px-3 py-2.5 text-[13px] font-medium text-ld-graphite">
                <FileText size={16} className="shrink-0 text-ld-violet" />
                {doc}
              </div>
            ))}
          </div>
        </div>

        <div className={FEATURE_TILE}>
          <div>
            <h3 className={`${FEATURE_H3} flex items-center gap-2`}>Sertifikasi <span className="rounded-full bg-ld-cloud px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ld-steel">Contoh</span></h3>
            <p className={TILE_P}>ISTQB, kursus, dan training dengan bukti terverifikasi.</p>
          </div>
          {/* Same card as the real Certification section (public-profile/CertificationsSection). */}
          <div className="flex items-start gap-3 rounded-[10px] border border-ld-frost bg-ld-canvas p-3.5 md:flex-col xl:flex-row" aria-hidden="true">
            <img
              src="/qa-portfolio/img/istqb-ctfl.webp"
              alt="Logo ISTQB Certified Tester Foundation Level"
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="h-11 w-11 shrink-0 rounded-lg object-contain"
            />
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate whitespace-nowrap font-ld-display text-sm font-semibold tracking-[-0.01em] text-ld-graphite">Certified Tester Foundation Level</span>
              <span className="text-xs font-medium text-ld-violet">ISTQB</span>
              <span className="text-[11px] text-ld-fog">Jan 2025</span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-ld-violet">
                Lihat Kredensial <ExternalLink size={11} />
              </span>
            </div>
          </div>
        </div>

        <div className={`${FEATURE_TILE} md:col-span-2 lg:col-span-1`}>
          <div>
            <h3 className={`${FEATURE_H3} flex items-center gap-2`}>Endorsement <span className="rounded-full bg-ld-cloud px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-ld-steel">Contoh</span></h3>
            <p className={TILE_P}>Rekomendasi dari rekan kerja atau mentor.</p>
          </div>
          {/* Same card as the real Endorsement section (public-profile/EndorsementCard);
              Bima is one of the fictional QA Simulator team members. */}
          <div className="flex flex-col gap-3" aria-hidden="true">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-ld-cloud">
                <img
                  src="/qa-simulator/team/bima-santoso.webp"
                  alt="Foto Bima Santoso"
                  width={44}
                  height={44}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-2">
                  <span className="truncate font-ld-display text-base font-semibold tracking-[-0.01em] text-ld-graphite">Bima Santoso</span>
                  <Linkedin size={16} className="shrink-0 text-[#0077b5]" />
                </span>
                <span className="text-xs text-ld-slate">Product Manager · Rekan satu tim</span>
              </div>
            </div>
            <p className="m-0 text-sm italic leading-relaxed text-ld-slate">
              Teliti, cepat menemukan edge case, dan dokumentasinya rapi. Setiap rilis jadi lebih tenang.
            </p>
          </div>
        </div>

        <div className={`${FEATURE_TILE_BASE} grid items-center gap-5 border-ld-lavender sm:gap-8 bg-ld-lilac md:col-span-2 lg:col-span-3 lg:grid-cols-[1fr_1.2fr] lg:gap-10`}>
          <div>
            <h3 className={`${TILE_H3_BASE} text-xl text-ld-graphite md:text-lg`}>Link sendiri, muncul di Google</h3>
            <p className={`${TILE_P_BASE} text-ld-graphite`}>
              Custom URL yang gampang ditempel di CV dan LinkedIn. Halaman sudah SEO-friendly, jadi namamu bisa ditemukan
              recruiter lewat pencarian.
            </p>
          </div>
          <div className="rounded-[14px] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(59,158,255,0.12)] sm:px-[22px]" aria-hidden="true">
            <div className="mb-4 flex items-center gap-2.5 rounded-full border border-ld-frost px-3.5 py-2.5 text-sm text-ld-graphite">
              <Search size={16} className="text-ld-slate" />
              agus budiman qa engineer
            </div>
            <div className="text-xs text-ld-graphite">mentorqa.com › portfolio › agus-budiman</div>
            <div className="my-1 text-[19px] text-[#1a0dab]">Agus Budiman · QA Engineer Manual &amp; Automation</div>
            <div className="text-[13px] leading-normal text-[#4d5156]">
              QA Engineer dengan pengalaman di Healthcare, Fintech, OTA. Lihat project, sertifikasi, dan pengalaman kerja.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* No experience                                                       */
/* ------------------------------------------------------------------ */

const PROJECT_TYPES = [
  { label: 'Capstone Project', Icon: CapstoneIcon },
  { label: 'Automation Practice', Icon: AutomationIcon },
  { label: 'API Testing', Icon: ApiTestingIcon },
  { label: 'Bootcamp Project', Icon: BootcampIcon },
  { label: 'Personal Learning', Icon: LearningIcon },
  { label: 'Dummy Project', Icon: DummyProjectIcon },
];

const NoExperienceSection: React.FC = () => (
  <section className="bg-white py-8 md:py-20">
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2 className={H2}>Belum Pernah Kerja? Tidak Masalah.</h2>
        <p className={`${LEAD} mt-4`}>
          Recruiter tetap bisa menilai kemampuanmu lewat project latihan yang terdokumentasi dengan baik. Semua ini valid
          untuk portfolio:
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {PROJECT_TYPES.map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-2.5 rounded-[14px] border border-ld-frost p-3 text-sm font-semibold leading-snug text-ld-onyx sm:gap-3 sm:p-4 sm:text-[15px]">
            <Icon size={40} className="shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const GoogleG: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.4-.2-2.1H12v4h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-7.9z" />
    <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8z" />
    <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.6l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
  </svg>
);

/**
 * Steps through `durations` (ms per phase) on a loop while `ref` is on screen.
 * Reduced motion: parks on the last phase, the "done" state.
 */
function useLoopPhase(durations: readonly number[], ref: React.RefObject<Element | null>) {
  const reduce = useReducedMotion();
  const inView = useInView(ref, { amount: 0.5 });
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (reduce || !inView) return;
    const t = window.setTimeout(() => setPhase(p => (p + 1) % durations.length), durations[phase]);
    return () => window.clearTimeout(t);
  }, [phase, inView, reduce, durations]);
  return reduce ? durations.length - 1 : phase;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// idle → cursor moves in → press → signed in
const LOGIN_TIMING = [700, 650, 220, 2000] as const;

const GoogleLoginVisual: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useLoopPhase(LOGIN_TIMING, ref);
  const signedIn = phase === 3;
  const cursor =
    phase === 0 ? { x: 80, y: 40, opacity: 0 } : phase === 3 ? { x: 34, y: 26, opacity: 0 } : { x: 26, y: 8, opacity: 1 };
  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <motion.span
        animate={{ scale: phase === 2 ? 0.94 : 1 }}
        transition={{ duration: 0.15 }}
        className={`inline-flex min-w-[200px] items-center justify-center gap-2.5 rounded-[10px] border bg-white px-[18px] py-3 text-sm font-semibold text-ld-onyx transition-colors duration-300 ${
          signedIn ? 'border-emerald-300' : 'border-ld-ash'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {signedIn ? (
            <motion.span
              key="in"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-2"
            >
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-emerald-500">
                <Check size={11} strokeWidth={3.5} className="text-white" />
              </span>
              Akun terhubung
            </motion.span>
          ) : (
            <motion.span
              key="google"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-2.5"
            >
              <GoogleG />
              Masuk dengan Google
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
      <motion.span
        className="pointer-events-none absolute left-1/2 top-1/2"
        initial={false}
        animate={cursor}
        transition={{ duration: phase === 1 ? 0.6 : 0.3, ease: EASE_OUT }}
      >
        <MousePointer2 size={22} className="fill-ld-graphite text-white" strokeWidth={1.5} />
      </motion.span>
    </div>
  );
};

const FIELD_TITLE = 'Automation Checkout';
const FIELD_TOOLS = 'Cypress, Postman';
const TYPED_TOTAL = FIELD_TITLE.length + FIELD_TOOLS.length;
// empty → one phase per typed character → hold the filled form
const TYPE_TIMING = [600, ...Array<number>(TYPED_TOTAL).fill(55), 2000] as const;

const FormField: React.FC<{ label: string; value: string; active: boolean }> = ({ label, value, active }) => (
  <div
    className={`flex h-[30px] items-center whitespace-nowrap rounded-lg border bg-white px-3 text-xs text-ld-graphite transition-shadow duration-200 ${
      active ? 'border-ld-violet ring-1 ring-ld-violet' : 'border-ld-frost'
    }`}
  >
    <span className="mr-1 shrink-0 text-ld-slate">{label}:</span>
    <span className="min-w-0 truncate">{value}</span>
    {active && <span className="ml-0.5 h-3.5 w-px animate-pulse bg-ld-violet" />}
  </div>
);

const ProfileFormVisual: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const typed = Math.min(useLoopPhase(TYPE_TIMING, ref), TYPED_TOTAL);
  const onTitle = typed < FIELD_TITLE.length;
  return (
    <div ref={ref} className="flex w-full flex-col gap-2.5 px-5">
      <FormField label="Judul proyek" value={FIELD_TITLE.slice(0, typed)} active={onTitle} />
      <FormField label="Tools" value={FIELD_TOOLS.slice(0, Math.max(0, typed - FIELD_TITLE.length))} active={!onTitle} />
    </div>
  );
};

// draft → published → link copied
const PUBLISH_TIMING = [1100, 900, 1900] as const;

const PublishVisual: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const phase = useLoopPhase(PUBLISH_TIMING, ref);
  const live = phase >= 1;
  const copied = phase === 2;
  return (
    <div ref={ref} className="flex w-full flex-col items-center gap-3">
      <span className="inline-flex items-center gap-2 text-xs font-semibold text-ld-graphite">
        <span className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${live ? 'bg-emerald-500' : 'bg-ld-ash'}`}>
          <motion.span
            className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
            initial={false}
            animate={{ x: live ? 16 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </span>
        <span className="w-9">{live ? 'Live' : 'Draft'}</span>
      </span>
      <span className="inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-[10px] border border-ld-frost bg-white px-3 py-2.5 font-ld-mono text-[11px] text-ld-graphite sm:gap-2.5 sm:px-3.5 sm:text-xs md:text-[11px] xl:text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          {live && <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />}
          <span className={`relative h-2 w-2 rounded-full transition-colors duration-300 ${live ? 'bg-emerald-500' : 'bg-ld-ash'}`} />
        </span>
        <span className="min-w-0 truncate">
          mentorqa.com/portfolio/<span className="hidden xl:inline">nama-</span>kamu
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'copied' : 'link'}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex shrink-0"
          >
            {copied ? <Check size={14} strokeWidth={3} className="text-emerald-600" /> : <Link2 size={14} className="text-ld-violet" />}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
};

const STEPS: { title: string; desc: string; visual: React.ReactNode }[] = [
  { title: 'Login dengan Google', desc: 'Gratis, tanpa kartu kredit, langsung bisa dipakai.', visual: <GoogleLoginVisual /> },
  { title: 'Isi Profil & Proyek', desc: 'Lengkapi profil, proyek, sertifikasi, dan pengalaman kerjamu.', visual: <ProfileFormVisual /> },
  { title: 'Publish & Bagikan Link', desc: 'Portfolio langsung online, siap ditempel di CV dan LinkedIn.', visual: <PublishVisual /> },
];

const HowItWorksSection: React.FC = () => {
  // Below md the steps are a swipeable slider (same pattern as career-path BenefitsSection) with dots.
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const slides = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    slides.forEach((c, i) => {
      if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - center) < Math.abs(slides[best].offsetLeft + slides[best].offsetWidth / 2 - center)) best = i;
    });
    setActive(best);
  };
  const goTo = (i: number) => {
    const el = listRef.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - 16, behavior: 'smooth' });
  };
  return (
  <section id="cara-kerja" className="bg-ld-cloud py-8 md:py-20">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="mb-8 text-center sm:mb-14">
        <h2 className={H2}>3 Langkah, Portfolio Siap Tayang</h2>
        <p className={`${LEAD} mx-auto mt-4 max-w-xl`}>Tidak perlu coding atau desain. Isi data, publish, selesai.</p>
      </div>
      <ol
        ref={listRef}
        onScroll={onScroll}
        aria-label="Langkah membuat portfolio"
        className="-mx-4 my-0 flex list-none snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-0 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {STEPS.map(({ title, desc, visual }, idx) => (
          <li key={title} className={`${TILE} w-[86%] shrink-0 snap-start sm:w-[60%] md:w-[46%] lg:w-auto`}>
            <span className="font-ld-mono text-[13px] font-medium text-ld-violet">0{idx + 1}</span>
            <div className="flex h-[120px] items-center justify-center overflow-hidden rounded-xl bg-ld-cloud" aria-hidden="true">{visual}</div>
            <div>
              <h3 className={TILE_H3}>{title}</h3>
              <p className={TILE_P}>{desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex justify-center gap-2 lg:hidden">
        {STEPS.map(({ title }, i) => (
          <button
            key={title}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Langkah ${i + 1}: ${title}`}
            aria-current={active === i ? 'step' : undefined}
            className={`h-2 cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${active === i ? 'w-6 bg-ld-violet' : 'w-2 bg-ld-ash'}`}
          />
        ))}
      </div>
      <div className="mt-8 text-center lg:mt-12">
        <Link to="/dashboard/portfolios" className={`${BTN_PRIMARY} w-full sm:w-auto`}>
          Buat Portfolio Sekarang
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
  );
};

/* ------------------------------------------------------------------ */
/* For who                                                             */
/* ------------------------------------------------------------------ */

const STAGES = ['Fresh Graduate', 'Junior QA', 'Automation QA', 'Senior QA'];
const GROUPS = [
  {
    label: 'Fresh Graduate & QA Baru',
    title: 'Bangun Kredibilitas Sejak Awal Karier',
    points: [
      'Dokumentasikan proyek latihan dan studi kasus testing',
      'Perkuat CV dengan bukti kerja nyata',
      'Link portfolio siap dilampirkan saat melamar',
    ],
  },
  {
    label: 'QA Experienced & Praktisi',
    title: 'Tunjukkan Rekam Jejak sebagai Praktisi',
    points: [
      'Pamerkan pengalaman dan proyek yang pernah dikerjakan',
      'Bangun kredibilitas di depan recruiter maupun klien',
      'Satu link untuk portfolio, sertifikasi, dan kontak',
    ],
  },
];

const ForWhoSection: React.FC = () => (
  <section className="bg-ld-violet py-8 text-white md:py-20">
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
      <div>
        <h2 className={`${H2} text-white`}>Cocok untuk Semua Level QA</h2>
        <p className={`${LEAD} mt-4 text-white`}>Dari fresh graduate sampai senior. Portfolio kamu berkembang bareng kariermu.</p>
        <ol className="m-0 mt-9 list-none border-b border-white/20 p-0">
          {STAGES.map((stage, idx) => (
            <li key={stage} className="flex items-center gap-3.5 border-t border-white/20 py-3 text-base font-semibold">
              <span className="font-ld-mono text-[13px] font-normal">0{idx + 1}</span>
              {stage}
            </li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4">
        {GROUPS.map(({ label, title, points }) => (
          <div key={label} className="rounded-[20px] bg-white p-4 text-ld-graphite sm:p-7">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#0d5aad]">{label}</span>
            <h3 className="mb-4 mt-2 font-ld-display text-xl font-semibold tracking-[-0.01em] text-ld-graphite">{title}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px]">
              {points.map(p => (
                <li key={p} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check size={12} strokeWidth={3.5} className="text-white" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* Mentoring                                                           */
/* ------------------------------------------------------------------ */

const MENTORING_POINTS = [
  { label: 'Review Portfolio', Icon: ReviewPortfolioIcon },
  { label: 'Review CV', Icon: ReviewCvIcon },
  { label: 'Mock Interview', Icon: MockInterviewIcon },
  { label: 'Career Advice', Icon: CareerAdviceIcon },
];

const MentoringSection: React.FC = () => (
  <section id="mentoring" className="bg-white py-8 md:py-20">
    <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
      <div className="relative grid grid-cols-1 overflow-hidden rounded-[28px] border border-ld-lavender bg-[linear-gradient(0deg,#ffffff_0%,#f1f8ff_55%,#e3f2ff_100%)] xl:grid-cols-[1.05fr_1fr] xl:bg-[linear-gradient(90deg,#ffffff_0%,#f1f8ff_45%,#e3f2ff_100%)]">
        <PixelMosaic
          variant="white"
          className="pointer-events-none absolute -left-6 -top-6 w-[min(60vw,360px)] opacity-70"
          style={{ transform: 'scaleX(-1)' }}
        />
        <div className="relative p-4 sm:p-12">
          <h2 className={H2}>
            Portfolio Sudah Jadi. <span className="text-ld-violet">Sekarang Saatnya <span className="whitespace-nowrap">Di-review.</span></span>
          </h2>
          <p className={`${LEAD} mt-4`}>Mentor QA praktisi bantu memastikan portfolio dan CV kamu siap dilirik recruiter.</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-ld-graphite">
            <span className="inline-flex items-center gap-1.5">
              <Briefcase size={15} className="text-ld-violet" />
              6+ tahun pengalaman
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={15} className="text-ld-violet" />
              Healthcare, Fintech, OTA
            </span>
          </div>
          <ul className="m-0 mb-8 mt-7 grid list-none grid-cols-2 gap-2.5 p-0 sm:gap-3">
            {MENTORING_POINTS.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-[14px] border border-ld-lavender bg-white p-2.5 text-sm font-semibold leading-snug text-ld-onyx sm:gap-3 sm:p-3 sm:text-[15px]"
              >
                <Icon size={32} className="shrink-0" />
                {label}
              </li>
            ))}
          </ul>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
            <Link to="/mentoring/booking" className={`${BTN_PRIMARY} w-full whitespace-nowrap sm:w-auto`}>
              Book Mentoring
              <ArrowRight size={18} />
            </Link>
            <span className="inline-flex items-center justify-center gap-1.5 text-[13px] text-ld-slate">
              <Timer size={15} className="text-ld-violet" />
              Sesi 60 menit, jadwal fleksibel
            </span>
          </div>
        </div>
        <div className="relative order-first p-4 pb-0 xl:order-last xl:py-3 xl:pl-0 xl:pr-3">
          <div className="relative h-full min-h-[280px] overflow-hidden rounded-[22px] bg-white sm:min-h-[360px] md:min-h-[420px] xl:min-h-[360px]">
            <img
              src="/qa-portfolio/img/mentoring-benefit.webp"
              alt="Review portfolio bersama mentor QA"
              width={1100}
              height={944}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-[center_30%] md:object-contain md:object-bottom xl:object-cover xl:object-[center_30%]"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-[14px] border border-ld-frost bg-white px-4 py-3 shadow-[0_12px_30px_rgba(59,158,255,0.14)]">
              <span className="font-ld-display text-2xl font-semibold text-ld-violet">1-on-1</span>
              <span className="text-[13px] font-semibold leading-tight text-ld-onyx">Sesi<br />Personal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* FAQ + final CTA                                                     */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: 'Cocok untuk fresh graduate yang belum punya pengalaman kerja?',
    a: 'Tentu bisa. Isi dengan capstone project, automation practice, API testing, atau project bootcamp. Recruiter lebih peduli pada bukti kerja nyata daripada status pengalaman.',
  },
  {
    q: 'Apakah benar-benar gratis?',
    a: 'Ya, membuat dan mempublikasikan portfolio QA di Mentor.QA sepenuhnya gratis, tanpa biaya tersembunyi.',
  },
  {
    q: 'Bagaimana kalau saya belum pernah membuat automation?',
    a: 'Tidak masalah. Mulai dari manual testing dan test case yang sudah pernah kamu kerjakan. Automation bisa ditambahkan begitu kamu mulai belajar.',
  },
  {
    q: 'Apakah project dari bootcamp boleh dimasukkan ke portfolio?',
    a: 'Boleh banget. Project bootcamp, capstone, atau latihan pribadi tetap valid ditampilkan, selama menunjukkan proses dan hasil kerjamu sebagai QA.',
  },
  {
    q: 'Perlu skill desain atau coding?',
    a: 'Tidak perlu. Cukup isi profil, proyek, sertifikasi, dan pengalaman kerja. Tampilan portfolio sudah didesain untuk kamu.',
  },
  {
    q: 'Berapa lama waktu yang dibutuhkan?',
    a: 'Sekitar 5-10 menit kalau data sudah siap. Kamu juga bisa simpan draft dan lanjutkan kapan saja.',
  },
  {
    q: 'Bisa diedit setelah dipublish?',
    a: 'Bisa, kapan saja. Perubahan langsung tampil di link yang sama, jadi link yang sudah kamu tempel di CV dan LinkedIn tetap berlaku.',
  },
  {
    q: 'Bisa disembunyikan dulu dari publik?',
    a: 'Bisa. Simpan sebagai draft dan link publiknya tidak bisa dibuka siapa pun. Kalau sudah siap, tinggal publish. Portfolio yang sudah tayang juga bisa dijadikan draft lagi.',
  },
  {
    q: 'Apakah portfolio saya bisa ditemukan di Google?',
    a: 'Bisa. Portfolio yang sudah dipublish punya judul dan deskripsi sendiri, jadi namamu bisa muncul saat recruiter mencari di Google. Portfolio draft tidak tampil di mana pun.',
  },
];

const FaqSection: React.FC = () => (
  <section id="faq" className="border-t border-ld-frost bg-white py-8 md:py-20">
    <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div>
        <h2 className={H2}>Pertanyaan Umum</h2>
        <p className={`${LEAD} mt-4 sm:text-base`}>Masih ada yang mengganjal? Berikut jawaban seputar Portfolio QA di Mentor.QA.</p>
      </div>
      <FaqAccordion items={FAQS} className="w-full" />
    </div>
  </section>
);

// "Klaim URL" CTA, used in the hero (centred) and the final CTA (left-aligned). Only a visual hook for now: the slug is not passed
// on, submit just opens the dashboard.
const PLACEHOLDER_NAMES = ['budi-santoso', 'rina-qa', 'dimas-pratama'];

/**
 * Placeholder that types out sample slugs, deletes them and moves to the next,
 * while `active` (empty, unfocused, on screen). Otherwise, and with reduced
 * motion, it's the static "nama-kamu".
 */
function useTypingPlaceholder(active: boolean): string {
  const reduce = useReducedMotion();
  const [state, setState] = useState({ name: 0, len: 0, deleting: false });
  const run = active && !reduce;
  useEffect(() => {
    if (!run) return;
    const word = PLACEHOLDER_NAMES[state.name];
    let next = state;
    let delay = state.deleting ? 45 : 95;
    if (!state.deleting && state.len < word.length) next = { ...state, len: state.len + 1 };
    else if (!state.deleting) { next = { ...state, deleting: true }; delay = 1400; }
    else if (state.len > 0) next = { ...state, len: state.len - 1 };
    else { next = { name: (state.name + 1) % PLACEHOLDER_NAMES.length, len: 0, deleting: false }; delay = 350; }
    const t = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(t);
  }, [run, state]);
  if (!run) return 'nama-kamu';
  return PLACEHOLDER_NAMES[state.name].slice(0, state.len) || '\u200b';
}

type SlugCheck = 'idle' | 'checking' | 'available' | 'taken' | 'error';

/**
 * "Klaim Gratis" URL field. Cleans the input as it's typed, checks availability
 * live (same endpoint as the portfolio editor), then parks the slug and sends
 * the guest to the Portfolio section: login first, where it's named, and the
 * editor opens with it prefilled (lib/portfolioClaim). The check is advisory;
 * the editor re-checks on save.
 */
const ClaimUrlForm: React.FC<{ className?: string; align?: 'center' | 'left' }> = ({ className = '', align = 'center' }) => {
  const navigate = useNavigate();
  const [slug, setSlug] = useState('');
  const [check, setCheck] = useState<{ slug: string; state: SlugCheck }>({ slug: '', state: 'idle' });
  const [emptyError, setEmptyError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [focused, setFocused] = useState(false);
  const formInView = useInView(formRef, { amount: 0.5 });
  const placeholder = useTypingPlaceholder(!slug && !focused && formInView);
  const inputId = useId();
  const hintId = useId();
  const finalSlug = finalizeSlug(slug);

  useEffect(() => {
    if (!finalSlug) return;
    let cancelled = false;
    const t = window.setTimeout(async () => {
      setCheck({ slug: finalSlug, state: 'checking' });
      try {
        const { available } = await apiCheckSlug(finalSlug);
        if (!cancelled) setCheck({ slug: finalSlug, state: available ? 'available' : 'taken' });
      } catch {
        if (!cancelled) setCheck({ slug: finalSlug, state: 'error' });
      }
    }, 400);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [finalSlug]);

  // Only trust a result for the slug currently in the box.
  const state: SlugCheck = finalSlug && check.slug === finalSlug ? check.state : 'idle';
  const suggestion = state === 'taken' ? suggestSlug(finalSlug) : '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalSlug) {
      setEmptyError(true);
      inputRef.current?.focus();
      return;
    }
    if (state === 'taken') {
      inputRef.current?.focus();
      return;
    }
    parkPortfolioClaim(finalSlug);
    track('portfolio_claim_submitted', { availability: state });
    navigate('/dashboard/portfolios');
  };

  let hint: React.ReactNode = null;
  if (emptyError && !finalSlug) {
    hint = <span className="text-ld-slate">Tulis nama untuk link portfolio kamu dulu, misalnya <b className="font-ld-mono font-medium text-ld-onyx">budi-santoso</b>.</span>;
  } else if (state === 'checking') {
    hint = (
      <span className="inline-flex items-center gap-1.5 text-ld-slate">
        <Loader2 size={15} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-ld-violet motion-safe:animate-spin" />
        Mengecek ketersediaan...
      </span>
    );
  } else if (state === 'available') {
    hint = (
      <span className="inline-flex items-center gap-1.5 text-emerald-700">
        <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500">
          <Check size={10} strokeWidth={3.5} className="text-white" />
        </span>
        <span><b className="font-ld-mono font-medium">{finalSlug}</b> masih tersedia</span>
      </span>
    );
  } else if (state === 'taken') {
    hint = (
      <span className="text-[#c2410c]">
        <b className="font-ld-mono font-medium">{finalSlug}</b> sudah dipakai. Coba{' '}
        <button
          type="button"
          onClick={() => { setSlug(suggestion); inputRef.current?.focus(); }}
          className="cursor-pointer border-0 bg-transparent p-0 font-ld-mono font-semibold text-ld-violet underline underline-offset-2"
        >
          {suggestion}
        </button>
      </span>
    );
  }

  return (
    <div className={`w-full max-w-[600px] ${align === 'center' ? 'mx-auto' : ''}`}>
      <form
        ref={formRef}
        onSubmit={submit}
        noValidate
        className={`flex flex-col gap-2 rounded-[14px] bg-white p-2 text-left sm:flex-row ${className}`}
      >
        <label htmlFor={inputId} className="flex min-w-0 flex-1 items-center pl-3 font-ld-mono text-[13px] text-ld-slate sm:pl-3.5 sm:text-[15px]">
          <span className="whitespace-nowrap">mentorqa.com/portfolio/</span>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={slug}
            onChange={e => { setSlug(sanitizeSlugInput(e.target.value)); setEmptyError(false); }}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setSlug(s => finalizeSlug(s)); }}
            placeholder={placeholder}
            aria-label="Nama URL portfolio"
            aria-describedby={hintId}
            aria-invalid={state === 'taken' || (emptyError && !finalSlug) ? true : undefined}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={SLUG_MAX_LENGTH}
            className="w-0 min-w-0 flex-1 border-0 bg-transparent px-1 py-3 font-ld-mono text-[13px] text-ld-onyx outline-none sm:text-[15px]"
          />
        </label>
        <button type="submit" className={`${BTN_PRIMARY} shrink-0 cursor-pointer whitespace-nowrap border-0 shadow-none`}>
          Klaim Gratis
          <ArrowRight size={18} />
        </button>
      </form>
      <p
        id={hintId}
        aria-live="polite"
        className={`m-0 mt-2 min-h-5 text-[13px] leading-5 ${align === 'center' ? 'text-center' : 'text-left'}`}
      >
        {hint}
      </p>
    </div>
  );
};

// Same layout as the career-path final CTA (FinalCta): copy + claim field on
// the left, cut-out photo with glow and pixel mosaics on the section's bottom edge.
const FinalCtaSection: React.FC = () => (
  <section id="klaim" className="relative scroll-mt-16 overflow-hidden bg-white pt-16 md:pt-24 xl:pt-0">
    <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-[-10%] h-[560px] w-[560px] rounded-full bg-ld-lilac/60 blur-3xl" />
    <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-4 sm:px-6 xl:grid-cols-12">
      <div className="relative z-10 xl:col-span-7 xl:self-center xl:py-24">
        <h2 className="m-0 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.025em] text-ld-graphite md:text-[40px]">
          Siap Mendapatkan Interview QA Berikutnya?
        </h2>
        <p className="m-0 mt-4 max-w-xl text-base leading-relaxed text-ld-slate sm:text-lg">
          Klaim link portfolio kamu sekarang, sebelum diambil orang lain.
        </p>
        <div className="mt-8">
          <ClaimUrlForm align="left" className="border border-ld-ash shadow-[0_12px_30px_rgba(59,158,255,0.14)] focus-within:border-ld-violet" />
        </div>
        <p className="m-0 mt-2 text-[13px] text-ld-slate">Gratis selamanya · Login Google · Custom URL</p>
      </div>
      <div className="relative mx-auto w-full max-w-[420px] self-end xl:col-span-5 xl:-ml-[18%] xl:mr-0 xl:w-[118%] xl:max-w-none xl:pt-5">
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 aspect-square w-[85%] -translate-x-1/2 rounded-full bg-ld-violet/15 blur-3xl" />
        <PixelMosaic variant="blue" className="absolute top-4 -right-2 w-[45%] max-w-[280px] opacity-70 xl:-right-8" />
        <PixelMosaic variant="blue" className="absolute bottom-0 right-[80%] hidden w-[65%] opacity-70 sm:grid" style={{ transform: 'scaleY(-1)' }} />
        <img
          src="/shared/img/journey/cta.webp"
          alt="Dua QA Engineer, salah satunya menunjukkan portfolio di tablet"
          width={1100}
          height={843}
          loading="lazy"
          decoding="async"
          className="relative block h-auto w-full"
        />
      </div>
    </div>
  </section>
);

/* ------------------------------------------------------------------ */

/**
 * Looping mini illustration for the sticky claim bar: a profile card fills in
 * (name, role, two skill chips) and gets a blue "published" tick, then resets.
 * Brand icon style: white tile (sits on the bar's blue gradient), Graphite outline,
 * one Sky Blue focal element.
 * Reduced motion shows the finished card, still.
 */
const PortfolioBuildIllustration: React.FC = () => {
  const reduce = useReducedMotion();
  // One 3.2s loop: each part animates in at `start` (fraction of the loop),
  // holds, and everything resets together near the end.
  const loop = (key: 'scaleX' | 'scale' | 'opacity', start: number, overshoot = false) => {
    if (reduce) return { initial: false as const, animate: { [key]: 1 } };
    const times = overshoot ? [0, start, start + 0.08, start + 0.13, 0.88, 1] : [0, start, start + 0.14, 0.88, 1];
    const values = overshoot ? [0, 0, 1.2, 1, 1, 0] : [0, 0, 1, 1, 0];
    return {
      initial: false as const,
      animate: { [key]: values },
      transition: { duration: 3.2, times, repeat: Infinity, ease: 'easeInOut' as const },
    };
  };
  const fromLeft = { transformBox: 'fill-box' as const, transformOrigin: 'left center' };
  const fromCenter = { transformBox: 'fill-box' as const, transformOrigin: 'center' };
  return (
    <svg width="44" height="44" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <rect x="0.5" y="0.5" width="47" height="47" rx="12" fill="#fff" stroke="#c9e4ff" />
      {/* profile card */}
      <rect x="8" y="10" width="32" height="28" rx="4.5" fill="#fff" stroke="#36394a" strokeWidth="1.8" />
      <circle cx="15.5" cy="18" r="3.6" fill="#3b9eff" />
      <motion.rect x="22" y="15.2" width="13" height="2.6" rx="1.3" fill="#36394a" style={fromLeft} {...loop('scaleX', 0.08)} />
      <motion.rect x="22" y="20" width="9" height="2.2" rx="1.1" fill="#cdd2d9" style={fromLeft} {...loop('scaleX', 0.22)} />
      <motion.rect x="12" y="26.5" width="9" height="4.5" rx="2.25" fill="#c9e4ff" {...loop('opacity', 0.36)} />
      <motion.rect x="23" y="26.5" width="11" height="4.5" rx="2.25" fill="#c9e4ff" {...loop('opacity', 0.44)} />
      {/* published tick */}
      <motion.g style={fromCenter} {...loop('scale', 0.56, true)}>
        <circle cx="38" cy="36" r="6.5" fill="#3b9eff" stroke="#fff" strokeWidth="2" />
        <path d="M35.3 36.1l1.8 1.8 3.6-3.7" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
};

/**
 * Mobile-only bar pinned to the bottom once the pinned demo is behind the reader, so the CTA is never more than a tap away on a ~13-screen page. Hidden
 * again when the final claim section comes into view. Tapping scrolls to that
 * section's form (keeps the slug check + claim flow in one place).
 */
const MobileClaimBar: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (isDesktop) return;
    const update = () => {
      // Start after the pinned demo (its hint sits at the bottom of the screen).
      const afterDemo = document.querySelector('#kenapa');
      const finalSection = document.querySelector('#klaim');
      if (!afterDemo || !finalSection) return;
      const pastHero = afterDemo.getBoundingClientRect().top < window.innerHeight * 0.6;
      const beforeFinal = finalSection.getBoundingClientRect().top > window.innerHeight - 80;
      setShow(pastHero && beforeFinal);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [isDesktop]);

  const goToClaim = () => {
    const section = document.querySelector('#klaim');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => section?.querySelector('input')?.focus({ preventScroll: true }), 600);
  };

  if (isDesktop) return null;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-x-0 bottom-0 z-[900] border-t border-ld-lavender bg-[linear-gradient(100deg,#c9e4ff_0%,#e3f2ff_45%,#f5faff_100%)] px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_30px_rgba(59,158,255,0.18)] md:hidden"
        >
          <div className="flex items-center gap-3">
            <PortfolioBuildIllustration />
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate text-sm font-semibold text-ld-onyx">Portfolio QA kamu</p>
              <p className="m-0 truncate text-xs text-ld-slate">Gratis, jadi 10 menit</p>
            </div>
            <button type="button" onClick={goToClaim} className={`${BTN_PRIMARY} min-h-11 shrink-0 cursor-pointer gap-1.5 border-0 px-3.5 text-sm shadow-none`}>
              Klaim
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const QaPortfolioLandingPage: React.FC = () => (
  <div className="w-full bg-ld-canvas font-ld-sans text-ld-graphite">
    <HeroSection />
    <BeforeAfterSection />
    <FeaturesSection />
    <NoExperienceSection />
    <HowItWorksSection />
    <ForWhoSection />
    <MentoringSection />
    <FaqSection />
    <FinalCtaSection />
    <MobileClaimBar />
  </div>
);

export default QaPortfolioLandingPage;
