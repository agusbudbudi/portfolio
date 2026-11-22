// Onboarding scoring + validation, shared by the API (which is the source of
// truth for stored results) and the UI (offline fallback when /api is not
// available, e.g. plain `npm run dev`). Keep free of browser-only imports.
//
// Spec: docs PRD "User Onboarding & Rekomendasi Program" — Section 3B
// (catalog), 5 (matrix + boost), 6 (ranking rules). Matrix is now v3:
// QA Course added as a 5th program (see DEFAULT_ONBOARDING_CONFIG).
import type {
  OnboardingAnswers,
  OnboardingConfig,
  OnboardingQuestion,
  OnboardingRecommendation,
  ProgramCatalogEntry,
  ProgramId,
  RankedProgram,
} from '../types/onboarding';

export const PROGRAM_IDS: ProgramId[] = ['course', 'simulator', 'portfolio', 'mentoring', 'library'];
export const QUESTION_IDS: OnboardingQuestion['id'][] = ['q1', 'q2', 'q3', 'q4'];
export const ONBOARDING_CONFIG_KEY = 'onboarding';

// Matrix v3 (QA Course added as a 5th program). Course = guided path for
// beginners ("dari nol", "bingung mulai", structured learners); Library =
// reference for self-directed readers and experienced QA leveling up.
// Course weights go negative for working QA (1C/1D) on purpose: the live
// course is beginner-level, so it should only win for them when every other
// answer says "dari nol". Distribution over all 960 answer combos: primary
// Simulator 29%, Portfolio 25%, Mentoring 18%, Course 17%, Library 11%.
export const DEFAULT_ONBOARDING_CONFIG: OnboardingConfig = {
  version: 3,
  secondaryThreshold: 0.4,
  catalog: [
    {
      id: 'course', name: 'QA Course', headline: 'Belajar QA dari nol, terarah sampai lulus',
      priority: 1, boost: 0, pricing: { model: 'free', label: 'Gratis' },
      landingPath: '/courses', cta: 'Mulai course', isActive: true,
    },
    {
      id: 'simulator', name: 'QA Simulator', headline: 'Rasakan jadi QA di tim produk sungguhan',
      priority: 2, boost: 1, pricing: { model: 'free', label: 'Gratis' },
      landingPath: '/qa-simulator', cta: 'Mulai project pertama', isActive: true,
    },
    {
      id: 'portfolio', name: 'QA Portfolio', headline: 'Tunjukkan skill-mu, bukan cuma CV',
      priority: 3, boost: 1, pricing: { model: 'free', label: 'Gratis' },
      landingPath: '/portfolio', cta: 'Buat portfolio', isActive: true,
    },
    {
      id: 'mentoring', name: 'Mentoring', headline: 'Dibimbing langsung oleh praktisi QA',
      priority: 4, boost: 0, pricing: { model: 'paid', label: 'Berbayar' },
      landingPath: '/mentoring', cta: 'Booking sesi', isActive: true,
    },
    {
      id: 'library', name: 'QA Library', headline: 'Materi QA yang langsung kepakai',
      priority: 5, boost: 0, pricing: { model: 'free', label: 'Gratis' },
      landingPath: '/qa-library', cta: 'Mulai belajar', isActive: true,
    },
  ],
  questions: [
    {
      id: 'q1', title: 'Posisi kamu sekarang?', maxSelect: 1,
      options: [
        { id: '1A', label: 'Mau pindah karier ke QA', reason: 'baru mau pindah karier ke QA', weights: { course: 3, simulator: 1, mentoring: 1 } },
        { id: '1B', label: 'Fresh graduate / sedang belajar QA', reason: 'sedang belajar QA', weights: { course: 2, simulator: 2, portfolio: 2 } },
        { id: '1C', label: 'Sudah jadi QA, kurang dari 2 tahun', reason: 'sudah jadi QA kurang dari 2 tahun', weights: { course: -1, simulator: 1, portfolio: 2, mentoring: 2, library: 1 } },
        { id: '1D', label: 'QA berpengalaman, 2+ tahun', reason: 'sudah berpengalaman 2+ tahun', weights: { course: -3, portfolio: 1, mentoring: 3, library: 2 } },
      ],
    },
    {
      id: 'q2', title: 'Apa yang paling ingin kamu capai dalam 3 bulan?', maxSelect: 1,
      options: [
        { id: '2A', label: 'Paham dasar QA dari nol', reason: 'ingin paham dasar QA dari nol', owner: 'course', weights: { course: 4, library: 1 } },
        { id: '2B', label: 'Pengalaman praktik seperti kerja nyata', reason: 'ingin pengalaman praktik seperti kerja nyata', owner: 'simulator', weights: { simulator: 4, portfolio: 1 } },
        { id: '2C', label: 'Lolos interview dan dapat kerja QA', reason: 'ingin lolos interview dan dapat kerja QA', owner: 'portfolio', weights: { simulator: 1, portfolio: 4, mentoring: 1 } },
        { id: '2D', label: 'Naik level: automation, karier, atau lead', reason: 'ingin naik level', owner: 'mentoring', weights: { mentoring: 3, library: 3 } },
      ],
    },
    {
      id: 'q3', title: 'Apa yang paling menghambat kamu?', maxSelect: 2,
      options: [
        { id: '3A', label: 'Bingung mulai belajar dari mana', reason: 'bingung mulai belajar dari mana', owner: 'course', weights: { course: 3 } },
        { id: '3B', label: 'Belum punya pengalaman project nyata', reason: 'belum punya pengalaman project nyata', owner: 'simulator', weights: { simulator: 3 } },
        { id: '3C', label: 'CV atau portfolio kurang menonjol', reason: 'merasa CV/portfolio kurang menonjol', owner: 'portfolio', weights: { portfolio: 3 } },
        { id: '3D', label: 'Butuh arahan dari praktisi', reason: 'butuh arahan dari praktisi', owner: 'mentoring', weights: { mentoring: 3 } },
        { id: '3E', label: 'Susah cari materi QA yang relevan', reason: 'susah cari materi QA yang relevan', owner: 'library', weights: { library: 3 } },
      ],
    },
    {
      id: 'q4', title: 'Cara belajar yang paling cocok?', maxSelect: 1,
      options: [
        { id: '4A', label: 'Baca materi sendiri, sesuai kebutuhan', reason: 'suka belajar mandiri', weights: { library: 3 } },
        { id: '4D', label: 'Ikuti kurikulum step by step', reason: 'suka belajar terstruktur step by step', weights: { course: 2, simulator: 1 } },
        { id: '4B', label: 'Langsung praktik', reason: 'lebih suka langsung praktik', weights: { simulator: 2, portfolio: 1 } },
        { id: '4C', label: 'Diskusi 1:1 dengan mentor', reason: 'nyaman diskusi 1:1', weights: { mentoring: 2 } },
      ],
    },
  ],
};

