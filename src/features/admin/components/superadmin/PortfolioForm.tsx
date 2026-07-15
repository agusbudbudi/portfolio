import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, BadgeCheck, CheckCircle2, ExternalLink, Loader2, XCircle,
  UserCircle2, Briefcase, GraduationCap, Award, FolderKanban, Quote, Newspaper, Share2, MousePointerClick, Github,
} from 'lucide-react';
import type { PortfolioData, PortfolioRecord, PortfolioStatus, ToolConfig } from '../../../../types/portfolio';
import { apiCheckSlug } from '../../../../lib/adminApi';
import { slugify, isValidSlug, GITHUB_USERNAME_RE } from '../../../../lib/portfolioValidation';
import ImageUploadField from './ImageUploadField';
import CvUploadField from '../mentee/CvUploadField';
import AccordionSection from '../shared/AccordionSection';
import ExperienceListEditor from '../mentee/ExperienceListEditor';
import EducationListEditor from '../mentee/EducationListEditor';
import ProjectListEditor from '../mentee/ProjectListEditor';
import EndorsementListEditor from '../mentee/EndorsementListEditor';
import CertificationListEditor from '../mentee/CertificationListEditor';
import ArticleListEditor from '../mentee/ArticleListEditor';
import FormField from '../shared/FormField';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';

