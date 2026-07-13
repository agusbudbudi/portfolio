import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Berapa lama durasi satu sesi mentoring?',
    a: 'Setiap sesi berlangsung selama 60 menit. Waktu ini mencakup diskusi topik, tanya jawab, dan review kode/test case jika diperlukan.',
  },
  {
    q: 'Apakah mentoring ini berbayar?',
    a: 'Ya, berbayar. Single session Rp99.000 (promo dari Rp150.000) dan paket 3 sesi Rp400.000 — lihat detail lengkap di bagian Harga Mentoring. Konfirmasi pembayaran dilakukan via WhatsApp setelah booking.',
  },
  {
    q: 'Platform apa yang digunakan untuk sesi?',
    a: 'Sesi mentoring dilakukan via video call (Google Meet atau platform lain sesuai kesepakatan). Koordinasi booking dan konfirmasi jadwal dilakukan via WhatsApp.',
  },
  {
    q: 'Bisakah saya memilih lebih dari satu topik?',
    a: 'Ya, kamu bisa memilih hingga 2-3 topik dalam satu sesi. Namun, disarankan untuk fokus pada 1-2 topik agar sesi lebih efektif dan mendalam.',
  },
  {
    q: 'Bagaimana jika saya perlu reschedule?',
    a: 'Reschedule bisa dilakukan dengan menghubungi mentor langsung via WhatsApp minimal 24 jam sebelum sesi dijadwalkan. Mentor akan membantu mencari waktu pengganti yang sesuai.',
  },
  {
    q: 'Apakah ada persiapan yang perlu saya lakukan?',
    a: 'Disarankan untuk menyiapkan pertanyaan spesifik atau kasus nyata yang ingin didiskusikan. Semakin spesifik pertanyaanmu, semakin efektif sesinya. Untuk topik coding, siapkan environment lokal yang sudah terinstall.',
  },
];

const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Ada yang masih belum jelas? Temukan jawabannya di sini atau hubungi mentor langsung.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div key={idx} className="rounded-xl border border-ld-ash overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-ld-canvas hover:bg-ld-cloud transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-ld-graphite leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`flex-shrink-0 text-ld-fog transition-transform duration-300 ${isOpen ? 'rotate-180 text-ld-violet' : ''}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-5 pb-5 bg-ld-canvas border-t border-ld-ash">
                        <p className="text-sm text-ld-slate leading-relaxed pt-4">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
