// Shared validation + helpers for Feedback Checkpoint: question bank writes,
// flow writes and learner answers. Used by the admin forms, the popup and
// /api/feedback. Keep free of browser-only imports.
import {
  FEEDBACK_LIMITS as L,
  type FeedbackAnswers,
  type FeedbackFlow,
  type FeedbackFlowData,
  type FeedbackFlowPublic,
  type FeedbackOption,
  type FeedbackQuestion,
  type FeedbackQuestionConfig,
  type FeedbackQuestionData,
  type FeedbackQuestionPublic,
  type FeedbackQuestionType,
} from '../types/feedback.js';

/** Fixed id of the one built-in consent question (seeded by the API). */
export const CONSENT_QUESTION_ID = 'system-consent';
export const DEFAULT_CONSENT_PROMPT = 'Review saya boleh ditampilkan di halaman course, dengan nama saya.';

const TYPES: readonly FeedbackQuestionType[] = ['scale', 'single_choice', 'multi_choice', 'text', 'rating', 'consent'];
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmpty(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function optionalString(value: unknown, max: number): boolean {
  return value === undefined || (typeof value === 'string' && value.length <= max);
}

const hasOptions = (type: FeedbackQuestionType) => type === 'scale' || type === 'single_choice' || type === 'multi_choice';

export type FeedbackQuestionValidation = { ok: true; question: FeedbackQuestionData } | { ok: false; errors: string[] };

export function validateFeedbackQuestion(data: unknown): FeedbackQuestionValidation {
  const errors: string[] = [];
  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };
  const type = data.type as FeedbackQuestionType;
  if (!TYPES.includes(type)) errors.push(`type: wajib salah satu dari ${TYPES.join(', ')}.`);
  if (!nonEmpty(data.prompt, L.promptLength)) errors.push(`Pertanyaan wajib diisi (maks. ${L.promptLength} karakter).`);
  if (!optionalString(data.helpText, L.helpLength)) errors.push(`Teks bantuan maks. ${L.helpLength} karakter.`);
  if (data.status !== 'active' && data.status !== 'archived') errors.push('status: wajib active atau archived.');

  const config: FeedbackQuestionConfig = {};
  const raw = isRecord(data.config) ? data.config : {};
  if (hasOptions(type)) {
    const options = Array.isArray(raw.options) ? raw.options : [];
    if (options.length < L.minOptions || options.length > L.maxOptions) {
      errors.push(`${type === 'scale' ? 'Level' : 'Opsi'}: ${L.minOptions} sampai ${L.maxOptions}.`);
    }
    const ids = new Set<string>();
    const clean: FeedbackOption[] = [];
    options.forEach((opt, i) => {
      const at = `${type === 'scale' ? 'Level' : 'Opsi'} ${i + 1}`;
      if (!isRecord(opt)) { errors.push(`${at}: harus objek.`); return; }
      if (typeof opt.id !== 'string' || !ID_RE.test(opt.id)) errors.push(`${at}: id tidak valid.`);
      else if (ids.has(opt.id)) errors.push(`${at}: id duplikat.`);
      else ids.add(opt.id);
      if (!nonEmpty(opt.label, L.optionLabelLength)) errors.push(`${at}: label wajib diisi (maks. ${L.optionLabelLength} karakter).`);
      if (!optionalString(opt.description, L.optionDescLength)) errors.push(`${at}: deskripsi maks. ${L.optionDescLength} karakter.`);
      clean.push({
        id: String(opt.id),
        label: typeof opt.label === 'string' ? opt.label.trim() : '',
        ...(type === 'scale' && typeof opt.description === 'string' && opt.description.trim() ? { description: opt.description.trim() } : {}),
      });
    });
    config.options = clean;
    if (type === 'multi_choice') {
      const max = raw.maxSelect;
      if (typeof max !== 'number' || !Number.isInteger(max) || max < 1 || max > options.length) {
        errors.push('Maks. pilihan harus 1 sampai jumlah opsi.');
      } else config.maxSelect = max;
    }
  }
  if (type === 'text') {
    config.multiline = Boolean(raw.multiline);
    const max = raw.maxLength === undefined ? L.defaultTextMaxLength : raw.maxLength;
    if (typeof max !== 'number' || !Number.isInteger(max) || max < 10 || max > L.textMaxLength) {
      errors.push(`Panjang maks. isian 10 sampai ${L.textMaxLength}.`);
    } else config.maxLength = max;
    if (!optionalString(raw.placeholder, L.optionDescLength)) errors.push('Placeholder terlalu panjang.');
    else if (typeof raw.placeholder === 'string' && raw.placeholder.trim()) config.placeholder = raw.placeholder.trim();
  }
  if (type === 'rating') {
    for (const key of ['lowLabel', 'highLabel'] as const) {
      if (!optionalString(raw[key], L.optionLabelLength)) errors.push('Label rating terlalu panjang.');
      else if (typeof raw[key] === 'string' && (raw[key] as string).trim()) config[key] = (raw[key] as string).trim();
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    question: {
      type,
      prompt: (data.prompt as string).trim(),
      ...(typeof data.helpText === 'string' && data.helpText.trim() ? { helpText: data.helpText.trim() } : {}),
      config,
      status: data.status as FeedbackQuestionData['status'],
    },
  };
}

/**
 * Once a question has answers only its wording may change: type and the set
 * of option ids are locked (labels may be reworded). Returns why a change is
 * refused, or null.
 */
export function lockedQuestionChange(before: FeedbackQuestionData, after: FeedbackQuestionData): string | null {
  if (before.type !== after.type) return 'Tipe tidak bisa diubah karena pertanyaan ini sudah punya jawaban.';
  const ids = (q: FeedbackQuestionData) => (q.config.options ?? []).map((o) => o.id).join('|');
  if (ids(before) !== ids(after)) {
    return 'Level/opsi tidak bisa ditambah, dihapus, atau diurutkan ulang karena sudah ada jawaban. Duplikat jadi pertanyaan baru.';
  }
  if (before.config.maxSelect !== after.config.maxSelect) return 'Maks. pilihan tidak bisa diubah karena sudah ada jawaban.';
  return null;
}

export type FeedbackFlowValidation = { ok: true; flow: FeedbackFlowData } | { ok: false; errors: string[] };

export function validateFeedbackFlow(data: unknown): FeedbackFlowValidation {
  const errors: string[] = [];
  if (!isRecord(data)) return { ok: false, errors: ['Body harus berupa objek JSON.'] };
  if (!nonEmpty(data.name, L.nameLength)) errors.push(`Nama flow wajib diisi (maks. ${L.nameLength} karakter).`);
  if (!nonEmpty(data.title, L.titleLength)) errors.push(`Judul popup wajib diisi (maks. ${L.titleLength} karakter).`);
  if (!optionalString(data.intro, L.introLength)) errors.push(`Teks pembuka maks. ${L.introLength} karakter.`);
  if (data.status !== 'draft' && data.status !== 'active') errors.push('status: wajib draft atau active.');
  const items = Array.isArray(data.items) ? data.items : [];
  if (items.length < L.minFlowItems || items.length > L.maxFlowItems) {
    errors.push(`Flow berisi ${L.minFlowItems} sampai ${L.maxFlowItems} pertanyaan.`);
  }
  const seen = new Set<string>();
  items.forEach((item, i) => {
    if (!isRecord(item) || typeof item.questionId !== 'string' || !ID_RE.test(item.questionId)) {
      errors.push(`Pertanyaan ${i + 1}: tidak valid.`);
      return;
    }
    if (item.questionId === CONSENT_QUESTION_ID) errors.push('Consent ditambahkan lewat toggle Minta izin testimoni, bukan sebagai pertanyaan.');
    if (seen.has(item.questionId)) errors.push(`Pertanyaan ${i + 1}: sudah ada di flow.`);
    seen.add(item.questionId);
  });
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    flow: {
      name: (data.name as string).trim(),
      title: (data.title as string).trim(),
      ...(typeof data.intro === 'string' && data.intro.trim() ? { intro: data.intro.trim() } : {}),
      status: data.status as FeedbackFlowData['status'],
      items: items.map((it) => ({ questionId: (it as { questionId: string }).questionId, required: Boolean((it as { required?: unknown }).required) })),
      askConsent: Boolean(data.askConsent),
    },
  };
}

