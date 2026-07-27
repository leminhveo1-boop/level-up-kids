"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameState";
import { stripEmoji } from "@/lib/text";
import { NotebookPen, Printer, X, Play, Pause, RotateCcw, Check } from "lucide-react";
import { sessionTaskList, formatClock, SESSION_PRESETS } from "@/lib/game/focusSession";

/**
 * D3.1 — CHẾ ĐỘ SỔ / KHÔNG MÀN HÌNH (overlay).
 *
 * Màn danh sách SẠCH việc hôm nay: KHÔNG xu/EXP/pet/hiệu ứng — chỉ tên việc +
 * ô tick để IN ra giấy. Kèm ĐỒNG HỒ PHIÊN có hạn: dùng app một lúc rồi gấp lại,
 * không biến app thành cửa ngõ màn hình vô tận.
 *
 * Read-only (không hoàn thành việc ở đây để tránh confetti/thưởng — giữ "không
 * game"). Trẻ làm trên giấy hoặc tick ở màn thường.
 */
export default function FocusSessionMode({ onClose }) {
  const { charName, tasks } = useGame();
  const list = sessionTaskList(tasks);
  const dateLabel = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" });

  // ── Đồng hồ phiên: chọn mốc → đếm ngược → hết giờ nhắc gấp máy ──
  const [secondsLeft, setSecondsLeft] = useState(null); // null = chưa bắt đầu phiên
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const id = setInterval(() => setSecondsLeft((s) => (s === null ? s : s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, secondsLeft]);

  const startSession = (minutes) => {
    setSecondsLeft(minutes * 60);
    setRunning(true);
  };
  const resetSession = () => {
    setSecondsLeft(null);
    setRunning(false);
  };

  const isDone = secondsLeft === 0;
  const isActive = secondsLeft !== null;

  return (
    <div className="fixed inset-0 z-[80] bg-sand-light overflow-y-auto">
      <div className="max-w-lg mx-auto p-5 space-y-4">
        {/* Header — no-print */}
        <div className="flex items-center gap-3 no-print">
          <div className="w-10 h-10 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0">
            <NotebookPen size={20} className="accent-text" />
          </div>
          <div className="flex-grow min-w-0">
            <h2 className="text-scale-base font-bold text-forest-dark">Chế độ sổ</h2>
            <p className="text-scale-2xs font-semibold text-gray-500">Danh sách sạch để in / làm trên giấy</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng chế độ sổ"
            className="hit-target w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white border border-sand"
          >
            <X size={18} />
          </button>
        </div>

        {/* Đồng hồ phiên — no-print */}
        <div className="no-print bg-white border-2 border-sand rounded-2xl p-4 space-y-3">
          {!isActive ? (
            <>
              <p className="text-scale-xs font-bold text-forest-dark text-center">
                Đặt giờ cho phiên — làm xong thì gấp máy nhé
              </p>
              <div className="flex gap-2">
                {SESSION_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => startSession(m)}
                    className="flex-1 min-h-tap rounded-xl border-2 accent-border accent-text bg-white text-scale-sm font-black active:scale-95 transition-transform"
                  >
                    {m} phút
                  </button>
                ))}
              </div>
            </>
          ) : isDone ? (
            <div className="text-center space-y-2">
              <p className="text-3xl">🌿</p>
              <p className="text-scale-sm font-black text-forest-dark">Hết giờ phiên rồi!</p>
              <p className="text-scale-2xs font-semibold text-gray-600">Gấp máy lại, ra ngoài làm nốt việc con nhé.</p>
              <button
                type="button"
                onClick={resetSession}
                className="min-h-tap inline-flex items-center gap-1.5 mt-1 px-4 rounded-xl bg-sand-light text-gray-600 border border-sand text-scale-2xs font-bold active:scale-95 transition-transform"
              >
                <RotateCcw size={14} /> Đặt phiên khác
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-mono text-4xl font-black accent-text tabular-nums flex-grow text-center">
                {formatClock(secondsLeft)}
              </span>
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                aria-label={running ? "Tạm dừng" : "Tiếp tục"}
                className="hit-target w-11 h-11 rounded-full accent-bg text-white flex items-center justify-center active:scale-90 transition-transform"
              >
                {running ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                type="button"
                onClick={resetSession}
                aria-label="Đặt lại phiên"
                className="hit-target w-11 h-11 rounded-full bg-sand-light text-gray-500 border border-sand flex items-center justify-center active:scale-90 transition-transform"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Danh sách sạch — vùng IN (id = focus-session-print) */}
        <div id="focus-session-print" className="bg-white border-2 border-sand rounded-2xl p-5 space-y-3">
          <div className="space-y-0.5">
            <h3 className="text-scale-base font-bold text-forest-dark">Việc hôm nay của {charName}</h3>
            <p className="text-scale-2xs font-semibold text-gray-500 capitalize">{dateLabel}</p>
          </div>

          {list.length === 0 ? (
            <p className="text-scale-xs text-gray-400 py-4 text-center">Chưa có việc nào hôm nay.</p>
          ) : (
            <div className="print-plan-list space-y-2.5">
              {list.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5 text-scale-sm">
                  {item.completed ? (
                    <span className="w-5 h-5 rounded-md accent-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={13} className="text-white" />
                    </span>
                  ) : (
                    <span className="plan-checkbox" aria-hidden="true" />
                  )}
                  <span className={`${item.completed ? "text-gray-400 line-through" : "text-forest-dark"} font-semibold`}>
                    {stripEmoji(item.title)}
                    {item.isMandatory && <span className="text-terracotta font-bold"> *</span>}
                  </span>
                </div>
              ))}
              <p className="text-scale-2xs text-gray-400 pt-1">* việc cần làm</p>
            </div>
          )}
        </div>

        {/* In — no-print */}
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print w-full min-h-tap flex items-center justify-center gap-2 accent-bg text-white rounded-xl px-4 py-3 text-scale-sm font-black active:scale-[0.99] transition-transform"
        >
          <Printer size={17} /> In / lưu PDF để làm trên giấy
        </button>
      </div>
    </div>
  );
}
