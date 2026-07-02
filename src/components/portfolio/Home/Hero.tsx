import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[calc(100vh-70px)] flex items-center py-16 sm:py-12 bg-white dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Background grid + glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,144,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,144,255,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px]" />
      </div>
      <div className="relative max-w-[1200px] mx-auto px-4 w-full">
        {/* Desktop: 2-col (text | card), Mobile: 1-col (card on top, text below) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-24">
          {/* Text Content — order-2 on mobile (card shows first), order-1 on desktop */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-blue-500/20 text-blue-500 dark:text-blue-400 rounded-full text-sm font-semibold mb-6 w-fit bg-blue-500/5 dark:bg-blue-500/10">
              <span className="w-2 h-2 bg-emerald-500 rounded-full relative inline-block after:content-[''] after:absolute after:inset-0 after:bg-emerald-500 after:rounded-full after:animate-pulse-green"></span>
              Available for new opportunities
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">Hi, I'm Agus 👋🏻</h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-blue-500 dark:text-blue-400 mb-4">Quality Assurance Engineer</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-[600px] mb-8 leading-relaxed">
              With 6+ years experience in automation & manual testing.
              Delivering high-quality software through meticulous analysis and modern testing frameworks.
            </p>

            <div className="flex gap-2.5 flex-wrap mb-10 justify-center lg:justify-start">
              <Badge>Manual Testing</Badge>
              <Badge>Automation</Badge>
              <Badge>API Testing</Badge>
              <Badge>Cypress</Badge>
              <Badge>Appium</Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <Button to="/portfolio/projects" variant="primary" className="w-full sm:w-auto">
                Lihat Portfolio <ArrowRight size={20} />
              </Button>
              <Button href="#contact" variant="secondary" className="w-full sm:w-auto">
                Hubungi Saya <Mail size={20} />
              </Button>
            </div>
          </div>

          {/* Card — perspective wrapper matches legacy .hero-visual */}
          <div
            className="flex justify-center order-1 lg:order-2"
            style={{ perspective: '2000px' }}
          >
            {/* id-card-wrapper: matches legacy size, transform & transition exactly */}
            <div
              className="cursor-pointer preserve-3d group"
              style={{
                width: '320px',
                height: '460px',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(-15deg) rotateX(10deg)',
                transition: 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'rotateY(0deg) rotateX(0deg)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'rotateY(-15deg) rotateX(10deg)';
              }}
            >
              {/* id-card: rich soft/inset shadows match legacy exactly */}
              <div
                className="w-full h-full rounded-[24px] flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 shadow-[0_25px_50px_-12px_rgba(37,144,255,0.2),_inset_0_0_15px_2px_rgba(255,255,255,0.4)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3),_inset_0_0_15px_2px_rgba(255,255,255,0.15)]"
              >
                {/* id-card-shine: blur(50px) matches legacy */}
                <div
                  className="absolute inset-0 pointer-events-none z-[5]"
                  style={{
                    background: 'linear-gradient(225deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.45) 30%, rgba(255, 255, 255, 0) 60%, rgba(255, 255, 255, 0) 70%)',
                    backgroundSize: '300% 300%',
                    animation: 'holographic 8s ease-in-out infinite',
                    filter: 'blur(50px)',
                  }}
                />

                {/* id-card-top */}
                <div className="bg-gradient-to-br from-blue-500 to-sky-400 p-8 pb-0 flex flex-col justify-center flex-shrink-0">
                  {/* id-card-header */}
                  <div className="flex justify-between items-start">
                    <img src="/img/diricare-logo.webp" alt="Diricare" width={45} height={45} loading="eager" decoding="async" className="h-[45px] max-w-[120px] object-contain rounded-[10px]" />
                    <img src="/img/qr-code.webp" alt="QR Code" width={45} height={45} loading="eager" decoding="async" className="w-[45px] h-[45px] bg-white rounded-[10px] object-contain" />
                  </div>
                  {/* id-card-photo: exact 230×230 from legacy with no shadow */}
                  <div className="w-[230px] h-[230px] rounded-xl overflow-hidden self-center">
                    <img src="/img/profile/hero-agus.webp" alt="Agus Budiman" width={230} height={230} loading="eager" fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* id-card-bottom: exact padding and font from legacy */}
                <div className="p-8 bg-white dark:bg-slate-900 flex flex-col gap-1 flex-grow">
                  <div className="flex flex-col gap-1 text-left">
                    {/* font-size: 2rem font-weight: 800 matches legacy id-card-name */}
                    <h3 style={{ fontSize: '2rem', fontWeight: 800 }} className="text-slate-900 dark:text-white m-0 leading-tight">Agus Budiman</h3>
                    {/* font-size: 0.8rem font-weight: 500 uppercase matches legacy id-card-role */}
                    <p style={{ fontSize: '0.8rem', fontWeight: 500 }} className="text-slate-500 dark:text-slate-400 uppercase tracking-wider opacity-80 m-0">Professional QA Engineer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
