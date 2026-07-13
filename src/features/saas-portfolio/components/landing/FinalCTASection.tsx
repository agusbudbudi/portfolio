import React from 'react';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTASection: React.FC = () => {
  return (
    <section className="py-8 md:py-20 bg-ld-cloud font-ld-sans">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-ld-midnight px-8 py-10 text-center">
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ld-lilac" />
              Gratis Selamanya
            </div>

            <h2 className="font-ld-display font-semibold text-2xl sm:text-4xl lg:text-5xl text-white tracking-[-0.025em] leading-[1.02] mb-4 whitespace-nowrap">
              Siap Punya Portfolio QA Sendiri?
            </h2>
            <p className="text-ld-fog text-base sm:text-lg mb-8 leading-relaxed max-w-lg mx-auto">
              Login dengan Google dan mulai bangun portfolio yang menunjukkan kemampuanmu sebagai QA Engineer.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
              >
                Buat Portfolio Gratis
                <ArrowRight size={18} />
              </Link>
              <a
                href="#faq"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 text-white font-medium rounded-lg no-underline hover:bg-white/5 transition-colors text-sm"
              >
                <HelpCircle size={18} />
                Lihat FAQ
              </a>
            </div>

            <p className="text-ld-fog text-xs mt-8">
              Gratis Selamanya · Login Google · Custom URL
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
