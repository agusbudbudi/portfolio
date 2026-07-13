import React from 'react';
import { useSnackbarStore } from '../../../../store/useSnackbarStore';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Snackbar: React.FC = () => {
  const { toasts, dismiss } = useSnackbarStore();

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes snackbarSlideDown {
          from {
            opacity: 0;
            transform: translate3d(0, -24px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-snackbar-in {
          animation: snackbarSlideDown 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }
      ` }} />
      {toasts.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 max-w-xs w-[calc(100%-2rem)] pointer-events-none">
          {toasts.map((toast) => {
            let Icon = Info;
            let variantClasses = '';
            let iconColorClass = '';

            switch (toast.variant) {
              case 'success':
                Icon = CheckCircle2;
                variantClasses = 'bg-white border-green-500 shadow-[0_4px_20px_rgba(34,197,94,0.12)]';
                iconColorClass = 'text-green-500';
                break;
              case 'error':
                Icon = XCircle;
                variantClasses = 'bg-white border-red-500 shadow-[0_4px_20px_rgba(239,68,68,0.12)]';
                iconColorClass = 'text-red-500';
                break;
              case 'warning':
                Icon = AlertTriangle;
                variantClasses = 'bg-white border-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.12)]';
                iconColorClass = 'text-amber-500';
                break;
              case 'info':
                Icon = Info;
                variantClasses = 'bg-white border-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.12)]';
                iconColorClass = 'text-blue-500';
                break;
            }

            return (
              <div
                key={toast.id}
                className={`pointer-events-auto flex items-start gap-3 py-2.5 px-4 rounded-lg border-1 bg-white animate-snackbar-in ${variantClasses}`}
                role="alert"
              >
                <Icon size={18} className={`shrink-0 mt-0.5 ${iconColorClass}`} />

                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm font-medium text-ld-onyx leading-snug">{toast.message}</p>
                </div>

                <button
                  onClick={() => dismiss(toast.id)}
                  className="p-1 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud shrink-0 transition-colors cursor-pointer border-none bg-transparent"
                  aria-label="Tutup"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
