/**
 * Pet & Mount system — PURE functions (no React, no side effects).
 */

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
  if (pet.feedProgress >= 100) return { state, result: { success: false, error: "ALREADY_MOUNT" } };

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
        p.id === petId ? { ...p, feedProgress: nextProgress, isMount: p.isMount || nextProgress >= 100 } : p
      ),
    },
    result: { success: true, evolved, gain, isFavorite, pet },
  };
}

/**
 * Set active companion. type: 'pet' | 'mount' | null.
 */
export function setActiveCompanion(state, type, id) {
  if (type === "pet") return { ...state, activePet: id, activeMount: null };
  if (type === "mount") return { ...state, activeMount: id, activePet: null };
  return { ...state, activePet: null, activeMount: null };
}
