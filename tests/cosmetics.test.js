import { describe, test, expect } from "vitest";
import { buyCosmetic, equipCosmetic, getEquipped, COSMETICS_CATALOG } from "@/lib/game/cosmetics";
import { generatePraiseSuggestions } from "@/lib/game/recognition";
import { createInitialState } from "@/lib/game/constants";

const freshState = (overrides = {}) => ({ ...createInitialState({ name: "Tí" }), ...overrides });

describe("cosmetics shop (Góc Của Tớ)", () => {
  test("buy deducts coins, adds ownership, auto-equips", () => {
    const state = freshState({ heroCoins: 100 });
    const { state: next, result } = buyCosmetic(state, "hat_cap"); // 40c

    expect(result.success).toBe(true);
    expect(next.heroCoins).toBe(60);
    expect(next.cosmetics.owned).toContain("hat_cap");
    expect(next.cosmetics.equipped.hat).toBe("hat_cap");
    // immutability
    expect(state.heroCoins).toBe(100);
  });

  test("cannot buy without enough coins or twice", () => {
    const poor = freshState({ heroCoins: 10 });
    expect(buyCosmetic(poor, "hat_crown").result.error).toBe("NOT_ENOUGH_COINS");

    const rich = freshState({ heroCoins: 500 });
    const once = buyCosmetic(rich, "hat_cap").state;
    expect(buyCosmetic(once, "hat_cap").result.error).toBe("ALREADY_OWNED");
  });

  test("equip/unequip owned items only, slot-checked", () => {
    let state = freshState({ heroCoins: 500 });
    state = buyCosmetic(state, "frame_gold").state;
    state = buyCosmetic(state, "frame_ice").state; // auto-equips ice

    expect(state.cosmetics.equipped.frame).toBe("frame_ice");
    state = equipCosmetic(state, "frame", "frame_gold").state;
    expect(state.cosmetics.equipped.frame).toBe("frame_gold");

    // unequip
    state = equipCosmetic(state, "frame", null).state;
    expect(state.cosmetics.equipped.frame).toBeNull();

    // not owned
    expect(equipCosmetic(state, "hat", "hat_crown").result.error).toBe("NOT_OWNED");
    // wrong slot
    expect(equipCosmetic(state, "hat", "frame_gold").result.error).toBe("ITEM_NOT_FOUND");
  });

  test("getEquipped resolves catalog entries", () => {
    let state = freshState({ heroCoins: 500 });
    state = buyCosmetic(state, "pet_bow").state;
    const eq = getEquipped(state);
    expect(eq.petAccessory.name).toBe("Nơ Xinh Cho Pet");
    expect(eq.hat).toBeNull();
  });

  test("catalog integrity: unique ids, valid slots, positive costs", () => {
    const ids = COSMETICS_CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(COSMETICS_CATALOG.every((c) => ["hat", "frame", "petAccessory"].includes(c.slot))).toBe(true);
    expect(COSMETICS_CATALOG.every((c) => c.cost > 0)).toBe(true);
  });
});

describe("recognition (Sổ Vàng)", () => {
  test("streak & trust generate process-praise, capped at 3", () => {
    const state = freshState({ streak: 7, trustScore: 85 });
    state.tasks = state.tasks.map((t, i) => (i < 6 ? { ...t, completed: true } : t));

    const praises = generatePraiseSuggestions(state);
    expect(praises.length).toBeLessThanOrEqual(3);
    expect(praises.some((p) => p.includes("7 ngày"))).toBe(true);
    expect(praises.every((p) => typeof p === "string" && p.length > 20)).toBe(true);
  });

  test("bad day yields a shame-free fallback", () => {
    const state = freshState({ streak: 0, trustScore: 30 });
    const praises = generatePraiseSuggestions(state);
    expect(praises).toHaveLength(1);
    expect(praises[0]).toContain("ngày mai");
  });
});
