import React from 'react';
import { BookOpen } from 'lucide-react';
import type { TopicConfig } from '../../../../types/mentoring';
import Combobox from '../../../../components/common/Combobox';

// Searchable multi-select — admin equivalent of the public TopicsField
// slider, built for a long topic list where scanning pills isn't practical.
// Reusable anywhere a topic id[] needs picking, with or without a cap.
interface TopicsSelectProps {
  topics: TopicConfig[];
  selected: string[];
  maxSelectable: number;
  onChange: (selected: string[]) => void;
  error: string | null;
  label?: string;
  required?: boolean;
}

const TopicsSelect: React.FC<TopicsSelectProps> = ({
  topics, selected, maxSelectable, onChange, error, label = 'Topic', required = true,
}) => {
  const capped = maxSelectable < topics.length;

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-medium text-ld-graphite">
        <BookOpen size={15} className="text-ld-violet flex-shrink-0" />
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <Combobox
        multiple
        options={topics.map((t) => ({ value: t.id, label: t.label }))}
        value={selected}
        onChange={onChange}
        max={maxSelectable}
        maxReachedLabel={`Maksimal ${maxSelectable} topic tercapai.`}
        placeholder={capped ? `Pilih topic (maks. ${maxSelectable})` : 'Pilih topic'}
        searchPlaceholder="Cari topic…"
        emptyLabel="Topic tidak ditemukan."
        aria-label={label}
        invalid={!!error}
      />
      {error && <p className="text-xs text-red-500 m-0" role="alert">{error}</p>}
    </div>
  );
};

export default TopicsSelect;
