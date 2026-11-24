import type { ReactNode } from 'react';
import { create } from 'zustand';

interface BaseConfirmOptions {
  title: string;
  /** Text or inline markup (e.g. a bold link). */
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  /** Icon matching the action; defaults to the variant's icon. */
  icon?: 'delete' | 'archive' | 'duplicate' | 'alert' | 'info';
  /** Called when the dialog closes without confirming (Batal, X, Esc, backdrop). */
  onCancel?: () => void;
}

interface CtaConfirmOptions extends BaseConfirmOptions {
  mode: 'cta';
  onConfirm: () => void | Promise<void>;
}

interface ReasonConfirmOptions extends BaseConfirmOptions {
  mode: 'reason';
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason: string) => void | Promise<void>;
}

export type ConfirmOptions = CtaConfirmOptions | ReasonConfirmOptions;

interface ConfirmState {
  options: ConfirmOptions | null;
  open: (opts: ConfirmOptions) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  options: null,
  open: (opts) => set({ options: opts }),
  close: () => {
    const opts = get().options;
    set({ options: null });
    opts?.onCancel?.();
  },
}));

/**
 * Promise form of the brand confirm dialog, a drop-in for window.confirm in
 * async handlers:
 *
 *   if (!(await confirmAction({ title: 'Hapus tool "X"?', confirmLabel: 'Hapus' }))) return;
 *
 * Resolves true on confirm, false on any cancel. Defaults: danger + delete icon.
 */
export function confirmAction(opts: Omit<CtaConfirmOptions, 'mode' | 'onConfirm' | 'onCancel'>): Promise<boolean> {
  return new Promise((resolve) => {
    // close() also runs after a confirm; the promise is already settled by then.
    useConfirmStore.getState().open({
      variant: 'danger',
      icon: 'delete',
      ...opts,
      mode: 'cta',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}
