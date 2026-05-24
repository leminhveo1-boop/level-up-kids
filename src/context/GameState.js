"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";

const GameContext = createContext();

const DEFAULT_TASKS = [
  { id: "t1", title: "Dậy đúng giờ đón bình minh 🌅", exp: 10, points: 10, gold: 0, category: "discipline", completed: false, statKey: "discipline", statVal: 1, isMandatory: false },
  { id: "t2", title: "Tập thể dục năng động 15 phút 🏃‍♂️", exp: 20, points: 20, gold: 0, category: "strength", completed: false, statKey: "strength", statVal: 2, isMandatory: true },
  { id: "t3", title: "Đọc sách tinh hoa 20 phút 📚", exp: 20, points: 20, gold: 0, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true },
  { id: "t4", title: "Học tiếng Anh hoặc tìm hiểu AI 🤖", exp: 20, points: 20, gold: 0, category: "intellect", completed: false, statKey: "intellect", statVal: 2, isMandatory: true },
  { id: "t5", title: "Lau dọn nhà cửa & quét dọn phụ mẹ 🧹", exp: 25, points: 15, gold: 15, category: "help", completed: false, statKey: "help", statVal: 2, isMandatory: false },
  { id: "t6", title: "Làm chủ cảm xúc, luôn mỉm cười 🌸", exp: 15, points: 15, gold: 0, category: "help", completed: false, statKey: "help", statVal: 1, isMandatory: false },
  { id: "t7", title: "Sắp xếp phòng ngủ ngăn nắp, xếp chăn màn ✨", exp: 20, points: 15, gold: 10, category: "discipline", completed: false, statKey: "discipline", statVal: 2, isMandatory: false },
  { id: "t8", title: "Viết nhật ký cảm xúc & bài học ngày ✍️", exp: 15, points: 15, gold: 0, category: "creative", completed: false, statKey: "creative", statVal: 1, isMandatory: false },
  { id: "t9", title: "Chăm sóc, tưới cây hoặc cho thú cưng ăn 🌿", exp: 20, points: 10, gold: 10, category: "creative", completed: false, statKey: "creative", statVal: 2, isMandatory: false },
  { id: "t10", title: "Tuân thủ giới hạn xem TV/chơi Game 📺", exp: 30, points: 30, gold: 0, category: "discipline", completed: false, statKey: "discipline", statVal: 3, isMandatory: true },
];

const DEFAULT_REWARDS = [
  // Giải trí (Dùng Points ⭐)
  { id: "r1", title: "Đổi 20 phút chơi game / xem TV 📺", cost: 40, currency: "points", type: "game_time", value: 20, parentApproved: false, rarity: "common" },
  { id: "r2", title: "Đổi 45 phút chơi game / xem TV 🚀", cost: 80, currency: "points", type: "game_time", value: 45, parentApproved: false, rarity: "common" },
  { id: "r3", title: "Bố mẹ dẫn đi xem phim rạp cuối tuần 🍿", cost: 150, currency: "points", type: "perk", value: "movie_tickets", parentApproved: false, rarity: "rare" },
  { id: "r4", title: "Thẻ bài miễn làm 1 nhiệm vụ ngày 🎟️", cost: 100, currency: "points", type: "card", value: "skip_task", parentApproved: false, rarity: "epic" },
  
  // Tiền mặt thực tế (Dùng Vàng 🪙)
  { id: "r5", title: "Quy đổi 20.000đ bỏ heo đất tiết kiệm 🐷", cost: 20, currency: "gold", type: "perk", value: "cash_20k", parentApproved: false, rarity: "common" },
  { id: "r6", title: "Quy đổi 50.000đ tiền mặt bố mẹ thưởng nóng 💰", cost: 50, currency: "gold", type: "perk", value: "cash_50k", parentApproved: false, rarity: "rare" },
  { id: "r7", title: "Mua 1 món đồ chơi tự chọn trị giá 100.000đ 🧸", cost: 100, currency: "gold", type: "perk", value: "toy_100k", parentApproved: false, rarity: "epic" },
  { id: "r8", title: "Cúp pha lê danh dự + 500.000đ tiền mặt 👑", cost: 500, currency: "gold", type: "perk", value: "mega_reward", parentApproved: false, rarity: "legendary" },
];

