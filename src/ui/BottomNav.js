"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { Home, Gift, Pickaxe, Swords, Lock } from "lucide-react";

const ITEMS = [
  { id: "adventure", icon: Home, labelKey: "nav.adventure", go: "/dashboard" },
  { id: "rewards", icon: Gift, labelKey: "nav.rewards", go: "/rewards" },
  { id: "mining", icon: Pickaxe, labelKey: "nav.mining", go: "/mining" },
  { id: "boss", icon: Swords, labelKey: "nav.boss", go: "/boss" },
  { id: "parent", icon: Lock, labelKey: "nav.parent", go: "/parent" },
];

/**
 * Shared bottom navigation (Core UI). One implementation for every screen —
 * replaces the drifting kid component + hand-written parent copy. Colour comes
 * from the active theme's accent via `text-forest` (kid theme maps it to blue).
 *
 * Pinned to the viewport bottom (`fixed`) so content scrolls underneath it,
 * centred and width-matched to the app column (same `left-1/2 -translate-x-1/2`
 * pattern as DemoBanner). `wide` matches the parent frame's desktop width; pages
 * reserve space for it with bottom padding (pb-20 / pb-44 in demo).
 * @param {{ active: "adventure" | "rewards" | "mining" | "boss" | "parent", wide?: boolean }} props
 */
export default function BottomNav({ active = "adventure", wide = false }) {
  const router = useRouter();
  const { t } = useLang();

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-sand px-2 py-2 flex items-center justify-around z-40 ${
        wide ? "max-w-md md:max-w-4xl" : "max-w-md"
      }`}
    >
      {ITEMS.map(({ id, icon: Icon, labelKey, go }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => !isActive && router.push(go)}
            aria-current={isActive ? "page" : undefined}
            className={`min-h-tap flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              isActive ? "accent-text" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            <span className={`text-[11px] ${isActive ? "font-black" : "font-bold"}`}>{t(labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
