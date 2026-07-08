// BookingForm – 2-panel layout styled with Tailwind CSS using Zustand state management
import React, { useEffect, useRef, useState } from 'react';
import { Send, CheckCircle, ExternalLink } from 'lucide-react';
import type { MentoringConfig } from '../../../../hooks/useConfig';
import { useFormValidation } from '../../../../hooks/useFormValidation';
import { useDraft } from '../../../../hooks/useDraft';
import { getAvailableDates, getNextAvailableDate } from '../../../../lib/dates';
import { generateWhatsAppLink } from '../../../../lib/whatsapp';
import { getErrorMessages } from '../../../../lib/validation';
import DateField from './DateField';
import TopicsField from './TopicsField';
import MentorField from './MentorField';
import TimeField from './TimeField';
import IntroField from './IntroField';
import ErrorBanner from './ErrorBanner';
import ConfirmationModal from './ConfirmationModal';
import { useBookingStore } from '../../../../store/useBookingStore';

interface BookingFormProps {
  config: MentoringConfig;
}

const BookingForm: React.FC<BookingFormProps> = ({ config }) => {
  const { bookingRules, topics, mentors, availableDays } = config;

  const availableDates = getAvailableDates(
    availableDays, mentors,
    bookingRules.daysInAdvanceMin, bookingRules.daysInAdvanceMax
  );
  const defaultDate = getNextAvailableDate(
    availableDays, mentors,
    bookingRules.daysInAdvanceMin, bookingRules.daysInAdvanceMax
  ) ?? '';

  // Zustand state and actions
  const {
    date,
    selectedTopics,
    mentorId,
    time,
    introduction,
    setDate,
    setSelectedTopics,
    setMentorId,
    setTime,
    setIntroduction,
    restoreDraft,
    resetForm,
  } = useBookingStore();

  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLink, setPendingLink] = useState<string | null>(null);

  const { errors, validate, clearError } = useFormValidation(bookingRules.maxTopicsSelectable);
  const { save, restore, clear } = useDraft();
  const hasMounted = useRef(false);

  // Auto-restore draft on mount
  useEffect(() => {
    const savedData = restore();
    if (savedData) {
      restoreDraft(savedData);
    } else if (!date) {
      setDate(defaultDate);
    }
  }, []); // eslint-disable-line

  // Save changes to localStorage on state edits
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    save({ date, topics: selectedTopics, mentorId, time, introduction });
  }, [date, selectedTopics, mentorId, time, introduction]); // eslint-disable-line

  const selectedMentor = mentors.find((m) => m.id === mentorId) ?? null;
  const selectedTopicLabels = selectedTopics.map((id) => topics.find((t) => t.id === id)?.label ?? id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate({ date, topics: selectedTopics, mentorId, time, introduction });
    if (!isValid) {
      setShowErrorBanner(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setShowErrorBanner(false);
    if (!selectedMentor) return;
    const link = generateWhatsAppLink({
      mentorPhone: selectedMentor.whatsapp,
      mentorName: selectedMentor.name,
      dateId: date,
      time,
      topics: selectedTopicLabels,
      introduction: introduction.trim(),
      sessionDurationMinutes: bookingRules.sessionDurationMinutes,
    });
    setPendingLink(link);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    setShowConfirmModal(false);
    if (!pendingLink) return;
    clear();
    resetForm(defaultDate);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
    window.open(pendingLink, '_blank', 'noopener,noreferrer');
    setPendingLink(null);
  };

  const handleCancelModal = () => {
    setShowConfirmModal(false);
    setPendingLink(null);
  };

  const errorMessages = getErrorMessages(errors);

  return (
    <>
      {showConfirmModal && selectedMentor && (
        <ConfirmationModal
          mentorName={selectedMentor.name}
          onConfirm={handleConfirm}
          onCancel={handleCancelModal}
        />
      )}
      <form id="mentoring-booking-form" className="relative" onSubmit={handleSubmit} noValidate aria-label="Form booking sesi mentoring">

        {/* Banners */}
        <div className="mb-6 space-y-3">
          {showErrorBanner && errorMessages.length > 0 && <ErrorBanner errors={errorMessages} onDismiss={() => setShowErrorBanner(false)} />}
          {showSuccess && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl border text-sm font-medium bg-emerald-50 border-emerald-200 text-emerald-600" role="status" aria-live="polite">
              <CheckCircle size={18} />
              <span>Pesan WhatsApp siap dikirim ke <strong>{selectedMentor?.name}</strong></span>
            </div>
          )}
        </div>

        {/* 2-Panel grid: 3:2 layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* LEFT COLUMN: header + card */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="px-5 py-2.5 bg-ld-cloud border border-b-0 border-ld-ash rounded-t-xl">
              <p className="text-[10px] font-medium tracking-widest uppercase text-ld-violet">
                Preferensi Sesi
              </p>
            </div>
            <div className="rounded-b-xl border border-ld-ash p-4 md:p-5 bg-white flex flex-col gap-4">
              <div>
                <TopicsField topics={topics} selected={selectedTopics} maxSelectable={bookingRules.maxTopicsSelectable}
                  onChange={(t) => {
                    setSelectedTopics(t);
                    clearError('topics');
                    clearError('mentorId');
                    clearError('time');
                  }} error={errors.topics} />
              </div>

              <div className="h-px bg-ld-frost" />

              <div>
                <DateField availableDateIds={availableDates} value={date}
                  onChange={(d) => {
                    setDate(d);
                    clearError('date');
                    clearError('time');
                  }} error={errors.date} />
              </div>

              {/* Dealls promotion banner */}
              <a
                href="https://dealls.com/mentoring/agus-budiman-765"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ld-lilac bg-ld-cloud hover:bg-ld-frost hover:border-ld-lavender transition-all duration-200 group cursor-pointer no-underline"
              >
                <img
                  src="https://i.imgur.com/uRMmt6z.jpeg"
                  alt="Dealls"
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-ld-lilac text-ld-violet text-[9px] font-medium uppercase tracking-widest mb-1">
                    Also available on
                  </span>
                  <p className="text-[13px] font-medium text-ld-graphite leading-snug">
                    Dealls Mentoring
                  </p>
                  <p className="text-[11px] text-ld-slate leading-snug">
                    Indonesia's #1 Jobs &amp; Mentoring Platform
                  </p>
                </div>
                <ExternalLink size={14} className="flex-shrink-0 text-ld-fog group-hover:text-ld-violet transition-colors duration-200" />
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: header + card */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="px-5 py-2.5 bg-ld-cloud border border-b-0 border-ld-ash rounded-t-xl">
              <p className="text-[10px] font-medium tracking-widest uppercase text-ld-violet">
                Detail Sesi
              </p>
            </div>
            <div className="rounded-b-xl border border-ld-ash p-4 md:p-5 bg-white flex flex-col gap-4">
              <div>
                <MentorField mentors={mentors} selectedTopics={selectedTopics} selectedDate={date}
                  value={mentorId}
                  onChange={(id) => {
                    setMentorId(id);
                    clearError('mentorId');
                    clearError('time');
                  }} error={errors.mentorId} />
              </div>

              <div className="h-px bg-ld-frost" />

              <div>
                <TimeField mentor={selectedMentor} selectedDate={date}
                  sessionDurationMinutes={bookingRules.sessionDurationMinutes}
                  value={time} onChange={(t) => { setTime(t); clearError('time'); }} error={errors.time} />
              </div>

              <div className="h-px bg-ld-frost" />

              <div>
                <IntroField value={introduction}
                  onChange={(v) => { setIntroduction(v); clearError('introduction'); }}
                  error={errors.introduction} minLength={bookingRules.minIntroductionLength} />
              </div>

              {/* CTA */}
              <div className="pt-2 border-t border-ld-frost flex flex-col gap-2.5">
                <button
                  id="booking-submit-btn"
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-lg bg-ld-violet hover:bg-[#1f87e6] text-white text-sm font-medium transition-colors cursor-pointer border-none"
                  aria-label="Kirim permintaan booking via WhatsApp"
                >
                  <Send size={18} />
                  Kirim via WhatsApp
                </button>
                <p className="text-[11px] text-ld-slate text-center leading-relaxed">
                  Kamu akan diarahkan ke WhatsApp dengan pesan yang sudah terisi otomatis
                </p>
              </div>
            </div>
          </div>

        </div>
      </form>
    </>
  );
};

export default BookingForm;
