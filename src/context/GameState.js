"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";

const GameContext = createContext();

const DEFAULT_TASKS = [
  { id: "t1", title: "Dậy đúng giờ đón bình minh 🌅", exp: 10, points: 5, energy: 2, category: "discipline", completed: false, statKey: "discipline", statVal: 1, isMandatory: false },
  { id: "t2", title: "Tập thể dục năng động 15 phút 🏃‍♂️", exp: 20, points: 10, energy: 4, category: "strength", completed: false, statKey: "strength", statVal: 2, isMandatory: true },
  { id: "t3", title: "Đọc sách tinh hoa 20 phút 📚", exp: 20, points: 10, energy: 4, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true },
  { id: "t4", title: "Học tiếng Anh hoặc tìm hiểu AI 🤖", exp: 20, points: 10, energy: 4, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true },
  { id: "t5", title: "Lau dọn nhà cửa & quét dọn phụ mẹ 🧹", exp: 25, points: 12, energy: 5, category: "help", completed: false, statKey: "help", statVal: 2, isMandatory: false },
  { id: "t6", title: "Làm chủ cảm xúc, luôn mỉm cười 🌸", exp: 15, points: 8, energy: 3, category: "help", completed: false, statKey: "help", statVal: 1, isMandatory: false },
  { id: "t7", title: "Sắp xếp phòng ngủ ngăn nắp, xếp chăn màn ✨", exp: 20, points: 10, energy: 4, category: "discipline", completed: false, statKey: "discipline", statVal: 2, isMandatory: false },
  { id: "t8", title: "Viết nhật ký cảm xúc & bài học ngày ✍️", exp: 15, points: 8, energy: 3, category: "creative", completed: false, statKey: "creative", statVal: 1, isMandatory: false },
  { id: "t9", title: "Chăm sóc, tưới cây hoặc cho thú cưng ăn 🌿", exp: 20, points: 10, energy: 4, category: "creative", completed: false, statKey: "creative", statVal: 2, isMandatory: false },
  { id: "t10", title: "Tuân thủ giới hạn xem TV/chơi Game 📺", exp: 30, points: 15, energy: 6, category: "discipline", completed: false, statKey: "discipline", statVal: 3, isMandatory: true },
];

const DEFAULT_REWARDS = [
  // Giải trí (Dùng Points ⭐)
  { id: "r1", title: "Đổi 20 phút chơi game / xem TV 📺", cost: 40, currency: "points", type: "game_time", value: 20, parentApproved: false, rarity: "common" },
  { id: "r2", title: "Đổi 45 phút chơi game / xem TV 🚀", cost: 80, currency: "points", type: "game_time", value: 45, parentApproved: false, rarity: "common" },
  { id: "r3", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 150, currency: "points", type: "perk", value: "movie_tickets", parentApproved: false, rarity: "rare" },
  { id: "r4", title: "Thẻ bài miễn làm 1 nhiệm vụ ngày 🎟️", cost: 100, currency: "points", type: "card", value: "skip_task", parentApproved: false, rarity: "epic" },
  
  // Vật phẩm Thú Cưng mua bằng Hero Coin 🪙
  { id: "rp1", title: "Mua 🥚 Trứng Thường (Ấp cáo, mèo, gấu trúc)", cost: 30, currency: "heroCoins", type: "pet_egg", value: "base", parentApproved: false, rarity: "common" },
  { id: "rp2", title: "Mua 🐺 Trứng Sói Chiến (Ấp sói nguyên tố hiếm)", cost: 80, currency: "heroCoins", type: "pet_egg", value: "wolf", parentApproved: false, rarity: "rare" },
  { id: "rp3", title: "Mua 🐉 Trứng Rồng Thần (Ấp rồng bay huyền thoại)", cost: 150, currency: "heroCoins", type: "pet_egg", value: "dragon", parentApproved: false, rarity: "legendary" },
  { id: "rp4", title: "Mua 🧪 Thuốc ấp phép ngẫu nhiên (Lửa, băng, ma thuật)", cost: 40, currency: "heroCoins", type: "pet_potion_random", value: "random", parentApproved: false, rarity: "rare" },
  { id: "rp5", title: "Mua 🥩 Combo Thức ăn Thần Kỳ (Thịt + Kẹo + Lá)", cost: 30, currency: "heroCoins", type: "pet_food_all", value: "all", parentApproved: false, rarity: "common" },

  // Quà thực tế ngoài đời (Dùng Hero Coin 🪙)
  { id: "r5", title: "Một ly kem tươi siêu to khổng lồ 🍨", cost: 100, currency: "heroCoins", type: "perk", value: "ice_cream", parentApproved: false, rarity: "common" },
  { id: "r6", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 300, currency: "heroCoins", type: "perk", value: "movie_night", parentApproved: false, rarity: "rare" },
  { id: "r7", title: "Một món đồ chơi tự chọn vừa phải 🧸", cost: 500, currency: "heroCoins", type: "perk", value: "small_toy", parentApproved: false, rarity: "epic" },
  { id: "r8", title: "Một bộ đồ chơi xếp hình LEGO siêu xịn 🧩", cost: 1000, currency: "heroCoins", type: "perk", value: "lego_set", parentApproved: false, rarity: "legendary" },
];

