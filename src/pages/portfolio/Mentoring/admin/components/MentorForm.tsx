import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { MentorConfig, TopicConfig } from '../../../../../types/mentoring';
import ScheduleEditor from './ScheduleEditor';

// Rendered conditionally by MentorsTab so form state re-initializes from
// props on every open — no reset effect needed.
interface MentorFormProps {
  onClose: () => void;
  onSubmit: (mentor: MentorConfig) => void;
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
  'w-full px-3.5 py-2.5 rounded-lg border border-ld-ash bg-white text-sm text-ld-onyx focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac';

const emptyMentor: MentorConfig = {
  id: '',
  name: '',
  whatsapp: '',
  expertise: [],
  bio: '',
  avatar: '',
  schedule: {},
};

const MentorForm: React.FC<MentorFormProps> = ({
  onClose, onSubmit, mentor, existingIds, topics, availableDays,
}) => {
  const isEdit = mentor !== null;
  const [form, setForm] = useState<MentorConfig>(mentor ?? emptyMentor);
  const [error, setError] = useState<string | null>(null);

  const toggleExpertise = (topicId: string) => {
    setForm((f) => ({
      ...f,
      expertise: f.expertise.includes(topicId)
        ? f.expertise.filter((id) => id !== topicId)
        : [...f.expertise, topicId],
    }));
  };

  const togglePlatform = (key: keyof NonNullable<MentorConfig['platforms']>) => {
    setForm((f) => ({
      ...f,
      platforms: { ...f.platforms, [key]: !f.platforms?.[key] },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    onSubmit({ ...form, avatar: form.avatar?.trim() || undefined });
    onClose();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onClose}
          className="p-2 -ml-2 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud cursor-pointer border-none bg-transparent transition-colors"
          aria-label="Kembali ke daftar mentor"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ld-fog m-0">
            {isEdit ? 'Edit Mentor' : 'Tambah Mentor'}
          </h2>
          {isEdit && <p className="text-xs text-ld-fog m-0 mt-1">{mentor.name}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
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
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          <section className="pt-6 border-t border-ld-ash/60">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Expertise</h3>
            <p className="text-xs text-ld-fog m-0 mb-3">Topic yang bisa dibawakan mentor ini.</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const active = form.expertise.includes(topic.id);
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggleExpertise(topic.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                      active
                        ? 'bg-ld-violet text-white border-ld-violet'
                        : 'bg-white text-ld-fog border-ld-ash hover:border-ld-violet'
                    }`}
                  >
                    {topic.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pt-6 border-t border-ld-ash/60">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Platform Mentoring</h3>
            <p className="text-xs text-ld-fog m-0 mb-3">Platform eksternal tempat mentor ini juga terdaftar.</p>
            <div className="flex flex-wrap gap-4">
              {PLATFORM_OPTIONS.map((platform) => (
                <label key={platform.key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.platforms?.[platform.key] ?? false}
                    onChange={() => togglePlatform(platform.key)}
                    className="w-4 h-4 rounded border-ld-ash text-ld-violet focus:ring-ld-lilac cursor-pointer"
                  />
                  <span className="text-sm text-ld-graphite">{platform.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="pt-6 border-t border-ld-ash/60">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-ld-steel m-0 mb-1">Jadwal Mingguan</h3>
            <p className="text-xs text-ld-fog m-0 mb-3">Jam mulai per hari — durasi sesi mengikuti Booking Rules.</p>
            <ScheduleEditor
              schedule={form.schedule}
              availableDays={availableDays}
              onChange={(schedule) => setForm({ ...form, schedule })}
            />
          </section>

          {error && <p className="text-sm text-red-500 m-0">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 mt-8 pt-5 border-t border-ld-ash/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-ld-ash bg-white text-sm text-ld-graphite cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium cursor-pointer border-none"
          >
            {isEdit ? 'Simpan Mentor' : 'Tambah Mentor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorForm;