export function GameProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Character state
  const [charName, setCharName] = useState("Quốc Bảo");
  const [charClass, setCharClass] = useState("Warrior"); // Warrior, Mage, Druid
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [energy, setEnergy] = useState(100);

  // Stats System
  const [stats, setStats] = useState({
    strength: 10,  // ❤️ Thể lực
    intellect: 10, // 🧠 Trí tuệ
    discipline: 10, // ⚡ Kỷ luật
    creative: 10,   // 🎨 Sáng tạo
    help: 10,       // 🤝 Giúp đỡ
  });
  
  // Gold (Tiền Vàng) & Points (Điểm tích lũy) system
  const [gold, setGold] = useState(0); // For cash cash conversion
  const [points, setPoints] = useState(0); // For screen time and leisure
  const [lastPointsGain, setLastPointsGain] = useState(null); // { amount, isCritical, taskTitle, timestamp }

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
        setCharName(data.charName || "Quốc Bảo");
        setCharClass(data.charClass || "Warrior");
        setLevel(data.level || 1);
        setExp(data.exp || 0);
        setStreak(data.streak || 0);
        setEnergy(data.energy !== undefined ? data.energy : 100);
        setStats(data.stats || { strength: 10, intellect: 10, discipline: 10, creative: 10, help: 10 });
        setTasks(data.tasks || DEFAULT_TASKS);
        setRewards(data.rewards || DEFAULT_REWARDS);
        setBossHp(data.bossHp !== undefined ? data.bossHp : 100);
        setBossDefeated(data.bossDefeated || false);
        setScreenTimeLeft(data.screenTimeLeft || 0);
        setIsTimerActive(data.isTimerActive || false);
        setTimerEndTime(data.timerEndTime || 0);
        setParentPin(data.parentPin || "1234");
        setEncouragements(data.encouragements || []);
        setLastResetDate(data.lastResetDate || "");
        setGold(data.gold || 0);
        setPoints(data.points || 0);
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
        gold,
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
    gold,
    points,
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
            setEnergy((prev) => Math.min(100, prev + 5));

            // Points calculation with Critical Hit 15% & Streak Multiplier
            const isCritical = Math.random() < 0.15; // 15% chance for Critical Hit on Points
            let basePoints = t.points !== undefined ? t.points : t.exp;
            if (isCritical) {
              basePoints = basePoints * 2;
            }

            // Streak Multiplier for Points
            let multiplier = 1.0;
            if (streak >= 7) multiplier = 2.0;
            else if (streak >= 5) multiplier = 1.5;
            else if (streak >= 3) multiplier = 1.2;

            const pointsAdded = Math.ceil(basePoints * multiplier);
            t.earnedPoints = pointsAdded; // Save to revert if unchecked

            setPoints((prev) => prev + pointsAdded);
            setLastPointsGain({
              amount: pointsAdded,
              isCritical,
              taskTitle: t.title,
              timestamp: Date.now(),
            });

            // Gold calculation (fixed as set by parent, no random lamer/crit to avoid actual cash inflation)
            const goldAdded = t.gold || 0;
            t.earnedGold = goldAdded;
            if (goldAdded > 0) {
              setGold((prev) => prev + goldAdded);
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
            setEnergy((prev) => Math.max(0, prev - 5));
            
            // Revert points
            const pointsToRevert = t.earnedPoints || t.points || t.exp;
            setPoints((prev) => Math.max(0, prev - pointsToRevert));
            t.earnedPoints = 0;
            setLastPointsGain(null);

            // Revert gold
            const goldToRevert = t.earnedGold || t.gold || 0;
            if (goldToRevert > 0) {
              setGold((prev) => Math.max(0, prev - goldToRevert));
            }
            t.earnedGold = 0;

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

    // STRICT PARENT CHECK: Enforce completing ALL mandatory tasks first!
    const uncompletedMandatoryTasks = tasks.filter((t) => t.isMandatory && !t.completed);
    if (uncompletedMandatoryTasks.length > 0) {
      return { 
        success: false, 
        message: `Quốc Bảo chưa làm xong các nhiệm vụ BẮT BUỘC hằng ngày! Hãy hoàn thành bài vở và tập thể dục trước nhé! ⚠️` 
      };
    }

    const reward = rewards.find((r) => r.id === id);
    if (!reward) return { success: false, message: "Phần thưởng không tồn tại! ❌" };

    // Currency gate verification
    if (reward.currency === "gold") {
      if (gold < reward.cost) {
        return {
          success: false,
          message: `Quốc Bảo chưa đủ Tiền Vàng! Cần thêm ${reward.cost - gold} 🪙 nữa nhé! ⚠️`
        };
      }
      setGold((prev) => Math.max(0, prev - reward.cost));
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
      const addedSeconds = reward.value * 60;
      if (isTimerActive && timerEndTime > 0) {
        setTimerEndTime((prev) => prev + addedSeconds * 1000);
      } else {
        setTimerEndTime(Date.now() + addedSeconds * 1000);
        setIsTimerActive(true);
      }
      setScreenTimeLeft((prev) => prev + addedSeconds);
    }

    confetti({
      particleCount: 80,
      spread: 60,
      colors: ["#D97706", "#4CAF50", "#2E7D32"],
    });

    return { success: true, message: `Thành công! Đã duyệt đổi: ${reward.title} 🎉` };
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
  const addCustomTask = (title, expVal, category, isMandatory = false, pointsVal = 0, goldVal = 0) => {
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
      gold: parseInt(goldVal) || 0,
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

  // Reset daily tasks
  const resetDailyTasks = () => {
    const completedCount = tasks.filter((t) => t.completed).length;
    if (completedCount >= 3) {
      setStreak((prev) => prev + 1);
    } else if (completedCount === 0 && streak > 0) {
      setStreak(0);
    }

    setTasks((prev) => prev.map((t) => ({ ...t, completed: false })));
    setEnergy(100);
    setRewards((prev) => prev.map((r) => ({ ...r, parentApproved: false })));
    
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
    setEnergy(100);
    setStats({ strength: 10, intellect: 10, discipline: 10, creative: 10, help: 10 });
    setTasks(DEFAULT_TASKS);
    setRewards(DEFAULT_REWARDS);
    setBossHp(100);
    setBossDefeated(false);
    setScreenTimeLeft(0);
    setIsTimerActive(false);
    setTimerEndTime(0);
    setGold(0);
    setPoints(0);
    setLastPointsGain(null);
    setLastResetDate(new Date().toLocaleDateString("vi-VN"));
    setEncouragements([
      { id: "e1", text: "Chào mừng Quốc Bảo bước vào Hành trình anh hùng mùa hè! Con sẵn sàng chưa? 🌳", read: false }
    ]);
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
        gold,
        setGold,
        points,
        setPoints,
        lastPointsGain,
        setLastPointsGain,
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
