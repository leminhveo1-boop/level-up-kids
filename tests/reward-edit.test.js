import { describe, expect, test } from "vitest";
import { updateRewardById } from "@/lib/game/rewards";

describe("updateRewardById", () => {
  test("sửa được cả quà mặc định mà không đổi id hoặc trạng thái duyệt", () => {
    const rewards = [
      {
        id: "r5",
        title: "Một ly kem khổng lồ",
        cost: 20,
        currency: "heroCoins",
        type: "perk",
        value: "ice_cream",
        parentApproved: true,
      },
    ];

    const next = updateRewardById(rewards, "r5", {
      title: "Quà sinh nhật: đi ăn kem cùng bố mẹ",
      cost: "5",
      currency: "points",
      type: "perk",
    });

    expect(next[0]).toMatchObject({
      id: "r5",
      title: "Quà sinh nhật: đi ăn kem cùng bố mẹ",
      cost: 5,
      currency: "points",
      type: "perk",
      parentApproved: true,
      value: "ice_cream",
    });
  });

  test("không nhận tên rỗng hoặc giá nhỏ hơn 1", () => {
    const rewards = [{ id: "r1", title: "Quà cũ", cost: 10 }];
    const next = updateRewardById(rewards, "r1", { title: "   ", cost: 0 });
    expect(next[0]).toMatchObject({ title: "Quà cũ", cost: 1 });
  });
});