export function emptyAnswers(): OnboardingAnswers {
  return { q1: [], q2: [], q3: [], q4: [] };
}

export function isAnswersComplete(answers: OnboardingAnswers): boolean {
  return QUESTION_IDS.every((q) => answers[q].length > 0);
}

export type ValidationResult = { ok: true; answers: OnboardingAnswers } | { ok: false; errors: string[] };

/** Strict shape + membership check against the active config. */
export function validateOnboardingAnswers(input: unknown, config: OnboardingConfig): ValidationResult {
  const errors: string[] = [];
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, errors: ['answers harus berupa object.'] };
  }
  const raw = input as Record<string, unknown>;
  const answers = emptyAnswers();
  for (const question of config.questions) {
    const value = raw[question.id];
    if (!Array.isArray(value) || value.length === 0) {
      errors.push(`${question.id} wajib dijawab.`);
      continue;
    }
    if (value.length > question.maxSelect) {
      errors.push(`${question.id} maksimal ${question.maxSelect} jawaban.`);
      continue;
    }
    const valid = new Set(question.options.map((o) => o.id));
    const picked: string[] = [];
    for (const id of value) {
      if (typeof id !== 'string' || !valid.has(id)) errors.push(`${question.id}: jawaban "${String(id)}" tidak dikenal.`);
      else if (!picked.includes(id)) picked.push(id);
    }
    answers[question.id] = picked;
  }
  return errors.length ? { ok: false, errors } : { ok: true, answers };
}

function optionIndex(config: OnboardingConfig) {
  const map = new Map<string, { questionId: OnboardingQuestion['id']; option: OnboardingQuestion['options'][number] }>();
  for (const q of config.questions) for (const o of q.options) map.set(o.id, { questionId: q.id, option: o });
  return map;
}

// Top-2 answers by points contributed to this program (ties: answer order).
function reasonFor(picked: { order: number; points: number; reason: string }[]): string {
  const parts = picked
    .filter((p) => p.points > 0)
    .sort((a, b) => b.points - a.points || a.order - b.order)
    .slice(0, 2)
    .map((p) => p.reason);
  if (parts.length === 0) return 'Melengkapi program utamamu.';
  return `Karena kamu ${parts.join(', dan ')}.`;
}

/**
 * PRD Section 6:
 * 1. score = catalog boost + Σ answer weights
 * 2. sort desc; ties → Q2 owner → Q3-picked owner → business priority
 * 3. primary = #1; secondary = #2 always, #3 if score ≥ threshold × primary
 * Inactive programs are excluded entirely.
 */
