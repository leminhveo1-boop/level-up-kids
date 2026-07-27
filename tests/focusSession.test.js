import { describe, test, expect } from "vitest";
import { sessionTaskList, formatClock, SESSION_PRESETS } from "@/lib/game/focusSession";

describe("focusSession — D3.1 chế độ sổ / không màn hình", () => {
  test("sessionTaskList giữ đúng field sạch, việc cần-làm xếp trước", () => {
    const list = sessionTaskList([
      { id: "a", title: "Đọc sách", isMandatory: false, completed: false, points: 10, energy: 2, emoji: "📚" },
      { id: "b", title: "Làm Toán", isMandatory: true, completed: false, points: 20 },
    ]);

    // cần-làm trước
    expect(list.map((t) => t.id)).toEqual(["b", "a"]);
    // chỉ giữ field cần cho danh sách sạch — KHÔNG mang points/energy/emoji (không game)
    expect(list[0]).toEqual({ id: "b", title: "Làm Toán", isMandatory: true, completed: false });
    expect(list[0].points).toBeUndefined();
    expect(list[0].energy).toBeUndefined();
  });

  test("việc quan trọng (importance) cũng coi là cần-làm", () => {
    const list = sessionTaskList([
      { id: "a", title: "Thường", isMandatory: false, importance: false },
      { id: "b", title: "Quan trọng", isMandatory: false, importance: true },
    ]);
    expect(list[0].id).toBe("b");
    expect(list[0].isMandatory).toBe(true);
  });

  test("giữ trạng thái completed để in ra dấu tick", () => {
    const list = sessionTaskList([{ id: "a", title: "Xong", isMandatory: false, completed: true }]);
    expect(list[0].completed).toBe(true);
  });

  test("formatClock định dạng mm:ss, không âm", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(25 * 60)).toBe("25:00");
    expect(formatClock(-10)).toBe("00:00");
  });

  test("SESSION_PRESETS là các mốc phút hợp lý, tăng dần", () => {
    expect(SESSION_PRESETS.length).toBeGreaterThanOrEqual(2);
    const sorted = [...SESSION_PRESETS].sort((a, b) => a - b);
    expect(SESSION_PRESETS).toEqual(sorted);
    expect(SESSION_PRESETS.every((m) => m > 0 && m <= 60)).toBe(true);
  });

  test("danh sách rỗng trả mảng rỗng (không nổ)", () => {
    expect(sessionTaskList(undefined)).toEqual([]);
    expect(sessionTaskList([])).toEqual([]);
  });
});
