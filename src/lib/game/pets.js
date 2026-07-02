/**
 * Pet & Mount system — PURE functions (no React, no side effects).
 */

import { PET_HUNGER_MAX, PET_HUNGER_DAILY_DECAY, PET_HUNGER_LOW_THRESHOLD, PET_HUNGER_CRITICAL_THRESHOLD } from "./constants";

const PET_MAP = {
  base: {
    fire: { name: "Cáo Lửa Đỏ", type: "Fox", element: "fire", emoji: "🦊" },
    ice: { name: "Mèo Tuyết Trắng", type: "Cat", element: "ice", emoji: "🐱" },
    magic: { name: "Gấu Trúc Ma Thuật", type: "Panda", element: "magic", emoji: "🐼" },
  },
  wolf: {
    fire: { name: "Sói Lửa Hủy Diệt", type: "Wolf", element: "fire", emoji: "🐺" },
    ice: { name: "Sói Băng Bắc Cực", type: "Wolf", element: "ice", emoji: "🐺" },
    magic: { name: "Sói Thần Vũ Trụ", type: "Wolf", element: "magic", emoji: "🐺" },
  },
  dragon: {
    fire: { name: "Hỏa Long Vương", type: "Dragon", element: "fire", emoji: "🐉" },
    ice: { name: "Băng Long Cổ Đại", type: "Dragon", element: "ice", emoji: "🐉" },
    magic: { name: "Thần Long Tinh Tú", type: "Dragon", element: "magic", emoji: "🐉" },
  },
};

const FAVORITE_FOOD = { fire: "meat", ice: "candy", magic: "leaf" };

/** Full roster (Pokédex-style) — every base/element combination, hatched or not. */
export const PET_ROSTER = Object.entries(PET_MAP).flatMap(([eggType, byElement]) =>
  Object.entries(byElement).map(([element, data]) => ({ ...data, eggType, element }))
);

/**
 * Hatch a pet from egg + potion.
 * @returns {{ state: object, result: { success: boolean, pet?: object, error?: string } }}
 */
export function hatchPet(state, eggType, potionType, rng = Math.random) {
  if ((state.inventory.eggs[eggType] || 0) < 1 || (state.inventory.potions[potionType] || 0) < 1) {
    return { state, result: { success: false, error: "NOT_ENOUGH_MATERIALS" } };
  }

  const petData = PET_MAP[eggType]?.[potionType];
  if (!petData) return { state, result: { success: false, error: "INVALID_COMBINATION" } };

  const newPet = {
    id: "pet_" + Date.now() + "_" + Math.floor(rng() * 1e9).toString(36),
    ...petData,
    feedProgress: 0,
    isMount: false,
    eggType,
    potionType,
    hunger: PET_HUNGER_MAX,
  };

  const hasActive = Boolean(state.activePet || state.activeMount);

  return {
    state: {
      ...state,
      inventory: {
        ...state.inventory,
        eggs: { ...state.inventory.eggs, [eggType]: state.inventory.eggs[eggType] - 1 },
        potions: { ...state.inventory.potions, [potionType]: state.inventory.potions[potionType] - 1 },
      },
      pets: [...state.pets, newPet],
      activePet: hasActive ? state.activePet : newPet.id,
    },
    result: { success: true, pet: newPet },
  };
}

/**
 * Feed a pet; favorite food = +25%, otherwise +10%. At 100% it evolves to mount.
 * @returns {{ state: object, result: { success: boolean, evolved?: boolean, gain?: number, isFavorite?: boolean, error?: string, pet?: object } }}
 */
export function feedPet(state, petId, foodType) {
  if ((state.inventory.foods[foodType] || 0) < 1) {
    return { state, result: { success: false, error: "NOT_ENOUGH_FOOD" } };
  }

  const pet = state.pets.find((p) => p.id === petId);
  if (!pet) return { state, result: { success: false, error: "PET_NOT_FOUND" } };
  if (pet.feedProgress >= 100 && (pet.hunger ?? PET_HUNGER_MAX) >= PET_HUNGER_MAX) {
    return { state, result: { success: false, error: "ALREADY_MOUNT" } };
  }

  const isFavorite = FAVORITE_FOOD[pet.element] === foodType;
  const gain = isFavorite ? 25 : 10;
  const nextProgress = Math.min(100, pet.feedProgress + gain);
  const evolved = nextProgress >= 100 && !pet.isMount;

  return {
    state: {
      ...state,
      inventory: {
        ...state.inventory,
        foods: { ...state.inventory.foods, [foodType]: state.inventory.foods[foodType] - 1 },
      },
      pets: state.pets.map((p) =>
        p.id === petId
          ? { ...p, feedProgress: nextProgress, isMount: p.isMount || nextProgress >= 100, hunger: PET_HUNGER_MAX }
          : p
      ),
    },
    result: { success: true, evolved, gain, isFavorite, pet },
  };
}

/** Daily hunger decay for every pet — called once per day inside resetDailyTasks. */
export function decayPetsHunger(state) {
  if (!state.pets || state.pets.length === 0) return state;
  return {
    ...state,
    pets: state.pets.map((p) => ({
      ...p,
      hunger: Math.max(0, (p.hunger ?? PET_HUNGER_MAX) - PET_HUNGER_DAILY_DECAY),
    })),
  };
}

/** Mood derived from hunger — drives the dashboard speech bubble & sprite tint. */
export function getPetMood(pet) {
  const hunger = pet?.hunger ?? PET_HUNGER_MAX;
  if (hunger <= PET_HUNGER_CRITICAL_THRESHOLD) return "starving";
  if (hunger <= PET_HUNGER_LOW_THRESHOLD) return "hungry";
  if (hunger >= 85) return "joyful";
  return "happy";
}

const PET_QUOTES = {
  joyful: [
    "Hôm nay tớ vui ơi là vui! 🌟",
    "Cảm ơn cậu đã chăm tớ thật tốt! 💕",
    "Tớ muốn đi phiêu lưu cùng cậu!",
  ],
  happy: [
    "Chúng mình cùng hoàn thành nhiệm vụ nhé!",
    "Tớ đang dõi theo cậu đấy!",
    "Cố lên, cậu làm tốt lắm!",
  ],
  hungry: [
    "Tớ hơi đói bụng rồi... cho tớ ăn nhé? 🥺",
    "Bụng tớ kêu ré rồi nè!",
    "Lâu rồi cậu chưa cho tớ ăn đó nha!",
  ],
  starving: [
    "Tớ đói lả rồi, cứu tớ với! 😭",
    "Làm ơn cho tớ ăn ngay đi, tớ không trụ nổi nữa...",
  ],
};

/** Random flavor quote for the active pet, keyed by mood (pure — inject rng for tests). */
export function getPetQuote(pet, rng = Math.random) {
  const mood = getPetMood(pet);
  const list = PET_QUOTES[mood];
  return list[Math.floor(rng() * list.length)];
}

/**
 * Set active companion. type: 'pet' | 'mount' | null.
 */
export function setActiveCompanion(state, type, id) {
  if (type === "pet") return { ...state, activePet: id, activeMount: null };
  if (type === "mount") return { ...state, activeMount: id, activePet: null };
  return { ...state, activePet: null, activeMount: null };
}
