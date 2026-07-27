import { describe, test, expect } from "vitest";
import { applyTaskEdit, toInt } from "@/lib/game/taskEdit";

const baseTask = () => ({
  id: "custom_1",
  title: "Đọc sách",
  exp: 20,
  points: 20,
  energy: 15,
  category: "intellect",
  statKey: "intellect",
  completed: false,
  custom: true,
  isMandatory: false,
  verifyType: "trust",
});

describe("applyTaskEdit — sửa gợi ý nhiệm vụ (#2)", () => {
  test("không mutate task gốc", () => {
    const t = baseTask();
    const snap = JSON.stringify(t);
    applyTaskEdit(t, { title: "Khác", exp: 99 });
    expect(JSON.stringify(t)).toBe(snap);
  });

  test("đổi tên (trim)", () => {
    const r = applyTaskEdit(baseTask(), { title: "  Đọc sách 30 phút  " });
    expect(r.title).toBe("Đọc sách 30 phút");
  });

  test("tên rỗng → giữ tên cũ", () => {
    const r = applyTaskEdit(baseTask(), { title: "   " });
    expect(r.title).toBe("Đọc sách");
  });

  test("đổi category → cập nhật statKey", () => {
    const r = applyTaskEdit(baseTask(), { category: "strength" });
    expect(r.category).toBe("strength");
    expect(r.statKey).toBe("strength");
  });

  test("category connection → statKey help", () => {
    const r = applyTaskEdit(baseTask(), { category: "connection" });
    expect(r.statKey).toBe("help");
  });

  test("category lạ → statKey discipline", () => {
    const r = applyTaskEdit(baseTask(), { category: "xyz" });
    expect(r.statKey).toBe("discipline");
  });

  test("đổi exp → đồng bộ cả points", () => {
    const r = applyTaskEdit(baseTask(), { exp: 40 });
    expect(r.exp).toBe(40);
    expect(r.points).toBe(40);
  });

  test("exp âm → kẹp về 0", () => {
    const r = applyTaskEdit(baseTask(), { exp: -5 });
    expect(r.exp).toBe(0);
  });

  test("exp không phải số → kẹp về 0", () => {
    const r = applyTaskEdit(baseTask(), { exp: "abc" });
    expect(r.exp).toBe(0);
  });

  test("verifyType → focus: thêm durationMin mặc định 10", () => {
    const r = applyTaskEdit(baseTask(), { verifyType: "focus" });
    expect(r.verifyType).toBe("focus");
    expect(r.durationMin).toBe(10);
  });

  test("verifyType → focus kèm durationMin", () => {
    const r = applyTaskEdit(baseTask(), { verifyType: "focus", durationMin: 25 });
    expect(r.durationMin).toBe(25);
  });

  test("focus → trust: bỏ durationMin", () => {
    const focusTask = { ...baseTask(), verifyType: "focus", durationMin: 20 };
    const r = applyTaskEdit(focusTask, { verifyType: "trust" });
    expect(r.verifyType).toBe("trust");
    expect(r.durationMin).toBeUndefined();
  });

  test("sửa riêng durationMin khi đang là focus", () => {
    const focusTask = { ...baseTask(), verifyType: "focus", durationMin: 15 };
    const r = applyTaskEdit(focusTask, { durationMin: 30 });
    expect(r.durationMin).toBe(30);
  });

  test("durationMin bị bỏ qua nếu task không phải focus", () => {
    const r = applyTaskEdit(baseTask(), { durationMin: 30 });
    expect(r.durationMin).toBeUndefined();
  });

  test("đổi isMandatory", () => {
    const r = applyTaskEdit(baseTask(), { isMandatory: true });
    expect(r.isMandatory).toBe(true);
  });

  test("giữ nguyên field không đụng tới (id, completed, custom)", () => {
    const r = applyTaskEdit(baseTask(), { title: "X" });
    expect(r.id).toBe("custom_1");
    expect(r.completed).toBe(false);
    expect(r.custom).toBe(true);
  });

  test("patch rỗng → task tương đương", () => {
    const t = baseTask();
    expect(applyTaskEdit(t, {})).toEqual(t);
  });

  test("task null → trả null (không vỡ)", () => {
    expect(applyTaskEdit(null, { title: "X" })).toBeNull();
  });
});

// Clamp durationMin dùng chung với addCustomTask (GameState) — khoá contract min 1, mặc định 10.
describe("toInt — clamp durationMin (dùng chung addCustomTask + applyTaskEdit)", () => {
  test("số hợp lệ → giữ nguyên", () => {
    expect(toInt(25, 1, 10)).toBe(25);
  });

  test("rỗng/NaN → mặc định 10", () => {
    expect(toInt("", 1, 10)).toBe(10);
    expect(toInt("abc", 1, 10)).toBe(10);
    expect(toInt(undefined, 1, 10)).toBe(10);
  });

  test("dưới min → kẹp về min 1", () => {
    expect(toInt(0, 1, 10)).toBe(1);
    expect(toInt(-5, 1, 10)).toBe(1);
  });
});
