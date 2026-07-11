"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";
import { Star, Clock, Trees, Sprout } from "lucide-react";
import { stripEmoji } from "@/lib/text";
import { rewardDoseFactor } from "@/lib/game/economy";
import { FADE_START, GRADUATION_DAYS } from "@/lib/game/constants";

const formatStopwatch = (totalSecs) => {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * One task row — restrained, big-app style: a checkbox, the task text, and one
 * reward chip. Nothing else. Mandatory = subtle card border (no extra dot).
 * Focus timer appears only for timed tasks.
 */
export default function TaskCard({
  task,
  isFocusing,
  elapsedSeconds,
  onToggleComplete,
  onStartFocus,
  onStopFocus,
}) {
  const { t } = useLang();
  const focusable = Boolean(task.durationMin);
  const rawPoints = task.points !== undefined ? task.points : task.exp;
  // PROD-1: hiển thị điểm nền ĐÃ cân liều (khớp điểm thực nhận, hết lệch).
  const habitStreak = task.habitStreak || 0;
  const points = Math.ceil(rawPoints * rewardDoseFactor(habitStreak));
  // Việc đã thành nếp → chuyển frame tích cực: đếm ngược tới "Bản Năng Anh Hùng"
  // (KHÔNG nói "trừ điểm"). Chỉ khi đang rút liều và chưa tốt nghiệp.
  const growingInstinct = habitStreak > FADE_START && !task.completed;
  const daysToInstinct = Math.max(1, GRADUATION_DAYS - habitStreak);
  const pending = task.approval === "pending";
  const title = stripEmoji(task.title);

  let itemStyle = "border-sand";
  if (task.isMandatory && !task.completed) {
    itemStyle = "border-terracotta/40";
  } else if (task.completed) {
    itemStyle = "border-sand opacity-55 bg-gray-50";
  }

  return (
    <div className={`w-full bg-white border-2 rounded-2xl p-4 flex flex-col gap-4 transition-all ${itemStyle}`}>
      <div className="flex items-center gap-3">
        {/* Checkbox — 44px hit area via hit-target */}
        <button
          type="button"
          aria-label={task.completed ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
          aria-pressed={task.completed}
          onClick={() => onToggleComplete(task.id)}
          className={`hit-target flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center text-base font-black transition-all active:scale-90 ${
            task.completed
              ? "accent-bg accent-border"
              : "border-sand-dark bg-sand-light text-transparent"
          }`}
        >
          ✓
        </button>

        {/* Task text — no emoji, clamp to 2 tidy lines */}
        <span className={`flex-grow min-w-0 text-scale-sm font-extrabold leading-snug line-clamp-2 ${task.completed ? "text-gray-400 line-through" : "text-forest-dark"}`}>
          {title}
        </span>

        {/* Reward — muted metadata, not a loud colored pill (single-accent rule) */}
        <span className={`flex-shrink-0 flex items-center gap-1 text-scale-2xs font-bold select-none ${task.completed ? "text-gray-300" : pending ? "text-sky-dark" : "text-gray-400"}`}>
          {pending ? <Clock size={14} /> : <>+{points} <Star size={13} className="text-amber" fill="currentColor" /></>}
        </span>
      </div>

      {/* PROD-1 — instinct countdown: reframe the fading reward as progress toward
          "Hero Instinct" (never "points reduced"). Warm brown text + amber sprout. */}
      {growingInstinct && (
        <div className="flex items-center gap-1.5 text-scale-2xs font-bold text-gray-500 -mt-1">
          <Sprout size={14} className="text-amber flex-shrink-0" />
          {t("game.task.instinctGrowing", { days: daysToInstinct })}
        </div>
      )}

      {/* Focus timer — only for timed tasks */}
      {focusable && !task.completed && (
        <div className="flex items-center gap-2 border-t border-sand pt-4">
          {isFocusing ? (
            <>
              <span className="mr-auto flex items-center gap-1.5 font-mono text-scale-sm font-black accent-text">
                <Trees size={16} className="animate-pulse" /> {formatStopwatch(elapsedSeconds)}
              </span>
              <button
                type="button"
                onClick={() => onToggleComplete(task.id)}
                className="min-h-tap accent-bg text-scale-2xs font-black px-4 rounded-xl shadow-game-forest active:scale-95 transition-all"
              >
                {t("game.task.focusDone")}
              </button>
              <button
                type="button"
                onClick={onStopFocus}
                className="min-h-tap bg-sand-light text-gray-500 text-scale-2xs font-black px-3 rounded-xl active:scale-95 transition-all"
              >
                {t("game.task.focusStop")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onStartFocus(task.id)}
              className="mr-auto min-h-tap text-scale-2xs font-black px-4 rounded-xl border-2 accent-border accent-text bg-white active:scale-95 transition-all"
            >
              {t("game.task.startFocus")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
