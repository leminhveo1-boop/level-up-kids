import { describe, test, expect } from "vitest";
import {
  computePeriodKey,
  rollAllowancePeriod,
  budgetCoinsFor,
  completeTask,
  approveTask,
  approveAllPending,
  rejectTask,
  uncompleteTask,
} from "@/lib/game/economy";
import { createInitialState } from "@/lib/game/constants";

// Helper: state có 1 task xu, quỹ đã bật, trust thấp (→ escrow pending, không auto).
function stateWithBudget(budgetVnd, { coinReward = 10, period = "week" } = {}) {
  const s = createInitialState({ name: "A" });
  return {
    ...s,
    trustScore: 0, // thấp → không trust-autopilot; task 'trust' vẫn pending
    parentConfig: { ...s.parentConfig, allowanceBudgetVnd: budgetVnd, allowancePeriod: period, smartAutoApprove: false },
    tasks: [
      { id: "x1", title: "Việc xu", exp: 10, points: 5, energy: 1, category: "help", completed: false, statKey: "help", statVal: 1, verifyType: "trust", coinReward },
    ],
    heroCoins: 0,
    allowance: { periodKey: "", earnedCoins: 0 },
  };
}

const NOW = new Date("2026-07-28T10:00:00"); // Thứ Ba tuần ISO 2026-W31

describe("computePeriodKey", () => {
  test("week: ISO YYYY-Www, tuần bắt đầu Thứ Hai", () => {
    // 2026-07-27 (Thứ Hai) và 2026-08-02 (Chủ Nhật) cùng tuần ISO
    const mon = computePeriodKey("week", new Date("2026-07-27T00:00:00"));
    const sun = computePeriodKey("week", new Date("2026-08-02T23:00:00"));
    expect(mon).toMatch(/^2026-W\d{2}$/);
    expect(sun).toBe(mon); // cùng tuần ISO
  });

  test("week: Thứ Hai kế tiếp sang tuần mới", () => {
    const w1 = computePeriodKey("week", new Date("2026-08-02T12:00:00")); // CN
    const w2 = computePeriodKey("week", new Date("2026-08-03T12:00:00")); // T2 kế
    expect(w2).not.toBe(w1);
  });

  test("month: YYYY-MM", () => {
    expect(computePeriodKey("month", new Date("2026-07-28T10:00:00"))).toBe("2026-07");
    expect(computePeriodKey("month", new Date("2026-12-01T10:00:00"))).toBe("2026-12");
  });
});

describe("budgetCoinsFor", () => {
  test("quy đổi VNĐ → xu theo COIN_RATE_VND=1000", () => {
    expect(budgetCoinsFor({ allowanceBudgetVnd: 200000 })).toBe(200);
    expect(budgetCoinsFor({ allowanceBudgetVnd: 0 })).toBe(0);
    expect(budgetCoinsFor({})).toBe(0);
  });
});

describe("rollAllowancePeriod", () => {
  test("sang chu kỳ mới → reset earnedCoins=0, cập nhật periodKey", () => {
    const s = stateWithBudget(100000);
    const withOld = { ...s, allowance: { periodKey: "2026-W01", earnedCoins: 50 } };
    const rolled = rollAllowancePeriod(withOld, NOW);
    expect(rolled.allowance.earnedCoins).toBe(0);
    expect(rolled.allowance.periodKey).toBe(computePeriodKey("week", NOW));
  });

  test("cùng chu kỳ → giữ nguyên earnedCoins", () => {
    const key = computePeriodKey("week", NOW);
    const s = { ...stateWithBudget(100000), allowance: { periodKey: key, earnedCoins: 30 } };
    const rolled = rollAllowancePeriod(s, NOW);
    expect(rolled.allowance.earnedCoins).toBe(30);
    expect(rolled.allowance.periodKey).toBe(key);
  });
});

describe("approveTask — cấp xu trong trần (P1 minh bạch)", () => {
  test("cấp đúng coinReward khi còn room", () => {
    const s = stateWithBudget(100000, { coinReward: 10 }); // 100 xu quỹ
    const c = completeTask(s, "x1").state;
    const r = approveTask(c, "x1", { now: NOW.getTime() });
    expect(r.state.heroCoins).toBe(10);
    expect(r.state.allowance.earnedCoins).toBe(10);
    expect(r.result.coinsGranted).toBe(10);
    expect(r.result.coinsCapped).toBe(false);
  });

  test("clamp khi room < wanted → cấp phần còn lại + coinsCapped", () => {
    // quỹ 12.000đ = 12 xu; đã kiếm 8 → room 4; task muốn 10 → cấp 4, capped
    const s = { ...stateWithBudget(12000, { coinReward: 10 }), allowance: { periodKey: computePeriodKey("week", NOW), earnedCoins: 8 } };
    const c = completeTask(s, "x1").state;
    const r = approveTask(c, "x1", { now: NOW.getTime() });
    expect(r.result.coinsGranted).toBe(4);
    expect(r.result.coinsCapped).toBe(true);
    expect(r.state.allowance.earnedCoins).toBe(12);
  });

  test("budget=0 (lương xu TẮT) → không cấp xu (I3)", () => {
    const s = stateWithBudget(0, { coinReward: 10 });
    const c = completeTask(s, "x1").state;
    const r = approveTask(c, "x1", { now: NOW.getTime() });
    expect(r.state.heroCoins).toBe(0);
    expect(r.result.coinsGranted).toBe(0);
  });

  test("task không có coinReward → không cấp xu (không tự bịa)", () => {
    const s = stateWithBudget(100000, { coinReward: 0 });
    const c = completeTask(s, "x1").state;
    const r = approveTask(c, "x1", { now: NOW.getTime() });
    expect(r.state.heroCoins).toBe(0);
  });
});

