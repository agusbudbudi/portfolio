import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { QaCourseDetail } from '../../../types/qaCourse';
import type { FeedbackAnswers, FeedbackResponseStatus } from '../../../types/feedback';
import FeedbackCheckpointModal from '../../feedback/FeedbackCheckpointModal';
import { activeCheckpoint, type Checkpoint, type Lesson } from '../lib/courseOutline';
import { readFeedbackDraft, readSnoozed, snoozeCheckpoint, writeFeedbackDraft } from '../lib/courseApi';

const SNOOZES_BEFORE_SKIP = 3;

interface Input {
  course: QaCourseDetail | null;
  lessons: Lesson[];
  checkpoints: Checkpoint[];
  loggedIn: boolean;
  progressLoaded: boolean;
  submitFeedback: (checkpointId: string, status: FeedbackResponseStatus, answers: FeedbackAnswers, durationMs?: number) => Promise<string | null>;
}

/** Heading + illustration for the popup's first screen, from where the checkpoint sits. */
function intro(cp: Checkpoint, lessons: Lesson[]): { title: string; variant: 'start' | 'module' | 'course' } {
  const prev = lessons[cp.lessonsBefore - 1];
  const nextInModule = lessons[cp.lessonsBefore]?.moduleIndex === cp.moduleIndex;
  if (!prev) return { title: 'Sebelum mulai', variant: 'start' };
  if (!lessons[cp.lessonsBefore]) return { title: 'Course selesai!', variant: 'course' };
  if (prev.moduleIndex < cp.moduleIndex || !nextInModule) return { title: `Modul ${prev.moduleIndex + 1} selesai!`, variant: 'module' };
  return { title: 'Bagian ini selesai!', variant: 'module' };
}

/**
 * Feedback checkpoint popup for any course page (article, mission, graduation).
 * Opens by itself for the checkpoint the learner just passed (see
 * activeCheckpoint), or on demand from the outline via `openCheckpoint`.
 */
export function useCheckpointPopup({ course, lessons, checkpoints, loggedIn, progressLoaded, submitFeedback }: Input) {
  const slug = course?.slug ?? '';
  // Session snoozes, re-read when the course changes.
  const [snoozeState, setSnoozeState] = useState<{ slug: string; ids: Set<string> } | null>(null);
  const snoozed = useMemo(
    () => (snoozeState?.slug === slug ? snoozeState.ids : slug ? readSnoozed(slug) : new Set<string>()),
    [snoozeState, slug],
  );
  // A checkpoint the learner opened (outline) or is answering; keeps the popup
  // up through the thank-you screen after the saved state would hide it.
  const [pinned, setPinned] = useState<{ id: string; manual: boolean } | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const auto = progressLoaded ? activeCheckpoint(checkpoints, { loggedIn, snoozed }) : undefined;
  const autoId = auto && !dismissed.has(auto.item.id) ? auto.item.id : null;
  const shownId = pinned?.id ?? autoId;
  const shown = shownId ? checkpoints.find((c) => c.item.id === shownId && c.flow) : undefined;

  const close = useCallback((id: string) => {
    setPinned(null);
    setDismissed((d) => new Set(d).add(id));
  }, []);

  const openCheckpoint = useCallback((id: string) => {
    if (!loggedIn) return;
    setPinned({ id, manual: true });
  }, [loggedIn]);

  const popup = (
    <AnimatePresence>
      {shown && shown.flow && course && (
        <FeedbackCheckpointModal
          key={shown.item.id}
          flow={shown.flow}
          contextLabel={`${course.title} · Modul ${shown.moduleIndex + 1}: ${shown.moduleTitle}`}
          introTitle={intro(shown, lessons).title}
          introVariant={intro(shown, lessons).variant}
          skipIntro={pinned?.manual}
          initialAnswers={readFeedbackDraft(slug, shown.item.id) ?? shown.state?.answers ?? {}}
          onAnswersChange={(answers) => writeFeedbackDraft(slug, shown.item.id, answers)}
          onSubmit={async (answers, durationMs) => {
            setPinned({ id: shown.item.id, manual: Boolean(pinned?.manual) });
            const error = await submitFeedback(shown.item.id, 'submitted', answers, durationMs);
            if (!error) writeFeedbackDraft(slug, shown.item.id, null);
            return error;
          }}
          onSnooze={() => {
            const id = shown.item.id;
            close(id);
            // Reopened from the outline: closing is not a snooze.
            if (pinned?.manual || shown.state) return;
            const count = snoozeCheckpoint(slug, id);
            setSnoozeState({ slug, ids: new Set(snoozed).add(id) });
            if (count >= SNOOZES_BEFORE_SKIP) void submitFeedback(id, 'skipped', {});
          }}
          onDontAsk={() => {
            const id = shown.item.id;
            close(id);
            void submitFeedback(id, 'skipped', {});
          }}
          onDone={() => close(shown.item.id)}
        />
      )}
    </AnimatePresence>
  );

  return { popup, openCheckpoint };
}
