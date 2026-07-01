"use client";

import React from "react";
import { useGame } from "@/context/GameState";

const STAT_META = {
  strength: { label: "Thể lực", color: "bg-terracotta", emoji: "❤️" },
  intellect: { label: "Trí tuệ", color: "bg-sky", emoji: "🧠" },
  discipline: { label: "Kỷ luật", color: "bg-amber", emoji: "⚡" },
  creative: { label: "Sáng tạo", color: "bg-clay", emoji: "🎨" },
  help: { label: "Giúp đỡ", color: "bg-forest-medium", emoji: "🤝" },
};

/** Tab 📊 TUẦN NÀY — progress overview (weekly report V1.2 will extend this). */
export default function WeekTab() {
  const {
    charName,
    charClass,
    level,
    streak,
    streakFreezes,
    trustScore,
    stats,
    tasks,
    parentConfig,
    screenMinutesUsedToday,
    screenRedeemsThisWeek,
    heroCoins,
    points,
  } = useGame();

  const completedToday = tasks.filter((t) => t.completed).length;
  const rejectedToday = tasks.filter((t) => t.wasRejected).length;

  return (
    <div className="space-y-4">
      {/* Child summary */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-1">
        <h3 className="text-scale-sm font-black text-forest-dark">
          {charName} — Cấp {level} ({charClass})
        </h3>
        <p className="text-scale-2xs text-gray-500">
          🔥 Streak {streak} ngày · ❄️ {streakFreezes} thẻ đóng băng · 🤝 Uy Tín {trustScore}/100
        </p>
        <p className="text-scale-2xs text-gray-500">
          Hôm nay: {completedToday}/{tasks.length} nhiệm vụ
          {rejectedToday > 0 && ` · ${rejectedToday} bị bác ⚠️`} · Ví: {points} ⭐ / {heroCoins} 🪙
        </p>
      </div>

      {/* Stats bars */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">📈 5 chỉ số năng lực</h3>
        {Object.entries(stats).map(([key, val]) => {
          const meta = STAT_META[key];
          if (!meta) return null;
          const percentage = Math.min(100, Math.round((val / 100) * 100));
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-scale-2xs font-bold text-gray-600">
                <span>{meta.emoji} {meta.label}</span>
                <span>{val} điểm</span>
              </div>
              <div className="w-full bg-sand h-2.5 rounded-full overflow-hidden">
                <div className={`${meta.color} h-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen-time & weekly limits */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
        <h3 className="text-scale-sm font-black text-forest-dark">⏱️ Giới hạn giải trí</h3>
        <div className="flex justify-between text-scale-xs font-bold text-gray-600">
          <span>Hôm nay</span>
          <span>{screenMinutesUsedToday}/{parentConfig.screenMaxMinutesPerDay} phút</span>
        </div>
        <div className="w-full bg-sand h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber h-full transition-all"
            style={{ width: `${Math.min(100, (screenMinutesUsedToday / Math.max(1, parentConfig.screenMaxMinutesPerDay)) * 100)}%` }}
          />
        </div>
        <p className="text-scale-2xs text-gray-400">
          Tuần này đã đổi {screenRedeemsThisWeek}/{parentConfig.screenRedeemMaxPerWeek} lượt giải trí.
        </p>
      </div>

      {/* Weekly report placeholder (V1.2) */}
      <div className="bg-sand-light border border-dashed border-sand rounded-xl p-4 text-center">
        <p className="text-scale-2xs text-gray-400 font-bold">
          📬 Báo cáo tuần chi tiết (biểu đồ 7 ngày, so sánh tuần trước, gợi ý lời khen) sẽ có trong bản cập nhật tới.
        </p>
      </div>
    </div>
  );
}
