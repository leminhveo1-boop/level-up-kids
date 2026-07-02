import { describe, test, expect } from "vitest";
import { getTreeState, TREE_STAGE_THRESHOLDS, TREE_MAX_STAGE } from "@/lib/game/worldTree";
import { completeTask, approveTask } from "@/lib/game/economy";
import { createInitialState } from "@/lib/game/constants";

const rng = () => 0.99; // never crit

describe("getTreeState (D5 Cây Thế Giới)", () => {
  test("0 điểm → giai đoạn hạt (stage 0), tiến độ về mốc kế", () => {
    const s = getTreeState(0);
    expect(s.stageIndex).toBe(0);
    expect(s.isMax).toBe(false);
    expect(s.forNext).toBe(TREE_STAGE_THRESHOLDS[1]);
    expect(s.progressPct).toBe(0);
  });

  test("đúng ngưỡng → lên giai đoạn kế", () => {
    const atStage2 = TREE_STAGE_THRESHOLDS[2];
    expect(getTreeState(atStage2).stageIndex).toBe(2);
    expect(getTreeState(atStage2 - 1).stageIndex).toBe(1);
  });

  test("giữa hai mốc → progressPct 0..100 hợp lý", () => {
    const lo = TREE_STAGE_THRESHOLDS[1];
    const hi = TREE_STAGE_THRESHOLDS[2];
    const mid = Math.floor((lo + hi) / 2);
    const s = getTreeState(mid);
    expect(s.stageIndex).toBe(1);
    expect(s.progressPct).toBeGreaterThan(0);
    expect(s.progressPct).toBeLessThan(100);
  });

  test("vượt mốc cao nhất → isMax, không có forNext", () => {
    const s = getTreeState(TREE_STAGE_THRESHOLDS[TREE_MAX_STAGE] + 999);
    expect(s.stageIndex).toBe(TREE_MAX_STAGE);
    expect(s.isMax).toBe(true);
    expect(s.forNext).toBeNull();
    expect(s.progressPct).toBe(100);
  });

  test("điểm âm/không hợp lệ → coi như 0", () => {
    expect(getTreeState(-5).stageIndex).toBe(0);
    expect(getTreeState(undefined).stageIndex).toBe(0);
  });
});

describe("tree growth tích lũy khi duyệt việc", () => {
  test("duyệt 1 việc pending → treeGrowth +1", () => {
    const state = createInitialState({ name: "A", charClass: "Warrior" });
    const { state: done } = completeTask(state, "t5", rng); // t5 trust, Uy Tín mặc định 50 → pending
    expect(done.tasks.find((t) => t.id === "t5").approval).toBe("pending");
    const { state: approved } = approveTask(done, "t5");
    expect(approved.treeGrowth).toBe((state.treeGrowth || 0) + 1);
  });

  test("việc auto-duyệt tức thì (Uy Tín cao) cũng cộng cây", () => {
    const base = createInitialState({ name: "A", charClass: "Warrior" });
    const state = { ...base, trustScore: 90 };
    const { state: done } = completeTask(state, "t5", rng); // trust + Uy Tín 90 → auto
    expect(done.tasks.find((t) => t.id === "t5").approval).toBe("auto");
    expect(done.treeGrowth).toBe(1);
  });
});
