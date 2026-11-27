// Testimonials on /career-path.
//
// SAMPLES are made up, only there to design the layout: they show on the dev
// server (labelled "Contoh") and are left out of production builds entirely.
// Add real quotes, with the person's permission to publish, to REAL; the
// section then appears in production on its own.

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  sample?: boolean;
}

const REAL: Testimonial[] = [];

const SAMPLES: Testimonial[] = import.meta.env.DEV ? [
  {
    name: 'Dina', role: 'Career switcher', sample: true,
    quote: 'Awalnya bingung mulai dari mana. Learning path-nya bikin saya tahu harus belajar apa dulu, lalu langsung praktik.',
  },
  {
    name: 'Raka', role: 'Junior QA', sample: true,
    quote: 'Latihan di simulator terasa seperti kerja beneran. Sekarang lebih pede menulis bug report yang jelas.',
  },
  {
    name: 'Sinta', role: 'QA Engineer', sample: true,
    quote: 'Feedback mentoring bantu saya merapikan portfolio dan menentukan langkah karier berikutnya.',
  },
  {
    name: 'Bayu', role: 'Fresh graduate', sample: true,
    quote: 'Materinya runtut dan langsung bisa dicoba. Saya jadi punya contoh test case sendiri untuk ditunjukkan saat melamar.',
  },
] : [];

export const VISIBLE_TESTIMONIALS: Testimonial[] = REAL.length ? REAL : SAMPLES;
