import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromotionSection: React.FC = () => {
  return (
    <section className="relative bg-ld-violet font-ld-sans overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-2 items-center min-h-[440px] lg:min-h-[520px]">
        <div className="relative z-10 px-6 sm:px-10 lg:px-16 py-8 lg:py-0">

          <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl lg:text-[42px] text-white tracking-[-0.02em] leading-[1.1] mb-4 max-w-lg">
            Diskon 34% untuk Single Session Pertamamu
          </h2>

          <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
            Booking sekarang dan mulai transformasi karier QA-mu bersama mentor berpengalaman. Kuota promo terbatas tiap bulan.
          </p>

          <Link
            to="/mentoring/booking"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-ld-violet font-medium rounded-lg no-underline hover:bg-ld-lilac transition-colors text-sm w-fit"
          >
            Klaim Promo Sekarang
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="relative h-80 sm:h-80 lg:h-full order-first lg:order-last">
          <img
            src="/admin/img/image-promotion.webp"
            alt="Promo mentoring QA"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-ld-violet/20 via-transparent to-transparent" />
          <div className="absolute inset-0 lg:hidden bg-gradient-to-t from-ld-violet/25 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default PromotionSection;
