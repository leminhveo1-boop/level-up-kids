import { describe, test, expect } from "vitest";
import { completeTask, rewardDoseFactor } from "@/lib/game/economy";
import {
  createInitialState,
  FADE_START,
  FADE_FLOOR,
  GRADUATION_DAYS,
} from "@/lib/game/constants";

/**
 * PROD-1 — luật cân liều thưởng (fade-out theo habitStreak).
 * SPEC: docs/SPEC_PROD1_CAN_LIEU_THUONG.md. Bất biến INV-1..7.
 */

const freshState = (overrides = {}) => ({
  ...createInitialState({ name: "Test Hero", charClass: "Warrior" }),
  ...overrides,
});

/** Đặt habitStreak cho 1 task cụ thể, giữ nguyên phần còn lại. */
const withTaskHabit = (taskId, habitStreak, extra = {}) => {
  const base = freshState(extra);
  return {
    ...base,
    tasks: base.tasks.map((t) => (t.id === taskId ? { ...t, habitStreak } : t)),
  };
};

const NON_CRIT = () => 0.99; // >= CRIT_POINT_CHANCE(0.15) → không crit
const ALWAYS_CRIT = () => 0; // < 0.15 → crit

describe("rewardDoseFactor — đường liều", () => {
  test("đủ liều (1.0) trong giai đoạn khởi động h <= FADE_START", () => {
    expect(rewardDoseFactor(0)).toBe(1);
    expect(rewardDoseFactor(FADE_START - 1)).toBe(1);
    expect(rewardDoseFactor(FADE_START)).toBe(1);
  });

  test("chạm đúng FADE_FLOOR ở sát tốt nghiệp (h = GRADUATION_DAYS)", () => {
    expect(rewardDoseFactor(GRADUATION_DAYS)).toBeCloseTo(FADE_FLOOR, 10);
  });

  test("ease-in: nửa đầu giảm rất nhẹ (< 3% ở h = FADE_START+4)", () => {
    const dose = rewardDoseFactor(FADE_START + 4);
    expect(dose).toBeGreaterThan(0.97);
    expect(dose).toBeLessThan(1);
  });

  test("giữa cửa sổ (p=0.5) = 1 - (1-FLOOR)*0.25", () => {
    const mid = Math.round((FADE_START + GRADUATION_DAYS) / 2); // p ~ 0.5
    const p = (mid - FADE_START) / (GRADUATION_DAYS - FADE_START);
    expect(rewardDoseFactor(mid)).toBeCloseTo(1 - (1 - FADE_FLOOR) * p * p, 10);
  });

  test("INV-2: đơn điệu KHÔNG tăng và luôn ∈ [FADE_FLOOR, 1] với h = 0..40", () => {
    let prev = Infinity;
    for (let h = 0; h <= 40; h++) {
      const d = rewardDoseFactor(h);
      expect(d).toBeLessThanOrEqual(prev + 1e-12);
      expect(d).toBeGreaterThanOrEqual(FADE_FLOOR - 1e-12);
      expect(d).toBeLessThanOrEqual(1 + 1e-12);
      prev = d;
    }
  });

  test("habitStreak thiếu/undefined xử như 0 → đủ liều", () => {
    expect(rewardDoseFactor(undefined)).toBe(1);
    expect(rewardDoseFactor(null)).toBe(1);
  });
});

describe("completeTask — áp cân liều (bất biến an toàn)", () => {
  test("INV-1: việc chưa thành nếp (h < FADE_START) điểm KHÔNG đổi", () => {
    // t2: points=10. streak=0, non-crit → phải đúng 10 như trước khi có fade.
    const state = withTaskHabit("t2", 5);
    const { events } = completeTask(state, "t2", NON_CRIT);
    expect(events.pointsAdded).toBe(10);
  });

  test("INV-7: task KHÔNG có field habitStreak → full điểm (deploy không tụt điểm ai)", () => {
    const state = freshState(); // DEFAULT_TASKS không có habitStreak
    const { events } = completeTask(state, "t2", NON_CRIT);
    expect(events.pointsAdded).toBe(10);
  });

  test("việc đã nếp (h=22, dose=0.9) → điểm giảm còn 9", () => {
    const state = withTaskHabit("t2", 22);
    const { events } = completeTask(state, "t2", NON_CRIT);
    expect(events.pointsAdded).toBe(9); // ceil(10 * 0.9)
  });

  test("INV-3: fade CHỈ giảm điểm — exp/energy/stats/bossHp không đổi theo h", () => {
    const low = completeTask(withTaskHabit("t2", 0), "t2", NON_CRIT).state;
    const high = completeTask(withTaskHabit("t2", 22), "t2", NON_CRIT).state;
    expect(high.exp).toBe(low.exp);
    expect(high.energy).toBe(low.energy);
    expect(high.stats.strength).toBe(low.stats.strength);
    expect(high.bossHp).toBe(low.bossHp);
  });

  test("thứ tự đúng: dose áp TRƯỚC crit×2 và streak-mult; focus-bonus KHÔNG fade", () => {
    // h=22 dose=0.9, streak=7 (×1.5), crit (×2), focusEarned
    const state = withTaskHabit("t2", 22, { streak: 7 });
    const { events } = completeTask(state, "t2", ALWAYS_CRIT, { focusEarned: true });
    // base = 10*0.9=9 → crit ×2 = 18 → ceil(18*1.5)=27 ; focusBonus = max(2, round(10*0.5))=5
    expect(events.focusBonus).toBe(5);
    expect(events.pointsAdded).toBe(32);
  });

  test("INV-4: pointsAdded không bao giờ âm", () => {
    for (let h = 0; h <= GRADUATION_DAYS; h++) {
      const { events } = completeTask(withTaskHabit("t2", h), "t2", NON_CRIT);
      expect(events.pointsAdded).toBeGreaterThanOrEqual(0);
    }
  });
});
