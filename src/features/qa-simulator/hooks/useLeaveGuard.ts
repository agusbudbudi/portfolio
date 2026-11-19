import { useEffect } from 'react';

/**
 * Ask the browser to confirm closing/reloading the tab while `when` is true.
 * Only use it for real data-loss risk: typed answers are already written to
 * localStorage on every keystroke, so a guard there would just nag. Browsers
 * show their own generic message; custom text is ignored.
 */
export function useLeaveGuard(when: boolean) {
  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Legacy browsers need returnValue set to trigger the prompt.
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);
}