describe("Trần cộng dồn — Σ xu ≤ budgetCoins (I2)", () => {
  test("nhiều task vượt quỹ → tổng cấp đúng bằng trần, không hơn", () => {
    const s = createInitialState({ name: "A" });
    const base = {
      ...s,
      trustScore: 0,
      parentConfig: { ...s.parentConfig, allowanceBudgetVnd: 15000, allowancePeriod: "week", smartAutoApprove: false }, // 15 xu
      heroCoins: 0,
      allowance: { periodKey: computePeriodKey("week", NOW), earnedCoins: 0 },
      tasks: [
        { id: "a", title: "A", exp: 5, points: 5, energy: 1, category: "help", completed: false, verifyType: "trust", coinReward: 10 },
        { id: "b", title: "B", exp: 5, points: 5, energy: 1, category: "help", completed: false, verifyType: "trust", coinReward: 10 },
        { id: "c", title: "C", exp: 5, points: 5, energy: 1, category: "help", completed: false, verifyType: "trust", coinReward: 10 },
      ],
    };
    let st = base;
    for (const id of ["a", "b", "c"]) st = completeTask(st, id).state;
    const after = approveAllPending(st, { now: NOW.getTime() }).state;
    expect(after.heroCoins).toBe(15); // 10+10+10 clamp về trần 15
    expect(after.allowance.earnedCoins).toBe(15);
    expect(after.allowance.earnedCoins).toBeLessThanOrEqual(15);
  });
});

describe("rejectTask — không cấp/không trừ xu", () => {
  test("reject task pending → xu chưa từng cấp, earnedCoins không đổi", () => {
    const s = stateWithBudget(100000, { coinReward: 10 });
    const c = completeTask(s, "x1").state;
    const r = rejectTask(c, "x1", "incomplete");
    expect(r.state.heroCoins).toBe(0);
    expect(r.state.allowance.earnedCoins).toBe(0);
  });
});

describe("uncompleteTask — hoàn xu đã cấp (I5)", () => {
  test("uncomplete task đã approved → hoàn đúng xu, earnedCoins không âm", () => {
    const s = stateWithBudget(100000, { coinReward: 10 });
    const c = completeTask(s, "x1").state;
    const approved = approveTask(c, "x1", { now: NOW.getTime() }).state;
    expect(approved.heroCoins).toBe(10);
    const un = uncompleteTask(approved, "x1").state;
    expect(un.heroCoins).toBe(0);
    expect(un.allowance.earnedCoins).toBe(0);
    expect(un.allowance.earnedCoins).toBeGreaterThanOrEqual(0);
  });

  test("uncomplete task pending (chưa approved) → không trừ xu", () => {
    const s = stateWithBudget(100000, { coinReward: 10 });
    const c = completeTask(s, "x1").state;
    const un = uncompleteTask(c, "x1").state;
    expect(un.heroCoins).toBe(0);
    expect(un.allowance.earnedCoins).toBe(0);
  });
});

describe("completeTask instant-approve (trust-autopilot) — cấp xu ngay", () => {
  test("Uy Tín cao + trust task → xu vào ví ngay khi hoàn thành", () => {
    const s = createInitialState({ name: "A" });
    const base = {
      ...s,
      trustScore: 100, // ≥80 → trust-autopilot
      parentConfig: { ...s.parentConfig, allowanceBudgetVnd: 100000, allowancePeriod: "week", smartAutoApprove: true },
      heroCoins: 0,
      allowance: { periodKey: computePeriodKey("week", NOW), earnedCoins: 0 },
      tasks: [
        { id: "x1", title: "Việc xu", exp: 10, points: 5, energy: 1, category: "help", completed: false, verifyType: "trust", coinReward: 7 },
      ],
    };
    const res = completeTask(base, "x1", Math.random, { now: NOW.getTime() });
    expect(res.state.heroCoins).toBe(7);
    expect(res.state.allowance.earnedCoins).toBe(7);
    expect(res.events.coinsGranted).toBe(7);
  });
});

describe("Q3 — BỎ trần số dư tổng (maxCoinBalance không chặn lương)", () => {
  test("kiếm xu vượt maxCoinBalance cũ (2000) vẫn cộng đủ", () => {
    const s = createInitialState({ name: "A" });
    const base = {
      ...s,
      trustScore: 0,
      parentConfig: { ...s.parentConfig, allowanceBudgetVnd: 3000000, allowancePeriod: "month", smartAutoApprove: false, maxCoinBalance: 2000 },
      heroCoins: 1998,
      allowance: { periodKey: computePeriodKey("month", NOW), earnedCoins: 0 },
      tasks: [
        { id: "x1", title: "Việc xu", exp: 10, points: 5, energy: 1, category: "help", completed: false, verifyType: "trust", coinReward: 20 },
      ],
    };
    const c = completeTask(base, "x1").state;
    const r = approveTask(c, "x1", { now: NOW.getTime() });
    expect(r.state.heroCoins).toBe(2018); // 1998 + 20, KHÔNG bị chặn ở 2000
  });
});
