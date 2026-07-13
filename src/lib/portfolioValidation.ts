// Structural validators for the Mentor.QA portfolio feature — tools and
// portfolio records. Used by both the admin dashboard (client-side pre-save
// check) and the /api/tools, /api/portfolios serverless functions.
// Keep this file free of browser-only imports — it is bundled into the API.

import type { EmploymentType, PortfolioData, PortfolioStatus, ToolConfig } from '../types/portfolio';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RE = /^https?:\/\/\S+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PORTFOLIO_STATUSES: readonly PortfolioStatus[] = ['draft', 'published'];
const EMPLOYMENT_TYPES: readonly EmploymentType[] = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// Lowercase slug from a display name: strip diacritics, drop anything that
// isn't a-z/0-9, collapse runs of separators into one dash, trim dashes.
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritics (é -> e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

export type ToolsValidationResult =
  | { ok: true; tools: ToolConfig[] }
  | { ok: false; errors: string[] };

export function validateTools(data: unknown): ToolsValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  const toolIds = new Set<string>();
  if (!Array.isArray(data.tools)) {
    errors.push('tools: wajib array.');
  } else {
    data.tools.forEach((tool, i) => {
      if (!isRecord(tool)) {
        errors.push(`tools[${i}]: harus objek.`);
        return;
      }
      if (!isNonEmptyString(tool.id)) {
        errors.push(`tools[${i}].id: wajib string non-kosong.`);
      } else if (!SLUG_RE.test(tool.id)) {
        errors.push(`tools[${i}].id: harus slug lowercase (a-z, 0-9, tanda hubung).`);
      } else if (toolIds.has(tool.id)) {
        errors.push(`tools[${i}].id: duplikat "${tool.id}".`);
      } else {
        toolIds.add(tool.id);
      }
      if (!isNonEmptyString(tool.name)) errors.push(`tools[${i}].name: wajib string non-kosong.`);
      if (tool.logo !== undefined && typeof tool.logo !== 'string') errors.push(`tools[${i}].logo: harus string URL.`);
      if (tool.category !== undefined && typeof tool.category !== 'string') errors.push(`tools[${i}].category: harus string.`);
      if (tool.updatedAt !== undefined && typeof tool.updatedAt !== 'string') errors.push(`tools[${i}].updatedAt: harus string.`);
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, tools: data.tools as ToolConfig[] };
}

function validateExperience(experience: unknown, errors: string[]): void {
  if (!Array.isArray(experience)) {
    errors.push('experience: wajib array.');
    return;
  }
  experience.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`experience[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`experience[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.company)) errors.push(`experience[${i}].company: wajib string non-kosong.`);
    if (entry.companyLogo !== undefined && typeof entry.companyLogo !== 'string') errors.push(`experience[${i}].companyLogo: harus string.`);
    if (entry.employmentType !== undefined && !EMPLOYMENT_TYPES.includes(entry.employmentType as EmploymentType)) {
      errors.push(`experience[${i}].employmentType: wajib salah satu dari ${EMPLOYMENT_TYPES.join(', ')}.`);
    }
    if (!isNonEmptyString(entry.position)) errors.push(`experience[${i}].position: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.jobDesc)) errors.push(`experience[${i}].jobDesc: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.startDate) || !MONTH_RE.test(entry.startDate as string)) {
      errors.push(`experience[${i}].startDate: wajib format YYYY-MM.`);
    }
    if (typeof entry.isCurrent !== 'boolean') errors.push(`experience[${i}].isCurrent: wajib boolean.`);
    if (entry.isCurrent === false) {
      if (!isNonEmptyString(entry.endDate) || !MONTH_RE.test(entry.endDate as string)) {
        errors.push(`experience[${i}].endDate: wajib format YYYY-MM saat isCurrent false.`);
      }
    } else if (entry.endDate !== undefined && entry.endDate !== '') {
      errors.push(`experience[${i}].endDate: harus kosong saat isCurrent true.`);
    }
  });
}

function validateEducation(education: unknown, errors: string[]): void {
  if (!Array.isArray(education)) {
    errors.push('education: wajib array.');
    return;
  }
  education.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`education[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`education[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.institution)) errors.push(`education[${i}].institution: wajib string non-kosong.`);
    if (entry.institutionLogo !== undefined && typeof entry.institutionLogo !== 'string') errors.push(`education[${i}].institutionLogo: harus string.`);
    if (!isNonEmptyString(entry.degree)) errors.push(`education[${i}].degree: wajib string non-kosong.`);
    if (entry.fieldOfStudy !== undefined && typeof entry.fieldOfStudy !== 'string') errors.push(`education[${i}].fieldOfStudy: harus string.`);
    if (!isNonEmptyString(entry.startDate) || !MONTH_RE.test(entry.startDate as string)) {
      errors.push(`education[${i}].startDate: wajib format YYYY-MM.`);
    }
    if (typeof entry.isCurrent !== 'boolean') errors.push(`education[${i}].isCurrent: wajib boolean.`);
    if (entry.isCurrent === false) {
      if (!isNonEmptyString(entry.endDate) || !MONTH_RE.test(entry.endDate as string)) {
        errors.push(`education[${i}].endDate: wajib format YYYY-MM saat isCurrent false.`);
      }
    } else if (entry.endDate !== undefined && entry.endDate !== '') {
      errors.push(`education[${i}].endDate: harus kosong saat isCurrent true.`);
    }
    if (entry.description !== undefined && typeof entry.description !== 'string') errors.push(`education[${i}].description: harus string.`);
  });
}

