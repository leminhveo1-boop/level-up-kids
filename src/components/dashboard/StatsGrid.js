"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

const STAT_CELLS = [
  { key: "strength", emoji: "❤️", labelKey: "game.stat.strength", cellCls: "bg-rose-50 border-red-100", valueCls: "text-terracotta" },
  { key: "intellect", emoji: "🧠", labelKey: "game.stat.intellect", cellCls: "bg-blue-50 border-blue-100", valueCls: "text-sky" },
  { key: "discipline", emoji: "⚡", labelKey: "game.stat.discipline", cellCls: "bg-amber-50 border-yellow-100", valueCls: "text-amber" },
  { key: "creative", emoji: "🎨", labelKey: "game.stat.creative", cellCls: "bg-purple-50 border-purple-100", valueCls: "text-clay" },
  { key: "help", emoji: "🤝", labelKey: "game.stat.help", cellCls: "bg-green-50 border-green-100", valueCls: "text-forest-medium" },
];

/** ⚔️ 5 Stars of Power grid. */
export default function StatsGrid({ stats }) {
  const { t } = useLang();

  return (
    <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
      <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider text-center">{t("game.statsTitle")}</h3>

      <div className="grid grid-cols-5 gap-1.5">
        {STAT_CELLS.map(({ key, emoji, labelKey, cellCls, valueCls }) => (
          <div key={key} className={`${cellCls} border rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1`}>
            <span className="text-base">{emoji}</span>
            <span className="text-[11px] font-bold text-gray-500">{t(labelKey)}</span>
            <span className={`text-xs font-black ${valueCls}`}>{stats[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
