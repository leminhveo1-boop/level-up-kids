"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";

const CLASS_EMOJI = { Warrior: "🛡️", Mage: "🔮", Druid: "🌱" };

export default function FamilyPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useLang();
  const {
    authLoaded,
    cloudEnabled,
    user,
    profile,
    isPremium,
    childLimit,
    childProfiles,
    activeChildId,
    selectChild,
    deleteChild,
    signOut,
  } = useAuth();

  const [errorMessage, setErrorMessage] = useState("");

  if (!authLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">{t("common.loading")}</p>
      </div>
    );
  }

  const canAddChild = childProfiles.length < childLimit;

  const handlePlay = (childId) => {
    selectChild(childId);
    router.push("/dashboard");
  };

  const handleDelete = async (childId) => {
    if (!confirm(t("children.deleteConfirm"))) return;
    const res = await deleteChild(childId);
    if (!res.success) {
      setErrorMessage(res.error || t("common.error"));
      setTimeout(() => setErrorMessage(""), 4000);
    }
  };

  return (
    <div className="flex flex-col flex-grow p-6 space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider"
        >
          ⬅️ {t("common.back")}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
            className="text-[10px] font-black text-forest bg-white border border-sand px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm active:scale-95 transition-transform"
          >
            {locale === "vi" ? "🇬🇧 EN" : "🇻🇳 VI"}
          </button>

          {/* Plan badge */}
          <span
            className={`text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
              isPremium
                ? "bg-amber-light text-amber-dark border-amber"
                : "bg-sand text-gray-500 border-sand-dark"
            }`}
          >
            {isPremium ? `👑 ${t("premium.badge")}` : t("premium.freeBadge")}
          </span>
        </div>
      </div>

      {/* Account info */}
      {cloudEnabled && user && (
        <div className="bg-white border-2 border-sand rounded-2xl p-3.5 flex items-center justify-between shadow-game-flat">
          <div className="min-w-0">
            <p className="text-xs font-black text-forest-dark truncate">{profile?.display_name || user.email}</p>
            <p className="text-[9.5px] text-gray-400 font-bold truncate">{user.email}</p>
            {isPremium && profile?.premium_until && (
              <p className="text-[9px] text-amber-dark font-bold">
                {t("premium.activeUntil")}: {new Date(profile.premium_until).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
              </p>
            )}
          </div>
          <button
            onClick={async () => {
              await signOut();
              router.push("/auth");
            }}
            className="text-[9.5px] font-black text-terracotta border border-red-200 bg-rose-50 px-3 py-1.5 rounded-xl uppercase tracking-wider active:scale-95 transition-transform flex-shrink-0"
          >
            {t("auth.signOut")}
          </button>
        </div>
      )}

      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-xl font-black text-forest uppercase tracking-tight">{t("children.title")}</h1>
      </div>

      {errorMessage && (
        <p className="text-[11px] font-bold text-terracotta text-center bg-rose-50 border border-red-100 rounded-xl p-2">
          ⚠️ {errorMessage}
        </p>
      )}

      {/* Children list */}
      <div className="space-y-3 flex-grow">
        {childProfiles.map((child) => (
          <div
            key={child.id}
            className={`bg-white border-2 rounded-2xl p-4 flex items-center gap-3 shadow-game-flat transition-all ${
              activeChildId === child.id ? "border-forest" : "border-sand"
            }`}
          >
            <div className="w-12 h-12 bg-sand-light border-2 border-sand rounded-xl flex items-center justify-center text-2xl">
              {CLASS_EMOJI[child.char_class] || "🛡️"}
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-black text-forest-dark truncate">{child.name}</h3>
              <p className="text-[9.5px] text-gray-400 font-bold uppercase">{child.char_class}</p>
            </div>
            <button
              onClick={() => handlePlay(child.id)}
              className="bg-forest text-sand-light font-black text-[10px] px-4 py-2.5 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed flex-shrink-0"
            >
              {t("children.play")}
            </button>
            <button
              onClick={() => handleDelete(child.id)}
              className="text-terracotta hover:text-red-700 text-sm p-1"
              title={t("children.delete")}
            >
              🗑️
            </button>
          </div>
        ))}

        {/* Add child */}
        {canAddChild ? (
          <button
            onClick={() => router.push("/register")}
            className="w-full bg-white border-2 border-dashed border-sand hover:border-forest rounded-2xl p-4 text-sm font-black text-gray-400 hover:text-forest transition-colors"
          >
            {t("children.add")}
          </button>
        ) : (
          <div className="bg-amber-light/50 border-2 border-amber/30 rounded-2xl p-4 text-center space-y-2">
            <p className="text-[11px] font-bold text-amber-dark">{t("children.limitFree")}</p>
            <button
              onClick={() => router.push("/premium")}
              className="bg-amber text-white font-black text-xs px-5 py-2.5 rounded-xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
            >
              {t("premium.title")}
            </button>
          </div>
        )}
      </div>

      {/* Premium entry for cloud users */}
      {cloudEnabled && user && !isPremium && canAddChild && (
        <button
          onClick={() => router.push("/premium")}
          className="text-[11px] font-bold text-amber hover:underline uppercase tracking-wider text-center"
        >
          👑 {t("premium.title")}
        </button>
      )}
    </div>
  );
}
