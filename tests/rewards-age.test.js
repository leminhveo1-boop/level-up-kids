import { describe, test, expect } from "vitest";
import { defaultRewardsFor, createInitialState, reconcileRewardsForAge } from "@/lib/game/constants";

describe("defaultRewardsFor — quà mặc định đúng độ tuổi (Value Gap)", () => {
  const kidPerkIds = ["r5", "r6", "r7", "r8"]; // kem, phim, đồ chơi, lego

  test("kid: giữ nguyên quà trẻ con (có ly kem r5)", () => {
    const ids = defaultRewardsFor("kid").map((r) => r.id);
    expect(ids).toContain("r5");
    expect(ids.some((id) => id.startsWith("t_"))).toBe(false);
  });

  test("teen: KHÔNG có quà trẻ con (ly kem/đồ chơi/lego), CÓ tiền/tự chủ/công nghệ", () => {
    const teen = defaultRewardsFor("teen");
    const ids = teen.map((r) => r.id);
    for (const k of kidPerkIds) expect(ids).not.toContain(k);
    expect(ids).toEqual(expect.arrayContaining(["t_money1", "t_late", "t_out", "t_tech", "t_money2"]));
    // không còn "ly kem" trong tiêu đề teen
    expect(teen.some((r) => /kem|đồ chơi|lego/i.test(r.title))).toBe(false);
  });

  test("phần dùng chung vẫn còn cho cả hai (giờ màn hình, thẻ đóng băng, thú cưng)", () => {
    for (const mode of ["kid", "teen"]) {
      const ids = defaultRewardsFor(mode).map((r) => r.id);
      expect(ids).toEqual(expect.arrayContaining(["r1", "r2", "r4", "rf1", "rp1"]));
    }
  });

  test("createInitialState({uiMode:'teen'}) seed quà teen", () => {
    const s = createInitialState({ name: "T", uiMode: "teen" });
    expect(s.rewards.some((r) => r.id === "t_money1")).toBe(true);
    expect(s.rewards.some((r) => r.id === "r5")).toBe(false);
  });

  test("không truyền uiMode → mặc định quà kid (an toàn ngược)", () => {
    expect(createInitialState({ name: "K" }).rewards.some((r) => r.id === "r5")).toBe(true);
  });
});

describe("reconcileRewardsForAge — vá teen đã seed quà kid từ trước", () => {
  const kidSeed = () => createInitialState({ name: "T" }).rewards; // có r5-r8 kid perks

  test("teen còn quà kid mặc định (chưa sửa) → đổi sang quà teen", () => {
    const { rewards, changed } = reconcileRewardsForAge(kidSeed(), "teen");
    expect(changed).toBe(true);
    const ids = rewards.map((r) => r.id);
    ["r5", "r6", "r7", "r8"].forEach((k) => expect(ids).not.toContain(k));
    expect(ids).toEqual(expect.arrayContaining(["t_money1", "t_tech"]));
  });

  test("kid → không đổi gì", () => {
    expect(reconcileRewardsForAge(kidSeed(), "kid").changed).toBe(false);
  });

  test("GIỮ tuỳ biến: nếu bố mẹ đã đổi tên r5 thì không đụng", () => {
    const custom = kidSeed().map((r) => (r.id === "r5" ? { ...r, title: "Quà bố mẹ tự đặt" } : r));
    const { rewards, changed } = reconcileRewardsForAge(custom, "teen");
    // r6/r7/r8 vẫn mặc định → vẫn migrate, nhưng r5 đã custom → giữ nguyên
    expect(rewards.find((r) => r.id === "r5")?.title).toBe("Quà bố mẹ tự đặt");
    expect(changed).toBe(true);
  });

  test("idempotent: chạy 2 lần không đổi thêm", () => {
    const once = reconcileRewardsForAge(kidSeed(), "teen").rewards;
    const twice = reconcileRewardsForAge(once, "teen");
    expect(twice.changed).toBe(false);
    expect(twice.rewards).toEqual(once);
  });

  test("GIỮ quà tự thêm của bố mẹ (id lạ)", () => {
    const withCustom = [...kidSeed(), { id: "reward_custom_1", title: "Quà riêng", cost: 50, currency: "heroCoins", type: "perk" }];
    const { rewards } = reconcileRewardsForAge(withCustom, "teen");
    expect(rewards.some((r) => r.id === "reward_custom_1")).toBe(true);
  });
});
