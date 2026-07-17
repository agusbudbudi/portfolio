import { create } from 'zustand';
import type { SkillConfig } from '../types/portfolio';
import { apiGetSkills, apiPutSkills, ConflictError, UnauthorizedError } from '../lib/adminApi';
import { validateSkills } from '../lib/portfolioValidation';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type ActionResult = { ok: boolean; reason?: string };

interface AdminSkillsState {
  skills: SkillConfig[];
  skillsUpdatedAt?: string;
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  upsertSkill: (skill: SkillConfig) => Promise<ActionResult>;
  deleteSkill: (skillId: string) => Promise<ActionResult>;
}

// Same save-immediately-per-action pattern as tools in useAdminToolsStore.ts
// — skills is a small master lookup, whole-array replace on every edit.
async function commitSkills(
  set: (partial: Partial<AdminSkillsState>) => void,
  get: () => AdminSkillsState,
  skills: SkillConfig[]
): Promise<ActionResult> {
  const result = validateSkills({ skills });
  if (!result.ok) return { ok: false, reason: result.errors.join(' ') };

  const token = useAdminAuthStore.getState().token;
  if (!token) {
    useAdminAuthStore.getState().logout();
    return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
  }

  try {
    const saved = await apiPutSkills({ skills: result.skills }, get().skillsUpdatedAt, token);
    set({ skills: deepCopy(saved.skills), skillsUpdatedAt: saved.updatedAt });
    return { ok: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      useAdminAuthStore.getState().logout();
      return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    }
    if (err instanceof ConflictError) {
      const current = err.current as { skills: SkillConfig[]; updatedAt: string };
      set({ skills: deepCopy(current.skills), skillsUpdatedAt: current.updatedAt });
      return { ok: false, reason: 'Skills berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
    }
    return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan skills.' };
  }
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminSkillsStore = create<AdminSkillsState>((set, get) => ({
  skills: [],
  skillsUpdatedAt: undefined,
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    set({ loading: true, loadError: null });
    try {
      const doc = await apiGetSkills();
      set({ skills: deepCopy(doc.skills), skillsUpdatedAt: doc.updatedAt });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat skills.' });
    } finally {
      set({ loading: false });
    }
  }),

  upsertSkill: async (skill) => {
    const stamped = { ...skill, updatedAt: new Date().toISOString() };
    const skills = deepCopy(get().skills);
    const idx = skills.findIndex((s) => s.id === stamped.id);
    if (idx >= 0) skills[idx] = stamped;
    else skills.push(stamped);
    return commitSkills(set, get, skills);
  },

  deleteSkill: async (skillId) => {
    const skills = get().skills;
    return commitSkills(set, get, skills.filter((s) => s.id !== skillId));
  },
}));
