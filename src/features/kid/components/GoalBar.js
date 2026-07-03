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

  const goalTitle = coinGoal.title.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, "").trim();

  return (
    <div className="w-full bg-white border border-sand p-3 rounded-2xl shadow-game-flat space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-scale-2xs font-black text-forest-dark truncate min-w-0">{goalTitle}</p>
        <span className="text-scale-2xs font-black text-amber-dark flex-shrink-0">{heroCoins}/{coinGoal.cost}</span>
      </div>
      <div className="h-2.5 bg-sand rounded-full overflow-hidden">
        <div
          className="h-full bg-amber rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}
