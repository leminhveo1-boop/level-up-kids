import { describe, test, expect } from "vitest";
import { hatchPet, feedPet, setActiveCompanion, decayPetsHunger, getPetMood, getPetQuote, PET_ROSTER } from "@/lib/game/pets";
import { migrateState } from "@/lib/game/migrate";
import { createInitialState, PET_HUNGER_MAX } from "@/lib/game/constants";

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

  test("heals duplicate task/reward ids from same-millisecond batch inserts", () => {
    const dupState = {
      charName: "X",
      tasks: [
        { id: "custom_1", title: "A", exp: 10, energy: 5, category: "help", completed: false },
        { id: "custom_1", title: "B", exp: 10, energy: 5, category: "help", completed: false },
        { id: "custom_1", title: "C", exp: 10, energy: 5, category: "help", completed: false },
      ],
      rewards: [
        { id: "reward_1", title: "R1", cost: 10, currency: "points", type: "perk" },
        { id: "reward_1", title: "R2", cost: 10, currency: "points", type: "perk" },
      ],
    };
    const migrated = migrateState(dupState);
    const taskIds = migrated.tasks.map((t) => t.id);
    const rewardIds = migrated.rewards.map((r) => r.id);
    expect(new Set(taskIds).size).toBe(taskIds.length);
    expect(new Set(rewardIds).size).toBe(rewardIds.length);
    // titles preserved in order
    expect(migrated.tasks.map((t) => t.title)).toEqual(["A", "B", "C"]);
  });
});

describe("PET_ROSTER", () => {
  test("lists every egg/element combination (Pokédex-style)", () => {
    expect(PET_ROSTER.length).toBe(9); // 3 eggTypes x 3 elements
    expect(PET_ROSTER.every((p) => p.name && p.eggType && p.element && p.emoji)).toBe(true);
  });
});

describe("decayPetsHunger", () => {
  test("reduces every pet's hunger by the daily decay amount", () => {
    const state = { ...createInitialState(), pets: [{ id: "p1", hunger: 60 }, { id: "p2", hunger: 20 }] };
    const next = decayPetsHunger(state);
    expect(next.pets[0].hunger).toBe(45);
    expect(next.pets[1].hunger).toBe(5);
    expect(state.pets[0].hunger).toBe(60); // immutability
  });

  test("clamps hunger at 0, never goes negative", () => {
    const state = { ...createInitialState(), pets: [{ id: "p1", hunger: 5 }] };
    const next = decayPetsHunger(state);
    expect(next.pets[0].hunger).toBe(0);
  });

  test("no-ops on an empty pet list", () => {
    const state = { ...createInitialState(), pets: [] };
    expect(decayPetsHunger(state)).toBe(state);
  });
});

describe("getPetMood", () => {
  test("joyful at high hunger, happy at mid, hungry at low, starving at critical", () => {
    expect(getPetMood({ hunger: 100 })).toBe("joyful");
    expect(getPetMood({ hunger: 85 })).toBe("joyful");
    expect(getPetMood({ hunger: 60 })).toBe("happy");
    expect(getPetMood({ hunger: 40 })).toBe("hungry");
    expect(getPetMood({ hunger: 15 })).toBe("starving");
    expect(getPetMood({ hunger: 0 })).toBe("starving");
  });

  test("defaults to full hunger (joyful) when hunger is missing (legacy pet)", () => {
    expect(getPetMood({})).toBe("joyful");
    expect(getPetMood(null)).toBe("joyful");
  });
});

describe("getPetQuote", () => {
  test("picks a quote matching the pet's current mood", () => {
    const starving = { hunger: 5 };
    const quote = getPetQuote(starving, () => 0);
    expect(quote).toContain("đói");
  });

  test("is deterministic given a fixed rng", () => {
    const pet = { hunger: 90 };
    expect(getPetQuote(pet, () => 0)).toBe(getPetQuote(pet, () => 0));
  });
});
