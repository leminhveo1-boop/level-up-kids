/**
 * Game constants & initial-state factory.
 * Pure data — no React, no side effects.
 */

export const ENERGY_CAP = 100;
export const STARTING_ENERGY = 30;
export const DAILY_ENERGY_BONUS = 10;
export const STREAK_MIN_TASKS = 3;
export const CRIT_POINT_CHANCE = 0.15;
export const MINING_HISTORY_LIMIT = 15;
export const BOSS_MAX_HP = 100;
export const MOUNT_ENERGY_MULTIPLIER = 1.1;
export const MOUNT_CRIT_BONUS = 0.05;
export const BASE_MINING_CRIT_CHANCE = 0.2;
export const STREAK_FREEZE_CAP = 3;
export const STARTING_STREAK_FREEZES = 1;

// ===== P0 Verification system (SCIENTIFIC_UPGRADE Phần 1) =====
/** trust: tick là tính | timer: cần stopwatch đủ 80% | photo: chụp kết quả | witness: bố mẹ xác nhận PIN */
export const VERIFY_TYPES = ["trust", "timer", "photo", "witness"];
export const TIMER_COMPLETION_RATIO = 0.8; // stopwatch phải chạy >= 80% durationMin
export const ESCROW_AUTO_APPROVE_MS = 24 * 60 * 60 * 1000; // bố mẹ quên 24h → auto-approve (default = trust)
export const TRUST_START = 50;
export const TRUST_MAX = 100;
export const TRUST_MIN = 0;
export const TRUST_GAIN_ON_APPROVE = 1;
export const TRUST_LOSS_ON_REJECT = 8;
export const TRUST_HIGH_THRESHOLD = 80; // Uy Tín cao → ít bị spot-check, điểm nhả nhanh
export const NUDGE_LIMIT_PER_DAY = 2; // trẻ nhắc bố mẹ duyệt tối đa 2 lần/ngày

// ===== V1.3 Focus companion (Forest-style OPTIONAL reward) =====
// Timer is never a gate. If the child chooses to run a focus session and
// reaches the threshold, they earn a bonus on top of the normal claim.
export const FOCUS_COMPLETION_RATIO = 0.8; // session must reach 80% of durationMin
export const FOCUS_BONUS_RATIO = 0.5; // +50% points bonus for a focused session
export const FOCUS_BONUS_MIN = 2;

// ===== Đợt Bằng Chứng: D8 so-với-chính-mình =====
export const COMPARE_MIN_LAST_WEEK_DAYS = 4; // cần ≥4 ngày dữ liệu tuần trước mới đủ tin để so sánh

// ===== B-lite: Tuần Bận — chế độ tự lái trọn gói cho bố mẹ =====
export const BUSY_MODE_MS = 7 * 24 * 60 * 60 * 1000; // bật 1 lần = 7 ngày

// ===== V1.2 =====
export const HISTORY_LIMIT_DAYS = 60; // daily snapshots kept in state (weekly report)
export const GRADUATION_DAYS = 30; // thói quen 30 ngày liên tục → tốt nghiệp 🎓 thành "Bản Năng Anh Hùng"

// ===== PROD-1: cân liều thưởng (fade-out chống overjustification) =====
// SPEC: docs/SPEC_PROD1_CAN_LIEU_THUONG.md. Việc đã thành nếp rút DẦN liều điểm
// (ngoại lực) để không dạy con "làm vì thưởng" (thẻ #10) + giữ sensor Đọc vị sạch (DEEP #3).
// Ease-in p²: nửa đầu cửa sổ giảm rất nhẹ, dốc dồn về sát tốt nghiệp. Chỉ giảm `points`.
export const FADE_START = 14; // h <= mốc này: đủ liều 1.0 (việc mới/đang khó không bị chạm)
export const FADE_FLOOR = 0.6; // liều tối thiểu của việc nếp trước tốt nghiệp (không thành "phạt")

// ===== D1: Pet "sống" (hunger + mood) =====
export const PET_HUNGER_MAX = 100;
export const PET_HUNGER_DAILY_DECAY = 15; // giảm mỗi ngày qua resetDailyTasks
export const PET_HUNGER_LOW_THRESHOLD = 40; // dưới mức này pet "buồn/đói"
export const PET_HUNGER_CRITICAL_THRESHOLD = 15; // dưới mức này pet "rất đói"

