import { describe, test, expect } from "vitest";
import {
  completeTask,
  uncompleteTask,
  mineTreasure,
  claimReward,
  resetDailyTasks,
  applyExpGain,
  getStreakMultiplier,
} from "@/lib/game/economy";
import { createInitialState, ENERGY_CAP } from "@/lib/game/constants";

/** rng stub returning values from a queue (falls back to last value) */
const rngQueue = (...values) => {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
};

const freshState = (overrides = {}) => ({
  ...createInitialState({ name: "Test Hero", charClass: "Warrior" }),
  ...overrides,
});

describe("applyExpGain (multi-level up)", () => {
  test("levels up once when exp crosses threshold", () => {
    // Arrange: level 1 needs 100 exp
    // Act
    const result = applyExpGain(1, 90, 20);
    // Assert
    expect(result.level).toBe(2);
    expect(result.exp).toBe(10);
    expect(result.levelsGained).toBe(1);
  });

  test("levels up MULTIPLE times on one big gain (bug fix)", () => {
    // level 1 → needs 100; level 2 → needs 200. Gain 350 from 0:
    const result = applyExpGain(1, 0, 350);
    expect(result.level).toBe(3);
    expect(result.exp).toBe(50);
    expect(result.levelsGained).toBe(2);
  });

  test("no level up below threshold", () => {
    const result = applyExpGain(1, 0, 99);
    expect(result.level).toBe(1);
    expect(result.exp).toBe(99);
    expect(result.levelsGained).toBe(0);
  });
});

describe("getStreakMultiplier", () => {
  test.each([
    [0, 1.0],
    [2, 1.0],
    [3, 1.1],
    [5, 1.25],
    [7, 1.5],
    [30, 1.5],
  ])("streak %i → x%f", (streak, expected) => {
    expect(getStreakMultiplier(streak)).toBe(expected);
  });
});

describe("completeTask", () => {
  test("adds exp, points, energy, stats and marks completed (no crit)", () => {
    // Arrange
    const state = freshState();
    const task = state.tasks[0]; // t1: exp 10, points 5, energy 2, discipline +1

    // Act — rng 0.99 ⇒ no crit
    const { state: next, events } = completeTask(state, task.id, rngQueue(0.99));

    // Assert
    const done = next.tasks.find((t) => t.id === task.id);
    expect(done.completed).toBe(true);
    expect(next.exp).toBe(10);
    expect(next.points).toBe(5);
    expect(next.energy).toBe(state.energy + 2);
    expect(next.stats.discipline).toBe(state.stats.discipline + 1);
    expect(events.isCritical).toBe(false);
    // immutability
    expect(state.tasks[0].completed).toBe(false);
    expect(state.points).toBe(0);
  });

  test("critical hit doubles base points", () => {
    const state = freshState();
    const task = state.tasks[0]; // points 5
    const { state: next, events } = completeTask(state, task.id, rngQueue(0.01));
    expect(events.isCritical).toBe(true);
    expect(next.points).toBe(10);
  });

  test("streak multiplier applies with ceil", () => {
    const state = freshState({ streak: 7 }); // x1.5
    const task = state.tasks[0]; // points 5 → ceil(7.5)=8
    const { state: next } = completeTask(state, task.id, rngQueue(0.99));
    expect(next.points).toBe(8);
  });

  test("energy is capped at 100", () => {
    const state = freshState({ energy: 99 });
    const task = state.tasks[4]; // t5 energy 5
    const { state: next } = completeTask(state, task.id, rngQueue(0.99));
    expect(next.energy).toBe(ENERGY_CAP);
  });

  test("mount adds 10% energy (ceil)", () => {
    const pet = { id: "pet_1", isMount: true };
    const state = freshState({ pets: [pet], activeMount: "pet_1", energy: 0 });
    const task = state.tasks[0]; // energy 2 → ceil(2.2)=3
    const { state: next } = completeTask(state, task.id, rngQueue(0.99));
    expect(next.energy).toBe(3);
  });

  test("boss takes ceil(exp/3) damage and can be defeated", () => {
    const state = freshState({ bossHp: 4 });
    const task = state.tasks[9]; // t10 exp 30 → damage 10
    const { state: next, events } = completeTask(state, task.id, rngQueue(0.99));
    expect(next.bossHp).toBe(0);
    expect(next.bossDefeated).toBe(true);
    expect(events.bossDefeated).toBe(true);
  });

  test("completing an already-completed task is a no-op", () => {
    const state = freshState();
    const { state: s1 } = completeTask(state, "t1", rngQueue(0.99));
    const { state: s2, events } = completeTask(s1, "t1", rngQueue(0.99));
    expect(s2).toBe(s1);
    expect(events).toBeNull();
  });
});

