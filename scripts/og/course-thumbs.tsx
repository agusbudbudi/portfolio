/* eslint-disable react-refresh/only-export-components -- Node build script, never loaded by Vite (no HMR). */
// Generates 1280×720 (16:9, matches the QA Library card's aspect-video)
// thumbnails for every article of a QA Course content folder, in the same
// brand language as build.tsx (docs/DESIGN.md tokens, Inter, pixel mosaic).
// Left: brand + course/module/lesson chip + article title. Right: a visual
// per module, picked by module number from the frontmatter `course:` line.
//
// Usage: npm run course:thumbs -- content/qa-course/fintech-qa-ready
// Output: <dir>/thumbnails/<NN>-<slug>.png per article, plus
// <dir>/thumbnails/course.png when the folder has a course.json (uploaded by
// `npm run publish:course`). Add --course to render only course.png (for a
// course whose articles already have thumbnails).
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { chromium } from 'playwright';
import { QaCourseIcon, QaLibraryIcon, QaSimulatorIcon } from '../../src/components/illustration/ProductIcons';
import type { CourseFile } from '../lib/courseContent';
import { QA_COURSE_LEVEL_LABEL } from '../../src/types/qaCourse';

const ROOT = resolve(import.meta.dirname, '../..');
const W = 1280;
const H = 720;

const dataUri = (rel: string, mime: string) =>
  `data:${mime};base64,${readFileSync(resolve(ROOT, rel)).toString('base64')}`;
const FONT_INTER = dataUri('public/fonts/inter-latin-var.3100e775.woff2', 'font/woff2');
const FONT_MONO = dataUri('public/fonts/ibm-plex-mono-latin-400.08949f72.woff2', 'font/woff2');
const LOGO = dataUri('public/shared/img/mentor-logo.webp', 'image/webp');

const T = {
  white: '#ffffff', cloud: '#f6f8fa', frost: '#eceff3', ash: '#cdd2d9', fog: '#a4abb8',
  steel: '#818898', slate: '#666d80', graphite: '#36394a', onyx: '#1a1b25',
  violet: '#3b9eff', lavender: '#c9e4ff', lilac: '#e3f2ff',
  green: '#10b981', greenBg: '#ecfdf5', greenText: '#047857',
  amber: '#f59e0b', amberBg: '#fffbeb', amberText: '#b45309', red: '#ef4444', redBg: '#fef2f2', redText: '#b91c1c',
};
const SHADOW = '0 24px 50px -16px rgba(39,40,53,0.25)';
const MONO = "'Plex Mono', ui-monospace, monospace";

