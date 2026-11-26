/* eslint-disable react-refresh/only-export-components -- Node build script, never loaded by Vite (no HMR). */
// Generates the 1200×630 social-share (Open Graph) images for the static
// public pages: public/shared/img/og/<name>.png. Run with `npm run og:build`
// after changing copy or visuals here, then bump OG_VERSION in
// src/lib/pageSeo.ts so chat apps drop their cached previews.
//
// Each image = brand frame (logo, product chip, headline, URL) on the left +
// a product-specific card composition on the right, in the landing's visual
// language (docs/DESIGN.md: white cards, hairline borders, slate shadows,
// Sky Blue accent, pixel mosaic). Rendered with React → static HTML →
// screenshot in the locally installed Google Chrome via Playwright.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import {
  DashboardIcon, MentoringIcon, QaCourseIcon, QaLibraryIcon, QaPortfolioIcon, QaSimulatorIcon,
} from '../../src/components/illustration/ProductIcons';
import CartoonAvatar from '../../src/components/illustration/CartoonAvatar';
import type { OgImageName } from '../../src/lib/pageSeo';
import { LOWEST_MENTORING_PRICE } from '../../src/lib/pageSeo';
import experience from '../../src/features/personal-portfolio/data/experience.json';
import projects from '../../src/features/personal-portfolio/data/projects.json';
import certifications from '../../src/features/personal-portfolio/data/certifications.json';
import { QA_COURSE_LEVEL_LABEL, type QaCourseLevel } from '../../src/types/qaCourse';
// Seed source of the course (the DB copy is what /programs shows at runtime;
// a build script can't read it). Re-run og:build after changing either.
import juniorCourse from '../../content/qa-course/junior-qa-ready/course.json';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = resolve(ROOT, 'public/shared/img/og');
const W = 1200;
const H = 630;

const dataUri = (rel: string, mime: string) =>
  `data:${mime};base64,${readFileSync(resolve(ROOT, rel)).toString('base64')}`;
const FONT_INTER = dataUri('public/fonts/inter-latin-var.3100e775.woff2', 'font/woff2');
const FONT_MONO = dataUri('public/fonts/ibm-plex-mono-latin-400.08949f72.woff2', 'font/woff2');
const LOGO = dataUri('public/shared/img/mentor-logo.webp', 'image/webp');
// Transparent cut-out (profile-agus.webp has a caption baked into the photo).
const AGUS = dataUri('public/personal-portfolio/img/profile/hero-agus.webp', 'image/webp');

// The /career-path hero photo (mirrored on the page, so mirrored here too).
const HERO = dataUri('public/shared/img/journey/hero.webp', 'image/webp');

// docs/DESIGN.md tokens
const T = {
  white: '#ffffff', cloud: '#f6f8fa', frost: '#eceff3', ash: '#cdd2d9', fog: '#a4abb8',
  steel: '#818898', slate: '#666d80', graphite: '#36394a', onyx: '#1a1b25',
  violet: '#3b9eff', lavender: '#c9e4ff', lilac: '#e3f2ff',
  green: '#10b981', greenBg: '#ecfdf5', greenText: '#047857',
  amberBg: '#fffbeb', amberText: '#b45309', red: '#ef4444', redBg: '#fef2f2',
};
const SHADOW = '0 24px 50px -16px rgba(39,40,53,0.25)';
const MONO = "'Plex Mono', ui-monospace, monospace";

