import React from 'react';
import { MessageSquare } from 'lucide-react';

interface IntroFieldProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  minLength?: number;
  maxLength?: number;
}

const IntroField: React.FC<IntroFieldProps> = ({ value, onChange, error, maxLength = 2000 }) => {
  const charCount = value.trim().length;
  const counterColor = charCount > maxLength ? 'text-red-500' : charCount >= maxLength * 0.9 ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="booking-intro" className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <MessageSquare size={15} className="text-accent flex-shrink-0" />
        Jelaskan Materi &amp; Pendekatan Diskusi <span className="text-red-500 ml-0.5">*</span>
      </label>

      <textarea
        id="booking-intro"
        name="booking-intro"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={7}
        maxLength={maxLength + 100}
        aria-describedby={error ? 'intro-error' : 'intro-helper'}
        aria-invalid={!!error}
        aria-required="true"
        placeholder={`Jelaskan materi spesifik yang ingin dibahas, pertanyaan yang ingin dijawab, dan pendekatan mentoring apa yang Anda harapkan.\n\nContoh:\n'Saya ingin belajar tentang page object model di Cypress...'`}
        className={`w-full p-3.5 text-sm rounded-xl border outline-none resize-y leading-relaxed transition-all duration-150 min-h-[140px] bg-white dark:bg-slate-800/40 text-slate-900 dark:text-white focus:border-accent focus:ring-2 focus:ring-accent/15 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 dark:border-slate-800'
          }`}
        style={{ fontFamily: 'inherit' }}
      />

      <div className="flex justify-end -mt-0.5">
        <span id="intro-helper" className={`text-[11px] font-medium ${counterColor}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      {error && <p id="intro-error" className="text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
};

export default IntroField;
