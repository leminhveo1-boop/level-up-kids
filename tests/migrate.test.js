import { describe, test, expect } from "vitest";
import { migrateState } from "@/lib/game/migrate";

describe("migrateState — parentConfig merge defaults", () => {
  test("save cũ thiếu key mới → được điền default (smartAutoApprove)", () => {
    const old = migrateState({ parentConfig: { screenMaxMinutesPerDay: 45 } });
    expect(old.parentConfig.screenMaxMinutesPerDay).toBe(45); // giữ giá trị đã lưu
    expect(old.parentConfig.smartAutoApprove).toBe(true); // key mới có default
    expect(old.parentConfig.maxCoinBalance).toBe(7000);
  });

  test("save đã tắt smartAutoApprove → không bị default ghi đè", () => {
    const s = migrateState({ parentConfig: { smartAutoApprove: false } });
    expect(s.parentConfig.smartAutoApprove).toBe(false);
  });

  test("không có parentConfig → nguyên bộ default", () => {
    const s = migrateState({ charName: "A" });
    expect(s.parentConfig.smartAutoApprove).toBe(true);
    expect(s.parentConfig.requireAllMandatory).toBe(true);
  });
});
