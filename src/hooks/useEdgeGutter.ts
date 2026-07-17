import { useEffect, useRef, useState } from 'react';

// Measures how far a normal-flow element sits from the viewport's left edge,
// so a full-bleed slider can pad its first card to align with the page's
// actual container gutter instead of guessing it via a hardcoded max-width calc.
export function useEdgeGutter<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [gutter, setGutter] = useState(16);

  useEffect(() => {
    const update = () => {
      if (ref.current) setGutter(ref.current.getBoundingClientRect().left);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return [ref, gutter] as const;
}