// ===== D2: Boss tuần thành sự kiện thật =====
export const BOSS_HP_SCALE_PER_CYCLE = 20; // mỗi tuần mới, HP tối đa của boss tăng thêm
export const BOSS_HP_SCALE_MAX_CYCLES = 8; // scale HP dừng lại sau 8 tuần (tránh bất khả thi)
export const BOSS_LOOT_COIN_MIN = 40; // rương boss hào phóng hơn hẳn đào mỏ thường
export const BOSS_LOOT_COIN_MAX = 80;

export const DEFAULT_PARENT_CONFIG = {
  screenMaxMinutesPerDay: 60,
  screenRedeemMaxPerWeek: 5,
  topRewardMoneyVnd: 500000,
  topRewardEffortDays: 14,
  requireAllMandatory: true,
  maxCoinBalance: 7000,
  smartAutoApprove: true, // Uy Tín ≥80: việc tự-ghi-nhận nhả điểm ngay (chế độ tự lái)
  busyUntil: 0, // Tuần Bận: trước mốc này MỌI việc nhả điểm ngay (0 = tắt)
};

export const DEFAULT_STATS = {
  strength: 10,
  intellect: 10,
  discipline: 10,
  creative: 10,
  help: 10,
};

export const CHARACTER_CLASSES = [
  {
    id: "Warrior",
    baseStats: { strength: 14, intellect: 9, discipline: 11, creative: 8, help: 8 },
  },
  {
    id: "Mage",
    baseStats: { strength: 8, intellect: 14, discipline: 9, creative: 11, help: 8 },
  },
  {
    id: "Druid",
    baseStats: { strength: 9, intellect: 8, discipline: 10, creative: 9, help: 14 },
  },
];

// V1.3: verifyType is a soft HINT for the parent approval queue (NOT a gate).
//   trust  = con tự ghi nhận
//   parent = việc bố mẹ dễ xác nhận/tự tick giúp (dậy sớm, kết nối)
//   focus  = có thể bật timer tập trung TÙY CHỌN để nhận thưởng (durationMin)
// Every task claims with a single frictionless tap; verification is async.
export const DEFAULT_TASKS = [
  { id: "t1", title: "Dậy đúng giờ đón bình minh 🌅", exp: 10, points: 5, energy: 2, category: "discipline", completed: false, statKey: "discipline", statVal: 1, isMandatory: false, verifyType: "parent" },
  { id: "t2", title: "Tập thể dục năng động 15 phút 🏃‍♂️", exp: 20, points: 10, energy: 4, category: "strength", completed: false, statKey: "strength", statVal: 2, isMandatory: true, verifyType: "focus", durationMin: 15 },
  { id: "t3", title: "Đọc sách tinh hoa 20 phút 📚", exp: 20, points: 10, energy: 4, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true, verifyType: "focus", durationMin: 20 },
  { id: "t4", title: "Học tiếng Anh hoặc tìm hiểu AI 🤖", exp: 20, points: 10, energy: 4, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true, verifyType: "focus", durationMin: 20 },
  { id: "t5", title: "Lau dọn nhà cửa & quét dọn phụ mẹ 🧹", exp: 25, points: 12, energy: 5, category: "help", completed: false, statKey: "help", statVal: 2, isMandatory: false, verifyType: "trust" },
  { id: "t6", title: "Làm chủ cảm xúc, luôn mỉm cười 🌸", exp: 15, points: 8, energy: 3, category: "help", completed: false, statKey: "help", statVal: 1, isMandatory: false, verifyType: "trust" },
  { id: "t7", title: "Sắp xếp phòng ngủ ngăn nắp, xếp chăn màn ✨", exp: 20, points: 10, energy: 4, category: "discipline", completed: false, statKey: "discipline", statVal: 2, isMandatory: false, verifyType: "trust" },
  { id: "t8", title: "Viết nhật ký cảm xúc & bài học ngày ✍️", exp: 15, points: 8, energy: 3, category: "creative", completed: false, statKey: "creative", statVal: 1, isMandatory: false, verifyType: "trust" },
  { id: "t9", title: "Chăm sóc, tưới cây hoặc cho thú cưng ăn 🌿", exp: 20, points: 10, energy: 4, category: "creative", completed: false, statKey: "creative", statVal: 2, isMandatory: false, verifyType: "trust" },
  { id: "t10", title: "Tuân thủ giới hạn xem TV/chơi Game 📺", exp: 30, points: 15, energy: 6, category: "discipline", completed: false, statKey: "discipline", statVal: 3, isMandatory: true, verifyType: "parent" },
  // Connection quest 💞 — the value IS the connection; the tap is an afterthought
  { id: "tc1", title: "Kể cho bố mẹ nghe 3 điều về ngày hôm nay 💞", exp: 20, points: 10, energy: 4, category: "connection", completed: false, statKey: "help", statVal: 2, isMandatory: false, verifyType: "parent" },
];

