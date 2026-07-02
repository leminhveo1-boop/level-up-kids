"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";

/** Bottom tab navigation (Duolingo style) — dashboard is the active tab. */
export default function BottomNav() {
  const router = useRouter();
  const { t } = useLang();

  return (
    <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
      <button className="flex flex-col items-center p-2 text-forest-medium space-y-0.5">
        <span className="text-xl">🌳</span>
        <span className="text-[9px] font-black uppercase tracking-wider">{t("nav.adventure")}</span>
      </button>

      <button
        onClick={() => router.push("/rewards")}
        className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
      >
        <span className="text-xl">🛒</span>
        <span className="text-[9px] font-extrabold uppercase tracking-wider">{t("nav.rewards")}</span>
      </button>

      <button
        onClick={() => router.push("/mining")}
        className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
      >
        <span className="text-xl">⛏️</span>
        <span className="text-[9px] font-extrabold uppercase tracking-wider">{t("nav.mining")}</span>
      </button>

      <button
        onClick={() => router.push("/parent")}
        className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
      >
        <span className="text-xl">🔑</span>
        <span className="text-[9px] font-extrabold uppercase tracking-wider">{t("nav.parent")}</span>
      </button>
    </div>
  );
}
