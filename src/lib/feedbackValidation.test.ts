import { describe, expect, it } from 'vitest';
import {
  CONSENT_QUESTION_ID, buildPublicFlow, lockedQuestionChange, validateFeedbackAnswers, validateFeedbackFlow, validateFeedbackQuestion,
} from './feedbackValidation';
import type { FeedbackFlow, FeedbackQuestion } from '../types/feedback';

const opts = (...labels: string[]) => labels.map((label, i) => ({ id: `o${i + 1}`, label }));

const q = (id: string, data: Partial<FeedbackQuestion>): FeedbackQuestion => ({
  id, type: 'text', prompt: id, config: {}, status: 'active', isSystem: false, createdAt: '', updatedAt: '', ...data,
});

const bank: Record<string, FeedbackQuestion> = {
  scale: q('scale', { type: 'scale', config: { options: opts('Belum', 'Bisa') } }),
  multi: q('multi', { type: 'multi_choice', config: { options: opts('A', 'B', 'C'), maxSelect: 2 } }),
  text: q('text', { type: 'text', config: { maxLength: 20 } }),
  rating: q('rating', { type: 'rating' }),
  archived: q('archived', { type: 'rating', status: 'archived' }),
  [CONSENT_QUESTION_ID]: q(CONSENT_QUESTION_ID, { type: 'consent', isSystem: true }),
};

const flowRecord: FeedbackFlow = {
  id: 'f1', name: 'Refleksi', title: 'Feedback modul', status: 'active', askConsent: true, createdAt: '', updatedAt: '',
  items: [
    { questionId: 'scale', required: true },
    { questionId: 'multi', required: true },
    { questionId: 'text', required: false },
    { questionId: 'rating', required: true },
    { questionId: 'archived', required: false },
    { questionId: 'gone', required: true },
  ],
};
const flow = buildPublicFlow(flowRecord, bank);

describe('validateFeedbackQuestion', () => {
  it('accepts a scale with 2 to 6 levels and trims text', () => {
    const r = validateFeedbackQuestion({ type: 'scale', prompt: '  Yakin? ', status: 'active', config: { options: [{ id: 'a', label: 'X', description: 'd' }, { id: 'b', label: 'Y' }] } });
    expect(r.ok && r.question.prompt).toBe('Yakin?');
    expect(r.ok && r.question.config.options?.[0].description).toBe('d');
  });

  it('rejects too few options, duplicate ids and a maxSelect above the option count', () => {
    expect(validateFeedbackQuestion({ type: 'single_choice', prompt: 'x', status: 'active', config: { options: opts('A') } }).ok).toBe(false);
    expect(validateFeedbackQuestion({ type: 'single_choice', prompt: 'x', status: 'active', config: { options: [{ id: 'a', label: 'A' }, { id: 'a', label: 'B' }] } }).ok).toBe(false);
    expect(validateFeedbackQuestion({ type: 'multi_choice', prompt: 'x', status: 'active', config: { options: opts('A', 'B'), maxSelect: 3 } }).ok).toBe(false);
  });
});

describe('lockedQuestionChange', () => {
  const before = bank.scale;
  it('allows rewording labels', () => {
    expect(lockedQuestionChange(before, { ...before, prompt: 'baru', config: { options: [{ id: 'o1', label: 'Belum sama sekali' }, { id: 'o2', label: 'Bisa' }] } })).toBeNull();
  });
  it('refuses a new type or a changed option set', () => {
    expect(lockedQuestionChange(before, { ...before, type: 'single_choice' })).not.toBeNull();
    expect(lockedQuestionChange(before, { ...before, config: { options: opts('A', 'B', 'C') } })).not.toBeNull();
  });
});

describe('validateFeedbackFlow', () => {
  it('rejects duplicates, an empty flow and the consent question as an item', () => {
    const base = { name: 'n', title: 't', status: 'active', askConsent: false };
    expect(validateFeedbackFlow({ ...base, items: [] }).ok).toBe(false);
    expect(validateFeedbackFlow({ ...base, items: [{ questionId: 'a' }, { questionId: 'a' }] }).ok).toBe(false);
    expect(validateFeedbackFlow({ ...base, items: [{ questionId: CONSENT_QUESTION_ID }] }).ok).toBe(false);
    expect(validateFeedbackFlow({ ...base, items: [{ questionId: 'a', required: 1 }] })).toMatchObject({ ok: true, flow: { items: [{ questionId: 'a', required: true }] } });
  });
});

describe('buildPublicFlow', () => {
  it('keeps archived questions, drops missing ones and puts consent last, never required', () => {
    expect(flow.questions.map((x) => x.id)).toEqual(['scale', 'multi', 'text', 'rating', 'archived', CONSENT_QUESTION_ID]);
    expect(flow.questions.at(-1)?.required).toBe(false);
  });
});

describe('validateFeedbackAnswers', () => {
  const good = { scale: 'o2', multi: ['o1', 'o3'], rating: 4, [CONSENT_QUESTION_ID]: true };

  it('accepts a complete submission and drops answers to unknown questions', () => {
    const r = validateFeedbackAnswers(flow, { ...good, text: '  oke ', removed: 'x' }, 'submitted');
    expect(r).toEqual({ ok: true, answers: { ...good, text: 'oke' } });
  });

  it('requires required questions only when submitting', () => {
    expect(validateFeedbackAnswers(flow, { scale: 'o1' }, 'submitted').ok).toBe(false);
    expect(validateFeedbackAnswers(flow, {}, 'skipped')).toEqual({ ok: true, answers: {} });
  });

  it('rejects unknown options, too many picks, long text and out-of-range ratings', () => {
    expect(validateFeedbackAnswers(flow, { ...good, scale: 'nope' }, 'submitted').ok).toBe(false);
    expect(validateFeedbackAnswers(flow, { ...good, multi: ['o1', 'o2', 'o3'] }, 'submitted').ok).toBe(false);
    expect(validateFeedbackAnswers(flow, { ...good, text: 'x'.repeat(21) }, 'submitted').ok).toBe(false);
    expect(validateFeedbackAnswers(flow, { ...good, rating: 6 }, 'submitted').ok).toBe(false);
  });
});
