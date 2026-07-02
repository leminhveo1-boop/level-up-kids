"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SoundToggle from "@/components/SoundToggle";
import { useLang } from "@/context/LanguageContext";

/** Top strip: energy, wallets, pigeon alert, streak+freeze, sound, guide. */
export default function StatusBar({
  energy,
  points,
  heroCoins,
  streak,
  streakFreezes,
  encouragements,
  unreadCount,
  onOpenLetter,
  onOpenGuide,
}) {
  const router = useRouter();
  const { t } = useLang();

  return (
    <div className="flex items-center justify-between gap-1 flex-wrap select-none">
      {/* Energy Bar */}
      <div className="flex items-center gap-1 bg-white border-2 border-sand px-2.5 py-1.5 rounded-full shadow-game-flat">
        <span className="text-[10px]">❤️</span>
        <div className="w-8 bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-terracotta h-full transition-all duration-300"
            style={{ width: `${energy}%` }}
          ></div>
        </div>
      </div>

      {/* Points Wallet */}
      <div
        onClick={() => router.push("/rewards")}
        className="flex items-center gap-0.5 bg-white border-2 border-sand px-2 py-1.5 rounded-full shadow-game-flat transition-all hover:border-forest cursor-pointer active:scale-95"
      >
        <span className="text-xs">⭐</span>
        <span className="text-[11px] font-black text-forest-dark">{points} {t("game.points")}</span>
      </div>

      {/* Hero Coin Wallet */}
      <div
        onClick={() => router.push("/rewards")}
        className="flex items-center gap-0.5 bg-white border-2 border-sand px-2 py-1.5 rounded-full shadow-game-flat transition-all hover:border-amber cursor-pointer active:scale-95"
      >
        <span className="text-xs animate-bounce">🪙</span>
        <span className="text-[11px] font-black text-amber-dark">{heroCoins} {t("game.coin")}</span>
      </div>

      {/* Messages Bird (Carrier Pigeon Alert) */}
      {encouragements.length > 0 && (
        <button
          onClick={() => onOpenLetter(encouragements[0])}
          className="relative p-1 bg-white border-2 border-sand rounded-full shadow-game-flat hover:border-amber transition-colors"
          title={t("game.status.pigeonTitle")}
        >
          <span className="text-xs">🕊️</span>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white font-extrabold text-[10px] h-3 w-3 rounded-full flex items-center justify-center border border-white animate-pulse">
              !
            </span>
          )}
        </button>
      )}

      {/* Streak Flame + Freeze cards */}
      <div
        className="flex items-center gap-0.5 bg-white border-2 border-sand px-2.5 py-1.5 rounded-full shadow-game-flat"
        title={t("game.status.streakTitle", { d: streak, f: streakFreezes })}
      >
        <span className="text-xs animate-flame">🔥</span>
        <span className="text-[11px] font-black text-amber">{streak}N</span>
        {streakFreezes > 0 && (
          <span className="text-[11px] font-black text-sky-dark ml-0.5">❄️{streakFreezes}</span>
        )}
      </div>

      {/* Sound mute toggle */}
      <SoundToggle />

      {/* Guide Button for child */}
      <button
        onClick={onOpenGuide}
        className="flex items-center justify-center p-1.5 bg-white border-2 border-sand rounded-full shadow-game-flat hover:border-forest transition-colors text-xs active:scale-90"
        title={t("game.status.guideTitle")}
      >
        📜
      </button>
    </div>
  );
}
