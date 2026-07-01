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

  const nextTasks = state.tasks.map((t) =>
    t.id === taskId
      ? { ...t, completed: true, earnedPoints: pointsAdded, earnedEnergy: energyAdded }
      : t
  );

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
      points: state.points + pointsAdded,
      energy: Math.min(ENERGY_CAP, state.energy + energyAdded),
      bossHp: nextBossHp,
      bossDefeated: state.bossDefeated || bossJustDefeated,
      lastPointsGain: {
        amount: pointsAdded,
        isCritical,
        taskTitle: task.title,
        timestamp: Date.now(),
      },
    },
    events: {
      leveledUp: expResult.levelsGained > 0,
      levelsGained: expResult.levelsGained,
      isCritical,
      pointsAdded,
      energyAdded,
      bossDefeated: bossJustDefeated,
    },
  };
}

/**
 * Un-complete a task, reverting exactly what was earned.
 * @returns {{ state: object, events: object | null }}
 */
export function uncompleteTask(state, taskId) {
  const task = state.tasks.find((t) => t.id === taskId);
  if (!task || !task.completed) return { state, events: null };

  const pointsToRevert = task.earnedPoints ?? task.points ?? task.exp;
  const energyToRevert = task.earnedEnergy ?? task.energy ?? 0;

  const nextTasks = state.tasks.map((t) =>
    t.id === taskId ? { ...t, completed: false, earnedPoints: 0, earnedEnergy: 0 } : t
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

  let rolledPotion;
  if (reward.type === "game_time") {
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
 * Daily reset: streak bookkeeping, task reset, energy bonus, screen limits reset.
 */
export function resetDailyTasks(state) {
  const completedCount = state.tasks.filter((t) => t.completed).length;
  let streak = state.streak;
  if (completedCount >= STREAK_MIN_TASKS) streak += 1;
  else if (completedCount === 0 && streak > 0) streak = 0;

  return {
    ...state,
    streak,
    tasks: state.tasks.map((t) => ({ ...t, completed: false, earnedPoints: 0, earnedEnergy: 0 })),
    energy: Math.min(ENERGY_CAP, state.energy + DAILY_ENERGY_BONUS),
    rewards: state.rewards.map((r) => ({ ...r, parentApproved: false })),
    screenMinutesUsedToday: 0,
    bossHp: state.bossDefeated ? BOSS_MAX_HP : state.bossHp,
    bossDefeated: false,
  };
}
