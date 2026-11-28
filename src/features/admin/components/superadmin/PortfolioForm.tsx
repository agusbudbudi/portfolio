import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, BadgeCheck, CheckCircle2, ExternalLink, Loader2, XCircle,
  UserCircle2, Briefcase, GraduationCap, Award, FolderKanban, Sparkles, FileCheck2, Quote, Newspaper, Share2, MousePointerClick, Github, FolderGit2, ListOrdered, CalendarClock, FlaskConical,
} from 'lucide-react';
import type {
  PortfolioData, PortfolioRecord, PortfolioStatus, SkillConfig, ToolConfig,
} from '../../../../types/portfolio';
import { QA_DELIVERABLES_DEFAULT_TITLE, QA_DELIVERABLES_DEFAULT_SUBTITLE, DEFAULT_SECTION_ORDER } from '../../../../types/portfolio';
import { apiCheckSlug } from '../../../../lib/adminApi';
import { slugify, isValidSlug, GITHUB_USERNAME_RE, GITHUB_REPO_URL_RE, normalizeSectionOrder } from '../../../../lib/portfolioValidation';
import ImageUploadField from './ImageUploadField';
import CvUploadField from '../mentee/CvUploadField';
import AvailabilityField from '../mentee/AvailabilityField';
import AccordionSection from '../shared/AccordionSection';
import ExperienceListEditor from '../mentee/ExperienceListEditor';
import EducationListEditor from '../mentee/EducationListEditor';
import ProjectListEditor from '../mentee/ProjectListEditor';
import PortfolioSkillsField from '../mentee/PortfolioSkillsField';
import QaDeliverablesEditor from '../mentee/QaDeliverablesEditor';
import QaSimulatorPortfolioField from '../mentee/QaSimulatorPortfolioField';
import GithubRepoListEditor from '../mentee/GithubRepoListEditor';
import SectionOrderEditor from '../mentee/SectionOrderEditor';
import EndorsementListEditor from '../mentee/EndorsementListEditor';
import CertificationListEditor from '../mentee/CertificationListEditor';
import ArticleListEditor from '../mentee/ArticleListEditor';
import FormField from '../shared/FormField';
import {
  ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY, ADMIN_FORM_FOOTER, ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY,
} from '../shared/adminCard';
import DashboardCardHeader, { CARD_ACTION_PRIMARY, CARD_ACTION_SECONDARY, FORM_FOOTER_STICKY_MOBILE } from '../shared/DashboardCardHeader';
import { QaPortfolioIcon } from '../../../../components/illustration/ProductIcons';
import StatusBadge, { type StatusBadgeTone } from '../shared/StatusBadge';
import Checkbox from '../../../../components/common/Checkbox';
import { useConfirmStore } from '../../../../store/useConfirmStore';

