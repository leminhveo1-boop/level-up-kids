/**
 * Cosmetics system — "Góc Của Tớ" 🏠 (Octalysis CD4 Ownership + sibling identity).
 * Pure functions; hero-coin sink. Assets are emoji/color based (no artwork pipeline).
 */

// Avatar slots + D6 "Căn Cứ Anh Hùng" room slots (deeper hero-coin sink, Octalysis CD3).
export const ROOM_SLOTS = ["roomWall", "roomFloor", "roomFurniture", "roomPet"];
export const COSMETIC_SLOTS = ["hat", "frame", "petAccessory", ...ROOM_SLOTS];

export const COSMETICS_CATALOG = [
  // Hats (đội lên avatar)
  { id: "hat_crown", slot: "hat", name: "Vương Miện Vàng", emoji: "👑", cost: 120, rarity: "epic" },
  { id: "hat_wizard", slot: "hat", name: "Mũ Phù Thủy", emoji: "🧙", cost: 80, rarity: "rare" },
  { id: "hat_cap", slot: "hat", name: "Mũ Lưỡi Trai Cool", emoji: "🧢", cost: 40, rarity: "common" },
  { id: "hat_flower", slot: "hat", name: "Vòng Hoa Mùa Xuân", emoji: "🌸", cost: 40, rarity: "common" },
  { id: "hat_ninja", slot: "hat", name: "Khăn Ninja Bí Ẩn", emoji: "🥷", cost: 80, rarity: "rare" },

  // Frames (khung avatar — đổi màu viền)
  { id: "frame_gold", slot: "frame", name: "Khung Hoàng Kim", value: "#D97706", cost: 100, rarity: "epic" },
  { id: "frame_ice", slot: "frame", name: "Khung Băng Giá", value: "#0284C7", cost: 60, rarity: "rare" },
  { id: "frame_nature", slot: "frame", name: "Khung Rừng Xanh", value: "#2E7D32", cost: 60, rarity: "rare" },
  { id: "frame_candy", slot: "frame", name: "Khung Kẹo Ngọt", value: "#E11D48", cost: 60, rarity: "rare" },

  // Pet accessories (phụ kiện cho thú cưng — "mua áo cho cú")
  { id: "pet_bow", slot: "petAccessory", name: "Nơ Xinh Cho Pet", emoji: "🎀", cost: 50, rarity: "common" },
  { id: "pet_glasses", slot: "petAccessory", name: "Kính Ngầu Cho Pet", emoji: "🕶️", cost: 70, rarity: "rare" },
  { id: "pet_scarf", slot: "petAccessory", name: "Khăn Ấm Cho Pet", emoji: "🧣", cost: 50, rarity: "common" },

  // D6 Căn Cứ — Walls (nền cảnh phía sau)
  { id: "wall_brick", slot: "roomWall", name: "Tường Gạch Ấm Cúng", emoji: "🧱", cost: 60, rarity: "common" },
  { id: "wall_rainbow", slot: "roomWall", name: "Tường Cầu Vồng", emoji: "🌈", cost: 90, rarity: "rare" },
  { id: "wall_galaxy", slot: "roomWall", name: "Tường Ngân Hà", emoji: "🌌", cost: 160, rarity: "epic" },

  // D6 Căn Cứ — Floors (sàn nhà)
  { id: "floor_wood", slot: "roomFloor", name: "Sàn Gỗ Mộc", emoji: "🟫", cost: 60, rarity: "common" },
  { id: "floor_grass", slot: "roomFloor", name: "Thảm Cỏ Xanh", emoji: "🟩", cost: 90, rarity: "rare" },
  { id: "floor_crystal", slot: "roomFloor", name: "Sàn Pha Lê", emoji: "🔷", cost: 160, rarity: "epic" },

  // D6 Căn Cứ — Furniture (nội thất chính)
  { id: "furn_desk", slot: "roomFurniture", name: "Bàn Học Anh Hùng", emoji: "🪑", cost: 80, rarity: "common" },
  { id: "furn_books", slot: "roomFurniture", name: "Kệ Sách Trí Tuệ", emoji: "📚", cost: 100, rarity: "rare" },
  { id: "furn_game", slot: "roomFurniture", name: "Góc Game Thư Giãn", emoji: "🎮", cost: 140, rarity: "epic" },
  { id: "furn_trophy", slot: "roomFurniture", name: "Tủ Cúp Vinh Danh", emoji: "🏆", cost: 200, rarity: "epic" },

  // D6 Căn Cứ — Pet corner (chỗ ở cho thú cưng)
  { id: "petroom_house", slot: "roomPet", name: "Nhà Nhỏ Cho Pet", emoji: "🏠", cost: 70, rarity: "common" },
  { id: "petroom_bed", slot: "roomPet", name: "Ổ Nệm Êm Cho Pet", emoji: "🧺", cost: 90, rarity: "rare" },
];

