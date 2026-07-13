import React from 'react';
import { X, Wallet, MessageCircle, ShieldCheck } from 'lucide-react';

interface ConfirmationModalProps {
  mentorName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ mentorName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl border border-ld-ash shadow-[var(--shadow-ld-lg)] overflow-hidden font-ld-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ld-frost bg-ld-cloud">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-ld-violet" />
            <h2 id="confirm-title" className="text-sm font-medium text-ld-graphite">Konfirmasi Booking</h2>
          </div>
          <button type="button" onClick={onCancel} className="text-ld-fog hover:text-ld-graphite transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-ld-slate leading-relaxed">
            Kamu selangkah lagi untuk sesi mentoring langsung bersama <strong className="text-ld-graphite">{mentorName}</strong> — mentor yang siap bantu kamu grow lebih cepat di karier QA.
          </p>

          {/* Fee info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <Wallet size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-amber-700">Biaya Sesi: Rp100.000 / sesi</p>
              <p className="text-[11px] text-amber-600 leading-relaxed">
                Pembayaran dilakukan langsung ke rekening mentor sebagai bentuk support nyata atas waktu dan ilmu yang dibagikan.
              </p>
            </div>
          </div>

          {/* WhatsApp info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <MessageCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Setelah klik <strong>Lanjutkan</strong>, WhatsApp akan terbuka dengan pesan yang sudah terisi otomatis. Cukup kirim — mentor akan konfirmasi ketersediaan dan info pembayaran.
            </p>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg border border-ld-ash text-sm font-medium text-ld-slate hover:bg-ld-cloud transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <MessageCircle size={15} />
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
