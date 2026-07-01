/**
 * Demo mode — a pre-built, appealing game state so prospects see the product
 * at its best (leveled hero, pets, coins, history). Never persisted.
 */

import { createInitialState } from "./constants";

export const DEMO_CHILD_ID = "__demo__";

export const DEMO_CHILD = {
  id: DEMO_CHILD_ID,
  name: "Bé Demo",
  char_class: "Warrior",
  ui_mode: "kid",
};

/** @returns {object} full game state showcasing the product */
export function createDemoState() {
  const base = createInitialState({ name: DEMO_CHILD.name, charClass: "Warrior" });
  const now = Date.now();

  const demoPetMount = {
    id: "pet_demo_mount",
    name: "Hỏa Long Vương",
    type: "Dragon",
    element: "fire",
    emoji: "🐉",
    feedProgress: 100,
    isMount: true,
    eggType: "dragon",
    potionType: "fire",
  };
  const demoPet = {
    id: "pet_demo_fox",
    name: "Cáo Lửa Đỏ",
    type: "Fox",
    element: "fire",
    emoji: "🦊",
    feedProgress: 45,
    isMount: false,
    eggType: "base",
    potionType: "fire",
  };

  return {
    ...base,
    level: 5,
    exp: 320,
    streak: 6,
    energy: 72,
    heroCoins: 385,
    points: 96,
    stats: { strength: 24, intellect: 19, discipline: 22, creative: 15, help: 18 },
    bossHp: 34,
    tasks: base.tasks.map((t, i) =>
      // a few tasks already ticked so buffs light up
      ["t2", "t3"].includes(t.id) ? { ...t, completed: true, earnedPoints: t.points, earnedEnergy: t.energy } : t
    ),
    inventory: {
      eggs: { base: 1, dragon: 0, wolf: 1 },
      potions: { fire: 1, ice: 2, magic: 0 },
      foods: { meat: 4, candy: 2, leaf: 3 },
    },
    pets: [demoPetMount, demoPet],
    activeMount: demoPetMount.id,
    activePet: null,
    miningHistory: [
      { id: "mh1", title: "🌟 RƯƠNG BÁU THẦN THOẠI 🌟", coins: 12, rarity: "legendary", rarityText: "Huyền Thoại ⚡", isCritical: true, timestamp: now - 60_000 },
      { id: "mh2", title: "👑 Hũ Xu Vàng Khổng Lồ 👑", coins: 6, rarity: "epic", rarityText: "Sử Thi 👑", isCritical: false, timestamp: now - 180_000 },
      { id: "mh3", title: "🥚 Nhận 1 Trứng hiếm: 🐺 Trứng Sói", coins: 0, rarity: "legendary", rarityText: "Trứng Thú Cưng 🥚", isCritical: false, isMaterial: true, timestamp: now - 400_000 },
      { id: "mh4", title: "🔷 Quặng Bạc Lấp Lánh 🔷", coins: 3, rarity: "rare", rarityText: "Hiếm 🔷", isCritical: false, timestamp: now - 700_000 },
    ],
    encouragements: [
      { id: "demo_msg", text: "Bố mẹ rất tự hào về con! Cố lên nhé chiến binh nhỏ! 💪❤️", read: false },
    ],
    lastResetDate: new Date().toLocaleDateString("vi-VN"),
  };
}