function validateProjects(projects: unknown, validToolIds: Set<string>, errors: string[]): void {
  if (!Array.isArray(projects)) {
    errors.push('projects: wajib array.');
    return;
  }
  projects.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`projects[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`projects[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.name)) errors.push(`projects[${i}].name: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.description)) errors.push(`projects[${i}].description: wajib string non-kosong.`);
    if (entry.thumbnail !== undefined && typeof entry.thumbnail !== 'string') errors.push(`projects[${i}].thumbnail: harus string.`);
    if (entry.projectUrl !== undefined && entry.projectUrl !== '' && !URL_RE.test(entry.projectUrl as string)) {
      errors.push(`projects[${i}].projectUrl: harus URL http(s) valid.`);
    }
    if (!Array.isArray(entry.toolIds)) {
      errors.push(`projects[${i}].toolIds: wajib array.`);
    } else {
      entry.toolIds.forEach((toolId) => {
        if (typeof toolId !== 'string' || !validToolIds.has(toolId)) {
          errors.push(`projects[${i}].toolIds: tool id "${String(toolId)}" tidak ada di tools.`);
        }
      });
    }
  });
}

function validateEndorsements(endorsements: unknown, errors: string[]): void {
  if (!Array.isArray(endorsements)) {
    errors.push('endorsements: wajib array.');
    return;
  }
  endorsements.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`endorsements[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`endorsements[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.name)) errors.push(`endorsements[${i}].name: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.relation)) errors.push(`endorsements[${i}].relation: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.message)) errors.push(`endorsements[${i}].message: wajib string non-kosong.`);
    if (entry.photo !== undefined && typeof entry.photo !== 'string') errors.push(`endorsements[${i}].photo: harus string.`);
    if (entry.linkedinUrl !== undefined && entry.linkedinUrl !== '' && !URL_RE.test(entry.linkedinUrl as string)) {
      errors.push(`endorsements[${i}].linkedinUrl: harus URL http(s) valid.`);
    }
    if (entry.date !== undefined && entry.date !== '' && !DATE_RE.test(entry.date as string)) {
      errors.push(`endorsements[${i}].date: harus format YYYY-MM-DD.`);
    }
  });
}

function validateCertifications(certifications: unknown, errors: string[]): void {
  if (!Array.isArray(certifications)) {
    errors.push('certifications: wajib array.');
    return;
  }
  certifications.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`certifications[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`certifications[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.name)) errors.push(`certifications[${i}].name: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.issuer)) errors.push(`certifications[${i}].issuer: wajib string non-kosong.`);
    if (entry.issuerLogo !== undefined && typeof entry.issuerLogo !== 'string') errors.push(`certifications[${i}].issuerLogo: harus string.`);
    if (!isNonEmptyString(entry.issueDate) || !MONTH_RE.test(entry.issueDate as string)) {
      errors.push(`certifications[${i}].issueDate: wajib format YYYY-MM.`);
    }
    if (entry.credentialUrl !== undefined && entry.credentialUrl !== '' && !URL_RE.test(entry.credentialUrl as string)) {
      errors.push(`certifications[${i}].credentialUrl: harus URL http(s) valid.`);
    }
  });
}

