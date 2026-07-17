// Structural validators for the Mentor.QA portfolio feature — tools and
// portfolio records. Used by both the admin dashboard (client-side pre-save
// check) and the /api/admin-config/tools, /api/portfolios serverless functions.
// Keep this file free of browser-only imports — it is bundled into the API.

import {
  DEFAULT_SECTION_ORDER, PROJECT_PLATFORM_OPTIONS, PROJECT_TYPE_OPTIONS, SKILL_LEVEL_OPTIONS, WORK_ARRANGEMENT_OPTIONS,
  type EmploymentType, type PortfolioData, type PortfolioSectionId, type PortfolioStatus,
  type SkillConfig, type SkillLevel, type ToolConfig, type WorkArrangement,
} from '../types/portfolio.js';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const GITHUB_USERNAME_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
export const GITHUB_REPO_URL_RE = /^https:\/\/github\.com\/[a-zA-Z0-9](?:[a-zA-Z0-9-]){0,38}\/[a-zA-Z0-9._-]+\/?$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RE = /^https?:\/\/\S+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PORTFOLIO_STATUSES: readonly PortfolioStatus[] = ['draft', 'published'];
const EMPLOYMENT_TYPES: readonly EmploymentType[] = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
const PROJECT_PLATFORM_VALUES: ReadonlySet<string> = new Set(PROJECT_PLATFORM_OPTIONS.map((o) => o.value));
const PROJECT_TYPE_VALUES: ReadonlySet<string> = new Set(PROJECT_TYPE_OPTIONS.map((o) => o.value));
const SKILL_LEVEL_VALUES: ReadonlySet<string> = new Set(SKILL_LEVEL_OPTIONS.map((o) => o.value));
const WORK_ARRANGEMENT_VALUES: ReadonlySet<string> = new Set(WORK_ARRANGEMENT_OPTIONS.map((o) => o.value));
const SECTION_ID_SET: ReadonlySet<string> = new Set(DEFAULT_SECTION_ORDER);

// Reconciles a stored sectionOrder against the current known section set —
// drops ids that no longer exist and appends any new ones (e.g. a section
// shipped after this portfolio was last saved) at the end, so old records
// and mid-rollout schema drift never crash the renderer or the editor.
export function normalizeSectionOrder(order: unknown): PortfolioSectionId[] {
  const valid = Array.isArray(order)
    ? order.filter((id): id is PortfolioSectionId => typeof id === 'string' && SECTION_ID_SET.has(id))
    : [];
  const seen = new Set<PortfolioSectionId>(valid);
  const missing = DEFAULT_SECTION_ORDER.filter((id) => !seen.has(id));
  return [...new Set([...valid, ...missing])];
}

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

export type SkillsValidationResult =
  | { ok: true; skills: SkillConfig[] }
  | { ok: false; errors: string[] };