export function scoreOnboarding(answers: OnboardingAnswers, config: OnboardingConfig): OnboardingRecommendation {
  const index = optionIndex(config);
  const active = config.catalog.filter((c) => c.isActive);
  const catalog = new Map<ProgramId, ProgramCatalogEntry>(active.map((c) => [c.id, c]));

  const scores = Object.fromEntries(PROGRAM_IDS.map((id) => [id, 0])) as Record<ProgramId, number>;
  for (const c of active) scores[c.id] = c.boost;

  const pickedIds = QUESTION_IDS.flatMap((q) => answers[q]);
  const picked = pickedIds
    .map((id, order) => ({ order, entry: index.get(id) }))
    .filter((p): p is { order: number; entry: NonNullable<ReturnType<typeof index.get>> } => Boolean(p.entry));
  for (const { entry } of picked) {
    for (const c of active) scores[c.id] += entry.option.weights[c.id] ?? 0;
  }

  const q2Owner = answers.q2.map((id) => index.get(id)?.option.owner).find(Boolean);
  const q3Owners = new Set(answers.q3.map((id) => index.get(id)?.option.owner).filter(Boolean));

  const ranked = active
    .map((c) => c.id)
    .sort((a, b) =>
      (scores[b] - scores[a]) ||
      (Number(b === q2Owner) - Number(a === q2Owner)) ||
      (Number(q3Owners.has(b)) - Number(q3Owners.has(a))) ||
      ((catalog.get(a)?.priority ?? 99) - (catalog.get(b)?.priority ?? 99))
    );

  const toRanked = (id: ProgramId): RankedProgram => ({
    id,
    score: scores[id],
    reason: reasonFor(picked.map((p) => ({ order: p.order, points: p.entry.option.weights[id] ?? 0, reason: p.entry.option.reason }))),
  });

  const [first, second, third, ...rest] = ranked;
  const secondary: ProgramId[] = [];
  if (second) secondary.push(second);
  const showThird = third !== undefined && scores[third] >= config.secondaryThreshold * scores[first];
  if (showThird) secondary.push(third);
  const others = [...(third !== undefined && !showThird ? [third] : []), ...rest];

  return {
    primary: toRanked(first),
    secondary: secondary.map(toRanked),
    others: others.map(toRanked),
    scores,
  };
}

/** Only same-origin app paths — blocks `//evil.com`, `https://…`, `/\evil`. */
export function safeInternalPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  if (value.startsWith('/onboarding') || value.startsWith('/login')) return null;
  return value;
}

/** Where a program's CTA lands for a signed-in user: its member-dashboard
 *  page. Kept in code (not the stored config) so a config saved before this
 *  mapping existed still routes to the dashboard. Programs without a dashboard
 *  page (QA Library), and admins (whose /dashboard is the admin console, not
 *  the member pages), fall back to the public `landingPath`. */
const PROGRAM_APP_PATH: Partial<Record<ProgramId, string>> = {
  course: '/dashboard/courses',
  simulator: '/dashboard/simulator',
  portfolio: '/dashboard/portfolios',
  mentoring: '/dashboard/booking',
};

export function programHref(
  entry: ProgramCatalogEntry,
  ref: 'onboarding' | 'dashboard',
  isAdmin = false,
): string {
  const path = (!isAdmin && PROGRAM_APP_PATH[entry.id]) || entry.landingPath;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}ref=${ref}`;
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isNumberMap = (v: unknown) => isObject(v) && Object.values(v).every((n) => typeof n === 'number');

function isOption(v: unknown): v is OnboardingQuestion['options'][number] {
  return isObject(v)
    && typeof v.id === 'string' && typeof v.label === 'string' && typeof v.reason === 'string'
    && isNumberMap(v.weights)
    && (v.owner === undefined || PROGRAM_IDS.includes(v.owner as ProgramId));
}

function isCatalogEntry(v: unknown): v is ProgramCatalogEntry {
  return isObject(v)
    && PROGRAM_IDS.includes(v.id as ProgramId)
    && typeof v.name === 'string' && typeof v.headline === 'string' && typeof v.cta === 'string'
    && typeof v.landingPath === 'string' && safeInternalPath(v.landingPath) !== null
    && typeof v.priority === 'number' && typeof v.boost === 'number' && typeof v.isActive === 'boolean'
    && isObject(v.pricing) && typeof v.pricing.label === 'string'
    && ['free', 'paid', 'freemium'].includes(v.pricing.model as string);
}

/** Structural check for a config read from storage or the API, deep enough
 *  that the page and the scorer can trust it: questions in q1..q4 order with
 *  well-formed options, and a catalog of known programs. Anything else falls
 *  back to the bundled default. */
export function isOnboardingConfig(value: unknown): value is OnboardingConfig {
  if (!isObject(value)) return false;
  const { version, questions, catalog, secondaryThreshold } = value;
  return typeof version === 'number'
    && typeof secondaryThreshold === 'number'
    && Array.isArray(questions) && questions.length === QUESTION_IDS.length
    && questions.every((q, i) =>
      isObject(q)
      && q.id === QUESTION_IDS[i]
      && typeof q.title === 'string'
      && typeof q.maxSelect === 'number' && q.maxSelect >= 1
      && Array.isArray(q.options) && q.options.length > 0 && q.options.every(isOption))
    && Array.isArray(catalog) && catalog.every(isCatalogEntry)
    && catalog.some((c) => (c as ProgramCatalogEntry).isActive);
}