function validateArticles(articles: unknown, errors: string[]): void {
  if (!Array.isArray(articles)) {
    errors.push('articles: wajib array.');
    return;
  }
  articles.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`articles[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`articles[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.title)) errors.push(`articles[${i}].title: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.url) || !URL_RE.test(entry.url as string)) {
      errors.push(`articles[${i}].url: harus URL http(s) valid.`);
    }
    if (entry.description !== undefined && typeof entry.description !== 'string') errors.push(`articles[${i}].description: harus string.`);
    if (entry.thumbnail !== undefined && typeof entry.thumbnail !== 'string') errors.push(`articles[${i}].thumbnail: harus string.`);
    if (entry.source !== undefined && typeof entry.source !== 'string') errors.push(`articles[${i}].source: harus string.`);
  });
}

function validateSocials(socials: unknown, errors: string[]): void {
  if (!isRecord(socials)) { errors.push('socials: wajib objek.'); return; }
  for (const key of ['linkedin', 'github', 'portfolioUrl'] as const) {
    const value = socials[key];
    if (value !== undefined && value !== '' && (typeof value !== 'string' || !URL_RE.test(value))) {
      errors.push(`socials.${key}: harus URL http(s) valid.`);
    }
  }
  if (socials.whatsapp !== undefined && socials.whatsapp !== '' && typeof socials.whatsapp !== 'string') {
    errors.push('socials.whatsapp: harus string.');
  }
  if (socials.email !== undefined && socials.email !== '' && (typeof socials.email !== 'string' || !EMAIL_RE.test(socials.email))) {
    errors.push('socials.email: harus email valid.');
  }
}

function validateGithubActivity(githubActivity: unknown, errors: string[]): void {
  if (!isRecord(githubActivity)) { errors.push('githubActivity: wajib objek.'); return; }
  if (typeof githubActivity.showActivity !== 'boolean') errors.push('githubActivity.showActivity: wajib boolean.');
  if (githubActivity.showActivity === true) {
    if (!isNonEmptyString(githubActivity.username)) {
      errors.push('githubActivity.username: wajib diisi saat showActivity aktif.');
    } else if (!GITHUB_USERNAME_RE.test(githubActivity.username)) {
      errors.push('githubActivity.username: bukan format username GitHub yang valid.');
    }
  } else if (githubActivity.username !== undefined && typeof githubActivity.username !== 'string') {
    errors.push('githubActivity.username: harus string.');
  }
}

function validateCta(cta: unknown, socials: unknown, errors: string[]): void {
  if (!isRecord(cta)) { errors.push('cta: wajib objek.'); return; }
  if (cta.title !== undefined && typeof cta.title !== 'string') errors.push('cta.title: harus string.');
  if (cta.description !== undefined && typeof cta.description !== 'string') errors.push('cta.description: harus string.');
  if (typeof cta.showViewCv !== 'boolean') errors.push('cta.showViewCv: wajib boolean.');
  if (typeof cta.showConnectLinkedin !== 'boolean') errors.push('cta.showConnectLinkedin: wajib boolean.');
  if (cta.showViewCv === true || cta.showConnectLinkedin === true) {
    if (!isNonEmptyString(cta.title)) errors.push('cta.title: wajib string non-kosong saat CTA aktif.');
    if (!isNonEmptyString(cta.description)) errors.push('cta.description: wajib string non-kosong saat CTA aktif.');
  }
  if (cta.showConnectLinkedin === true) {
    const linkedin = isRecord(socials) ? socials.linkedin : undefined;
    if (!isNonEmptyString(linkedin)) errors.push('socials.linkedin: wajib diisi saat cta.showConnectLinkedin aktif.');
  }
}

export type PortfolioDataValidationResult =
  | { ok: true; data: PortfolioData }
  | { ok: false; errors: string[] };

// validToolIds cross-checks project.toolIds against the tools resource.
export function validatePortfolioData(data: unknown, validToolIds: Set<string>): PortfolioDataValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  const profile = data.profile;
  if (!isRecord(profile)) {
    errors.push('profile: wajib objek.');
  } else {
    if (!isNonEmptyString(profile.name)) errors.push('profile.name: wajib string non-kosong.');
    if (!isNonEmptyString(profile.bio)) errors.push('profile.bio: wajib string non-kosong.');
    if (profile.photo !== undefined && typeof profile.photo !== 'string') errors.push('profile.photo: harus string.');
    if (profile.role !== undefined && typeof profile.role !== 'string') errors.push('profile.role: harus string.');
    if (profile.cvUrl !== undefined && typeof profile.cvUrl !== 'string') errors.push('profile.cvUrl: harus string.');
    if (profile.isVerified !== undefined && typeof profile.isVerified !== 'boolean') errors.push('profile.isVerified: harus boolean.');
    if (profile.yearsOfExperience !== undefined) {
      if (typeof profile.yearsOfExperience !== 'number' || profile.yearsOfExperience < 0) {
        errors.push('profile.yearsOfExperience: harus angka >= 0.');
      }
    }
  }

  validateExperience(data.experience, errors);
  validateEducation(data.education, errors);
  validateProjects(data.projects, validToolIds, errors);
  validateEndorsements(data.endorsements, errors);
  validateCertifications(data.certifications, errors);
  validateArticles(data.articles, errors);
  validateSocials(data.socials, errors);
  validateGithubActivity(data.githubActivity, errors);
  validateCta(data.cta, data.socials, errors);

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: data as unknown as PortfolioData };
}

export function validatePortfolioStatus(status: unknown): status is PortfolioStatus {
  return typeof status === 'string' && PORTFOLIO_STATUSES.includes(status as PortfolioStatus);
}
