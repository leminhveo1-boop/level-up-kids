"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { getPetMood, getPetQuote } from "@/lib/game/pets";
import { PET_HUNGER_MAX } from "@/lib/game/constants";
import { useLang } from "@/context/LanguageContext";

const MOOD_EMOJI = { joyful: "🤩", happy: "🙂", hungry: "😟", starving: "😢" };
const MOOD_BAR_COLOR = { joyful: "bg-forest", happy: "bg-amber", hungry: "bg-terracotta", starving: "bg-red-500" };

/** 🐾 D1: the pet is ALIVE — mood, speech bubble, hunger bar, feed shortcut. */
export default function CompanionCard({ companion }) {
  const router = useRouter();
  const { t } = useLang();
  const mood = getPetMood(companion);
  // Re-roll the quote only when the companion or its hunger changes — not on
  // every unrelated state update (pets array identity changes each render).
  const quote = React.useMemo(
    () => getPetQuote(companion),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [companion.id, companion.hunger]
  );

  return (
    <div className="bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat flex items-center gap-3">
      <span className="text-2xl flex-shrink-0">{companion.emoji}</span>
      <div className="flex-grow min-w-0 space-y-1">
        <p className="text-[11px] font-bold text-forest-dark italic truncate">
          {MOOD_EMOJI[mood]} &ldquo;{quote}&rdquo;
        </p>
        <div className="h-2 bg-sand rounded-full overflow-hidden border border-sand">
          <div
            className={`h-full transition-all duration-300 ${MOOD_BAR_COLOR[mood]}`}
            style={{ width: `${((companion.hunger ?? PET_HUNGER_MAX) / PET_HUNGER_MAX) * 100}%` }}
          />
        </div>
      </div>
      {mood === "hungry" || mood === "starving" ? (
        <button
          onClick={() => router.push("/mining")}
          className="min-h-tap flex-shrink-0 bg-amber text-white text-[10px] font-black px-3 rounded-xl active:scale-95 transition-transform"
        >
          {t("game.companion.feed")}
        </button>
      ) : null}
    </div>
  );
}
