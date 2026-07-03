"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SoundToggle from "@/components/SoundToggle";
import { useLang } from "@/context/LanguageContext";
import { Zap, Star, Coins, Flame, Snowflake, Mail } from "lucide-react";

/** Top strip: energy, wallets, streak, plus pigeon + sound. One tidy row,
 *  line-icon set (lucide) instead of emoji — no wrapping, no clutter. */
export default function StatusBar({
  energy,
  points,
  heroCoins,
  streak,
  streakFreezes,
  encouragements,
  unreadCount,
  onOpenLetter,
}) {
  const router = useRouter();
  const { t } = useLang();

  const pill = "flex items-center gap-1.5 bg-white border border-sand px-3 py-2 rounded-full shadow-game-flat flex-shrink-0";
  const num = "text-scale-2xs font-black text-gray-800";

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Energy */}
      <div className={pill}>
        <Zap size={14} className="text-terracotta" fill="currentColor" />
        <div className="w-6 bg-sand h-1.5 rounded-full overflow-hidden">
          <div className="bg-terracotta h-full transition-all duration-300" style={{ width: `${energy}%` }} />
        </div>
      </div>

      {/* Points */}
      <button type="button" onClick={() => router.push("/rewards")} className={`${pill} active:scale-95 transition-transform`}>
        <Star size={14} className="text-amber" fill="currentColor" />
        <span className={num}>{points}</span>
      </button>

      {/* Coins */}
      <button type="button" onClick={() => router.push("/rewards")} className={`${pill} active:scale-95 transition-transform`}>
        <Coins size={14} className="text-amber" />
        <span className={num}>{heroCoins}</span>
      </button>

      {/* Streak (+ freeze) */}
      <div className={pill}>
        <Flame size={14} className="text-amber animate-flame" fill="currentColor" />
        <span className={num}>{streak}</span>
        {streakFreezes > 0 && (
          <span className="flex items-center gap-0.5 text-scale-2xs font-black text-gray-800 ml-0.5">
            <Snowflake size={11} className="text-sky" />{streakFreezes}
          </span>
        )}
      </div>

      <div className="flex-grow" />

      {/* Pigeon (only when there are letters) */}
      {encouragements.length > 0 && (
        <button
          type="button"
          onClick={() => onOpenLetter(encouragements[0])}
          aria-label={t("game.status.pigeonTitle")}
          className="hit-target relative w-9 h-9 flex items-center justify-center bg-white border border-sand rounded-full shadow-game-flat active:scale-95 transition-transform flex-shrink-0"
        >
          <Mail size={16} className="text-sky-dark" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      <SoundToggle />
    </div>
  );
}
