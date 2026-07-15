// Social-share link previews (WhatsApp, Instagram DM, Facebook, LinkedIn, Telegram, Slack)
// fetch the raw HTML and never execute JS, so react-helmet-async's per-route
// <title>/og:* tags (set client-side) never reach them — every shared link showed
// the same static index.html title/image. This intercepts known bot user-agents
// only, rewrites the relevant meta tags for the requested path, and serves that.
// Real browsers and Googlebot (which does render JS) are untouched.

const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Pinterest|redditbot|SkypeUriPreview|Applebot|line-poker|vkShare/i;

interface RouteMeta {
  title: string;
  description: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Mentoring QA & Kursus QA Online 1-on-1 | Mentor.QA',
    description:
      'Mentoring QA Engineer 1-on-1 bareng praktisi 6+ tahun pengalaman. Kursus manual testing, automation testing, API testing. Booking sesi mentor sekarang.',
  },
  '/portfolio': {
    title: 'Buat Portfolio QA Engineer Gratis | Mentor.QA',
    description:
      'Buat portfolio QA Engineer gratis di Mentor.QA: showcase proyek, sertifikasi, dan pengalaman kerja pakai link sendiri. Cocok fresh graduate sampai QA senior.',
  },
  '/mentoring/booking': {
    title: 'Booking Mentoring QA - Pilih Mentor & Jadwal | Mentor.QA',
    description:
      'Booking sesi mentoring QA 1-on-1. Pilih topik, mentor QA berpengalaman, dan jadwal yang sesuai untuk kelas atau kursus QA kamu.',
  },
  '/personal-portfolio': {
    title: 'Agus Budiman | Portfolio QA Engineer & Automation Testing',
    description:
      'Portfolio QA Engineer Agus Budiman: 6+ tahun pengalaman automation testing, manual testing, dan API testing. Lihat proyek, skill, dan pengalaman kerja.',
  },
  '/personal-portfolio/about': {
    title: 'Tentang Agus Budiman | Portfolio QA Engineer',
    description:
      'Kenali perjalanan karier, pengalaman kerja, dan latar belakang pendidikan Agus Budiman sebagai QA Engineer dengan 6+ tahun pengalaman testing.',
  },
  '/personal-portfolio/projects': {
    title: 'Proyek QA Engineer | Portfolio Agus Budiman',
    description:
      'Kumpulan proyek automation testing, manual testing, dan tooling QA yang dikerjakan Agus Budiman, QA Engineer berpengalaman 6+ tahun.',
  },
  '/personal-portfolio/certifications': {
    title: 'Sertifikasi QA Engineer | Agus Budiman',
    description:
      'Daftar sertifikasi profesional Agus Budiman di bidang Quality Assurance, software testing, dan automation testing.',
  },
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function middleware(request: Request) {
  const ua = request.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) return;

  const url = new URL(request.url);
  const meta = ROUTE_META[url.pathname];
  if (!meta) return;

  const origin = await fetch(new URL('/', request.url));
  let html = await origin.text();
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);

  html = html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(name="description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(property="og:description" content=")[^"]*(")/, `$1${description}$2`)
    .replace(/(property="og:url" content=")[^"]*(")/, `$1https://www.mentorqa.com${url.pathname}$2`)
    .replace(/(name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(name="twitter:description" content=")[^"]*(")/, `$1${description}$2`);

  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export const config = {
  matcher: [
    '/',
    '/portfolio',
    '/mentoring/booking',
    '/personal-portfolio',
    '/personal-portfolio/about',
    '/personal-portfolio/projects',
    '/personal-portfolio/certifications',
  ],
};
