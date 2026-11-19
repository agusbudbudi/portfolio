// Shared by the API (PUT /api/simulator/progress/:projectId) and the client.
// Keep free of browser-only imports. Server doesn't check assignment ids
// against the project JSON (content is a static client asset) — it only
// guarantees the document is well-formed and bounded in size.
import type { AssignmentContent, AssignmentProgress, ProjectProgress } from '../types/qaSimulator';

export const SIMULATOR_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const MAX_PROGRESS_BYTES = 300_000;

const MAX_ASSIGNMENTS = 50;
const MAX_TEXT = 20_000;
const MAX_URL = 2_000;
const MAX_ITEMS = 60;
const MAX_ITEM_FIELDS = 20;
const MAX_ITEM_VALUE = 5_000;
const MAX_RUBRIC = 30;

type Result = { ok: true; data: ProjectProgress } | { ok: false; errors: string[] };

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isIsoString = (v: unknown): v is string => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v));

function validateContent(raw: unknown, path: string, errors: string[]): AssignmentContent {
  if (!isObject(raw)) {
    errors.push(`${path}: harus object.`);
    return {};
  }
  const content: AssignmentContent = {};
  if (raw.text !== undefined) {
    if (typeof raw.text !== 'string' || raw.text.length > MAX_TEXT) errors.push(`${path}.text: maksimal ${MAX_TEXT} karakter.`);
    else content.text = raw.text;
  }
  if (raw.url !== undefined) {
    if (typeof raw.url !== 'string' || raw.url.length > MAX_URL) errors.push(`${path}.url: maksimal ${MAX_URL} karakter.`);
    else content.url = raw.url;
  }
  if (raw.items !== undefined) {
    if (!Array.isArray(raw.items) || raw.items.length > MAX_ITEMS) {
      errors.push(`${path}.items: maksimal ${MAX_ITEMS} item.`);
    } else {
      content.items = raw.items.map((item, i) => {
        const out: Record<string, string> = {};
        if (!isObject(item) || Object.keys(item).length > MAX_ITEM_FIELDS) {
          errors.push(`${path}.items[${i}]: format tidak valid.`);
          return out;
        }
        for (const [key, value] of Object.entries(item)) {
          if (!SIMULATOR_ID_PATTERN.test(key) || typeof value !== 'string' || value.length > MAX_ITEM_VALUE) {
            errors.push(`${path}.items[${i}].${key}: tidak valid.`);
            continue;
          }
          out[key] = value;
        }
        return out;
      });
    }
  }
  return content;
}

function validateAssignment(raw: unknown, path: string, errors: string[]): AssignmentProgress | null {
  if (!isObject(raw)) {
    errors.push(`${path}: harus object.`);
    return null;
  }
  if (raw.status !== 'draft' && raw.status !== 'submitted') errors.push(`${path}.status: wajib "draft" atau "submitted".`);
  if (!isIsoString(raw.updatedAt)) errors.push(`${path}.updatedAt: wajib tanggal ISO.`);
  if (raw.submittedAt !== undefined && !isIsoString(raw.submittedAt)) errors.push(`${path}.submittedAt: wajib tanggal ISO.`);
  if (raw.assessedAt !== undefined && !isIsoString(raw.assessedAt)) errors.push(`${path}.assessedAt: wajib tanggal ISO.`);
  const rubric = raw.checkedRubric;
  if (
    !Array.isArray(rubric) || rubric.length > MAX_RUBRIC ||
    !rubric.every((r) => typeof r === 'string' && SIMULATOR_ID_PATTERN.test(r))
  ) {
    errors.push(`${path}.checkedRubric: wajib array id.`);
  }
  const content = validateContent(raw.content, `${path}.content`, errors);
  return {
    content,
    status: raw.status as AssignmentProgress['status'],
    checkedRubric: Array.isArray(rubric) ? (rubric as string[]) : [],
    ...(typeof raw.submittedAt === 'string' ? { submittedAt: raw.submittedAt } : {}),
    ...(typeof raw.assessedAt === 'string' ? { assessedAt: raw.assessedAt } : {}),
    updatedAt: raw.updatedAt as string,
  };
}

export function validateProjectProgress(raw: unknown): Result {
  const errors: string[] = [];
  if (!isObject(raw) || !isObject(raw.assignments)) return { ok: false, errors: ['data.assignments: wajib object.'] };
  if (JSON.stringify(raw).length > MAX_PROGRESS_BYTES) return { ok: false, errors: ['data: ukuran progress terlalu besar.'] };

  const entries = Object.entries(raw.assignments);
  if (entries.length > MAX_ASSIGNMENTS) return { ok: false, errors: [`data.assignments: maksimal ${MAX_ASSIGNMENTS}.`] };

  const assignments: Record<string, AssignmentProgress> = {};
  for (const [id, value] of entries) {
    if (!SIMULATOR_ID_PATTERN.test(id)) {
      errors.push(`data.assignments.${id}: id tidak valid.`);
      continue;
    }
    const parsed = validateAssignment(value, `data.assignments.${id}`, errors);
    if (parsed) assignments[id] = parsed;
  }
  if (!isIsoString(raw.updatedAt)) errors.push('data.updatedAt: wajib tanggal ISO.');

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, data: { assignments, updatedAt: raw.updatedAt as string } };
}
