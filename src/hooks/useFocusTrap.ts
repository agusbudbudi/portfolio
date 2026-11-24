import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]', 'area[href]', 'button:not([disabled])', 'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])', 'textarea:not([disabled])', 'iframe', '[contenteditable="true"]', '[tabindex]:not([tabindex="-1"])',
].join(',');

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.closest('[hidden], [inert]') && el.getClientRects().length > 0,
  );
}

/**
 * Keeps keyboard focus inside a modal: Tab / Shift+Tab wrap around its
 * focusable elements, focus that escapes (e.g. a click on the backdrop) is
 * pulled back, and on unmount focus returns to whatever was focused before
 * the modal opened. Attach the returned ref to the dialog element.
 *
 *   const ref = useFocusTrap<HTMLDivElement>();
 *   <div ref={ref} role="dialog" aria-modal="true">…</div>
 */
export function useFocusTrap<T extends HTMLElement>(active = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;

    // Respect an autoFocus inside; otherwise focus the dialog itself.
    if (!root.contains(document.activeElement)) {
      if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
      root.focus({ preventScroll: true });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const items = focusables(root);
      if (items.length === 0) { e.preventDefault(); root.focus(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (e.shiftKey && (current === first || current === root || !root.contains(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (current === last || !root.contains(current))) {
        e.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (e: FocusEvent) => {
      if (!root.contains(e.target as Node)) (focusables(root)[0] ?? root).focus({ preventScroll: true });
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocusIn);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [active]);

  return ref;
}
