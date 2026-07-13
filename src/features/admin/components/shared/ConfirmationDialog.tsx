import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useConfirmStore } from '../../../../store/useConfirmStore';

export const ConfirmationDialog: React.FC = () => {
  const { options, close } = useConfirmStore();
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset reason on new dialog
  useEffect(() => {
    if (options) {
      setReason('');
    }
  }, [options]);

  if (!options) return null;

  const variant = options.variant ?? 'danger';

  const iconConfig = {
    danger: { Icon: AlertTriangle, iconBg: 'bg-red-50', iconColor: 'text-red-500', btnClass: 'bg-red-500 hover:bg-red-600 text-white' },
    warning: { Icon: AlertTriangle, iconBg: 'bg-amber-50', iconColor: 'text-amber-500', btnClass: 'bg-amber-500 hover:bg-amber-600 text-white' },
    info: { Icon: Info, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', btnClass: 'bg-ld-violet hover:bg-[#1f87e6] text-white' },
  }[variant];

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (options.mode === 'reason') {
        await options.onConfirm(reason.trim());
      } else {
        await options.onConfirm();
      }
      close();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = () => {
    if (!isLoading) close();
  };

  const isReasonMode = options.mode === 'reason';
  const canConfirm = !isLoading && (!isReasonMode || reason.trim().length > 0);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dialogBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dialogPanelIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dialog-backdrop { animation: dialogBackdropIn 0.2s ease forwards; }
        .dialog-panel { animation: dialogPanelIn 0.25s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
      ` }} />

      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 dialog-backdrop"
        style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(2px)' }}
        onClick={handleBackdropClick}
      >
        <div
          className="dialog-panel relative w-full max-w-sm bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {!isLoading && (
            <button
              onClick={close}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer transition-colors"
              aria-label="Tutup"
            >
              <X size={15} />
            </button>
          )}

          <div className="p-6">
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl ${iconConfig.iconBg} flex items-center justify-center mb-4`}>
              <iconConfig.Icon size={20} className={iconConfig.iconColor} />
            </div>

            {/* Title */}
            <h2 className="m-0 mb-1.5 text-base font-bold text-ld-onyx leading-snug">{options.title}</h2>

            {/* Description */}
            {options.description && (
              <p className="m-0 text-sm text-ld-fog leading-relaxed">{options.description}</p>
            )}

            {/* Reason input */}
            {isReasonMode && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-ld-graphite mb-1.5">
                  {options.reasonLabel ?? 'Alasan'}
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={options.reasonPlaceholder ?? 'Tuliskan alasannya di sini…'}
                  rows={3}
                  disabled={isLoading}
                  className="w-full resize-none rounded-lg border border-ld-frost px-3 py-2.5 text-sm text-ld-onyx placeholder:text-ld-fog focus:outline-none focus:ring-2 focus:ring-ld-violet/30 focus:border-ld-violet transition-colors disabled:opacity-60 bg-white"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 px-6 pb-5">
            <button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className={`w-full py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${iconConfig.btnClass}`}
            >
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Memproses…
                </span>
              ) : (options.confirmLabel ?? 'Konfirmasi')}
            </button>
            <button
              onClick={close}
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg border border-ld-frost bg-white text-sm font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer transition-colors disabled:opacity-60"
            >
              {options.cancelLabel ?? 'Batal'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
