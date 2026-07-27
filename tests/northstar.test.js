import { describe, test, expect } from "vitest";
import { northStarSignals } from "@/lib/game/progress";

/**
 * GĐ0 — tầng ĐO North Star (T3): đo đầy đủ ở tầng máy, KHÔNG phô con số phán xét
 * cho trẻ. North Star = việc quan trọng con TỰ khởi động đúng giờ, không cần nhắc.
 */
describe("northStarSignals (GĐ0 đo North Star — tầng máy)", () => {
  test("state rỗng/undefined → tất cả 0, plannedLastNight false", () => {
    const zero = {
      remindersNeeded: 0,
      importantDone: 0,
      importantTotal: 0,
      plannedLastNight: false,
    };
    expect(northStarSignals(undefined, "01/07")).toEqual(zero);
    expect(northStarSignals({}, "")).toEqual(zero);
  });

  test("đếm đúng việc quan trọng đã xong / tổng (importance vắng = không tính)", () => {
    const state = {
      tasks: [
        { id: "a", importance: true, completed: true },
        { id: "b", importance: true, completed: false },
        { id: "c", importance: false, completed: true }, // không quan trọng → bỏ
        { id: "d", completed: true }, // importance vắng → bỏ
      ],
    };
    const s = northStarSignals(state, "");
    expect(s.importantTotal).toBe(2);
    expect(s.importantDone).toBe(1);
  });

  test("remindersNeeded đọc từ state.remindersToday, chặn âm/NaN/thập phân về số nguyên ≥0", () => {
    expect(northStarSignals({ remindersToday: 3 }, "").remindersNeeded).toBe(3);
    expect(northStarSignals({ remindersToday: -5 }, "").remindersNeeded).toBe(0);
    expect(northStarSignals({ remindersToday: "x" }, "").remindersNeeded).toBe(0);
    expect(northStarSignals({ remindersToday: 2.9 }, "").remindersNeeded).toBe(2);
  });

  test("plannedLastNight chỉ true khi tomorrowPlan.targetDate === ngày đóng", () => {
    const withPlan = (targetDate) => ({ tomorrowPlan: { targetDate } });
    expect(northStarSignals(withPlan("2026-07-28"), "2026-07-28").plannedLastNight).toBe(true);
    expect(northStarSignals(withPlan("2026-07-29"), "2026-07-28").plannedLastNight).toBe(false);
    expect(northStarSignals({ tomorrowPlan: null }, "2026-07-28").plannedLastNight).toBe(false);
  });

  test("thuần — không mutate state đầu vào", () => {
    const state = {
      tasks: [{ id: "a", importance: true, completed: true }],
      remindersToday: 1,
      tomorrowPlan: { targetDate: "d" },
    };
    const snap = JSON.stringify(state);
    northStarSignals(state, "d");
    expect(JSON.stringify(state)).toBe(snap);
  });
});
