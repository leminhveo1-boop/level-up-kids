"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { Home, Gift, Pickaxe, Lock } from "lucide-react";

/** Bottom tab navigation — line icons (lucide), dashboard is the active tab. */
export default function BottomNav() {
  const router = useRouter();
  const { t } = useLang();

  const items = [
    { icon: Home, labelKey: "nav.adventure", active: true, go: null },
    { icon: Gift, labelKey: "nav.rewards", go: "/rewards" },
    { icon: Pickaxe, labelKey: "nav.mining", go: "/mining" },
    { icon: Lock, labelKey: "nav.parent", go: "/parent" },
  ];

  return (
    <div className="absolute bottom-0 inset-x-0 bg-white border-t border-sand px-2 py-1.5 flex items-center justify-around z-40 max-w-md mx-auto">
      {items.map(({ icon: Icon, labelKey, active, go }) => (
        <button
          key={labelKey}
          onClick={() => go && router.push(go)}
          className={`min-h-tap flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
            active ? "text-forest" : "text-gray-400 hover:text-forest"
          }`}
        >
          <Icon size={22} strokeWidth={active ? 2.4 : 2} />
          <span className={`text-[11px] ${active ? "font-black" : "font-bold"}`}>{t(labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
