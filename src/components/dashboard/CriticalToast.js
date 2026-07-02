"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

/** ⚡ Critical-hit celebration modal (double points). */
export default function CriticalToast({ toast, charName, onClose }) {
  const { t } = useLang();
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-amber border-4 border-amber-dark rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative overflow-hidden animate-scale-up">
        {/* Sparkle background elements */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>

        {/* Lucky mascot animation */}
        <div className="w-20 h-20 bg-white/20 rounded-full border-4 border-white mx-auto flex items-center justify-center text-4xl shadow-lg animate-bounce select-none">
          ⚡
        </div>

        <div className="space-y-1 text-white">
          <h3 className="text-lg font-black tracking-widest uppercase animate-pulse">{t("game.crit.title")}</h3>
          <p className="text-[10px] opacity-90 font-bold uppercase tracking-wider">{t("game.crit.sub", { name: charName })}</p>
        </div>

        <div className="bg-white border-2 border-amber-dark p-4 rounded-2xl shadow-inner space-y-1">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase">{t("game.crit.reward")}</p>
          <p className="text-xs font-black text-forest-dark truncate px-2">{toast.taskTitle}</p>
          <div className="text-3xl font-black text-amber-dark flex items-center justify-center gap-1.5 py-1">
            <span>+ {toast.amount}</span>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-[9px] text-forest font-bold uppercase tracking-wider">{t("game.crit.desc")}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-white text-amber-dark font-black text-xs py-3 px-6 rounded-xl border-2 border-white shadow-game-flat hover:bg-amber-light btn-game-transition active:shadow-game-pressed"
        >
          {t("game.crit.cta")}
        </button>
      </div>
    </div>
  );
}
