import { describe, test, expect } from "vitest";
import { GIFT_CATALOG, findGift, deductGiftCost, applyGiftToRecipient, markGiftsRead } from "@/lib/game/gifting";
import { createInitialState } from "@/lib/game/constants";

describe("findGift", () => {
  test("finds a catalog entry by id", () => {
    expect(findGift("gift_meat")?.kind).toBe("food");
  });

  test("returns null for unknown id", () => {
    expect(findGift("nope")).toBeNull();
  });
});

describe("deductGiftCost", () => {
  test("deducts heroCoins on the sender when affordable", () => {
    const state = { ...createInitialState({ name: "Sender" }), heroCoins: 50 };
    const gift = GIFT_CATALOG[0];
    const { state: next, result } = deductGiftCost(state, gift.id);
    expect(result.success).toBe(true);
    expect(next.heroCoins).toBe(50 - gift.cost);
    expect(state.heroCoins).toBe(50); // immutability
  });

  test("fails when sender can't afford it", () => {
    const state = { ...createInitialState({ name: "Sender" }), heroCoins: 2 };
    const { state: next, result } = deductGiftCost(state, "gift_coins");
    expect(result.success).toBe(false);
    expect(result.error).toBe("NOT_ENOUGH_COINS");
    expect(next).toBe(state); // untouched
  });

  test("fails for an invalid gift id", () => {
    const state = { ...createInitialState({ name: "Sender" }), heroCoins: 999 };
    const { result } = deductGiftCost(state, "not_a_gift");
    expect(result.error).toBe("INVALID_GIFT");
  });
});

describe("applyGiftToRecipient", () => {
  test("food gift adds one unit to the recipient's inventory + a received-gift log", () => {
    const recipient = createInitialState({ name: "Sibling" });
    const next = applyGiftToRecipient(recipient, "gift_meat", "Anh Hai");
    expect(next.inventory.foods.meat).toBe(recipient.inventory.foods.meat + 1);
    expect(next.receivedGifts).toHaveLength(1);
    expect(next.receivedGifts[0].fromName).toBe("Anh Hai");
    expect(next.receivedGifts[0].read).toBe(false);
  });

  test("coin gift adds heroCoins to the recipient", () => {
    const recipient = { ...createInitialState({ name: "Sibling" }), heroCoins: 10 };
    const next = applyGiftToRecipient(recipient, "gift_coins", "Chị Ba");
    expect(next.heroCoins).toBe(25);
  });

  test("caps the received-gifts log at 20 entries", () => {
    let recipient = createInitialState({ name: "Sibling" });
    for (let i = 0; i < 25; i++) {
      recipient = applyGiftToRecipient(recipient, "gift_meat", "Anh Hai");
    }
    expect(recipient.receivedGifts).toHaveLength(20);
  });
});

describe("markGiftsRead", () => {
  test("marks every received gift as read", () => {
    let state = createInitialState({ name: "Sibling" });
    state = applyGiftToRecipient(state, "gift_meat", "Anh Hai");
    expect(state.receivedGifts[0].read).toBe(false);
    const next = markGiftsRead(state);
    expect(next.receivedGifts[0].read).toBe(true);
  });

  test("returns the same reference when nothing is unread (no-op)", () => {
    const state = { ...createInitialState({ name: "Sibling" }), receivedGifts: [{ id: "g1", read: true }] };
    expect(markGiftsRead(state)).toBe(state);
  });
});
