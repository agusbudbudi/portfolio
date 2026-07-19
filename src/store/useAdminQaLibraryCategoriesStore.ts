import { create } from 'zustand';
import type { QaLibraryCategory } from '../types/qaLibrary';
import { apiGetQaLibraryCategories, apiPutQaLibraryCategories, ConflictError, UnauthorizedError } from '../lib/adminApi';
import { validateQaLibraryCategories } from '../lib/qaLibraryValidation';
import { useAdminAuthStore } from './useAdminAuthStore';
import { dedupeInFlight, type InFlightHolder } from '../lib/dedupeInFlight';

const deepCopy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export type ActionResult = { ok: boolean; reason?: string };

interface AdminQaLibraryCategoriesState {
  categories: QaLibraryCategory[];
  categoriesUpdatedAt?: string;
  loading: boolean;
  loadError: string | null;

  load: () => Promise<void>;
  upsertCategory: (category: QaLibraryCategory) => Promise<ActionResult>;
  deleteCategory: (categoryId: string) => Promise<ActionResult>;
}

// Same save-immediately-per-action pattern as tools/topics in
// useAdminToolsStore.ts — categories is a small master lookup, whole-array
// replace on every edit.
async function commitCategories(
  set: (partial: Partial<AdminQaLibraryCategoriesState>) => void,
  get: () => AdminQaLibraryCategoriesState,
  categories: QaLibraryCategory[]
): Promise<ActionResult> {
  const result = validateQaLibraryCategories({ categories });
  if (!result.ok) return { ok: false, reason: result.errors.join(' ') };

  const token = useAdminAuthStore.getState().token;
  if (!token) {
    useAdminAuthStore.getState().logout();
    return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
  }

  try {
    const saved = await apiPutQaLibraryCategories({ categories: result.categories }, get().categoriesUpdatedAt, token);
    set({ categories: deepCopy(saved.categories), categoriesUpdatedAt: saved.updatedAt });
    return { ok: true };
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      useAdminAuthStore.getState().logout();
      return { ok: false, reason: 'Sesi berakhir, silakan login ulang.' };
    }
    if (err instanceof ConflictError) {
      const current = err.current as { categories: QaLibraryCategory[]; updatedAt: string };
      set({ categories: deepCopy(current.categories), categoriesUpdatedAt: current.updatedAt });
      return { ok: false, reason: 'Categories berubah di tempat lain. Data sudah dimuat ulang, coba lagi.' };
    }
    return { ok: false, reason: err instanceof Error ? err.message : 'Gagal menyimpan categories.' };
  }
}

const loadRef: InFlightHolder<void> = { promise: null, rerun: false };

export const useAdminQaLibraryCategoriesStore = create<AdminQaLibraryCategoriesState>((set, get) => ({
  categories: [],
  categoriesUpdatedAt: undefined,
  loading: true,
  loadError: null,

  load: () => dedupeInFlight(loadRef, async () => {
    set({ loading: true, loadError: null });
    try {
      const doc = await apiGetQaLibraryCategories();
      set({ categories: deepCopy(doc.categories), categoriesUpdatedAt: doc.updatedAt });
    } catch (err) {
      set({ loadError: err instanceof Error ? err.message : 'Gagal memuat categories.' });
    } finally {
      set({ loading: false });
    }
  }),

  upsertCategory: async (category) => {
    const categories = deepCopy(get().categories);
    const idx = categories.findIndex((c) => c.id === category.id);
    if (idx >= 0) categories[idx] = category;
    else categories.push(category);
    return commitCategories(set, get, categories);
  },

  deleteCategory: async (categoryId) => {
    const categories = get().categories;
    return commitCategories(set, get, categories.filter((c) => c.id !== categoryId));
  },
}));
