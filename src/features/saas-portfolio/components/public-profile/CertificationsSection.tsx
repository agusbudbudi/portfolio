import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { formatMonth } from '../../../../lib/portfolioFormat';
import type { CertificationEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';

const CertificationsSection: React.FC<{ certifications: CertificationEntry[] }> = ({ certifications }) => (
  <section className="mb-14">
    <SectionHeading
      icon={<Award size={20} />}
      iconClassName="bg-emerald-500/10 text-emerald-600"
      title="Certification"
      subtitle="Sertifikasi profesional yang pernah diperoleh."
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {certifications.map((cert) => (
        <div
          key={cert.id}
          className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-5 flex items-start gap-4 transition-shadow hover:shadow-ld-subtle-3"
        >
          <div className="w-[50px] h-[50px] min-w-[50px] flex items-center justify-center bg-ld-canvas rounded-lg overflow-hidden">
            {cert.issuerLogo ? (
              <img src={cert.issuerLogo} alt={cert.issuer} loading="lazy" decoding="async" className="w-full h-full object-contain" />
            ) : (
              <Award size={20} className="text-ld-mist" />
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="text-sm font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{cert.name}</h4>
            <p className="text-xs text-ld-violet font-medium m-0">{cert.issuer}</p>
            <span className="text-[11px] text-ld-fog">{formatMonth(cert.issueDate)}</span>
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-ld-violet no-underline hover:opacity-75 transition-opacity"
              >
                Lihat Kredensial <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default CertificationsSection;
