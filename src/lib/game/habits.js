/**
 * D4 "Chia nhỏ việc hay bỏ" — Fogg Behavior Model (make it tiny to rebuild momentum).
 * When a task keeps getting missed, we suggest a smaller version instead of letting
 * the child give up on the whole thing. PURE functions (no React).
 */

// A task missed this many days in a row becomes an "at-risk" suggestion.
export const HABIT_MISS_THRESHOLD = 3;

/**
 * Tasks the child keeps missing — candidates for a gentle "make it smaller" nudge.
 * Excludes tasks that are already a tiny/split version (no recursive shrinking).
 * @param {Array} tasks
 * @param {number} [threshold]
 */
export function getAtRiskTasks(tasks, threshold = HABIT_MISS_THRESHOLD) {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((t) => !t.tiny && (t.missStreak || 0) >= threshold);
}

const half = (n, min = 1) => Math.max(min, Math.floor((Number(n) || 0) / 2));

/**
 * Build a smaller, easier spec from a task the child keeps missing.
 * Halves the targets, drops verification friction (→ trust), never mandatory.
 * @param {object} task
 * @returns {{ title: string, exp: number, points: number, energy: number,
 *             category: string, verifyType: string, durationMin: number|undefined,
 *             isMandatory: boolean, tiny: boolean }}
 */
export function buildTinyTask(task) {
  const cleanTitle = String(task.title || "").replace(/^🐣\s*/, "").slice(0, 30);
  return {
    title: `🐣 ${cleanTitle} (bản nhỏ)`,
    exp: half(task.exp, 2),
    points: half(task.points ?? task.exp, 1),
    energy: half(task.energy, 1),
    category: task.category || "discipline",
    verifyType: "trust", // easiest path — remove focus/parent friction for the tiny habit
    durationMin: task.durationMin ? half(task.durationMin, 5) : undefined,
    isMandatory: false,
    tiny: true,
  };
}
