"use client";

import React from "react";

const CATEGORY_META = {
  discipline: { emoji: "⚡", statText: "Kỷ luật" },
  strength: { emoji: "❤️", statText: "Thể lực" },
  intellect: { emoji: "🧠", statText: "Trí tuệ" },
  creative: { emoji: "🎨", statText: "Sáng tạo" },
  help: { emoji: "🤝", statText: "Giúp đỡ" },
  connection: { emoji: "💞", statText: "Kết nối" },
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
  const { emoji, statText } = CATEGORY_META[task.category] || { emoji: "🛡️", statText: "EXP" };

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
          <button
            type="button"
            onClick={() => onToggleComplete(task.id)}
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
                  onClick={() => onToggleComplete(task.id)}
                  className="min-h-tap bg-forest text-white text-[10px] font-black px-3 rounded-xl border border-forest shadow-game-forest active:scale-95 transition-all"
                >
                  XONG ✅
                </button>
                <button
                  type="button"
                  onClick={onStopFocus}
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
                  onClick={() => onAttachPhoto(task.id)}
                  title="Đính ảnh (tùy chọn, lưu trên máy)"
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
