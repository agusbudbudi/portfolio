// Class sets for drawers, sheets and modals whose panel is a flex column with a
// fixed height (h-full / h-dvh / max-h-*). Only the body scrolls; header and
// footer stay pinned. Use these on existing <div>s, or the DialogHeader /
// DialogBody / DialogFooter components in components/common/DialogLayout.
//
// Why both shrink-0 and min-h-0: a flex item's default min-height is its
// content height, so without min-h-0 a long body grows past the panel instead
// of scrolling, which squashes the header and pushes the footer off screen.
// overscroll-contain stops the page behind from scrolling at the body's ends.

export const DIALOG_HEADER = 'shrink-0';
export const DIALOG_BODY = 'flex-1 min-h-0 overflow-y-auto overscroll-contain';
export const DIALOG_FOOTER = 'shrink-0';