describe("uncompleteTask", () => {
  test("reverts exactly the earned points/energy (crit-safe)", () => {
    // Arrange: crit completion earns double
    const state = freshState();
    const { state: completed } = completeTask(state, "t1", rngQueue(0.01)); // crit → 10 points
    expect(completed.points).toBe(10);

    // Act
    const { state: reverted } = uncompleteTask(completed, "t1");

    // Assert — back to zero, not negative / not -5
    expect(reverted.points).toBe(0);
    expect(reverted.energy).toBe(state.energy);
    expect(reverted.exp).toBe(0);
    expect(reverted.tasks.find((t) => t.id === "t1").completed).toBe(false);
    expect(reverted.stats.discipline).toBe(state.stats.discipline);
  });

  test("stats never drop below 10 on revert", () => {
    const state = freshState({ stats: { ...freshState().stats, discipline: 10 } });
    const { state: completed } = completeTask(state, "t1", rngQueue(0.99));
    const { state: reverted } = uncompleteTask(completed, "t1");
    expect(reverted.stats.discipline).toBeGreaterThanOrEqual(10);
  });
});

describe("mineTreasure", () => {
  test("fails with no energy", () => {
    const state = freshState({ energy: 0 });
    const { state: next, result } = mineTreasure(state, rngQueue(0.5));
    expect(result.success).toBe(false);
    expect(result.error).toBe("NO_ENERGY");
    expect(next.energy).toBe(0);
  });

  test("consumes 1 energy and yields common coin on high rolls", () => {
    const state = freshState({ energy: 10 });
    // rng: crit-check unused (no buffs), material 0.99 (no material), loot 0.99 (common)
    const { state: next, result } = mineTreasure(state, rngQueue(0.99));
    expect(next.energy).toBe(9);
    expect(result.success).toBe(true);
    expect(result.lootType).toBe("common");
    expect(result.coinReward).toBe(1);
    expect(next.heroCoins).toBe(1);
    expect(next.miningHistory).toHaveLength(1);
  });

  test("legendary drop grants 8-15 coins", () => {
    const state = freshState({ energy: 10 });
    // material roll 0.99 → coins; loot rand 0.001 < legendaryChance 0.02; coin rng 0 → 8
    const { result } = mineTreasure(state, rngQueue(0.99, 0.001, 0));
    expect(result.lootType).toBe("legendary");
    expect(result.coinReward).toBe(8);
  });

  test("hero coins respect parent maxCoinBalance cap", () => {
    const state = freshState({
      energy: 10,
      heroCoins: 7000,
      parentConfig: { ...freshState().parentConfig, maxCoinBalance: 7000 },
    });
    const { state: next } = mineTreasure(state, rngQueue(0.99));
    expect(next.heroCoins).toBe(7000);
  });

  test("material drop adds inventory instead of coins", () => {
    const state = freshState({ energy: 10 });
    // material roll 0.01 < 0.15 → material; materialRand 0.1 < 0.46 → food; food index rng 0 → meat
    const { state: next, result } = mineTreasure(state, rngQueue(0.01, 0.1, 0));
    expect(result.isMaterial).toBe(true);
    expect(next.inventory.foods.meat).toBe(1);
    expect(next.heroCoins).toBe(0);
  });

  test("mining history is capped at 15 records", () => {
    let state = freshState({ energy: 50 });
    for (let i = 0; i < 20; i++) {
      state = mineTreasure(state, rngQueue(0.99)).state;
    }
    expect(state.miningHistory).toHaveLength(15);
  });
});

