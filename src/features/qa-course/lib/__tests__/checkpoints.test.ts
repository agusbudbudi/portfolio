import { describe, expect, it } from 'vitest';
import { activeCheckpoint, buildCheckpoints, buildLessons, courseCompletion } from '../courseOutline';
import type { FeedbackCheckpointState, FeedbackFlowPublic } from '../../../../types/feedback';
import { course, progress, project } from './fixtures';

const flow: FeedbackFlowPublic = { id: 'f1', title: 'Feedback modul', questions: [] };

/** Course with a checkpoint in the middle of module 1 (cpA) and at the end of it (cpB). */
function withCheckpoints() {
  const c = course({ feedbackFlows: { f1: flow } });
  c.modules[0].items.splice(2, 0, { id: 'cpA', kind: 'feedback', flowId: 'f1' });
  c.modules[0].items.push({ id: 'cpB', kind: 'feedback', flowId: 'f1' });
  return c;
}

const setup = (opts: { done?: string[]; submitted?: string[]; feedback?: Record<string, FeedbackCheckpointState>; c?: ReturnType<typeof course> } = {}) => {
  const c = opts.c ?? withCheckpoints();
  const lessons = buildLessons({
    course: c,
    projects: { splitbill: project },
    simulatorProgress: { splitbill: progress(...(opts.submitted ?? [])) },
    completedArticleIds: new Set(opts.done ?? []),
    loggedIn: true,
  });
  return { lessons, checkpoints: buildCheckpoints(c, lessons, opts.feedback ?? {}) };
};

const none = new Set<string>();
const submitted: FeedbackCheckpointState = { status: 'submitted', answers: {}, updatedAt: '' };

describe('checkpoints are not lessons', () => {
  it('leaves checkpoints out of lessons, numbering and completion', () => {
    const { lessons, checkpoints } = setup();
    expect(lessons.map((l) => l.item.id)).toEqual(['i1', 'i2', 'i3', 'i4', 'i5']);
    expect(lessons.map((l) => l.index)).toEqual([0, 1, 2, 3, 4]);
    expect(courseCompletion(lessons).total).toBe(5);
    expect(checkpoints.map((c) => [c.item.id, c.lessonsBefore])).toEqual([['cpA', 2], ['cpB', 3]]);
  });

  it('never locks the next lesson', () => {
    const { lessons } = setup({ done: ['art1', 'art2'] });
    expect(lessons[2].lock).toBeNull();
    expect(lessons[2].isNext).toBe(true);
  });
});

describe('activeCheckpoint', () => {
  it('is nothing until the lessons before a checkpoint are done', () => {
    const { checkpoints } = setup({ done: ['art1'] });
    expect(activeCheckpoint(checkpoints, { loggedIn: true, snoozed: none })).toBeUndefined();
  });

  it('asks about the checkpoint just passed', () => {
    const { checkpoints } = setup({ done: ['art1', 'art2'] });
    expect(activeCheckpoint(checkpoints, { loggedIn: true, snoozed: none })?.item.id).toBe('cpA');
  });

  it('only asks about the latest reached checkpoint, never a backlog', () => {
    const { checkpoints } = setup({ done: ['art1', 'art2'], submitted: ['a1', 'a2'] });
    expect(activeCheckpoint(checkpoints, { loggedIn: true, snoozed: none })?.item.id).toBe('cpB');
  });

  it('stays quiet when the latest one is answered, skipped or snoozed, or for guests', () => {
    const base = { done: ['art1', 'art2'], submitted: ['a1', 'a2'] };
    expect(activeCheckpoint(setup({ ...base, feedback: { cpB: submitted } }).checkpoints, { loggedIn: true, snoozed: none })).toBeUndefined();
    expect(activeCheckpoint(setup(base).checkpoints, { loggedIn: true, snoozed: new Set(['cpB']) })).toBeUndefined();
    expect(activeCheckpoint(setup(base).checkpoints, { loggedIn: false, snoozed: none })).toBeUndefined();
  });

  it('skips checkpoints whose flow is a draft or deleted', () => {
    const c = withCheckpoints();
    c.feedbackFlows = {};
    const { checkpoints } = setup({ c, done: ['art1', 'art2'] });
    expect(activeCheckpoint(checkpoints, { loggedIn: true, snoozed: none })).toBeUndefined();
  });

  it('treats a checkpoint at the very start as reached right away', () => {
    const c = course({ feedbackFlows: { f1: flow } });
    c.modules[0].items.unshift({ id: 'cp0', kind: 'feedback', flowId: 'f1' });
    const { checkpoints } = setup({ c });
    expect(activeCheckpoint(checkpoints, { loggedIn: true, snoozed: none })?.item.id).toBe('cp0');
  });
});