export const DEFAULT_REWARDS = [
  { id: "r1", title: "Đổi 20 phút chơi game / xem TV 📺", cost: 40, currency: "points", type: "game_time", value: 20, parentApproved: false, rarity: "common" },
  { id: "r2", title: "Đổi 45 phút chơi game / xem TV 🚀", cost: 80, currency: "points", type: "game_time", value: 45, parentApproved: false, rarity: "common" },
  { id: "r3", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 150, currency: "points", type: "perk", value: "movie_tickets", parentApproved: false, rarity: "rare" },
  { id: "r4", title: "Thẻ bài miễn làm 1 nhiệm vụ ngày 🎟️", cost: 100, currency: "points", type: "card", value: "skip_task", parentApproved: false, rarity: "epic" },
  { id: "rf1", title: "❄️ Thẻ Đóng Băng Streak (nghỉ 1 ngày không mất lửa)", cost: 60, currency: "heroCoins", type: "streak_freeze", value: 1, parentApproved: false, rarity: "rare" },
  { id: "rp1", title: "Mua 🥚 Trứng Thường (Ấp cáo, mèo, gấu trúc)", cost: 30, currency: "heroCoins", type: "pet_egg", value: "base", parentApproved: false, rarity: "common" },
  { id: "rp2", title: "Mua 🐺 Trứng Sói Chiến (Ấp sói nguyên tố hiếm)", cost: 80, currency: "heroCoins", type: "pet_egg", value: "wolf", parentApproved: false, rarity: "rare" },
  { id: "rp3", title: "Mua 🐉 Trứng Rồng Thần (Ấp rồng bay huyền thoại)", cost: 150, currency: "heroCoins", type: "pet_egg", value: "dragon", parentApproved: false, rarity: "legendary" },
  { id: "rp4", title: "Mua 🧪 Thuốc ấp phép ngẫu nhiên (Lửa, băng, ma thuật)", cost: 40, currency: "heroCoins", type: "pet_potion_random", value: "random", parentApproved: false, rarity: "rare" },
  { id: "rp5", title: "Mua 🥩 Combo Thức ăn Thần Kỳ (Thịt + Kẹo + Lá)", cost: 30, currency: "heroCoins", type: "pet_food_all", value: "all", parentApproved: false, rarity: "common" },
  { id: "r5", title: "Một ly kem tươi siêu to khổng lồ 🍨", cost: 100, currency: "heroCoins", type: "perk", value: "ice_cream", parentApproved: false, rarity: "common" },
  { id: "r6", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 300, currency: "heroCoins", type: "perk", value: "movie_night", parentApproved: false, rarity: "rare" },
  { id: "r7", title: "Một món đồ chơi tự chọn vừa phải 🧸", cost: 500, currency: "heroCoins", type: "perk", value: "small_toy", parentApproved: false, rarity: "epic" },
  { id: "r8", title: "Một bộ đồ chơi xếp hình LEGO siêu xịn 🧩", cost: 1000, currency: "heroCoins", type: "perk", value: "lego_set", parentApproved: false, rarity: "legendary" },
];

// Value Gap fix: real-world perks seeded per age. Screen-time / skip-card /
// streak-freeze / pet rewards above are universal; only the coin "perks" differ.
// Teens don't want "một ly kem" — they want money, autonomy, tech.
const TEEN_PERKS = [
  { id: "t_money1", title: "Tiền tiêu vặt 50.000₫ 💵", cost: 200, currency: "heroCoins", type: "perk", value: "cash_small", parentApproved: false, rarity: "rare" },
  { id: "t_late", title: "Thức khuya thêm 1 tiếng cuối tuần 🌙", cost: 250, currency: "heroCoins", type: "perk", value: "late_night", parentApproved: false, rarity: "rare" },
  { id: "t_out", title: "Đi chơi/cà phê với bạn (bố mẹ tài trợ) ☕", cost: 400, currency: "heroCoins", type: "perk", value: "hangout", parentApproved: false, rarity: "epic" },
  { id: "t_tech", title: "Phụ kiện công nghệ tự chọn (tai nghe, ốp...) 🎧", cost: 700, currency: "heroCoins", type: "perk", value: "tech_gear", parentApproved: false, rarity: "epic" },
  { id: "t_money2", title: "Tiền tiêu vặt 200.000₫ tự quản 💳", cost: 1000, currency: "heroCoins", type: "perk", value: "cash_big", parentApproved: false, rarity: "legendary" },
];

