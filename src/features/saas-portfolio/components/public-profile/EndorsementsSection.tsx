import React from 'react';
import { Quote } from 'lucide-react';
import type { EndorsementEntry } from '../../../../types/portfolio';
import SectionHeading from '../../../../components/common/SectionHeading';
import EndorsementCard from './EndorsementCard';

const EndorsementsSection: React.FC<{ endorsements: EndorsementEntry[] }> = ({ endorsements }) => (
  <section>
    <SectionHeading
      icon={<Quote size={20} />}
      iconClassName="bg-blue-500/10 text-blue-500"
      title="Endorsement"
      subtitle="Testimoni dari kolega dan atasan yang pernah bekerja sama."
    />

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {endorsements.map((entry) => (
        <EndorsementCard
          key={entry.id}
          photo={entry.photo}
          name={entry.name}
          relation={entry.relation}
          message={entry.message}
          linkedinUrl={entry.linkedinUrl}
        />
      ))}
    </div>
  </section>
);

export default EndorsementsSection;
