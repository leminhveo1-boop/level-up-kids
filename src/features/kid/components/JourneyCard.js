"use client";

import React from "react";
import { Map } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { getJourneyStatus } from "@/lib/game/journeys";

/**
 * 🛤️ The child's view of the active 3-week journey: identity line, week
 * progress, and whether today's journey tasks are done. Content (title,
 * identity) is game data → stays Vietnamese; labels go through i18n.
 */
export default function JourneyCard({ journey, tasks }) {
  const { t } = useLang();
  const status = getJourneyStatus({ journey, tasks });
  if (!status) return null;

  const { def, week, weeks, stageTasks, todayAllDone } = status;
  const remaining = stageTasks.filter((task) => !task.completed).length;

  return (
    <div className="bg-white border-2 border-forest/40 rounded-2xl p-4 space-y-3 shadow-game-forest">
      <div className="flex items-center gap-2">
        <Map size={15} className="accent-text flex-shrink-0" />
        <span className="text-scale-2xs font-black accent-text uppercase tracking-wider flex-grow truncate">{t("game.journey.title")}</span>
        <span className="text-scale-2xs font-black text-amber-dark bg-amber-light/60 rounded-full px-2.5 py-1 flex-shrink-0">
          {t("game.journey.week", { week, weeks })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-4xl flex-shrink-0">{def.icon}</span>
        <div className="flex-grow min-w-0">
          <p className="text-scale-sm font-black text-forest-dark leading-tight">{def.title}</p>
          <p className="text-scale-2xs text-forest-medium font-bold italic truncate">“{def.identity}”</p>
        </div>
      </div>

      {/* Week progress dots */}
      <div className="flex items-center gap-1">
        {Array.from({ length: weeks }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 flex-1 rounded-full transition-colors ${i < week - 1 ? "accent-bg" : i === week - 1 ? "bg-amber" : "bg-sand"}`}
          />
        ))}
      </div>

      <p
        className={`text-scale-2xs font-black rounded-xl px-3 py-2.5 border ${
          todayAllDone
            ? "bg-forest-light/30 border-forest/20 text-forest-dark"
            : "bg-amber-light/40 border-amber/30 text-amber-dark"
        }`}
      >
        {todayAllDone ? t("game.journey.todayDone") : t("game.journey.todayTodo", { n: remaining })}
      </p>
    </div>
  );
}
