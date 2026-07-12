import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MentorConfig, TopicConfig } from '../../../../../types/mentoring';
import ScheduleEditor from './ScheduleEditor';
import TopicsSelect from './TopicsSelect';
import MentorExperienceListEditor from './MentorExperienceListEditor';
import { ADMIN_CARD, ADMIN_CARD_HEADER, ADMIN_CARD_BODY } from './adminCard';

// Rendered conditionally by MentorsTab so form state re-initializes from
// props on every open — no reset effect needed.
interface MentorFormProps {
  onClose: () => void;
  onSubmit: (mentor: MentorConfig) => Promise<{ ok: boolean; reason?: string }>;
  mentor: MentorConfig | null; // null = create
  existingIds: string[];
  topics: TopicConfig[];
  availableDays: string[];
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
  onClose, onSubmit, mentor, existingIds, topics, availableDays,
}) => {
  const isEdit = mentor !== null;
  const [form, setForm] = useState<MentorConfig>(
    mentor ? { ...emptyMentor, ...mentor, workExperience: mentor.workExperience ?? [] } : emptyMentor
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const togglePlatform = (key: keyof NonNullable<MentorConfig['platforms']>) => {
    setForm((f) => ({
      ...f,
      platforms: { ...f.platforms, [key]: !f.platforms?.[key] },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!SLUG_RE.test(form.id)) {
      setError('ID harus slug lowercase, contoh: agus-budiman');
      return;
    }
    if (!isEdit && existingIds.includes(form.id)) {
      setError(`ID "${form.id}" sudah dipakai mentor lain.`);
      return;
    }
    if (!form.name.trim() || !form.bio.trim()) {
      setError('Nama dan bio wajib diisi.');
      return;
    }
    if (!WHATSAPP_RE.test(form.whatsapp)) {
      setError('WhatsApp harus 8-15 digit angka, format internasional tanpa + (contoh: 6281234567890).');
      return;
    }
    if (form.expertise.length === 0) {
      setError('Pilih minimal satu expertise.');
      return;
    }
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
          <h2 className="text-sm font-semibold text-ld-onyx m-0">
            {isEdit ? 'Edit Mentor' : 'Tambah Mentor'}
          </h2>
          {isEdit && <p className="text-sm font-semibold text-ld-onyx m-0">{mentor.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={`${ADMIN_CARD_BODY} w-full`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-3">Profil</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <label className="block">
                  <span className="block text-xs font-medium text-ld-graphite mb-1.5">ID (slug, tidak bisa diubah setelah dibuat)</span>
                  <input
                    type="text"
                    value={form.id}
                    disabled={isEdit}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="agus-budiman"
                    className={`${inputClass} disabled:bg-ld-cloud disabled:text-ld-fog`}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-ld-graphite mb-1.5">Nama</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-ld-graphite mb-1.5">WhatsApp (contoh: 6281234567890)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value.replace(/\D/g, '') })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="block text-xs font-medium text-ld-graphite mb-1.5">Avatar URL (opsional)</span>
                  <input
                    type="text"
                    value={form.avatar ?? ''}
                    onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                    placeholder="/img/profile/…webp atau https://…"
                    className={inputClass}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="block text-xs font-medium text-ld-graphite mb-1.5">Bio (singkat, tampil di card mentor)</span>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={1}
                    className={inputClass}
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="block text-xs font-medium text-ld-graphite mb-1.5">Detail Profile (opsional, tampil di modal profile mentor)</span>
                  <textarea
                    value={form.detailProfile ?? ''}
                    onChange={(e) => setForm({ ...form, detailProfile: e.target.value })}
                    rows={6}
                    placeholder="Ceritakan pengalaman, pencapaian, dan gaya mentoring secara lebih lengkap…"
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            <section>
              <TopicsSelect
                topics={topics}
                selected={form.expertise}
                maxSelectable={topics.length}
                onChange={(expertise) => setForm({ ...form, expertise })}
                error={null}
                label="Expertise"
              />
            </section>

            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Platform Mentoring</h3>
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
            </section>
          </div>

          <section className="lg:pl-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Jadwal Mingguan</h3>
            <p className="text-xs text-ld-fog m-0 mb-3">Jam mulai per hari — durasi sesi mengikuti Booking Rules.</p>
            <ScheduleEditor
              schedule={form.schedule}
              availableDays={availableDays}
              onChange={(schedule) => setForm({ ...form, schedule })}
            />
          </section>
        </div>

        <section className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Pengalaman Kerja</h3>
          <p className="text-xs text-ld-fog m-0 mb-3">Riwayat karier mentor, tampil di halaman detail mentor.</p>
          <MentorExperienceListEditor
            experience={form.workExperience ?? []}
            onChange={(workExperience) => setForm({ ...form, workExperience })}
          />
        </section>

        {error && <p className="text-sm text-red-500 m-0 mt-6">{error}</p>}

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
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Mentor' : 'Tambah Mentor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorForm;
