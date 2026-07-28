/**
 * Economy core — PURE functions, fully unit-testable.
 * Every function takes a full game state and returns { state, ... } — never mutates input.
 * Randomness is injected via `rng` (defaults to Math.random) for deterministic tests.
 */

import {
  ENERGY_CAP,
  DAILY_ENERGY_BONUS,
  STREAK_MIN_TASKS,
  CRIT_POINT_CHANCE,
  MINING_HISTORY_LIMIT,
  BOSS_MAX_HP,
  MOUNT_ENERGY_MULTIPLIER,
  MOUNT_CRIT_BONUS,
  BASE_MINING_CRIT_CHANCE,
  STREAK_FREEZE_CAP,
  ESCROW_AUTO_APPROVE_MS,
  TRUST_MAX,
  TRUST_MIN,
  TRUST_GAIN_ON_APPROVE,
  TRUST_LOSS_ON_REJECT,
  TRUST_HIGH_THRESHOLD,
  NUDGE_LIMIT_PER_DAY,
  HISTORY_LIMIT_DAYS,
  GRADUATION_DAYS,
  FOCUS_BONUS_MIN,
  FOCUS_BONUS_RATIO,
  FADE_START,
  FADE_FLOOR,
  COIN_RATE_VND,
} from "./constants";
import { advanceBossWeek } from "./boss";
import { decayPetsHunger } from "./pets";
import { TREE_GROWTH_PER_APPROVAL } from "./worldTree";
import { advanceJourneyDaily } from "./journeys";
import { generateTimetableTasks } from "./timetable";
import { northStarSignals } from "./progress";
import { groupSignals } from "./scoreboard";
import { evaluateScaffoldLevel } from "./scaffolding";
import { isConsciouslyHandled, clearRescue } from "./rescue";
import { dateKey } from "./planning";

/* ===================================================================
 * Pha E — LƯƠNG XU MINH BẠCH CÓ TRẦN (spec SPEC_KINH_TE_XU_MINH_BACH.md)
 * Xu 🪙 = tiền THẬT tiêu vặt, CHỈ từ lương nhiệm vụ minh bạch trong TRẦN quỹ
 * bố mẹ đặt. P1: minh bạch tuyệt đối (không ngẫu nhiên). Q3: bỏ trần số dư.
 * =================================================================== */

/**
 * Khoá chu kỳ quỹ hiện tại. week → ISO week "YYYY-Www" (tuần bắt đầu Thứ Hai,
 * chuẩn VN); month → "YYYY-MM". Tất định theo `now` để test ổn định.
 * @param {"week"|"month"} period
 * @param {Date|number} [now]
 * @returns {string}
 */
