import React from "react";
import { Download, Linkedin } from "lucide-react";

const CtaSection: React.FC = () => {
  return (
    <section className="relative bg-ld-violet py-12 md:py-20 overflow-hidden text-white">
      {/* Background glow radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none z-0"></div>

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex flex-col items-center gap-4">
            <h2 className="font-ld-display font-semibold text-3xl sm:text-4xl lg:text-[2.8rem] text-white m-0 tracking-[-0.02em] leading-tight">Let's Work Together 🚀</h2>
          </div>
          <p className="text-base sm:text-lg text-white/90 max-w-[800px] m-0 leading-relaxed">
            I'm always open to discussing new projects, creative ideas or
            opportunities to be part of your visions. Let's build something
            exceptional together.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6 w-full sm:w-auto">
            <a
              href="/assets/CV_Agus_Budiman_QA_Engineer.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-ld-violet rounded-lg font-medium text-sm no-underline transition-colors hover:bg-white/90 w-full sm:w-auto"
            >
              <Download size={20} /> Download CV
            </a>
            <a
              href="https://linkedin.com/in/agus-budiman"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-medium text-sm no-underline transition-colors hover:bg-white/20 backdrop-blur-md w-full sm:w-auto"
            >
              <Linkedin size={20} /> LinkedIn Connect
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
