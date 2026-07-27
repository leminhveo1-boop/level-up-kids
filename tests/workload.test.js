import { describe, test, expect } from "vitest";
import {
  assessDailyWorkload,
  SOFT_MAX_TASKS,
  SOFT_MAX_MANDATORY,
  SOFT_MAX_FOCUS_MINUTES,
} from "@/lib/game/workload";

const task = (over = {}) => ({ id: Math.random().toString(36), title: "Việc", ...over });
const many = (n, over = {}) => Array.from({ length: n }, () => task(over));

describe("workload — D3.5 bảo vệ giờ nghỉ / cảnh báo quá tải", () => {
  test("danh sách rỗng / undefined → không quá tải, đếm về 0", () => {
    const a = assessDailyWorkload(undefined);
    expect(a.overloaded).toBe(false);
    expect(a.taskCount).toBe(0);
    expect(a.mandatoryCount).toBe(0);
    expect(a.focusMinutes).toBe(0);
    expect(a.reasons).toEqual([]);
    expect(a.message).toBe("");
  });

  test("dưới mọi ngưỡng → không cảnh báo, message rỗng", () => {
    const a = assessDailyWorkload(many(SOFT_MAX_TASKS)); // đúng ngưỡng, chưa vượt
    expect(a.overloaded).toBe(false);
    expect(a.message).toBe("");
  });

  test("vượt số việc/ngày → quá tải, lý do 'tasks'", () => {
    const a = assessDailyWorkload(many(SOFT_MAX_TASKS + 1));
    expect(a.overloaded).toBe(true);
    expect(a.reasons).toContain("tasks");
    expect(a.taskCount).toBe(SOFT_MAX_TASKS + 1);
  });

  test("vượt số việc bắt buộc → lý do 'mandatory'", () => {
    const a = assessDailyWorkload(many(SOFT_MAX_MANDATORY + 1, { isMandatory: true }));
    expect(a.overloaded).toBe(true);
    expect(a.reasons).toContain("mandatory");
    expect(a.mandatoryCount).toBe(SOFT_MAX_MANDATORY + 1);
  });

  test("vượt tổng phút có hẹn giờ → lý do 'minutes'; bỏ qua việc không durationMin", () => {
    const list = [
      task({ durationMin: SOFT_MAX_FOCUS_MINUTES }),
      task({ durationMin: 10 }),
      task({}), // không hẹn giờ → không cộng
      task({ durationMin: 0 }),
    ];
    const a = assessDailyWorkload(list);
    expect(a.focusMinutes).toBe(SOFT_MAX_FOCUS_MINUTES + 10);
    expect(a.reasons).toContain("minutes");
    expect(a.overloaded).toBe(true);
  });

  test("message mềm nhắc giờ nghỉ và kèm con số khi quá tải", () => {
    const a = assessDailyWorkload(many(SOFT_MAX_TASKS + 2));
    expect(a.message).toMatch(/nghỉ/i);
    expect(a.message).toContain(String(SOFT_MAX_TASKS + 2));
  });

  test("ngưỡng là số dương hợp lý", () => {
    [SOFT_MAX_TASKS, SOFT_MAX_MANDATORY, SOFT_MAX_FOCUS_MINUTES].forEach((n) => {
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThan(0);
    });
    expect(SOFT_MAX_MANDATORY).toBeLessThanOrEqual(SOFT_MAX_TASKS);
  });
});
