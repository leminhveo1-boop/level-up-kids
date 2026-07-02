/**
 * D5 "Cây Thế Giới" — the family's shared World Tree (Octalysis CD1: Epic Meaning).
 * Every approved task drips a bit of "sap" into the tree, growing it through stages.
 * PURE functions: stage math derives entirely from a single cumulative growth number.
 * Stage NAMES live in i18n (game.tree.stage.N) — these functions return an index/emoji only.
 */

// Cumulative growth needed to REACH each stage (index 0 = seed, always reached).
export const TREE_STAGE_THRESHOLDS = [0, 20, 60, 150, 350, 700, 1500];
export const TREE_MAX_STAGE = TREE_STAGE_THRESHOLDS.length - 1;
export const TREE_STAGE_EMOJI = ["🌰", "🌱", "🌿", "🪴", "🌳", "🌲", "🌍"];

/** +1 sap per task that gets its points released (approved / auto / instant). */
export const TREE_GROWTH_PER_APPROVAL = 1;

/**
 * Derive the tree's visual state from cumulative growth.
 * @param {number} growth cumulative sap
 * @returns {{ stageIndex: number, emoji: string, isMax: boolean,
 *             current: number, forNext: number|null, intoStage: number, progressPct: number }}
 */
export function getTreeState(growth) {
  const current = Number.isFinite(growth) && growth > 0 ? Math.floor(growth) : 0;

  let stageIndex = 0;
  for (let i = TREE_MAX_STAGE; i >= 0; i--) {
    if (current >= TREE_STAGE_THRESHOLDS[i]) {
      stageIndex = i;
      break;
    }
  }

  const isMax = stageIndex >= TREE_MAX_STAGE;
  const stageStart = TREE_STAGE_THRESHOLDS[stageIndex];
  const forNext = isMax ? null : TREE_STAGE_THRESHOLDS[stageIndex + 1];
  const intoStage = current - stageStart;
  const progressPct = isMax ? 100 : Math.round((intoStage / (forNext - stageStart)) * 100);

  return {
    stageIndex,
    emoji: TREE_STAGE_EMOJI[stageIndex],
    isMax,
    current,
    forNext,
    intoStage,
    progressPct,
  };
}
