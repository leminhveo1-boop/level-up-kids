import { describe, expect, test } from "vitest";
import {
  createTomorrowPlan,
  dateKey,
  getPlanPhase,
  shouldOfferTomorrowPlanning,
  selectDefaultFocusTask,
} from "@/lib/game/planning";

const tasks = [
  { id: "done", title: "Gấp chăn", completed: true, isMandatory: false },
  { id: "must", title: "Soạn cặp", completed: false, isMandatory: true },
  { id: "read", title: "Đọc sách", completed: false, isMandatory: false },
];

describe("planning — kế hoạch ngày mai", () => {
  test("dateKey dùng ngày địa phương, không lệch vì UTC", () => {
    const lateInVietnam = new Date(2026, 6, 27, 23, 30);
    expect(dateKey(lateInVietnam)).toBe("2026-07-27");
  });

  test("focus mặc định là nghĩa vụ chưa xong đầu tiên", () => {
    expect(selectDefaultFocusTask(tasks)?.id).toBe("must");
  });

  test("vẫn có fallback khi hôm nay mọi việc đã xong", () => {
    const allDone = tasks.map((task) => ({ ...task, completed: true }));
    expect(selectDefaultFocusTask(allDone)?.id).toBe("must");
  });

  test("kế hoạch giữ TOÀN BỘ danh sách, không cắt xuống 3–5 việc", () => {
    const now = new Date(2026, 6, 27, 21, 0);
    const plan = createTomorrowPlan(tasks, {
      now,
      focusTaskId: "read",
      firstStep: "Mở sách ở trang đang đọc",
      anchor: "Sau khi ăn tối",
    });

    expect(plan.targetDate).toBe("2026-07-28");
    expect(plan.items).toEqual([
      { taskId: "done", title: "Gấp chăn", isMandatory: false },
      { taskId: "must", title: "Soạn cặp", isMandatory: true },
      { taskId: "read", title: "Đọc sách", isMandatory: false },
    ]);
    expect(plan.focusTaskId).toBe("read");
    expect(plan.firstStep).toBe("Mở sách ở trang đang đọc");
    expect(plan.anchor).toBe("Sau khi ăn tối");
  });

  test("focus id không hợp lệ → fallback an toàn", () => {
    const plan = createTomorrowPlan(tasks, {
      now: new Date(2026, 6, 27, 21, 0),
      focusTaskId: "missing",
    });
    expect(plan.focusTaskId).toBe("must");
  });

  test("trim và giới hạn dữ liệu nhập tự do", () => {
    const plan = createTomorrowPlan(tasks, {
      now: new Date(2026, 6, 27, 21, 0),
      firstStep: `  ${"a".repeat(240)}  `,
      anchor: `  ${"b".repeat(120)}  `,
    });
    expect(plan.firstStep).toHaveLength(160);
    expect(plan.anchor).toHaveLength(80);
  });

  test("phân biệt kế hoạch hôm nay / ngày mai / cũ", () => {
    const now = new Date(2026, 6, 27, 10, 0);
    expect(getPlanPhase({ targetDate: "2026-07-27" }, now)).toBe("today");
    expect(getPlanPhase({ targetDate: "2026-07-28" }, now)).toBe("tomorrow");
    expect(getPlanPhase({ targetDate: "2026-07-26" }, now)).toBe("stale");
    expect(getPlanPhase(null, now)).toBe("none");
  });

  test("chỉ mời lập kế hoạch vào buổi tối hoặc khi đã xong toàn bộ việc", () => {
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 18, 59),
        allTasksCompleted: false,
      })
    ).toBe(false);
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 19, 0),
        allTasksCompleted: false,
      })
    ).toBe(true);
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 15, 0),
        allTasksCompleted: true,
      })
    ).toBe(true);
  });

  test("kế hoạch hôm nay/ngày mai vẫn luôn nhìn thấy để dùng", () => {
    expect(
      shouldOfferTomorrowPlanning({
        now: new Date(2026, 6, 27, 10, 0),
        plan: { targetDate: "2026-07-27" },
      })
    ).toBe(true);
  });
});
