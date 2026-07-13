import React, { useState } from 'react';
import { Linkedin, User } from 'lucide-react';

const EndorsementCard: React.FC<{
  photo?: string; name: string; relation: string; message: string; linkedinUrl?: string;
}> = ({ photo, name, relation, message, linkedinUrl }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-ld-canvas border border-ld-ash rounded-xl p-4 sm:p-8 flex flex-col gap-6 transition-shadow hover:shadow-ld-subtle-3">
      <div className="flex items-center gap-5">
        <div className="relative w-[60px] h-[60px] min-w-[60px] rounded-xl border-2 border-ld-canvas shadow-ld-subtle-2 bg-ld-cloud flex items-center justify-center overflow-hidden">
          {photo ? (
            <img src={photo} alt={name} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          ) : (
            <User size={22} className="text-ld-mist" />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-ld-display font-semibold text-ld-graphite tracking-[-0.01em] m-0">{name}</h3>
            {linkedinUrl && (
              <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[#0077b5] hover:opacity-75 transition-opacity">
                <Linkedin size={16} />
              </a>
            )}
          </div>
          <p className="text-xs text-ld-slate m-0">{relation}</p>
        </div>
      </div>

      <div className="relative">
        <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expanded ? 'max-h-[1000px]' : 'max-h-[4.5rem]'}`}>
          <p className="text-ld-slate text-sm leading-relaxed italic m-0 whitespace-pre-line">{message}</p>
        </div>
        {message.length > 200 && (
          <button
            className="mt-3 bg-transparent border-none text-ld-violet font-medium text-xs cursor-pointer p-0 hover:opacity-75 transition-opacity"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
          </button>
        )}
      </div>
    </div>
  );
};

export default EndorsementCard;
