import React from 'react';
import Select from '../../../components/common/Select';
import type { SimulatorField } from '../../../types/qaSimulator';
import { SIM_INPUT } from '../lib/ui';

interface FieldControlProps {
  field: SimulatorField;
  value: string;
  disabled: boolean;
  invalid?: boolean;
  onChange: (value: string) => void;
  inputId: string;
  /** Replaces the default SIM_INPUT look (e.g. the Jira-style bug modal). */
  baseClass?: string;
  /** Classes added when `invalid`; defaults to the red Labs border. */
  invalidClass?: string;
  textareaClass?: string;
}

const FieldControl: React.FC<FieldControlProps> = ({ field, value, disabled, invalid, onChange, inputId, baseClass = SIM_INPUT, invalidClass = 'border-red-400 focus:border-red-400 focus:ring-red-100', textareaClass = 'min-h-[96px]' }) => {
  const cls = `${baseClass} ${invalid ? invalidClass : ''}`;
  if (field.type === 'select') {
    return (
      <Select
        id={inputId}
        className={cls}
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={onChange}
        options={(field.options ?? []).map((opt) => ({ value: opt, label: opt }))}
      />
    );
  }
  if (field.type === 'textarea') {
    return (
      <textarea
        id={inputId}
        className={`${cls} ${textareaClass} resize-y leading-relaxed`}
        value={value}
        placeholder={field.placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      id={inputId}
      type={field.type === 'url' ? 'url' : 'text'}
      className={cls}
      value={value}
      placeholder={field.placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default FieldControl;
