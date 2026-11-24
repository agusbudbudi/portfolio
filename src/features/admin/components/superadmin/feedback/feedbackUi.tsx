import React from 'react';
import { FEEDBACK_TYPE_LABEL, type FeedbackQuestionType } from '../../../../../types/feedback';

export const TypeTag: React.FC<{ type: FeedbackQuestionType }> = ({ type }) => (
  <span className="inline-block px-1.5 py-0.5 rounded-md bg-ld-cloud text-[10px] font-semibold uppercase tracking-wide text-ld-slate whitespace-nowrap">
    {FEEDBACK_TYPE_LABEL[type]}
  </span>
);
