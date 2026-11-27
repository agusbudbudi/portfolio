/** Smooth-scrolls to an element id, honouring prefers-reduced-motion. */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(window.history.state, '', `#${id}`); // keep the router's state
}
