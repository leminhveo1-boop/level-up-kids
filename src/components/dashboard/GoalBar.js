"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

/** 🎯 V1.2 Goal gradient — visible progress to the nearest big coin reward. */
export default function GoalBar({ rewards, heroCoins }) {
  const { t } = useLang();
  const coinGoal = React.useMemo(() => {
    const candidates = (rewards || [])
      .filter((r) => r.currency === "heroCoins" && r.type === "perk" && r.cost > heroCoins)
      .sort((a, b) => a.cost - b.cost);
    return candidates[0] || null;
  }, [rewards, heroCoins]);

  if (!coinGoal) return null;

  const pct = Math.round((heroCoins / coinGoal.cost) * 100);

  return (
    <div className="w-full bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("game.goal.title")}</span>
        <span className="text-[10px] font-black text-amber-dark">
          {heroCoins}/{coinGoal.cost} 🪙 ({pct}%)
        </span>
      </div>
      <p className="text-[11px] font-black text-forest-dark truncate">{coinGoal.title}</p>
      <div className="h-3 bg-sand rounded-full overflow-hidden border border-sand">
        <div
          className="h-full bg-gradient-to-r from-amber to-amber-dark rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-400 font-bold">
        {t("game.goal.remain", { n: coinGoal.cost - heroCoins })}
      </p>
    </div>
  );
}