export function validateSkills(data: unknown): SkillsValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };

  const skillIds = new Set<string>();
  if (!Array.isArray(data.skills)) {
    errors.push('skills: wajib array.');
  } else {
    data.skills.forEach((skill, i) => {
      if (!isRecord(skill)) {
        errors.push(`skills[${i}]: harus objek.`);
        return;
      }
      if (!isNonEmptyString(skill.id)) {
        errors.push(`skills[${i}].id: wajib string non-kosong.`);
      } else if (!SLUG_RE.test(skill.id)) {
        errors.push(`skills[${i}].id: harus slug lowercase (a-z, 0-9, tanda hubung).`);
      } else if (skillIds.has(skill.id)) {
        errors.push(`skills[${i}].id: duplikat "${skill.id}".`);
      } else {
        skillIds.add(skill.id);
      }
      if (!isNonEmptyString(skill.name)) errors.push(`skills[${i}].name: wajib string non-kosong.`);
      if (skill.category !== undefined && typeof skill.category !== 'string') errors.push(`skills[${i}].category: harus string.`);
      if (skill.updatedAt !== undefined && typeof skill.updatedAt !== 'string') errors.push(`skills[${i}].updatedAt: harus string.`);
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, skills: data.skills as SkillConfig[] };
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
    if (entry.workArrangement !== undefined && !WORK_ARRANGEMENT_VALUES.has(entry.workArrangement as WorkArrangement)) {
      errors.push(`experience[${i}].workArrangement: tidak valid.`);
    }
    if (entry.location !== undefined && typeof entry.location !== 'string') errors.push(`experience[${i}].location: harus string.`);
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
    if (entry.projectType !== undefined && !PROJECT_TYPE_VALUES.has(entry.projectType as string)) {
      errors.push(`projects[${i}].projectType: tidak valid.`);
    }
    if (entry.platforms !== undefined) {
      if (!Array.isArray(entry.platforms)) {
        errors.push(`projects[${i}].platforms: harus array.`);
      } else {
        entry.platforms.forEach((link, j) => {
          if (!isRecord(link)) { errors.push(`projects[${i}].platforms[${j}]: harus objek.`); return; }
          if (!PROJECT_PLATFORM_VALUES.has(link.platform as string)) {
            errors.push(`projects[${i}].platforms[${j}].platform: tidak valid.`);
          }
          if (link.url !== undefined && link.url !== '' && !URL_RE.test(link.url as string)) {
            errors.push(`projects[${i}].platforms[${j}].url: harus URL http(s) valid.`);
          }
        });
      }
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

function validateSkillEntries(entries: unknown, validSkillIds: Set<string>, errors: string[]): void {
  if (!Array.isArray(entries)) { errors.push('skillEntries: wajib array.'); return; }
  const seen = new Set<string>();
  entries.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`skillEntries[${i}]: harus objek.`); return; }
    if (typeof entry.skillId !== 'string' || !validSkillIds.has(entry.skillId)) {
      errors.push(`skillEntries[${i}].skillId: skill id "${String(entry.skillId)}" tidak ada di skills.`);
    } else if (seen.has(entry.skillId)) {
      errors.push(`skillEntries[${i}].skillId: duplikat "${entry.skillId}".`);
    } else {
      seen.add(entry.skillId);
    }
    if (!SKILL_LEVEL_VALUES.has(entry.level as SkillLevel)) {
      errors.push(`skillEntries[${i}].level: wajib salah satu dari ${SKILL_LEVEL_OPTIONS.map((o) => o.value).join(', ')}.`);
    }
  });
}

function validateSectionOrder(sectionOrder: unknown, errors: string[]): void {
  if (!Array.isArray(sectionOrder)) { errors.push('sectionOrder: wajib array.'); return; }
  if (sectionOrder.length !== DEFAULT_SECTION_ORDER.length) {
    errors.push(`sectionOrder: harus berisi ${DEFAULT_SECTION_ORDER.length} section (satu untuk tiap section yang bisa diurutkan).`);
    return;
  }
  const seen = new Set<string>();
  sectionOrder.forEach((id, i) => {
    if (typeof id !== 'string' || !SECTION_ID_SET.has(id)) {
      errors.push(`sectionOrder[${i}]: id section tidak valid.`);
    } else if (seen.has(id)) {
      errors.push(`sectionOrder[${i}]: duplikat "${id}".`);
    } else {
      seen.add(id);
    }
  });
}

