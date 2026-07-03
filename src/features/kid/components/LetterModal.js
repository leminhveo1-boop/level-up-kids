"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

/** 🕊️ Pigeon encouragement letter modal. */
export default function LetterModal({ message, charName, onClose }) {
  const { t } = useLang();
  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white border-4 border-amber rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative">
        {/* Modal Mascot */}
        <div className="w-16 h-16 bg-amber-light rounded-full border-2 border-amber mx-auto flex items-center justify-center text-3xl">
          🕊️
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black text-amber uppercase tracking-wider">{t("game.letter.title")}</h3>
          <p className="text-[10px] text-gray-400">{t("game.letter.to", { name: charName })}</p>
        </div>

        {/* Letter Content block */}
        <div className="bg-sand-light border-2 border-sand p-4 rounded-2xl text-xs font-bold text-forest-dark leading-relaxed italic shadow-inner">
          &ldquo;{message.text}&rdquo;
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-amber text-sand-light font-black text-sm py-3 px-6 rounded-2xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
        >
          {t("game.letter.cta")}
        </button>
      </div>
    </div>
  );
}
