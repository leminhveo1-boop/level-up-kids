"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import StatusBar from "@/components/dashboard/StatusBar";
import HeroCard from "@/components/dashboard/HeroCard";
import CompanionCard from "@/components/dashboard/CompanionCard";
import StatsGrid from "@/components/dashboard/StatsGrid";
import GoalBar from "@/components/dashboard/GoalBar";
import FamilyStrip from "@/components/dashboard/FamilyStrip";
import TaskFilterBar from "@/components/dashboard/TaskFilterBar";
import TaskCard from "@/components/dashboard/TaskCard";
import LetterModal from "@/components/dashboard/LetterModal";
import CriticalToast from "@/components/dashboard/CriticalToast";
import GuideModal from "@/components/dashboard/GuideModal";
import BottomNav from "@/components/dashboard/BottomNav";

export default function DashboardPage() {
  const router = useRouter();
  const { childProfiles, activeChildId, selectChild, isDemo } = useAuth();
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

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const filteredTasks = tasks.filter((t) => taskFilter === "all" || t.category === taskFilter);

  const unreadLetters = encouragements.filter((e) => !e.read);

  const handleOpenLetter = (letter) => {
    setSelectedMessage(letter);
    readAllMessages();
    // Celebrate pigeon arrival
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
  };

  // Kanban lanes (B6): WIP-1 focus lane → today → waiting → done.
  // Tap-to-move instead of drag — better for young motor skills.
  const TASK_LANES = [
    { key: "doing", label: "🌳 ĐANG TẬP TRUNG", filter: (t) => !t.completed && t.id === focusTaskId },
    { key: "today", label: "📋 HÔM NAY", filter: (t) => !t.completed && t.id !== focusTaskId },
    { key: "waiting", label: "⏳ CHỜ BỐ MẸ DUYỆT", filter: (t) => t.completed && t.approval === "pending" },
    { key: "done", label: "✅ HOÀN THÀNH", filter: (t) => t.completed && t.approval !== "pending" },
  ];

  return (
    <div className="flex flex-col flex-grow relative pb-20">
      {/* Scrollable Main Area */}
      <div className="flex-grow p-5 space-y-5 overflow-y-auto">
        <StatusBar
          energy={energy}
          points={points}
          heroCoins={heroCoins}
          streak={streak}
          streakFreezes={streakFreezes}
          encouragements={encouragements}
          unreadCount={unreadLetters.length}
          onOpenLetter={handleOpenLetter}
          onOpenGuide={() => setShowGuideModal(true)}
        />

        <HeroCard
          charName={charName}
          charClass={charClass}
          level={level}
          exp={exp}
          expToNextLevel={expToNextLevel}
          cosmetics={cosmetics}
          activePetObj={activePetObj}
          activeMountObj={activeMountObj}
        />

        {activeCompanion && <CompanionCard companion={activeCompanion} />}

        <StatsGrid stats={stats} />

        {/* DAILY TASKS SECTION */}
        <div className="space-y-3">
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

            <GoalBar rewards={rewards} heroCoins={heroCoins} />

            {!isDemo && childProfiles.length > 1 && (
              <FamilyStrip
                childProfiles={childProfiles}
                activeChildId={activeChildId}
                heroCoins={heroCoins}
                onSelectChild={selectChild}
                sendGift={sendGift}
              />
            )}

            <TaskFilterBar taskFilter={taskFilter} onChange={setTaskFilter} />
          </div>

          {/* Tasks — Kanban-grouped view */}
          <div className="space-y-3.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white border-2 border-sand border-dashed p-8 rounded-2xl text-center text-xs text-gray-400 font-bold">
                📭 Không có nhiệm vụ nào trong danh mục này!
              </div>
            ) : (
              TASK_LANES.map(({ key, label, filter }) => {
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
                    {group.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isFocusing={focusTaskId === task.id}
                        elapsedSeconds={elapsedSeconds}
                        onToggleComplete={handleTaskComplete}
                        onStartFocus={handleStartFocus}
                        onStopFocus={handleStopFocus}
                        onAttachPhoto={handleAttachPhoto}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Hidden optional photo input (device-only, never a gate) */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelected}
        className="hidden"
      />

      {selectedMessage && (
        <LetterModal message={selectedMessage} charName={charName} onClose={() => setSelectedMessage(null)} />
      )}

      {criticalToast && (
        <CriticalToast toast={criticalToast} charName={charName} onClose={() => setCriticalToast(null)} />
      )}

      {showGuideModal && <GuideModal onClose={() => setShowGuideModal(false)} />}

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

      <BottomNav />
    </div>
  );
}
