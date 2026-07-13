import React from 'react';

// Shared label+input+error wrapper for admin forms. Handles the required
// asterisk and inline error message consistently so new forms don't
// reinvent this each time — see PortfolioForm.tsx / ArticleListEditor.tsx
// for usage.
interface FormFieldProps {
  label: React.ReactNode;
  required?: boolean;
  error?: string | null;
  hint?: React.ReactNode;
  compact?: boolean; // smaller text for fields nested inside list-editor rows
  className?: string;
  children: React.ReactNode;
}

export const RequiredMark: React.FC = () => <span className="text-red-500 ml-0.5">*</span>;

const FormField: React.FC<FormFieldProps> = ({ label, required, error, hint, compact, className, children }) => (
  <label className={`block ${className ?? ''}`} data-field-error={error ? 'true' : undefined}>
    <span className={`block font-medium text-ld-graphite ${compact ? 'text-[11px] mb-1' : 'text-xs mb-1.5'}`}>
      {label}
      {required && <RequiredMark />}
    </span>
    {children}
    {hint}
    {error && (
      <p className={`text-red-500 m-0 mt-1.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>{error}</p>
    )}
  </label>
);

export default FormField;