function validateQaDeliverables(qaDeliverables: unknown, errors: string[]): void {
  if (!isRecord(qaDeliverables)) { errors.push('qaDeliverables: wajib objek.'); return; }
  if (!isNonEmptyString(qaDeliverables.title)) errors.push('qaDeliverables.title: wajib string non-kosong.');
  if (!isNonEmptyString(qaDeliverables.subtitle)) errors.push('qaDeliverables.subtitle: wajib string non-kosong.');
  if (!Array.isArray(qaDeliverables.items)) {
    errors.push('qaDeliverables.items: wajib array.');
  } else {
    qaDeliverables.items.forEach((entry, i) => {
      if (!isRecord(entry)) { errors.push(`qaDeliverables.items[${i}]: harus objek.`); return; }
      if (!isNonEmptyString(entry.id)) errors.push(`qaDeliverables.items[${i}].id: wajib string non-kosong.`);
      if (!isNonEmptyString(entry.title)) errors.push(`qaDeliverables.items[${i}].title: wajib string non-kosong.`);
      if (entry.subtitle !== undefined && typeof entry.subtitle !== 'string') errors.push(`qaDeliverables.items[${i}].subtitle: harus string.`);
      if (!isNonEmptyString(entry.url) || !URL_RE.test(entry.url as string)) {
        errors.push(`qaDeliverables.items[${i}].url: harus URL http(s) valid.`);
      }
    });
  }
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

function validateAvailability(availability: unknown, errors: string[]): void {
  if (!isRecord(availability)) { errors.push('availability: wajib objek.'); return; }
  if (typeof availability.showOpenToWork !== 'boolean') errors.push('availability.showOpenToWork: wajib boolean.');
  if (typeof availability.showPreferences !== 'boolean') errors.push('availability.showPreferences: wajib boolean.');
  if (availability.noticePeriod !== undefined && typeof availability.noticePeriod !== 'string') {
    errors.push('availability.noticePeriod: harus string.');
  }
  if (availability.location !== undefined && typeof availability.location !== 'string') {
    errors.push('availability.location: harus string.');
  }
  if (!Array.isArray(availability.employmentTypes)) {
    errors.push('availability.employmentTypes: wajib array.');
  } else {
    availability.employmentTypes.forEach((t) => {
      if (!EMPLOYMENT_TYPES.includes(t as EmploymentType)) {
        errors.push(`availability.employmentTypes: tidak valid "${String(t)}".`);
      }
    });
  }
  if (!Array.isArray(availability.workArrangements)) {
    errors.push('availability.workArrangements: wajib array.');
  } else {
    availability.workArrangements.forEach((w) => {
      if (!WORK_ARRANGEMENT_VALUES.has(w as WorkArrangement)) {
        errors.push(`availability.workArrangements: tidak valid "${String(w)}".`);
      }
    });
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

function validateGithubRepos(githubRepos: unknown, errors: string[]): void {
  if (!Array.isArray(githubRepos)) { errors.push('githubRepos: wajib array.'); return; }
  githubRepos.forEach((entry, i) => {
    if (!isRecord(entry)) { errors.push(`githubRepos[${i}]: harus objek.`); return; }
    if (!isNonEmptyString(entry.id)) errors.push(`githubRepos[${i}].id: wajib string non-kosong.`);
    if (!isNonEmptyString(entry.url) || !GITHUB_REPO_URL_RE.test(entry.url as string)) {
      errors.push(`githubRepos[${i}].url: harus URL repo GitHub yang valid, mis. https://github.com/owner/repo.`);
    }
  });
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

// validToolIds/validSkillIds cross-check project.toolIds / data.skillIds
// against the tools / skills resources.
export function validatePortfolioData(
  data: unknown,
  validToolIds: Set<string>,
  validSkillIds: Set<string>
): PortfolioDataValidationResult {
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

  validateAvailability(data.availability, errors);
  validateExperience(data.experience, errors);
  validateEducation(data.education, errors);
  validateProjects(data.projects, validToolIds, errors);
  validateSkillEntries(data.skillEntries, validSkillIds, errors);
  validateQaDeliverables(data.qaDeliverables, errors);
  validateSectionOrder(data.sectionOrder, errors);
  validateEndorsements(data.endorsements, errors);
  validateCertifications(data.certifications, errors);
  validateArticles(data.articles, errors);
  validateSocials(data.socials, errors);
  validateGithubActivity(data.githubActivity, errors);
  validateGithubRepos(data.githubRepos, errors);
  validateCta(data.cta, data.socials, errors);

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: data as unknown as PortfolioData };
}

export function validatePortfolioStatus(status: unknown): status is PortfolioStatus {
  return typeof status === 'string' && PORTFOLIO_STATUSES.includes(status as PortfolioStatus);
}
