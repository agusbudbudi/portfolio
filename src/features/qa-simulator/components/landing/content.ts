// Static marketing copy for /qa-simulator. Kept out of the fetched JSON on
// purpose: everything here renders on first paint (no network dependency), so
// crawlers see the full page text, and FAQ_ITEMS also feeds the FAQPage JSON-LD.

export const SIM_PATH = '/qa-simulator';
export const FEATURED_PROJECT_PATH = '/qa-simulator/splitbill';

export const FAQ_ITEMS = [
  {
    q: 'Apa itu QA Simulator?',
    a: 'QA Simulator adalah simulasi kerja QA Engineer berbasis project. Kamu masuk ke satu sprint fiktif di produk nyata, membaca PRD, berdiskusi dengan PM, menulis test case, mencari bug di aplikasi staging, sampai memberi rekomendasi rilis Go / No-Go.',
  },
  {
    q: 'Apakah QA Simulator gratis?',
    a: 'Ya, gratis. Phase 1 (Requirement Analysis) bisa langsung dicoba tanpa login. Untuk lanjut ke phase berikutnya dan menyimpan progress, cukup login dengan akun Google, juga gratis.',
  },
  {
    q: 'Saya belum pernah kerja sebagai QA. Apakah cocok?',
    a: 'Cocok. Project pertama berlevel pemula dan setiap phase diawali materi singkat: cara membaca PRD, boundary value analysis, cara menulis bug report yang baik, dan lainnya. Simulasi ini memang dibuat untuk fresh graduate, career switcher, dan peserta bootcamp yang butuh pengalaman praktik.',
  },
  {
    q: 'Berapa lama waktu yang dibutuhkan?',
    a: 'Project SplitBill (pemula) butuh sekitar 4 jam, project DompetKu (menengah) sekitar 6 jam. Kamu tidak harus menyelesaikannya sekaligus. Progress tersimpan otomatis, jadi bisa dilanjutkan kapan saja.',
  },
  {
    q: 'Apakah ada kunci jawaban atau feedback?',
    a: 'Ada. Setelah submit setiap tugas, kamu bisa membandingkan jawabanmu dengan kunci jawaban dari QA Lead dan menilai diri sendiri dengan rubrik yang sama seperti yang dipakai saat review di kantor.',
  },
  {
    q: 'Apakah saya dapat portfolio setelah menyelesaikan simulasi?',
    a: 'Ya. Setelah semua phase selesai, hasil kerjamu (pertanyaan klarifikasi, test case, bug report, dan test summary) otomatis tersusun jadi portfolio studi kasus QA lengkap dengan skor per phase. Portfolio ini bisa di-download sebagai PDF untuk dilampirkan di lamaran dan jadi bahan cerita saat interview.',
  },
  {
    q: 'Apakah perlu skill coding?',
    a: 'Tidak. Project SplitBill fokus pada manual testing: requirement analysis, test design, eksekusi, dan bug reporting. Project DompetKu menambah test plan, API testing lewat API Console di browser (tanpa install Postman), dan regression testing. Semuanya tanpa coding.',
  },
];