interface PortfolioFormProps {
  onClose: () => void;
  onSubmit: (payload: { slug: string; status: PortfolioStatus; data: PortfolioData }) => Promise<{ ok: boolean; reason?: string }>;
  record: PortfolioRecord | null; // null = create
  tools: ToolConfig[];
  canVerify?: boolean; // admin-only — server also enforces this, see api/portfolios/[slug].ts
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const URL_RE = /^https?:\/\/\S+$/;

const STATUS_TONE: Record<PortfolioStatus, StatusBadgeTone> = {
  draft: 'slate',
  published: 'emerald',
};

const emptyData: PortfolioData = {
  profile: { photo: '', name: '', bio: '', role: '', yearsOfExperience: undefined },
  experience: [],
  education: [],
  projects: [],
  endorsements: [],
  certifications: [],
  articles: [],
  socials: { linkedin: '', github: '', whatsapp: '', email: '', portfolioUrl: '' },
  cta: { title: '', description: '', showViewCv: false, showConnectLinkedin: false },
  githubActivity: { username: '', showActivity: false },
};

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onClose, onSubmit, record, tools, canVerify = false }) => {
  const isEdit = record !== null;
  const [data, setData] = useState<PortfolioData>(
    record
      ? {
        ...emptyData,
        ...record.data,
        education: record.data.education ?? [],
        certifications: record.data.certifications ?? [],
        articles: record.data.articles ?? [],
        cta: record.data.cta ?? emptyData.cta,
        githubActivity: record.data.githubActivity ?? emptyData.githubActivity,
      }
      : emptyData
  );
  const [slug, setSlug] = useState(record?.slug ?? '');
  const [status, setStatus] = useState<PortfolioStatus>(record?.status ?? 'draft');
  const [slugTouched, setSlugTouched] = useState(isEdit); // edit mode: don't auto-overwrite an existing slug
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const submitted = submitAttempt > 0;
  const [saving, setSaving] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Auto-derive the slug from the name until the admin edits it manually.
  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(data.profile.name));
  }, [data.profile.name, slugTouched]);

  // Debounced live availability check as the slug changes.
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!slug) { setSlugStatus('idle'); return; }
    if (!isValidSlug(slug)) { setSlugStatus('invalid'); return; }
    if (isEdit && slug === record.slug) { setSlugStatus('available'); return; }
    setSlugStatus('checking');
    checkTimer.current = setTimeout(async () => {
      try {
        const { available } = await apiCheckSlug(slug, record?.id);
        setSlugStatus(available ? 'available' : 'taken');
      } catch {
        setSlugStatus('idle');
      }
    }, 400);
    return () => { if (checkTimer.current) clearTimeout(checkTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempt((n) => n + 1);
    if (!data.profile.name.trim() || !data.profile.bio.trim()) {
      return;
    }
    if (!slug.trim() || !isValidSlug(slug)) {
      return;
    }
    if (slugStatus === 'taken') {
      return;
    }
    if (data.experience.some((e) => !e.company.trim() || !e.position.trim() || !e.jobDesc.trim() || !e.startDate.trim() || (!e.isCurrent && !e.endDate?.trim()))) {
      return;
    }
    if (data.education.some((e) => !e.institution.trim() || !e.degree.trim() || !e.startDate.trim() || (!e.isCurrent && !e.endDate?.trim()))) {
      return;
    }
    if (data.projects.some((p) => !p.name.trim() || !p.description.trim() || (p.projectUrl?.trim() && !URL_RE.test(p.projectUrl.trim())))) {
      return;
    }
    if (data.endorsements.some((e) => !e.name.trim() || !e.relation.trim() || !e.message.trim() || (e.linkedinUrl?.trim() && !URL_RE.test(e.linkedinUrl.trim())))) {
      return;
    }
    if (data.certifications.some((c) => !c.name.trim() || !c.issuer.trim() || !c.issueDate.trim() || (c.credentialUrl?.trim() && !URL_RE.test(c.credentialUrl.trim())))) {
      return;
    }
    if (data.articles.some((a) => !a.title.trim() || !URL_RE.test(a.url.trim()))) {
      return;
    }
    const ctaActive = data.cta.showViewCv || data.cta.showConnectLinkedin;
    if (ctaActive && (!data.cta.title.trim() || !data.cta.description.trim())) {
      return;
    }
    if (data.cta.showConnectLinkedin && !data.socials.linkedin?.trim()) {
      return;
    }
    if (data.githubActivity.showActivity && !GITHUB_USERNAME_RE.test(data.githubActivity.username.trim())) {
      return;
    }
    setError(null);
    setSaving(true);
    const result = await onSubmit({
      slug,
      status,
      data: {
        ...data,
        profile: {
          ...data.profile,
          photo: data.profile.photo?.trim() || undefined,
          role: data.profile.role?.trim() || undefined,
          cvUrl: data.profile.cvUrl?.trim() || undefined,
        },
        githubActivity: {
          ...data.githubActivity,
          username: data.githubActivity.username.trim(),
        },
      },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason ?? 'Gagal menyimpan portfolio.');
      return;
    }
    onClose();
  };

  const slugHint = {
    idle: null,
    checking: <span className="inline-flex items-center gap-1 text-ld-fog"><Loader2 size={12} className="animate-spin" /> Mengecek…</span>,
    available: <span className="inline-flex items-center gap-1 text-green-600"><CheckCircle2 size={12} /> Tersedia</span>,
    taken: <span className="inline-flex items-center gap-1 text-red-500"><XCircle size={12} /> Sudah dipakai</span>,
    invalid: <span className="inline-flex items-center gap-1 text-red-500"><XCircle size={12} /> Format tidak valid</span>,
  }[slugStatus];

  const ctaActive = data.cta.showViewCv || data.cta.showConnectLinkedin;

  const profileHasError = submitted && (
    !data.profile.name.trim() || !data.profile.bio.trim() || !slug.trim() || !isValidSlug(slug) || slugStatus === 'taken'
  );
  const experienceHasError = submitted && data.experience.some((e) =>
    !e.company.trim() || !e.position.trim() || !e.jobDesc.trim() || !e.startDate.trim() || (!e.isCurrent && !e.endDate?.trim())
  );
  const educationHasError = submitted && data.education.some((e) =>
    !e.institution.trim() || !e.degree.trim() || !e.startDate.trim() || (!e.isCurrent && !e.endDate?.trim())
  );
  const projectHasError = submitted && data.projects.some((p) =>
    !p.name.trim() || !p.description.trim() || Boolean(p.projectUrl?.trim() && !URL_RE.test(p.projectUrl.trim()))
  );
  const endorsementHasError = submitted && data.endorsements.some((e) =>
    !e.name.trim() || !e.relation.trim() || !e.message.trim() || Boolean(e.linkedinUrl?.trim() && !URL_RE.test(e.linkedinUrl.trim()))
  );
  const certificationHasError = submitted && data.certifications.some((c) =>
    !c.name.trim() || !c.issuer.trim() || !c.issueDate.trim() || Boolean(c.credentialUrl?.trim() && !URL_RE.test(c.credentialUrl.trim()))
  );
  const articleHasError = submitted && data.articles.some((a) => !a.title.trim() || !URL_RE.test(a.url.trim()));
  const ctaHasError = submitted && ctaActive && (!data.cta.title.trim() || !data.cta.description.trim());
  const socialHasError = submitted && data.cta.showConnectLinkedin && !data.socials.linkedin?.trim();
  const githubActivityHasError = submitted && data.githubActivity.showActivity && !GITHUB_USERNAME_RE.test(data.githubActivity.username.trim());

  // On a failed submit, force open every section with an invalid field and
  // scroll to the topmost one — double rAF so this runs after the accordion
  // sections above have re-rendered open (their own effect fires first, but
  // the resulting DOM isn't painted until the next frame).
  useEffect(() => {
    if (submitAttempt === 0) return;
    const hasAnyError =
      profileHasError || experienceHasError || educationHasError || projectHasError ||
      endorsementHasError || certificationHasError || articleHasError || ctaHasError || socialHasError ||
      githubActivityHasError;
    if (!hasAnyError) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector('[data-field-error="true"]');
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitAttempt]);

  return (
    <div className={ADMIN_CARD}>
      <div className={ADMIN_CARD_HEADER}>
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar portfolio"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{isEdit ? 'Edit Portfolio' : 'Tambah Portfolio'}</h2>
          {isEdit && <p className="text-sm font-semibold text-ld-onyx m-0 truncate">{record.data.profile.name}</p>}
          {isEdit && data.profile.isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest shrink-0 bg-blue-50 text-blue-600">
              <BadgeCheck size={11} /> Verified
            </span>
          )}
        </div>
        {isEdit && (
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <StatusBadge tone={STATUS_TONE[record.status]} className="shrink-0">{record.status}</StatusBadge>
            {canVerify && !data.profile.isVerified && (
              <button
                type="button"
                onClick={() => setData({ ...data, profile: { ...data.profile, isVerified: true } })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite hover:border-blue-500 hover:text-blue-600 cursor-pointer"
              >
                <BadgeCheck size={13} /> Verifikasi Mentee
              </button>
            )}
            {record.status === 'published' && (
              <a
                href={`/portfolio/${record.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ld-frost bg-white text-xs font-medium text-ld-graphite hover:border-ld-violet hover:text-ld-violet no-underline shrink-0"
              >
                <ExternalLink size={13} /> Lihat Profile
              </a>
            )}
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={`${ADMIN_CARD_BODY} w-full space-y-3`}>
        <AccordionSection title="Profile" icon={UserCircle2} hasError={profileHasError} errorSignal={submitAttempt} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <ImageUploadField
              label="Foto Profile"
              value={data.profile.photo}
              onChange={(photo) => setData({ ...data, profile: { ...data.profile, photo } })}
              feature="portfolio"
              maxWidth={480}
              ratioHint="Rasio 1:1, mis. 480×480px"
              shape="rounded-md"
              fallbackSrc="/saas-portfolio/img/portfolio-public/default-avatar-portfolio.webp"
            />
            <FormField label="Nama" required error={submitted && !data.profile.name.trim() ? 'Nama wajib diisi.' : null}>
              <input
                type="text"
                value={data.profile.name}
                onChange={(e) => setData({ ...data, profile: { ...data.profile, name: e.target.value } })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Slug" required hint={<span className="block text-[11px] mt-1">{slugHint}</span>} error={submitted && !slug.trim() ? 'Slug wajib diisi.' : null}>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
                placeholder="nama-mentee"
                className={inputClass}
              />
            </FormField>
            <FormField label="Role / Headline (opsional)">
              <input
                type="text"
                value={data.profile.role ?? ''}
                onChange={(e) => setData({ ...data, profile: { ...data.profile, role: e.target.value } })}
                placeholder="QA Automation Engineer"
                className={inputClass}
              />
            </FormField>
            <FormField label="Lama Pengalaman (tahun, opsional)">
              <input
                type="number"
                min={0}
                value={data.profile.yearsOfExperience ?? ''}
                onChange={(e) => setData({
                  ...data,
                  profile: { ...data.profile, yearsOfExperience: e.target.value === '' ? undefined : Number(e.target.value) },
                })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PortfolioStatus)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </FormField>
            <FormField label="Bio" required className="md:col-span-2" error={submitted && !data.profile.bio.trim() ? 'Bio wajib diisi.' : null}>
              <textarea
                value={data.profile.bio}
                onChange={(e) => setData({ ...data, profile: { ...data.profile, bio: e.target.value } })}
                rows={3}
                className={inputClass}
              />
            </FormField>
            <CvUploadField
              label="CV (PDF)"
              value={data.profile.cvUrl}
              onChange={(cvUrl) => setData({ ...data, profile: { ...data.profile, cvUrl } })}
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Experience" icon={Briefcase} badge={data.experience.length} hasError={experienceHasError} errorSignal={submitAttempt}>
          <ExperienceListEditor
            experience={data.experience}
            onChange={(experience) => setData({ ...data, experience })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="Education" icon={GraduationCap} badge={data.education.length} hasError={educationHasError} errorSignal={submitAttempt}>
          <EducationListEditor
            education={data.education}
            onChange={(education) => setData({ ...data, education })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="Project" icon={FolderKanban} badge={data.projects.length} hasError={projectHasError} errorSignal={submitAttempt}>
          <ProjectListEditor
            projects={data.projects}
            tools={tools}
            onChange={(projects) => setData({ ...data, projects })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="Endorsement" icon={Quote} badge={data.endorsements.length} hasError={endorsementHasError} errorSignal={submitAttempt}>
          <EndorsementListEditor
            endorsements={data.endorsements}
            onChange={(endorsements) => setData({ ...data, endorsements })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="Certification" icon={Award} badge={data.certifications.length} hasError={certificationHasError} errorSignal={submitAttempt}>
          <CertificationListEditor
            certifications={data.certifications}
            onChange={(certifications) => setData({ ...data, certifications })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="Article" icon={Newspaper} badge={data.articles.length} hasError={articleHasError} errorSignal={submitAttempt}>
          <ArticleListEditor
            articles={data.articles}
            onChange={(articles) => setData({ ...data, articles })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="Social Media" icon={Share2} hasError={socialHasError} errorSignal={submitAttempt}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <FormField
              label="LinkedIn"
              required={data.cta.showConnectLinkedin}
              error={submitted && data.cta.showConnectLinkedin && !data.socials.linkedin?.trim() ? 'LinkedIn wajib diisi saat "Tampilkan Connect LinkedIn" aktif.' : null}
            >
              <input
                type="url"
                value={data.socials.linkedin ?? ''}
                onChange={(e) => setData({ ...data, socials: { ...data.socials, linkedin: e.target.value } })}
                placeholder="https://linkedin.com/in/…"
                className={inputClass}
              />
            </FormField>
            <FormField label="GitHub">
              <input
                type="url"
                value={data.socials.github ?? ''}
                onChange={(e) => setData({ ...data, socials: { ...data.socials, github: e.target.value } })}
                placeholder="https://github.com/…"
                className={inputClass}
              />
            </FormField>
            <FormField label="WhatsApp">
              <input
                type="text"
                inputMode="numeric"
                value={data.socials.whatsapp ?? ''}
                onChange={(e) => setData({ ...data, socials: { ...data.socials, whatsapp: e.target.value.replace(/\D/g, '') } })}
                placeholder="6281234567890"
                className={inputClass}
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                value={data.socials.email ?? ''}
                onChange={(e) => setData({ ...data, socials: { ...data.socials, email: e.target.value } })}
                className={inputClass}
              />
            </FormField>
            <FormField label="Portfolio URL lain (opsional)" className="md:col-span-2">
              <input
                type="url"
                value={data.socials.portfolioUrl ?? ''}
                onChange={(e) => setData({ ...data, socials: { ...data.socials, portfolioUrl: e.target.value } })}
                placeholder="https://…"
                className={inputClass}
              />
            </FormField>
          </div>
        </AccordionSection>

        <AccordionSection title="GitHub Activity" icon={Github} hasError={githubActivityHasError} errorSignal={submitAttempt}>
          <div className="grid grid-cols-1 gap-y-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.githubActivity.showActivity}
                onChange={(e) => setData({ ...data, githubActivity: { ...data.githubActivity, showActivity: e.target.checked } })}
                className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
              />
              <span className="text-xs text-ld-graphite">Tampilkan GitHub Activity di halaman publik</span>
            </label>
            <FormField
              label="Username GitHub"
              required={data.githubActivity.showActivity}
              className="md:max-w-xs"
              hint={<span className="block text-[11px] mt-1 text-ld-fog">Buat contribution graph & aktivitas terbaru.</span>}
              error={githubActivityHasError ? 'Isi username GitHub yang valid saat "Tampilkan GitHub Activity" aktif.' : null}
            >
              <input
                type="text"
                value={data.githubActivity.username}
                onChange={(e) => setData({ ...data, githubActivity: { ...data.githubActivity, username: e.target.value.trim() } })}
                placeholder="username"
                className={inputClass}
              />
            </FormField>
          </div>
        </AccordionSection>

        <AccordionSection title="CTA" icon={MousePointerClick} hasError={ctaHasError} errorSignal={submitAttempt}>
          <div className="grid grid-cols-1 gap-y-4">
            <FormField label="Judul" required={ctaActive} error={submitted && ctaActive && !data.cta.title.trim() ? 'Judul CTA wajib diisi.' : null}>
              <input
                type="text"
                value={data.cta.title}
                onChange={(e) => setData({ ...data, cta: { ...data.cta, title: e.target.value } })}
                placeholder="Tertarik bekerja sama?"
                className={inputClass}
              />
            </FormField>
            <FormField label="Deskripsi" required={ctaActive} error={submitted && ctaActive && !data.cta.description.trim() ? 'Deskripsi CTA wajib diisi.' : null}>
              <textarea
                value={data.cta.description}
                onChange={(e) => setData({ ...data, cta: { ...data.cta, description: e.target.value } })}
                rows={3}
                className={inputClass}
              />
            </FormField>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.cta.showViewCv}
                onChange={(e) => setData({ ...data, cta: { ...data.cta, showViewCv: e.target.checked } })}
                className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
              />
              <span className="text-xs text-ld-graphite">Tampilkan tombol View CV</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.cta.showConnectLinkedin}
                onChange={(e) => setData({ ...data, cta: { ...data.cta, showConnectLinkedin: e.target.checked } })}
                className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
              />
              <span className="text-xs text-ld-graphite">Tampilkan tombol Connect LinkedIn</span>
            </label>
          </div>
        </AccordionSection>

        {error && <p className="text-sm text-red-500 m-0">{error}</p>}

        <div className="flex justify-end gap-2 pt-5 border-t border-ld-frost/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ld-frost bg-white text-sm text-ld-graphite cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Portfolio' : 'Tambah Portfolio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
