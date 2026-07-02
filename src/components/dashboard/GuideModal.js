"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

const SECTIONS = [
  { titleKey: "game.guide.s1.title", bodyKey: "game.guide.s1.body", titleCls: "text-forest" },
  { titleKey: "game.guide.s2.title", bodyKey: "game.guide.s2.body", titleCls: "text-amber-dark" },
  { titleKey: "game.guide.s3.title", bodyKey: "game.guide.s3.body", titleCls: "text-terracotta" },
  { titleKey: "game.guide.s4.title", bodyKey: "game.guide.s4.body", titleCls: "text-forest-dark" },
  { titleKey: "game.guide.s5.title", bodyKey: "game.guide.s5.body", titleCls: "text-clay" },
  { titleKey: "game.guide.s6.title", bodyKey: "game.guide.s6.body", titleCls: "text-sky" },
];

/** 📜 Warrior handbook — static how-to-play guide for the child. */
export default function GuideModal({ onClose }) {
  const { t } = useLang();

  // Body strings use "|" to separate lines (kept out of the dictionary markup).
  const renderBody = (bodyKey) =>
    t(bodyKey)
      .split("|")
      .map((line, i) => <p key={i} className="pl-5 text-gray-600 text-[10.5px] leading-relaxed">{line}</p>);

  return (
    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white border-4 border-forest rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative max-h-[85vh] overflow-y-auto">
        <div className="w-16 h-16 bg-forest-light rounded-full border-2 border-forest mx-auto flex items-center justify-center text-3xl shadow">
          📜
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">{t("game.guide.title")}</h3>
          <p className="text-[10px] text-gray-500">{t("game.guide.subtitle")}</p>
        </div>

        <div className="text-left space-y-3.5 text-xs text-forest-dark font-medium bg-sand-light p-4 rounded-2xl border border-sand">
          {SECTIONS.map(({ titleKey, bodyKey, titleCls }) => (
            <div key={titleKey} className="space-y-1">
              <p className={`font-black flex items-center gap-1 text-[11px] ${titleCls}`}>{t(titleKey)}</p>
              {renderBody(bodyKey)}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-forest text-sand-light font-black text-xs py-3 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
        >
          {t("game.guide.cta")}
        </button>
      </div>
    </div>
  );
}
