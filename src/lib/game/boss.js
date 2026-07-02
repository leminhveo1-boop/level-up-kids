/**
 * Weekly boss — PURE functions (no React, no side effects).
 * D2: turns "Boss tuần" into a real weekly event: HP persists across days,
 * scales up each week, and defeating it unlocks a real loot chest.
 */

import { BOSS_MAX_HP, BOSS_HP_SCALE_PER_CYCLE, BOSS_HP_SCALE_MAX_CYCLES, BOSS_LOOT_COIN_MIN, BOSS_LOOT_COIN_MAX } from "./constants";

const BOSS_NAMES = [
  "Thần Lười Biếng 😴",
  "Chúa Tể Bừa Bộn 🌪️",
  "Ác Quỷ Trì Hoãn ⏳",
  "Bóng Ma Cãi Lời 👻",
  "Yêu Tinh Ham Chơi 🎮",
];

/** ISO-ish week key so a boss cycle spans Mon–Sun regardless of year edge cases. */
export function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Monday=1 .. Sunday=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

/** Max HP for a given cycle count (0 = first boss ever). */
export function getBossMaxHpForCycle(cycleCount) {
  const cappedCycles = Math.min(cycleCount, BOSS_HP_SCALE_MAX_CYCLES);
  return BOSS_MAX_HP + cappedCycles * BOSS_HP_SCALE_PER_CYCLE;
}

/**
 * If the calendar week changed since the boss last spawned, respawn a fresh
 * (harder) boss and re-lock the chest. Otherwise leaves boss fields untouched
 * so HP genuinely persists across days within the same week.
 */
export function advanceBossWeek(state, now = new Date()) {
  const currentWeek = getWeekKey(now);
  if (state.bossWeekId === currentWeek) return { state, spawned: false };

  const nextCycle = (state.bossCycleCount || 0) + 1;
  const maxHp = getBossMaxHpForCycle(nextCycle - 1);

  return {
    state: {
      ...state,
      bossWeekId: currentWeek,
      bossCycleCount: nextCycle,
      bossMaxHp: maxHp,
      bossHp: maxHp,
      bossDefeated: false,
      bossChestOpened: false,
      bossName: BOSS_NAMES[(nextCycle - 1) % BOSS_NAMES.length],
    },
    spawned: true,
  };
}

/** Roll the loot for a defeated boss's chest — deliberately more generous than mining. */
export function rollBossLoot(rng = Math.random) {
  const coins = BOSS_LOOT_COIN_MIN + Math.floor(rng() * (BOSS_LOOT_COIN_MAX - BOSS_LOOT_COIN_MIN + 1));

  const eggRoll = rng();
  let egg = null;
  if (eggRoll < 0.15) egg = "dragon";
  else if (eggRoll < 0.4) egg = "wolf";
  else if (eggRoll < 0.7) egg = "base";

  return { coins, egg };
}

/**
 * Open the boss's treasure chest once per cycle — credits real loot instead
 * of a static alert().
 * @returns {{ state: object, result: { success: boolean, error?: string, loot?: object } }}
 */
export function openBossChest(state, rng = Math.random) {
  if (!state.bossDefeated) return { state, result: { success: false, error: "BOSS_NOT_DEFEATED" } };
  if (state.bossChestOpened) return { state, result: { success: false, error: "CHEST_ALREADY_OPENED" } };

  const loot = rollBossLoot(rng);
  const maxCoins = state.parentConfig?.maxCoinBalance ?? 7000;
  const inventory = loot.egg
    ? { ...state.inventory, eggs: { ...state.inventory.eggs, [loot.egg]: (state.inventory.eggs[loot.egg] || 0) + 1 } }
    : state.inventory;

  return {
    state: {
      ...state,
      heroCoins: Math.min(maxCoins, state.heroCoins + loot.coins),
      inventory,
      bossChestOpened: true,
    },
    result: { success: true, loot },
  };
}
