"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

// Quân luật kid: DUY NHẤT 1 màu nhấn xanh. Emoji đã phân biệt 5 chỉ số —
// nền/giá trị dùng chung sand + accent, không rải 5 màu.
const STAT_CELLS = [
  { key: "strength", emoji: "❤️", labelKey: "game.stat.strength" },
  { key: "intellect", emoji: "🧠", labelKey: "game.stat.intellect" },
  { key: "discipline", emoji: "⚡", labelKey: "game.stat.discipline" },
  { key: "creative", emoji: "🎨", labelKey: "game.stat.creative" },
  { key: "help", emoji: "🤝", labelKey: "game.stat.help" },
];

/** ⚔️ 5 Stars of Power grid. */
export default function StatsGrid({ stats }) {
  const { t } = useLang();

  return (
    <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
      <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider text-center">{t("game.statsTitle")}</h3>

      <div className="grid grid-cols-5 gap-1.5">
        {STAT_CELLS.map(({ key, emoji, labelKey }) => (
          <div key={key} className="bg-sand-light border border-sand rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-base">{emoji}</span>
            <span className="text-[11px] font-bold text-gray-500">{t(labelKey)}</span>
            <span className="text-xs font-black accent-text">{stats[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
