import React from 'react';
import { Check } from 'lucide-react';

// Brand checkbox: a real <input type="checkbox"> (keyboard, forms, screen
// readers) visually hidden behind a custom box. Sky Blue fill + white tick
// when checked, the tick draws in; focus ring on keyboard focus only.
//
//   <Checkbox checked={ok} onChange={setOk}>Saya setuju</Checkbox>
//   <Checkbox checked={ok} onChange={setOk} description="Bisa diubah nanti." boxed>…</Checkbox>

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The label, clickable. */
  children: React.ReactNode;
  /** Muted second line under the label. */
  description?: React.ReactNode;
  disabled?: boolean;
  /** Soft Cloud panel around the whole row (e.g. consent on a form step). */
  boxed?: boolean;
  size?: 'sm' | 'md';
  /** Vertical alignment of the box against a multi-line label. */
  align?: 'start' | 'center';
  /** Replaces the default label text style (size/colour/layout). */
  labelClassName?: string;
  className?: string;
  name?: string;
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked, onChange, children, description, disabled, boxed, size = 'md', align = 'start', labelClassName, className = '', name, id,
}) => {
  const box = size === 'sm' ? 'w-4 h-4 rounded-[5px]' : 'w-5 h-5 rounded-md';
  return (
    <label
      className={`group flex ${align === 'center' ? 'items-center' : 'items-start'} gap-2.5 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
        boxed ? `px-3.5 py-3 rounded-lg border transition-colors ${checked ? 'bg-ld-lilac border-ld-lavender' : 'bg-ld-cloud border-transparent'}` : ''
      } ${className}`}
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`${box} ${align === 'center' ? '' : 'mt-px'} shrink-0 flex items-center justify-center border-2 transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none
          peer-focus-visible:ring-2 peer-focus-visible:ring-ld-lavender peer-focus-visible:ring-offset-1
          ${checked ? 'bg-ld-violet border-ld-violet' : `bg-white border-ld-ash ${disabled ? '' : 'group-hover:border-ld-violet'}`}`}
      >
        <Check
          size={size === 'sm' ? 11 : 13}
          strokeWidth={3.5}
          className={`text-white transition-[opacity,transform] duration-150 motion-reduce:transition-none ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className={labelClassName ?? `block leading-relaxed text-ld-graphite ${size === 'sm' ? 'text-[13px]' : 'text-[13px] sm:text-sm'}`}>{children}</span>
        {description && <span className="block mt-0.5 text-xs text-ld-steel">{description}</span>}
      </span>
    </label>
  );
};

export default Checkbox;
