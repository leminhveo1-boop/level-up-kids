import { describe, test, expect } from "vitest";
import { compareWeeks } from "@/lib/game/progress";

/** Build a daily snapshot like resetDailyTasks produces. */
const day = (date, completed, total = 10) => ({ date, completed, total });

/** n closed days, each with the same completed count. */
const flatDays = (n, completed) =>
  Array.from({ length: n }, (_, i) => day(`0${i + 1}/06`, completed));

describe("compareWeeks (D8 so-với-chính-mình)", () => {
  test("history trống → insufficient, không có message", () => {
    const r = compareWeeks([]);
    expect(r.status).toBe("insufficient");
    expect(r.message).toBe("");
  });

  test("tuần trước chưa đủ 4 ngày dữ liệu → insufficient", () => {
    // 7 ngày tuần này + 3 ngày tuần trước = 10 ngày
    const r = compareWeeks(flatDays(10, 3));
    expect(r.status).toBe("insufficient");
  });

  test("tuần trước 0 việc → insufficient (tránh chia 0)", () => {
    const history = [...flatDays(7, 0), ...flatDays(7, 3)];
    const r = compareWeeks(history);
    expect(r.status).toBe("insufficient");
  });

  test("tăng: tính đúng % và message có con số", () => {
    // tuần trước 7 ngày x 3 = 21, tuần này 7 ngày x 4 = 28 → +33%
    const history = [...flatDays(7, 3), ...flatDays(7, 4)];
    const r = compareWeeks(history);
    expect(r.status).toBe("up");
    expect(r.thisWeek).toBe(28);
    expect(r.lastWeek).toBe(21);
    expect(r.deltaPct).toBe(33);
    expect(r.message).toContain("33%");
    expect(r.message).toContain("28");
  });

  test("giảm: message nhẹ nhàng hướng về tuần sau, không đổ lỗi", () => {
    // tuần trước 28, tuần này 21 → -25%
    const history = [...flatDays(7, 4), ...flatDays(7, 3)];
    const r = compareWeeks(history);
    expect(r.status).toBe("down");
    expect(r.deltaPct).toBe(-25);
    expect(r.message.length).toBeGreaterThan(0);
    expect(r.message).not.toContain("-25");
  });

  test("giữ nguyên: status flat", () => {
    const history = [...flatDays(7, 3), ...flatDays(7, 3)];
    const r = compareWeeks(history);
    expect(r.status).toBe("flat");
    expect(r.deltaPct).toBe(0);
    expect(r.message.length).toBeGreaterThan(0);
  });

  test("todayLive được cộng vào tuần này", () => {
    // 13 ngày x 2 + hôm nay 5: tuần trước = 7x2=14, tuần này = 6x2+5=17 → +21%
    const r = compareWeeks(flatDays(13, 2), { completed: 5, total: 10 });
    expect(r.status).toBe("up");
    expect(r.thisWeek).toBe(17);
    expect(r.lastWeek).toBe(14);
    expect(r.deltaPct).toBe(21);
  });

  test("không mutate history đầu vào", () => {
    const history = flatDays(14, 3);
    const snapshot = JSON.stringify(history);
    compareWeeks(history, { completed: 9, total: 10 });
    expect(JSON.stringify(history)).toBe(snapshot);
  });
});
