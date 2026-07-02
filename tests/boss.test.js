import { describe, test, expect } from "vitest";
import { getWeekKey, getBossMaxHpForCycle, advanceBossWeek, rollBossLoot, openBossChest } from "@/lib/game/boss";
import { createInitialState, BOSS_MAX_HP } from "@/lib/game/constants";

const rngQueue = (...values) => {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
};

describe("getWeekKey", () => {
  test("same ISO week yields the same key regardless of weekday", () => {
    const base = new Date(Date.UTC(2026, 5, 29));
    const daysSinceMonday = (base.getUTCDay() || 7) - 1;
    const monday = new Date(base);
    monday.setUTCDate(base.getUTCDate() - daysSinceMonday);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    expect(getWeekKey(monday)).toBe(getWeekKey(sunday));
  });

  test("different weeks yield different keys", () => {
    const weekA = new Date(Date.UTC(2026, 5, 29));
    const weekB = new Date(Date.UTC(2026, 6, 6));
    expect(getWeekKey(weekA)).not.toBe(getWeekKey(weekB));
  });
});

describe("getBossMaxHpForCycle", () => {
  test("scales up per cycle, capped at BOSS_HP_SCALE_MAX_CYCLES", () => {
    expect(getBossMaxHpForCycle(0)).toBe(BOSS_MAX_HP);
    expect(getBossMaxHpForCycle(1)).toBe(BOSS_MAX_HP + 20);
    expect(getBossMaxHpForCycle(8)).toBe(BOSS_MAX_HP + 8 * 20);
    expect(getBossMaxHpForCycle(50)).toBe(getBossMaxHpForCycle(8)); // capped
  });
});

describe("advanceBossWeek", () => {
  test("spawns a fresh boss when there is no bossWeekId yet", () => {
    const state = { ...createInitialState({ name: "Hero" }), bossWeekId: null, bossCycleCount: 0 };
    const now = new Date(Date.UTC(2026, 5, 29));
    const { state: next, spawned } = advanceBossWeek(state, now);
    expect(spawned).toBe(true);
    expect(next.bossHp).toBe(BOSS_MAX_HP);
    expect(next.bossMaxHp).toBe(BOSS_MAX_HP);
    expect(next.bossCycleCount).toBe(1);
    expect(next.bossChestOpened).toBe(false);
    expect(next.bossDefeated).toBe(false);
  });

  test("does NOT respawn within the same week — HP persists", () => {
    const now = new Date(Date.UTC(2026, 5, 29));
    const weekId = getWeekKey(now);
    const state = { ...createInitialState({ name: "Hero" }), bossHp: 17, bossMaxHp: 120, bossWeekId: weekId, bossCycleCount: 2 };
    const { state: next, spawned } = advanceBossWeek(state, now);
    expect(spawned).toBe(false);
    expect(next).toBe(state); // untouched, same reference
    expect(next.bossHp).toBe(17);
  });

  test("respawns harder on a new week", () => {
    const state = { ...createInitialState({ name: "Hero" }), bossHp: 0, bossDefeated: true, bossWeekId: "2026-W1", bossCycleCount: 1 };
    const nextWeek = new Date(Date.UTC(2026, 5, 29));
    const { state: next, spawned } = advanceBossWeek(state, nextWeek);
    expect(spawned).toBe(true);
    expect(next.bossCycleCount).toBe(2);
    expect(next.bossMaxHp).toBe(BOSS_MAX_HP + 20);
    expect(next.bossHp).toBe(BOSS_MAX_HP + 20);
    expect(next.bossDefeated).toBe(false);
  });
});

describe("rollBossLoot", () => {
  test("rolls coins within the generous boss range", () => {
    const loot = rollBossLoot(rngQueue(0, 0.99));
    expect(loot.coins).toBeGreaterThanOrEqual(40);
    expect(loot.coins).toBeLessThanOrEqual(80);
  });

  test("low roll grants a dragon egg", () => {
    const loot = rollBossLoot(rngQueue(0.5, 0.05));
    expect(loot.egg).toBe("dragon");
  });

  test("high roll grants no egg", () => {
    const loot = rollBossLoot(rngQueue(0.5, 0.95));
    expect(loot.egg).toBeNull();
  });
});

describe("openBossChest", () => {
  test("fails if boss not defeated", () => {
    const state = { ...createInitialState({ name: "Hero" }), bossDefeated: false };
    const { result } = openBossChest(state);
    expect(result.success).toBe(false);
    expect(result.error).toBe("BOSS_NOT_DEFEATED");
  });

  test("fails if chest already opened this cycle", () => {
    const state = { ...createInitialState({ name: "Hero" }), bossDefeated: true, bossChestOpened: true };
    const { result } = openBossChest(state);
    expect(result.success).toBe(false);
    expect(result.error).toBe("CHEST_ALREADY_OPENED");
  });

  test("credits real loot and locks the chest", () => {
    const state = { ...createInitialState({ name: "Hero" }), bossDefeated: true, bossChestOpened: false, heroCoins: 0 };
    const { state: next, result } = openBossChest(state, rngQueue(0.5, 0.05));
    expect(result.success).toBe(true);
    expect(next.heroCoins).toBe(result.loot.coins);
    expect(next.bossChestOpened).toBe(true);
    expect(next.inventory.eggs.dragon).toBe(state.inventory.eggs.dragon + 1);
  });
});
