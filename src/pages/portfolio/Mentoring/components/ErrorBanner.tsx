// ErrorBanner – form error validation summary using Tailwind CSS (light & dark mode support)
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorBannerProps {
  errors: string[];
  onDismiss: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ errors, onDismiss }) => {
  if (errors.length === 0) return null;
  return (
    <div
      className="p-3 rounded-sm border-l-4 bg-red-50/50 border-ld-ash border-l-red-500"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={17} />
          <span className="text-sm font-medium">Harap lengkapi form berikut</span>
        </div>
        <button
          id="error-banner-dismiss-btn"
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="cursor-pointer text-ld-fog hover:text-red-500 transition-colors duration-150 flex"
        >
          <X size={16} />
        </button>
      </div>
      <ul className="space-y-1">
        {errors.map((err, i) => (
          <li key={i} className="text-xs text-red-500 pl-3.5 relative">
            <span className="absolute left-0">•</span>{err}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ErrorBanner;
