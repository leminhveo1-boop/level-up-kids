import { describe, test, expect } from "vitest";
import { hatchPet, feedPet, setActiveCompanion } from "@/lib/game/pets";
import { migrateState } from "@/lib/game/migrate";
import { createInitialState } from "@/lib/game/constants";

const rng = () => 0.5;

const stateWithMaterials = () => {
  const s = createInitialState({ name: "Hero" });
  return {
    ...s,
    inventory: {
      eggs: { base: 1, dragon: 1, wolf: 0 },
      potions: { fire: 1, ice: 0, magic: 1 },
      foods: { meat: 3, candy: 0, leaf: 0 },
    },
  };
};

describe("hatchPet", () => {
  test("hatches fire fox from base egg + fire potion, consumes materials", () => {
    const state = stateWithMaterials();
    const { state: next, result } = hatchPet(state, "base", "fire", rng);

    expect(result.success).toBe(true);
    expect(result.pet.name).toBe("Cáo Lửa Đỏ");
    expect(next.inventory.eggs.base).toBe(0);
    expect(next.inventory.potions.fire).toBe(0);
    expect(next.pets).toHaveLength(1);
    expect(next.activePet).toBe(result.pet.id); // auto-active when none
    // immutability
    expect(state.pets).toHaveLength(0);
  });

  test("fails without materials", () => {
    const state = stateWithMaterials();
    const { result } = hatchPet(state, "wolf", "fire", rng);
    expect(result.success).toBe(false);
    expect(result.error).toBe("NOT_ENOUGH_MATERIALS");
  });
});

describe("feedPet", () => {
  test("favorite food +25%, other +10%, evolves at 100%", () => {
    let state = stateWithMaterials();
    state = { ...state, inventory: { ...state.inventory, foods: { meat: 10, candy: 10, leaf: 0 } } };
    const hatched = hatchPet(state, "base", "fire", rng); // fire pet → favorite = meat
    state = hatched.state;
    const petId = hatched.result.pet.id;

    // non-favorite: candy +10
    let res = feedPet(state, petId, "candy");
    expect(res.result.gain).toBe(10);
    state = res.state;

    // favorite meat x4 → 10 + 100 capped at 100 ⇒ evolves
    for (let i = 0; i < 4; i++) {
      res = feedPet(state, petId, "meat");
      state = res.state;
    }
    const pet = state.pets.find((p) => p.id === petId);
    expect(pet.feedProgress).toBe(100);
    expect(pet.isMount).toBe(true);
    expect(res.result.evolved).toBe(true);
  });

  test("cannot feed a maxed mount", () => {
    let state = stateWithMaterials();
    const hatched = hatchPet(state, "base", "fire", rng);
    state = {
      ...hatched.state,
      pets: hatched.state.pets.map((p) => ({ ...p, feedProgress: 100, isMount: true })),
    };
    const { result } = feedPet(state, hatched.result.pet.id, "meat");
    expect(result.success).toBe(false);
    expect(result.error).toBe("ALREADY_MOUNT");
  });
});

describe("setActiveCompanion", () => {
  test("pet and mount are mutually exclusive", () => {
    const state = { ...createInitialState(), activePet: "a", activeMount: null };
    const asMount = setActiveCompanion(state, "mount", "b");
    expect(asMount.activeMount).toBe("b");
    expect(asMount.activePet).toBeNull();

    const cleared = setActiveCompanion(asMount, null, null);
    expect(cleared.activePet).toBeNull();
    expect(cleared.activeMount).toBeNull();
  });
});

describe("migrateState (legacy saves)", () => {
  test("migrates gold wallet → heroCoins and task.gold → energy", () => {
    const legacy = {
      charName: "Quốc Bảo",
      gold: 120,
      tasks: [{ id: "t1", title: "X", exp: 20, gold: 3, category: "help", completed: false }],
      rewards: [{ id: "r5", title: "Kem", cost: 100, currency: "gold", type: "perk" }],
    };
    const migrated = migrateState(legacy);
    expect(migrated.heroCoins).toBe(120);
    expect(migrated.tasks[0].energy).toBe(15); // gold 3 * 5
    expect(migrated.rewards[0].currency).toBe("heroCoins");
  });

  test("null/garbage input yields a valid initial state", () => {
    const migrated = migrateState(null);
    expect(migrated.level).toBe(1);
    expect(Array.isArray(migrated.tasks)).toBe(true);
    expect(migrated.parentConfig.maxCoinBalance).toBe(7000);
  });
});
