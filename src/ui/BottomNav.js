"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { Home, Gift, Pickaxe, Lock } from "lucide-react";

const ITEMS = [
  { id: "adventure", icon: Home, labelKey: "nav.adventure", go: "/dashboard" },
  { id: "rewards", icon: Gift, labelKey: "nav.rewards", go: "/rewards" },
  { id: "mining", icon: Pickaxe, labelKey: "nav.mining", go: "/mining" },
  { id: "parent", icon: Lock, labelKey: "nav.parent", go: "/parent" },
];

/**
 * Shared bottom navigation (Core UI). One implementation for every screen —
 * replaces the drifting kid component + hand-written parent copy. Colour comes
 * from the active theme's accent via `text-forest` (kid theme maps it to blue).
 * @param {{ active: "adventure" | "rewards" | "mining" | "parent" }} props
 */
export default function BottomNav({ active = "adventure" }) {
  const router = useRouter();
  const { t } = useLang();

  return (
    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-sand px-2 py-2 flex items-center justify-around z-40 max-w-md mx-auto">
      {ITEMS.map(({ id, icon: Icon, labelKey, go }) => {
        const isActive = id === active;
        return (
          <button
            key={id}
            onClick={() => !isActive && router.push(go)}
            aria-current={isActive ? "page" : undefined}
            className={`min-h-tap flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              isActive ? "text-forest" : "text-gray-400 hover:text-forest"
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