export function GameProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Character state
  const [charName, setCharName] = useState("Quốc Bảo");
  const [charClass, setCharClass] = useState("Warrior"); // Warrior, Mage, Druid
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [energy, setEnergy] = useState(30); // Tích lũy để đào mỏ, bắt đầu từ 30

  // Stats System
  const [stats, setStats] = useState({
    strength: 10,  // ❤️ Thể lực
    intellect: 10, // 🧠 Trí tuệ
    discipline: 10, // ⚡ Kỷ luật
    creative: 10,   // 🎨 Sáng tạo
    help: 10,       // 🤝 Giúp đỡ
  });
  
  // Hero Mining Currency & Points system
  const [heroCoins, setHeroCoins] = useState(0); // Ví Hero Coin 🪙
  const [points, setPoints] = useState(0); // Điểm tích lũy đổi giờ chơi giải trí ⭐
  const [lastPointsGain, setLastPointsGain] = useState(null); // { amount, isCritical, taskTitle, timestamp }
  const [miningHistory, setMiningHistory] = useState([]); // Lịch sử đào mỏ

  // Pet & Mount states
  const [inventory, setInventory] = useState({
    eggs: { base: 0, dragon: 0, wolf: 0 },
    potions: { fire: 0, ice: 0, magic: 0 },
    foods: { meat: 0, candy: 0, leaf: 0 }
  });
  const [pets, setPets] = useState([]);
  const [activePet, setActivePet] = useState(null);
  const [activeMount, setActiveMount] = useState(null);

  // Lists state
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [rewards, setRewards] = useState(DEFAULT_REWARDS);

  // Weekly Boss state
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp] = useState(100);
  const [bossName, setBossName] = useState("Thần Lười Biếng 😴");
  const [bossDefeated, setBossDefeated] = useState(false);

  // Screen Time Countdown Timer states (Bulletproof Absolute Timestamps)
  const [screenTimeLeft, setScreenTimeLeft] = useState(0); // in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timerEndTime, setTimerEndTime] = useState(0); // Unix timestamp in ms when timer runs out

  // Automation date states
  const [lastResetDate, setLastResetDate] = useState("");

  // Parent custom configurations and limits tracking (parent_setup_rules.md)
  const [parentConfig, setParentConfig] = useState({
    screenMaxMinutesPerDay: 60,
    screenRedeemMaxPerWeek: 5,
    topRewardMoneyVnd: 500000,
    topRewardEffortDays: 14,
    requireAllMandatory: true,
    maxCoinBalance: 7000,
  });
  const [screenMinutesUsedToday, setScreenMinutesUsedToday] = useState(0);
  const [screenRedeemsThisWeek, setScreenRedeemsThisWeek] = useState(0);

  // Parent controls
  const [parentPin, setParentPin] = useState("1234");
  const [encouragements, setEncouragements] = useState([
    { id: "e1", text: "Chúc Chiến Binh Quốc Bảo một mùa hè tràn đầy năng lượng! Cố lên con trai! 💪", read: false },
  ]);

  // Sound helper (Web Audio API)
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "complete") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "level-up") {
        const playTone = (freq, delay, duration) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          g.gain.setValueAtTime(0.15, ctx.currentTime + delay);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
          o.start(ctx.currentTime + delay);
          o.stop(ctx.currentTime + delay + duration);
        };
        playTone(523.25, 0, 0.2);
        playTone(659.25, 0.1, 0.2);
        playTone(783.99, 0.2, 0.3);
        playTone(1046.50, 0.3, 0.5);
      } else if (type === "uncomplete") {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {}
  };

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("quocbao_game_state");
    if (saved) {
      try {
        const data = JSON.parse(saved);

        // ------------------ AUTO-MIGRATION SELF-HEALING ------------------
        // 1. If energy is not defined or is 0, give them starting energy = 30
        const loadedEnergy = data.energy !== undefined && data.energy > 0 ? data.energy : 30;

        // 2. Migrate old tasks: if any task has t.gold and t.energy is undefined, copy to t.energy
        let loadedTasks = data.tasks || DEFAULT_TASKS;
        loadedTasks = loadedTasks.map(t => {
          if (t.energy === undefined) {
            const energyValue = t.gold !== undefined && t.gold > 0 ? t.gold * 5 : (t.exp || 15);
            return {
              ...t,
              energy: energyValue,
            };
          }
          return t;
        });

        // 3. Migrate old rewards: mapping gold to heroCoins and points to points
        let loadedRewards = data.rewards || DEFAULT_REWARDS;
        loadedRewards = loadedRewards.map(r => {
          if (r.currency === "gold" || r.currency === undefined) {
            return {
              ...r,
              currency: r.id.startsWith("r5") || r.id.startsWith("r6") || r.id.startsWith("r7") || r.id.startsWith("r8") || r.cost > 100 ? "heroCoins" : "points",
            };
          }
          return r;
        });

        // 4. Migrate old gold: copy old gold wallet directly to heroCoins so no coins are lost
        const oldGold = data.gold || 0;
        const loadedHeroCoins = data.heroCoins !== undefined ? data.heroCoins : oldGold;
        // -----------------------------------------------------------------

        setCharName(data.charName || "Quốc Bảo");
        setCharClass(data.charClass || "Warrior");
        setLevel(data.level || 1);
        setExp(data.exp || 0);
        setStreak(data.streak || 0);
        setEnergy(loadedEnergy);
        setStats(data.stats || { strength: 10, intellect: 10, discipline: 10, creative: 10, help: 10 });
        setTasks(loadedTasks);
        setRewards(loadedRewards);
        setBossHp(data.bossHp !== undefined ? data.bossHp : 100);
        setBossDefeated(data.bossDefeated || false);
        setScreenTimeLeft(data.screenTimeLeft || 0);
        setIsTimerActive(data.isTimerActive || false);
        setTimerEndTime(data.timerEndTime || 0);
        setParentPin(data.parentPin || "1234");
        setEncouragements(data.encouragements || []);
        setLastResetDate(data.lastResetDate || "");
        setHeroCoins(loadedHeroCoins);
        setPoints(data.points || 0);
        setMiningHistory(data.miningHistory || []);

        setParentConfig(data.parentConfig || {
          screenMaxMinutesPerDay: 60,
          screenRedeemMaxPerWeek: 5,
          topRewardMoneyVnd: 500000,
          topRewardEffortDays: 14,
          requireAllMandatory: true,
          maxCoinBalance: 7000,
        });
        setScreenMinutesUsedToday(data.screenMinutesUsedToday || 0);
        setScreenRedeemsThisWeek(data.screenRedeemsThisWeek || 0);

        // Load Pet & Mount systems with auto-healing
        setInventory(data.inventory || {
          eggs: { base: 0, dragon: 0, wolf: 0 },
          potions: { fire: 0, ice: 0, magic: 0 },
          foods: { meat: 0, candy: 0, leaf: 0 }
        });
        setPets(data.pets || []);
        setActivePet(data.activePet !== undefined ? data.activePet : null);
        setActiveMount(data.activeMount !== undefined ? data.activeMount : null);
      } catch (e) {
        console.error("Error loading local state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage on state change
  useEffect(() => {
    if (isLoaded) {
      const data = {
        charName,
        charClass,
        level,
        exp,
        streak,
        energy,
        stats,
        tasks,
        rewards,
        bossHp,
        bossDefeated,
        screenTimeLeft,
        isTimerActive,
        timerEndTime,
        parentPin,
        encouragements,
        lastResetDate,
        heroCoins,
        points,
        miningHistory,
        inventory,
        pets,
        activePet,
        activeMount,
        parentConfig,
        screenMinutesUsedToday,
        screenRedeemsThisWeek,
      };
      localStorage.setItem("quocbao_game_state", JSON.stringify(data));
    }
  }, [
    isLoaded,
    charName,
    charClass,
    level,
    exp,
    streak,
    energy,
    stats,
    tasks,
    rewards,
    bossHp,
    bossDefeated,
    screenTimeLeft,
    isTimerActive,
    timerEndTime,
    parentPin,
    encouragements,
    lastResetDate,
    heroCoins,
    points,
    miningHistory,
    inventory,
    pets,
    activePet,
    activeMount,
    parentConfig,
    screenMinutesUsedToday,
    screenRedeemsThisWeek,
  ]);

  // Bulletproof Absolute Timer Tick
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timerEndTime > 0) {
      // Re-calculate first in case page reloads
      const initialLeft = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      setScreenTimeLeft(initialLeft);
      if (initialLeft === 0) {
        setIsTimerActive(false);
        setTimerEndTime(0);
      }

      interval = setInterval(() => {
        const now = Date.now();
        if (now >= timerEndTime) {
          setScreenTimeLeft(0);
          setIsTimerActive(false);
          setTimerEndTime(0);
          clearInterval(interval);
        } else {
          setScreenTimeLeft(Math.ceil((timerEndTime - now) / 1000));
        }
      }, 500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerEndTime]);

  // Automatic Daily Reset Checker
  useEffect(() => {
    if (isLoaded) {
      const todayStr = new Date().toLocaleDateString("vi-VN");
      if (lastResetDate && lastResetDate !== todayStr) {
        // Automatically cycle to new day!
        resetDailyTasks();
        setLastResetDate(todayStr);
      } else if (!lastResetDate) {
        setLastResetDate(todayStr);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, lastResetDate]);

  // Formula: EXP needed to level up
  const expToNextLevel = level * 100;

  // Toggle complete task
  const completeTask = (id) => {
    playSound("complete");
    
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;

          if (nextCompleted) {
            let newExp = exp + t.exp;
            let currentLevel = level;
            
            const needed = currentLevel * 100;
            if (newExp >= needed) {
              newExp -= needed;
              currentLevel += 1;
              
              setTimeout(() => {
                playSound("level-up");
                confetti({
                  particleCount: 150,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ["#2E7D32", "#4CAF50", "#D97706", "#FAF8F5"],
                });
              }, 100);
            }

            setExp(newExp);
            setLevel(currentLevel);

            // Points calculation with Critical Hit 15% & Streak Multiplier
            const isCritical = Math.random() < 0.15; // 15% chance for Critical Hit on Points
            let basePoints = t.points !== undefined ? t.points : t.exp;
            if (isCritical) {
              basePoints = basePoints * 2;
            }

            // Streak Multiplier for Points (Balanced to prevent inflation)
            let multiplier = 1.0;
            if (streak >= 7) multiplier = 1.5;
            else if (streak >= 5) multiplier = 1.25;
            else if (streak >= 3) multiplier = 1.1;

            const pointsAdded = Math.ceil(basePoints * multiplier);
            t.earnedPoints = pointsAdded; // Save to revert if unchecked

            setPoints((prev) => prev + pointsAdded);
            setLastPointsGain({
              amount: pointsAdded,
              isCritical,
              taskTitle: t.title,
              timestamp: Date.now(),
            });

            // Energy calculation (Daily energy cap is 100 ⚡, Thú cưỡi activeMount cộng 10% năng lượng)
            let energyAdded = t.energy || 0;
            if (activeMount) {
              energyAdded = Math.ceil(energyAdded * 1.10);
            }
            t.earnedEnergy = energyAdded;
            if (energyAdded > 0) {
              setEnergy((prev) => Math.min(100, prev + energyAdded));
            }

            if (isCritical) {
              setTimeout(() => {
                confetti({
                  particleCount: 50,
                  angle: 60,
                  spread: 55,
                  origin: { x: 0 },
                  colors: ["#D97706", "#FBBF24"],
                });
                confetti({
                  particleCount: 50,
                  angle: 120,
                  spread: 55,
                  origin: { x: 1 },
                  colors: ["#D97706", "#FBBF24"],
                });
              }, 150);
            }

            if (t.statKey) {
              setStats((prevStats) => ({
                ...prevStats,
                [t.statKey]: prevStats[t.statKey] + t.statVal,
              }));
            }

            // Attack weekly boss
            setBossHp((prevHp) => {
              if (bossDefeated) return 0;
              const damage = Math.ceil(t.exp / 3);
              const nextHp = Math.max(0, prevHp - damage);
              if (nextHp === 0) {
                setBossDefeated(true);
                setTimeout(() => {
                  confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.5 },
                  });
                }, 300);
              }
              return nextHp;
            });
          } else {
            playSound("uncomplete");
            setExp((prev) => Math.max(0, prev - t.exp));
            
            // Revert points
            const pointsToRevert = t.earnedPoints || t.points || t.exp;
            setPoints((prev) => Math.max(0, prev - pointsToRevert));
            t.earnedPoints = 0;
            setLastPointsGain(null);

            // Revert energy
            const energyToRevert = t.earnedEnergy || t.energy || 0;
            if (energyToRevert > 0) {
              setEnergy((prev) => Math.max(0, prev - energyToRevert));
            }
            t.earnedEnergy = 0;

            if (t.statKey) {
              setStats((prevStats) => ({
                ...prevStats,
                [t.statKey]: Math.max(10, prevStats[t.statKey] - t.statVal),
              }));
            }
            setBossHp((prevHp) => {
              if (bossDefeated) return 0;
              return Math.min(bossMaxHp, prevHp + Math.ceil(t.exp / 3));
            });
          }

          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  // Claim Reward with parent PIN verification + Mandatory Tasks check!
  const claimReward = (id, pin) => {
    if (pin !== parentPin) {
      return { success: false, message: "Mã PIN của bố mẹ không đúng! ❌" };
    }

    const reward = rewards.find((r) => r.id === id);
    if (!reward) return { success: false, message: "Phần thưởng không tồn tại! ❌" };

    // STRICT PARENT CHECK: Enforce completing ALL mandatory tasks first if config enabled!
    if (parentConfig.requireAllMandatory) {
      const uncompletedMandatoryTasks = tasks.filter((t) => t.isMandatory && !t.completed);
      if (uncompletedMandatoryTasks.length > 0) {
        return { 
          success: false, 
          message: `Quốc Bảo chưa làm xong các nhiệm vụ BẮT BUỘC hằng ngày! Hãy hoàn thành bài vở và tập thể dục trước nhé! ⚠️` 
        };
      }
    }

    // SCREEN TIME LIMITS CHECK (Rule 1 & Rule 5)
    if (reward.type === "game_time") {
      const addedMinutes = reward.value || 20;
      if (screenMinutesUsedToday + addedMinutes > parentConfig.screenMaxMinutesPerDay) {
        return {
          success: false,
          message: `Đã vượt quá giới hạn giờ giải trí hôm nay! (Đã dùng: ${screenMinutesUsedToday}/${parentConfig.screenMaxMinutesPerDay} phút) ⚠️`
        };
      }
      if (screenRedeemsThisWeek >= parentConfig.screenRedeemMaxPerWeek) {
        return {
          success: false,
          message: `Đã hết lượt đổi giải trí trong tuần này! (Giới hạn: ${parentConfig.screenRedeemMaxPerWeek} lần/tuần) ⚠️`
        };
      }
    }

    // Currency gate verification
    if (reward.currency === "heroCoins") {
      if (heroCoins < reward.cost) {
        return {
          success: false,
          message: `Quốc Bảo chưa đủ Hero Coins! Cần thêm ${reward.cost - heroCoins} 🪙 nữa nhé! ⚠️`
        };
      }
      setHeroCoins((prev) => Math.max(0, prev - reward.cost));
    } else {
      // default points currency
      const cost = reward.cost || 50;
      if (points < cost) {
        return {
          success: false,
          message: `Quốc Bảo chưa đủ Điểm Tích Lũy! Cần thêm ${cost - points} ⭐ nữa nhé! ⚠️`
        };
      }
      setPoints((prev) => Math.max(0, prev - cost));
    }

    // Mark as approved & redeem
    setRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, parentApproved: true } : r))
    );

    if (reward.type === "game_time") {
      setScreenMinutesUsedToday((prev) => prev + reward.value);
      setScreenRedeemsThisWeek((prev) => prev + 1);

      const addedSeconds = reward.value * 60;
      if (isTimerActive && timerEndTime > 0) {
        setTimerEndTime((prev) => prev + addedSeconds * 1000);
      } else {
        setTimerEndTime(Date.now() + addedSeconds * 1000);
        setIsTimerActive(true);
      }
      setScreenTimeLeft((prev) => prev + addedSeconds);
    } else if (reward.type === "pet_egg") {
      setInventory((prev) => ({
        ...prev,
        eggs: {
          ...prev.eggs,
          [reward.value]: prev.eggs[reward.value] + 1,
        },
      }));
    } else if (reward.type === "pet_potion_random") {
      const potions = ["fire", "ice", "magic"];
      const rolled = potions[Math.floor(Math.random() * potions.length)];
      setInventory((prev) => ({
        ...prev,
        potions: {
          ...prev.potions,
          [rolled]: prev.potions[rolled] + 1,
        },
      }));
    } else if (reward.type === "pet_food_all") {
      setInventory((prev) => ({
        ...prev,
        foods: {
          meat: prev.foods.meat + 1,
          candy: prev.foods.candy + 1,
          leaf: prev.foods.leaf + 1,
        },
      }));
    }

    confetti({
      particleCount: 80,
      spread: 60,
      colors: ["#D97706", "#4CAF50", "#2E7D32"],
    });

    return { success: true, message: `Thành công! Đã duyệt đổi: ${reward.title} 🎉` };
  };

  // Click mining treasure cave logic
  const mineTreasure = () => {
    if (energy < 1) {
      return { success: false, message: "Hết Năng Lượng rồi dũng sĩ ơi! Hãy đi làm nhiệm vụ để hồi phục nhé! ⚡" };
    }

    // Consume 1 Energy
    setEnergy((prev) => Math.max(0, prev - 1));
    playSound("complete");

    // Critical Mining chance (20% base if exercise buff is active, and Thú cưỡi activeMount cộng thêm 5%)
    const activeMountObj = pets.find(p => p.id === activeMount);
    const hasMountCritBuff = activeMountObj !== undefined;
    const critChance = 0.20 + (hasMountCritBuff ? 0.05 : 0);
    const hasExerciseBuff = tasks.some(t => t.category === "strength" && t.completed);
    const isCriticalMining = (hasExerciseBuff || hasMountCritBuff) && Math.random() < critChance;

    // 15% chance to drop Pet Materials (trứng, thuốc ấp, thức ăn) instead of coins
    const randDrop = Math.random();
    if (randDrop < 0.15) {
      const materialRand = Math.random();
      let lootType = "common";
      let title = "";
      let rarityText = "Nguyên liệu 📦";
      
      if (materialRand < 0.46) {
        // ~7% is Food
        const foodKeys = ["meat", "candy", "leaf"];
        const foodEmojis = { meat: "🥩 Thịt Bò", candy: "🍬 Kẹo Ngọt", leaf: "🌿 Lá Cây" };
        const selectedFood = foodKeys[Math.floor(Math.random() * foodKeys.length)];
        
        setInventory(prev => ({
          ...prev,
          foods: { ...prev.foods, [selectedFood]: prev.foods[selectedFood] + 1 }
        }));
        
        title = `📦 Nhận 1 Thức ăn: ${foodEmojis[selectedFood]}`;
        lootType = "rare";
        rarityText = "Thức Ăn 🥩";
      } else if (materialRand < 0.80) {
        // ~5% is Potion
        const potionKeys = ["fire", "ice", "magic"];
        const potionEmojis = { fire: "🔥 Thuốc Lửa", ice: "❄️ Thuốc Băng", magic: "✨ Thuốc Thần Kỳ" };
        const selectedPotion = potionKeys[Math.floor(Math.random() * potionKeys.length)];
        
        setInventory(prev => ({
          ...prev,
          potions: { ...prev.potions, [selectedPotion]: prev.potions[selectedPotion] + 1 }
        }));
        
        title = `🧪 Nhận 1 Thuốc ấp: ${potionEmojis[selectedPotion]}`;
        lootType = "epic";
        rarityText = "Thuốc Ấp 🔥";
      } else {
        // ~3% is Egg
        const eggKeys = ["base", "dragon", "wolf"];
        const eggEmojis = { base: "🥚 Trứng Thường", dragon: "🐉 Trứng Rồng", wolf: "🐺 Trứng Sói" };
        const selectedEgg = eggKeys[Math.floor(Math.random() * eggKeys.length)];
        
        setInventory(prev => ({
          ...prev,
          eggs: { ...prev.eggs, [selectedEgg]: prev.eggs[selectedEgg] + 1 }
        }));
        
        title = `🥚 Nhận 1 Trứng hiếm: ${eggEmojis[selectedEgg]}`;
        lootType = "legendary";
        rarityText = "Trứng Thú Cưng 🥚";
        
        setTimeout(() => {
          confetti({
            particleCount: 50,
            spread: 50,
            colors: ["#FFE4E6", "#D97706", "#FBBF24"],
          });
        }, 100);
      }

      const newRecord = {
        id: "mine_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
        title,
        coins: 0,
        rarity: lootType,
        rarityText,
        isCritical: isCriticalMining,
        isMaterial: true,
        timestamp: Date.now(),
      };

      setMiningHistory((prev) => [newRecord, ...prev].slice(0, 15));

      return {
        success: true,
        lootType,
        coinReward: 0,
        rarityText,
        title,
        isCritical: isCriticalMining,
        isMaterial: true
      };
    }

    // Default Coin Mining (85% of times)
    const rand = Math.random();
    let lootType = "common";
    let coinReward = 1;
    let rarityText = "Thường ⚙️";
    let title = "Đá vụn";

    // Streak bonus luck
    let luckBonus = 0;
    if (streak >= 14) luckBonus = 0.08;
    else if (streak >= 3) luckBonus = 0.04;

    // Habit Buffs
    const hasReadingBuff = tasks.some(t => t.category === "intellect" && t.completed);

    // Adjust chances
    let legendaryChance = 0.02 + (hasReadingBuff ? 0.01 : 0);
    let goldenChance = 0.08 + luckBonus;
    let silverChance = 0.20;

    if (rand < legendaryChance) {
      lootType = "legendary";
      coinReward = Math.floor(Math.random() * 8) + 8; // 8 - 15 coins
      rarityText = "Huyền Thoại ⚡";
      title = "🌟 RƯƠNG BÁU THẦN THOẠI 🌟";
      setTimeout(() => {
        playSound("level-up");
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#FFE4E6", "#D97706", "#FBBF24"],
        });
      }, 100);
    } else if (rand < legendaryChance + goldenChance) {
      lootType = "epic";
      coinReward = Math.floor(Math.random() * 4) + 4; // 4 - 7 coins
      rarityText = "Sử Thi 👑";
      title = "👑 Hũ Xu Vàng Khổng Lồ 👑";
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          colors: ["#FBBF24", "#D97706"],
        });
      }, 100);
    } else if (rand < legendaryChance + goldenChance + silverChance) {
      lootType = "rare";
      coinReward = Math.floor(Math.random() * 2) + 2; // 2 - 3 coins
      rarityText = "Hiếm 🔷";
      title = "🔷 Quặng Bạc Lấp Lánh 🔷";
    } else {
      lootType = "common";
      coinReward = 1; // 1 coin flat to avoid fast inflation
      rarityText = "Thường ⚙️";
      title = "⚙️ Mảnh Đá Nhỏ ⚙️";
    }

    if (isCriticalMining) {
      coinReward = coinReward * 2;
    }

    // Add Hero Coins with safety cap (Rule 5)
    setHeroCoins((prev) => Math.min(parentConfig.maxCoinBalance, prev + coinReward));

    // Record history
    const newRecord = {
      id: "mine_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      title,
      coins: coinReward,
      rarity: lootType,
      rarityText,
      isCritical: isCriticalMining,
      timestamp: Date.now(),
    };

    setMiningHistory((prev) => [newRecord, ...prev].slice(0, 15));

    return {
      success: true,
      lootType,
      coinReward,
      rarityText,
      title,
      isCritical: isCriticalMining,
    };
  };

  // Pause / Resume screen time đếm ngược
  const toggleTimerState = () => {
    if (isTimerActive) {
      // Pause: Save remaining seconds and clear endTime
      const remainingSeconds = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
      setScreenTimeLeft(remainingSeconds);
      setIsTimerActive(false);
      setTimerEndTime(0);
    } else {
      // Resume: Set new absolute end time based on screenTimeLeft
      if (screenTimeLeft > 0) {
        setTimerEndTime(Date.now() + screenTimeLeft * 1000);
        setIsTimerActive(true);
      }
    }
  };

  // Add custom task (Parent only)
  const addCustomTask = (title, expVal, category, isMandatory = false, pointsVal = 0, energyVal = 0) => {
    const newId = "custom_" + Date.now();
    let statKey = "discipline";
    if (category === "strength") statKey = "strength";
    if (category === "intellect") statKey = "intellect";
    if (category === "creative") statKey = "creative";
    if (category === "help") statKey = "help";

    const newTask = {
      id: newId,
      title,
      exp: parseInt(expVal) || 15,
      points: parseInt(pointsVal) || parseInt(expVal) || 15,
      energy: parseInt(energyVal) || 15,
      category,
      completed: false,
      statKey,
      statVal: 2,
      custom: true,
      isMandatory,
    };

    setTasks((prev) => [...prev, newTask]);
    return { success: true };
  };

  // Delete task (Parent only)
  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return { success: true };
  };

  // Add custom reward (Parent only)
  const addCustomReward = (title, costVal, typeVal, minutes = 0, rarityVal = "rare", currencyVal = "points") => {
    const newId = "reward_" + Date.now();
    const newReward = {
      id: newId,
      title,
      cost: parseInt(costVal) || 50,
      currency: currencyVal,
      type: typeVal,
      value: typeVal === "game_time" ? parseInt(minutes) : "custom_perk",
      parentApproved: false,
      rarity: rarityVal,
      custom: true,
    };

    setRewards((prev) => [...prev, newReward]);
    return { success: true };
  };

  // Delete reward (Parent only)
  const deleteReward = (id) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    return { success: true };
  };

  // Reset daily tasks (Parent resets day)
  const resetDailyTasks = () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount >= 3) {
      setStreak((prev) => prev + 1);
    } else if (completedCount === 0 && streak > 0) {
      setStreak(0);
    }

    setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
    setEnergy((prev) => Math.min(100, prev + 10)); // Khuyến khích 10 Energy cho ngày mới
    setRewards((prev) => prev.map((r) => ({ ...r, parentApproved: false })));
    
    // Reset screen time limits for the new day
    setScreenMinutesUsedToday(0);
    
    if (bossDefeated) {
      setBossHp(100);
      setBossDefeated(false);
    }
  };

  // Send parent encouragement message
  const sendEncouragement = (text) => {
    const newMsg = {
      id: "msg_" + Date.now(),
      text,
      read: false,
    };
    setEncouragements((prev) => [newMsg, ...prev]);
  };

  // Read all encouragements
  const readAllMessages = () => {
    setEncouragements((prev) => prev.map((m) => ({ ...m, read: true })));
  };

  // Full reset (Start fresh adventure)
  const resetEntireGame = () => {
    localStorage.removeItem("quocbao_game_state");
    setCharName("Quốc Bảo");
    setCharClass("Warrior");
    setLevel(1);
    setExp(0);
    setStreak(0);
    setEnergy(30); // reset về 30
    setStats({ strength: 10, intellect: 10, discipline: 10, creative: 10, help: 10 });
    setTasks(DEFAULT_TASKS);
    setRewards(DEFAULT_REWARDS);
    setBossHp(100);
    setBossDefeated(false);
    setScreenTimeLeft(0);
    setIsTimerActive(false);
    setTimerEndTime(0);
    setHeroCoins(0);
    setPoints(0);
    setMiningHistory([]);
    setLastPointsGain(null);
    setLastResetDate(new Date().toLocaleDateString("vi-VN"));
    setEncouragements([
      { id: "e1", text: "Chào mừng Quốc Bảo bước vào Hành trình anh hùng mùa hè! Con sẵn sàng chưa? 🌳", read: false }
    ]);
    setInventory({
      eggs: { base: 0, dragon: 0, wolf: 0 },
      potions: { fire: 0, ice: 0, magic: 0 },
      foods: { meat: 0, candy: 0, leaf: 0 }
    });
    setPets([]);
    setActivePet(null);
    setActiveMount(null);
  };

  // Hatch Pet logic
  const hatchPet = (eggType, potionType) => {
    if (inventory.eggs[eggType] < 1 || inventory.potions[potionType] < 1) {
      return { success: false, message: "Không đủ Trứng hoặc Thuốc ấp! ❌" };
    }

    // Deduct inventory
    setInventory((prev) => ({
      ...prev,
      eggs: { ...prev.eggs, [eggType]: prev.eggs[eggType] - 1 },
      potions: { ...prev.potions, [potionType]: prev.potions[potionType] - 1 },
    }));

    // Calculate hatched pet name and emojis
    const petMap = {
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

    const petData = petMap[eggType][potionType];
    const newPet = {
      id: "pet_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5),
      name: petData.name,
      type: petData.type,
      element: petData.element,
      emoji: petData.emoji,
      feedProgress: 0,
      isMount: false,
      eggType,
      potionType,
    };

    setPets((prev) => [...prev, newPet]);
    
    // Set active if none
    if (!activePet && !activeMount) {
      setActivePet(newPet.id);
    }

    setTimeout(() => {
      playSound("level-up");
      confetti({
        particleCount: 100,
        spread: 70,
        colors: ["#2E7D32", "#4CAF50", "#D97706"],
      });
    }, 100);

    return { success: true, pet: newPet };
  };

  // Feed Pet logic
  const feedPet = (petId, foodType) => {
    if (inventory.foods[foodType] < 1) {
      return { success: false, message: "Không đủ Thức ăn! ❌" };
    }

    const pet = pets.find((p) => p.id === petId);
    if (!pet) return { success: false, message: "Không tìm thấy thú cưng! ❌" };
    if (pet.feedProgress >= 100) return { success: false, message: "Thú cưng đã đạt cấp tối đa và đang là Thú cưỡi! 💖" };

    // Deduct food
    setInventory((prev) => ({
      ...prev,
      foods: { ...prev.foods, [foodType]: prev.foods[foodType] - 1 },
    }));

    // Check if favorite food
    // fire -> meat, ice -> candy, magic -> leaf
    const favFoodMap = {
      fire: "meat",
      ice: "candy",
      magic: "leaf",
    };

    const isFavorite = favFoodMap[pet.element] === foodType;
    const gain = isFavorite ? 25 : 10;
    const nextProgress = Math.min(100, pet.feedProgress + gain);
    const becameMount = nextProgress >= 100 && !pet.isMount;

    setPets((prev) =>
      prev.map((p) => {
        if (p.id === petId) {
          return {
            ...p,
            feedProgress: nextProgress,
            isMount: p.isMount || nextProgress >= 100,
          };
        }
        return p;
      })
    );

    playSound("complete");

    if (becameMount) {
      setTimeout(() => {
        playSound("level-up");
        confetti({
          particleCount: 150,
          spread: 80,
          colors: ["#FFE4E6", "#D97706", "#FBBF24"],
        });
      }, 100);
      return { success: true, message: `Thú cưng ${pet.name} đã tiến hóa thành THÚ CƯỠI khổng lồ oai phong! 🦖🌟`, evolved: true };
    }

    return { 
      success: true, 
      message: `Đã cho ${pet.name} ăn ${foodType === "meat" ? "Thịt Bò 🥩" : foodType === "candy" ? "Kẹo Ngọt 🍬" : "Lá Cây 🌿"}! Thân mật +${gain}% ${isFavorite ? "🔥 (Món khoái khẩu!)" : "🌸"}`
    };
  };

  // Set active companion (type: 'pet' or 'mount')
  const setActiveCompanion = (type, id) => {
    if (type === "pet") {
      setActivePet(id);
      setActiveMount(null);
    } else if (type === "mount") {
      setActiveMount(id);
      setActivePet(null);
    } else {
      setActivePet(null);
      setActiveMount(null);
    }
  };

  return (
    <GameContext.Provider
      value={{
        isLoaded,
        charName,
        setCharName,
        charClass,
        setCharClass,
        level,
        exp,
        expToNextLevel,
        streak,
        setStreak,
        energy,
        setEnergy,
        stats,
        setStats,
        tasks,
        completeTask,
        rewards,
        claimReward,
        toggleTimerState,
        bossHp,
        bossMaxHp,
        bossName,
        bossDefeated,
        screenTimeLeft,
        setScreenTimeLeft,
        isTimerActive,
        setIsTimerActive,
        timerEndTime,
        parentPin,
        setParentPin,
        encouragements,
        sendEncouragement,
        readAllMessages,
        addCustomTask,
        deleteTask,
        addCustomReward,
        deleteReward,
        resetDailyTasks,
        resetEntireGame,
        heroCoins,
        setHeroCoins,
        points,
        setPoints,
        lastPointsGain,
        setLastPointsGain,
        miningHistory,
        setMiningHistory,
        mineTreasure,
        inventory,
        setInventory,
        pets,
        setPets,
        activePet,
        setActivePet,
        activeMount,
        setActiveMount,
        hatchPet,
        feedPet,
        setActiveCompanion,
        parentConfig,
        setParentConfig,
        screenMinutesUsedToday,
        setScreenMinutesUsedToday,
        screenRedeemsThisWeek,
        setScreenRedeemsThisWeek,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
