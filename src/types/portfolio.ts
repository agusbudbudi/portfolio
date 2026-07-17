// Canonical types for the Mentor.QA mentee portfolio feature.
// Shared by the admin dashboard and the /api functions. Phase 1 is admin CRUD
// only — no public reader page yet, but `slug`/`status` are already shaped
// for the eventual /mentoring/portfolio/[slug] route.

export interface ToolConfig {
  id: string;
  name: string;
  logo?: string;
  category?: string;
  updatedAt?: string;
}

export interface ToolsDocument {
  tools: ToolConfig[];
  updatedAt?: string;
}

export interface SkillConfig {
  id: string;
  name: string;
  category?: string;
  updatedAt?: string;
}

export interface SkillsDocument {
  skills: SkillConfig[];
  updatedAt?: string;
}

// Proficiency is per-portfolio (the same master skill can rate differently
// for different mentees), so it lives on the join entry, not on SkillConfig.
export type SkillLevel = 'beginner' | 'intermediate' | 'expert';

export const SKILL_LEVEL_OPTIONS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert', label: 'Expert' },
];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

export interface PortfolioSkillEntry {
  skillId: string; // ref SkillConfig
  level: SkillLevel;
}

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

export interface ExperienceEntry {
  id: string;
  company: string;
  companyLogo?: string;
  position: string;
  employmentType?: EmploymentType;
  workArrangement?: WorkArrangement;
  location?: string;
  jobDesc: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM, absent when isCurrent
  isCurrent: boolean;
}

export type ProjectPlatform = 'web' | 'ios' | 'android' | 'desktop' | 'other';

export const PROJECT_PLATFORM_OPTIONS: { value: ProjectPlatform; label: string }[] = [
  { value: 'web', label: 'Web' },
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'other', label: 'Other' },
];

export interface ProjectPlatformLink {
  platform: ProjectPlatform;
  url?: string;
}

export type ProjectType = 'professional' | 'personal' | 'mentoring';

export const PROJECT_TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'professional', label: 'Professional Project' },
  { value: 'personal', label: 'Personal Project' },
  { value: 'mentoring', label: 'Mentoring Project' },
];

export const PROJECT_TYPE_BADGE_COLOR: Record<ProjectType, string> = {
  professional: 'bg-violet-500 text-white',
  personal: 'bg-amber-500 text-white',
  mentoring: 'bg-emerald-500 text-white',
};

export interface ProjectEntry {
  id: string;
  thumbnail?: string;
  name: string;
  description: string;
  toolIds: string[]; // ref ToolConfig
  projectUrl?: string;
  platforms?: ProjectPlatformLink[];
  projectType?: ProjectType;
}

export interface EducationEntry {
  id: string;
  institution: string;
  institutionLogo?: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM, absent when isCurrent
  isCurrent: boolean;
  description?: string;
}

export interface EndorsementEntry {
  id: string;
  photo?: string;
  name: string;
  relation: string;
  message: string;
  linkedinUrl?: string;
  date?: string; // YYYY-MM-DD
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issuerLogo?: string;
  issueDate: string; // YYYY-MM
  credentialUrl?: string;
}

export interface ArticleEntry {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  source?: string;
}

export interface QaDeliverableEntry {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export interface QaDeliverablesConfig {
  title: string;
  subtitle: string;
  items: QaDeliverableEntry[];
}

export const QA_DELIVERABLES_DEFAULT_TITLE = 'QA Documentation & Deliverables';
export const QA_DELIVERABLES_DEFAULT_SUBTITLE =
  'Contoh dokumen QA yang pernah dibuat: test case, test plan, bug report, dan lainnya.';

export interface PortfolioCta {
  title: string;
  description: string;
  showViewCv: boolean;
  showConnectLinkedin: boolean;
}

export interface PortfolioSocials {
  linkedin?: string;
  github?: string;
  whatsapp?: string;
  email?: string;
  portfolioUrl?: string;
}

export interface GithubActivityConfig {
  username: string;
  showActivity: boolean;
}

export interface GithubRepoEntry {
  id: string;
  url: string; // https://github.com/owner/repo — title/desc/thumbnail are fetched live, not stored
}

export type WorkArrangement = 'remote' | 'hybrid' | 'onsite';

export const WORK_ARRANGEMENT_OPTIONS: { value: WorkArrangement; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'Onsite' },
];

// HR-facing "can I even hire them" info, shown in two independently-toggled
// places: showOpenToWork gates the green banner on the profile photo,
// showPreferences gates the notice period / location / employment type /
// work arrangement badge row above the bio.
export interface AvailabilityConfig {
  showOpenToWork: boolean;
  showPreferences: boolean;
  noticePeriod?: string; // free text — "Immediately", "2 Minggu", "1 Bulan", …
  employmentTypes: EmploymentType[];
  workArrangements: WorkArrangement[];
  location?: string;
}

export interface PortfolioProfile {
  photo?: string;
  name: string;
  bio: string;
  role?: string;
  yearsOfExperience?: number;
  cvUrl?: string;
  isVerified?: boolean;
}

export type PortfolioStatus = 'draft' | 'published';

// Reorderable content sections on the public portfolio page — the admin
// drags these into any order in the "Configuration Order" form section
// (PortfolioForm.tsx) and PublicPortfolioPage.tsx renders them in that
// sequence. Profile/hero, bio+tools, socials and CTA are not in this list —
// they're structurally fixed (always header-first / footer-last).
export type PortfolioSectionId =
  | 'experience' | 'education' | 'skills' | 'projects' | 'qaDeliverables'
  | 'endorsements' | 'certifications' | 'articles' | 'githubActivity' | 'githubRepos';

export const PORTFOLIO_SECTION_LABELS: Record<PortfolioSectionId, string> = {
  experience: 'Pengalaman Kerja',
  education: 'Pendidikan',
  skills: 'Skills',
  projects: 'Project Showcase',
  qaDeliverables: 'QA Documentation & Deliverables',
  endorsements: 'Endorsement',
  certifications: 'Certification',
  articles: 'Article',
  githubActivity: 'GitHub Activity',
  githubRepos: 'GitHub Repos',
};

export const DEFAULT_SECTION_ORDER: PortfolioSectionId[] = [
  'experience', 'education', 'skills', 'projects', 'qaDeliverables',
  'endorsements', 'certifications', 'articles', 'githubActivity', 'githubRepos',
];

export interface PortfolioData {
  profile: PortfolioProfile;
  availability: AvailabilityConfig;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skillEntries: PortfolioSkillEntry[];
  qaDeliverables: QaDeliverablesConfig;
  endorsements: EndorsementEntry[];
  certifications: CertificationEntry[];
  articles: ArticleEntry[];
  socials: PortfolioSocials;
  cta: PortfolioCta;
  githubActivity: GithubActivityConfig;
  githubRepos: GithubRepoEntry[];
  sectionOrder: PortfolioSectionId[];
}

// Full record — GET-by-slug / create / update payloads.
export interface PortfolioRecord {
  id: string;
  slug: string;
  status: PortfolioStatus;
  data: PortfolioData;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
}

// Lightweight row for the admin list view — no nested data blob.
export interface PortfolioSummary {
  id: string;
  slug: string;
  status: PortfolioStatus;
  name: string;
  photo?: string;
  updatedAt: string;
  ownerId: string | null;
}
