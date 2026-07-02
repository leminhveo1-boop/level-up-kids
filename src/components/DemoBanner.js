"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

/**
 * Floating paywall banner shown in demo mode — every screen, above bottom nav.
 * Tapping it goes straight to /premium (QR + activation code).
 */
export default function DemoBanner() {
  const router = useRouter();
  const { isDemo } = useAuth();
  const { t } = useLang();

  if (!isDemo) return null;

  return (
    <button
      type="button"
      onClick={() => router.push("/premium")}
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2.5rem)] max-w-sm bg-amber text-white border-2 border-amber-dark rounded-2xl px-4 py-2.5 shadow-game-amber flex items-center justify-between gap-2 active:scale-[0.98] transition-transform animate-fade-in"
    >
      <span className="flex items-center gap-2 text-left">
        <span className="text-lg">🎫</span>
        <span className="flex flex-col">
          <span className="text-[11px] font-black uppercase tracking-wider">{t("demo.banner")}</span>
          <span className="text-[11px] font-bold opacity-90">{t("demo.bannerSub")}</span>
        </span>
      </span>
      <span className="bg-white text-amber-dark text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-wider flex-shrink-0">
        {t("demo.unlock")}
      </span>
    </button>
  );
}
