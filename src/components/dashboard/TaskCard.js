"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

const CATEGORY_META = {
  discipline: { emoji: "⚡", statKey: "game.stat.discipline" },
  strength: { emoji: "❤️", statKey: "game.stat.strength" },
  intellect: { emoji: "🧠", statKey: "game.stat.intellect" },
  creative: { emoji: "🎨", statKey: "game.stat.creative" },
  help: { emoji: "🤝", statKey: "game.stat.help" },
  connection: { emoji: "💞", statKey: "game.stat.connection" },
};

const formatStopwatch = (totalSecs) => {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

/**
 * One task row in the kanban list: checkbox claim, soft verify hints,
 * optional focus stopwatch + optional device-only photo (never gates).
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
  const meta = CATEGORY_META[task.category];
  const emoji = meta?.emoji || "🛡️";
  const statText = meta ? t(meta.statKey) : t("game.stat.exp");

  let itemStyle = "border-sand shadow-game-flat hover:border-sand-dark";
  if (task.isMandatory && !task.completed) {
    itemStyle = "border-red-200 bg-red-50/10 shadow-game-terracotta hover:border-red-300";
  } else if (task.completed) {
    itemStyle = "border-sand opacity-60 line-through bg-gray-50 shadow-none translate-y-[2px]";
  }

  const focusable = Boolean(task.durationMin);

  return (
    <div className={`w-full text-left bg-white border-2 rounded-2xl p-4 flex flex-col gap-3 transition-all duration-100 ${itemStyle}`}>
      {/* Top Row: Checkbox, Title, and Rewards */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-grow">
          {/* Primary action — Fitts/HIG: 28px visual, 44px hit area via hit-target */}
          <button
            type="button"
            aria-label={task.completed ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
            aria-pressed={task.completed}
            onClick={() => onToggleComplete(task.id)}
            className={`hit-target flex-shrink-0 w-7 h-7 rounded-lg border-2 flex items-center justify-center text-sm font-black transition-all active:scale-90 ${
              task.completed
                ? "bg-forest-medium border-forest-medium text-white"
                : "border-sand-dark bg-sand-light text-transparent hover:border-forest"
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
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-0.5 select-none">
                {emoji} {statText}
              </span>
              {/* V1.3: soft hint (never a gate) */}
              {task.verifyType === "parent" && (
                <span className="text-[11px] font-bold text-gray-400 select-none">{t("game.task.parentNote")}</span>
              )}
              {focusable && (
                <span className="text-[11px] font-bold text-forest-medium select-none">{t("game.task.minutes", { n: task.durationMin })}</span>
              )}
              {task.isMandatory && !task.completed && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-rose-100 text-terracotta border border-red-200 uppercase animate-pulse select-none">
                  {t("game.task.mandatory")}
                </span>
              )}
              {task.journeyId && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-forest-light/40 text-forest-dark border border-forest/30 uppercase select-none">
                  {t("game.task.journeyBadge")}
                </span>
              )}
              {task.custom && !task.journeyId && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-light text-amber border border-amber/30 uppercase select-none">
                  {t("game.task.parentAssigned")}
                </span>
              )}
              {task.approval === "pending" && (
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-sky-light text-sky-dark border border-sky/30 uppercase select-none">
                  {t("game.task.waiting")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* EXP / Points / Energy Reward Tag */}
        <div className="text-right flex flex-col items-end justify-center gap-0.5 font-black text-[11px] select-none">
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
                <span className="font-mono text-sm tracking-wider">{t("game.task.focusLabel", { time: formatStopwatch(elapsedSeconds) })}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onToggleComplete(task.id)}
                  className="min-h-tap bg-forest text-white text-[10px] font-black px-3 rounded-xl border border-forest shadow-game-forest active:scale-95 transition-all"
                >
                  {t("game.task.focusDone")}
                </button>
                <button
                  type="button"
                  onClick={onStopFocus}
                  className="min-h-tap bg-sand-light text-gray-500 text-[10px] font-black px-2.5 rounded-xl border border-sand active:scale-95 transition-all"
                >
                  {t("game.task.focusStop")}
                </button>
              </div>
            </>
          ) : (
            <>
              {focusable ? (
                <span className="text-[10px] text-gray-400 font-bold">
                  {t("game.task.focusHintA")}<b className="text-forest-medium">{t("game.task.focusHintBold")}</b>{t("game.task.focusHintB")}
                </span>
              ) : (
                <span className="text-[10px] text-gray-300 font-bold">{t("game.task.tickHint")}</span>
              )}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onAttachPhoto(task.id)}
                  title={t("game.task.photoTitle")}
                  className="min-h-tap w-9 flex items-center justify-center bg-white text-gray-400 rounded-xl border border-sand active:scale-95 transition-all"
                >
                  📸
                </button>
                {focusable && (
                  <button
                    type="button"
                    onClick={() => onStartFocus(task.id)}
                    className="min-h-tap text-[10px] font-black px-3 rounded-xl border-2 border-forest text-forest bg-white shadow-game-forest active:scale-95 transition-all flex items-center gap-1"
                  >
                    {t("game.task.startFocus")}
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
