import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { PANEL_CLASS, useAnchoredPanel } from './useAnchoredPanel';

// Brand-styled replacement for native <select> (docs/DESIGN.md palette:
// white panel, Frost border, 8px radius, slate-tinted shadow, Sky Blue for
// the selected option). Accessible listbox pattern: button trigger with
// aria-haspopup/aria-expanded, role="listbox" + role="option",
// aria-activedescendant for the keyboard highlight.
//
// Keyboard: ↑/↓ open + move, Home/End, Enter/Space choose, Esc/Tab close,
// typing jumps to the first option starting with that letter.
// The panel is portalled to <body> with fixed positioning so it isn't
// clipped by modals or scroll containers, and flips upward when there's
// no room below.

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Shown when `value` matches no option. */
  placeholder?: string;
  /** Classes for the trigger — pass the same input class the form uses so heights/borders match. */
  className?: string;
  id?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
}

const PANEL_MAX_H = 240;

const Select: React.FC<SelectProps> = ({
  value, onChange, options, placeholder = 'Pilih…', className = '', id, disabled = false,
  'aria-label': ariaLabel, 'aria-invalid': ariaInvalid,
}) => {
  const autoId = useId();
  const triggerId = id ?? `select-${autoId}`;
  const listId = `${triggerId}-list`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const typeahead = useRef({ text: '', at: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const closeQuietly = useCallback(() => setOpen(false), []);
  const { pos, place } = useAnchoredPanel({
    open,
    triggerRef,
    panelRef: listRef,
    panelHeight: Math.min(PANEL_MAX_H, options.length * 36 + 8),
    onOutsideClick: closeQuietly,
  });

  const openList = (at = selectedIndex >= 0 ? selectedIndex : 0) => {
    if (disabled) return;
    place();
    setActive(at);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const choose = (i: number) => {
    const opt = options[i];
    if (opt) onChange(opt.value);
    close();
  };

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const jumpTo = (key: string) => {
    const now = Date.now();
    const t = typeahead.current;
    t.text = now - t.at > 600 ? key : t.text + key;
    t.at = now;
    const q = t.text.toLowerCase();
    const start = open ? active + 1 : selectedIndex + 1;
    const order = [...options.keys()].map((k) => (k + Math.max(start, 0)) % options.length);
    const hit = order.find((i) => options[i].label.toLowerCase().startsWith(q));
    if (hit === undefined) return;
    if (open) setActive(hit);
    else onChange(options[hit].value);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.min(options.length - 1, a + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) openList();
        else setActive((a) => Math.max(0, a - 1));
        break;
      case 'Home':
        if (open) { e.preventDefault(); setActive(0); }
        break;
      case 'End':
        if (open) { e.preventDefault(); setActive(options.length - 1); }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open) choose(active);
        else openList();
        break;
      case 'Escape':
        if (open) { e.preventDefault(); close(); }
        break;
      case 'Tab':
        if (open) close(false);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) jumpTo(e.key);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid}
        disabled={disabled}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`${className} inline-flex items-center justify-between gap-2 text-left cursor-pointer disabled:cursor-not-allowed`}
      >
        <span className={`min-w-0 truncate ${selected ? '' : 'text-ld-fog'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 text-ld-fog transition-transform duration-200 ${open ? 'rotate-180 text-ld-violet' : ''}`} aria-hidden="true" />
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={triggerId}
            tabIndex={-1}
            style={{ position: 'fixed', left: pos.left, width: Math.max(pos.width, 160), top: pos.top, bottom: pos.bottom, maxHeight: PANEL_MAX_H }}
            className={`${PANEL_CLASS} p-1 list-none overflow-auto`}
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              const isActive = i === active;
              return (
                <li
                  key={`${o.value}-${i}`}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm cursor-pointer select-none ${
                    isActive ? 'bg-ld-lilac' : ''
                  } ${isSelected ? 'text-ld-violet font-medium' : 'text-ld-graphite'}`}
                >
                  <span className="min-w-0 truncate">{o.label}</span>
                  {isSelected && <Check size={14} className="shrink-0 text-ld-violet" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
};

export default Select;
