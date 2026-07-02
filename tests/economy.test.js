import { describe, test, expect } from "vitest";
import {
  completeTask,
  uncompleteTask,
  mineTreasure,
  claimReward,
  resetDailyTasks,
  applyExpGain,
  getStreakMultiplier,
  approveTask,
  approveAllPending,
  rejectTask,
  autoApproveExpired,
  addApprovalNudge,
  countPending,
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
  test("adds exp/energy/stats immediately, points go to ESCROW (P0)", () => {
    // Arrange
    const state = freshState();
    const task = state.tasks[0]; // t1: exp 10, points 5, energy 2, discipline +1

    // Act — rng 0.99 ⇒ no crit
    const { state: next, events } = completeTask(state, task.id, rngQueue(0.99));

    // Assert
    const done = next.tasks.find((t) => t.id === task.id);
    expect(done.completed).toBe(true);
    expect(done.approval).toBe("pending");
    expect(done.pendingPoints).toBe(5);
    expect(next.exp).toBe(10); // exp immediate
    expect(next.points).toBe(0); // points HELD, not credited
    expect(next.energy).toBe(state.energy + 2); // energy immediate (fun loop preserved)
    expect(next.stats.discipline).toBe(state.stats.discipline + 1);
    expect(events.isCritical).toBe(false);
    expect(events.pointsPending).toBe(true);
    // immutability
    expect(state.tasks[0].completed).toBe(false);
  });

  test("critical hit doubles base points (held in escrow)", () => {
    const state = freshState();
    const task = state.tasks[0]; // points 5
    const { state: next, events } = completeTask(state, task.id, rngQueue(0.01));
    expect(events.isCritical).toBe(true);
    expect(next.tasks[0].pendingPoints).toBe(10);
    expect(next.points).toBe(0);
  });

  test("streak multiplier applies with ceil (held in escrow)", () => {
    const state = freshState({ streak: 7 }); // x1.5
    const task = state.tasks[0]; // points 5 → ceil(7.5)=8
    const { state: next } = completeTask(state, task.id, rngQueue(0.99));
    expect(next.tasks[0].pendingPoints).toBe(8);
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
  test("reverts approved points exactly (crit-safe), pending points just evaporate", () => {
    // Arrange: crit completion (10 pts) then parent approves → wallet 10
    const state = freshState();
    const { state: completed } = completeTask(state, "t1", rngQueue(0.01)); // crit → 10 pending
    const approved = approveTask(completed, "t1").state;
    expect(approved.points).toBe(10);

    // Act: un-tick after approval
    const { state: reverted } = uncompleteTask(approved, "t1");
    expect(reverted.points).toBe(0);
    expect(reverted.energy).toBe(state.energy);
    expect(reverted.exp).toBe(0);
    expect(reverted.tasks.find((t) => t.id === "t1").completed).toBe(false);
    expect(reverted.stats.discipline).toBe(state.stats.discipline);

    // Un-tick while still PENDING must not touch wallet
    const { state: completed2 } = completeTask(state, "t1", rngQueue(0.99));
    const { state: reverted2 } = uncompleteTask(completed2, "t1");
    expect(reverted2.points).toBe(0);
    expect(reverted2.exp).toBe(0);
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

describe("P0 escrow & trust (PDCA Check)", () => {
  test("approve releases held points and bumps trust", () => {
    const state = freshState({ trustScore: 50 });
    const { state: done } = completeTask(state, "t1", rngQueue(0.99)); // 5 pending
    const { state: approved, result } = approveTask(done, "t1");

    expect(result.success).toBe(true);
    expect(result.released).toBe(5);
    expect(approved.points).toBe(5);
    expect(approved.trustScore).toBe(51);
    expect(approved.tasks[0].approval).toBe("approved");
    expect(approved.tasks[0].pendingPoints).toBe(0);
    expect(approved.tasks[0].earnedPoints).toBe(5);
  });

  test("approveAllPending settles everything in one batch", () => {
    let state = freshState();
    state = completeTask(state, "t1", rngQueue(0.99)).state; // 5
    state = completeTask(state, "t6", rngQueue(0.99)).state; // 8
    expect(countPending(state)).toBe(2);

    const { state: next, result } = approveAllPending(state);
    expect(result.count).toBe(2);
    expect(result.totalReleased).toBe(13);
    expect(next.points).toBe(13);
    expect(countPending(next)).toBe(0);
  });

  test("reject undoes completion, drops trust hard, wallet untouched, pet-safe", () => {
    const state = freshState({ trustScore: 50, points: 20 });
    const { state: done } = completeTask(state, "t1", rngQueue(0.99));
    const { state: rejected, result } = rejectTask(done, "t1");

    expect(result.success).toBe(true);
    expect(rejected.points).toBe(20); // held points evaporated, wallet never touched
    expect(rejected.exp).toBe(0); // exp reverted
    expect(rejected.energy).toBe(state.energy); // energy reverted
    expect(rejected.trustScore).toBe(42); // -8
    const t = rejected.tasks.find((x) => x.id === "t1");
    expect(t.completed).toBe(false);
    expect(t.wasRejected).toBe(true);
    expect(rejected.pets).toEqual(state.pets); // assets untouched
  });

  test("trust never goes below 0 or above 100", () => {
    const low = freshState({ trustScore: 3 });
    const { state: d1 } = completeTask(low, "t1", rngQueue(0.99));
    expect(rejectTask(d1, "t1").state.trustScore).toBe(0);

    const high = freshState({ trustScore: 100 });
    const { state: d2 } = completeTask(high, "t1", rngQueue(0.99));
    expect(approveTask(d2, "t1").state.trustScore).toBe(100);
  });

  test("auto-approve releases only tasks older than 24h", () => {
    const now = Date.now();
    let state = freshState();
    state = completeTask(state, "t1", rngQueue(0.99)).state;
    state = completeTask(state, "t6", rngQueue(0.99)).state;
    // age t1 to 25h old
    state = {
      ...state,
      tasks: state.tasks.map((t) => (t.id === "t1" ? { ...t, completedAt: now - 25 * 3600 * 1000 } : t)),
    };

    const { state: next, result } = autoApproveExpired(state, now);
    expect(result.count).toBe(1);
    expect(next.tasks.find((t) => t.id === "t1").approval).toBe("auto");
    expect(next.tasks.find((t) => t.id === "t6").approval).toBe("pending");
    expect(next.points).toBe(5);
  });

  test("daily reset settles all pending as auto-approved (parent forgot ⇒ trust)", () => {
    let state = freshState();
    state = completeTask(state, "t1", rngQueue(0.99)).state; // 5 pending
    const next = resetDailyTasks(state, rngQueue(0.99));
    expect(next.points).toBe(5); // released before reset
    expect(countPending(next)).toBe(0);
  });

  test("nudge limited to 2 per day", () => {
    const now = Date.now();
    let state = freshState();
    let r = addApprovalNudge(state, now);
    expect(r.result.success).toBe(true);
    r = addApprovalNudge(r.state, now + 1000);
    expect(r.result.success).toBe(true);
    r = addApprovalNudge(r.state, now + 2000);
    expect(r.result.success).toBe(false);
    expect(r.result.error).toBe("NUDGE_LIMIT");
  });

  test("V1.3: no synchronous gates remain — daily reset never flags photo/gate fields", () => {
    const next = resetDailyTasks(freshState({ trustScore: 50 }), rngQueue(0.2));
    expect(next.tasks.every((t) => t.photoRequiredToday === undefined)).toBe(true);
    expect(next.tasks.every((t) => t.focusEarnedToday === false)).toBe(true);
  });
});

describe("V1.3: optional focus bonus 🌳", () => {
  test("focusEarned adds a bonus on top of normal claim (into escrow)", () => {
    const state = freshState();
    const task = state.tasks.find((t) => t.id === "t3"); // points 10
    // no focus → normal pending points
    const plain = completeTask(state, "t3", rngQueue(0.99));
    // with focus → bonus = max(2, round(10 * 0.5)) = 5
    const focused = completeTask(state, "t3", rngQueue(0.99), { focusEarned: true });
    const plainPts = plain.state.tasks.find((t) => t.id === "t3").pendingPoints;
    const focusPts = focused.state.tasks.find((t) => t.id === "t3").pendingPoints;
    expect(focusPts).toBe(plainPts + 5);
    expect(focused.events.focusBonus).toBe(5);
  });

  test("no focus flag = zero bonus", () => {
    const state = freshState();
    const { events } = completeTask(state, "t1", rngQueue(0.99));
    expect(events.focusBonus).toBe(0);
  });
});

describe("V1.2: daily history & habit graduation 🎓", () => {
  test("reset appends a snapshot of the closing day (capped 60)", () => {
    let state = freshState({ streak: 2, screenMinutesUsedToday: 35 });
    state = completeTask(state, "t1", rngQueue(0.99)).state;
    state = completeTask(state, "t2", rngQueue(0.99)).state;

    const next = resetDailyTasks(state, rngQueue(0.99), "01/07/2026");

    expect(next.history).toHaveLength(1);
    expect(next.history[0]).toMatchObject({
      date: "01/07/2026",
      completed: 2,
      screenMinutes: 35,
    });

    // cap at 60
    let s = { ...next, history: Array.from({ length: 60 }, (_, i) => ({ date: `d${i}` })) };
    const capped = resetDailyTasks(s, rngQueue(0.99), "x");
    expect(capped.history).toHaveLength(60);
    expect(capped.history[59].date).toBe("x");
  });

  test("habitStreak increments on completion, resets on miss", () => {
    let state = freshState();
    state = completeTask(state, "t1", rngQueue(0.99)).state;
    let next = resetDailyTasks(state, rngQueue(0.99));
    expect(next.tasks.find((t) => t.id === "t1").habitStreak).toBe(1);

    // missed day → back to 0
    next = resetDailyTasks(next, rngQueue(0.99));
    expect(next.tasks.find((t) => t.id === "t1").habitStreak).toBe(0);
  });

  test("30-day habit graduates: leaves task list, becomes permanent badge", () => {
    let state = freshState();
    state = {
      ...state,
      tasks: state.tasks.map((t) => (t.id === "t1" ? { ...t, habitStreak: 29, completed: true, approval: "auto", earnedPoints: 5 } : t)),
    };

    const next = resetDailyTasks(state, rngQueue(0.99));

    expect(next.tasks.find((t) => t.id === "t1")).toBeUndefined(); // gone from dailies
    expect(next.graduatedHabits).toHaveLength(1);
    expect(next.graduatedHabits[0].days).toBe(30);
    expect(next.lastGraduation.title).toContain("Dậy đúng giờ");
  });
});

describe("same-day approved re-tick grace 🔁", () => {
  const approveFirst = (state, taskId) => {
    // complete → approve (simulating parent)
    let s = completeTask(state, taskId, rngQueue(0.99)).state;
    const t = s.tasks.find((x) => x.id === taskId);
    s = {
      ...s,
      points: s.points + t.pendingPoints,
      tasks: s.tasks.map((x) =>
        x.id === taskId ? { ...x, approval: "approved", earnedPoints: x.pendingPoints, pendingPoints: 0 } : x
      ),
    };
    return s;
  };

  test("un-tick approved task refunds points and marks grace flag", () => {
    const state = freshState();
    const approved = approveFirst(state, "t1"); // +5 points credited
    expect(approved.points).toBe(5);

    const { state: unticked } = uncompleteTask(approved, "t1");
    expect(unticked.points).toBe(0); // refunded
    expect(unticked.tasks.find((t) => t.id === "t1").wasApprovedToday).toBe(true);
  });

  test("re-tick within same day: instant approval, no escrow, no gate", () => {
    const state = freshState();
    const approved = approveFirst(state, "t1");
    const { state: unticked } = uncompleteTask(approved, "t1");

    const { state: reticked, events } = completeTask(unticked, "t1", rngQueue(0.99));
    const t = reticked.tasks.find((x) => x.id === "t1");
    expect(t.approval).toBe("approved"); // instant — no pending
    expect(t.wasApprovedToday).toBeUndefined(); // flag consumed
    expect(reticked.points).toBe(5); // credited immediately
    expect(events.pointsPending).toBe(false);
  });

  test("grace flag does not survive daily reset", () => {
    const state = freshState();
    const approved = approveFirst(state, "t1");
    const { state: unticked } = uncompleteTask(approved, "t1");
    const next = resetDailyTasks(unticked);
    expect(next.tasks.find((t) => t.id === "t1").wasApprovedToday).toBeUndefined();
  });

  test("normal first-time completion still goes to escrow", () => {
    const state = freshState();
    const { state: next, events } = completeTask(state, "t1", rngQueue(0.99));
    expect(next.tasks.find((t) => t.id === "t1").approval).toBe("pending");
    expect(events.pointsPending).toBe(true);
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