export const DEFAULT_COSMETICS = {
  owned: [],
  equipped: { hat: null, frame: null, petAccessory: null, roomWall: null, roomFloor: null, roomFurniture: null, roomPet: null },
};

/**
 * Buy a cosmetic with hero coins.
 * @returns {{ state: object, result: { success: boolean, error?: string, item?: object } }}
 */
export function buyCosmetic(state, cosmeticId) {
  const item = COSMETICS_CATALOG.find((c) => c.id === cosmeticId);
  if (!item) return { state, result: { success: false, error: "ITEM_NOT_FOUND" } };

  const cosmetics = state.cosmetics || DEFAULT_COSMETICS;
  if (cosmetics.owned.includes(cosmeticId)) {
    return { state, result: { success: false, error: "ALREADY_OWNED" } };
  }
  if (state.heroCoins < item.cost) {
    return { state, result: { success: false, error: "NOT_ENOUGH_COINS", shortage: item.cost - state.heroCoins } };
  }

  return {
    state: {
      ...state,
      heroCoins: state.heroCoins - item.cost,
      cosmetics: {
        ...cosmetics,
        owned: [...cosmetics.owned, cosmeticId],
        // auto-equip on purchase — instant gratification
        equipped: { ...cosmetics.equipped, [item.slot]: cosmeticId },
      },
    },
    result: { success: true, item },
  };
}

/**
 * Equip/unequip an owned cosmetic. Pass null id to unequip the slot.
 */
export function equipCosmetic(state, slot, cosmeticId) {
  if (!COSMETIC_SLOTS.includes(slot)) return { state, result: { success: false, error: "INVALID_SLOT" } };
  const cosmetics = state.cosmetics || DEFAULT_COSMETICS;

  if (cosmeticId !== null) {
    const item = COSMETICS_CATALOG.find((c) => c.id === cosmeticId);
    if (!item || item.slot !== slot) return { state, result: { success: false, error: "ITEM_NOT_FOUND" } };
    if (!cosmetics.owned.includes(cosmeticId)) return { state, result: { success: false, error: "NOT_OWNED" } };
  }

  return {
    state: { ...state, cosmetics: { ...cosmetics, equipped: { ...cosmetics.equipped, [slot]: cosmeticId } } },
    result: { success: true },
  };
}

/** Resolve equipped items to their catalog entries (avatar + room slots). */
export function getEquipped(state) {
  const cosmetics = state.cosmetics || DEFAULT_COSMETICS;
  const equipped = cosmetics.equipped || {};
  const find = (id) => COSMETICS_CATALOG.find((c) => c.id === id) || null;
  return {
    hat: find(equipped.hat),
    frame: find(equipped.frame),
    petAccessory: find(equipped.petAccessory),
    roomWall: find(equipped.roomWall),
    roomFloor: find(equipped.roomFloor),
    roomFurniture: find(equipped.roomFurniture),
    roomPet: find(equipped.roomPet),
  };
}