interface PortfolioFormProps {
  onClose: () => void;
  onSubmit: (payload: { slug: string; status: PortfolioStatus; data: PortfolioData }) => Promise<{ ok: boolean; reason?: string }>;
  record: PortfolioRecord | null; // null = create
  tools: ToolConfig[];
  skills: SkillConfig[];
  canVerify?: boolean; // admin-only; server also enforces this, see api/portfolios/[slug].ts
  /** 'member' = member-dashboard brand header/buttons; admin keeps its own style. */
  variant?: 'admin' | 'member';
  /** Create mode only: slug the guest claimed on the /portfolio landing. */
  initialSlug?: string | null;
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
  availability: { showOpenToWork: false, showPreferences: false, noticePeriod: '', employmentTypes: [], workArrangements: [], location: '' },
  experience: [],
  education: [],
  projects: [],
  skillEntries: [],
  qaDeliverables: { title: QA_DELIVERABLES_DEFAULT_TITLE, subtitle: QA_DELIVERABLES_DEFAULT_SUBTITLE, items: [] },
  endorsements: [],
  certifications: [],
  articles: [],
  socials: { linkedin: '', github: '', whatsapp: '', email: '', portfolioUrl: '' },
  cta: { title: '', description: '', showViewCv: false, showConnectLinkedin: false },
  githubActivity: { username: '', showActivity: false },
  githubRepos: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
};

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const PortfolioForm: React.FC<PortfolioFormProps> = ({ onClose, onSubmit, record, tools, skills, canVerify = false, variant = 'admin', initialSlug = null }) => {
  const isMember = variant === 'member';
  const isEdit = record !== null;
  const [data, setData] = useState<PortfolioData>(
    record
      ? {
        ...emptyData,
        ...record.data,
        availability: record.data.availability ?? emptyData.availability,
        education: record.data.education ?? [],
        skillEntries: record.data.skillEntries ?? [],
        qaDeliverables: record.data.qaDeliverables ?? emptyData.qaDeliverables,
        certifications: record.data.certifications ?? [],
        articles: record.data.articles ?? [],
        cta: record.data.cta ?? emptyData.cta,
        githubActivity: record.data.githubActivity ?? emptyData.githubActivity,
        githubRepos: record.data.githubRepos ?? [],
        sectionOrder: normalizeSectionOrder(record.data.sectionOrder),
      }
      : emptyData
  );
  const claimedSlug = !record && initialSlug ? initialSlug : null;
  const [slug, setSlug] = useState(record?.slug ?? claimedSlug ?? '');
  // Status is chosen by which footer button saves (Simpan draft / Simpan & publish).
  const currentStatus: PortfolioStatus = record?.status ?? 'draft';
  const [savingAs, setSavingAs] = useState<PortfolioStatus | null>(null);
  // Edit mode or a claimed slug: don't auto-overwrite it from the name.
  const [slugTouched, setSlugTouched] = useState(isEdit || !!claimedSlug);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const submitted = submitAttempt > 0;
  const [saving, setSaving] = useState(false);
  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const openConfirm = useConfirmStore((st) => st.open);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The clicked footer button says which status to save; Enter keeps the current one.
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const status: PortfolioStatus = submitter?.value === 'published' || submitter?.value === 'draft' ? submitter.value : currentStatus;
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
    if (data.projects.some((p) =>
      !p.name.trim() || !p.description.trim() || (p.projectUrl?.trim() && !URL_RE.test(p.projectUrl.trim())) ||
      p.platforms?.some((pl) => pl.url?.trim() && !URL_RE.test(pl.url.trim()))
    )) {
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
    if (
      !data.qaDeliverables.title.trim() || !data.qaDeliverables.subtitle.trim() ||
      data.qaDeliverables.items.some((d) => !d.title.trim() || !URL_RE.test(d.url.trim()))
    ) {
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
    if (data.githubRepos.some((r) => !GITHUB_REPO_URL_RE.test(r.url.trim()))) {
      return;
    }
    setError(null);
    // First publish goes live for everyone: confirm it first.
    if (status === 'published' && currentStatus !== 'published') {
      openConfirm({
        mode: 'cta',
        variant: 'info',
        icon: 'info',
        confirmLabel: 'Ya, publish sekarang',
        title: isMember ? 'Publish portfolio kamu?' : 'Publish portfolio ini?',
        description: <>Setelah dipublish, portfolio langsung live di <strong className="font-semibold text-ld-onyx break-all">{window.location.host}/portfolio/{slug}</strong> dan bisa dibuka siapa saja, termasuk recruiter. Bisa dijadikan draft lagi kapan saja.</>,
        onConfirm: () => save(status),
      });
      return;
    }
    await save(status);
  };

  const save = async (status: PortfolioStatus) => {
    setSaving(true);
    setSavingAs(status);
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
    setSavingAs(null);
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
    !p.name.trim() || !p.description.trim() || Boolean(p.projectUrl?.trim() && !URL_RE.test(p.projectUrl.trim())) ||
    Boolean(p.platforms?.some((pl) => pl.url?.trim() && !URL_RE.test(pl.url.trim())))
  );
  const endorsementHasError = submitted && data.endorsements.some((e) =>
    !e.name.trim() || !e.relation.trim() || !e.message.trim() || Boolean(e.linkedinUrl?.trim() && !URL_RE.test(e.linkedinUrl.trim()))
  );
  const certificationHasError = submitted && data.certifications.some((c) =>
    !c.name.trim() || !c.issuer.trim() || !c.issueDate.trim() || Boolean(c.credentialUrl?.trim() && !URL_RE.test(c.credentialUrl.trim()))
  );
  const articleHasError = submitted && data.articles.some((a) => !a.title.trim() || !URL_RE.test(a.url.trim()));
  const qaDeliverablesHasError = submitted && (
    !data.qaDeliverables.title.trim() || !data.qaDeliverables.subtitle.trim() ||
    data.qaDeliverables.items.some((d) => !d.title.trim() || !URL_RE.test(d.url.trim()))
  );
  const ctaHasError = submitted && ctaActive && (!data.cta.title.trim() || !data.cta.description.trim());
  const socialHasError = submitted && data.cta.showConnectLinkedin && !data.socials.linkedin?.trim();
  const githubActivityHasError = submitted && data.githubActivity.showActivity && !GITHUB_USERNAME_RE.test(data.githubActivity.username.trim());
  const githubReposHasError = submitted && data.githubRepos.some((r) => !GITHUB_REPO_URL_RE.test(r.url.trim()));

  // On a failed submit, force open every section with an invalid field and
  // scroll to the topmost one — double rAF so this runs after the accordion
  // sections above have re-rendered open (their own effect fires first, but
  // the resulting DOM isn't painted until the next frame).
  useEffect(() => {
    if (submitAttempt === 0) return;
    const hasAnyError =
      profileHasError || experienceHasError || educationHasError || projectHasError ||
      endorsementHasError || certificationHasError || articleHasError || ctaHasError || socialHasError ||
      githubActivityHasError || githubReposHasError;
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
      {isMember ? (
        <DashboardCardHeader
          onBack={onClose}
          icon={<QaPortfolioIcon size={44} />}
          eyebrow={isEdit ? 'Edit portfolio' : 'Buat portfolio'}
          title={isEdit ? (record.data.profile.name || 'Portfolio tanpa nama') : 'Portfolio baru'}
          badge={isEdit && (
            <>
              <StatusBadge tone={STATUS_TONE[record.status]}>{record.status}</StatusBadge>
              {data.profile.isVerified && (
                <StatusBadge tone="sky" className="inline-flex items-center gap-1"><BadgeCheck size={11} /> Verified</StatusBadge>
              )}
            </>
          )}
          actions={isEdit && record.status === 'published' && (
            <a href={`/portfolio/${record.slug}`} target="_blank" rel="noopener noreferrer" className={CARD_ACTION_SECONDARY}>
              <ExternalLink size={16} /> Lihat
            </a>
          )}
        />
      ) : (
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
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        // Enter in a text field would "click" the first submit button (Jadikan draft):
        // only the footer buttons save, so the status change is always deliberate.
        onKeyDown={(e) => {
          const t = e.target as HTMLElement;
          if (e.key === 'Enter' && t instanceof HTMLInputElement && !['checkbox', 'radio', 'submit', 'button'].includes(t.type)) e.preventDefault();
        }}
        className={`${ADMIN_CARD_BODY} w-full space-y-3 ${isMember ? 'max-md:pb-24' : ''}`}>
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

        <AccordionSection title="Availability & Work Preference" icon={CalendarClock}>
          <AvailabilityField
            value={data.availability}
            onChange={(availability) => setData({ ...data, availability })}
          />
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

        <AccordionSection
          title="QA Documentation & Deliverables"
          icon={FileCheck2}
          badge={data.qaDeliverables.items.length}
          hasError={qaDeliverablesHasError}
          errorSignal={submitAttempt}
        >
          <QaDeliverablesEditor
            value={data.qaDeliverables}
            onChange={(qaDeliverables) => setData({ ...data, qaDeliverables })}
            submitted={submitted}
          />
        </AccordionSection>

        <AccordionSection title="QA Simulator" icon={FlaskConical} badge={data.qaSimulator?.projectIds.length ?? 0}>
          <QaSimulatorPortfolioField
            value={data.qaSimulator ?? { projectIds: [] }}
            onChange={(qaSimulator) => setData({ ...data, qaSimulator })}
            ownerId={record?.ownerId ?? null}
          />
        </AccordionSection>

        <AccordionSection title="Skills" icon={Sparkles} badge={data.skillEntries.length} errorSignal={submitAttempt}>
          <PortfolioSkillsField
            allSkills={skills}
            entries={data.skillEntries}
            onChange={(skillEntries) => setData({ ...data, skillEntries })}
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
            <Checkbox checked={data.githubActivity.showActivity} onChange={(c) => setData({ ...data, githubActivity: { ...data.githubActivity, showActivity: c } })} size="sm" align="center" className="select-none" labelClassName="text-xs leading-relaxed text-ld-graphite">Tampilkan GitHub Activity di halaman publik</Checkbox>
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

        <AccordionSection
          title="GitHub Repos"
          icon={FolderGit2}
          badge={data.githubRepos.length}
          hasError={githubReposHasError}
          errorSignal={submitAttempt}
        >
          <GithubRepoListEditor
            repos={data.githubRepos}
            onChange={(githubRepos) => setData({ ...data, githubRepos })}
            submitted={submitted}
          />
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
            <Checkbox checked={data.cta.showViewCv} onChange={(c) => setData({ ...data, cta: { ...data.cta, showViewCv: c } })} size="sm" align="center" className="select-none" labelClassName="text-xs leading-relaxed text-ld-graphite">Tampilkan tombol View CV</Checkbox>
            <Checkbox checked={data.cta.showConnectLinkedin} onChange={(c) => setData({ ...data, cta: { ...data.cta, showConnectLinkedin: c } })} size="sm" align="center" className="select-none" labelClassName="text-xs leading-relaxed text-ld-graphite">Tampilkan tombol Connect LinkedIn</Checkbox>
          </div>
        </AccordionSection>

        <AccordionSection title="Configuration Order" icon={ListOrdered}>
          <SectionOrderEditor
            order={data.sectionOrder}
            onChange={(sectionOrder) => setData({ ...data, sectionOrder })}
          />
        </AccordionSection>

        {error && <p className="text-sm text-red-500 m-0">{error}</p>}

        <div className={isMember ? FORM_FOOTER_STICKY_MOBILE : ADMIN_FORM_FOOTER}>
          <button
            type="button"
            onClick={onClose}
            className={isMember ? CARD_ACTION_SECONDARY : ADMIN_BTN_SECONDARY}
          >
            Batal
          </button>
          {/* Secondary keeps or makes it a draft; primary publishes (or keeps it published). */}
          <button
            type="submit"
            name="status"
            value="draft"
            disabled={saving}
            className={isMember ? CARD_ACTION_SECONDARY : ADMIN_BTN_SECONDARY}
            title={currentStatus === 'published' ? 'Simpan dan sembunyikan dari publik' : undefined}
          >
            {savingAs === 'draft' ? 'Menyimpan…' : currentStatus === 'published' ? 'Jadikan draft' : 'Simpan draft'}
          </button>
          <button
            type="submit"
            name="status"
            value="published"
            disabled={saving}
            className={isMember ? CARD_ACTION_PRIMARY : ADMIN_BTN_PRIMARY}
          >
            {savingAs === 'published' ? 'Menyimpan…' : currentStatus === 'published' ? 'Simpan perubahan' : 'Simpan & publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm;