type Css = React.CSSProperties;
const card = (extra: Css = {}): Css => ({
  background: T.white, border: `1px solid ${T.frost}`, borderRadius: 16, boxShadow: SHADOW, ...extra,
});
const row = (extra: Css = {}): Css => ({ display: 'flex', alignItems: 'center', ...extra });
const Pill: React.FC<{ bg: string; fg: string; children: React.ReactNode; style?: Css }> = ({ bg, fg, children, style }) => (
  <span style={{ background: bg, color: fg, borderRadius: 8, padding: '5px 10px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', ...style }}>{children}</span>
);
const Bar: React.FC<{ pct: number; color: string; w?: number; h?: number }> = ({ pct, color, w = 96, h = 8 }) => (
  <span style={{ display: 'block', width: w, height: h, borderRadius: h, background: T.frost, overflow: 'hidden', flexShrink: 0 }}>
    <span style={{ display: 'block', width: `${pct}%`, height: '100%', borderRadius: h, background: color }} />
  </span>
);
const Check: React.FC<{ size?: number; bg?: string }> = ({ size = 26, bg = T.green }) => (
  <span style={{ width: size, height: size, borderRadius: size, background: bg, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);

/** Round crop of the cut-out photo, face centred, on a lilac disc. */
const AgusAvatar: React.FC<{ size: number }> = ({ size }) => (
  <span style={{ width: size, height: size, borderRadius: size, flexShrink: 0, display: 'inline-block', backgroundColor: T.lilac, backgroundImage: `url(${AGUS})`, backgroundSize: '200%', backgroundPosition: '50% 8%', backgroundRepeat: 'no-repeat' }} />
);

// Brand pixel mosaic (same pattern as components/illustration/PixelMosaic).
const PATTERN = ['......PWWBB.', '....P.WBBWBB', '.....PWWBBWB', '...P..PWBWBB', '......PPWWBW', '....P...PWWB', '.........PWW', '.......P..PW', '...........P'];
type TileTints = Record<'B' | 'W' | 'P', string>;
const BLUE_TILES: TileTints = { B: T.violet, W: T.lavender, P: T.lilac };
const Mosaic: React.FC<{ style: Css; cell?: number; tiles?: TileTints }> = ({ style, cell = 30, tiles = BLUE_TILES }) => (
  <div style={{ position: 'absolute', display: 'grid', gridTemplateColumns: `repeat(12, ${cell}px)`, gap: 5, ...style }}>
    {PATTERN.flatMap((r, y) => [...r].map((ch, x) => (
      <span key={`${x}-${y}`} style={{ width: cell, height: cell, borderRadius: 3, background: tiles[ch as keyof TileTints] ?? 'transparent' }} />
    )))}
  </div>
);

// ── Frame ───────────────────────────────────────────────────────────────────

interface Spec {
  name: OgImageName;
  icon: React.FC<{ size?: number }>;
  label: string;
  badge?: { text: string; bg: string; fg: string };
  /** Headline parts; strings wrapped in [] render in the accent colour. */
  headline: (string | [string])[];
  sub: string;
  path: string;
  visual: React.ReactNode;
  /** Headline font size (default 56). */
  titleSize?: number;
  /** 'blue': dark-blue gradient background with white text (ad-facing images). */
  tone?: Tone;
}

const FREE = { text: 'Gratis', bg: T.greenBg, fg: T.greenText };
const PAID = { text: `Mulai ${LOWEST_MENTORING_PRICE}`, bg: '#fef3c7', fg: '#92400e' };

// Dark blue the white hero text sits on (~5:1 for white, ~3.8:1 for lavender).
// Brand #3b9eff alone is only ~2.7:1 under white, see docs/DESIGN.md.
const DEEP_BLUE = '#0f6fd1';
// /programs hero band (ProgramsPage BLUE_BAND): dark top half, brand blue below.
const BAND_BG = `linear-gradient(180deg, ${DEEP_BLUE} 50%, ${T.violet} 100%)`;

// Everything that differs per tone, looked up once by Frame.
type Tone = 'light' | 'blue';
const TONES: Record<Tone, {
  bg: string; glow: string; tiles: TileTints; mosaicOpacity: number; stripe: boolean; logoRing?: string;
  text: string; accent: string; sub: string; url: string;
}> = {
  light: {
    bg: T.white,
    glow: `radial-gradient(circle, ${T.lilac} 0%, rgba(227,242,255,0.55) 45%, rgba(255,255,255,0) 70%)`,
    tiles: BLUE_TILES, mosaicOpacity: 0.35, stripe: true,
    text: T.graphite, accent: T.violet, sub: T.slate, url: T.steel,
  },
  blue: {
    // The left text column (x 72-592) stays on solid DEEP_BLUE; brand blue
    // only comes in behind the product visual on the right.
    bg: `linear-gradient(90deg, ${DEEP_BLUE} 50%, ${T.violet} 100%)`,
    glow: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0) 70%)',
    tiles: { B: 'rgba(255,255,255,0.22)', W: 'rgba(255,255,255,0.14)', P: 'rgba(255,255,255,0.08)' },
    mosaicOpacity: 1, stripe: false, logoRing: '0 0 0 2px rgba(255,255,255,0.85)',
    text: T.white, accent: T.lavender, sub: 'rgba(255,255,255,0.95)', url: 'rgba(255,255,255,0.9)',
  },
};

const Frame: React.FC<{ s: Spec }> = ({ s }) => {
  const Icon = s.icon;
  const c = TONES[s.tone ?? 'light'];
  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: c.bg, fontFamily: "'Inter', system-ui, sans-serif", color: c.text }}>
      <div style={{ position: 'absolute', top: -260, right: -180, width: 760, height: 760, borderRadius: '50%', background: c.glow }} />
      <Mosaic style={{ right: 28, bottom: 24, opacity: c.mosaicOpacity, transform: 'scaleY(-1)' }} cell={26} tiles={c.tiles} />
      {c.stripe && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: T.violet }} />}

      {/* left: brand + message */}
      <div style={{ position: 'absolute', left: 72, top: 60, bottom: 56, width: 520, display: 'flex', flexDirection: 'column' }}>
        <div style={row({ gap: 12 })}>
          <img src={LOGO} width={44} height={44} style={{ borderRadius: 10, boxShadow: c.logoRing }} />
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, color: c.text }}>Mentor<span style={{ color: c.accent }}>.QA</span></span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={row({ gap: 14 })}>
            <Icon size={52} />
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2.4, textTransform: 'uppercase', color: c.text }}>{s.label}</span>
            {s.badge && <Pill bg={s.badge.bg} fg={s.badge.fg} style={{ fontSize: 15 }}>{s.badge.text}</Pill>}
          </div>
          <h1 style={{ margin: '26px 0 0', fontSize: s.titleSize ?? 56, lineHeight: s.titleSize ? 1.05 : 1.07, fontWeight: 600, letterSpacing: s.titleSize ? s.titleSize * -0.028 : -1.6, color: c.text }}>
            {s.headline.map((part, i) => (Array.isArray(part)
              // Short accents (e.g. "QA Engineer") never split across lines.
              ? <span key={i} style={{ color: c.accent, whiteSpace: part[0].length <= 14 ? 'nowrap' : 'normal' }}>{part[0]}</span>
              : <span key={i}>{part}</span>))}
          </h1>
          <p style={{ margin: '20px 0 0', fontSize: 23, lineHeight: 1.45, color: c.sub }}>{s.sub}</p>
        </div>
        <span style={{ fontFamily: MONO, fontSize: s.path.length > 26 ? 16 : 19, color: c.url, whiteSpace: 'nowrap' }}>mentorqa.com{s.path === '/' ? '' : s.path}</span>
      </div>

      {/* right: product visual */}
      <div style={{ position: 'absolute', left: 640, right: 56, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {s.visual}
      </div>
    </div>
  );
};

