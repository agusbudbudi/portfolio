import { useCallback, useEffect, useState, type RefObject } from 'react';

export interface AnchoredPanelPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

const GAP = 4;

// Positioning for a dropdown panel portalled to <body> (Select, Combobox).
// Call `place()` right before opening:
// fixed coordinates under the trigger, flipped above it when there isn't
// room below, kept glued on scroll/resize, and closed on outside click.
// Portalling keeps the panel from being clipped by modals or scroll areas.
export function useAnchoredPanel({
  open,
  triggerRef,
  panelRef,
  panelHeight,
  onOutsideClick,
}: {
  open: boolean;
  triggerRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  /** Expected panel height, used to decide whether to flip upward. */
  panelHeight: number;
  onOutsideClick: () => void;
}) {
  const [pos, setPos] = useState<AnchoredPanelPosition>({ left: 0, width: 0 });

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    const flipUp = below < panelHeight + GAP && r.top > below;
    const next: AnchoredPanelPosition = flipUp
      ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + GAP }
      : { left: r.left, width: r.width, top: r.bottom + GAP };
    setPos((prev) => (
      prev.left === next.left && prev.width === next.width && prev.top === next.top && prev.bottom === next.bottom
        ? prev
        : next
    ));
  }, [triggerRef, panelHeight]);

  // Callers run place() right before opening, so this only follows movement.
  useEffect(() => {
    if (!open) return;
    const onMove = () => place();
    // Scrolling the panel's own list doesn't move the trigger.
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      place();
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onScroll, true);
    // The trigger can change size while open (multi-select chips wrapping).
    const observer = triggerRef.current ? new ResizeObserver(onMove) : null;
    if (triggerRef.current) observer?.observe(triggerRef.current);
    return () => {
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onScroll, true);
      observer?.disconnect();
    };
  }, [open, place, triggerRef, panelRef]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      onOutsideClick();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, triggerRef, panelRef, onOutsideClick]);

  return { pos, place };
}

/** Shared look for Select and Combobox panels and options. */
export const PANEL_CLASS =
  'z-[3000] m-0 rounded-lg border border-ld-frost bg-white shadow-[0_12px_32px_-8px_rgba(39,40,53,0.22)] font-ld-sans';

/** Default trigger look when the caller doesn't pass its form's input class. */
export const TRIGGER_CLASS =
  'w-full min-h-[42px] px-3.5 py-2 rounded-lg border bg-white text-sm text-ld-onyx transition-colors focus:outline-none focus:border-ld-violet focus:ring-2 focus:ring-ld-lilac disabled:bg-ld-cloud disabled:text-ld-fog';
