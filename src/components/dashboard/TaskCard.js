"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";
import { Star, Clock, Trees } from "lucide-react";

const formatStopwatch = (totalSecs) => {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// Big clean apps (Todoist / Reminders / Things) don't put decorative emoji in
// task text. Strip them from the DISPLAY so a line is just: check + text + reward.
const stripEmoji = (s) =>
  (s || "")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

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
  const points = task.points !== undefined ? task.points : task.exp;
  const pending = task.approval === "pending";
  const title = stripEmoji(task.title);

  let itemStyle = "border-sand shadow-game-flat";
  if (task.isMandatory && !task.completed) {
    itemStyle = "border-terracotta/50 shadow-game-flat";
  } else if (task.completed) {
    itemStyle = "border-sand opacity-55 bg-gray-50 shadow-none";
  }

  return (
    <div className={`w-full bg-white border-2 rounded-2xl p-3.5 flex flex-col gap-2.5 transition-all ${itemStyle}`}>
      <div className="flex items-center gap-3">
        {/* Checkbox — 44px hit area via hit-target */}
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

        {/* Task text — no emoji, clamp to 2 tidy lines */}
        <span className={`flex-grow min-w-0 text-scale-sm font-extrabold leading-snug line-clamp-2 ${task.completed ? "text-gray-400 line-through" : "text-forest-dark"}`}>
          {title}
        </span>

        {/* One reward chip */}
        <span
          className={`flex-shrink-0 flex items-center gap-1 text-scale-2xs font-black px-2.5 py-1 rounded-full select-none ${
            task.completed
              ? "bg-gray-100 text-gray-400"
              : pending
                ? "bg-sky-light text-sky-dark"
                : "bg-amber-light text-amber-dark"
          }`}
        >
          {pending ? <Clock size={13} /> : <>+{points} <Star size={13} fill="currentColor" /></>}
        </span>
      </div>

      {/* Focus timer — only for timed tasks */}
      {focusable && !task.completed && (
        <div className="flex items-center gap-2 border-t border-sand pt-2.5">
          {isFocusing ? (
            <>
              <span className="mr-auto flex items-center gap-1.5 font-mono text-scale-sm font-black text-forest">
                <Trees size={16} className="animate-pulse" /> {formatStopwatch(elapsedSeconds)}
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
            <button
              type="button"
              onClick={() => onStartFocus(task.id)}
              className="mr-auto min-h-tap text-scale-2xs font-black px-4 rounded-xl border-2 border-forest text-forest bg-white active:scale-95 transition-all"
            >
              {t("game.task.startFocus")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
