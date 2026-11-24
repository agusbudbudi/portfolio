// Hand-curated program cards for the /programs ad landing page. Copy is
// written for cold ad traffic, so it lives here instead of being pulled from
// the DB. Each `href` goes as deep as possible (lesson 1, phase 1, booking
// form) so a click turns straight into an action.
//
// Course cards don't hard-code lesson slugs or hours: the DB owns the course
// outline, so `course` names the slug and the page resolves lesson 1 + the
// estimate at runtime (lib/courseProgram.ts). Until then (or if /api is down)
// the card links to the course page, which is always valid.

import type React from 'react';
import { MentoringIcon, QaCourseIcon, QaPortfolioIcon, QaSimulatorIcon, type IconProps } from '../../../components/illustration/ProductIcons';
import { LOWEST_MENTORING_PRICE } from '../../../lib/pageSeo';

export type ProgramKey = 'course' | 'simulator' | 'portfolio' | 'mentoring' | 'fintech';

export interface Program {
  key: ProgramKey;
  icon: React.FC<IconProps>;
  category: string;
  title: string;
  description: string;
  /** Short facts shown as chips, e.g. "Gratis", "5 jam". */
  facts: string[];
  cta: string;
  href: string;
  /** Hero copy when this program is featured (`?p=`). `accent` renders in brand blue. */
  hero: { before: string; accent: string; after: string; subtitle: string };
  /** Paid program: gold card treatment + "Berbayar" label, as in the header tray. */
  paid?: boolean;
  /** QA Course slug: lesson-1 href and hours/level facts come from the DB. */
  course?: string;
}

export const PROGRAMS: Program[] = [
  {
    key: 'course',
    icon: QaCourseIcon,
    course: 'junior-qa-ready',
    hero: {
      before: 'Mau jadi ',
      accent: 'QA Engineer',
      after: '? Pilih jalurmu.',
      subtitle: 'Belajar dari nol, praktik di aplikasi staging, dan dibimbing praktisi. Sebagian besar gratis.',
    },
    category: 'QA Course',
    title: 'Junior QA Ready',
    description:
      'Belajar QA dari nol sampai siap kerja: baca PRD, tulis test case, cari bug, dan tulis bug report. Lulus bawa portfolio.',
    facts: ['Gratis'],
    cta: 'Mulai belajar',
    href: '/courses/junior-qa-ready',
  },
  {
    key: 'simulator',
    icon: QaSimulatorIcon,
    hero: {
      before: 'Coba langsung kerja jadi ',
      accent: 'QA Engineer',
      after: '',
      subtitle: 'Review PRD, tulis test case, dan berburu bug di aplikasi staging. Phase 1 bisa dicoba tanpa login.',
    },
    category: 'QA Simulator',
    title: 'Simulasi kerja QA di SplitBill',
    description:
      'Rasakan jadi QA di tim produk: review PRD, tulis test case, berburu bug di aplikasi staging, lalu putuskan Go / No-Go.',
    facts: ['Gratis', '±4 jam', 'Phase 1 tanpa login'],
    cta: 'Mulai simulasi',
    href: '/qa-simulator/splitbill',
  },
  {
    key: 'portfolio',
    icon: QaPortfolioIcon,
    hero: {
      before: 'Punya ',
      accent: 'portfolio QA',
      after: ' yang dilirik recruiter',
      subtitle: 'Kumpulkan project, test case, dan sertifikasi dalam satu link. Gratis, tanpa coding.',
    },
    category: 'Portfolio QA',
    title: 'Portfolio QA online gratis',
    description:
      'Tampilkan project, test case, sertifikasi, dan studi kasus QA Simulator dalam satu halaman dengan link sendiri untuk recruiter.',
    facts: ['Gratis', 'Link sendiri', 'Tanpa coding'],
    cta: 'Buat portfolio',
    href: '/portfolio',
  },
  {
    key: 'mentoring',
    icon: MentoringIcon,
    hero: {
      before: 'Dibimbing langsung ',
      accent: 'praktisi QA',
      after: '',
      subtitle: 'Review CV, latihan interview, atau belajar automation lewat sesi 1-on-1. Pilih jadwal sendiri.',
    },
    category: 'Mentoring 1-on-1',
    title: 'Sesi bareng praktisi QA',
    description:
      'Review CV dan portfolio, latihan interview, atau belajar automation. Pilih mentor, topik, dan jadwal sendiri.',
    facts: [`Mulai ${LOWEST_MENTORING_PRICE}`, '60 menit', 'Via WhatsApp'],
    cta: 'Booking sesi',
    href: '/mentoring/booking',
    paid: true,
  },
  {
    key: 'fintech',
    icon: QaCourseIcon,
    course: 'fintech-qa-ready',
    hero: {
      before: 'Naik level jadi ',
      accent: 'QA fitur pembayaran',
      after: '',
      subtitle: 'Test plan berbasis risiko, API testing, dan regression untuk fitur yang menyentuh uang. Gratis.',
    },
    category: 'QA Course',
    title: 'Fintech QA Ready',
    description:
      'Lanjutan untuk fitur yang menyentuh uang: test plan berbasis risiko, API testing, regression, dan sign-off rilis.',
    facts: ['Gratis'],
    cta: 'Mulai belajar',
    href: '/courses/fintech-qa-ready',
  },
];

export const DEFAULT_FEATURED: ProgramKey = 'course';

export function isProgramKey(v: string | null): v is ProgramKey {
  return !!v && PROGRAMS.some((p) => p.key === v);
}