export function toPublicQuestion(q: FeedbackQuestion): FeedbackQuestionPublic {
  return { id: q.id, type: q.type, prompt: q.prompt, ...(q.helpText ? { helpText: q.helpText } : {}), config: q.config };
}

/**
 * The flow as the popup shows it. Archived questions stay in flows that
 * already use them; a question missing from the bank is skipped. Consent,
 * when asked, is last and never required.
 */
export function buildPublicFlow(flow: FeedbackFlow, bank: Record<string, FeedbackQuestion>): FeedbackFlowPublic {
  const questions: FeedbackFlowPublic['questions'] = [];
  for (const item of flow.items) {
    const q = bank[item.questionId];
    if (q && q.type !== 'consent') questions.push({ ...toPublicQuestion(q), required: item.required });
  }
  const consent = bank[CONSENT_QUESTION_ID];
  if (flow.askConsent && consent) questions.push({ ...toPublicQuestion(consent), required: false });
  return { id: flow.id, title: flow.title, ...(flow.intro ? { intro: flow.intro } : {}), questions };
}

/** Whether a stored value counts as an answer to `q`. */
export function isAnswered(q: FeedbackQuestionPublic, value: unknown): boolean {
  switch (q.type) {
    case 'scale':
    case 'single_choice':
      return typeof value === 'string' && (q.config.options ?? []).some((o) => o.id === value);
    case 'multi_choice':
      return Array.isArray(value) && value.length > 0;
    case 'text':
      return typeof value === 'string' && value.trim().length > 0;
    case 'rating':
      return typeof value === 'number' && value >= 1 && value <= 5;
    case 'consent':
      return typeof value === 'boolean';
  }
}

