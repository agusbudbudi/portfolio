import { create } from 'zustand';

interface BaseConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
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

export const useConfirmStore = create<ConfirmState>((set) => ({
  options: null,
  open: (opts) => set({ options: opts }),
  close: () => set({ options: null }),
}));