// ── Visuals ─────────────────────────────────────────────────────────────────

const HomeVisual = () => {
  const rows = [
    { icon: QaCourseIcon, t: 'QA Course', m: '9 / 12 lesson selesai', bar: [75, T.green] as const },
    { icon: QaSimulatorIcon, t: 'QA Simulator', m: 'Phase 3 / 3 · Bug Hunting', bar: [92, T.violet] as const },
    { icon: QaLibraryIcon, t: 'QA Library', m: '12 artikel dibaca', bar: [60, T.green] as const },
    { icon: QaPortfolioIcon, t: 'Portfolio QA', m: 'Dilihat 24× minggu ini', pill: <Pill bg={T.greenBg} fg={T.greenText}>+6</Pill> },
    { icon: MentoringIcon, t: 'Mentoring 1-on-1', m: 'Sabtu, 10.00 WIB', pill: <Pill bg={T.lilac} fg={T.violet}>Terjadwal</Pill> },
  ];
  return (
    <div style={card({ width: 470, overflow: 'hidden' })}>
      <div style={row({ gap: 14, padding: '18px 22px', borderBottom: `1px solid ${T.frost}` })}>
        <CartoonAvatar size={46} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: T.onyx }}>Hai, Kamu 👋</div>
          <div style={{ fontSize: 15, color: T.slate, marginTop: 2 }}>Perjalanan jadi QA Engineer</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 600, color: T.violet, lineHeight: 1 }}>72%</div>
          <div style={{ fontSize: 13, color: T.fog, marginTop: 4 }}>siap kerja</div>
        </div>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.t} style={row({ gap: 14, border: `1px solid ${T.frost}`, borderRadius: 12, padding: '10px 14px' })}>
              <Icon size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: T.onyx }}>{r.t}</div>
                <div style={{ fontSize: 14, color: T.slate, marginTop: 1 }}>{r.m}</div>
              </div>
              {'bar' in r && r.bar ? <Bar pct={r.bar[0]} color={r.bar[1]} w={84} /> : r.pill}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CourseVisual = () => {
  const lessons: [string, string, 'done' | 'next' | 'locked'][] = [
    ['Belajar', 'Membaca PRD seperti QA', 'done'],
    ['Praktik', 'Misi: temukan gap requirement', 'done'],
    ['Belajar', 'Teknik test design dasar', 'done'],
    ['Praktik', 'Misi: tulis test case', 'next'],
    ['Belajar', 'Bug report yang jelas', 'locked'],
  ];
  return (
    <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={card({ ...row({ gap: 16 }), padding: 18, width: 400 })}>
        <QaCourseIcon size={52} />
        <div style={{ flex: 1 }}>
          <Pill bg={T.lilac} fg={T.violet} style={{ fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' }}>Pemula</Pill>
          <div style={{ fontSize: 20, fontWeight: 600, color: T.onyx, marginTop: 6 }}>Junior QA Ready</div>
          <div style={{ fontSize: 14, color: T.slate, marginTop: 2 }}>Belajar · Praktik · Lulus</div>
        </div>
        <svg width="64" height="64" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke={T.frost} strokeWidth="4.5" />
          <circle cx="20" cy="20" r="16" fill="none" stroke={T.violet} strokeWidth="4.5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 16 * 0.6} 200`} transform="rotate(-90 20 20)" />
          <text x="20" y="23.5" textAnchor="middle" fontSize="10" fontWeight="600" fill={T.onyx} fontFamily={MONO}>60%</text>
        </svg>
      </div>
      <div style={card({ padding: '16px 18px' })}>
        <div style={{ fontSize: 15, fontWeight: 600, color: T.onyx, marginBottom: 8 }}>Modul 1 · Dari PRD ke test case</div>
        {lessons.map(([kind, title, state]) => (
          <div key={title} style={row({ gap: 12, padding: '6px 0' })}>
            {state === 'done' && <Check size={26} />}
            {state === 'next' && <span style={{ width: 26, height: 26, borderRadius: 26, background: T.violet, border: `6px solid ${T.lavender}`, boxSizing: 'border-box', flexShrink: 0 }} />}
            {state === 'locked' && <span style={{ width: 26, height: 26, borderRadius: 26, background: T.cloud, border: `1px solid ${T.frost}`, flexShrink: 0 }} />}
            <div style={row({ gap: 10, flex: 1, padding: '7px 10px', borderRadius: 10, background: state === 'next' ? T.lilac : 'transparent', border: `1px solid ${state === 'next' ? T.lavender : 'transparent'}`, opacity: state === 'locked' ? 0.5 : 1 })}>
              <Pill bg={kind === 'Belajar' ? T.greenBg : T.amberBg} fg={kind === 'Belajar' ? T.greenText : T.amberText} style={{ fontSize: 11.5, letterSpacing: 1, textTransform: 'uppercase', padding: '4px 8px' }}>{kind}</Pill>
              <span style={{ fontSize: 16, fontWeight: state === 'next' ? 600 : 400, color: T.onyx, flex: 1 }}>{title}</span>
              {state === 'next' && <Pill bg={T.violet} fg={T.white} style={{ fontSize: 13 }}>Lanjut</Pill>}
            </div>
          </div>
        ))}
      </div>
      <div style={card({ ...row({ gap: 12 }), padding: '12px 16px', alignSelf: 'flex-end', marginTop: -6 })}>
        <QaPortfolioIcon size={40} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.onyx }}>Lulus! 🎉</div>
          <div style={{ fontSize: 13, color: T.slate }}>Portfolio studi kasus siap dibagikan</div>
        </div>
      </div>
    </div>
  );
};

