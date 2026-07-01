import { create } from 'zustand';

interface BookingState {
  date: string;
  selectedTopics: string[];
  mentorId: string;
  time: string;
  introduction: string;
  
  setDate: (date: string) => void;
  setSelectedTopics: (topics: string[]) => void;
  setMentorId: (mentorId: string) => void;
  setTime: (time: string) => void;
  setIntroduction: (introduction: string) => void;
  restoreDraft: (draft: { date?: string; topics?: string[]; mentorId?: string; time?: string; introduction?: string }) => void;
  resetForm: (defaultDate: string) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  date: '',
  selectedTopics: [],
  mentorId: '',
  time: '',
  introduction: '',

  setDate: (date) => set(() => ({ date, time: '' })),
  setSelectedTopics: (topics) => set(() => ({ selectedTopics: topics, mentorId: '', time: '' })),
  setMentorId: (mentorId) => set(() => ({ mentorId, time: '' })),
  setTime: (time) => set({ time }),
  setIntroduction: (introduction) => set({ introduction }),
  
  restoreDraft: (draft) => set({
    date: draft.date || '',
    selectedTopics: draft.topics || [],
    mentorId: draft.mentorId || '',
    time: draft.time || '',
    introduction: draft.introduction || '',
  }),

  resetForm: (defaultDate) => set({
    date: defaultDate,
    selectedTopics: [],
    mentorId: '',
    time: '',
    introduction: '',
  }),
}));
