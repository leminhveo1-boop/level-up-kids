/**
 * Sibling gifting — PURE functions (no React, no storage side effects).
 * D3: lets one child spend a few Hero Coins to gift a sibling food/coins.
 * Sender-side deduction and recipient-side application are two separate
 * pure ops because they touch two different children's states.
 */

export const GIFT_CATALOG = [
  { id: "gift_meat", label: "Thịt Bò 🥩 cho thú cưng", emoji: "🥩", kind: "food", key: "meat", cost: 12 },
  { id: "gift_candy", label: "Kẹo Ngọt 🍬 cho thú cưng", emoji: "🍬", kind: "food", key: "candy", cost: 12 },
  { id: "gift_leaf", label: "Lá Cây 🌿 cho thú cưng", emoji: "🌿", kind: "food", key: "leaf", cost: 12 },
  { id: "gift_coins", label: "15 Hero Coins 🪙", emoji: "🪙", kind: "coins", amount: 15, cost: 20 },
];

export function findGift(giftId) {
  return GIFT_CATALOG.find((g) => g.id === giftId) || null;
}

/** Deduct the gift's cost from the SENDER's own state. */
export function deductGiftCost(state, giftId) {
  const gift = findGift(giftId);
  if (!gift) return { state, result: { success: false, error: "INVALID_GIFT" } };
  if ((state.heroCoins || 0) < gift.cost) {
    return { state, result: { success: false, error: "NOT_ENOUGH_COINS", shortage: gift.cost - state.heroCoins } };
  }
  return {
    state: { ...state, heroCoins: state.heroCoins - gift.cost },
    result: { success: true, gift },
  };
}

/** Apply a received gift onto the RECIPIENT's state. */
export function applyGiftToRecipient(recipientState, giftId, fromName) {
  const gift = findGift(giftId);
  if (!gift) return recipientState;

  const log = {
    id: "gift_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
    giftId,
    label: gift.label,
    emoji: gift.emoji,
    fromName: fromName || "anh chị em",
    read: false,
    timestamp: Date.now(),
  };
  const receivedGifts = [log, ...(recipientState.receivedGifts || [])].slice(0, 20);

  if (gift.kind === "food") {
    return {
      ...recipientState,
      inventory: {
        ...recipientState.inventory,
        foods: { ...recipientState.inventory.foods, [gift.key]: (recipientState.inventory.foods[gift.key] || 0) + 1 },
      },
      receivedGifts,
    };
  }
  if (gift.kind === "coins") {
    return { ...recipientState, heroCoins: (recipientState.heroCoins || 0) + gift.amount, receivedGifts };
  }
  return { ...recipientState, receivedGifts };
}

export function markGiftsRead(state) {
  if (!state.receivedGifts?.some((g) => !g.read)) return state;
  return { ...state, receivedGifts: state.receivedGifts.map((g) => ({ ...g, read: true })) };
}
