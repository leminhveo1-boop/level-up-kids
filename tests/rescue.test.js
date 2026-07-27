import { describe, test, expect } from "vitest";
import {
  DROP_REASONS,
  DEFER_REVIEW_THRESHOLD,
  applyDefer,
  requestHelp,
  applyDrop,
  clearRescue,
  isConsciouslyHandled,
  getReviewTogetherTasks,
  rescueStatusLabel,
} from "@/lib/game/rescue";

const task = (over = {}) => ({ id: "t1", title: "Đọc sách", completed: false, ...over });

describe("B1.2 rescue — 4 lối xử lý việc chưa xong (không phạt, không xấu hổ)", () => {
  test("applyDefer 'tomorrow' đặt trạng thái để-mai + tăng deferCount, không đụng điểm", () => {
    const out = applyDefer(task({ points: 10 }), "tomorrow");
    expect(out.deferState).toBe("tomorrow");
    expect(out.deferSlot).toBeNull();
    expect(out.deferCount).toBe(1);
    expect(out.points).toBe(10); // KHÔNG phạt điểm
  });

  test("applyDefer 'later' giữ nhãn mốc giờ đã chọn", () => {
    const out = applyDefer(task(), "later", "Sau bữa tối");
    expect(out.deferState).toBe("later");
    expect(out.deferSlot).toBe("Sau bữa tối");
    expect(out.deferCount).toBe(1);
  });

  test("deferCount cộng dồn qua nhiều lần dời", () => {
    const once = applyDefer(task({ deferCount: 2 }), "tomorrow");
    expect(once.deferCount).toBe(3);
  });

  test("requestHelp gắn cờ nhờ người lớn", () => {
    const out = requestHelp(task());
    expect(out.helpRequested).toBe(true);
  });

  test("applyDrop hợp lệ gắn lý do; lý do lạ → no-op an toàn", () => {
    const ok = applyDrop(task(), "tired");
    expect(ok.dropReason).toBe("tired");
    const bad = applyDrop(task(), "khong-ton-tai");
    expect(bad.dropReason).toBeUndefined();
  });

  test("mọi DROP_REASONS đều có id + label nhân văn", () => {
    expect(DROP_REASONS.length).toBeGreaterThanOrEqual(3);
    for (const r of DROP_REASONS) {
      expect(typeof r.id).toBe("string");
      expect(r.label.length).toBeGreaterThan(0);
    }
  });

  test("isConsciouslyHandled: defer/help/drop = true; chưa xử lý = false", () => {
    expect(isConsciouslyHandled(task())).toBe(false);
    expect(isConsciouslyHandled(applyDefer(task(), "tomorrow"))).toBe(true);
    expect(isConsciouslyHandled(requestHelp(task()))).toBe(true);
    expect(isConsciouslyHandled(applyDrop(task(), "tired"))).toBe(true);
  });

  test("clearRescue gỡ cờ tạm nhưng GIỮ deferCount tích luỹ", () => {
    const dirty = applyDefer(task({ deferCount: 4 }), "later", "Chiều");
    const cleaned = clearRescue(dirty);
    expect(cleaned.deferState).toBeUndefined();
    expect(cleaned.deferSlot).toBeUndefined();
    expect(cleaned.helpRequested).toBeUndefined();
    expect(cleaned.dropReason).toBeUndefined();
    expect(cleaned.deferCount).toBe(5); // 4 + lần defer vừa rồi, KHÔNG reset
  });

  test("getReviewTogetherTasks trả việc bị dời >= ngưỡng để 'cùng bố mẹ xem lại'", () => {
    const tasks = [
      task({ id: "a", deferCount: 3 }),
      task({ id: "b", deferCount: 1 }),
      task({ id: "c", deferCount: 5 }),
    ];
    const flagged = getReviewTogetherTasks(tasks).map((t) => t.id);
    expect(flagged).toEqual(["a", "c"]);
    expect(DEFER_REVIEW_THRESHOLD).toBe(3);
  });

  test("rescueStatusLabel dùng ngôn ngữ 'đang gỡ vướng', không phán xét", () => {
    expect(rescueStatusLabel(task({ deferState: "later" }))).toMatch(/gỡ vướng/i);
    expect(rescueStatusLabel(task({ helpRequested: true }))).toMatch(/người lớn/i);
    expect(rescueStatusLabel(task({ deferState: "tomorrow" }))).toMatch(/mai/i);
    expect(rescueStatusLabel(task({ dropReason: "tired" }))).toBe("Con mệt / chưa khoẻ");
    expect(rescueStatusLabel(task({ completed: true }))).toBeNull();
    // KHÔNG bao giờ dùng chữ "thất bại" / "chưa xong"
    for (const st of ["later", "tomorrow"]) {
      expect(rescueStatusLabel(task({ deferState: st }))).not.toMatch(/thất bại|chưa xong/i);
    }
  });
});
