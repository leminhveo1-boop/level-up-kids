/**
 * State migration / self-healing when loading a saved game state
 * (from localStorage or cloud). Pure function.
 */

import {
  createInitialState,
  DEFAULT_TASKS,
  DEFAULT_REWARDS,
  DEFAULT_PARENT_CONFIG,
  DEFAULT_INVENTORY,
  DEFAULT_STATS,
  STARTING_ENERGY,
  BOSS_MAX_HP,
} from "./constants";

/**
 * Rewrite duplicated ids (bug: same-millisecond batch inserts shared Date.now() ids).
 * Keeps the first occurrence, re-ids the rest.
 * @param {Array<{id: string}>} items
 */
function dedupeIds(items) {
  const seen = new Set();
  return items.map((item, index) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      return item;
    }
    const newId = `${item.id}_fix${index}`;
    seen.add(newId);
    return { ...item, id: newId };
  });
}

/**
 * Normalize any historical saved shape into the current full state shape.
 * @param {object|null|undefined} data raw parsed state
 * @returns {object} valid full game state
 */
export function migrateState(data) {
  if (!data || typeof data !== "object") return createInitialState();

  // Legacy: task.gold → task.energy
  let tasks = Array.isArray(data.tasks) ? data.tasks : DEFAULT_TASKS;
  tasks = tasks.map((t) => {
    const next = { ...t };
    if (next.energy === undefined) {
      next.energy = next.gold !== undefined && next.gold > 0 ? next.gold * 5 : next.exp || 15;
    }
    // P0: verification type defaults to trust for legacy tasks
    if (!next.verifyType) next.verifyType = "trust";
    // P0: tasks completed before escrow existed were paid instantly → treat as approved
    if (next.completed && !next.approval) {
      next.approval = "auto";
      if (next.earnedPoints === undefined) next.earnedPoints = next.points ?? next.exp ?? 0;
    }
    return next;
  });
  tasks = dedupeIds(tasks);

  // Legacy: reward currency gold → heroCoins/points
  let rewards = Array.isArray(data.rewards) ? data.rewards : DEFAULT_REWARDS;
  rewards = rewards.map((r) => {
    if (r.currency === "gold" || r.currency === undefined) {
      const isBigReward =
        ["r5", "r6", "r7", "r8"].some((p) => String(r.id).startsWith(p)) || r.cost > 100;
      return { ...r, currency: isBigReward ? "heroCoins" : "points" };
    }
    return { ...r };
  });
  rewards = dedupeIds(rewards);

  // Legacy: gold wallet → heroCoins
  const heroCoins = data.heroCoins !== undefined ? data.heroCoins : data.gold || 0;

  return {
    charName: data.charName || "",
    charClass: data.charClass || "Warrior",
    level: data.level || 1,
    exp: data.exp || 0,
    streak: data.streak || 0,
    streakFreezes: data.streakFreezes !== undefined ? data.streakFreezes : 1,
    trustScore: data.trustScore !== undefined ? data.trustScore : 50,
    approvalNudges: data.approvalNudges || [],
    energy: data.energy !== undefined && data.energy > 0 ? data.energy : STARTING_ENERGY,
    stats: data.stats || { ...DEFAULT_STATS },
    tasks,
    rewards,
    bossHp: data.bossHp !== undefined ? data.bossHp : BOSS_MAX_HP,
    bossName: data.bossName || "Thần Lười Biếng 😴",
    bossDefeated: data.bossDefeated || false,
    screenTimeLeft: data.screenTimeLeft || 0,
    isTimerActive: data.isTimerActive || false,
    timerEndTime: data.timerEndTime || 0,
    parentPin: data.parentPin || "1234",
    encouragements: data.encouragements || [],
    lastResetDate: data.lastResetDate || "",
    heroCoins,
    points: data.points || 0,
    lastPointsGain: null,
    miningHistory: data.miningHistory || [],
    inventory: data.inventory || {
      eggs: { ...DEFAULT_INVENTORY.eggs },
      potions: { ...DEFAULT_INVENTORY.potions },
      foods: { ...DEFAULT_INVENTORY.foods },
    },
    pets: data.pets || [],
    activePet: data.activePet !== undefined ? data.activePet : null,
    activeMount: data.activeMount !== undefined ? data.activeMount : null,
    parentConfig: data.parentConfig || { ...DEFAULT_PARENT_CONFIG },
    screenMinutesUsedToday: data.screenMinutesUsedToday || 0,
    screenRedeemsThisWeek: data.screenRedeemsThisWeek || 0,
    cosmetics: data.cosmetics || { owned: [], equipped: { hat: null, frame: null, petAccessory: null } },
    savedAt: data.savedAt || 0,
  };
}