const SimulatorVisual = () => (
  <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 18 }}>
    <div style={row({ gap: 12, alignSelf: 'flex-start' })}>
      <span style={{ width: 44, height: 44, borderRadius: 44, background: T.amberBg, border: `2px solid ${T.white}`, boxShadow: SHADOW, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: T.amberText }}>R</span>
      <div style={card({ padding: '12px 16px', borderRadius: 14 })}>
        <div style={{ fontSize: 13, color: T.slate }}><b style={{ color: T.onyx }}>Rani</b> · PM · #squad-splitbill</div>
        <div style={{ fontSize: 16, color: T.onyx, marginTop: 4 }}>PRD Split Bill v2 siap, tolong di-review ya!</div>
      </div>
    </div>
    <div style={card({ overflow: 'hidden' })}>
      <div style={row({ justifyContent: 'space-between', background: T.onyx, color: T.white, padding: '12px 18px', fontSize: 15, fontWeight: 600 })}>
        <span>QA Simulator</span><span style={{ color: '#9aa3b2', fontWeight: 400 }}>Split Bill v2</span>
      </div>
      <div style={{ padding: '14px 18px' }}>
        <div style={row({ justifyContent: 'space-between', marginBottom: 10 })}>
          <span style={{ fontSize: 15, fontWeight: 600, color: T.onyx }}>Tugas 2 · Tulis test case</span>
          <Pill bg={T.greenBg} fg={T.greenText} style={{ fontSize: 12 }}>Submitted</Pill>
        </div>
        {['TC-01 Pajak dihitung setelah service', 'TC-02 Diskon > subtotal ditolak', 'TC-03 Nama peserta duplikat'].map((t) => (
          <div key={t} style={row({ gap: 12, padding: '9px 12px', marginTop: 6, borderRadius: 10, background: T.cloud })}>
            <Check size={22} bg={T.violet} />
            <span style={{ fontSize: 15, color: T.graphite, flex: 1 }}>{t}</span>
            <Pill bg={T.lilac} fg={T.violet} style={{ fontSize: 11 }}>P1</Pill>
          </div>
        ))}
      </div>
    </div>
    <div style={card({ padding: '14px 18px', width: 380, alignSelf: 'flex-end', borderLeft: `4px solid ${T.red}` })}>
      <div style={row({ justifyContent: 'space-between' })}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: T.slate }}>SB-3 · Bug report</span>
        <Pill bg={T.redBg} fg={T.red} style={{ fontSize: 12 }}>Major</Pill>
      </div>
      <div style={{ fontSize: 17, fontWeight: 600, color: T.onyx, marginTop: 6 }}>Pajak dihitung sebelum service charge</div>
      <div style={{ fontSize: 13, color: T.slate, marginTop: 4 }}>Expected Rp103.950 · Actual Rp103.500</div>
    </div>
  </div>
);

