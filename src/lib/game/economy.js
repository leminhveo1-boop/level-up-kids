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
  PHOTO_SPOTCHECK_RATE,
  PHOTO_SPOTCHECK_RATE_TRUSTED,
  NUDGE_LIMIT_PER_DAY,
  HISTORY_LIMIT_DAYS,
  GRADUATION_DAYS,
} from "./constants";

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
export function completeTask(state, taskId, rng = Math.random) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.completed) return { state, events: null };

  // EXP + multi-level
  const expResult = applyExpGain(state.level, state.exp, task.exp);

  // Points: crit 15% then streak multiplier
  const isCritical = rng() < CRIT_POINT_CHANCE;
  let basePoints = task.points !== undefined ? task.points : task.exp;
  if (isCritical) basePoints *= 2;
  const pointsAdded = Math.ceil(basePoints * getStreakMultiplier(state.streak));

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
  const nextTasks = state.tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          completed: true,
          // Same-day re-tick of a previously-approved task restores approval
          // instantly (grace path — no double verification, no re-escrow)
          approval: task.wasApprovedToday ? "approved" : "pending",
          pendingPoints: task.wasApprovedToday ? 0 : pointsAdded,
          earnedPoints: task.wasApprovedToday ? pointsAdded : 0,
          wasApprovedToday: undefined,
          completedAt: Date.now(),
          earnedEnergy: energyAdded,
        }
      : t
  );
  const instantApproved = Boolean(task.wasApprovedToday);

  const nextStats = task.statKey
    ? { ...state.stats, [task.statKey]: (state.stats[task.statKey] || 0) + task.statVal }
    : state.stats;

  return {
    state: {
      ...state,
      tasks: nextTasks,
      stats: nextStats,
      level: expResult.level,
      exp: expResult.exp,
      points: instantApproved ? state.points + pointsAdded : state.points,
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
      pointsPending: !instantApproved,
      energyAdded,
      bossDefeated: bossJustDefeated,
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

  return {
    state: {
      ...state,
      points: state.points + released,
      trustScore: Math.min(TRUST_MAX, (state.trustScore || 0) + TRUST_GAIN_ON_APPROVE),
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, approval: opts.auto ? "auto" : "approved", earnedPoints: released, pendingPoints: 0 }
          : t
      ),
    },
    result: { success: true, released, auto: Boolean(opts.auto) },
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
export function rejectTask(state, taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || task.approval !== "pending") return { state, result: { success: false, error: "NOT_PENDING" } };

  const energyToRevert = task.earnedEnergy ?? task.energy ?? 0;
  const nextStats = task.statKey
    ? { ...state.stats, [task.statKey]: Math.max(10, (state.stats[task.statKey] || 10) - task.statVal) }
    : state.stats;

  return {
    state: {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: false, approval: undefined, pendingPoints: 0, earnedEnergy: 0, evidencePhoto: undefined, wasRejected: true }
          : t
      ),
      stats: nextStats,
      exp: Math.max(0, state.exp - task.exp),
      energy: Math.max(0, state.energy - energyToRevert),
      bossHp: state.bossDefeated ? 0 : Math.min(BOSS_MAX_HP, state.bossHp + Math.ceil(task.exp / 3)),
      trustScore: Math.max(TRUST_MIN, (state.trustScore || 0) - TRUST_LOSS_ON_REJECT),
    },
    result: { success: true, taskTitle: task.title },
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

  const nextTasks = state.tasks.map((t) =>
    t.id === taskId
      ? {
          ...t,
          completed: false,
          approval: undefined,
          pendingPoints: 0,
          earnedPoints: 0,
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
      energy: Math.max(0, state.energy - energyToRevert),
      bossHp: state.bossDefeated ? 0 : Math.min(BOSS_MAX_HP, state.bossHp + Math.ceil(task.exp / 3)),
      lastPointsGain: null,
    },
    events: { pointsReverted: pointsToRevert, energyReverted: energyToRevert },
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
      coins: 0,
      rarity: lootType,
      rarityText,
      isCritical,
      isMaterial: true,
      timestamp: Date.now(),
    };

    return {
      state: { ...baseState, inventory, miningHistory: pushHistory(record) },
      result: { success: true, lootType, coinReward: 0, rarityText, title, isCritical, isMaterial: true },
    };
  }

  // Coin mining
  const rand = rng();
  let lootType = "common";
  let coinReward = 1;
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
    coinReward = Math.floor(rng() * 8) + 8;
    rarityText = "Huyền Thoại ⚡";
    title = "🌟 RƯƠNG BÁU THẦN THOẠI 🌟";
  } else if (rand < legendaryChance + goldenChance) {
    lootType = "epic";
    coinReward = Math.floor(rng() * 4) + 4;
    rarityText = "Sử Thi 👑";
    title = "👑 Hũ Xu Vàng Khổng Lồ 👑";
  } else if (rand < legendaryChance + goldenChance + silverChance) {
    lootType = "rare";
    coinReward = Math.floor(rng() * 2) + 2;
    rarityText = "Hiếm 🔷";
    title = "🔷 Quặng Bạc Lấp Lánh 🔷";
  }

  if (isCritical) coinReward *= 2;

  const maxCoins = state.parentConfig?.maxCoinBalance ?? 7000;
  const record = {
    id: makeId(),
    title,
    coins: coinReward,
    rarity: lootType,
    rarityText,
    isCritical,
    timestamp: Date.now(),
  };

  return {
    state: {
      ...baseState,
      heroCoins: Math.min(maxCoins, state.heroCoins + coinReward),
      miningHistory: pushHistory(record),
    },
    result: { success: true, lootType, coinReward, rarityText, title, isCritical },
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
 */
export function resetDailyTasks(state, rng = Math.random, closingDate = "") {
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

  // 🔍 Spot-check: flag a fraction of photo-tasks for today (declared UP FRONT,
  // never demanded retroactively). High trust ⇒ lighter checking.
  const spotRate =
    (settled.trustScore || 0) >= TRUST_HIGH_THRESHOLD ? PHOTO_SPOTCHECK_RATE_TRUSTED : PHOTO_SPOTCHECK_RATE;

  // 📊 V1.2: daily snapshot of the closing day (feeds the weekly report)
  const mandatoryTotal = settled.tasks.filter((t) => t.isMandatory).length;
  const snapshot = {
    date: closingDate || settled.lastResetDate || "",
    completed: completedCount,
    total: settled.tasks.length,
    mandatoryDone: settled.tasks.filter((t) => t.isMandatory && t.completed).length,
    mandatoryTotal,
    screenMinutes: settled.screenMinutesUsedToday || 0,
    trustScore: settled.trustScore || 0,
    streak,
  };
  const history = [...(settled.history || []), snapshot].slice(-HISTORY_LIMIT_DAYS);

  // 🎓 V1.2: habit tracking — consecutive completion days per task;
  // at GRADUATION_DAYS the habit "graduates" into a permanent hero instinct
  // (Overjustification defense: fade out extrinsic reward with a ceremony).
  const graduatedNow = [];
  const tasksWithHabits = settled.tasks.map((t) => ({
    ...t,
    habitStreak: t.completed ? (t.habitStreak || 0) + 1 : 0,
  }));
  const remainingTasks = tasksWithHabits.filter((t) => {
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

  return {
    ...settled,
    streak,
    streakFreezes,
    lastFreezeUsed: freezeUsed,
    approvalNudges: [],
    history,
    graduatedHabits: [...(settled.graduatedHabits || []), ...graduatedNow],
    lastGraduation: graduatedNow.length > 0 ? { ...graduatedNow[0], timestamp: Date.now() } : settled.lastGraduation,
    tasks: remainingTasks.map((t) => ({
      ...t,
      completed: false,
      approval: undefined,
      pendingPoints: 0,
      earnedPoints: 0,
      earnedEnergy: 0,
      evidencePhoto: undefined,
      wasRejected: false,
      wasApprovedToday: undefined, // grace window is same-day only
      photoRequiredToday: t.verifyType === "photo" ? rng() < spotRate : false,
    })),
    energy: Math.min(ENERGY_CAP, settled.energy + DAILY_ENERGY_BONUS),
    rewards: settled.rewards.map((r) => ({ ...r, parentApproved: false })),
    screenMinutesUsedToday: 0,
    bossHp: settled.bossDefeated ? BOSS_MAX_HP : settled.bossHp,
    bossDefeated: false,
  };
}
