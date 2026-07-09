import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { MentorConfig } from '../../../../../types/mentoring';

const topicLabelMap: Record<string, string> = {
  'fundamental-qa': 'Fundamental QA',
  'ai-assisted-qa': 'AI Assisted QA',
  'debugging-tips-tricks': 'Debugging',
  'test-management-strategy': 'Test Management',
  'api-testing-postman': 'API Testing',
  'cypress-web-automation': 'Cypress Automation',
  'web-automation-basic': 'Web Automation',
};

const dayLabelMap: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const companies = [
  { name: 'Diricare', logo: '/img/company/diricare-logo.webp' },
  { name: 'Traveloka', logo: '/img/company/traveloka-logo.webp' },
  { name: 'Pegipegi', logo: '/img/company/pegipegi-logo.webp' },
];

interface MentorProfileModalProps {
  mentor: MentorConfig;
  onClose: () => void;
}

const MentorProfileModal: React.FC<MentorProfileModalProps> = ({ mentor, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const scheduleDays = dayOrder.filter(day => (mentor.schedule[day] ?? []).length > 0);

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center font-ld-sans" role="dialog" aria-modal="true" aria-labelledby="mentor-modal-title">
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`relative w-full sm:max-w-lg max-h-[88vh] sm:max-h-[85vh] bg-ld-canvas rounded-t-2xl sm:rounded-2xl border border-ld-ash shadow-[0_-8px_30px_rgba(30,27,75,0.2)] sm:shadow-[0_20px_60px_rgba(30,27,75,0.25)] overflow-hidden flex flex-col transition-all duration-300 ease-out ${show ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-6 sm:opacity-0'
          }`}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <span className="w-10 h-1.5 rounded-full bg-ld-ash" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-ld-slate hover:text-ld-graphite transition-colors cursor-pointer shadow-sm"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto">
          <div className="bg-ld-canvas border-b border-ld-ash flex items-stretch gap-4 h-32 overflow-hidden">
            <div className="aspect-square flex-shrink-0 self-stretch overflow-hidden bg-white">
              <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 pr-14 flex flex-col justify-center">
              <h2 id="mentor-modal-title" className="text-lg font-ld-display font-semibold text-ld-graphite mb-0.5 truncate">
                {mentor.name}
              </h2>
              <p className="text-ld-slate text-xs leading-snug">{mentor.bio}</p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5 text-left">
            {mentor.detailProfile && (
              <div>
                <p className="text-xs font-medium text-ld-fog uppercase tracking-wide mb-2">Tentang Mentor</p>
                <p className="text-sm text-ld-slate leading-relaxed whitespace-pre-line">{mentor.detailProfile}</p>
              </div>
            )}

            <div className={mentor.detailProfile ? 'border-t border-ld-ash pt-5' : undefined}>
              <p className="text-xs font-medium text-ld-fog uppercase tracking-wide mb-2">Pernah Bekerja Di</p>
              <div className="flex flex-wrap items-center gap-2.5">
                {companies.map(company => (
                  <img key={company.name} src={company.logo} alt={company.name} loading="lazy" decoding="async" className="h-8 rounded-lg object-contain" />
                ))}
              </div>
            </div>

            <div className="border-t border-ld-ash pt-5">
              <p className="text-xs font-medium text-ld-fog uppercase tracking-wide mb-2">Area Keahlian</p>
              <div className="flex flex-wrap gap-1.5">
                {mentor.expertise.map(id => (
                  <span key={id} className="px-2.5 py-1 rounded-full bg-ld-cloud text-ld-graphite text-xs font-medium">
                    {topicLabelMap[id] ?? id}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-ld-ash pt-5">
              <p className="text-xs font-medium text-ld-fog uppercase tracking-wide mb-2">Jadwal Tersedia</p>
              <div className="rounded-xl border border-ld-ash divide-y divide-ld-ash overflow-hidden">
                {scheduleDays.map(day => (
                  <div key={day} className="flex items-center gap-3 px-3.5 py-2.5 bg-ld-canvas">
                    <span className="w-14 flex-shrink-0 text-sm text-ld-slate">{dayLabelMap[day]}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.schedule[day].map(time => (
                        <span
                          key={time}
                          className="px-2.5 py-1 rounded-md bg-ld-cloud text-ld-graphite text-xs font-medium tabular-nums"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-ld-ash flex-shrink-0">
          <Link
            to="/mentoring/booking"
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-ld-violet text-white font-medium rounded-lg no-underline hover:bg-[#1f87e6] transition-colors text-sm"
          >
            Book Session dengan {mentor.name.split(' ')[0]}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MentorProfileModal;