const LibraryVisual = () => {
  const articles = [
    { cat: 'Test Design', t: 'Boundary value analysis untuk menemukan bug di batas input', min: 7, g: `linear-gradient(135deg, ${T.greenBg}, ${T.lilac})` },
    { cat: 'Bug Report', t: 'Menulis bug report yang langsung dipahami developer', min: 5, g: `linear-gradient(135deg, ${T.lilac}, ${T.amberBg})` },
  ];
  return (
    <div style={{ width: 480, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={card({ padding: 16, width: 440 })}>
        <div style={row({ gap: 10, background: T.cloud, border: `1px solid ${T.frost}`, borderRadius: 10, padding: '10px 14px' })}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.fog} strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 16, color: T.graphite }}>boundary value analysis</span>
          <span style={{ width: 2, height: 20, background: T.violet }} />
        </div>
        <div style={row({ gap: 8, marginTop: 12, flexWrap: 'wrap' })}>
          {['Fundamental', 'Test Design', 'Automation', 'AI in QA'].map((c, i) => (
            <Pill key={c} bg={i === 1 ? T.violet : T.cloud} fg={i === 1 ? T.white : T.slate} style={{ fontSize: 13, border: i === 1 ? 'none' : `1px solid ${T.frost}` }}>{c}</Pill>
          ))}
        </div>
      </div>
      {articles.map((a, i) => (
        <div key={a.t} style={card({ ...row({ gap: 16 }), padding: 14, marginLeft: i === 1 ? 40 : 0 })}>
          <div style={{ width: 150, height: 92, borderRadius: 10, background: a.g, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QaLibraryIcon size={46} />
          </div>
          <div style={{ flex: 1 }}>
            <Pill bg={T.greenBg} fg={T.greenText} style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{a.cat}</Pill>
            <div style={{ fontSize: 16.5, fontWeight: 600, color: T.onyx, marginTop: 8, lineHeight: 1.3 }}>{a.t}</div>
            <div style={{ fontSize: 13, color: T.slate, marginTop: 6 }}>Praktisi QA · {a.min} mnt baca</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PortfolioVisual = () => (
  <div style={{ position: 'relative', width: 470 }}>
    <div style={card({ overflow: 'hidden' })}>
      <div style={row({ gap: 8, padding: '12px 16px', background: T.cloud, borderBottom: `1px solid ${T.frost}` })}>
        {[T.red, '#f59e0b', T.green].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: 11, background: c, opacity: 0.7 }} />)}
        <span style={{ marginLeft: 10, flex: 1, background: T.white, border: `1px solid ${T.frost}`, borderRadius: 8, padding: '6px 12px', fontFamily: MONO, fontSize: 14, color: T.graphite }}>mentorqa.com/portfolio/nama-kamu</span>
      </div>
      <div style={{ padding: 22 }}>
        <div style={row({ gap: 16 })}>
          <CartoonAvatar size={72} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.onyx }}>Nama Kamu</div>
            <div style={{ fontSize: 15, color: T.slate, marginTop: 2 }}>QA Engineer · Manual & API Testing</div>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.steel, letterSpacing: 1.4, textTransform: 'uppercase', margin: '20px 0 10px' }}>Project</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['Split Bill v2', 'Studi kasus QA Simulator', T.lilac], ['E-commerce Checkout', '42 test case · 6 bug', T.greenBg]].map(([t, m, bg]) => (
            <div key={t} style={{ borderRadius: 12, border: `1px solid ${T.frost}`, overflow: 'hidden' }}>
              <div style={{ height: 56, background: bg }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.onyx }}>{t}</div>
                <div style={{ fontSize: 12.5, color: T.slate, marginTop: 2 }}>{m}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={row({ gap: 8, marginTop: 16, flexWrap: 'wrap' })}>
          {['Postman', 'Jira', 'SQL', 'ISTQB'].map((c) => <Pill key={c} bg={T.cloud} fg={T.graphite} style={{ fontSize: 13, border: `1px solid ${T.frost}` }}>{c}</Pill>)}
        </div>
      </div>
    </div>
    <div style={card({ ...row({ gap: 10 }), position: 'absolute', left: -36, bottom: -22, padding: '10px 14px' })}>
      <Pill bg={T.greenBg} fg={T.greenText}>+6</Pill>
      <span style={{ fontSize: 14, color: T.graphite }}>Dilihat 24× minggu ini</span>
    </div>
  </div>
);

const MentoringVisual = () => (
  <div style={{ width: 470, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={row({ gap: 10, alignSelf: 'flex-start', alignItems: 'flex-end' })}>
      <CartoonAvatar size={40} />
      <div style={card({ padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 4, maxWidth: 330 })}>
        <span style={{ fontSize: 16, color: T.onyx }}>Kak, CV dan portfolio-ku sudah kurevisi. Bisa direview?</span>
      </div>
    </div>
    <div style={row({ gap: 10, alignSelf: 'flex-end', alignItems: 'flex-end' })}>
      <div>
        <div style={{ fontSize: 13, color: T.slate, textAlign: 'right', marginBottom: 4 }}><b style={{ color: T.onyx }}>Agus</b> · Mentor</div>
        <div style={{ background: T.onyx, color: 'rgba(255,255,255,0.92)', borderRadius: 18, borderBottomRightRadius: 4, padding: '12px 16px', fontSize: 16, maxWidth: 330, boxShadow: '0 12px 28px -10px rgba(26,27,37,0.5)' }}>
          Sudah jauh lebih rapi! Sabtu kita latihan interview, ya.
        </div>
      </div>
      <AgusAvatar size={40} />
    </div>
    <div style={card({ padding: 18, marginTop: 6 })}>
      <div style={row({ gap: 14 })}>
        <MentoringIcon size={48} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.onyx }}>Sesi 1-on-1 · 60 menit</div>
          <div style={{ fontSize: 14, color: T.slate, marginTop: 2 }}>Review CV & latihan interview</div>
        </div>
        <Pill bg={T.lilac} fg={T.violet}>Terjadwal</Pill>
      </div>
      <div style={row({ gap: 10, marginTop: 14, padding: '10px 14px', background: T.cloud, borderRadius: 10, justifyContent: 'space-between' })}>
        <span style={{ fontSize: 15, color: T.graphite }}>📅 Sabtu, 10.00 WIB</span>
        <span style={{ fontSize: 15, color: T.graphite }}>Mulai <b style={{ color: T.onyx }}>{LOWEST_MENTORING_PRICE}</b> / sesi</span>
      </div>
    </div>
  </div>
);

