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

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

export interface ExperienceEntry {
  id: string;
  company: string;
  companyLogo?: string;
  position: string;
  employmentType?: EmploymentType;
  jobDesc: string;
  startDate: string; // YYYY-MM
  endDate?: string; // YYYY-MM, absent when isCurrent
  isCurrent: boolean;
}

export interface ProjectEntry {
  id: string;
  thumbnail?: string;
  name: string;
  description: string;
  toolIds: string[]; // ref ToolConfig
  projectUrl?: string;
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

export interface PortfolioData {
  profile: PortfolioProfile;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  endorsements: EndorsementEntry[];
  certifications: CertificationEntry[];
  articles: ArticleEntry[];
  socials: PortfolioSocials;
  cta: PortfolioCta;
  githubActivity: GithubActivityConfig;
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
