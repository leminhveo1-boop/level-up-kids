"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import confetti from "canvas-confetti";
import StatusBar from "@/features/kid/components/StatusBar";
import HeroCard from "@/features/kid/components/HeroCard";
import CompanionCard from "@/features/kid/components/CompanionCard";
import WorldTreeCard from "@/features/kid/components/WorldTreeCard";
import SeasonBanner from "@/features/kid/components/SeasonBanner";
import StatsGrid from "@/features/kid/components/StatsGrid";
import GoalBar from "@/features/kid/components/GoalBar";
import FamilyStrip from "@/features/kid/components/FamilyStrip";
import TaskFilterBar from "@/features/kid/components/TaskFilterBar";
import TaskCard from "@/features/kid/components/TaskCard";
import JourneyCard from "@/features/kid/components/JourneyCard";
import LetterModal from "@/features/kid/components/LetterModal";
import CriticalToast from "@/features/kid/components/CriticalToast";
import BottomNav from "@/features/kid/components/BottomNav";
import { Target, SlidersHorizontal } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLang();
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
    treeGrowth,
    lastGraduation,
    clearLastGraduation,
    journey,
    lastJourneyCompleted,
    clearJourneyCelebration,
    receivedGifts,
    markReceivedGiftsRead,
    sendGift,
  } = useGame();

  const [taskFilter, setTaskFilter] = useState("all"); // Filter daily tasks
  const [showFilter, setShowFilter] = useState(false); // category filter hidden until asked
  const [selectedMessage, setSelectedMessage] = useState(null); // Pigeon Modal Message
  const [criticalToast, setCriticalToast] = useState(null); // Toast for Critical Hit Points!

  // V1.3: OPTIONAL focus companion — the child may run it for a bonus, but it
  // never gates completion and never blocks other tasks.
  const [focusTaskId, setFocusTaskId] = useState(null); // task with an active focus session
  const [focusStartTime, setFocusStartTime] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [verifyToast, setVerifyToast] = useState(""); // small info toast

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
    if (focusEarned) showVerifyToast(t("game.toast.focusBonus"));

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

  const handleNudge = () => {
    const r = nudgeParents();
    showVerifyToast(r.success ? t("game.toast.nudgeSent") : t("game.toast.nudgeLimit"));
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

  const filteredTasks = tasks.filter((task) => taskFilter === "all" || task.category === taskFilter);

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
  // NOTE: `t` here is the translator; lane filter args are renamed `task` to avoid shadowing.
  const TASK_LANES = [
    { key: "doing", labelKey: "game.lane.doing", filter: (task) => !task.completed && task.id === focusTaskId },
    { key: "today", labelKey: "game.lane.today", filter: (task) => !task.completed && task.id !== focusTaskId },
    { key: "waiting", labelKey: "game.lane.waiting", filter: (task) => task.completed && task.approval === "pending" },
    { key: "done", labelKey: "game.lane.done", filter: (task) => task.completed && task.approval !== "pending" },
  ];

  return (
    // Demo mode: reserve extra bottom space so the floating paywall banner never
    // covers the last task/card (Nielsen error-prevention / reachability).
    <div className={`flex flex-col flex-grow relative ${isDemo ? "pb-44" : "pb-20"}`}>
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

        {/* 🛤️ B-lite: active journey — the child's guided path (sits with tasks) */}
        {journey && <JourneyCard journey={journey} tasks={tasks} />}

        {/* ===== FOCAL BLOCK: today's tasks — the one thing the child opens the
             app to do. Promoted above the ambient "world" cards so the primary
             action never sits below the fold (visual hierarchy / Von Restorff). ===== */}
        <div className="space-y-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-forest flex-shrink-0" />
              <h3 className="text-scale-lg font-black text-forest-dark truncate flex-grow min-w-0">
                {t("game.tasks.title")}
              </h3>
              <span className="text-scale-2xs font-black text-forest-dark bg-forest-light/40 px-2.5 py-1 rounded-full flex-shrink-0">
                {completedTasksCount}/{totalTasksCount}
              </span>
              <button
                type="button"
                onClick={() => setShowFilter((v) => !v)}
                aria-label="Lọc theo nhóm"
                className={`hit-target w-9 h-9 flex items-center justify-center rounded-full border flex-shrink-0 transition-colors ${
                  showFilter || taskFilter !== "all" ? "bg-forest text-white border-forest" : "bg-white text-gray-400 border-sand"
                }`}
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            {/* P0: Pending approval summary + child-initiated nudge */}
            {pendingCount > 0 && (
              <div className="w-full bg-sky-light/60 border border-sky/30 p-2.5 rounded-xl flex items-center justify-between gap-2">
                <span className="text-[11px] text-sky-dark font-bold flex items-center gap-1">
                  {t("game.tasks.pending", { n: pendingCount })}
                </span>
                <button
                  type="button"
                  onClick={handleNudge}
                  className="min-h-tap flex-shrink-0 bg-white border border-sky/40 text-sky-dark text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
                >
                  {t("game.tasks.nudge")}
                </button>
              </div>
            )}

            {/* 🎁 D3: unread gifts from siblings */}
            {receivedGifts?.some((g) => !g.read) && (
              <div className="w-full bg-purple-50 border-2 border-purple-200 p-3 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">{t("game.tasks.giftsTitle")}</span>
                {receivedGifts.filter((g) => !g.read).slice(0, 3).map((g) => (
                  <p key={g.id} className="text-[11px] font-bold text-purple-800">
                    {t("game.tasks.gaveYou", { emoji: g.emoji, name: g.fromName, label: g.label })}
                  </p>
                ))}
                <button
                  onClick={markReceivedGiftsRead}
                  className="min-h-tap bg-white border border-purple-200 text-purple-700 text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
                >
                  {t("game.tasks.thanks")}
                </button>
              </div>
            )}

            {/* Verification gate toast */}
            {verifyToast && (
              <div className="w-full bg-rose-50 border border-red-200 p-2.5 rounded-xl text-[11px] text-terracotta font-bold text-center animate-fade-in">
                {verifyToast}
              </div>
            )}

            {/* 🏆 Journey conquered banner (B-lite Lộ Trình) */}
            {lastJourneyCompleted && (
              <div className="w-full bg-forest-light/30 border-2 border-forest p-3.5 rounded-2xl text-center space-y-2 animate-fade-in">
                <p className="text-2xl">{lastJourneyCompleted.icon}🏆</p>
                <p className="text-[12px] font-black text-forest-dark leading-snug">
                  {t("game.journey.done.title", { title: lastJourneyCompleted.title })}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {t("game.journey.done.desc", {
                    success: lastJourneyCompleted.successDays,
                    total: lastJourneyCompleted.totalDays,
                  })}
                </p>
                <button
                  onClick={clearJourneyCelebration}
                  className="min-h-tap bg-forest text-white text-[10px] font-black px-5 rounded-xl active:scale-95 transition-transform"
                >
                  {t("game.journey.done.cta")}
                </button>
              </div>
            )}

            {/* 🎓 Graduation ceremony banner (Overjustification defense) */}
            {lastGraduation && (
              <div className="w-full bg-amber-light border-2 border-amber p-3.5 rounded-2xl text-center space-y-2 animate-fade-in">
                <p className="text-2xl">🎓✨</p>
                <p className="text-[12px] font-black text-amber-dark leading-snug">
                  {t("game.grad.instinct", { title: lastGraduation.title })}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {t("game.grad.desc", { days: lastGraduation.days })}
                </p>
                <button
                  onClick={clearLastGraduation}
                  className="min-h-tap bg-amber text-white text-[10px] font-black px-5 rounded-xl active:scale-95 transition-transform"
                >
                  {t("game.grad.cta")}
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

            {showFilter && <TaskFilterBar taskFilter={taskFilter} onChange={setTaskFilter} />}
          </div>

          {/* Tasks — Kanban-grouped view */}
          <div className="space-y-3.5">
            {filteredTasks.length === 0 ? (
              <div className="bg-white border-2 border-sand border-dashed p-8 rounded-2xl text-center text-xs text-gray-400 font-bold">
                {t("game.tasks.empty")}
              </div>
            ) : (
              TASK_LANES.map(({ key, labelKey, filter }) => {
                const group = filteredTasks
                  .filter(filter)
                  .sort((a, b) => (a.isMandatory === b.isMandatory ? 0 : a.isMandatory ? -1 : 1));
                if (group.length === 0) return null;
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{t(labelKey)}</span>
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
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===== AMBIENT ZONE — the child's "world": identity, season, pet,
             tree, stats. Grouped + labelled below the focal tasks so they read
             as secondary ambience, not competing focal points (Gestalt common
             region + hierarchy). ===== */}
        <div className="pt-1 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-scale-2xs font-black text-gray-400 uppercase tracking-wider">🌍 {t("game.world.title")}</span>
            <span className="flex-grow h-px bg-sand" />
          </div>
          {activeCompanion && <CompanionCard companion={activeCompanion} />}
          <SeasonBanner />
          <WorldTreeCard treeGrowth={treeGrowth} />
          <StatsGrid stats={stats} />
        </div>
      </div>

      {selectedMessage && (
        <LetterModal message={selectedMessage} charName={charName} onClose={() => setSelectedMessage(null)} />
      )}

      {criticalToast && (
        <CriticalToast toast={criticalToast} charName={charName} onClose={() => setCriticalToast(null)} />
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
          <span className="absolute -top-1 -right-1 bg-terracotta text-white font-extrabold text-[10px] h-4 w-4 rounded-full flex items-center justify-center border border-white animate-pulse">
            !
          </span>
        </button>
      )}

      <BottomNav />
    </div>
  );
}