type Css = React.CSSProperties;
const card = (extra: Css = {}): Css => ({
  background: T.white, border: `1px solid ${T.frost}`, borderRadius: 18, boxShadow: SHADOW, ...extra,
});
const row = (extra: Css = {}): Css => ({ display: 'flex', alignItems: 'center', ...extra });
const Pill: React.FC<{ bg: string; fg: string; children: React.ReactNode; style?: Css }> = ({ bg, fg, children, style }) => (
  <span style={{ background: bg, color: fg, borderRadius: 8, padding: '5px 11px', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', ...style }}>{children}</span>
);
const Check: React.FC<{ size?: number; bg?: string }> = ({ size = 24, bg = T.green }) => (
  <span style={{ width: size, height: size, borderRadius: size, background: bg, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 12 12"><path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </span>
);
const Cross: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <span style={{ width: size, height: size, borderRadius: size, background: T.red, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 12 12"><path d="M3 3l6 6M9 3l-6 6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
  </span>
);

const PATTERN = ['......PWWBB.', '....P.WBBWBB', '.....PWWBBWB', '...P..PWBWBB', '......PPWWBW', '....P...PWWB', '.........PWW', '.......P..PW', '...........P'];
const Mosaic: React.FC<{ style: Css; cell?: number }> = ({ style, cell = 26 }) => (
  <div style={{ position: 'absolute', display: 'grid', gridTemplateColumns: `repeat(12, ${cell}px)`, gap: 5, ...style }}>
    {PATTERN.flatMap((r, y) => [...r].map((ch, x) => (
      <span key={`${x}-${y}`} style={{ width: cell, height: cell, borderRadius: 3, background: ch === 'B' ? T.violet : ch === 'W' ? T.lavender : ch === 'P' ? T.lilac : 'transparent' }} />
    )))}
  </div>
);

// ── Module visuals ──────────────────────────────────────────────────────────

/** Module 1: PRD page with risky sentences flagged. */
const RequirementVisual = () => {
  const lines: [number, 'risk' | 'ok' | null][] = [[92, null], [78, 'risk'], [85, null], [64, 'risk'], [88, 'ok'], [70, null]];
  return (
    <div style={{ position: 'relative', width: 500, height: 470 }}>
      <div style={card({ position: 'absolute', left: 0, top: 0, width: 400, padding: 26 })}>
        <div style={row({ justifyContent: 'space-between' })}>
          <span style={{ fontFamily: MONO, fontSize: 15, color: T.steel }}>PRD · Pembayaran</span>
          <Pill bg={T.amberBg} fg={T.amberText} style={{ fontSize: 13 }}>Review QA</Pill>
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: T.onyx, margin: '14px 0 18px' }}>Acceptance criteria</div>
        {lines.map(([w, flag], i) => (
          <div key={i} style={row({ gap: 12, marginBottom: 14 })}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: T.fog, width: 34 }}>AC{i + 1}</span>
            <span style={{ height: 11, borderRadius: 6, width: `${w}%`, background: flag === 'risk' ? '#fde68a' : T.frost }} />
            {flag === 'risk' && <span style={{ width: 10, height: 10, borderRadius: 10, background: T.amber, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
      <div style={card({ position: 'absolute', right: 0, bottom: 0, width: 300, padding: '16px 18px' })}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.steel, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 }}>Temuan</div>
        {[['Batas nominal?', T.amberText], ['Kalau bank telat?', T.amberText], ['Klik bayar 2x?', T.redText]].map(([t, c]) => (
          <div key={t} style={row({ gap: 10, marginTop: 8 })}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: c }} />
            <span style={{ fontSize: 17, color: T.graphite }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Module 2: likelihood × impact matrix. */
const TestPlanVisual = () => {
  const color = (s: number) => (s >= 6 ? [T.redBg, T.redText] : s >= 3 ? [T.amberBg, T.amberText] : [T.greenBg, T.greenText]);
  return (
    <div style={{ position: 'relative', width: 500, height: 470 }}>
      <div style={card({ position: 'absolute', left: 0, top: 0, width: 420, padding: 24 })}>
        <div style={row({ justifyContent: 'space-between', marginBottom: 16 })}>
          <span style={{ fontSize: 21, fontWeight: 600, color: T.onyx }}>Analisis risiko</span>
          <span style={{ fontFamily: MONO, fontSize: 14, color: T.steel }}>L × I</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[3, 2, 1].flatMap((l) => [1, 2, 3].map((i) => {
            const s = l * i;
            const [bg, fg] = color(s);
            return (
              <div key={`${l}${i}`} style={{ height: 70, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 600, color: fg }}>{s}</div>
            );
          }))}
        </div>
        <div style={row({ justifyContent: 'space-between', marginTop: 12, fontSize: 13, color: T.steel })}>
          <span>Impact →</span><span>Likelihood ↑</span>
        </div>
      </div>
      <div style={card({ position: 'absolute', right: 0, bottom: 0, width: 280, padding: '16px 18px' })}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.steel, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 6 }}>Exit criteria</div>
        {['Test prioritas tinggi lulus', '0 bug critical / high', 'Regression lulus'].map((t, i) => (
          <div key={t} style={row({ gap: 10, marginTop: 9 })}>
            <Check size={22} bg={i < 2 ? T.green : T.ash} />
            <span style={{ fontSize: 16, color: T.graphite }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/** Module 3: request / response pair. */
const ApiVisual = () => (
  <div style={{ position: 'relative', width: 520, height: 470 }}>
    <div style={card({ position: 'absolute', left: 0, top: 0, width: 440, padding: 22, fontFamily: MONO })}>
      <div style={row({ gap: 10, marginBottom: 14 })}>
        <Pill bg={T.violet} fg={T.white} style={{ fontFamily: MONO, fontSize: 14 }}>POST</Pill>
        <span style={{ fontSize: 17, color: T.graphite }}>/v1/bookings/{'{id}'}/pay</span>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: T.slate }}>
        <div><span style={{ color: T.steel }}>Authorization:</span> Bearer ••••</div>
        <div><span style={{ color: T.steel }}>Idempotency-Key:</span> 7f3c…8c11</div>
        <div style={{ marginTop: 6, color: T.graphite }}>{'{ "method": "virtual_account" }'}</div>
      </div>
    </div>
    <div style={card({ position: 'absolute', right: 0, bottom: 0, width: 380, padding: 22, fontFamily: MONO })}>
      <div style={row({ gap: 10, marginBottom: 12 })}>
        <Pill bg={T.greenBg} fg={T.greenText} style={{ fontFamily: MONO, fontSize: 14 }}>200 OK</Pill>
        <span style={{ fontSize: 14, color: T.steel }}>124 ms</span>
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: T.graphite }}>
        <div>{'"status": "waiting_payment",'}</div>
        <div>{'"total": 254000'}</div>
      </div>
      <div style={row({ gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.frost}`, fontFamily: "'Inter', sans-serif" })}>
        <Check size={20} />
        <span style={{ fontSize: 15, color: T.slate }}>Side effect: 1 transaksi</span>
      </div>
    </div>
  </div>
);

/** Module 4: regression results + Go / No-Go. */
const RegressionVisual = () => {
  const rows: [string, 'pass' | 'fail' | 'blocked'][] = [['Smoke', 'pass'], ['Cari jadwal', 'fail'], ['Isi data', 'pass'], ['Pembayaran', 'pass'], ['Riwayat', 'blocked']];
  return (
    <div style={{ position: 'relative', width: 500, height: 470 }}>
      <div style={card({ position: 'absolute', left: 0, top: 0, width: 400, padding: 24 })}>
        <div style={row({ justifyContent: 'space-between', marginBottom: 12 })}>
          <span style={{ fontSize: 21, fontWeight: 600, color: T.onyx }}>Regression rc2</span>
          <span style={{ fontFamily: MONO, fontSize: 14, color: T.steel }}>32 / 34</span>
        </div>
        {rows.map(([t, s]) => (
          <div key={t} style={row({ gap: 12, padding: '10px 0', borderTop: `1px solid ${T.frost}` })}>
            {s === 'pass' ? <Check size={22} /> : s === 'fail' ? <Cross size={22} /> : <span style={{ width: 22, height: 22, borderRadius: 22, background: T.ash, flexShrink: 0 }} />}
            <span style={{ flex: 1, fontSize: 17, color: T.graphite }}>{t}</span>
            <span style={{ fontSize: 14, color: s === 'fail' ? T.redText : T.steel, textTransform: 'capitalize' }}>{s}</span>
          </div>
        ))}
      </div>
      <div style={card({ position: 'absolute', right: 0, bottom: 0, width: 270, padding: '18px 20px' })}>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.steel, letterSpacing: 1.4, textTransform: 'uppercase' }}>Rekomendasi</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: T.onyx, marginTop: 8 }}>Conditional Go</div>
        <div style={{ fontSize: 15, color: T.slate, marginTop: 4 }}>Fix BK-24 sebelum rilis</div>
      </div>
    </div>
  );
};

const VISUALS: Record<number, React.FC> = { 1: RequirementVisual, 2: TestPlanVisual, 3: ApiVisual, 4: RegressionVisual };

// ── Frame ───────────────────────────────────────────────────────────────────

interface Thumb { file: string; title: string; course: string; module: number; moduleName: string; lesson: number }

const Frame: React.FC<{ t: Thumb }> = ({ t }) => {
  const Visual = VISUALS[t.module] ?? RequirementVisual;
  // Shrink for long titles, and for long single words that can't wrap
  // (Indonesian compounds like "Dipertanggungjawabkan") so they stay in the column.
  const longestWord = Math.max(...t.title.split(/\s+/).map((w) => w.length));
  const titleSize = Math.min(
    t.title.length > 52 ? 50 : t.title.length > 36 ? 56 : 62,
    longestWord > 18 ? 50 : longestWord > 15 ? 56 : 62,
  );
  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: T.white, fontFamily: "'Inter', system-ui, sans-serif", color: T.graphite }}>
      <div style={{ position: 'absolute', top: -280, right: -200, width: 820, height: 820, borderRadius: '50%', background: `radial-gradient(circle, ${T.lilac} 0%, rgba(227,242,255,0.55) 45%, rgba(255,255,255,0) 70%)` }} />
      <Mosaic style={{ right: 28, bottom: 24, opacity: 0.3, transform: 'scaleY(-1)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: T.violet }} />

      <div style={{ position: 'absolute', left: 72, top: 64, bottom: 64, width: 560, display: 'flex', flexDirection: 'column' }}>
        <div style={row({ gap: 12 })}>
          <img src={LOGO} width={44} height={44} style={{ borderRadius: 10 }} />
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, color: T.graphite }}>Mentor<span style={{ color: T.violet }}>.QA</span></span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={row({ gap: 14 })}>
            <QaCourseIcon size={50} />
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2.2, textTransform: 'uppercase', color: T.graphite }}>{t.course}</span>
          </div>
          <h1 style={{ margin: '26px 0 0', fontSize: titleSize, lineHeight: 1.08, fontWeight: 600, letterSpacing: -1.6, color: T.graphite }}>{t.title}</h1>
          <div style={row({ gap: 10, marginTop: 26 })}>
            <Pill bg={T.lilac} fg={T.violet} style={{ fontSize: 17 }}>Modul {t.module} · {t.moduleName}</Pill>
            <Pill bg={T.cloud} fg={T.slate} style={{ fontSize: 17, border: `1px solid ${T.frost}` }}>Lesson {t.lesson}</Pill>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 680, right: 56, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Visual />
      </div>
    </div>
  );
};


// ── Course thumbnail ────────────────────────────────────────────────────────
// Course card shows the title under the image; the courses drawer crops to the
// top-left (object-left-top, ~108px wide), so brand + course name sit there.

const CourseFrame: React.FC<{ c: CourseFile; projectTitle: string }> = ({ c, projectTitle }) => {
  const articleCount = c.modules.reduce((n, m) => n + m.articles.length, 0);
  const missionCount = c.modules.filter((m) => m.mission).length;
  return (
    <div style={{ position: 'relative', width: W, height: H, overflow: 'hidden', background: T.white, fontFamily: "'Inter', system-ui, sans-serif", color: T.graphite }}>
      <div style={{ position: 'absolute', top: -280, right: -200, width: 820, height: 820, borderRadius: '50%', background: `radial-gradient(circle, ${T.lilac} 0%, rgba(227,242,255,0.55) 45%, rgba(255,255,255,0) 70%)` }} />
      <Mosaic style={{ right: 28, bottom: 24, opacity: 0.3, transform: 'scaleY(-1)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 8, background: T.violet }} />

      <div style={{ position: 'absolute', left: 72, top: 64, bottom: 64, width: 560, display: 'flex', flexDirection: 'column' }}>
        <div style={row({ gap: 12 })}>
          <img src={LOGO} width={44} height={44} style={{ borderRadius: 10 }} />
          <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, color: T.graphite }}>Mentor<span style={{ color: T.violet }}>.QA</span></span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={row({ gap: 14 })}>
            <QaCourseIcon size={50} />
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2.2, textTransform: 'uppercase', color: T.graphite }}>QA Course</span>
            <Pill bg={T.lilac} fg={T.violet} style={{ fontSize: 15, letterSpacing: 1.2, textTransform: 'uppercase' }}>{QA_COURSE_LEVEL_LABEL[c.level]}</Pill>
          </div>
          <h1 style={{ margin: '24px 0 0', fontSize: 80, lineHeight: 1.02, fontWeight: 600, letterSpacing: -2.4, color: T.graphite }}>{c.title}</h1>
          <div style={row({ gap: 22, marginTop: 30, fontSize: 21, color: T.slate })}>
            <span>{c.modules.length} modul</span>
            <span style={{ width: 5, height: 5, borderRadius: 5, background: T.ash }} />
            <span>{articleCount} materi</span>
            <span style={{ width: 5, height: 5, borderRadius: 5, background: T.ash }} />
            <span>{missionCount} misi</span>
            <span style={{ width: 5, height: 5, borderRadius: 5, background: T.ash }} />
            <span>±{c.estimatedHours} jam</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 690, right: 64, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={card({ width: 470, padding: '22px 24px' })}>
          <div style={row({ justifyContent: 'space-between', marginBottom: 6 })}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.steel, letterSpacing: 1.4, textTransform: 'uppercase' }}>Kurikulum</span>
            <span style={row({ gap: 8, fontSize: 14, color: T.slate })}><QaSimulatorIcon size={22} /> {projectTitle}</span>
          </div>
          {c.modules.map((m, i) => (
            <div key={m.title} style={row({ gap: 16, padding: '14px 0', borderTop: i === 0 ? 'none' : `1px solid ${T.frost}` })}>
              <span style={{ width: 38, height: 38, borderRadius: 38, flexShrink: 0, background: i === 0 ? T.violet : T.lilac, color: i === 0 ? T.white : T.violet, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 600 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 19, fontWeight: 600, color: T.onyx }}>{m.title}</div>
                <div style={row({ gap: 14, marginTop: 4, fontSize: 14, color: T.slate })}>
                  <span style={row({ gap: 6 })}><QaLibraryIcon size={18} /> {m.articles.length} materi</span>
                  {m.mission && <span style={row({ gap: 6 })}><QaSimulatorIcon size={18} /> 1 misi</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Run ─────────────────────────────────────────────────────────────────────

function readThumbs(dir: string): Thumb[] {
  return readdirSync(dir).filter((f) => /^\d+.*\.md$/.test(f)).sort().map((f) => {
    const fm = readFileSync(join(dir, f), 'utf8').match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const get = (k: string) => (fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm'))?.[1] ?? '').trim().replace(/^"(.*)"$/, '$1');
    // "Fintech QA Ready · Modul 1 (Requirement) · Lesson 1"
    const m = get('course').match(/^(.*?)\s*·\s*Modul\s+(\d+)\s*\((.*?)\)\s*·\s*Lesson\s+(\d+)/);
    if (!m) throw new Error(`${f}: frontmatter "course" tidak sesuai format "<Course> · Modul N (Nama) · Lesson N"`);
    return { file: f.replace(/\.md$/, '.png'), title: get('title'), course: m[1], module: Number(m[2]), moduleName: m[3], lesson: Number(m[4]) };
  });
}

const html = (body: string) => `<!doctype html><html><head><meta charset="utf-8" />
<style>
@font-face { font-family: 'Inter'; src: url(${FONT_INTER}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: 'Plex Mono'; src: url(${FONT_MONO}) format('woff2'); font-weight: 400; }
* { box-sizing: border-box; } html, body { margin: 0; -webkit-font-smoothing: antialiased; }
</style></head><body>${body}</body></html>`;

async function main() {
  const argv = process.argv.slice(2);
  const courseOnly = argv.includes('--course');
  const dirArg = argv.find((a) => !a.startsWith('--'));
  if (!dirArg) throw new Error('Usage: course:thumbs <content-dir> [--course]   (--course: only course.png)');
  const dir = resolve(dirArg);
  const out = join(dir, 'thumbnails');
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: process.env.OG_BROWSER_CHANNEL ?? 'chrome' });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  for (const t of courseOnly ? [] : readThumbs(dir)) {
    await page.setContent(html(renderToStaticMarkup(<Frame t={t} />)), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(out, t.file), clip: { x: 0, y: 0, width: W, height: H } });
    console.log('✓', join(dirArg, 'thumbnails', t.file));
  }
  const coursePath = join(dir, 'course.json');
  if (existsSync(coursePath)) {
    const c = JSON.parse(readFileSync(coursePath, 'utf8')) as CourseFile;
    const projectId = c.modules.find((m) => m.mission)?.mission?.projectId;
    const project = projectId
      ? (JSON.parse(readFileSync(resolve(ROOT, 'public/qa-simulator/config', `${projectId}.json`), 'utf8')) as { product: string }).product
      : '';
    await page.setContent(html(renderToStaticMarkup(<CourseFrame c={c} projectTitle={project ? `Praktik di ${project}` : ''} />)), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(out, 'course.png'), clip: { x: 0, y: 0, width: W, height: H } });
    console.log('✓', join(dirArg, 'thumbnails', 'course.png'));
  }
  await browser.close();
}

main().catch((err) => { console.error(err); process.exit(1); });