const BookingVisual = () => {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const off = new Set([7, 14, 21, 28]); // Minggu (week starts Senin)
  return (
    <div style={{ width: 470, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card({ padding: 18 })}>
        <div style={row({ justifyContent: 'space-between', marginBottom: 12 })}>
          <span style={{ fontSize: 17, fontWeight: 600, color: T.onyx }}>Pilih tanggal</span>
          <span style={{ fontSize: 14, color: T.slate }}>60 menit / sesi</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((d, i) => <span key={i} style={{ fontSize: 12, color: T.fog, textAlign: 'center' }}>{d}</span>)}
          {days.map((d) => (
            <span key={d} style={{ height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: d === 13 ? 600 : 400,
              background: d === 13 ? T.violet : off.has(d) ? 'transparent' : T.cloud, color: d === 13 ? T.white : off.has(d) ? T.ash : T.graphite }}>{d}</span>
          ))}
        </div>
      </div>
      <div style={card({ padding: 18 })}>
        <div style={row({ gap: 12 })}>
          <AgusAvatar size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: T.onyx }}>Agus Budiman</div>
            <div style={{ fontSize: 13, color: T.slate }}>Automation · Review CV · Interview</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14 }}>
          {['09.00', '10.00', '13.00', '19.00'].map((t) => (
            <span key={t} style={{ padding: '9px 0', textAlign: 'center', borderRadius: 9, fontSize: 14, fontWeight: 600, border: `1px solid ${t === '10.00' ? T.violet : T.frost}`, background: t === '10.00' ? T.lilac : T.white, color: t === '10.00' ? T.violet : T.graphite }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: '11px 0', textAlign: 'center', borderRadius: 10, background: '#22c55e', color: T.white, fontSize: 15, fontWeight: 600 }}>Konfirmasi via WhatsApp</div>
      </div>
    </div>
  );
};

// /programs ad landing: a phone showing the page itself (featured card with
// the one blue CTA + the other programs), plus one floating "tap" card.
const ProgramsVisual = () => {
  const others: [React.FC<{ size?: number }>, string, string, boolean?][] = [
    [QaSimulatorIcon, 'QA Simulator', 'Simulasi kerja QA di SplitBill'],
    [MentoringIcon, 'Mentoring 1-on-1', 'Sesi bareng praktisi QA', true],
  ];
  const chip = (t: string) => <span key={t} style={{ background: T.cloud, color: T.slate, borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 500 }}>{t}</span>;
  return (
    <div style={{ position: 'relative', width: 500, height: 630, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      {/* phone: the QA Simulator landing's iPhone (ProjectMockups.tsx <Phone>,
          164×340) scaled ×2.2: thin bezel, dynamic island, side buttons.
          Runs off the bottom edge of the image. */}
      <div style={{ position: 'relative', marginTop: 40, flexShrink: 0, width: 360, height: 746 }}>
        {[[136, 44, 'l'], [202, 70, 'l'], [281, 70, 'l'], [220, 105, 'r']].map(([top, h, side]) => (
          <span key={`${side}${top}`} style={{ position: 'absolute', top: top as number, height: h as number, width: 7, background: T.graphite, ...(side === 'l' ? { left: -4, borderRadius: '4px 0 0 4px' } : { right: -4, borderRadius: '0 4px 4px 0' }) }} />
        ))}
        <div style={{ position: 'relative', height: '100%', borderRadius: 66, background: T.onyx, padding: 9, boxShadow: '0 40px 80px -24px rgba(16,24,40,0.5)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 57, background: T.white, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 18, left: '50%', marginLeft: -48, width: 97, height: 26, borderRadius: 26, background: T.onyx }} />
          {/* header + hero on the same blue band as the live page */}
          <div style={{ background: BAND_BG, paddingBottom: 18 }}>
          <div style={row({ gap: 8, padding: '58px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.15)' })}>
            <img src={LOGO} width={22} height={22} style={{ borderRadius: 5, boxShadow: '0 0 0 1.5px rgba(255,255,255,0.85)' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: T.white }}>Mentor<span style={{ color: T.lilac }}>.QA</span></span>
          </div>
          <div style={{ padding: '16px 16px 0' }}>
            <div style={{ fontSize: 23, fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.6, color: T.white }}>
              Mau jadi <span style={{ color: T.lavender }}>QA Engineer</span>? Pilih jalurmu.
            </div>
            {/* featured card */}
            <div style={{ marginTop: 14, background: T.white, border: `1px solid ${T.frost}`, borderRadius: 12, padding: 14, boxShadow: '0 10px 24px rgba(16,60,120,0.28)' }}>
              <div style={row({ gap: 10 })}>
                <QaCourseIcon size={40} />
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 500, color: T.violet }}>Rekomendasi · QA Course</div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: T.graphite, marginTop: 1 }}>{juniorCourse.title}</div>
                </div>
              </div>
              <div style={row({ gap: 5, marginTop: 10 })}>{['Gratis', `±${juniorCourse.estimatedHours.toLocaleString('id-ID')} jam`, QA_COURSE_LEVEL_LABEL[juniorCourse.level as QaCourseLevel]].map(chip)}</div>
              <div style={{ marginTop: 12, height: 38, borderRadius: 8, background: T.violet, color: T.white, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                Mulai belajar <span style={{ fontSize: 15 }}>→</span>
              </div>
            </div>
          </div>
          </div>
          <div style={{ background: T.cloud, borderTop: `1px solid ${T.frost}`, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, height: 400 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.graphite }}>Program lainnya</div>
            {others.map(([Icon, t, d, paid]) => (
              <div key={t} style={row({ gap: 10, background: paid ? 'linear-gradient(135deg, #fff 55%, #fffbeb)' : T.white, border: `1px solid ${paid ? '#fde68a' : T.frost}`, borderRadius: 12, padding: '9px 11px' })}>
                <Icon size={32} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: T.steel }}>{t}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.graphite, whiteSpace: 'nowrap' }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
      {/* floating card */}
      <div style={card({ ...row({ gap: 12 }), position: 'absolute', left: -40, bottom: 22, padding: '12px 16px' })}>
        <Check size={30} bg={T.violet} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.onyx }}>Satu klik, langsung mulai</div>
          <div style={{ fontSize: 13, color: T.slate, marginTop: 1 }}>Tanpa login untuk lesson pertama</div>
        </div>
      </div>
    </div>
  );
};

