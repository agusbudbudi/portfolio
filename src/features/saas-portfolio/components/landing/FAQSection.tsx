import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Apakah portfolio ini cocok untuk fresh graduate yang belum punya pengalaman kerja?',
    a: 'Tentu bisa. Portfolio tetap bisa diisi dengan capstone project, automation practice, API testing, atau project bootcamp — recruiter lebih peduli pada bukti kerja nyata daripada status pengalaman.',
  },
  {
    q: 'Apakah benar-benar gratis?',
    a: 'Ya, membuat dan mempublikasikan portfolio QA di Mentor.QA sepenuhnya gratis, tanpa biaya tersembunyi.',
  },
  {
    q: 'Bagaimana kalau saya belum pernah membuat automation?',
    a: 'Tidak masalah. Kamu bisa mulai dari manual testing dan test case yang sudah pernah kamu kerjakan — automation bisa ditambahkan belakangan begitu kamu mulai belajar.',
  },
  {
    q: 'Apakah project dari bootcamp boleh dimasukkan ke portfolio?',
    a: 'Boleh banget. Project bootcamp, capstone, atau latihan pribadi tetap valid ditampilkan, selama menunjukkan proses dan hasil kerjamu sebagai QA.',
  },
  {
    q: 'Perlu skill desain atau coding untuk membuatnya?',
    a: 'Tidak perlu. Kamu cukup mengisi profil, proyek, sertifikasi, dan pengalaman kerja — tampilan portfolio sudah didesain untuk kamu.',
  },
  {
    q: 'Berapa lama waktu yang dibutuhkan untuk membuat portfolio?',
    a: 'Sekitar 5-10 menit kalau data profil, proyek, dan sertifikasimu sudah siap. Kamu juga bisa simpan draft dan lanjutkan kapan saja.',
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
            Masih ada yang mengganjal? Berikut jawaban seputar Portfolio QA di Mentor.QA.
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
