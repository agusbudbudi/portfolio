import React from 'react';
import { ExternalLink, FileCheck2 } from 'lucide-react';
import type { QaDeliverablesConfig } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';

const QaDeliverablesSection: React.FC<{ qaDeliverables: QaDeliverablesConfig }> = ({ qaDeliverables }) => (
  <section className="mb-14">
    <SectionHeading
      icon={<FileCheck2 size={20} />}
      iconClassName="bg-violet-500/10 text-violet-600"
      title={qaDeliverables.title}
      subtitle={qaDeliverables.subtitle}
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {qaDeliverables.items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-5 flex items-start gap-4 no-underline transition-shadow hover:shadow-ld-subtle-3"
        >
          <div className="w-[42px] h-[42px] min-w-[42px] flex items-center justify-center bg-ld-violet text-white rounded-lg">
            <FileCheck2 size={18} />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0 group-hover:text-ld-violet transition-colors">
              {item.title}
            </h4>
            {item.subtitle && <p className="text-xs text-ld-slate m-0">{item.subtitle}</p>}
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-ld-violet">
              Lihat Dokumen <ExternalLink size={11} />
            </span>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default QaDeliverablesSection;