export function computePeriodKey(period, now = new Date()) {
  const d = now instanceof Date ? now : new Date(now);
  if (period === "month") {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  // ISO 8601 week: chuẩn hoá qua UTC theo các thành phần LỊCH địa phương (né lệch múi giờ).
  const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = u.getUTCDay() || 7; // Thứ Hai=1 … Chủ Nhật=7
  u.setUTCDate(u.getUTCDate() + 4 - dayNum); // dời tới Thứ Năm cùng tuần
  const yearStart = new Date(Date.UTC(u.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((u - yearStart) / 86400000 + 1) / 7);
  return `${u.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/** Trần KIẾM xu của chu kỳ = round(quỹ VNĐ / tỷ giá). budget=0 ⇒ lương xu TẮT. */
export function budgetCoinsFor(parentConfig) {
  const vnd = parentConfig?.allowanceBudgetVnd || 0;
  return Math.round(vnd / COIN_RATE_VND);
}

/**
 * Lazy-reset trần kiếm khi sang chu kỳ mới (không cần cron). Cùng chu kỳ → nguyên trạng.
 * @param {object} state
 * @param {Date|number} [now]
 * @returns {object} state (mới nếu đổi chu kỳ, nguyên bản nếu không)
 */
export function rollAllowancePeriod(state, now = new Date()) {
  const period = state.parentConfig?.allowancePeriod || "week";
  const key = computePeriodKey(period, now);
  const cur = state.allowance || { periodKey: "", earnedCoins: 0 };
  if (cur.periodKey === key) return state;
  return { ...state, allowance: { periodKey: key, earnedCoins: 0 } };
}

/**
 * Tính lượng xu cấp cho 1 lần thực-nhận, CLAMP theo trần quỹ còn lại (I1/I2).
 * KHÔNG áp maxCoinBalance (Q3 bỏ trần số dư). Trả về state đã roll chu kỳ + số cấp.
 * @returns {{ state: object, granted: number, capped: boolean }}
 */
function grantAllowanceCoins(state, coinReward, now) {
  const wanted = Math.max(0, Math.floor(coinReward || 0));
  const rolled = rollAllowancePeriod(state, now);
  if (wanted === 0) return { state: rolled, granted: 0, capped: false };
  const budgetCoins = budgetCoinsFor(rolled.parentConfig);
  const earned = rolled.allowance?.earnedCoins || 0;
  const room = Math.max(0, budgetCoins - earned);
  const granted = Math.min(wanted, room);
  if (granted === 0) return { state: rolled, granted: 0, capped: wanted > 0 };
  return {
    state: {
      ...rolled,
      heroCoins: (rolled.heroCoins || 0) + granted,
      allowance: { ...rolled.allowance, earnedCoins: earned + granted },
    },
    granted,
    capped: wanted > granted,
  };
}

/**
 * PROD-1 — reward dose factor: việc đã thành nếp (habitStreak cao) rút DẦN liều điểm.
 * Ease-in `p²` (lồi): nửa đầu cửa sổ phẳng, dốc dồn về sát tốt nghiệp. Luôn ∈ [FADE_FLOOR, 1].
 * Chống overjustification (thẻ #10 + DEEP #3). SPEC: docs/SPEC_PROD1_CAN_LIEU_THUONG.md.
 * @param {number} habitStreak số ngày làm liên tục của việc (thiếu → 0 → đủ liều)
 * @returns {number} hệ số nhân lên điểm cơ bản của việc
 */
export function rewardDoseFactor(
  habitStreak,
  fadeStart = FADE_START,
  floor = FADE_FLOOR,
  graduation = GRADUATION_DAYS
) {
  const h = habitStreak || 0;
  if (h <= fadeStart) return 1;
  if (h >= graduation) return floor; // đã tốt nghiệp (rời list) — clamp phòng thủ
  const p = (h - fadeStart) / (graduation - fadeStart);
  return Math.max(floor, 1 - (1 - floor) * p * p);
}

/** Streak → points multiplier (balanced against inflation). */
export function getStreakMultiplier(streak) {
  if (streak >= 7) return 1.5;
  if (streak >= 5) return 1.25;
  if (streak >= 3) return 1.1;
  return 1.0;
}

/**
 * Apply EXP gain with MULTI-LEVEL-UP support (fixes single-level bug).
 * @returns {{ level: number, exp: number, levelsGained: number }}
 */
export function applyExpGain(level, exp, gained) {
  let newLevel = level;
  let newExp = exp + gained;
  let levelsGained = 0;
  while (newExp >= newLevel * 100) {
    newExp -= newLevel * 100;
    newLevel += 1;
    levelsGained += 1;
  }
  return { level: newLevel, exp: newExp, levelsGained };
}

/**
 * Complete a task (idempotent on already-completed tasks).
 * @param {object} state full game state
 * @param {string} taskId
 * @param {() => number} [rng]
 * @returns {{ state: object, events: { leveledUp: boolean, levelsGained: number, isCritical: boolean, pointsAdded: number, energyAdded: number, bossDefeated: boolean } | null }}
 */
export function completeTask(state, taskId, rng = Math.random, opts = {}) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.completed) return { state, events: null };

  // EXP + multi-level
  const expResult = applyExpGain(state.level, state.exp, task.exp);

  // Points: crit 15% then streak multiplier
  const isCritical = rng() < CRIT_POINT_CHANCE;
  const rawPoints = task.points !== undefined ? task.points : task.exp;
  // PROD-1: việc đã thành nếp rút DẦN liều điểm (chống "làm vì thưởng"). Áp lên
  // điểm CƠ BẢN trước crit/streak; focus-bonus (thưởng nỗ lực thêm) KHÔNG fade.
  const dose = rewardDoseFactor(task.habitStreak);
  let basePoints = rawPoints * dose;
  if (isCritical) basePoints *= 2;
  // V1.3: optional focus-session bonus (never required — Forest-style reward)
  const focusBonus = opts.focusEarned ? Math.max(FOCUS_BONUS_MIN, Math.round(rawPoints * FOCUS_BONUS_RATIO)) : 0;
  const pointsAdded = Math.ceil(basePoints * getStreakMultiplier(state.streak)) + focusBonus;

  // Energy (mount bonus)
  let energyAdded = task.energy || 0;
  if (state.activeMount) energyAdded = Math.ceil(energyAdded * MOUNT_ENERGY_MULTIPLIER);

  // Boss damage
  const damage = Math.ceil(task.exp / 3);
  const nextBossHp = state.bossDefeated ? 0 : Math.max(0, state.bossHp - damage);
  const bossJustDefeated = !state.bossDefeated && nextBossHp === 0;

  // ===== ESCROW (P0): points are held pending parent approval; EXP/energy/stats
  // credit immediately to preserve the same-day fun loop (mining). Points are the
  // screen-time currency — the cheat-worthy one — so they gate on the Check step.
  // Đợt Bằng Chứng: high-trust kids (Uy Tín ≥80) get self-reported ("trust") tasks
  // released instantly — the parent's "autopilot mode"; toggleable in Hệ Thống.
  const trustAutoApproved =
    !task.wasApprovedToday &&
    task.verifyType === "trust" &&
    (state.trustScore || 0) >= TRUST_HIGH_THRESHOLD &&
    state.parentConfig?.smartAutoApprove !== false;
  const now = opts.now ?? Date.now();
  // B-lite: Tuần Bận — parent switched to full autopilot for a few days:
  // EVERY claim releases instantly (approval "auto", trust untouched).
  const busyAutoApproved =
    !task.wasApprovedToday && (state.parentConfig?.busyUntil || 0) > now;
  const instantApproved = Boolean(task.wasApprovedToday) || trustAutoApproved || busyAutoApproved;
  const approvalStatus = task.wasApprovedToday
    ? "approved"
    : trustAutoApproved || busyAutoApproved
      ? "auto"
      : "pending";

  // Pha E — Xu 🪙 chỉ vào ví khi việc THỰC-NHẬN (instant-approve). Non-instant → chờ
  // approveTask cấp lúc duyệt (escrow). coinGrant cũng roll chu kỳ quỹ (lazy reset).
  const coinGrant = grantAllowanceCoins(state, instantApproved ? task.coinReward : 0, now);

  const nextTasks = coinGrant.state.tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          completed: true,
          // Same-day re-tick of a previously-approved task restores approval
          // instantly (grace path — no double verification, no re-escrow)
          approval: approvalStatus,
          pendingPoints: instantApproved ? 0 : pointsAdded,
          earnedPoints: instantApproved ? pointsAdded : 0,
          // Xu thực-nhận ghi lên task để uncomplete hoàn đúng số (I5)
          earnedCoinReward: instantApproved ? coinGrant.granted : 0,
          wasApprovedToday: undefined,
          completedAt: Date.now(),
          earnedEnergy: energyAdded,
        }
      : t
  );

  const nextStats = task.statKey
    ? { ...state.stats, [task.statKey]: (state.stats[task.statKey] || 0) + task.statVal }
    : state.stats;

  return {
    state: {
      ...coinGrant.state,
      tasks: nextTasks,
      stats: nextStats,
      level: expResult.level,
      exp: expResult.exp,
      points: instantApproved ? state.points + pointsAdded : state.points,
      // D5: released points also drip sap into the family World Tree
      treeGrowth: (state.treeGrowth || 0) + (instantApproved ? TREE_GROWTH_PER_APPROVAL : 0),
      energy: Math.min(ENERGY_CAP, state.energy + energyAdded),
      bossHp: nextBossHp,
      bossDefeated: state.bossDefeated || bossJustDefeated,
      lastPointsGain: {
        amount: pointsAdded,
        isCritical,
        taskTitle: task.title,
        timestamp: Date.now(),
        pending: !instantApproved,
      },
    },
    events: {
      leveledUp: expResult.levelsGained > 0,
      levelsGained: expResult.levelsGained,
      isCritical,
      pointsAdded,
      focusBonus,
      pointsPending: !instantApproved,
      trustAutoApproved,
      busyAutoApproved,
      energyAdded,
      bossDefeated: bossJustDefeated,
      coinsGranted: coinGrant.granted,
      coinsCapped: coinGrant.capped,
    },
  };
}

/**
 * Approve a pending task: release held points to wallet, +trust.
 * @param {object} state
 * @param {string} taskId
 * @param {{ auto?: boolean }} [opts] auto=true when system approves (24h expiry / daily reset)
 */
export function approveTask(state, taskId, opts = {}) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.approval !== "pending") return { state, result: { success: false, error: "NOT_PENDING" } };

  const released = task.pendingPoints || 0;
  // Pha E — duyệt = thời điểm THỰC-NHẬN xu (escrow). Cấp trong trần quỹ (I1/I2), roll chu kỳ.
  const now = opts.now ?? Date.now();
  const coinGrant = grantAllowanceCoins(state, task.coinReward, now);

  return {
    state: {
      ...coinGrant.state,
      points: coinGrant.state.points + released,
      trustScore: Math.min(TRUST_MAX, (coinGrant.state.trustScore || 0) + TRUST_GAIN_ON_APPROVE),
      // D5: an approved task grows the family World Tree
      treeGrowth: (coinGrant.state.treeGrowth || 0) + TREE_GROWTH_PER_APPROVAL,
      tasks: coinGrant.state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, approval: opts.auto ? "auto" : "approved", earnedPoints: released, pendingPoints: 0, earnedCoinReward: coinGrant.granted }
          : t
      ),
    },
    result: { success: true, released, auto: Boolean(opts.auto), coinsGranted: coinGrant.granted, coinsCapped: coinGrant.capped },
  };
}

/** Approve every pending task at once (parent's 1-minute batch review). */
export function approveAllPending(state, opts = {}) {
  let next = state;
  let totalReleased = 0;
  let count = 0;
  for (const t of state.tasks) {
    if (t.approval === "pending") {
      const r = approveTask(next, t.id, opts);
      next = r.state;
      totalReleased += r.result.released || 0;
      count += 1;
    }
  }
  return { state: next, result: { success: true, count, totalReleased } };
}

/**
 * Reject a pending task: undo the completion (exp/energy/stats/boss), heavy trust hit.
 * Held points simply evaporate (never credited). Pet/level assets untouched by design.
 */
/**
 * C2.5 — lý do trả-về-làm-lại cụ thể, nối Definition of Done: bố mẹ chọn 1 nút
 * thay vì bác cụt lủn, con biết ĐÚNG chỗ cần hoàn thiện (chất lượng / đúng giờ /
 * đủ bước). Khung "làm lại" chứ không phải trừng phạt.
 */
export const REJECT_REASONS = [
  { id: "unclean", label: "Chưa sạch/gọn", kidHint: "làm sạch gọn hơn chút nữa nhé" },
  { id: "late", label: "Trễ giờ", kidHint: "lần sau làm đúng giờ hơn nhé" },
  { id: "incomplete", label: "Làm còn thiếu", kidHint: "còn thiếu vài bước, con làm nốt nhé" },
];
const REJECT_REASON_IDS = new Set(REJECT_REASONS.map((r) => r.id));

export function rejectTask(state, taskId, reasonId = null) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.approval !== "pending") return { state, result: { success: false, error: "NOT_PENDING" } };

  const energyToRevert = task.earnedEnergy ?? task.energy ?? 0;
  const nextStats = task.statKey
    ? { ...state.stats, [task.statKey]: Math.max(10, (state.stats[task.statKey] || 10) - task.statVal) }
    : state.stats;
  // chỉ nhận id hợp lệ; lý do lạ/không có → null (không tin dữ liệu ngoài)
  const rejectReason = REJECT_REASON_IDS.has(reasonId) ? reasonId : null;

  return {
    state: {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: false, approval: undefined, pendingPoints: 0, earnedEnergy: 0, wasRejected: true, rejectReason }
          : t
      ),
      stats: nextStats,
      exp: Math.max(0, state.exp - task.exp),
      energy: Math.max(0, state.energy - energyToRevert),
      bossHp: state.bossDefeated ? 0 : Math.min(state.bossMaxHp || BOSS_MAX_HP, state.bossHp + Math.ceil(task.exp / 3)),
      trustScore: Math.max(TRUST_MIN, (state.trustScore || 0) - TRUST_LOSS_ON_REJECT),
    },
    result: { success: true, taskTitle: task.title, rejectReason },
  };
}

/** Auto-approve pending tasks older than 24h — parent forgot ⇒ default is TRUST. */
export function autoApproveExpired(state, now = Date.now()) {
  let next = state;
  let count = 0;
  for (const t of state.tasks) {
    if (t.approval === "pending" && t.completedAt && now - t.completedAt >= ESCROW_AUTO_APPROVE_MS) {
      next = approveTask(next, t.id, { auto: true }).state;
      count += 1;
    }
  }
  return { state: next, result: { count } };
}

/** Child nudges parents to review (max NUDGE_LIMIT_PER_DAY per day). */
export function addApprovalNudge(state, now = Date.now()) {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const todayNudges = (state.approvalNudges || []).filter((ts) => ts >= startOfDay.getTime());

  if (todayNudges.length >= NUDGE_LIMIT_PER_DAY) {
    return { state, result: { success: false, error: "NUDGE_LIMIT", max: NUDGE_LIMIT_PER_DAY } };
  }

  return {
    state: { ...state, approvalNudges: [...todayNudges, now] },
    result: { success: true, remaining: NUDGE_LIMIT_PER_DAY - todayNudges.length - 1 },
  };
}

/** Count tasks waiting for parent approval. */
export function countPending(state) {
  return state.tasks.filter((t) => t.approval === "pending").length;
}

/**
 * Un-complete a task, reverting exactly what was earned.
 * @returns {{ state: object, events: object | null }}
 */
export function uncompleteTask(state, taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || !task.completed) return { state, events: null };

  // Escrow-aware: pending points were never credited → only revert wallet when approved
  const wasApproved = task.approval === "approved" || task.approval === "auto";
  const pointsToRevert = wasApproved ? task.earnedPoints ?? task.points ?? task.exp : 0;
  const energyToRevert = task.earnedEnergy ?? task.energy ?? 0;
  // Pha E — xu chỉ vào ví khi đã thực-nhận; hoàn ĐÚNG số đã cấp, trả lại room quỹ (I5).
  const coinsToRevert = wasApproved ? Math.max(0, Math.floor(task.earnedCoinReward || 0)) : 0;
  const prevEarnedCoins = state.allowance?.earnedCoins || 0;

  const nextTasks = state.tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          completed: false,
          approval: undefined,
          pendingPoints: 0,
          earnedPoints: 0,
          earnedCoinReward: 0,
          earnedEnergy: 0,
          evidencePhoto: undefined,
          // Same-day grace: an accidentally un-ticked APPROVED task can be
          // re-ticked without redoing verification (no 15-min timer twice!)
          wasApprovedToday: wasApproved ? true : t.wasApprovedToday,
        }
      : t
  );

  const nextStats = task.statKey
    ? { ...state.stats, [task.statKey]: Math.max(10, (state.stats[task.statKey] || 10) - task.statVal) }
    : state.stats;

  return {
    state: {
      ...state,
      tasks: nextTasks,
      stats: nextStats,
      exp: Math.max(0, state.exp - task.exp),
      points: Math.max(0, state.points - pointsToRevert),
      heroCoins: Math.max(0, (state.heroCoins || 0) - coinsToRevert),
      allowance: { ...(state.allowance || { periodKey: "", earnedCoins: 0 }), earnedCoins: Math.max(0, prevEarnedCoins - coinsToRevert) },
      energy: Math.max(0, state.energy - energyToRevert),
      bossHp: state.bossDefeated ? 0 : Math.min(state.bossMaxHp || BOSS_MAX_HP, state.bossHp + Math.ceil(task.exp / 3)),
      lastPointsGain: null,
    },
    events: { pointsReverted: pointsToRevert, energyReverted: energyToRevert, coinsReverted: coinsToRevert },
  };
}

/**
 * Mine once: consumes 1 energy, returns loot (coins or pet material).
 * @param {object} state
 * @param {() => number} [rng]
 * @returns {{ state: object, result: object }}
 */
export function mineTreasure(state, rng = Math.random) {
  if (state.energy < 1) {
    return { state, result: { success: false, error: "NO_ENERGY" } };
  }

  const baseState = { ...state, energy: Math.max(0, state.energy - 1) };

  // Crit chance: exercise buff or mount
  const hasMount = Boolean(state.activeMount && state.pets.some((p) => p.id === state.activeMount));
  const critChance = BASE_MINING_CRIT_CHANCE + (hasMount ? MOUNT_CRIT_BONUS : 0);
  const hasExerciseBuff = state.tasks.some((t) => t.category === "strength" && t.completed);
  const isCritical = (hasExerciseBuff || hasMount) && rng() < critChance;

  const pushHistory = (record) =>
    [record, ...state.miningHistory].slice(0, MINING_HISTORY_LIMIT);

  const makeId = () => "mine_" + Date.now() + "_" + Math.floor(rng() * 1e9).toString(36);

  // 15% chance: pet material drop
  if (rng() < 0.15) {
    const materialRand = rng();
    let inventory = state.inventory;
    let title = "";
    let lootType = "common";
    let rarityText = "Nguyên liệu 📦";

    if (materialRand < 0.46) {
      const foodKeys = ["meat", "candy", "leaf"];
      const foodNames = { meat: "🥩 Thịt Bò", candy: "🍬 Kẹo Ngọt", leaf: "🌿 Lá Cây" };
      const key = foodKeys[Math.floor(rng() * foodKeys.length)];
      inventory = { ...inventory, foods: { ...inventory.foods, [key]: inventory.foods[key] + 1 } };
      title = `📦 Nhận 1 Thức ăn: ${foodNames[key]}`;
      lootType = "rare";
      rarityText = "Thức Ăn 🥩";
    } else if (materialRand < 0.8) {
      const potionKeys = ["fire", "ice", "magic"];
      const potionNames = { fire: "🔥 Thuốc Lửa", ice: "❄️ Thuốc Băng", magic: "✨ Thuốc Thần Kỳ" };
      const key = potionKeys[Math.floor(rng() * potionKeys.length)];
      inventory = { ...inventory, potions: { ...inventory.potions, [key]: inventory.potions[key] + 1 } };
      title = `🧪 Nhận 1 Thuốc ấp: ${potionNames[key]}`;
      lootType = "epic";
      rarityText = "Thuốc Ấp 🔥";
    } else {
      const eggKeys = ["base", "dragon", "wolf"];
      const eggNames = { base: "🥚 Trứng Thường", dragon: "🐉 Trứng Rồng", wolf: "🐺 Trứng Sói" };
      const key = eggKeys[Math.floor(rng() * eggKeys.length)];
      inventory = { ...inventory, eggs: { ...inventory.eggs, [key]: inventory.eggs[key] + 1 } };
      title = `🥚 Nhận 1 Trứng hiếm: ${eggNames[key]}`;
      lootType = "legendary";
      rarityText = "Trứng Thú Cưng 🥚";
    }

    const record = {
      id: makeId(),
      title,
      points: 0,
      rarity: lootType,
      rarityText,
      isCritical,
      isMaterial: true,
      timestamp: Date.now(),
    };

    return {
      state: { ...baseState, inventory, miningHistory: pushHistory(record) },
      result: { success: true, lootType, pointReward: 0, rarityText, title, isCritical, isMaterial: true },
    };
  }

  // Pha E — đào ra ĐIỂM ⭐ (tiền GAME), KHÔNG ra xu (tiền thật). Xu chỉ từ lương (I4).
  const rand = rng();
  let lootType = "common";
  let pointReward = 1;
  let rarityText = "Thường ⚙️";
  let title = "⚙️ Mảnh Đá Nhỏ ⚙️";

  let luckBonus = 0;
  if (state.streak >= 14) luckBonus = 0.08;
  else if (state.streak >= 3) luckBonus = 0.04;

  const hasReadingBuff = state.tasks.some((t) => t.category === "intellect" && t.completed);
  const legendaryChance = 0.02 + (hasReadingBuff ? 0.01 : 0);
  const goldenChance = 0.08 + luckBonus;
  const silverChance = 0.2;

  if (rand < legendaryChance) {
    lootType = "legendary";
    pointReward = Math.floor(rng() * 8) + 8;
    rarityText = "Huyền Thoại ⚡";
    title = "🌟 RƯƠNG BÁU THẦN THOẠI 🌟";
  } else if (rand < legendaryChance + goldenChance) {
    lootType = "epic";
    pointReward = Math.floor(rng() * 4) + 4;
    rarityText = "Sử Thi 👑";
    title = "👑 Hũ Điểm Vàng Khổng Lồ 👑";
  } else if (rand < legendaryChance + goldenChance + silverChance) {
    lootType = "rare";
    pointReward = Math.floor(rng() * 2) + 2;
    rarityText = "Hiếm 🔷";
    title = "🔷 Quặng Bạc Lấp Lánh 🔷";
  }

  if (isCritical) pointReward *= 2;

  // Điểm ⭐ không có trần kiếm (tiền game); cân bằng bằng năng lượng. KHÔNG đụng heroCoins (I4).
  const record = {
    id: makeId(),
    title,
    points: pointReward,
    rarity: lootType,
    rarityText,
    isCritical,
    timestamp: Date.now(),
  };

  return {
    state: {
      ...baseState,
      points: (state.points || 0) + pointReward,
      miningHistory: pushHistory(record),
    },
    result: { success: true, lootType, pointReward, rarityText, title, isCritical },
  };
}

/**
 * Claim a reward (PIN must be verified by caller — provider layer).
 * @returns {{ state: object, result: { success: boolean, message?: string, error?: string, rolledPotion?: string } }}
 */
export function claimReward(state, rewardId, rng = Math.random) {
  const reward = state.rewards.find((r) => r.id === rewardId);
  if (!reward) return { state, result: { success: false, error: "REWARD_NOT_FOUND" } };

  // Mandatory tasks gate
  if (state.parentConfig?.requireAllMandatory) {
    const missing = state.tasks.filter((t) => t.isMandatory && !t.completed);
    if (missing.length > 0) {
      return { state, result: { success: false, error: "MANDATORY_TASKS_INCOMPLETE" } };
    }
  }

  // Screen-time limits
  if (reward.type === "game_time") {
    const addedMinutes = reward.value || 20;
    const cfg = state.parentConfig;
    if (state.screenMinutesUsedToday + addedMinutes > cfg.screenMaxMinutesPerDay) {
      return {
        state,
        result: {
          success: false,
          error: "SCREEN_DAILY_LIMIT",
          used: state.screenMinutesUsedToday,
          max: cfg.screenMaxMinutesPerDay,
        },
      };
    }
    if (state.screenRedeemsThisWeek >= cfg.screenRedeemMaxPerWeek) {
      return {
        state,
        result: { success: false, error: "SCREEN_WEEKLY_LIMIT", max: cfg.screenRedeemMaxPerWeek },
      };
    }
  }

  // Currency gate
  const cost = reward.cost || 50;
  let next = { ...state };
  if (reward.currency === "heroCoins") {
    if (state.heroCoins < cost) {
      return { state, result: { success: false, error: "NOT_ENOUGH_COINS", shortage: cost - state.heroCoins } };
    }
    next.heroCoins = Math.max(0, state.heroCoins - cost);
  } else {
    if (state.points < cost) {
      return { state, result: { success: false, error: "NOT_ENOUGH_POINTS", shortage: cost - state.points } };
    }
    next.points = Math.max(0, state.points - cost);
  }

  next.rewards = state.rewards.map((r) => (r.id === rewardId ? { ...r, parentApproved: true } : r));

  // Streak freeze card: capped inventory to prevent hoarding
  if (reward.type === "streak_freeze") {
    if ((state.streakFreezes || 0) >= STREAK_FREEZE_CAP) {
      return { state, result: { success: false, error: "FREEZE_CAP", max: STREAK_FREEZE_CAP } };
    }
  }

  let rolledPotion;
  if (reward.type === "streak_freeze") {
    next.streakFreezes = (state.streakFreezes || 0) + (reward.value || 1);
  } else if (reward.type === "game_time") {
    const addedSeconds = reward.value * 60;
    next.screenMinutesUsedToday = state.screenMinutesUsedToday + reward.value;
    next.screenRedeemsThisWeek = state.screenRedeemsThisWeek + 1;
    if (state.isTimerActive && state.timerEndTime > 0) {
      next.timerEndTime = state.timerEndTime + addedSeconds * 1000;
    } else {
      next.timerEndTime = Date.now() + addedSeconds * 1000;
      next.isTimerActive = true;
    }
    next.screenTimeLeft = state.screenTimeLeft + addedSeconds;
  } else if (reward.type === "pet_egg") {
    next.inventory = {
      ...state.inventory,
      eggs: { ...state.inventory.eggs, [reward.value]: state.inventory.eggs[reward.value] + 1 },
    };
  } else if (reward.type === "pet_potion_random") {
    const potions = ["fire", "ice", "magic"];
    rolledPotion = potions[Math.floor(rng() * potions.length)];
    next.inventory = {
      ...state.inventory,
      potions: { ...state.inventory.potions, [rolledPotion]: state.inventory.potions[rolledPotion] + 1 },
    };
  } else if (reward.type === "pet_food_all") {
    next.inventory = {
      ...state.inventory,
      foods: {
        meat: state.inventory.foods.meat + 1,
        candy: state.inventory.foods.candy + 1,
        leaf: state.inventory.foods.leaf + 1,
      },
    };
  }

  return { state: next, result: { success: true, rewardTitle: reward.title, rolledPotion } };
}

/**
 * Daily reset: auto-approve leftovers (day boundary = trust), streak bookkeeping
 * (freeze protection), task reset, photo spot-check flags for the new day,
 * energy bonus, screen limits reset, nudges cleared.
 * @param {object} state
 * @param {() => number} [rng] injected for deterministic spot-check tests
 * @param {string} [closingDate] ngày ĐÓNG (cũ) — cho snapshot lịch sử
 * @param {Date} [newDate] ngày MỚI — nguồn "thứ hôm nay" để sinh nhiệm vụ Thời khóa biểu
 */
export function resetDailyTasks(state, rng = Math.random, closingDate = "", newDate = new Date()) {
  // Day is over — any still-pending approvals default to TRUST before reset
  const settled = approveAllPending(state, { auto: true }).state;

  const completedCount = settled.tasks.filter((t) => t.completed).length;
  let streak = settled.streak;
  let streakFreezes = settled.streakFreezes || 0;
  let freezeUsed = false;

  if (completedCount >= STREAK_MIN_TASKS) {
    streak += 1;
  } else if (completedCount === 0 && streak > 0) {
    if (streakFreezes > 0) {
      // ❄️ Freeze card saves the streak for one missed day
      streakFreezes -= 1;
      freezeUsed = true;
    } else {
      streak = 0;
    }
  }

  // 📊 V1.2: daily snapshot of the closing day (feeds the weekly report)
  const mandatoryTotal = settled.tasks.filter((t) => t.isMandatory).length;
  const snapDate = closingDate || settled.lastResetDate || "";
  // GĐ0: tín hiệu North Star đo ở tầng máy (không phô số phán xét cho trẻ)
  const northStar = northStarSignals(settled, snapDate);
  const snapshot = {
    date: snapDate,
    completed: completedCount,
    total: settled.tasks.length,
    mandatoryDone: settled.tasks.filter((t) => t.isMandatory && t.completed).length,
    mandatoryTotal,
    screenMinutes: settled.screenMinutesUsedToday || 0,
    trustScore: settled.trustScore || 0,
    streak,
    ...northStar,
    // D3.2/D3.3: breakdown nỗ lực theo 5 vùng (nền scoreboard + Pha E xu). ADDITIVE —
    // snapshot cũ thiếu `groups`, buildScoreboard bỏ qua an toàn (không suy diễn).
    groups: groupSignals(settled.tasks),
    // B1.1: con có nhìn nhận cuối ngày không (1-tap emoji, không ô text). Tín hiệu
    // cho reviewedRate của scaffolding (2→3). Thiếu field cũ → false (tương thích ngược).
    reviewed: Boolean(settled.todayReview),
    reviewMood: settled.todayReview?.mood || null,
  };
  const history = [...(settled.history || []), snapshot].slice(-HISTORY_LIMIT_DAYS);

  // GĐ0 A0.5: đánh giá Scaffolding Level trên cửa sổ history (đã gồm ngày vừa đóng).
  // GIÁNG áp ngay (im lặng, phục hồi hỗ trợ); THĂNG chỉ đặt pending (đề xuất phụ huynh mở).
  const scaffoldToday = dateKey(newDate);
  const scaffold = evaluateScaffoldLevel({
    history,
    config: settled.parentConfig,
    today: scaffoldToday,
  });
  const nextParentConfig = {
    ...(settled.parentConfig || {}),
    scaffoldLevel: scaffold.level,
    scaffoldPendingLevel: scaffold.pending,
    // chỉ dời mốc cooldown khi level thực sự đổi (GIÁNG); THĂNG-pending không dời
    scaffoldChangedAt: scaffold.changed
      ? scaffoldToday
      : settled.parentConfig?.scaffoldChangedAt || "",
  };

  // 🛤️ B-lite Lộ Trình: close the journey day while today's completed flags
  // are still on the tasks (success counting), then maybe swap stage tasks.
  const journeyed = advanceJourneyDaily(settled);

  // 🎓 V1.2: habit tracking — consecutive completion days per task;
  // at GRADUATION_DAYS the habit "graduates" into a permanent hero instinct
  // (Overjustification defense: fade out extrinsic reward with a ceremony).
  const graduatedNow = [];
  const tasksWithHabits = journeyed.tasks.map((t) => ({
    ...t,
    habitStreak: t.completed ? (t.habitStreak || 0) + 1 : 0,
    // D4: consecutive misses drive the "chia nhỏ" suggestion.
    // B1.2: việc con CHỦ ĐỘNG dời/nhờ/bỏ = "gỡ vướng", KHÔNG tính miss (không xấu
    // hổ, không kích chia-nhỏ như thất bại). deferCount lo phần "xem lại cùng bố mẹ".
    missStreak: t.completed ? 0 : isConsciouslyHandled(t) ? t.missStreak || 0 : (t.missStreak || 0) + 1,
  }));
  const remainingTasks = tasksWithHabits.filter((t) => {
    // 📅 Thời khóa biểu: task theo ngày, không tồn dư — sinh lại ở dưới cho ngày mới.
    // (loại trước vòng graduation: task lịch không phải "thói quen" nên không tốt nghiệp)
    if (t.source === "timetable") return false;
    // B1.2: con đã BỎ có lý do → không nợ dồn sang mai.
    if (t.dropReason) return false;
    if ((t.habitStreak || 0) >= GRADUATION_DAYS) {
      graduatedNow.push({
        title: t.title,
        category: t.category,
        graduatedAt: Date.now(),
        days: t.habitStreak,
      });
      return false; // leaves the daily list — it's an instinct now
    }
    return true;
  });

  // D1: pets get hungrier every day; D2: boss is a real weekly cycle now —
  // HP persists within the week and only respawns (harder) on a new week.
  const hungered = decayPetsHunger(journeyed);
  const { state: bossAdvanced } = advanceBossWeek(hungered, new Date());

  // Pha E — lazy-reset trần KIẾM xu nếu ngày mới đã sang chu kỳ quỹ mới (tuần/tháng).
  const allowancePeriod = nextParentConfig.allowancePeriod || "week";
  const allowanceKey = computePeriodKey(allowancePeriod, newDate);
  const curAllowance = settled.allowance || { periodKey: "", earnedCoins: 0 };
  const rolledAllowance =
    curAllowance.periodKey === allowanceKey ? curAllowance : { periodKey: allowanceKey, earnedCoins: 0 };

  return {
    ...bossAdvanced,
    allowance: rolledAllowance,
    streak,
    streakFreezes,
    lastFreezeUsed: freezeUsed,
    approvalNudges: [],
    history,
    graduatedHabits: [...(journeyed.graduatedHabits || []), ...graduatedNow],
    lastGraduation: graduatedNow.length > 0 ? { ...graduatedNow[0], timestamp: Date.now() } : journeyed.lastGraduation,
    tasks: [
      ...remainingTasks.map((t) => ({
        ...clearRescue(t), // B1.2: gỡ cờ dời/nhờ tạm thời (giữ deferCount tích luỹ)
        completed: false,
        approval: undefined,
        pendingPoints: 0,
        earnedPoints: 0,
        earnedCoinReward: 0,
        earnedEnergy: 0,
        wasRejected: false,
        rejectReason: null, // C2.5: ngày mới không mang theo nhãn "cần làm lại" cũ
        wasApprovedToday: undefined, // grace window is same-day only
        focusEarnedToday: false, // reset the optional focus-session flag
      })),
      // 📅 sinh nhiệm vụ Thời khóa biểu cho NGÀY MỚI (bài tập hôm nay + soạn bài cho mai)
      ...generateTimetableTasks(settled.timetable, newDate),
    ],
    energy: Math.min(ENERGY_CAP, journeyed.energy + DAILY_ENERGY_BONUS),
    rewards: journeyed.rewards.map((r) => ({ ...r, parentApproved: false })),
    screenMinutesUsedToday: 0,
    remindersToday: 0, // GĐ0: counter nhắc trong ngày reset theo ngày mới
    todayReview: null, // B1.1: ngày mới bắt đầu chưa nhìn nhận (đã ghi vào snapshot ngày đóng)
    parentConfig: nextParentConfig, // GĐ0 A0.5: level scaffolding sau đánh giá
  };
}
