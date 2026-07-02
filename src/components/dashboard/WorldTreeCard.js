"use client";

import React from "react";
import { getTreeState } from "@/lib/game/worldTree";
import { useLang } from "@/context/LanguageContext";

/**
 * 🌍 D5 Cây Thế Giới — the family's shared mission (Octalysis CD1: Epic Meaning).
 * Grows from `treeGrowth`, the sap accumulated by every approved task.
 */
export default function WorldTreeCard({ treeGrowth }) {
  const { t } = useLang();
  const tree = getTreeState(treeGrowth);
  // sap needed to fill the CURRENT stage (span from this stage's start to the next)
  const stageSpan = tree.isMax ? 0 : tree.forNext - (tree.current - tree.intoStage);

  return (
    <div className="bg-gradient-to-br from-forest-light/25 to-white border-2 border-forest/25 p-4 rounded-3xl shadow-game-flat space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-4xl flex-shrink-0 animate-float select-none">{tree.emoji}</span>
        <div className="min-w-0">
          <h3 className="text-scale-sm font-black text-forest-dark truncate">{t("game.tree.title")}</h3>
          <p className="text-scale-2xs font-bold text-forest-medium">{t(`game.tree.stage.${tree.stageIndex}`)}</p>
        </div>
      </div>

      {tree.isMax ? (
        <p className="text-scale-2xs font-black text-forest text-center bg-forest-light/30 border border-forest/20 rounded-xl p-2">
          {t("game.tree.max")}
        </p>
      ) : (
        <div className="space-y-1">
          <div className="h-3 bg-sand rounded-full overflow-hidden border border-sand">
            <div
              className="h-full bg-gradient-to-r from-forest-medium to-forest rounded-full transition-all duration-500"
              style={{ width: `${tree.progressPct}%` }}
            />
          </div>
          <p className="text-[9px] font-bold text-gray-400 text-right">
            {t("game.tree.progress", { into: tree.intoStage, need: stageSpan })}
          </p>
        </div>
      )}

      <p className="text-[9px] text-gray-400 font-medium leading-relaxed">{t("game.tree.note")}</p>
    </div>
  );
}
