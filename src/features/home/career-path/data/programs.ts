// Single source for the five Mentor.QA programs on the new homepage.
// Routes are the real, existing ones (see App.tsx / LightdashNavbar).

export type ProgramId = 'course' | 'simulator' | 'library' | 'portfolio' | 'mentoring';

export interface HomeProgram {
  id: ProgramId;
  name: string;
  category: string;
  description: string;
  cta: string;
  to: string;
}

export const PROGRAMS: HomeProgram[] = [
  {
    id: 'course', name: 'QA Course', category: 'LEARN', to: '/courses', cta: 'Lihat Course',
    description: 'Kuasai fundamental QA dan tingkatkan technical skill lewat learning path yang terstruktur.',
  },
  {
    id: 'simulator', name: 'QA Simulator', category: 'PRACTICE', to: '/qa-simulator', cta: 'Coba Simulator',
    description: 'Latihan skenario QA seperti di real project lewat challenge interaktif.',
  },
  {
    id: 'library', name: 'QA Library', category: 'EXPLORE', to: '/qa-library', cta: 'Buka Library',
    description: 'Akses materi, template, referensi, dan panduan praktis QA yang terkurasi.',
  },
  {
    id: 'portfolio', name: 'QA Portfolio', category: 'SHOWCASE', to: '/portfolio', cta: 'Buat Portfolio',
    description: 'Bangun portfolio QA profesional untuk menampilkan skill dan pengalamanmu.',
  },
  {
    id: 'mentoring', name: 'QA Mentoring', category: 'GROW', to: '/mentoring', cta: 'Cari Mentor',
    description: 'Dapatkan guidance personal dari praktisi QA berpengalaman.',
  },
];

export const PROGRAM_BY_ID = Object.fromEntries(PROGRAMS.map((p) => [p.id, p])) as Record<ProgramId, HomeProgram>;

export interface JourneyCardData {
  id: string;
  title: string;
  description: string;
  to: string;
  /** Programs this journey points at, shown as a hint under the description. */
  via: string;
}

export const JOURNEYS: JourneyCardData[] = [
  { id: 'new', title: 'Saya Baru di QA', description: 'Mulai dari nol dengan learning path yang tepat.', to: '/courses', via: 'QA Course' },
  { id: 'improve', title: 'Saya Ingin Upgrade Skill QA', description: 'Perdalam advanced skill lewat hands-on practice.', to: '/qa-simulator', via: 'QA Simulator + QA Course' },
  { id: 'showcase', title: 'Saya Ingin Showcase Skill QA', description: 'Bangun portfolio profesional yang bikin kamu stand out.', to: '/portfolio', via: 'QA Portfolio' },
  { id: 'grow', title: 'Saya Ingin Naik Level Karier', description: 'Dapatkan career guidance dan mentoring 1-on-1.', to: '/mentoring', via: 'QA Mentoring' },
];

export const BENEFITS = [
  { id: 'guidance', title: 'Dibimbing Praktisi', body: 'Belajar dari praktisi QA berpengalaman.' },
  { id: 'practical', title: 'Hands-on Learning', body: 'Fokus pada skill yang bisa dipakai di project nyata.' },
  { id: 'career', title: 'Career Growth', body: 'Bangun knowledge dan confidence untuk memajukan karier QA-mu.' },
  { id: 'community', title: 'Supportive Community', body: 'Bertumbuh bersama orang-orang dengan minat yang sama di Quality Assurance.' },
] as const;
