// Mentoring price list — single source for the /mentoring PricingSection and
// the home page pricing section. Update prices here only.
export interface MentoringPlan {
  name: string;
  originalPrice?: string;
  price: string;
  unit: string;
  promoLabel?: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}

export const MENTORING_PLANS: MentoringPlan[] = [
  {
    name: 'Single Session',
    originalPrice: 'Rp150.000',
    price: 'Rp99.000',
    unit: '/ sesi',
    promoLabel: 'Promo 34%',
    description: 'Cocok buat coba dulu atau bahas 1 topik spesifik.',
    features: [
      '1x sesi 60 menit',
      '1-on-1 dengan mentor',
      'Pilih 1-2 topik per sesi',
      'Konfirmasi via WhatsApp',
    ],
    highlighted: false,
    cta: 'Booking Single Session',
  },
  {
    name: 'Paket 3 Sesi',
    price: 'Rp400.000',
    unit: '/ paket',
    description: 'Hemat buat progres belajar berkelanjutan.',
    features: [
      '3x sesi 60 menit',
      '1-on-1 dengan mentor',
      'Prioritas pilih jadwal',
      'Bebas ganti topik tiap sesi',
      'Konfirmasi via WhatsApp',
    ],
    highlighted: true,
    cta: 'Booking Paket 3 Sesi',
  },
  {
    name: 'Interview Preparation',
    price: 'Rp150.000',
    unit: '/ sesi',
    description: 'Fokus persiapan interview: mock interview & review CV/portfolio QA.',
    features: [
      '1x sesi 60 menit',
      '1-on-1 dengan mentor',
      'Mock interview teknikal QA',
      'Review CV & portfolio',
      'Konfirmasi via WhatsApp',
    ],
    highlighted: false,
    cta: 'Booking Interview Prep',
  },
];
