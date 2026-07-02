"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import confetti from "canvas-confetti";
import SoundToggle from "@/components/SoundToggle";
import { getEquipped } from "@/lib/game/cosmetics";
import { getPetMood, getPetQuote } from "@/lib/game/pets";
import { GIFT_CATALOG } from "@/lib/game/gifting";
import { PET_HUNGER_MAX } from "@/lib/game/constants";
import { useAuth } from "@/context/AuthContext";

const MOOD_EMOJI = { joyful: "🤩", happy: "🙂", hungry: "😟", starving: "😢" };
const MOOD_BAR_COLOR = { joyful: "bg-forest", happy: "bg-amber", hungry: "bg-terracotta", starving: "bg-red-500" };

export default function DashboardPage() {
  const router = useRouter();
  const { childProfiles, activeChildId, selectChild, isDemo, uiMode } = useAuth();
  const isTeen = uiMode === "teen";
  const {
    isLoaded,
    charName,
    charClass,
    level,
    exp,
    expToNextLevel,
    streak,
    streakFreezes,
    energy,
    stats,
    tasks,
    completeTask,
    encouragements,
    readAllMessages,
    heroCoins,
    points,
    lastPointsGain,
    setLastPointsGain,
    pets,
    activePet,
    activeMount,
    pendingCount,
    nudgeParents,
    cosmetics,
    rewards,
    lastGraduation,
    clearLastGraduation,
    receivedGifts,
    markReceivedGiftsRead,
    sendGift,
  } = useGame();

  // 🎯 V1.2 Goal gradient: nearest big reward the child is saving coins for
  const coinGoal = React.useMemo(() => {
    const candidates = (rewards || [])
      .filter((r) => r.currency === "heroCoins" && r.type === "perk" && r.cost > heroCoins)
      .sort((a, b) => a.cost - b.cost);
    return candidates[0] || null;
  }, [rewards, heroCoins]);

  const [activeTab, setActiveTab] = useState("adventure"); // Current bottom navigation tab
  const [taskFilter, setTaskFilter] = useState("all"); // Filter daily tasks
  const [selectedMessage, setSelectedMessage] = useState(null); // Pigeon Modal Message
  const [criticalToast, setCriticalToast] = useState(null); // Toast for Critical Hit Points!
  const [showGuideModal, setShowGuideModal] = useState(false); // Guideline for child

  // V1.3: OPTIONAL focus companion — the child may run it for a bonus, but it
  // never gates completion and never blocks other tasks.
  const [focusTaskId, setFocusTaskId] = useState(null); // task with an active focus session
  const [focusStartTime, setFocusStartTime] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [verifyToast, setVerifyToast] = useState(""); // small info toast
  const photoInputRef = React.useRef(null);
  const [photoTaskId, setPhotoTaskId] = useState(null); // task the optional photo is for

  const showVerifyToast = (msg) => {
    setVerifyToast(msg);
    setTimeout(() => setVerifyToast(""), 4500);
  };

  // Focus stopwatch (only runs when the child chose to start one)
  useEffect(() => {
    let interval = null;
    if (focusTaskId && focusStartTime > 0) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - focusStartTime) / 1000));
      }, 500);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [focusTaskId, focusStartTime]);

  const formatStopwatch = (totalSecs) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleTaskComplete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (task.completed) {
      completeTask(taskId); // un-tick
      return;
    }

    // Optional focus bonus: earned only if a focus session for THIS task reached
    // the threshold. No session = normal claim, zero friction.
    const isFocused = taskId === focusTaskId;
    const requiredSec = (task.durationMin || 10) * 60 * 0.8;
    const focusEarned = isFocused && elapsedSeconds >= requiredSec;

    completeTask(taskId, { focusEarned });
    if (focusEarned) showVerifyToast(`Tuyệt vời! Con đã tập trung đủ lâu — nhận thêm điểm thưởng tập trung! 🌳✨`);

    if (isFocused) {
      setFocusTaskId(null);
      setFocusStartTime(0);
      setElapsedSeconds(0);
    }
  };

  const handleStartFocus = (taskId) => {
    setFocusTaskId(taskId);
    setFocusStartTime(Date.now());
    setElapsedSeconds(0);
  };

  const handleStopFocus = () => {
    setFocusTaskId(null);
    setFocusStartTime(0);
    setElapsedSeconds(0);
  };

  // Optional device-only photo attach (never synced, never a gate)
  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !photoTaskId) return;
    try {
      const { compressImageFile } = await import("@/lib/image");
      const { saveLocalPhoto } = await import("@/lib/localPhotos");
      const dataUrl = await compressImageFile(file);
      saveLocalPhoto(activeChildId, photoTaskId, dataUrl);
      showVerifyToast("Đã lưu ảnh vào máy (chỉ bố mẹ trên máy này xem được). 📸");
    } catch {
      showVerifyToast("Không đọc được ảnh, con thử lại nhé! 📸");
    }
    setPhotoTaskId(null);
  };

  const handleAttachPhoto = (taskId) => {
    setPhotoTaskId(taskId);
    photoInputRef.current?.click();
  };

  const handleNudge = () => {
    const r = nudgeParents();
    showVerifyToast(
      r.success
        ? "Đã gửi lời nhắc đến bố mẹ! Bồ câu đang bay đi đây 🕊️"
        : "Hôm nay con đã nhắc đủ 2 lần rồi — bố mẹ sẽ duyệt sớm thôi! 🌸"
    );
  };

  // Companion pet/mount objects
  const activePetObj = pets?.find((p) => p.id === activePet);
  const activeMountObj = pets?.find((p) => p.id === activeMount);
  const activeCompanion = activeMountObj || activePetObj;
  const companionMood = activeCompanion ? getPetMood(activeCompanion) : null;
  // Re-roll only when the companion or its hunger changes — not on every render
  const companionQuote = React.useMemo(
    () => (activeCompanion ? getPetQuote(activeCompanion) : null),
    [activeCompanion?.id, activeCompanion?.hunger]
  );

  const [giftPickerFor, setGiftPickerFor] = useState(null); // sibling id currently picking a gift for
  const [giftFlash, setGiftFlash] = useState("");

  const handleSendGift = async (toChildId, giftId) => {
    const r = await sendGift(toChildId, giftId);
    setGiftFlash(r.message || "");
    setTimeout(() => setGiftFlash(""), 3500);
    if (r.success) setGiftPickerFor(null);
  };

  // Redirect if character doesn't exist (no name)
  useEffect(() => {
    if (isLoaded && !charName) {
      router.push("/");
    }
  }, [isLoaded, charName, router]);

  // Listener for Critical Points Gain
  useEffect(() => {
    if (lastPointsGain) {
      if (lastPointsGain.isCritical) {
        setCriticalToast({
          amount: lastPointsGain.amount,
          taskTitle: lastPointsGain.taskTitle,
        });
        
        // Auto dismiss after 4 seconds
        const timer = setTimeout(() => {
          setCriticalToast(null);
          setLastPointsGain(null);
        }, 4000);
        return () => clearTimeout(timer);
      } else {
        // Just clear normal gains, no big modal needed
        setLastPointsGain(null);
      }
    }
  }, [lastPointsGain, setLastPointsGain]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang tải thế giới...</p>
      </div>
    );
  }

  // Calculate stats completed percentage for simple reward unlocking hints
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Determine Level Title
  const getLevelTitle = (lvl) => {
    if (lvl >= 100) return "Anh Hùng Mùa Hè 👑";
    if (lvl >= 50) return "Hiệp Sĩ Ánh Sáng 🌟";
    if (lvl >= 20) return "Thủ Lĩnh Nhỏ 🎯";
    if (lvl >= 10) return "Chiến Binh Kỷ Luật ⚡";
    if (lvl >= 5) return "Người Khám Phá 🗺️";
    return "Tân Binh Tập Sự 🛡️";
  };

  // Determine character Class Avatar and styles
  const getClassConfig = (cls) => {
    switch (cls) {
      case "Mage":
        return {
          bg: "bg-blue-50 border-sky",
          avatarBg: "bg-sky-light",
          text: "text-sky-dark",
          icon: (
            <svg className="w-10 h-10 text-sky" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#E0F2FE" />
              <circle cx="12" cy="7" r="2" fill="#0284C7" />
            </svg>
          ),
        };
      case "Druid":
        return {
          bg: "bg-green-50 border-forest",
          avatarBg: "bg-forest-light",
          text: "text-forest-dark",
          icon: (
            <svg className="w-10 h-10 text-forest-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.92V15h-2v2.92c-2.45-.44-4.48-2.31-4.92-4.92H9v-2H6.08c.44-2.45 2.31-4.48 4.92-4.92V7h2v2.92c2.45.44 4.48 2.31 4.92 4.92H15v2h2.92c-.44 2.45-2.31 4.48-4.92 4.92z" fill="#A7F3D0" />
              <path d="M12 10a2 2 0 100 4 2 2 0 000-4z" fill="#2E7D32" />
            </svg>
          ),
        };
      default: // Warrior
        return {
          bg: "bg-rose-50 border-terracotta",
          avatarBg: "bg-terracotta-light",
          text: "text-terracotta-dark",
          icon: (
            <svg className="w-10 h-10 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7s0 6 8 10z" fill="#FFE4E6" />
              <path d="M12 8v8M8 12h8" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ),
        };
    }
  };

  const classConfig = getClassConfig(charClass);

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "all") return true;
    return t.category === taskFilter;
  });

  // Calculate total unread encouragement letters
  const unreadLetters = encouragements.filter((e) => !e.read);

  const handleOpenLetter = (letter) => {
    setSelectedMessage(letter);
    // Mark as read
    readAllMessages();
    // Celebrate pigeon arrival
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
  };

  return (
    <div className="flex flex-col flex-grow relative pb-20">
      {/* Scrollable Main Area */}
      <div className="flex-grow p-5 space-y-5 overflow-y-auto">
        
        {/* TOP STATUS BAR: Streak, Energy, Wallet (Points/Gold), Pigeon Letter */}
        <div className="flex items-center justify-between gap-1 flex-wrap select-none">
          {/* Energy Bar */}
          <div className="flex items-center gap-1 bg-white border-2 border-sand px-2.5 py-1.5 rounded-full shadow-game-flat">
            <span className="text-[10px]">❤️</span>
            <div className="w-8 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-terracotta h-full transition-all duration-300"
                style={{ width: `${energy}%` }}
              ></div>
            </div>
          </div>

          {/* Points Wallet */}
          <div 
            onClick={() => router.push("/rewards")}
            className="flex items-center gap-0.5 bg-white border-2 border-sand px-2 py-1.5 rounded-full shadow-game-flat transition-all hover:border-forest cursor-pointer active:scale-95"
          >
            <span className="text-xs">⭐</span>
            <span className="text-[9px] font-black text-forest-dark">{points} ĐIỂM</span>
          </div>

          {/* Hero Coin Wallet */}
          <div 
            onClick={() => router.push("/rewards")}
            className="flex items-center gap-0.5 bg-white border-2 border-sand px-2 py-1.5 rounded-full shadow-game-flat transition-all hover:border-amber cursor-pointer active:scale-95"
          >
            <span className="text-xs animate-bounce">🪙</span>
            <span className="text-[9px] font-black text-amber-dark">{heroCoins} COIN</span>
          </div>

          {/* Messages Bird (Carrier Pigeon Alert) */}
          {encouragements.length > 0 && (
            <button
              onClick={() => handleOpenLetter(encouragements[0])}
              className="relative p-1 bg-white border-2 border-sand rounded-full shadow-game-flat hover:border-amber transition-colors"
              title="Thư động viên từ bố mẹ!"
            >
              <span className="text-xs">🕊️</span>
              {unreadLetters.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white font-extrabold text-[6px] h-3 w-3 rounded-full flex items-center justify-center border border-white animate-pulse">
                  !
                </span>
              )}
            </button>
          )}

          {/* Streak Flame + Freeze cards */}
          <div
            className="flex items-center gap-0.5 bg-white border-2 border-sand px-2.5 py-1.5 rounded-full shadow-game-flat"
            title={`Streak ${streak} ngày — ${streakFreezes} thẻ đóng băng ❄️`}
          >
            <span className="text-xs animate-flame">🔥</span>
            <span className="text-[9px] font-black text-amber">{streak}N</span>
            {streakFreezes > 0 && (
              <span className="text-[9px] font-black text-sky-dark ml-0.5">❄️{streakFreezes}</span>
            )}
          </div>

          {/* Sound mute toggle */}
          <SoundToggle />

          {/* Guide Button for child */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center justify-center p-1.5 bg-white border-2 border-sand rounded-full shadow-game-flat hover:border-forest transition-colors text-xs active:scale-90"
            title="Cẩm nang chiến binh"
          >
            📜
          </button>
        </div>

        {/* HERO CARD (Avatar, Level progress bar, and Pet/Mount Companion) */}
        <div className={`border-2 p-4 rounded-3xl shadow-game-flat flex items-center gap-4 ${classConfig.bg}`}>
          {/* Avatar Icon + Pet Companion + Cosmetics */}
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-inner ${classConfig.avatarBg}`}
              style={{ borderColor: getEquipped({ cosmetics }).frame?.value || undefined }}
            >
              {classConfig.icon}
            </div>

            {/* Equipped hat */}
            {getEquipped({ cosmetics }).hat && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl drop-shadow z-20 select-none">
                {getEquipped({ cosmetics }).hat.emoji}
              </span>
            )}
            
            {/* Active Pet companion floating on top-left of Avatar */}
            {activePetObj && (
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-white border border-sand rounded-xl flex items-center justify-center text-lg shadow-md animate-float z-10 select-none">
                {activePetObj.emoji}
              </div>
            )}

            {/* Active Mount companion displaying as riding on bottom-right of Avatar */}
            {activeMountObj && (
              <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white border border-sand rounded-xl flex items-center justify-center text-xl shadow-md animate-bounce z-10 select-none" title={`Thú cưỡi: ${activeMountObj.name}`}>
                {activeMountObj.emoji}
              </div>
            )}
          </div>

          {/* Hero Name, Title & Level Bar */}
          <div className="flex-grow space-y-1.5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-forest-dark truncate max-w-[130px]">{charName}</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => router.push("/me")}
                  className="min-h-tap text-[10px] font-black px-2 rounded-full bg-clay-light text-clay border border-clay/30 active:scale-95 transition-transform"
                  title="Góc Của Tớ — tùy biến avatar"
                >
                  🏠 Của Tớ
                </button>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-forest-accent text-forest border border-forest">
                  CẤP {level}
                </span>
              </div>
            </div>
            
            <p className="text-[11px] font-bold text-gray-500">{getLevelTitle(level)}</p>

            {/* EXP Progress bar */}
            <div className="space-y-1">
              <div className="w-full bg-sand h-3 rounded-full border border-sand overflow-hidden relative shadow-inner">
                <div 
                  className="bg-amber h-full transition-all duration-300 animate-shimmer"
                  style={{ width: `${(exp / expToNextLevel) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[8.5px] font-black text-gray-400">
                <span>EXP: {exp}</span>
                <span>YÊU CẦU: {expToNextLevel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🐾 Pet is ALIVE — mood, speech bubble, hunger bar */}
        {activeCompanion && (
          <div className="bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{activeCompanion.emoji}</span>
            <div className="flex-grow min-w-0 space-y-1">
              <p className="text-[11px] font-bold text-forest-dark italic truncate">
                {MOOD_EMOJI[companionMood]} &ldquo;{companionQuote}&rdquo;
              </p>
              <div className="h-2 bg-sand rounded-full overflow-hidden border border-sand">
                <div
                  className={`h-full transition-all duration-300 ${MOOD_BAR_COLOR[companionMood]}`}
                  style={{ width: `${((activeCompanion.hunger ?? PET_HUNGER_MAX) / PET_HUNGER_MAX) * 100}%` }}
                />
              </div>
            </div>
            {companionMood === "hungry" || companionMood === "starving" ? (
              <button
                onClick={() => router.push("/mining")}
                className="min-h-tap flex-shrink-0 bg-amber text-white text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
              >
                Cho ăn 🍖
              </button>
            ) : null}
          </div>
        )}

        {/* STATS RADAR GRID - 5 Stars of Power */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
          <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider text-center">⚔️ 5 CHỈ SỐ SỨC MẠNH ANH HÙNG</h3>
          
          <div className="grid grid-cols-5 gap-1.5">
            {/* STRENGTH */}
            <div className="bg-rose-50 border border-red-100 rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-base">❤️</span>
              <span className="text-[9px] font-bold text-gray-500">Thể Lực</span>
              <span className="text-xs font-black text-terracotta">{stats.strength}</span>
            </div>
            {/* INTELLECT */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-base">🧠</span>
              <span className="text-[9px] font-bold text-gray-500">Trí Tuệ</span>
              <span className="text-xs font-black text-sky">{stats.intellect}</span>
            </div>
            {/* DISCIPLINE */}
            <div className="bg-amber-50 border border-yellow-100 rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-base">⚡</span>
              <span className="text-[9px] font-bold text-gray-500">Kỷ Luật</span>
              <span className="text-xs font-black text-amber">{stats.discipline}</span>
            </div>
            {/* CREATIVE */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-base">🎨</span>
              <span className="text-[9px] font-bold text-gray-500">Sáng Tạo</span>
              <span className="text-xs font-black text-clay">{stats.creative}</span>
            </div>
            {/* HELP */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-base">🤝</span>
              <span className="text-[9px] font-bold text-gray-500">Giúp Đỡ</span>
              <span className="text-xs font-black text-forest-medium">{stats.help}</span>
            </div>
          </div>
        </div>

        {/* DAILY TASKS SECTION */}
        <div className="space-y-3">
          {/* Header & Filter Buttons */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">🎯 Nhiệm Vụ Hôm Nay</h3>
              <span className="text-[10px] font-black text-gray-400 bg-sand px-2 py-0.5 rounded-full">
                Xong: {completedTasksCount}/{totalTasksCount} ({completionPercentage}%)
              </span>
            </div>

            {/* Daily Reset Hint */}
            <div className="w-full bg-amber-light border border-amber/30 p-2 rounded-xl text-[10px] text-amber-dark font-medium flex items-center gap-1">
              <span>💡</span>
              <span><strong>Mẹo:</strong> Hoàn thành từ 3 nhiệm vụ để duy trì ngọn lửa Streak 🔥.</span>
            </div>

            {/* P0: Pending approval summary + child-initiated nudge */}
            {pendingCount > 0 && (
              <div className="w-full bg-sky-light/60 border border-sky/30 p-2.5 rounded-xl flex items-center justify-between gap-2">
                <span className="text-[11px] text-sky-dark font-bold flex items-center gap-1">
                  ⏳ {pendingCount} nhiệm vụ chờ bố mẹ duyệt điểm ⭐
                </span>
                <button
                  type="button"
                  onClick={handleNudge}
                  className="min-h-tap flex-shrink-0 bg-white border border-sky/40 text-sky-dark text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
                >
                  Nhắc bố mẹ 🕊️
                </button>
              </div>
            )}

            {/* 🎁 D3: unread gifts from siblings */}
            {receivedGifts?.some((g) => !g.read) && (
              <div className="w-full bg-purple-50 border-2 border-purple-200 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">🎁 Quà Từ Anh Chị Em</span>
                {receivedGifts.filter((g) => !g.read).slice(0, 3).map((g) => (
                  <p key={g.id} className="text-[11px] font-bold text-purple-800">
                    {g.emoji} {g.fromName} đã tặng con {g.label}!
                  </p>
                ))}
                <button
                  onClick={markReceivedGiftsRead}
                  className="min-h-tap bg-white border border-purple-200 text-purple-700 text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
                >
                  Đã xem, cảm ơn! 💜
                </button>
              </div>
            )}

            {/* Verification gate toast */}
            {verifyToast && (
              <div className="w-full bg-rose-50 border border-red-200 p-2.5 rounded-xl text-[11px] text-terracotta font-bold text-center animate-fade-in">
                {verifyToast}
              </div>
            )}

            {/* 🎓 Graduation ceremony banner (Overjustification defense) */}
            {lastGraduation && (
              <div className="w-full bg-amber-light border-2 border-amber p-3.5 rounded-2xl text-center space-y-2 animate-fade-in">
                <p className="text-2xl">🎓✨</p>
                <p className="text-[12px] font-black text-amber-dark leading-snug">
                  &ldquo;{lastGraduation.title}&rdquo; đã trở thành BẢN NĂNG ANH HÙNG!
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Con đã tự giác làm việc này {lastGraduation.days} ngày liên tục — giờ nó là một phần con người con rồi, không cần điểm thưởng nữa! Huy hiệu vĩnh viễn ở 🏠 Góc Của Tớ.
                </p>
                <button
                  onClick={clearLastGraduation}
                  className="min-h-tap bg-amber text-white text-[10px] font-black px-5 rounded-xl active:scale-95 transition-transform"
                >
                  TUYỆT VỜI! 🙌
                </button>
              </div>
            )}

            {/* 🎯 Goal gradient — visible progress to the next big reward */}
            {coinGoal && (
              <div className="w-full bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">🎯 Mục tiêu lớn</span>
                  <span className="text-[10px] font-black text-amber-dark">
                    {heroCoins}/{coinGoal.cost} 🪙 ({Math.round((heroCoins / coinGoal.cost) * 100)}%)
                  </span>
                </div>
                <p className="text-[11px] font-black text-forest-dark truncate">{coinGoal.title}</p>
                <div className="h-3 bg-sand rounded-full overflow-hidden border border-sand">
                  <div
                    className="h-full bg-gradient-to-r from-amber to-amber-dark rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((heroCoins / coinGoal.cost) * 100))}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-400 font-bold">
                  Còn {coinGoal.cost - heroCoins} 🪙 nữa — đào mỏ thôi! ⛏️
                </p>
              </div>
            )}

            {/* 👨‍👩‍👧‍👦 NHÀ MÌNH — siblings strip (Octalysis CD5, family circle V1) */}
            {!isDemo && childProfiles.length > 1 && (
              <div className="w-full bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat space-y-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">👨‍👩‍👧‍👦 Nhà Mình</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {childProfiles.map((sib) => {
                    const isMe = sib.id === activeChildId;
                    const sibEmoji = sib.char_class === "Mage" ? "🔮" : sib.char_class === "Druid" ? "🌱" : "🛡️";
                    return (
                      <div key={sib.id} className="flex-shrink-0 flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (!isMe && confirm(`Đổi sang người chơi ${sib.name}?`)) {
                              selectChild(sib.id);
                            }
                          }}
                          className={`min-h-tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all active:scale-95 ${
                            isMe ? "border-forest bg-forest-light/20" : "border-sand bg-sand-light"
                          }`}
                        >
                          <span className="text-lg">{sibEmoji}</span>
                          <span className="text-[11px] font-black text-forest-dark">
                            {sib.name} {isMe && "(tớ)"}
                          </span>
                        </button>
                        {!isMe && (
                          <button
                            onClick={() => setGiftPickerFor(giftPickerFor === sib.id ? null : sib.id)}
                            className="min-h-tap min-w-tap flex items-center justify-center rounded-xl border-2 border-purple-200 bg-purple-50 text-base active:scale-95 transition-transform"
                            title={`Tặng quà cho ${sib.name}`}
                          >
                            🎁
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {giftPickerFor && (
                  <div className="border-t border-sand pt-2 space-y-1.5">
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
                      Tặng {childProfiles.find((c) => c.id === giftPickerFor)?.name} món gì?
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {GIFT_CATALOG.map((g) => (
                        <button
                          key={g.id}
                          onClick={() => handleSendGift(giftPickerFor, g.id)}
                          disabled={heroCoins < g.cost}
                          className={`min-h-tap text-left px-2.5 py-2 rounded-xl border-2 text-[10px] font-bold flex items-center justify-between gap-1 transition-transform active:scale-95 ${
                            heroCoins < g.cost
                              ? "border-sand bg-sand-light text-gray-300"
                              : "border-purple-200 bg-purple-50 text-purple-800"
                          }`}
                        >
                          <span>{g.emoji} {g.label}</span>
                          <span>{g.cost}🪙</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {giftFlash && (
                  <p className="text-[10px] font-bold text-purple-700 text-center">{giftFlash}</p>
                )}
              </div>
            )}

            {/* Filter buttons */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
              <button 
                onClick={() => setTaskFilter("all")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "all" ? "bg-forest text-white border-forest" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setTaskFilter("discipline")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "discipline" ? "bg-amber text-white border-amber" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                ⚡ Kỷ luật
              </button>
              <button 
                onClick={() => setTaskFilter("strength")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "strength" ? "bg-terracotta text-white border-terracotta" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                ❤️ Thể lực
              </button>
              <button 
                onClick={() => setTaskFilter("intellect")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "intellect" ? "bg-sky text-white border-sky" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                🧠 Trí tuệ
              </button>
              <button 
                onClick={() => setTaskFilter("creative")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "creative" ? "bg-clay text-white border-clay" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                🎨 Sáng tạo
              </button>
              <button
                onClick={() => setTaskFilter("help")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "help" ? "bg-forest-medium text-white border-forest-medium" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                🤝 Giúp đỡ
              </button>
              <button
                onClick={() => setTaskFilter("connection")}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  taskFilter === "connection" ? "bg-terracotta text-white border-terracotta" : "bg-white text-gray-500 border-sand hover:border-gray-300"
                }`}
              >
                💞 Kết nối
              </button>
            </div>
          </div>

          {/* Tasks — Kanban-grouped view (B6): WIP-1 lane → today → waiting → done.
              Tap-to-move (BẮT ĐẦU LÀM / HOÀN THÀNH) instead of drag — better for young motor skills. */}
          <div className="space-y-3.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white border-2 border-sand border-dashed p-8 rounded-2xl text-center text-xs text-gray-400 font-bold">
                📭 Không có nhiệm vụ nào trong danh mục này!
              </div>
            ) : (
              [
                { key: "doing", label: "🌳 ĐANG TẬP TRUNG", filter: (t) => !t.completed && t.id === focusTaskId },
                { key: "today", label: "📋 HÔM NAY", filter: (t) => !t.completed && t.id !== focusTaskId },
                { key: "waiting", label: "⏳ CHỜ BỐ MẸ DUYỆT", filter: (t) => t.completed && t.approval === "pending" },
                { key: "done", label: "✅ HOÀN THÀNH", filter: (t) => t.completed && t.approval !== "pending" },
              ].map(({ key, label, filter }) => {
                const group = filteredTasks
                  .filter(filter)
                  .sort((a, b) => (a.isMandatory === b.isMandatory ? 0 : a.isMandatory ? -1 : 1));
                if (group.length === 0) return null;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
                      <span className="text-[10px] font-black text-gray-300">{group.length}</span>
                    </div>
                    {group.map((task) => renderTaskCard(task))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {renderModals()}
    </div>
  );

  // ---- Task card renderer (shared across kanban groups) ----
  function renderTaskCard(task) {
                  // Determine style based on category
                  let emoji = "🛡️";
                  let statText = "EXP";
                  if (task.category === "discipline") { emoji = "⚡"; statText = "Kỷ luật"; }
                  if (task.category === "strength") { emoji = "❤️"; statText = "Thể lực"; }
                  if (task.category === "intellect") { emoji = "🧠"; statText = "Trí tuệ"; }
                  if (task.category === "creative") { emoji = "🎨"; statText = "Sáng tạo"; }
                  if (task.category === "help") { emoji = "🤝"; statText = "Giúp đỡ"; }
                  if (task.category === "connection") { emoji = "💞"; statText = "Kết nối"; }

                  let itemStyle = "border-sand shadow-game-flat hover:border-sand-dark";
                  if (task.isMandatory && !task.completed) {
                    itemStyle = "border-red-200 bg-red-50/10 shadow-game-terracotta hover:border-red-300";
                  } else if (task.completed) {
                    itemStyle = "border-sand opacity-60 line-through bg-gray-50 shadow-none translate-y-[2px]";
                  }

                  const focusable = Boolean(task.durationMin);
                  const isFocusing = focusTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`w-full text-left bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-100 ${itemStyle}`}
                    >
                      {/* Top Row: Checkbox, Title, and Rewards */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Checkbox Icon & Title info */}
                        <div className="flex items-center gap-3 flex-grow">
                          <button
                            type="button"
                            onClick={() => handleTaskComplete(task.id)}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-black transition-all active:scale-90 ${
                              task.completed 
                                ? "bg-forest-medium border-forest-medium text-white" 
                                : "border-sand bg-sand-light text-transparent hover:border-forest"
                            }`}
                          >
                            ✓
                          </button>

                          {/* Title & category tag */}
                          <div className="space-y-0.5">
                            <span className={`text-xs font-extrabold block ${task.completed ? "text-gray-400 line-through" : "text-forest-dark"}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5 select-none">
                                {emoji} {statText}
                              </span>
                              {/* V1.3: soft hint (never a gate) */}
                              {task.verifyType === "parent" && (
                                <span className="text-[9px] font-bold text-gray-400 select-none">👨‍👩‍👧 bố mẹ ghi nhận</span>
                              )}
                              {focusable && (
                                <span className="text-[9px] font-bold text-forest-medium select-none">🌳 {task.durationMin}p</span>
                              )}
                              {task.isMandatory && !task.completed && (
                                <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-terracotta border border-red-200 uppercase animate-pulse select-none">
                                  Bắt buộc 🔴
                                </span>
                              )}
                              {task.custom && (
                                <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-amber-light text-amber border border-amber/30 uppercase select-none">
                                  Bố mẹ giao 👑
                                </span>
                              )}
                              {task.approval === "pending" && (
                                <span className="text-[7.5px] font-black px-1.5 py-0.2 rounded bg-sky-light text-sky-dark border border-sky/30 uppercase select-none">
                                  ⏳ Chờ duyệt
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* EXP / Points / Energy Reward Tag */}
                        <div className="text-right flex flex-col items-end justify-center gap-0.5 font-black text-[9px] select-none">
                          <span className={task.completed ? "text-gray-400" : "text-forest"}>+{task.exp} EXP</span>
                          <span className={task.completed ? "text-gray-400" : "text-forest-medium"}>+{task.points !== undefined ? task.points : task.exp} ⭐</span>
                          {task.energy > 0 && (
                            <span className={task.completed ? "text-gray-400" : "text-amber-dark"}>+{task.energy} ⚡</span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: OPTIONAL focus companion (reward) + optional photo.
                          Never blocks; the checkbox above always completes the task. */}
                      {!task.completed && (
                        <div className="flex items-center justify-between border-t border-sand pt-2.5 mt-1 select-none gap-2">
                          {isFocusing ? (
                            <>
                              <div className="flex items-center gap-2 text-xs font-black text-forest">
                                <span className="animate-pulse text-sm">🌳</span>
                                <span className="font-mono text-sm tracking-wider">Tập trung: {formatStopwatch(elapsedSeconds)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleTaskComplete(task.id)}
                                  className="min-h-tap bg-forest text-white text-[10px] font-black px-3 rounded-xl border border-forest shadow-game-forest active:scale-95 transition-all"
                                >
                                  XONG ✅
                                </button>
                                <button
                                  type="button"
                                  onClick={handleStopFocus}
                                  className="min-h-tap bg-sand-light text-gray-500 text-[10px] font-black px-2.5 rounded-xl border border-sand active:scale-95 transition-all"
                                >
                                  Dừng
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {focusable ? (
                                <span className="text-[10px] text-gray-400 font-bold">
                                  🌳 Bật tập trung để nhận <b className="text-forest-medium">điểm thưởng</b> (tùy chọn)
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-300 font-bold">✓ Làm xong thì tích ô bên trên</span>
                              )}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAttachPhoto(task.id)}
                                  title="Đính ảnh (tùy chọn, lưu trên máy)"
                                  className="min-h-tap w-9 flex items-center justify-center bg-white text-gray-400 rounded-xl border border-sand active:scale-95 transition-all"
                                >
                                  📸
                                </button>
                                {focusable && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartFocus(task.id)}
                                    className="min-h-tap text-[10px] font-black px-3 rounded-xl border-2 border-forest text-forest bg-white shadow-game-forest active:scale-95 transition-all flex items-center gap-1"
                                  >
                                    🌳 Tập trung
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
  }

  // ---- Modals & overlays (anchored to the outer relative container) ----
  function renderModals() {
    return (
      <>
      {/* Hidden optional photo input (device-only, never a gate) */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />

      {/* Pigeon Encouragement Letter Modal */}
      {selectedMessage && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white border-4 border-amber rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative">
            
            {/* Modal Mascot */}
            <div className="w-16 h-16 bg-amber-light rounded-full border-2 border-amber mx-auto flex items-center justify-center text-3xl">
              🕊️
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-amber uppercase tracking-wider">Thư Từ Bố Mẹ 💌</h3>
              <p className="text-[10px] text-gray-400">Gửi đến Chiến Binh {charName} yêu dấu</p>
            </div>

            {/* Letter Content block */}
            <div className="bg-sand-light border-2 border-sand p-4 rounded-2xl text-xs font-bold text-forest-dark leading-relaxed italic shadow-inner">
              &ldquo;{selectedMessage.text}&rdquo;
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full bg-amber text-sand-light font-black text-sm py-3 px-6 rounded-2xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              CÁM ƠN BỐ MẸ! ❤️
            </button>
          </div>
        </div>
      )}

      {/* Critical Hit Confetti Toast Modal */}
      {criticalToast && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-amber border-4 border-amber-dark rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative overflow-hidden animate-scale-up">
            {/* Sparkle background elements */}
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

            {/* Lucky mascot animation */}
            <div className="w-20 h-20 bg-white/20 rounded-full border-4 border-white mx-auto flex items-center justify-center text-4xl shadow-lg animate-bounce select-none">
              ⚡
            </div>

            <div className="space-y-1 text-white">
              <h3 className="text-lg font-black tracking-widest uppercase animate-pulse">ĐIỂM MAY MẮN! 🌟</h3>
              <p className="text-[10px] opacity-90 font-bold uppercase tracking-wider">{charName} đã kích hoạt Cú Đập Sức Mạnh 💥</p>
            </div>

            <div className="bg-white border-2 border-amber-dark p-4 rounded-2xl shadow-inner space-y-1">
              <p className="text-[10px] text-gray-400 font-extrabold uppercase">Nhận Thưởng Nhiệm Vụ</p>
              <p className="text-xs font-black text-forest-dark truncate px-2">{criticalToast.taskTitle}</p>
              <div className="text-3xl font-black text-amber-dark flex items-center justify-center gap-1.5 py-1">
                <span>+ {criticalToast.amount}</span>
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-[9px] text-forest font-bold uppercase tracking-wider">Đã nhân đôi Điểm Tích Lũy và nhân hệ số Streak! 🎉</p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setCriticalToast(null)}
              className="w-full bg-white text-amber-dark font-black text-xs py-3 px-6 rounded-xl border-2 border-white shadow-game-flat hover:bg-amber-light btn-game-transition active:shadow-game-pressed"
            >
              QUÁ TUYỆT VỜI! 🚀
            </button>
          </div>
        </div>
      )}

      {/* GUIDELINES MODAL FOR CHILD */}
      {showGuideModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white border-4 border-forest rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative max-h-[85vh] overflow-y-auto">
            <div className="w-16 h-16 bg-forest-light rounded-full border-2 border-forest mx-auto flex items-center justify-center text-3xl shadow">
              📜
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">Cẩm Nang Chiến Binh Mùa Hè 📜</h3>
              <p className="text-[10px] text-gray-500">Bí kíp để thăng cấp và nhận những phần quà xịn nhất!</p>
            </div>

            <div className="text-left space-y-3.5 text-xs text-forest-dark font-medium bg-sand-light p-4 rounded-2xl border border-sand">
              <div className="space-y-1">
                <p className="font-black text-forest flex items-center gap-1 text-[11px]">
                  🎯 1. Làm Nhiệm Vụ Hằng Ngày
                </p>
                <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
                  Hoàn thành các nhiệm vụ bố mẹ giao để nhận **EXP thăng cấp**, **Điểm Tích Lũy ⭐** và **Tiền Vàng 🪙**.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-black text-amber-dark flex items-center gap-1 text-[11px]">
                  🔥 2. Duy Trì Ngọn Lửa Streak
                </p>
                <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
                  Hoàn thành từ **3 nhiệm vụ mỗi ngày** để duy trì ngọn lửa Streak 🔥. Streak càng cao, lượng Điểm ⭐ nhận được từ nhiệm vụ tiếp theo càng nhiều!
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-black text-terracotta flex items-center gap-1 text-[11px]">
                  ⚡ 3. Điểm May Mắn (Lucky Multiplier)
                </p>
                <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
                  Mỗi khi hoàn thành một nhiệm vụ, dũng sĩ có **15% cơ hội** kích hoạt **Điểm May Mắn ⚡** giúp nhân đôi lượng Điểm ⭐ nhận được!
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-black text-forest-dark flex items-center gap-1 text-[11px]">
                  ⛏️ 4. Đào Mỏ & Đổi Quà
                </p>
                <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed space-y-1">
                  • Hoàn thành việc tốt nạp **Năng Lượng ⚡**.<br />
                  • Đập đá ở **Hang Đào Mỏ ⛏️** nhận **Hero Coin 🪙**.<br />
                  • Dùng **Điểm ⭐** đổi thời gian chơi TV/game; dùng **Hero Coin 🪙** đổi quà thực tế lớn (kem, Lego)!
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-black text-clay flex items-center gap-1 text-[11px]">
                  🐾 5. Ấp Trứng & Huấn Luyện Thú Cưỡi
                </p>
                <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
                  • **Cách có vật phẩm:** Đập đá đào mỏ, nhờ bố mẹ tặng thưởng, hoặc chủ động **dùng Hero Coin 🪙 mua Trứng (Thường, Sói, Rồng), Thuốc phép & Combo Thức ăn** trong Cửa Hàng 🛒.<br />
                  • **Ấp thú cưng:** Kết hợp Trứng & Thuốc ấp phép để nở ra Fox, Cat, Sói, Rồng 🦊.<br />
                  • **Huấn luyện & Ấn Pháp:** Nuôi pet bằng Thức ăn đạt 100% thân mật sẽ tiến hóa thành **Thú Cưỡi khổng lồ 🦖**, giúp tăng **+10% Năng lượng ⚡** khi làm nhiệm vụ ngày và **+5% tỷ lệ nổ Cú Đập Sức Mạnh 🔥** khi đào mỏ!
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-black text-sky flex items-center gap-1 text-[11px]">
                  🕊️ 6. Bồ Câu Nhận Thư Động Viên
                </p>
                <p className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">
                  • Mỗi ngày bố mẹ sẽ gửi những lời chúc, lời nhắn nhủ viết tay yêu thương từ Phòng Quản Trị.<br />
                  • Nhấp vào chú chim bồ câu 🕊️ bay lượn ở góc màn hình để mở thư động viên của bố mẹ và nhận niềm vui bất ngờ nhé!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-forest text-sand-light font-black text-xs py-3 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
            >
              CON ĐÃ HIỂU, LÊN ĐƯỜNG THÔI! 🚀
            </button>
          </div>
        </div>
      )}

      {/* Floating Carrier Pigeon if there are unread messages */}
      {unreadLetters.length > 0 && (
        <button
          onClick={() => handleOpenLetter(unreadLetters[0])}
          className="fixed bottom-24 right-6 w-12 h-12 bg-white border-2 border-amber rounded-full shadow-game-amber flex items-center justify-center text-2xl z-40 animate-bounce active:scale-95 transition-transform"
          type="button"
          title="Bồ câu đưa thư từ bố mẹ đang đợi con!"
        >
          🕊️
          <span className="absolute -top-1 -right-1 bg-terracotta text-white font-extrabold text-[8px] h-4 w-4 rounded-full flex items-center justify-center border border-white animate-pulse">
            !
          </span>
        </button>
      )}

      {/* BOTTOM TAB NAVIGATION (Duolingo style) */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
        <button
          onClick={() => {}}
          className="flex flex-col items-center p-2 text-forest-medium space-y-0.5"
        >
          <span className="text-xl">🌳</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Phiêu Lưu</span>
        </button>

        <button
          onClick={() => router.push("/rewards")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🛒</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Đổi Quà</span>
        </button>

        <button
          onClick={() => router.push("/mining")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">⛏️</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Đào Mỏ</span>
        </button>

        <button
          onClick={() => router.push("/parent")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🔑</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Bố Mẹ</span>
        </button>
      </div>
      </>
    );
  }
}