export type FeedbackAnswersValidation = { ok: true; answers: FeedbackAnswers } | { ok: false; errors: string[] };

/**
 * Checks answers against the flow. Answers to questions not in the flow are
 * dropped (the admin may have removed them while the learner was filling in);
 * a required question left empty is an error only for a submission.
 */
export function validateFeedbackAnswers(flow: FeedbackFlowPublic, raw: unknown, mode: 'submitted' | 'skipped'): FeedbackAnswersValidation {
  if (mode === 'skipped') return { ok: true, answers: {} };
  if (!isRecord(raw)) return { ok: false, errors: ['answers wajib objek.'] };
  const errors: string[] = [];
  const answers: FeedbackAnswers = {};
  flow.questions.forEach((q, i) => {
    const value = raw[q.id];
    const at = `Pertanyaan ${i + 1}`;
    if (value === undefined || value === null || value === '') {
      if (q.required) errors.push(`${at}: wajib dijawab.`);
      return;
    }
    const optionIds = new Set((q.config.options ?? []).map((o) => o.id));
    switch (q.type) {
      case 'scale':
      case 'single_choice':
        if (typeof value !== 'string' || !optionIds.has(value)) errors.push(`${at}: pilihan tidak valid.`);
        else answers[q.id] = value;
        break;
      case 'multi_choice': {
        const max = q.config.maxSelect ?? optionIds.size;
        if (!Array.isArray(value) || value.some((v) => typeof v !== 'string' || !optionIds.has(v)) || new Set(value).size !== value.length) {
          errors.push(`${at}: pilihan tidak valid.`);
        } else if (value.length > max) errors.push(`${at}: maksimal ${max} pilihan.`);
        else if (value.length === 0) { if (q.required) errors.push(`${at}: wajib dijawab.`); }
        else answers[q.id] = value as string[];
        break;
      }
      case 'text': {
        const max = q.config.maxLength ?? L.defaultTextMaxLength;
        if (typeof value !== 'string') errors.push(`${at}: harus teks.`);
        else if (value.length > max) errors.push(`${at}: maksimal ${max} karakter.`);
        else if (!value.trim()) { if (q.required) errors.push(`${at}: wajib dijawab.`); }
        else answers[q.id] = value.trim();
        break;
      }
      case 'rating':
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) errors.push(`${at}: rating 1 sampai 5.`);
        else answers[q.id] = value;
        break;
      case 'consent':
        if (typeof value !== 'boolean') errors.push(`${at}: harus ya/tidak.`);
        else answers[q.id] = value;
        break;
    }
  });
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, answers };
}

/** First rating answer (denormalized for quick averages), or null. */
export function firstRating(flow: FeedbackFlowPublic, answers: FeedbackAnswers): number | null {
  const q = flow.questions.find((x) => x.type === 'rating' && typeof answers[x.id] === 'number');
  return q ? (answers[q.id] as number) : null;
}

/** Consent answer if the flow asked for it. */
export function consentGiven(answers: FeedbackAnswers): boolean {
  return answers[CONSENT_QUESTION_ID] === true;
}
