"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";
import { Star, Clock } from "lucide-react";

const formatStopwatch = (totalSecs) => {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * One task row — kid-first: big tap check, task title (already carries its own
 * emoji), ONE reward pill. No stat labels / verify notes / hint paragraphs —
 * kids don't read them. Focus timer stays for focusable tasks, icon-only.
 */
export default function TaskCard({
  task,
  isFocusing,
  elapsedSeconds,
  onToggleComplete,
  onStartFocus,
  onStopFocus,
  onAttachPhoto,
}) {
  const { t } = useLang();
  const focusable = Boolean(task.durationMin);
  const points = task.points !== undefined ? task.points : task.exp;
  const pending = task.approval === "pending";

  let itemStyle = "border-sand shadow-game-flat";
  if (task.isMandatory && !task.completed) {
    itemStyle = "border-terracotta/50 shadow-game-flat";
  } else if (task.completed) {
    itemStyle = "border-sand opacity-55 bg-gray-50 shadow-none";
  }

  return (
    <div className={`w-full bg-white border-2 rounded-2xl p-3.5 flex flex-col gap-2.5 transition-all ${itemStyle}`}>
      <div className="flex items-center gap-3">
        {/* Primary action — big, obvious; 44px hit area via hit-target */}
        <button
          type="button"
          aria-label={task.completed ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
          aria-pressed={task.completed}
          onClick={() => onToggleComplete(task.id)}
          className={`hit-target flex-shrink-0 w-8 h-8 rounded-xl border-2 flex items-center justify-center text-base font-black transition-all active:scale-90 ${
            task.completed
              ? "bg-forest-medium border-forest-medium text-white"
              : "border-sand-dark bg-sand-light text-transparent hover:border-forest"
          }`}
        >
          ✓
        </button>

        {/* Title (carries its own emoji) — clamp to 2 tidy lines, never ragged */}
        <span className={`flex-grow min-w-0 text-scale-sm font-extrabold leading-snug line-clamp-2 ${task.completed ? "text-gray-400 line-through" : "text-forest-dark"}`}>
          {task.isMandatory && !task.completed && <span className="text-terracotta mr-0.5">●</span>}
          {task.title}
        </span>

        {/* ONE reward — the star points they spend on rewards */}
        <span
          className={`flex-shrink-0 flex items-center gap-1 text-scale-2xs font-black px-2.5 py-1 rounded-full select-none ${
            task.completed
              ? "bg-gray-100 text-gray-400"
              : pending
                ? "bg-sky-light text-sky-dark"
                : "bg-amber-light text-amber-dark"
          }`}
        >
          {pending ? (
            <Clock size={13} />
          ) : (
            <>+{points} <Star size={13} fill="currentColor" /></>
          )}
        </span>
      </div>

      {/* Focus timer — only for focusable tasks, icon-only, no hint text */}
      {focusable && !task.completed && (
        <div className="flex items-center gap-2 border-t border-sand pt-2.5">
          {isFocusing ? (
            <>
              <span className="mr-auto flex items-center gap-1.5 font-mono text-scale-sm font-black text-forest">
                <span className="animate-pulse">🌳</span> {formatStopwatch(elapsedSeconds)}
              </span>
              <button
                type="button"
                onClick={() => onToggleComplete(task.id)}
                className="min-h-tap bg-forest text-white text-scale-2xs font-black px-4 rounded-xl shadow-game-forest active:scale-95 transition-all"
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
            <>
              <button
                type="button"
                onClick={() => onAttachPhoto(task.id)}
                aria-label={t("game.task.photoTitle")}
                className="min-w-tap min-h-tap flex items-center justify-center bg-white text-gray-400 rounded-xl border border-sand active:scale-95 transition-all"
              >
                📷
              </button>
              <button
                type="button"
                onClick={() => onStartFocus(task.id)}
                className="mr-auto min-h-tap text-scale-2xs font-black px-4 rounded-xl border-2 border-forest text-forest bg-white active:scale-95 transition-all"
              >
                {t("game.task.startFocus")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
