import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { AlertTriangle, Archive, Copy, Info, Trash2, X, type LucideIcon } from 'lucide-react';
import { useConfirmStore, type ConfirmOptions } from '../../../../store/useConfirmStore';
import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { useIsMobileSheet } from '../../../../hooks/useMediaQuery';

// Global confirm dialog for the dashboard (mounted once in AdminPage, opened
// via useConfirmStore().open). Brand styling: Onyx scrim, white 12px panel,
// Graphite title, Slate body, buttons as in the admin forms. Below sm it is
// a bottom sheet (slides up, drag down to dismiss). Esc / backdrop /
// Batal cancel; focus is trapped while open and returns afterwards.

type Variant = NonNullable<ConfirmOptions['variant']>;

const VARIANT: Record<Variant, { icon: LucideIcon; tile: string; button: string }> = {
  danger: { icon: Trash2, tile: 'bg-red-50 text-red-600', button: 'bg-red-600 hover:bg-red-700 text-white' },
  warning: { icon: AlertTriangle, tile: 'bg-amber-50 text-amber-600', button: 'bg-ld-graphite hover:bg-ld-midnight text-white' },
  info: { icon: Info, tile: 'bg-ld-lilac text-ld-violet', button: 'bg-ld-violet hover:bg-[#1f87e6] text-white' },
};

/** Optional icon override by name, so callers can match the action (archive, duplicate). */
const ICONS: Record<NonNullable<ConfirmOptions['icon']>, LucideIcon> = { delete: Trash2, archive: Archive, duplicate: Copy, alert: AlertTriangle, info: Info };

const Panel: React.FC<{ options: ConfirmOptions; onClose: () => void }> = ({ options, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const trapRef = useFocusTrap<HTMLDivElement>();
  const sheet = useIsMobileSheet();
  const dragControls = useDragControls();
  const v = VARIANT[options.variant ?? 'danger'];
  const Icon = options.icon ? ICONS[options.icon] : v.icon;
  const reasonMode = options.mode === 'reason';
  const canConfirm = !loading && (!reasonMode || reason.trim().length > 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [loading, onClose]);

  const confirm = async () => {
    setLoading(true);
    try {
      if (options.mode === 'reason') await options.onConfirm(reason.trim());
      else await options.onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex items-end sm:items-center justify-center sm:p-4 bg-ld-onyx/50 backdrop-blur-sm font-ld-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <motion.div
        ref={trapRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.description ? 'confirm-desc' : undefined}
        className="relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-xl border-t sm:border border-ld-frost/70 shadow-[0_-8px_32px_rgba(39,40,53,0.14)] sm:shadow-[0_24px_64px_rgba(39,40,53,0.18)] outline-none"
        initial={sheet ? { y: '100%' } : { opacity: 0, y: 12, scale: 0.97 }}
        animate={sheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={sheet ? { y: '100%' } : { opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        // Bottom sheet: drag the handle down to dismiss (not the content, so scroll and text fields work).
        dragControls={dragControls}
        dragListener={false}
        drag={sheet && !loading ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 600) onClose(); }}
      >
        <div
          aria-hidden="true"
          onPointerDown={(e) => dragControls.start(e)}
          className="sm:hidden flex justify-center pt-2.5 pb-1.5 cursor-grab active:cursor-grabbing touch-none"
        >
          <span className="w-10 h-1 rounded-full bg-ld-ash" />
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-ld-fog hover:text-ld-graphite hover:bg-ld-cloud bg-transparent border-none cursor-pointer transition-colors disabled:opacity-40"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4 px-6 pt-4 sm:pt-6 pb-5">
          <span className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${v.tile}`} aria-hidden="true">
            <Icon size={19} />
          </span>
          <div className="min-w-0 flex-1 pr-6">
            <h2 id="confirm-title" className="m-0 text-base font-semibold text-ld-onyx leading-snug">{options.title}</h2>
            {options.description && (
              <p id="confirm-desc" className="m-0 mt-1.5 text-sm text-ld-slate leading-relaxed">{options.description}</p>
            )}
            {reasonMode && (
              <label className="block mt-4">
                <span className="block text-xs font-medium text-ld-graphite mb-1.5">
                  {options.reasonLabel ?? 'Alasan'}<span className="text-red-500 ml-0.5">*</span>
                </span>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={options.reasonPlaceholder ?? 'Tuliskan alasannya di sini…'}
                  rows={3}
                  disabled={loading}
                  autoFocus
                  className="w-full resize-none rounded-lg border border-ld-frost px-3.5 py-2.5 text-sm text-ld-onyx placeholder:text-ld-fog bg-white focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac disabled:opacity-60"
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 px-6 pt-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:pb-4 border-t border-ld-frost bg-ld-cloud/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            autoFocus={!reasonMode}
            className="inline-flex items-center justify-center min-h-11 max-sm:min-h-12 px-5 rounded-lg border border-ld-frost bg-white text-sm max-sm:text-[15px] font-medium text-ld-graphite hover:bg-ld-cloud cursor-pointer transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ld-violet"
          >
            {options.cancelLabel ?? 'Batal'}
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!canConfirm}
            className={`inline-flex items-center justify-center gap-1.5 min-h-11 max-sm:min-h-12 px-5 rounded-lg text-sm max-sm:text-[15px] font-medium border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ld-violet ${v.button}`}
          >
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden="true" />}
            {loading ? 'Memproses…' : options.confirmLabel ?? 'Konfirmasi'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ConfirmationDialog: React.FC = () => {
  const { options, close } = useConfirmStore();
  return (
    <AnimatePresence>
      {options && <Panel key={options.title} options={options} onClose={close} />}
    </AnimatePresence>
  );
};
