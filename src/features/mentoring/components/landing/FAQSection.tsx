import React from 'react';
import FaqAccordion from '../../../../components/common/FaqAccordion';

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
  return (
    <section id="faq" className="scroll-mt-16 py-8 md:py-20 bg-ld-canvas font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="font-semibold text-3xl sm:text-4xl tracking-[-0.02em] text-ld-graphite mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-ld-slate max-w-xl mx-auto text-base leading-relaxed">
            Ada yang masih belum jelas? Temukan jawabannya di sini atau hubungi mentor langsung.
          </p>
        </div>

        <FaqAccordion items={faqs} />
      </div>
    </section>
  );
};

export default FAQSection;
