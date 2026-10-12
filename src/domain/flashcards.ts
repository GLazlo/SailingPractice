/** Leitner boxes: a card moves up one box when known and back to 0 when missed. */
export type Progress = Record<string, number>;

export const MAX_BOX = 4;
/** Three correct answers in a row count as learned. */
export const LEARNED_BOX = 3;

export function boxOf(progress: Progress, id: string): number {
  const box = progress[id];
  return typeof box === "number" && box >= 0 ? Math.min(box, MAX_BOX) : 0;
}

export function grade(progress: Progress, id: string, knew: boolean): Progress {
  return { ...progress, [id]: knew ? Math.min(boxOf(progress, id) + 1, MAX_BOX) : 0 };
}

/**
 * Picks the next card, favouring low boxes: each box down doubles the chance.
 * The card just shown is skipped so the same one never comes twice in a row.
 */
export function pickNext(
  ids: string[],
  progress: Progress,
  previousId: string | null,
  random: () => number = Math.random
): string | null {
  const pool = ids.length > 1 ? ids.filter((id) => id !== previousId) : ids;
  if (pool.length === 0) return null;

  const weights = pool.map((id) => 2 ** (MAX_BOX - boxOf(progress, id)));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = random() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll < 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function countLearned(ids: string[], progress: Progress): number {
  return ids.filter((id) => boxOf(progress, id) >= LEARNED_BOX).length;
}
