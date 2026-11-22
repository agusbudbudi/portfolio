import type { FaqItem } from '../../../../components/common/FaqAccordion';

export const COURSE_PATH = '/courses';

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Apakah QA Course gratis?',
    a: 'Ya. Semua materi dan misi praktik di QA Course gratis. Kamu hanya perlu login dengan akun Google supaya progress tersimpan.',
  },
  {
    q: 'Saya belum pernah belajar QA sama sekali. Bisa ikut?',
    a: 'Bisa. Course Junior QA Ready dirancang untuk pemula, career switcher, dan fresh graduate. Materinya dimulai dari cara membaca PRD, lalu test design, sampai menulis bug report.',
  },
  {
    q: 'Apa bedanya QA Course dengan QA Simulator?',
    a: 'QA Simulator untuk yang sudah punya dasar teori dan ingin langsung praktik. QA Course menyusun materi dan misi simulator secara berurutan: baca materinya dulu, lalu praktik. Misi di QA Course memakai QA Simulator, jadi progress-nya tercatat di keduanya.',
  },
  {
    q: 'Apakah harus login?',
    a: 'Lesson pertama setiap course bisa dibaca tanpa login. Untuk lanjut ke lesson berikutnya dan mengerjakan misi praktik, kamu perlu login supaya progress tersimpan dan bisa dilanjutkan dari perangkat mana pun.',
  },
  {
    q: 'Berapa lama menyelesaikan satu course?',
    a: 'Setiap artikel bisa dibaca dalam 5 sampai 10 menit. Misi praktik di QA Simulator butuh waktu lebih lama. Estimasi total jam tertulis di setiap course, dan kamu bisa belajar dengan kecepatanmu sendiri.',
  },
  {
    q: 'Apakah saya mendapat sertifikat?',
    a: 'QA Course tidak memberi sertifikat. Sebagai gantinya, kamu lulus dengan portfolio studi kasus berisi test case, bug report, dan rekomendasi rilis yang kamu kerjakan sendiri. Portfolio ini bisa dibagikan lewat link publik atau diunduh sebagai PDF.',
  },
  {
    q: 'Bisa belajar dari HP?',
    a: 'Bisa. Semua artikel nyaman dibaca di HP. Untuk misi praktik, layar laptop lebih nyaman karena ada PRD dan aplikasi staging yang perlu dibuka berdampingan.',
  },
];

// Planned courses (PRD roadmap, phase 3): shown after the live ones on the
// /courses list and in the header Courses drawer. A placeholder hides itself
// once a real course with its slug ships.
export const COMING_SOON = [
  {
    slug: 'api-dan-regression',
    level: 'Menengah',
    title: 'API & Regression',
    description: 'Untuk manual QA yang ingin naik level: uji API langsung dan jalankan regression di skenario fintech.',
  },
  {
    slug: 'persiapan-interview',
    level: 'Semua level',
    title: 'Persiapan Interview',
    description: 'Latihan studi kasus interview QA dan portfolio yang siap dibagikan ke recruiter.',
  },
];
