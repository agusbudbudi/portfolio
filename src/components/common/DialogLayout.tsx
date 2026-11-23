import React from 'react';
import { DIALOG_BODY, DIALOG_FOOTER, DIALOG_HEADER } from '../../lib/dialogLayout';

// Layout primitives for drawers, sheets and modals (see lib/dialogLayout for
// the why). The panel must be a fixed-height flex column:
//
//   <div className="h-dvh flex flex-col ...">
//     <DialogHeader>…</DialogHeader>   pinned
//     <DialogBody>…</DialogBody>       the only part that scrolls
//     <DialogFooter>…</DialogFooter>   pinned
//   </div>

type DivProps = React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };

export const DialogHeader: React.FC<DivProps> = ({ className = '', ...rest }) => (
  <div className={`${DIALOG_HEADER} ${className}`} {...rest} />
);

export const DialogBody: React.FC<DivProps> = ({ className = '', ...rest }) => (
  <div className={`${DIALOG_BODY} ${className}`} {...rest} />
);

export const DialogFooter: React.FC<DivProps> = ({ className = '', ...rest }) => (
  <div className={`${DIALOG_FOOTER} ${className}`} {...rest} />
);
