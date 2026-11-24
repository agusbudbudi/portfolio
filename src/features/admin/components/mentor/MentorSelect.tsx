import React from 'react';
import { User as UserIcon } from 'lucide-react';
import type { MentorConfig, TopicConfig } from '../../../../types/mentoring';
import Combobox from '../../../../components/common/Combobox';

// Searchable mentor picker with avatar — admin equivalent of the public
// MentorField carousel, built for scanning a mentor list by name instead of
// scrolling cards.
interface MentorSelectProps {
  mentors: MentorConfig[];
  topics: TopicConfig[];
  value: string;
  onChange: (mentorId: string) => void;
  error: string | null;
}

const Avatar: React.FC<{ mentor: MentorConfig; size?: number }> = ({ mentor, size = 28 }) => (
  <img
    src={mentor.avatar || '/admin/img/default-avatar-mentor.webp'}
    alt=""
    className="rounded-full object-cover border border-ld-frost shrink-0"
    style={{ width: size, height: size }}
  />
);

const MentorSelect: React.FC<MentorSelectProps> = ({ mentors, topics, value, onChange, error }) => {
  const topicLabel = (id: string) => topics.find((t) => t.id === id)?.label ?? id;
  const options = mentors.map((m) => ({
    value: m.id,
    label: m.name,
    description: m.expertise.map(topicLabel).join(', '),
    leading: <Avatar mentor={m} />,
  }));

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-ld-graphite">
        <UserIcon size={15} className="text-ld-violet flex-shrink-0" />
        Mentor <span className="text-red-500 ml-0.5">*</span>
      </label>
      <Combobox
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Pilih mentor"
        searchPlaceholder="Cari mentor…"
        emptyLabel="Mentor tidak ditemukan."
        aria-label="Mentor"
        invalid={!!error}
      />
      {error && <p className="text-xs text-red-500 m-0" role="alert">{error}</p>}
    </div>
  );
};

export default MentorSelect;
