import { describe, expect, test } from "vitest";
import { isNotificationQuietTime } from "../supabase/functions/_shared/quiet-hours";

function atVietnamTime(hour, minute = 0) {
  return new Date(Date.UTC(2026, 6, 27, hour - 7, minute));
}

describe("notification quiet hours", () => {
  test("cho phép nhắc buổi tối trước 22:00", () => {
    expect(isNotificationQuietTime(atVietnamTime(20, 0))).toBe(false);
    expect(isNotificationQuietTime(atVietnamTime(21, 59))).toBe(false);
  });

  test("không gửi từ đúng 22:00 đến trước 07:00", () => {
    expect(isNotificationQuietTime(atVietnamTime(22, 0))).toBe(true);
    expect(isNotificationQuietTime(atVietnamTime(23, 30))).toBe(true);
    expect(isNotificationQuietTime(atVietnamTime(6, 59))).toBe(true);
    expect(isNotificationQuietTime(atVietnamTime(7, 0))).toBe(false);
  });
});
