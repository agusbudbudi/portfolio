import React from 'react';
import FaqAccordion from '../../../../components/common/FaqAccordion';

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

        <FaqAccordion items={faqs} />
      </div>
    </section>
  );
};

export default FAQSection;
