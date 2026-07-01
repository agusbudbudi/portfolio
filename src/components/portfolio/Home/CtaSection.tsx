import React from "react";
import { Download, Linkedin } from "lucide-react";
import Button from "../common/Button";

const CtaSection: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-500 to-blue-700 pt-16 pb-0 overflow-hidden text-white">
      {/* Background glow radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none z-0"></div>

      <div className="max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-5 pb-16 text-center">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold text-white m-0 tracking-tight leading-tight">Let's Work Together 🚀</h2>
          </div>
          <p className="text-base sm:text-lg text-white/90 max-w-[800px] m-0 leading-relaxed">
            I'm always open to discussing new projects, creative ideas or
            opportunities to be part of your visions. Let's build something
            exceptional together.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-6 w-full sm:w-auto">
            <Button
              href="/assets/CV_Agus_Budiman_QA_Engineer.pdf"
              variant="secondary"
              target="_blank"
              className="!bg-white !text-blue-500 !border-transparent hover:!bg-white/90 hover:shadow-lg w-full sm:w-auto"
            >
              <Download size={20} /> Download CV
            </Button>
            <Button
              href="https://linkedin.com/in/agus-budiman"
              variant="primary"
              target="_blank"
              className="!bg-white/10 !border-white/30 !text-white hover:!bg-white/20 hover:shadow-lg backdrop-blur-md w-full sm:w-auto"
            >
              <Linkedin size={20} /> LinkedIn Connect
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
