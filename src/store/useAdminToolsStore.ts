import { create } from 'zustand';
import type { ToolConfig } from '../types/portfolio';
import { apiGetTools, apiPutTools, ConflictError, UnauthorizedError } from '../lib/adminApi';
import { validateTools } from '../lib/portfolioValidation';
import { useAdminAuthStore } from './useAdminAuthStore';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type ActionResult = { ok: boolean; reason?: string };

interface AdminToolsState {
  tools: ToolConfig[];
  toolsUpdatedAt?: string;
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  upsertTool: (tool: ToolConfig) => Promise<ActionResult>;
  deleteTool: (toolId: string) => Promise<ActionResult>;
}

// Same save-immediately-per-action pattern as topics/mentors in
// useAdminConfigStore.ts — tools is a small master lookup, whole-array
// replace on every edit.
async function commitTools(
  set: (partial: Partial<AdminToolsState>) => void,
  get: () => AdminToolsState,
  tools: ToolConfig[]
): Promise<ActionResult> {
  const result = validateTools({ tools });
  if (!result.ok) return { ok: false, reason: result.errors.join(' ') };

  const token = useAdminAuthStore.getState().token;
  if (!token) {
    useAdminAuthStore.getState().logout();
    return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
  }

  try {
    const saved = await apiPutTools({ tools: result.tools }, get().toolsUpdatedAt, token);
    set({ tools: deepCopy(saved.tools), toolsUpdatedAt: saved.updatedAt });
    return { ok: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      useAdminAuthStore.getState().logout();
      return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    }
    if (err instanceof ConflictError) {
      const current = err.current as { tools: ToolConfig[]; updatedAt: string };
      set({ tools: deepCopy(current.tools), toolsUpdatedAt: current.updatedAt });
      return { ok: false, reason: 'Tools berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
    }
    return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan tools.' };
  }
}

export const useAdminToolsStore = create<AdminToolsState>((set, get) => ({
  tools: [],
  toolsUpdatedAt: undefined,
  loading: true,
  loadError: null,

  load: async () => {
    set({ loading: true, loadError: null });
    try {
      const doc = await apiGetTools();
      set({ tools: deepCopy(doc.tools), toolsUpdatedAt: doc.updatedAt });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat tools.' });
    } finally {
      set({ loading: false });
    }
  },

  upsertTool: async (tool) => {
    const stamped = { ...tool, updatedAt: new Date().toISOString() };
    const tools = deepCopy(get().tools);
    const idx = tools.findIndex((t) => t.id === stamped.id);
    if (idx >= 0) tools[idx] = stamped;
    else tools.push(stamped);
    return commitTools(set, get, tools);
  },

  deleteTool: async (toolId) => {
    const tools = get().tools;
    return commitTools(set, get, tools.filter((t) => t.id !== toolId));
  },
}));
