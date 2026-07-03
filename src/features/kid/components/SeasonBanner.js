"use client";

import React, { useState, useEffect } from "react";
import { computeSeason } from "@/lib/game/season";
import { useLang } from "@/context/LanguageContext";

const SEASON_EMOJI = ["🌸", "☀️", "🍁", "❄️"]; // rotate by season index

/**
 * 🍁 D7 Mùa — season countdown that reframes a slump as a Fresh Start.
 * Time-derived, so it's computed after mount to avoid SSR/client hydration drift.
 */
export default function SeasonBanner() {
  const { t } = useLang();
  const [season, setSeason] = useState(null);

  useEffect(() => {
    setSeason(computeSeason(Date.now()));
  }, []);

  if (!season) return null;

  const emoji = SEASON_EMOJI[(season.index - 1) % SEASON_EMOJI.length];

  return (
    <div className="w-full bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black text-forest-dark">
          {emoji} {t("game.season.label", { n: season.index })}
        </span>
        <span className="text-[10px] font-black text-gray-400">
          {t("game.season.status", { week: season.weekIndex, total: season.weeksTotal, days: season.daysLeft })}
        </span>
      </div>
      <div className="h-2 bg-sand rounded-full overflow-hidden border border-sand">
        <div
          className="h-full bg-gradient-to-r from-sky to-forest-medium rounded-full transition-all duration-500"
          style={{ width: `${season.progressPct}%` }}
        />
      </div>
      {season.endingSoon && (
        <p className="text-[11px] font-black text-sky-dark text-center">{t("game.season.freshStart")}</p>
      )}
    </div>
  );
}
