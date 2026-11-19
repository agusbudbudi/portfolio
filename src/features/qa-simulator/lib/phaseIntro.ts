// Brief messages are authored as one markdown string; blank lines separate
// chat bubbles (a list stays in one bubble since its lines are single-spaced).
export function splitBriefBubbles(message: string): string[] {
  return message.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
}

const introKey = (projectId: string, phaseId: string) => `qa-sim-intro:${projectId}:${phaseId}`;

export function hasSeenPhaseIntro(projectId: string, phaseId: string): boolean {
  try { return localStorage.getItem(introKey(projectId, phaseId)) === '1'; } catch { return true; }
}

export function markPhaseIntroSeen(projectId: string, phaseId: string): void {
  try { localStorage.setItem(introKey(projectId, phaseId), '1'); } catch { /* storage blocked — just show again next time */ }
}
