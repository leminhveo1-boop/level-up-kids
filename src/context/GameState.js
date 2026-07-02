"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";
import { getSupabase } from "@/lib/supabase/client";
import { createInitialState, BOSS_MAX_HP } from "@/lib/game/constants";
import { createDemoState, DEMO_CHILD_ID } from "@/lib/game/demo";
import { migrateState } from "@/lib/game/migrate";
import * as economy from "@/lib/game/economy";
import * as petSystem from "@/lib/game/pets";
import * as cosmeticsSystem from "@/lib/game/cosmetics";
import { playSound } from "@/lib/sound";

const GameContext = createContext(null);

const CLOUD_SYNC_DEBOUNCE_MS = 2500;

const stateKeyFor = (childId) => `luk_state_${childId}`;

export function GameProvider({ children }) {
  const { authLoaded, cloudEnabled, user, activeChild, activeChildId } = useAuth();
  const supabase = getSupabase();

  const [state, setState] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const syncTimerRef = useRef(null);
  const loadedChildRef = useRef(null);

  // ---------------- LOAD (per active child; cloud-newest-wins) ----------------
  useEffect(() => {
    if (!authLoaded) return;

    if (!activeChildId) {
      setState(null);
      loadedChildRef.current = null;
      setIsLoaded(true);
      return;
    }
    if (loadedChildRef.current === activeChildId) return;

    // Demo mode: pre-built showcase state, never read from storage
    if (activeChildId === DEMO_CHILD_ID) {
      loadedChildRef.current = activeChildId;
      setState(createDemoState());
      setIsLoaded(true);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoaded(false);

      let localData = null;
      try {
        const raw = localStorage.getItem(stateKeyFor(activeChildId));
        if (raw) localData = JSON.parse(raw);
      } catch {
        localData = null;
      }

      let cloudData = null;
      if (cloudEnabled && supabase && user) {
        const { data } = await supabase
          .from("game_states")
          .select("state, updated_at")
          .eq("child_id", activeChildId)
          .maybeSingle();
        if (data?.state) {
          cloudData = { ...data.state, savedAt: new Date(data.updated_at).getTime() };
        }
      }
      if (cancelled) return;

      let chosen;
      if (localData && cloudData) {
        chosen = (cloudData.savedAt || 0) > (localData.savedAt || 0) ? cloudData : localData;
      } else {
        chosen = cloudData || localData;
      }

      let nextState = chosen
        ? migrateState(chosen)
        : createInitialState({ name: activeChild?.name, charClass: activeChild?.char_class });

      if (!nextState.charName && activeChild?.name) {
        nextState = { ...nextState, charName: activeChild.name };
      }

      loadedChildRef.current = activeChildId;
      setState(nextState);
      setIsLoaded(true);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, activeChildId, activeChild, cloudEnabled, supabase, user]);

  // ---------------- SAVE (localStorage immediate + cloud debounced) ----------------
  useEffect(() => {
    if (!isLoaded || !state || !activeChildId) return;
    if (activeChildId === DEMO_CHILD_ID) return; // demo is never persisted

    const toSave = { ...state, savedAt: Date.now() };
    try {
      localStorage.setItem(stateKeyFor(activeChildId), JSON.stringify(toSave));
    } catch {
      /* storage full/unavailable — cloud sync still covers persistence */
    }

    if (cloudEnabled && supabase && user && !String(activeChildId).startsWith("local_")) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        supabase
          .from("game_states")
          .upsert({ child_id: activeChildId, state: toSave, updated_at: new Date().toISOString() })
          .then(() => {});
      }, CLOUD_SYNC_DEBOUNCE_MS);
    }
    return () => clearTimeout(syncTimerRef.current);
  }, [state, isLoaded, activeChildId, cloudEnabled, supabase, user]);

  // ---------------- Screen-time absolute timer tick ----------------
  useEffect(() => {
    if (!state?.isTimerActive || !state?.timerEndTime) return;

    const tick = () => {
      const now = Date.now();
      setState((prev) => {
        if (!prev) return prev;
        if (now >= prev.timerEndTime) {
          return { ...prev, screenTimeLeft: 0, isTimerActive: false, timerEndTime: 0 };
        }
        return { ...prev, screenTimeLeft: Math.ceil((prev.timerEndTime - now) / 1000) };
      });
    };

    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [state?.isTimerActive, state?.timerEndTime]);

  // ---------------- Automatic daily reset ----------------
  useEffect(() => {
    if (!isLoaded || !state) return;
    const todayStr = new Date().toLocaleDateString("vi-VN");
    if (state.lastResetDate && state.lastResetDate !== todayStr) {
      setState((prev) => ({
        ...economy.resetDailyTasks(prev, Math.random, prev.lastResetDate),
        lastResetDate: todayStr,
      }));
    } else if (!state.lastResetDate) {
      setState((prev) => ({ ...prev, lastResetDate: todayStr }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, state?.lastResetDate]);

  // ---------------- Helpers ----------------
  /** Field setter that supports both value and functional updater. */
  const makeFieldSetter = useCallback(
    (field) => (valueOrFn) =>
      setState((prev) => {
        if (!prev) return prev;
        const nextVal = typeof valueOrFn === "function" ? valueOrFn(prev[field]) : valueOrFn;
        return { ...prev, [field]: nextVal };
      }),
    []
  );

  const fireConfetti = (opts) => {
    try {
      confetti(opts);
    } catch {
      /* canvas unavailable (SSR/test) */
    }
  };

  // ---------------- Game actions ----------------
  /**
   * Complete/uncomplete a task with verification gates (P0).
   * @param {string} id
   * @param {{ elapsedSeconds?: number, pin?: string, photo?: string }} [opts]
   * @returns {{ success: boolean, error?: string, requiredMin?: number }}
   */
  const completeTask = useCallback((id, opts = {}) => {
    let outcome = { success: true };
    setState((prev) => {
      if (!prev) return prev;
      const task = prev.tasks.find((t) => t.id === id);
      if (!task) return prev;

      if (!task.completed) {
        // Same-day grace: re-ticking a previously-approved task skips gates
        if (!task.wasApprovedToday) {
        // ===== VERIFICATION GATES (declared up-front, never retroactive) =====
        if (task.verifyType === "timer") {
          const requiredSec = (task.durationMin || 10) * 60 * 0.8;
          if ((opts.elapsedSeconds || 0) < requiredSec) {
            outcome = {
              success: false,
              error: "TIMER_REQUIRED",
              requiredMin: task.durationMin || 10,
              message: `Nhiệm vụ này cần bấm "BẮT ĐẦU LÀM" và tập trung đủ ${task.durationMin || 10} phút (⏱️ tối thiểu ${Math.ceil(requiredSec / 60)} phút) mới hoàn thành được nhé!`,
            };
            return prev;
          }
        }
        if (task.verifyType === "witness") {
          if (opts.pin !== prev.parentPin) {
            outcome = {
              success: false,
              error: "PIN_REQUIRED",
              message: "Việc này cần bố mẹ có mặt xác nhận bằng mã PIN! 👀",
            };
            return prev;
          }
        }
        if (task.verifyType === "photo" && task.photoRequiredToday && !opts.photo) {
          outcome = {
            success: false,
            error: "PHOTO_REQUIRED",
            message: "Hôm nay việc này cần chụp ảnh kết quả để làm bằng chứng nhé! 📸",
          };
          return prev;
        }
        }

        playSound("complete");
        let { state: next, events } = economy.completeTask(prev, id);
        if (opts.photo) {
          next = {
            ...next,
            tasks: next.tasks.map((t) => (t.id === id ? { ...t, evidencePhoto: opts.photo } : t)),
          };
        }
        // Witness tasks are parent-confirmed on the spot → instant approval
        if (task.verifyType === "witness") {
          next = economy.approveTask(next, id).state;
        }
        if (events?.leveledUp) {
          setTimeout(() => {
            playSound("level-up");
            fireConfetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#2E7D32", "#4CAF50", "#D97706", "#FAF8F5"],
            });
          }, 100);
        }
        if (events?.isCritical) {
          setTimeout(() => {
            playSound("coin");
            fireConfetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#D97706", "#FBBF24"] });
            fireConfetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#D97706", "#FBBF24"] });
          }, 150);
        }
        if (events?.bossDefeated) {
          setTimeout(() => fireConfetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } }), 300);
        }
        return next;
      }

      playSound("uncomplete");
      return economy.uncompleteTask(prev, id).state;
    });
    return outcome;
  }, []);

  // ---------------- P0: Approval (escrow) actions ----------------
  const approveTask = useCallback((taskId) => {
    let outcome = { success: false };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = economy.approveTask(prev, taskId);
      outcome = result;
      if (result.success) playSound("coin");
      return result.success ? next : prev;
    });
    return outcome;
  }, []);

  const approveAllPending = useCallback(() => {
    let outcome = { success: false };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = economy.approveAllPending(prev);
      outcome = result;
      if (result.count > 0) {
        playSound("reward");
        fireConfetti({ particleCount: 60, spread: 55, colors: ["#2E7D32", "#D97706"] });
      }
      return next;
    });
    return outcome;
  }, []);

  const rejectTask = useCallback((taskId) => {
    let outcome = { success: false };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = economy.rejectTask(prev, taskId);
      outcome = result;
      if (result.success) playSound("uncomplete");
      return result.success ? next : prev;
    });
    return outcome;
  }, []);

  const nudgeParents = useCallback(() => {
    let outcome = { success: false };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = economy.addApprovalNudge(prev);
      outcome = result;
      if (result.success) playSound("complete");
      return result.success ? next : prev;
    });
    return outcome;
  }, []);

  // Auto-approve escrow older than 24h — on load and every 10 minutes
  useEffect(() => {
    if (!isLoaded || !state) return;
    const run = () =>
      setState((prev) => {
        if (!prev) return prev;
        const { state: next, result } = economy.autoApproveExpired(prev);
        return result.count > 0 ? next : prev;
      });
    run();
    const interval = setInterval(run, 10 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  const mineTreasure = useCallback(() => {
    let outcome = { success: false, message: "Hết Năng Lượng rồi dũng sĩ ơi! Hãy đi làm nhiệm vụ để hồi phục nhé! ⚡" };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = economy.mineTreasure(prev);
      if (!result.success) return prev;

      playSound("mine");
      if (result.coinReward > 0 && (result.isCritical || result.lootType !== "common")) {
        setTimeout(() => playSound("coin"), 80);
      }
      if (result.lootType === "legendary" && !result.isMaterial) {
        setTimeout(() => {
          playSound("level-up");
          fireConfetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#FFE4E6", "#D97706", "#FBBF24"] });
        }, 100);
      } else if (result.lootType === "epic" && !result.isMaterial) {
        setTimeout(() => fireConfetti({ particleCount: 50, spread: 60, colors: ["#FBBF24", "#D97706"] }), 100);
      } else if (result.isMaterial && result.lootType === "legendary") {
        setTimeout(() => fireConfetti({ particleCount: 50, spread: 50, colors: ["#FFE4E6", "#D97706", "#FBBF24"] }), 100);
      }

      outcome = result;
      return next;
    });
    return outcome;
  }, []);

  const claimReward = useCallback((id, pin) => {
    let outcome = { success: false, message: "Có lỗi xảy ra!" };
    setState((prev) => {
      if (!prev) return prev;

      if (pin !== prev.parentPin) {
        outcome = { success: false, message: "Mã PIN của bố mẹ không đúng! ❌" };
        return prev;
      }

      const { state: next, result } = economy.claimReward(prev, id);
      if (!result.success) {
        const messages = {
          REWARD_NOT_FOUND: "Phần thưởng không tồn tại! ❌",
          MANDATORY_TASKS_INCOMPLETE:
            "Con chưa làm xong các nhiệm vụ BẮT BUỘC hằng ngày! Hãy hoàn thành bài vở và tập thể dục trước nhé! ⚠️",
          SCREEN_DAILY_LIMIT: `Đã vượt quá giới hạn giờ giải trí hôm nay! (Đã dùng: ${result.used}/${result.max} phút) ⚠️`,
          SCREEN_WEEKLY_LIMIT: `Đã hết lượt đổi giải trí trong tuần này! (Giới hạn: ${result.max} lần/tuần) ⚠️`,
          NOT_ENOUGH_COINS: `Con chưa đủ Hero Coins! Cần thêm ${result.shortage} 🪙 nữa nhé! ⚠️`,
          NOT_ENOUGH_POINTS: `Con chưa đủ Điểm Tích Lũy! Cần thêm ${result.shortage} ⭐ nữa nhé! ⚠️`,
          FREEZE_CAP: `Chỉ được giữ tối đa ${result.max} Thẻ Đóng Băng ❄️ thôi! Dùng bớt rồi mua thêm nhé!`,
        };
        outcome = { success: false, message: messages[result.error] || "Không thể đổi phần thưởng! ❌" };
        return prev;
      }

      playSound("reward");
      fireConfetti({ particleCount: 80, spread: 60, colors: ["#D97706", "#4CAF50", "#2E7D32"] });
      outcome = { success: true, message: `Thành công! Đã duyệt đổi: ${result.rewardTitle} 🎉` };
      return next;
    });
    return outcome;
  }, []);

  const hatchPet = useCallback((eggType, potionType) => {
    let outcome = { success: false, message: "Không đủ Trứng hoặc Thuốc ấp! ❌" };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = petSystem.hatchPet(prev, eggType, potionType);
      if (!result.success) return prev;

      playSound("hatch");
      setTimeout(() => {
        playSound("level-up");
        fireConfetti({ particleCount: 100, spread: 70, colors: ["#2E7D32", "#4CAF50", "#D97706"] });
      }, 300);
      outcome = { success: true, pet: result.pet };
      return next;
    });
    return outcome;
  }, []);

  const feedPet = useCallback((petId, foodType) => {
    let outcome = { success: false, message: "Không đủ Thức ăn! ❌" };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = petSystem.feedPet(prev, petId, foodType);
      if (!result.success) {
        const messages = {
          NOT_ENOUGH_FOOD: "Không đủ Thức ăn! ❌",
          PET_NOT_FOUND: "Không tìm thấy thú cưng! ❌",
          ALREADY_MOUNT: "Thú cưng đã đạt cấp tối đa và đang là Thú cưỡi! 💖",
        };
        outcome = { success: false, message: messages[result.error] || "Có lỗi xảy ra! ❌" };
        return prev;
      }

      playSound("complete");
      if (result.evolved) {
        setTimeout(() => {
          playSound("level-up");
          fireConfetti({ particleCount: 150, spread: 80, colors: ["#FFE4E6", "#D97706", "#FBBF24"] });
        }, 100);
        outcome = {
          success: true,
          evolved: true,
          message: `Thú cưng ${result.pet.name} đã tiến hóa thành THÚ CƯỠI khổng lồ oai phong! 🦖🌟`,
        };
      } else {
        const foodLabel = foodType === "meat" ? "Thịt Bò 🥩" : foodType === "candy" ? "Kẹo Ngọt 🍬" : "Lá Cây 🌿";
        outcome = {
          success: true,
          message: `Đã cho ${result.pet.name} ăn ${foodLabel}! Thân mật +${result.gain}% ${result.isFavorite ? "🔥 (Món khoái khẩu!)" : "🌸"}`,
        };
      }
      return next;
    });
    return outcome;
  }, []);

  const setActiveCompanion = useCallback((type, id) => {
    setState((prev) => (prev ? petSystem.setActiveCompanion(prev, type, id) : prev));
  }, []);

  // ---------------- B3.5: Cosmetics (Góc Của Tớ) ----------------
  const buyCosmetic = useCallback((cosmeticId) => {
    let outcome = { success: false };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = cosmeticsSystem.buyCosmetic(prev, cosmeticId);
      outcome = result;
      if (result.success) {
        playSound("reward");
        fireConfetti({ particleCount: 50, spread: 55, colors: ["#D97706", "#7C3AED"] });
      }
      return result.success ? next : prev;
    });
    return outcome;
  }, []);

  const equipCosmetic = useCallback((slot, cosmeticId) => {
    let outcome = { success: false };
    setState((prev) => {
      if (!prev) return prev;
      const { state: next, result } = cosmeticsSystem.equipCosmetic(prev, slot, cosmeticId);
      outcome = result;
      if (result.success) playSound("complete");
      return result.success ? next : prev;
    });
    return outcome;
  }, []);

  const toggleTimerState = useCallback(() => {
    setState((prev) => {
      if (!prev) return prev;
      if (prev.isTimerActive) {
        const remainingSeconds = Math.max(0, Math.ceil((prev.timerEndTime - Date.now()) / 1000));
        return { ...prev, screenTimeLeft: remainingSeconds, isTimerActive: false, timerEndTime: 0 };
      }
      if (prev.screenTimeLeft > 0) {
        return { ...prev, timerEndTime: Date.now() + prev.screenTimeLeft * 1000, isTimerActive: true };
      }
      return prev;
    });
  }, []);

  // Unique id even for same-millisecond batch inserts (onboarding wizard)
  const makeUniqueId = (prefix) =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const addCustomTask = useCallback(
    (title, expVal, category, isMandatory = false, pointsVal = 0, energyVal = 0, verifyType = "trust", durationMin = 0) => {
      setState((prev) => {
        if (!prev) return prev;
        const statKeyMap = { strength: "strength", intellect: "intellect", creative: "creative", help: "help", connection: "help" };
        const newTask = {
          id: makeUniqueId("custom"),
          title,
          exp: parseInt(expVal) || 15,
          points: parseInt(pointsVal) || parseInt(expVal) || 15,
          energy: parseInt(energyVal) || 15,
          category,
          completed: false,
          statKey: statKeyMap[category] || "discipline",
          statVal: 2,
          custom: true,
          isMandatory,
          verifyType,
          durationMin: verifyType === "timer" ? parseInt(durationMin) || 10 : undefined,
        };
        return { ...prev, tasks: [...prev.tasks, newTask] };
      });
      return { success: true };
    },
    []
  );

  const deleteTask = useCallback((id) => {
    setState((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== id) } : prev));
    return { success: true };
  }, []);

  const addCustomReward = useCallback(
    (title, costVal, typeVal, minutes = 0, rarityVal = "rare", currencyVal = "points") => {
      setState((prev) => {
        if (!prev) return prev;
        const newReward = {
          id: makeUniqueId("reward"),
          title,
          cost: parseInt(costVal) || 50,
          currency: currencyVal,
          type: typeVal,
          value: typeVal === "game_time" ? parseInt(minutes) : "custom_perk",
          parentApproved: false,
          rarity: rarityVal,
          custom: true,
        };
        return { ...prev, rewards: [...prev.rewards, newReward] };
      });
      return { success: true };
    },
    []
  );

  const deleteReward = useCallback((id) => {
    setState((prev) => (prev ? { ...prev, rewards: prev.rewards.filter((r) => r.id !== id) } : prev));
    return { success: true };
  }, []);

  const resetDailyTasks = useCallback(() => {
    setState((prev) => (prev ? economy.resetDailyTasks(prev) : prev));
  }, []);

  const sendEncouragement = useCallback((text) => {
    setState((prev) =>
      prev
        ? { ...prev, encouragements: [{ id: "msg_" + Date.now(), text, read: false }, ...prev.encouragements] }
        : prev
    );
  }, []);

  // ---------------- V1.2: two-way pigeon — child writes back ----------------
  const sendChildMessage = useCallback((text) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return { success: false };
    playSound("complete");
    setState((prev) =>
      prev
        ? {
            ...prev,
            childMessages: [
              { id: "cmsg_" + Date.now(), text: trimmed.slice(0, 200), read: false, timestamp: Date.now() },
              ...(prev.childMessages || []),
            ].slice(0, 30),
          }
        : prev
    );
    return { success: true };
  }, []);

  const readAllChildMessages = useCallback(() => {
    setState((prev) =>
      prev
        ? { ...prev, childMessages: (prev.childMessages || []).map((m) => ({ ...m, read: true })) }
        : prev
    );
  }, []);

  const clearLastGraduation = useCallback(() => {
    setState((prev) => (prev ? { ...prev, lastGraduation: null } : prev));
  }, []);

  const readAllMessages = useCallback(() => {
    setState((prev) =>
      prev ? { ...prev, encouragements: prev.encouragements.map((m) => ({ ...m, read: true })) } : prev
    );
  }, []);

  const resetEntireGame = useCallback(() => {
    setState((prev) => {
      const fresh = createInitialState({
        name: activeChild?.name || prev?.charName || "",
        charClass: activeChild?.char_class || prev?.charClass || "Warrior",
      });
      return {
        ...fresh,
        lastResetDate: new Date().toLocaleDateString("vi-VN"),
        encouragements: [
          { id: "e1", text: `Chào mừng ${fresh.charName || "con"} bước vào Hành trình anh hùng! Con sẵn sàng chưa? 🌳`, read: false },
        ],
      };
    });
  }, [activeChild]);

  // ---------------- Context value (same API surface as V0) ----------------
  const s = state || createInitialState();

  return (
    <GameContext.Provider
      value={{
        isLoaded: authLoaded && isLoaded,
        hasActiveChild: Boolean(activeChildId && state),
        charName: s.charName,
        setCharName: makeFieldSetter("charName"),
        charClass: s.charClass,
        setCharClass: makeFieldSetter("charClass"),
        level: s.level,
        exp: s.exp,
        expToNextLevel: s.level * 100,
        streak: s.streak,
        setStreak: makeFieldSetter("streak"),
        streakFreezes: s.streakFreezes || 0,
        setStreakFreezes: makeFieldSetter("streakFreezes"),
        trustScore: s.trustScore ?? 50,
        setTrustScore: makeFieldSetter("trustScore"),
        pendingCount: s.tasks ? s.tasks.filter((t) => t.approval === "pending").length : 0,
        approvalNudges: s.approvalNudges || [],
        approveTask,
        approveAllPending,
        rejectTask,
        nudgeParents,
        cosmetics: s.cosmetics || { owned: [], equipped: { hat: null, frame: null, petAccessory: null } },
        buyCosmetic,
        equipCosmetic,
        history: s.history || [],
        graduatedHabits: s.graduatedHabits || [],
        lastGraduation: s.lastGraduation || null,
        clearLastGraduation,
        childMessages: s.childMessages || [],
        sendChildMessage,
        readAllChildMessages,
        energy: s.energy,
        setEnergy: makeFieldSetter("energy"),
        stats: s.stats,
        setStats: makeFieldSetter("stats"),
        tasks: s.tasks,
        completeTask,
        rewards: s.rewards,
        claimReward,
        toggleTimerState,
        bossHp: s.bossHp,
        bossMaxHp: BOSS_MAX_HP,
        bossName: s.bossName,
        bossDefeated: s.bossDefeated,
        screenTimeLeft: s.screenTimeLeft,
        setScreenTimeLeft: makeFieldSetter("screenTimeLeft"),
        isTimerActive: s.isTimerActive,
        setIsTimerActive: makeFieldSetter("isTimerActive"),
        timerEndTime: s.timerEndTime,
        parentPin: s.parentPin,
        setParentPin: makeFieldSetter("parentPin"),
        encouragements: s.encouragements,
        sendEncouragement,
        readAllMessages,
        addCustomTask,
        deleteTask,
        addCustomReward,
        deleteReward,
        resetDailyTasks,
        resetEntireGame,
        heroCoins: s.heroCoins,
        setHeroCoins: makeFieldSetter("heroCoins"),
        points: s.points,
        setPoints: makeFieldSetter("points"),
        lastPointsGain: s.lastPointsGain,
        setLastPointsGain: makeFieldSetter("lastPointsGain"),
        miningHistory: s.miningHistory,
        setMiningHistory: makeFieldSetter("miningHistory"),
        mineTreasure,
        inventory: s.inventory,
        setInventory: makeFieldSetter("inventory"),
        pets: s.pets,
        setPets: makeFieldSetter("pets"),
        activePet: s.activePet,
        setActivePet: makeFieldSetter("activePet"),
        activeMount: s.activeMount,
        setActiveMount: makeFieldSetter("activeMount"),
        hatchPet,
        feedPet,
        setActiveCompanion,
        parentConfig: s.parentConfig,
        setParentConfig: makeFieldSetter("parentConfig"),
        screenMinutesUsedToday: s.screenMinutesUsedToday,
        setScreenMinutesUsedToday: makeFieldSetter("screenMinutesUsedToday"),
        screenRedeemsThisWeek: s.screenRedeemsThisWeek,
        setScreenRedeemsThisWeek: makeFieldSetter("screenRedeemsThisWeek"),
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
