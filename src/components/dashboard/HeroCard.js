"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getEquipped } from "@/lib/game/cosmetics";
import { useLang } from "@/context/LanguageContext";

const levelTitleKey = (lvl) => {
  if (lvl >= 100) return "game.levelTitle.100";
  if (lvl >= 50) return "game.levelTitle.50";
  if (lvl >= 20) return "game.levelTitle.20";
  if (lvl >= 10) return "game.levelTitle.10";
  if (lvl >= 5) return "game.levelTitle.5";
  return "game.levelTitle.1";
};

const getClassConfig = (cls) => {
  switch (cls) {
    case "Mage":
      return {
        bg: "bg-blue-50 border-sky",
        avatarBg: "bg-sky-light",
        text: "text-sky-dark",
        icon: (
          <svg className="w-10 h-10 text-sky" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="#E0F2FE" />
            <circle cx="12" cy="7" r="2" fill="#0284C7" />
          </svg>
        ),
      };
    case "Druid":
      return {
        bg: "bg-green-50 border-forest",
        avatarBg: "bg-forest-light",
        text: "text-forest-dark",
        icon: (
          <svg className="w-10 h-10 text-forest-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.92V15h-2v2.92c-2.45-.44-4.48-2.31-4.92-4.92H9v-2H6.08c.44-2.45 2.31-4.48 4.92-4.92V7h2v2.92c2.45.44 4.48 2.31 4.92 4.92H15v2h2.92c-.44 2.45-2.31 4.48-4.92 4.92z" fill="#A7F3D0" />
            <path d="M12 10a2 2 0 100 4 2 2 0 000-4z" fill="#2E7D32" />
          </svg>
        ),
      };
    default: // Warrior
      return {
        bg: "bg-rose-50 border-terracotta",
        avatarBg: "bg-terracotta-light",
        text: "text-terracotta-dark",
        icon: (
          <svg className="w-10 h-10 text-terracotta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7s0 6 8 10z" fill="#FFE4E6" />
            <path d="M12 8v8M8 12h8" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ),
      };
  }
};

/** Avatar + cosmetics + companions + level/EXP progress bar. */
export default function HeroCard({ charName, charClass, level, exp, expToNextLevel, cosmetics, activePetObj, activeMountObj }) {
  const router = useRouter();
  const { t } = useLang();
  const classConfig = getClassConfig(charClass);
  const equipped = getEquipped({ cosmetics });

  return (
    <div className={`border-2 p-4 rounded-3xl shadow-game-flat flex items-center gap-4 ${classConfig.bg}`}>
      {/* Avatar Icon + Pet Companion + Cosmetics */}
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-inner ${classConfig.avatarBg}`}
          style={{ borderColor: equipped.frame?.value || undefined }}
        >
          {classConfig.icon}
        </div>

        {/* Equipped hat */}
        {equipped.hat && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl drop-shadow z-20 select-none">
            {equipped.hat.emoji}
          </span>
        )}

        {/* Active Pet companion floating on top-left of Avatar */}
        {activePetObj && (
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-white border border-sand rounded-xl flex items-center justify-center text-lg shadow-md animate-float z-10 select-none">
            {activePetObj.emoji}
          </div>
        )}

        {/* Active Mount companion displaying as riding on bottom-right of Avatar */}
        {activeMountObj && (
          <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white border border-sand rounded-xl flex items-center justify-center text-xl shadow-md animate-bounce z-10 select-none" title={`Thú cưỡi: ${activeMountObj.name}`}>
            {activeMountObj.emoji}
          </div>
        )}
      </div>

      {/* Hero Name, Title & Level Bar */}
      <div className="flex-grow space-y-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-forest-dark truncate max-w-[130px]">{charName}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/me")}
              className="min-h-tap text-[10px] font-black px-2 rounded-full bg-clay-light text-clay border border-clay/30 active:scale-95 transition-transform"
              title={t("game.hero.myCornerTitle")}
            >
              {t("game.hero.myCorner")}
            </button>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-forest-accent text-forest border border-forest">
              {t("game.hero.level", { n: level })}
            </span>
          </div>
        </div>

        <p className="text-[11px] font-bold text-gray-500">{t(levelTitleKey(level))}</p>

        {/* EXP Progress bar */}
        <div className="space-y-1">
          <div className="w-full bg-sand h-3 rounded-full border border-sand overflow-hidden relative shadow-inner">
            <div
              className="bg-amber h-full transition-all duration-300 animate-shimmer"
              style={{ width: `${(exp / expToNextLevel) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-black text-gray-400">
            <span>{t("game.hero.exp", { n: exp })}</span>
            <span>{t("game.hero.req", { n: expToNextLevel })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
