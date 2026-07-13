import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, UserCircle2, Tags, Share2, CalendarClock, Briefcase } from 'lucide-react';
import type { MentorConfig, TopicConfig } from '../../../../types/mentoring';
import ScheduleEditor from './ScheduleEditor';
import TopicsSelect from '../superadmin/TopicsSelect';
import MentorExperienceListEditor from './MentorExperienceListEditor';
import AccordionSection from '../shared/AccordionSection';
import FormField from '../shared/FormField';
import ImageUploadField from '../superadmin/ImageUploadField';
import { slugify } from '../../../../lib/portfolioValidation';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from '../shared/adminCard';

// Rendered conditionally by both MentorsTab (admin, managing any mentor) and
// MemberDashboard (self-serve mentor application) — mode swaps the header
// title and submit label to match each context's own copy elsewhere
// (mentorStatusCard's "Ajukan Jadi Mentor" / "Edit & Ajukan Ulang" /
// "Edit Profil Mentor" buttons), since "Tambah/Edit Mentor" reads like an
// admin managing someone else's record, not a member applying for themselves.
interface MentorFormProps {
  onClose: () => void;
  onSubmit: (mentor: MentorConfig) => Promise<{ ok: boolean; reason?: string }>;
  mentor: MentorConfig | null; // null = create
  existingIds: string[];
  topics: TopicConfig[];
  availableDays: string[];
  mode?: 'admin' | 'member';
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const WHATSAPP_RE = /^\d{8,15}$/;

const PLATFORM_OPTIONS = [
  { key: 'digitalSkola' as const, label: 'Digital Skola' },
  { key: 'dealls' as const, label: 'Dealls' },
];

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-frost bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptyMentor: MentorConfig = {
  id: '',
  name: '',
  whatsapp: '',
  expertise: [],
  bio: '',
  detailProfile: '',
  avatar: '',
  workExperience: [],
  schedule: {},
};

const MentorForm: React.FC<MentorFormProps> = ({
  onClose, onSubmit, mentor, existingIds, topics, availableDays, mode = 'admin',
}) => {
  const isEdit = mentor !== null;
  const isReapply = mode === 'member' && mentor?.verificationStatus === 'rejected';
  const title = mode === 'admin'
    ? (isEdit ? 'Edit Mentor' : 'Tambah Mentor')
    : (isReapply ? 'Edit & Ajukan Ulang' : isEdit ? 'Edit Profil Mentor' : 'Ajukan Jadi Mentor');
  const submitLabel = mode === 'admin'
    ? (isEdit ? 'Simpan Mentor' : 'Tambah Mentor')
    : (isReapply ? 'Ajukan Ulang' : isEdit ? 'Simpan Perubahan' : 'Ajukan Sekarang');
  const [form, setForm] = useState<MentorConfig>(
    mentor ? { ...emptyMentor, ...mentor, workExperience: mentor.workExperience ?? [] } : emptyMentor
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const submitted = submitAttempt > 0;
  const formRef = useRef<HTMLFormElement>(null);
  const [idTouched, setIdTouched] = useState(isEdit); // edit mode: id is fixed, never auto-derive

  // Auto-derive the id slug from the name until the admin edits it manually
  // (same pattern as PortfolioForm's slug-from-name auto-fill).
  useEffect(() => {
    if (idTouched) return;
    setForm((f) => ({ ...f, id: slugify(f.name) }));
  }, [form.name, idTouched]);

  const idError = submitted && !SLUG_RE.test(form.id)
    ? 'ID harus slug lowercase, contoh: agus-budiman'
    : submitted && !isEdit && existingIds.includes(form.id)
      ? `ID "${form.id}" sudah dipakai mentor lain.`
      : null;
  const nameError = submitted && !form.name.trim() ? 'Nama wajib diisi.' : null;
  const whatsappError = submitted && !WHATSAPP_RE.test(form.whatsapp)
    ? 'WhatsApp harus 8-15 digit angka, format internasional tanpa + (contoh: 6281234567890).'
    : null;
  const bioError = submitted && !form.bio.trim() ? 'Bio wajib diisi.' : null;
  const expertiseError = submitted && form.expertise.length === 0 ? 'Pilih minimal satu expertise.' : null;
  const workExperienceHasError = submitted && (form.workExperience ?? []).some((e) =>
    !e.company.trim() || !e.position.trim() || !e.startDate.trim() || (!e.isCurrent && !e.endDate?.trim())
  );

  const profileHasError = Boolean(idError || nameError || whatsappError || bioError);
  const expertiseHasError = Boolean(expertiseError);

  // Mirrors PortfolioForm's scroll-to-first-invalid-field: after a failed
  // submit, force the offending accordion open (its own effect reacts to
  // errorSignal) then scroll to the first FormField/TopicsSelect flagged
  // with data-field-error — double rAF so it runs after that reopen paints.
  useEffect(() => {
    if (submitAttempt === 0) return;
    if (!profileHasError && !expertiseHasError && !workExperienceHasError) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const firstInvalid = formRef.current?.querySelector('[data-field-error="true"]');
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitAttempt]);

  const togglePlatform = (key: keyof NonNullable<MentorConfig['platforms']>) => {
    setForm((f) => ({
      ...f,
      platforms: { ...f.platforms, [key]: !f.platforms?.[key] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempt((n) => n + 1);
    if (!SLUG_RE.test(form.id)) return;
    if (!isEdit && existingIds.includes(form.id)) return;
    if (!form.name.trim() || !form.bio.trim()) return;
    if (!WHATSAPP_RE.test(form.whatsapp)) return;
    if (form.expertise.length === 0) return;
    if ((form.workExperience ?? []).some((e) =>
      !e.company.trim() || !e.position.trim() || !e.startDate.trim() || (!e.isCurrent && !e.endDate?.trim())
    )) return;
    setError(null);
    setSaving(true);
    const result = await onSubmit({
      ...form,
      avatar: form.avatar?.trim() || undefined,
      detailProfile: form.detailProfile?.trim() || undefined,
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.reason ?? 'Gagal menyimpan mentor.');
      return;
    }
    onClose();
  };

  return (
    <div className={ADMIN_CARD}>
      <div className={ADMIN_CARD_HEADER}>
        <button
          onClick={onClose}
          className="p-1.5 -ml-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar mentor"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold text-ld-onyx m-0">{title}</h2>
          {mode === 'admin' && isEdit && <p className="text-sm font-semibold text-ld-onyx m-0">{mentor.name}</p>}
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className={`${ADMIN_CARD_BODY} w-full space-y-3`}>
        <AccordionSection title="Profil" icon={UserCircle2} hasError={profileHasError} errorSignal={submitAttempt} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <FormField label="ID (slug, tidak bisa diubah setelah dibuat)" required error={idError}>
              <input
                type="text"
                value={form.id}
                disabled={isEdit}
                onChange={(e) => { setForm({ ...form, id: e.target.value }); setIdTouched(true); }}
                placeholder="agus-budiman"
                className={`${inputClass} disabled:bg-ld-cloud disabled:text-ld-fog`}
              />
            </FormField>
            <FormField label="Nama" required error={nameError}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </FormField>
            <FormField label="WhatsApp (contoh: 6281234567890)" required error={whatsappError}>
              <input
                type="text"
                inputMode="numeric"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                className={inputClass}
              />
            </FormField>
            <ImageUploadField
              label="Foto Profil (opsional)"
              value={form.avatar}
              onChange={(avatar) => setForm({ ...form, avatar })}
              feature="mentor"
              maxWidth={480}
              ratioHint="Rasio 1:1, mis. 480×480px"
              shape="rounded-md"
              fallbackSrc="/admin/img/default-avatar-mentor.webp"
            />
            <FormField label="Bio (singkat, tampil di card mentor)" required className="md:col-span-2" error={bioError}>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={1}
                className={inputClass}
              />
            </FormField>
            <FormField label="Detail Profile (opsional, tampil di modal profile mentor)" className="md:col-span-2">
              <textarea
                value={form.detailProfile ?? ''}
                onChange={(e) => setForm({ ...form, detailProfile: e.target.value })}
                rows={6}
                placeholder="Ceritakan pengalaman, pencapaian, dan gaya mentoring secara lebih lengkap…"
                className={inputClass}
              />
            </FormField>
          </div>
        </AccordionSection>

        <AccordionSection title="Expertise" icon={Tags} badge={form.expertise.length} hasError={expertiseHasError} errorSignal={submitAttempt}>
          <div data-field-error={expertiseError ? 'true' : undefined}>
            <TopicsSelect
              topics={topics}
              selected={form.expertise}
              maxSelectable={topics.length}
              onChange={(expertise) => setForm({ ...form, expertise })}
              error={expertiseError}
              label="Expertise"
            />
          </div>
        </AccordionSection>

        <AccordionSection title="Platform Mentoring" icon={Share2}>
          <p className="text-xs text-ld-fog m-0 mb-3">Platform eksternal tempat mentor ini juga terdaftar.</p>
          <div className="flex flex-wrap gap-4">
            {PLATFORM_OPTIONS.map((platform) => (
              <label key={platform.key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.platforms?.[platform.key] ?? false}
                  onChange={() => togglePlatform(platform.key)}
                  className="w-4 h-4 rounded border-ld-frost text-ld-violet focus:ring-ld-lilac cursor-pointer"
                />
                <span className="text-sm text-ld-graphite">{platform.label}</span>
              </label>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Jadwal Mingguan" icon={CalendarClock}>
          <p className="text-xs text-ld-fog m-0 mb-3">Jam mulai per hari — durasi sesi mengikuti Booking Rules.</p>
          <ScheduleEditor
            schedule={form.schedule}
            availableDays={availableDays}
            onChange={(schedule) => setForm({ ...form, schedule })}
          />
        </AccordionSection>

        <AccordionSection title="Pengalaman Kerja" icon={Briefcase} badge={(form.workExperience ?? []).length} hasError={workExperienceHasError} errorSignal={submitAttempt}>
          <p className="text-xs text-ld-fog m-0 mb-3">Riwayat karier mentor, tampil di halaman detail mentor.</p>
          <MentorExperienceListEditor
            experience={form.workExperience ?? []}
            onChange={(workExperience) => setForm({ ...form, workExperience })}
            submitted={submitted}
          />
        </AccordionSection>

        {error && <p className="text-sm text-red-500 m-0 mt-3">{error}</p>}

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-ld-frost/60">
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
            {saving ? 'Menyimpan…' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorForm;
