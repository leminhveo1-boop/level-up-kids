import { describe, test, expect } from "vitest";
import { getAtRiskTasks, buildTinyTask, HABIT_MISS_THRESHOLD } from "@/lib/game/habits";
import { resetDailyTasks } from "@/lib/game/economy";
import { createInitialState } from "@/lib/game/constants";

describe("getAtRiskTasks (D4 chia nhỏ việc hay bỏ)", () => {
  const mk = (id, missStreak, extra = {}) => ({ id, title: id, exp: 20, points: 10, energy: 6, category: "help", missStreak, ...extra });

  test("chỉ trả việc bị bỏ >= ngưỡng", () => {
    const tasks = [mk("a", 0), mk("b", HABIT_MISS_THRESHOLD), mk("c", HABIT_MISS_THRESHOLD - 1), mk("d", 5)];
    const risk = getAtRiskTasks(tasks).map((t) => t.id);
    expect(risk).toEqual(["b", "d"]);
  });

  test("bỏ qua chính các việc 'bản nhỏ' (tránh chia đệ quy)", () => {
    const tasks = [mk("a", 5), mk("tiny", 5, { tiny: true })];
    expect(getAtRiskTasks(tasks).map((t) => t.id)).toEqual(["a"]);
  });

  test("thiếu missStreak coi như 0", () => {
    expect(getAtRiskTasks([{ id: "x", title: "x" }])).toHaveLength(0);
  });
});

describe("buildTinyTask", () => {
  test("giảm nửa mục tiêu, dễ hơn (trust, không bắt buộc, có cờ tiny)", () => {
    const tiny = buildTinyTask({ id: "t1", title: "Đọc sách 20 phút", exp: 20, points: 10, energy: 6, category: "intellect", verifyType: "focus", durationMin: 20, isMandatory: true });
    expect(tiny.exp).toBe(10);
    expect(tiny.points).toBe(5);
    expect(tiny.energy).toBe(3);
    expect(tiny.durationMin).toBe(10);
    expect(tiny.verifyType).toBe("trust");
    expect(tiny.isMandatory).toBe(false);
    expect(tiny.tiny).toBe(true);
    expect(tiny.category).toBe("intellect");
    expect(tiny.title).toContain("Đọc sách");
  });

  test("giá trị nhỏ vẫn tối thiểu >= 1", () => {
    const tiny = buildTinyTask({ id: "t2", title: "X", exp: 1, points: 1, energy: 0, category: "help" });
    expect(tiny.exp).toBeGreaterThanOrEqual(1);
    expect(tiny.points).toBeGreaterThanOrEqual(1);
  });
});

describe("resetDailyTasks — theo dõi missStreak", () => {
  test("việc không xong tăng missStreak, việc xong reset về 0", () => {
    const base = createInitialState({ name: "A", charClass: "Warrior" });
    const state = {
      ...base,
      tasks: base.tasks.map((t) => (t.id === "t5" ? { ...t, completed: true, missStreak: 2 } : { ...t, missStreak: 1 })),
      lastResetDate: "01/07/2026",
    };
    const next = resetDailyTasks(state, () => 0.99, "01/07/2026");
    const t5 = next.tasks.find((t) => t.id === "t5");
    const other = next.tasks.find((t) => t.id === "t1");
    expect(t5.missStreak).toBe(0); // đã xong → reset
    expect(other.missStreak).toBe(2); // bỏ → +1
  });
});
