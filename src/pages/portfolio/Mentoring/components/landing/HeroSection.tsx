import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type CodeSegment = { text: string; className: string };
type CodeLine = { indent?: boolean; segments: CodeSegment[] };

const codeLines: CodeLine[] = [
  { segments: [{ text: '// QA Mentoring 1-on-1', className: 'text-ld-steel' }] },
  {
    segments: [
      { text: 'const', className: 'text-ld-lavender' },
      { text: ' session ', className: 'text-white' },
      { text: '= {', className: 'text-ld-fog' },
    ],
  },
  {
    indent: true,
    segments: [
      { text: 'mentor', className: 'text-ld-lilac' },
      { text: ': ', className: 'text-ld-fog' },
      { text: '"Agus Budiman"', className: 'text-ld-lavender' },
      { text: ',', className: 'text-ld-fog' },
    ],
  },
  {
    indent: true,
    segments: [
      { text: 'duration', className: 'text-ld-lilac' },
      { text: ': ', className: 'text-ld-fog' },
      { text: '60', className: 'text-ld-lavender' },
      { text: ', ', className: 'text-ld-fog' },
      { text: '// minutes', className: 'text-ld-steel' },
    ],
  },
  {
    indent: true,
    segments: [
      { text: 'topics', className: 'text-ld-lilac' },
      { text: ': ', className: 'text-ld-fog' },
      { text: '"7 tersedia"', className: 'text-ld-lavender' },
      { text: ',', className: 'text-ld-fog' },
    ],
  },
  {
    indent: true,
    segments: [
      { text: 'status', className: 'text-ld-lilac' },
      { text: ': ', className: 'text-ld-fog' },
      { text: '"available"', className: 'text-ld-lavender' },
    ],
  },
  { segments: [{ text: '}', className: 'text-ld-fog' }] },
];

const lineLengths = codeLines.map(line => line.segments.reduce((n, s) => n + s.text.length, 0));
const totalChars = lineLengths.reduce((n, l) => n + l, 0);

function useTypewriter(totalLength: number, speedMs = 55) {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (typed >= totalLength) return;
    const id = setTimeout(() => setTyped(t => Math.min(t + 1, totalLength)), speedMs);
    return () => clearTimeout(id);
  }, [typed, totalLength, speedMs]);

  return typed;
}

const HeroSection: React.FC = () => {
  const typed = useTypewriter(totalChars);

  return (
    <section className="relative overflow-hidden bg-ld-canvas pt-32 pb-20 lg:pt-40 lg:pb-28 font-ld-sans">
      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-14 lg:gap-8 items-center">
          {/* Left two-thirds: headline + sub + CTAs */}
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-ld-lilac text-ld-violet text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-ld-violet" />
              Sesi Tersedia · 7 Topik QA
            </div>

            <h1 className="font-ld-display font-semibold text-[42px] sm:text-[56px] lg:text-[64px] leading-[0.98] tracking-[-0.025em] text-ld-graphite mb-5">
              Percepat karir QA-mu bersama expert
            </h1>

            <p className="text-base sm:text-lg text-ld-slate leading-relaxed max-w-lg mb-8 tracking-[-0.01em]">
              Mentoring 1-on-1 langsung dengan QA Engineer berpengalaman 6+ tahun.
              Dari fundamental testing hingga otomatisasi Cypress — belajar dari kasus nyata industri.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/mentoring/booking"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ld-violet text-white text-sm font-medium rounded-lg no-underline hover:bg-[#4d3de6] transition-colors"
              >
                Booking Sekarang
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-ld-ash text-ld-graphite text-sm font-medium rounded-lg no-underline hover:border-ld-steel transition-colors"
              >
                Cara Kerja
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              {['60 Menit/Sesi', 'Via WhatsApp', 'Fleksibel Jadwal', 'Gratis Konsultasi Awal'].map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-ld-cloud text-ld-slate text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right one-third: pixel-art mosaic + code terminal card */}
          <div className="lg:col-span-2 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-sm rounded-xl bg-ld-onyx overflow-hidden shadow-[var(--shadow-ld-lg)]">
              <div className="border-b border-white/10 px-5 py-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-ld-steel text-xs font-ld-mono">mentoring-session.tsx</span>
              </div>

              <div className="px-5 py-5">
                <div className="h-[150px] font-ld-mono text-xs leading-relaxed">
                  {(() => {
                    const lineStarts = lineLengths.reduce<number[]>((acc, _length, idx) => {
                      acc.push(idx === 0 ? 0 : acc[idx - 1] + lineLengths[idx - 1]);
                      return acc;
                    }, []);
                    return codeLines.map((line, idx) => {
                      const lineStart = lineStarts[idx];
                      const lineLength = lineLengths[idx];

                      const available = Math.max(0, Math.min(typed - lineStart, lineLength));
                      const isLineTyping = available > 0 && available < lineLength;
                      let segOffset = 0;

                      return (
                        <p key={idx} className={`whitespace-nowrap ${idx === 1 ? 'mt-2' : line.indent ? 'pl-4' : ''}`}>
                          {available === 0
                            ? ' '
                            : line.segments.map((seg, segIdx) => {
                              if (segOffset >= available) return null;
                              const shown = seg.text.slice(0, Math.max(0, available - segOffset));
                              segOffset += seg.text.length;
                              return (
                                <span key={segIdx} className={seg.className}>
                                  {shown}
                                </span>
                              );
                            })}
                          {isLineTyping && (
                            <span className="inline-block w-1.5 h-3.5 -mb-0.5 bg-ld-violet animate-pulse rounded-sm" />
                          )}
                        </p>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