/** /career-path hero: the same photo with its two floating program cards. */
const CareerPathVisual = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <img src={HERO} width={560} height={560} style={{ position: 'absolute', left: -28, bottom: 0, display: 'block', transform: 'scaleX(-1)' }} />
    <div style={card({ position: 'absolute', right: -24, top: 44, width: 236, padding: '16px 18px' })}>
      <div style={row({ gap: 12 })}>
        <QaCourseIcon size={44} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: T.onyx }}>QA Course</div>
          <div style={{ fontSize: 14, color: T.slate, marginTop: 2 }}>Junior QA Ready</div>
        </div>
      </div>
      <div style={{ marginTop: 14 }}><Bar pct={75} color={T.violet} w={198} /></div>
      <div style={row({ justifyContent: 'space-between', marginTop: 8, fontSize: 13, color: T.slate })}>
        <span>Learning progress</span><span style={{ fontWeight: 600, color: T.violet }}>75%</span>
      </div>
    </div>
    <div style={card({ position: 'absolute', left: -44, bottom: 44, padding: '12px 20px 12px 12px' })}>
      <div style={row({ gap: 12 })}>
        <MentoringIcon size={44} />
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: T.onyx }}>QA Mentoring</div>
          <div style={{ fontSize: 14, color: T.slate, marginTop: 2 }}>1-on-1 career guidance</div>
        </div>
      </div>
    </div>
  </div>
);

type Variant = 'base' | 'about' | 'projects' | 'certifications';
const PersonalVisual: React.FC<{ v: Variant }> = ({ v }) => {
  const exp = (experience as { company: string; role: string; period: string }[]).slice(0, 3);
  const proj = (projects as { title: string }[]).slice(0, 3);
  const certs = (certifications as { title?: string; name?: string; issuer: string }[]).slice(0, 3);
  const listItem = (title: string, meta: string, i: number, mark: React.ReactNode) => (
    <div key={title} style={row({ gap: 12, padding: '10px 0', borderTop: i ? `1px solid ${T.frost}` : 'none' })}>
      {mark}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: T.onyx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: 13, color: T.slate, marginTop: 1 }}>{meta}</div>
      </div>
    </div>
  );
  const dot = (c: string) => <span style={{ width: 12, height: 12, borderRadius: 12, background: c, flexShrink: 0, boxShadow: `0 0 0 4px ${T.lilac}` }} />;
  return (
    <div style={{ position: 'relative', width: 480, height: 520 }}>
      <div style={card({ position: 'absolute', left: 0, top: 0, width: 250, overflow: 'hidden' })}>
        <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: `linear-gradient(160deg, ${T.lilac} 0%, ${T.lavender} 100%)` }}>
          <img src={AGUS} width={260} height={260} style={{ position: 'absolute', left: -5, bottom: -48, display: 'block' }} />
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: T.onyx }}>Agus Budiman</div>
          <div style={{ fontSize: 14, color: T.slate, marginTop: 2 }}>QA Engineer · 6+ tahun</div>
        </div>
      </div>
      <div style={card({ position: 'absolute', right: 0, bottom: 0, width: 320, padding: '14px 18px' })}>
        {v === 'base' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.steel, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>Keahlian</div>
            <div style={row({ gap: 8, flexWrap: 'wrap' })}>
              {['Automation Testing', 'API Testing', 'Manual Testing', 'Performance', 'AI for QA'].map((c, i) => (
                <Pill key={c} bg={i === 0 ? T.violet : T.cloud} fg={i === 0 ? T.white : T.graphite} style={{ fontSize: 13, border: i === 0 ? 'none' : `1px solid ${T.frost}` }}>{c}</Pill>
              ))}
            </div>
          </>
        )}
        {v === 'about' && exp.map((e, i) => listItem(e.company, `${e.role} · ${e.period.replace(/ - /, ' – ')}`, i, dot(i === 0 ? T.violet : T.lavender)))}
        {v === 'projects' && proj.map((p, i) => listItem(p.title, ['Tooling QA', 'Automation reporting', 'Web app'][i] ?? 'Project', i, <QaSimulatorIcon size={34} />))}
        {v === 'certifications' && certs.map((c, i) => listItem(c.title ?? c.name ?? '', c.issuer, i, <Check size={26} bg={i === 0 ? T.violet : T.green} />))}
      </div>
    </div>
  );
};

// ── Specs ───────────────────────────────────────────────────────────────────

