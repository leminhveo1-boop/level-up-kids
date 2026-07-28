/**
 * Game constants & initial-state factory.
 * Pure data — no React, no side effects.
 */

// Tỷ giá tiền tệ CỐ ĐỊNH: 1 xu (heroCoin) = 1000đ. Minh bạch để phụ huynh nhập
// giá quà bằng VNĐ (300.000đ → 300 xu) và trẻ nhẩm được. Thay công thức động cũ.
export const COIN_RATE_VND = 1000;
// Phiên bản state — gate cho migration rescale (chỉ chạy 1 lần cho state v1).
export const STATE_VERSION = 2;

export const ENERGY_CAP = 100;
export const STARTING_ENERGY = 15;
export const DAILY_ENERGY_BONUS = 5;
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
export const BOSS_LOOT_COIN_MIN = 20; // rương boss hào phóng hơn hẳn đào mỏ thường
export const BOSS_LOOT_COIN_MAX = 40;

export const DEFAULT_PARENT_CONFIG = {
  screenMaxMinutesPerDay: 60,
  screenRedeemMaxPerWeek: 5,
  requireAllMandatory: true,
  maxCoinBalance: 2000,
  // Pha E — Lương xu minh bạch có trần (spec SPEC_KINH_TE_XU_MINH_BACH.md).
  // 0 = lương xu TẮT (an toàn: state cũ không bỗng phát tiền). Bố mẹ đặt quỹ mới bật.
  allowanceBudgetVnd: 0, // Quỹ tiêu vặt/chu kỳ, VNĐ. budgetCoins = round(vnd / COIN_RATE_VND)
  allowancePeriod: "week", // "week" | "month" — chu kỳ nạp lại quỹ (bố mẹ tùy chỉnh)
  smartAutoApprove: true, // Uy Tín ≥80: việc tự-ghi-nhận nhả điểm ngay (chế độ tự lái)
  busyUntil: 0, // Tuần Bận: trước mốc này MỌI việc nhả điểm ngay (0 = tắt)
  // GĐ0 A0.5 — Scaffolding Level 1-2-3 (cơ chế luồng scale theo năng lực thực).
  scaffoldLevel: 1, // 1|2|3 — level hiệu lực (con đang trải luồng này). Đọc qua getScaffoldLevel().
  scaffoldMode: "auto", // "auto" | "manual" (manual = phụ huynh khoá tay, tắt auto)
  scaffoldPendingLevel: null, // null|2|3 — khuyến nghị THĂNG đang chờ phụ huynh mở
  scaffoldChangedAt: "", // YYYY-MM-DD lần đổi level gần nhất (cho cooldown)
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
//
// GĐ0 A0.1: mỗi task còn có 2 field TÙY CHỌN cho North Star (vắng = mặc định):
//   importance (bool, default false) — việc "quan trọng dài hạn" con nên TỰ
//     khởi động; là mẫu số của North Star. Phụ huynh sửa được (applyTaskEdit).
//   dueDate (string|null, default null) — hạn giờ/ngày, để tinh chỉnh sau. Chưa
//     có compute nào đọc dueDate (ponytail: nối khi có lịch giờ trong ngày).
// Seed importance=true cho 3 việc HỌC bắt buộc (thể dục/đọc/tiếng Anh) để North
// Star có mẫu số ngay; các việc khác để phụ huynh tự gắn cờ.
export const DEFAULT_TASKS = [
  { id: "t1", title: "Dậy đúng giờ đón bình minh 🌅", exp: 10, points: 5, energy: 1, category: "discipline", completed: false, statKey: "discipline", statVal: 1, isMandatory: false, verifyType: "parent" },
  { id: "t2", title: "Tập thể dục năng động 15 phút 🏃‍♂️", exp: 20, points: 10, energy: 2, category: "strength", completed: false, statKey: "strength", statVal: 2, isMandatory: true, verifyType: "focus", durationMin: 15, importance: true },
  { id: "t3", title: "Đọc sách tinh hoa 20 phút 📚", exp: 20, points: 10, energy: 2, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true, verifyType: "focus", durationMin: 20, importance: true },
  { id: "t4", title: "Học tiếng Anh hoặc tìm hiểu AI 🤖", exp: 20, points: 10, energy: 2, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true, verifyType: "focus", durationMin: 20, importance: true },
  { id: "t5", title: "Lau dọn nhà cửa & quét dọn phụ mẹ 🧹", exp: 25, points: 12, energy: 2, category: "help", completed: false, statKey: "help", statVal: 2, isMandatory: false, verifyType: "trust" },
  { id: "t6", title: "Làm chủ cảm xúc, luôn mỉm cười 🌸", exp: 15, points: 8, energy: 1, category: "help", completed: false, statKey: "help", statVal: 1, isMandatory: false, verifyType: "trust" },
  { id: "t7", title: "Sắp xếp phòng ngủ ngăn nắp, xếp chăn màn ✨", exp: 20, points: 10, energy: 2, category: "discipline", completed: false, statKey: "discipline", statVal: 2, isMandatory: false, verifyType: "trust" },
  { id: "t8", title: "Viết nhật ký cảm xúc & bài học ngày ✍️", exp: 15, points: 8, energy: 1, category: "creative", completed: false, statKey: "creative", statVal: 1, isMandatory: false, verifyType: "trust" },
  { id: "t9", title: "Chăm sóc, tưới cây hoặc cho thú cưng ăn 🌿", exp: 20, points: 10, energy: 2, category: "creative", completed: false, statKey: "creative", statVal: 2, isMandatory: false, verifyType: "trust" },
  { id: "t10", title: "Tuân thủ giới hạn xem TV/chơi Game 📺", exp: 30, points: 15, energy: 3, category: "discipline", completed: false, statKey: "discipline", statVal: 3, isMandatory: true, verifyType: "parent" },
  // Connection quest 💞 — the value IS the connection; the tap is an afterthought
  { id: "tc1", title: "Kể cho bố mẹ nghe 3 điều về ngày hôm nay 💞", exp: 20, points: 10, energy: 2, category: "connection", completed: false, statKey: "help", statVal: 2, isMandatory: false, verifyType: "parent" },
];

export const DEFAULT_REWARDS = [
  { id: "r1", title: "Đổi 20 phút chơi game / xem TV 📺", cost: 40, currency: "points", type: "game_time", value: 20, parentApproved: false, rarity: "common" },
  { id: "r2", title: "Đổi 45 phút chơi game / xem TV 🚀", cost: 80, currency: "points", type: "game_time", value: 45, parentApproved: false, rarity: "common" },
  { id: "r3", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 150, currency: "points", type: "perk", value: "movie_tickets", parentApproved: false, rarity: "rare" },
  { id: "r4", title: "Thẻ bài miễn làm 1 nhiệm vụ ngày 🎟️", cost: 100, currency: "points", type: "card", value: "skip_task", parentApproved: false, rarity: "epic" },
  // Pha E — thẻ đóng băng & pet mua bằng ĐIỂM ⭐ (tiền game). Chăm pet = tiêu Điểm kiếm
  // từ nhiệm vụ → vòng "làm việc tốt để nuôi bạn nhỏ", không tốn tiền thật (spec §6).
  { id: "rf1", title: "❄️ Thẻ Đóng Băng Streak (nghỉ 1 ngày không mất lửa)", cost: 40, currency: "points", type: "streak_freeze", value: 1, parentApproved: false, rarity: "rare" },
  { id: "rp1", title: "Mua 🥚 Trứng Thường (Ấp cáo, mèo, gấu trúc)", cost: 60, currency: "points", type: "pet_egg", value: "base", parentApproved: false, rarity: "common" },
  // rp2 — DUY NHẤT loại mua bằng Xu 🪙 giá rẻ: con tự thưởng bằng tiền tiêu vặt (founder chọn 1–2 mục).
  { id: "rp2", title: "Mua 🐺 Trứng Sói Chiến (dùng Xu tiêu vặt tự thưởng)", cost: 15, currency: "heroCoins", type: "pet_egg", value: "wolf", parentApproved: false, rarity: "rare" },
  { id: "rp3", title: "Mua 🐉 Trứng Rồng Thần (Ấp rồng bay huyền thoại)", cost: 300, currency: "points", type: "pet_egg", value: "dragon", parentApproved: false, rarity: "legendary" },
  { id: "rp4", title: "Mua 🧪 Thuốc ấp phép ngẫu nhiên (Lửa, băng, ma thuật)", cost: 80, currency: "points", type: "pet_potion_random", value: "random", parentApproved: false, rarity: "rare" },
  { id: "rp5", title: "Mua 🥩 Combo Thức ăn Thần Kỳ (Thịt + Kẹo + Lá)", cost: 60, currency: "points", type: "pet_food_all", value: "all", parentApproved: false, rarity: "common" },
  { id: "r5", title: "Một ly kem tươi siêu to khổng lồ 🍨", cost: 20, currency: "heroCoins", type: "perk", value: "ice_cream", parentApproved: false, rarity: "common" },
  { id: "r6", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 80, currency: "heroCoins", type: "perk", value: "movie_night", parentApproved: false, rarity: "rare" },
  { id: "r7", title: "Một món đồ chơi tự chọn vừa phải 🧸", cost: 100, currency: "heroCoins", type: "perk", value: "small_toy", parentApproved: false, rarity: "epic" },
  { id: "r8", title: "Một bộ đồ chơi xếp hình LEGO siêu xịn 🧩", cost: 500, currency: "heroCoins", type: "perk", value: "lego_set", parentApproved: false, rarity: "legendary" },
];

// Value Gap fix: real-world perks seeded per age. Screen-time / skip-card /
// streak-freeze / pet rewards above are universal; only the coin "perks" differ.
// Teens don't want "một ly kem" — they want money, autonomy, tech.
const TEEN_PERKS = [
  { id: "t_money1", title: "Tiền tiêu vặt 50.000₫ 💵", cost: 50, currency: "heroCoins", type: "perk", value: "cash_small", parentApproved: false, rarity: "rare" },
  { id: "t_late", title: "Thức khuya thêm 1 tiếng cuối tuần 🌙", cost: 50, currency: "heroCoins", type: "perk", value: "late_night", parentApproved: false, rarity: "rare" },
  { id: "t_out", title: "Đi chơi/cà phê với bạn (bố mẹ tài trợ) ☕", cost: 80, currency: "heroCoins", type: "perk", value: "hangout", parentApproved: false, rarity: "epic" },
  { id: "t_tech", title: "Phụ kiện công nghệ tự chọn (tai nghe, ốp...) 🎧", cost: 150, currency: "heroCoins", type: "perk", value: "tech_gear", parentApproved: false, rarity: "epic" },
  { id: "t_money2", title: "Tiền tiêu vặt 200.000₫ tự quản 💳", cost: 200, currency: "heroCoins", type: "perk", value: "cash_big", parentApproved: false, rarity: "legendary" },
];

const KID_PERK_IDS = ["r5", "r6", "r7", "r8"];

// Pha E §7.2 — gợi ý quà Xu (đời thực) theo tuổi, có giá VNĐ mẫu. Bố mẹ 1-chạm
// thêm vào cửa hàng rồi chỉnh giá tuỳ vùng miền. cost = round(vnd/1000). Không auto-ghi-đè.
export const ALLOWANCE_PERK_SEEDS = {
  kid: [
    { title: "🧋 Một ly trà sữa", vnd: 25000 },
    { title: "🍗 Phần gà rán", vnd: 40000 },
    { title: "📚 Một cuốn truyện tranh", vnd: 25000 },
    { title: "🛼 Đi chơi patin", vnd: 60000 },
    { title: "📖 Đi nhà sách chọn 1 quyển", vnd: 50000 },
    { title: "🍕 Một phần pizza", vnd: 90000 },
    { title: "🍨 Ly kem tươi", vnd: 20000 },
  ],
  teen: [
    { title: "☕ Cà phê với bạn", vnd: 40000 },
    { title: "💵 Tiền tiêu vặt tự quản", vnd: 50000 },
    { title: "🎧 Phụ kiện công nghệ tự chọn", vnd: 150000 },
    { title: "🌙 Thức khuya thêm 1 tiếng cuối tuần", vnd: 50000 },
    { title: "🎬 Vé xem phim rạp", vnd: 60000 },
  ],
};

// Every default reward (kid + teen) by id — migration dùng để nhận diện "seed
// mặc định CHƯA sửa" (id + title khớp) → thay bằng entry giá mới, thay vì rescale mù.
export const ALL_DEFAULT_REWARDS = [...DEFAULT_REWARDS, ...TEEN_PERKS];

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

// Pha E §6 — pet/thẻ đổi từ Xu 🪙 sang Điểm ⭐ (rp2 giữ Xu rẻ). Nhận diện seed CHƯA sửa
// qua title (cũ hoặc mới) để đổi sang default mới; parent sửa title → giữ nguyên (không đụng).
const PET_REWARD_IDS = ["rf1", "rp1", "rp2", "rp3", "rp4", "rp5"];
const PET_REWARD_DEF_BY_ID = new Map(
  DEFAULT_REWARDS.filter((r) => PET_REWARD_IDS.includes(r.id)).map((r) => [r.id, r])
);
// Title mặc định LỊCH SỬ (trước Pha E) cho các mục đã đổi tên — để nhận ra seed cũ.
const PET_REWARD_LEGACY_TITLES = {
  rp2: ["Mua 🐺 Trứng Sói Chiến (Ấp sói nguyên tố hiếm)"],
};

/**
 * One-time self-heal: đổi tiền tệ/giá pet & thẻ đóng băng sang chuẩn Pha E cho state cũ
 * (mọi version). Chỉ động vào seed CHƯA bị sửa tên; quà custom/đổi tên → bảo toàn.
 * @param {Array} rewards
 * @returns {{ rewards: Array, changed: boolean }}
 */
export function reconcilePetRewardCurrency(rewards) {
  if (!Array.isArray(rewards)) return { rewards, changed: false };
  let changed = false;
  const next = rewards.map((r) => {
    const def = PET_REWARD_DEF_BY_ID.get(r.id);
    if (!def) return r;
    const knownTitles = [def.title, ...(PET_REWARD_LEGACY_TITLES[r.id] || [])];
    if (!knownTitles.includes(r.title)) return r; // parent đã đổi tên → tôn trọng
    if (r.currency === def.currency && r.cost === def.cost && r.title === def.title) return r;
    changed = true;
    return { ...r, title: def.title, currency: def.currency, cost: def.cost };
  });
  return { rewards: changed ? next : rewards, changed };
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
    stateVersion: STATE_VERSION,
    charName: opts.name || "",
    // §13 — năm sinh cho hệ quả theo tuổi; thiếu → null → fallback ui_mode.
    birthYear: Number.isInteger(opts.birthYear) ? opts.birthYear : null,
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
    remindersToday: 0, // GĐ0 North Star: số lần bố mẹ phải nhắc trong ngày (reset mỗi ngày)
    // Pha E — trần KIẾM xu theo chu kỳ. budgetCoins luôn tính từ parentConfig (không lưu ở đây).
    allowance: { periodKey: "", earnedCoins: 0 },
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
    tomorrowPlan: null,
  };
}
