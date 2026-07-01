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
    a: 'Detail biaya akan dikomunikasikan langsung oleh mentor via WhatsApp setelah kamu melakukan booking. Konsultasi awal untuk mendiskusikan kebutuhanmu tidak dipungut biaya.',
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
    <section id="faq" className="py-12 md:py-20 bg-white dark:bg-slate-950">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Ada yang masih belum jelas? Temukan jawabannya di sini atau hubungi mentor langsung.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = open === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-200 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-slate-400 dark:text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
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
                      <div className="px-6 pb-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-4">
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