const SPECS: Spec[] = [
  { name: 'home', icon: DashboardIcon, label: 'Platform karier QA', headline: ['Belajar, praktik, dan siap kerja sebagai ', ['QA Engineer']], sub: 'Course, simulasi kerja, portfolio, dan mentoring dalam satu akun.', path: '/', visual: <HomeVisual /> },
  { name: 'courses', icon: QaCourseIcon, label: 'QA Course', badge: FREE, headline: ['Belajar QA dari nol, ', ['lulus bawa portfolio']], sub: 'Lesson singkat berurutan, misi praktik, lalu portfolio studi kasus.', path: '/courses', visual: <CourseVisual /> },
  { name: 'qa-simulator', icon: QaSimulatorIcon, label: 'QA Simulator', badge: FREE, headline: ['Rasakan jadi QA di ', ['tim produk sungguhan']], sub: 'Review PRD, tulis test case, berburu bug, putuskan Go / No-Go.', path: '/qa-simulator', visual: <SimulatorVisual /> },
  { name: 'qa-library', icon: QaLibraryIcon, label: 'QA Library', badge: FREE, headline: ['Materi QA yang ', ['langsung kepakai']], sub: 'Dari fundamental testing sampai automation, ditulis praktisi.', path: '/qa-library', visual: <LibraryVisual /> },
  { name: 'portfolio', icon: QaPortfolioIcon, label: 'Portfolio QA', badge: FREE, headline: ['Tunjukkan skill-mu, ', ['bukan cuma CV']], sub: 'Portfolio online dengan link sendiri, siap dikirim ke recruiter.', path: '/portfolio', visual: <PortfolioVisual /> },
  { name: 'mentoring', icon: MentoringIcon, label: 'Mentoring 1-on-1', badge: PAID, headline: ['Dibimbing langsung oleh ', ['praktisi QA']], sub: 'Review CV dan portfolio, latihan interview, sampai automation.', path: '/mentoring', visual: <MentoringVisual /> },
  { name: 'programs', icon: DashboardIcon, label: 'Program', tone: 'blue', titleSize: 68, badge: { text: 'Mulai gratis', bg: T.white, fg: DEEP_BLUE }, headline: ['Mau jadi ', ['QA Engineer'], '? Pilih jalurmu.'], sub: 'Course, simulasi kerja, portfolio, dan mentoring. Mulai dari satu klik.', path: '/programs', visual: <ProgramsVisual /> },
  { name: 'career-path', icon: DashboardIcon, label: 'Find Your QA Journey', badge: FREE, headline: ['Level Up Karier QA\u2011mu, ', ['Mulai\u00a0dari\u00a0Sini.']], sub: '4 pertanyaan singkat. Dapatkan program yang cocok dengan tujuanmu.', path: '/career-path', visual: <CareerPathVisual /> },
  { name: 'mentoring-booking', icon: MentoringIcon, label: 'Booking mentoring', badge: PAID, headline: ['Pilih mentor, topik, dan ', ['jadwalmu']], sub: 'Sesi 60 menit, termasuk akhir pekan. Konfirmasi lewat WhatsApp.', path: '/mentoring/booking', visual: <BookingVisual /> },
  { name: 'personal-portfolio', icon: QaPortfolioIcon, label: 'Portfolio pribadi', headline: ['Agus Budiman, ', ['QA Engineer']], sub: '6+ tahun di automation, manual, dan API testing.', path: '/personal-portfolio', visual: <PersonalVisual v="base" /> },
  { name: 'personal-about', icon: QaPortfolioIcon, label: 'Tentang', headline: ['Perjalanan karier sebagai ', ['QA Engineer']], sub: 'Pengalaman kerja, pendidikan, dan cerita di baliknya.', path: '/personal-portfolio/about', visual: <PersonalVisual v="about" /> },
  { name: 'personal-projects', icon: QaPortfolioIcon, label: 'Proyek', headline: ['Proyek QA dari ', ['pengalaman nyata']], sub: 'AI test case generator, automation reporting, dan lainnya.', path: '/personal-portfolio/projects', visual: <PersonalVisual v="projects" /> },
  { name: 'personal-certifications', icon: QaPortfolioIcon, label: 'Sertifikasi', headline: ['Sertifikasi ', ['QA & software testing']], sub: 'Cloud, performance testing, dan pengembangan web.', path: '/personal-portfolio/certifications', visual: <PersonalVisual v="certifications" /> },
];

const html = (body: string) => `<!doctype html><html><head><meta charset="utf-8" />
<style>
@font-face { font-family: 'Inter'; src: url(${FONT_INTER}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Plex Mono'; src: url(${FONT_MONO}) format('woff2'); font-weight: 400; }
* { box-sizing: border-box; } html, body { margin: 0; -webkit-font-smoothing: antialiased; }
</style></head><body>${body}</body></html>`;

async function main() {
  const only = process.argv.slice(2);
  mkdirSync(OUT, { recursive: true });
  // Uses the installed Google Chrome (no Playwright browser download needed).
  const browser = await chromium.launch({ channel: process.env.OG_BROWSER_CHANNEL ?? 'chrome' });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const s of SPECS) {
    if (only.length && !only.includes(s.name)) continue;
    await page.setContent(html(renderToStaticMarkup(<Frame s={s} />)), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = resolve(OUT, `${s.name}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: W, height: H } });
    console.log('✓', `public/shared/img/og/${s.name}.png`);
  }
  await browser.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
