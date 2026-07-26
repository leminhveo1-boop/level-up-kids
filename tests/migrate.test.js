import { describe, test, expect } from "vitest";
import { migrateState } from "@/lib/game/migrate";
import { STATE_VERSION } from "@/lib/game/constants";

describe("migrateState — rescale tỷ giá 1 xu = 1000đ (version-gated)", () => {
  test("state v1 (chưa có stateVersion): ví chia 7 + đóng dấu stateVersion", () => {
    const out = migrateState({ charName: "A", heroCoins: 700 });
    expect(out.heroCoins).toBe(100); // 700 / 7 ≈ 100 (bảo toàn giá trị tiền thật)
    expect(out.stateVersion).toBe(STATE_VERSION);
    expect(out.coinRescaleNotice).toBe(true);
  });

  test("idempotent: load lại state v2 KHÔNG chia ví lần nữa", () => {
    const v1 = migrateState({ charName: "A", heroCoins: 700 });
    const v2 = migrateState(v1);
    expect(v2.heroCoins).toBe(v1.heroCoins); // 100 → 100, không bị chia tiếp
    expect(v2.stateVersion).toBe(STATE_VERSION);
  });

  test("quà heroCoins custom/đã sửa → cost chia 7", () => {
    const out = migrateState({
      charName: "A",
      stateVersion: undefined, // v1
      rewards: [
        { id: "custom_1", title: "Quà tự đặt", cost: 350, currency: "heroCoins", type: "perk" },
      ],
    });
    const custom = out.rewards.find((r) => r.id === "custom_1");
    expect(custom.cost).toBe(50); // 350 / 7 = 50
  });

  test("seed mặc định CHƯA sửa → thay bằng giá mới (không rescale mù)", () => {
    const out = migrateState({
      charName: "A",
      rewards: [
        { id: "r5", title: "Một ly kem tươi siêu to khổng lồ 🍨", cost: 100, currency: "heroCoins", type: "perk", value: "ice_cream" },
      ],
    });
    const r5 = out.rewards.find((r) => r.id === "r5");
    expect(r5.cost).toBe(20); // giá catalog mới, không phải 100/7
  });

  test("quà points (screen-time/skip-card) KHÔNG bị đụng", () => {
    const out = migrateState({
      charName: "A",
      rewards: [
        { id: "custom_pt", title: "Thẻ điểm tự đặt", cost: 80, currency: "points", type: "game_time" },
      ],
    });
    const pt = out.rewards.find((r) => r.id === "custom_pt");
    expect(pt.cost).toBe(80); // giữ nguyên
  });
});

describe("migrateState — parentConfig merge defaults", () => {
  test("save cũ thiếu key mới → được điền default (smartAutoApprove)", () => {
    const old = migrateState({ parentConfig: { screenMaxMinutesPerDay: 45 } });
    expect(old.parentConfig.screenMaxMinutesPerDay).toBe(45); // giữ giá trị đã lưu
    expect(old.parentConfig.smartAutoApprove).toBe(true); // key mới có default
    expect(old.parentConfig.maxCoinBalance).toBe(2000);
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