const KID_PERK_IDS = ["r5", "r6", "r7", "r8"];

/**
 * Default rewards for a fresh child, age-appropriate.
 * @param {"kid"|"teen"} [uiMode]
 */
export function defaultRewardsFor(uiMode) {
  if (uiMode === "teen") {
    return [...DEFAULT_REWARDS.filter((r) => !KID_PERK_IDS.includes(r.id)), ...TEEN_PERKS];
  }
  return DEFAULT_REWARDS;
}

// Default kid perk id→title, to recognise the UNTOUCHED seed for migration.
const KID_PERK_DEFAULTS = Object.fromEntries(
  DEFAULT_REWARDS.filter((r) => KID_PERK_IDS.includes(r.id)).map((r) => [r.id, r.title])
);

/**
 * One-time self-heal for children seeded BEFORE age-aware rewards: if a teen
 * still has the untouched default kid perks (kem/đồ chơi/lego), swap them for
 * teen perks. Safe + idempotent — only touches perks the parent never edited
 * (title still equals the default); custom rewards and deletions are preserved.
 * @param {Array} rewards
 * @param {"kid"|"teen"} [uiMode]
 * @returns {{ rewards: Array, changed: boolean }}
 */
export function reconcileRewardsForAge(rewards, uiMode) {
  if (uiMode !== "teen" || !Array.isArray(rewards)) return { rewards, changed: false };
  const untouchedKidPerks = rewards.filter(
    (r) => KID_PERK_DEFAULTS[r.id] !== undefined && r.title === KID_PERK_DEFAULTS[r.id]
  );
  if (untouchedKidPerks.length === 0) return { rewards, changed: false };

  const kept = rewards.filter((r) => !untouchedKidPerks.includes(r));
  const existingIds = new Set(kept.map((r) => r.id));
  const add = TEEN_PERKS.filter((r) => !existingIds.has(r.id)).map((r) => ({ ...r }));
  return { rewards: [...kept, ...add], changed: true };
}

export const DEFAULT_INVENTORY = {
  eggs: { base: 0, dragon: 0, wolf: 0 },
  potions: { fire: 0, ice: 0, magic: 0 },
  foods: { meat: 0, candy: 0, leaf: 0 },
};

/**
 * Build a fresh full game state for a child.
 * @param {{ name?: string, charClass?: string, stats?: object, uiMode?: "kid"|"teen" }} [opts]
 * @returns {object} full game state
 */
export function createInitialState(opts = {}) {
  const charClass = opts.charClass || "Warrior";
  const classDef = CHARACTER_CLASSES.find((c) => c.id === charClass);

  return {
    charName: opts.name || "",
    charClass,
    level: 1,
    exp: 0,
    streak: 0,
    streakFreezes: STARTING_STREAK_FREEZES,
    trustScore: TRUST_START,
    approvalNudges: [],
    energy: STARTING_ENERGY,
    stats: opts.stats || (classDef ? { ...classDef.baseStats } : { ...DEFAULT_STATS }),
    tasks: DEFAULT_TASKS.map((t) => ({ ...t })),
    rewards: defaultRewardsFor(opts.uiMode).map((r) => ({ ...r })),
    bossHp: BOSS_MAX_HP,
    bossMaxHp: BOSS_MAX_HP,
    bossName: "Thần Lười Biếng 😴",
    bossDefeated: false,
    bossWeekId: null,
    bossCycleCount: 0,
    bossChestOpened: false,
    screenTimeLeft: 0,
    isTimerActive: false,
    timerEndTime: 0,
    parentPin: "1234",
    encouragements: [],
    lastResetDate: "",
    heroCoins: 0,
    points: 0,
    lastPointsGain: null,
    miningHistory: [],
    inventory: {
      eggs: { ...DEFAULT_INVENTORY.eggs },
      potions: { ...DEFAULT_INVENTORY.potions },
      foods: { ...DEFAULT_INVENTORY.foods },
    },
    pets: [],
    activePet: null,
    activeMount: null,
    parentConfig: { ...DEFAULT_PARENT_CONFIG },
    screenMinutesUsedToday: 0,
    screenRedeemsThisWeek: 0,
    cosmetics: { owned: [], equipped: { hat: null, frame: null, petAccessory: null, roomWall: null, roomFloor: null, roomFurniture: null, roomPet: null } },
    history: [],
    graduatedHabits: [],
    lastGraduation: null,
    childMessages: [],
    receivedGifts: [],
    treeGrowth: 0,
    journey: null,
    journeysCompleted: [],
    lastJourneyCompleted: null,
  };
}