describe("claimReward", () => {
  const completeAllMandatory = (state) => {
    let s = state;
    for (const t of state.tasks.filter((t) => t.isMandatory)) {
      s = completeTask(s, t.id, rngQueue(0.99)).state;
    }
    return s;
  };

  test("blocks when mandatory tasks incomplete", () => {
    const state = freshState({ points: 1000 });
    const { result } = claimReward(state, "r1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("MANDATORY_TASKS_INCOMPLETE");
  });

  test("blocks when not enough points", () => {
    const state = completeAllMandatory(freshState());
    const poor = { ...state, points: 0 };
    const { result } = claimReward(poor, "r1"); // cost 40
    expect(result.success).toBe(false);
    expect(result.error).toBe("NOT_ENOUGH_POINTS");
    expect(result.shortage).toBe(40);
  });

  test("game_time reward deducts points, starts timer, tracks limits", () => {
    const state = { ...completeAllMandatory(freshState()), points: 100 };
    const { state: next, result } = claimReward(state, "r1"); // 20 min, cost 40
    expect(result.success).toBe(true);
    expect(next.points).toBe(60);
    expect(next.isTimerActive).toBe(true);
    expect(next.screenTimeLeft).toBe(20 * 60);
    expect(next.screenMinutesUsedToday).toBe(20);
    expect(next.screenRedeemsThisWeek).toBe(1);
  });

  test("enforces daily screen-time cap", () => {
    const base = completeAllMandatory(freshState());
    const state = { ...base, points: 1000, screenMinutesUsedToday: 50 }; // cap 60, +20 → block
    const { result } = claimReward(state, "r1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("SCREEN_DAILY_LIMIT");
  });

  test("enforces weekly redeem cap", () => {
    const base = completeAllMandatory(freshState());
    const state = { ...base, points: 1000, screenRedeemsThisWeek: 5 };
    const { result } = claimReward(state, "r1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("SCREEN_WEEKLY_LIMIT");
  });

  test("heroCoins reward deducts coins and adds pet egg", () => {
    const base = completeAllMandatory(freshState());
    const state = { ...base, heroCoins: 100 };
    const { state: next, result } = claimReward(state, "rp1"); // base egg, 30 coins
    expect(result.success).toBe(true);
    expect(next.heroCoins).toBe(70);
    expect(next.inventory.eggs.base).toBe(1);
  });

  test("mandatory gate can be disabled by parent config", () => {
    const state = freshState({
      points: 100,
      parentConfig: { ...freshState().parentConfig, requireAllMandatory: false },
    });
    const { result } = claimReward(state, "r1");
    expect(result.success).toBe(true);
  });
});

describe("resetDailyTasks", () => {
  test("streak +1 when >= 3 tasks completed, resets tasks & daily limits", () => {
    let state = freshState({ streak: 2, screenMinutesUsedToday: 45 });
    for (const id of ["t1", "t2", "t3"]) {
      state = completeTask(state, id, rngQueue(0.99)).state;
    }

    const next = resetDailyTasks(state);

    expect(next.streak).toBe(3);
    expect(next.tasks.every((t) => !t.completed)).toBe(true);
    expect(next.screenMinutesUsedToday).toBe(0);
    expect(next.energy).toBe(state.energy + 10);
  });

  test("streak resets to 0 when nothing completed and no freeze cards", () => {
    const state = freshState({ streak: 5, streakFreezes: 0 });
    const next = resetDailyTasks(state);
    expect(next.streak).toBe(0);
  });

  test("streak unchanged with 1-2 tasks completed", () => {
    let state = freshState({ streak: 5 });
    state = completeTask(state, "t1", rngQueue(0.99)).state;
    const next = resetDailyTasks(state);
    expect(next.streak).toBe(5);
  });

  test("defeated boss respawns at full HP", () => {
    const state = freshState({ bossHp: 0, bossDefeated: true });
    const next = resetDailyTasks(state);
    expect(next.bossHp).toBe(100);
    expect(next.bossDefeated).toBe(false);
  });
});

describe("streak freeze ❄️", () => {
  test("freeze card saves streak on a fully-missed day and is consumed", () => {
    const state = freshState({ streak: 6, streakFreezes: 1 });
    const next = resetDailyTasks(state);
    expect(next.streak).toBe(6); // saved!
    expect(next.streakFreezes).toBe(0);
    expect(next.lastFreezeUsed).toBe(true);
  });

  test("without freeze, missed day still resets streak to 0", () => {
    const state = freshState({ streak: 6, streakFreezes: 0 });
    const next = resetDailyTasks(state);
    expect(next.streak).toBe(0);
    expect(next.lastFreezeUsed).toBe(false);
  });

  test("freeze is NOT consumed when child completed 1-2 tasks (streak safe anyway)", () => {
    let state = freshState({ streak: 6, streakFreezes: 1 });
    state = completeTask(state, "t1", rngQueue(0.99)).state;
    const next = resetDailyTasks(state);
    expect(next.streak).toBe(6);
    expect(next.streakFreezes).toBe(1);
  });

  test("can buy freeze card with hero coins (rf1)", () => {
    const base = freshState({
      heroCoins: 100,
      streakFreezes: 0,
      parentConfig: { ...freshState().parentConfig, requireAllMandatory: false },
    });
    const { state: next, result } = claimReward(base, "rf1");
    expect(result.success).toBe(true);
    expect(next.heroCoins).toBe(40); // cost 60
    expect(next.streakFreezes).toBe(1);
  });

  test("freeze inventory is capped at 3", () => {
    const base = freshState({
      heroCoins: 500,
      streakFreezes: 3,
      parentConfig: { ...freshState().parentConfig, requireAllMandatory: false },
    });
    const { state: next, result } = claimReward(base, "rf1");
    expect(result.success).toBe(false);
    expect(result.error).toBe("FREEZE_CAP");
    expect(next.heroCoins).toBe(500); // not charged
  });
});
