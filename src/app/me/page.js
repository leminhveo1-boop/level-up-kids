"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import { COSMETICS_CATALOG, getEquipped } from "@/lib/game/cosmetics";
import { PET_ROSTER, getPetMood } from "@/lib/game/pets";

const MOOD_EMOJI = { joyful: "🤩", happy: "🙂", hungry: "😟", starving: "😢" };

// slot → dictionary key for the shop section header
const SLOT_LABEL_KEYS = {
  hat: "game.me.slot.hat",
  frame: "game.me.slot.frame",
  petAccessory: "game.me.slot.petAccessory",
};

const RARITY_BADGE = {
  common: "bg-gray-100 text-gray-500 border-gray-200",
  rare: "bg-blue-50 text-sky-dark border-blue-200",
  epic: "bg-amber-50 text-amber-dark border-yellow-200",
};

/** Góc Của Tớ 🏠 — avatar/pet cosmetics shop (Octalysis CD4, sibling identity). */
export default function MyCornerPage() {
  const router = useRouter();
  const { t } = useLang();
  const { uiMode } = useAuth();
  const isTeen = uiMode === "teen";
  const m = isTeen ? "teen" : "kid";
  const {
    isLoaded,
    charName,
    heroCoins,
    cosmetics,
    buyCosmetic,
    equipCosmetic,
    pets,
    activePet,
    activeMount,
    sendChildMessage,
    graduatedHabits,
  } = useGame();

  const [flash, setFlash] = useState(null); // { ok, text }
  const [letterText, setLetterText] = useState("");

  useEffect(() => {
    if (isLoaded && !charName) router.push("/");
  }, [isLoaded, charName, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">{t("game.me.loading")}</p>
      </div>
    );
  }

  const equipped = getEquipped({ cosmetics });
  const companion = pets?.find((p) => p.id === (activeMount || activePet));

  const showFlash = (ok, text) => {
    setFlash({ ok, text });
    setTimeout(() => setFlash(null), 3000);
  };

  const handleBuy = (item) => {
    const r = buyCosmetic(item.id);
    if (r.success) {
      showFlash(true, t("game.me.buyOk", { name: item.name }));
    } else if (r.error === "NOT_ENOUGH_COINS") {
      showFlash(false, t("game.me.buyShort", { n: r.shortage }));
    } else {
      showFlash(false, t("game.me.buyFail"));
    }
  };

  const handleToggleEquip = (item) => {
    const isEquipped = cosmetics.equipped[item.slot] === item.id;
    equipCosmetic(item.slot, isEquipped ? null : item.id);
  };

  return (
    <div className="flex flex-col flex-grow relative pb-20">
      <div className="flex-grow p-5 space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="min-h-tap text-scale-2xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider"
          >
            🌳 Dashboard
          </button>
          <div className="bg-amber-light border border-amber/30 px-3 py-1.5 rounded-full flex items-center gap-1">
            <span>🪙</span>
            <span className="text-scale-2xs font-black text-amber-dark">{heroCoins} {t("game.coin")}</span>
          </div>
        </div>

        {/* PREVIEW CARD — hero with equipped cosmetics */}
        <div className="bg-white border-2 border-sand p-5 rounded-3xl shadow-game-flat text-center space-y-3">
          <h2 className="text-scale-sm font-black text-forest-dark uppercase tracking-widest">{t("game.me.title", { name: charName })}</h2>

          <div className="relative w-28 h-28 mx-auto">
            {/* Avatar with frame color */}
            <div
              className="w-28 h-28 rounded-3xl border-4 flex items-center justify-center text-6xl bg-sand-light shadow-inner"
              style={{ borderColor: equipped.frame?.value || "#F5EFE6" }}
            >
              🦸
            </div>
            {/* Hat */}
            {equipped.hat && (
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-4xl drop-shadow">{equipped.hat.emoji}</span>
            )}
            {/* Companion + accessory */}
            {companion && (
              <div className="absolute -bottom-2 -right-4 text-3xl">
                {companion.emoji}
                {equipped.petAccessory && (
                  <span className="absolute -top-2 -right-2 text-lg">{equipped.petAccessory.emoji}</span>
                )}
              </div>
            )}
          </div>

          <p className="text-scale-2xs text-gray-400 font-bold">
            {t("game.me.previewHint")}
          </p>
        </div>

        {flash && (
          <p
            className={`text-scale-xs font-bold text-center rounded-xl p-2.5 border ${
              flash.ok ? "text-forest bg-forest-light/30 border-forest/20" : "text-terracotta bg-rose-50 border-red-100"
            }`}
          >
            {flash.text}
          </p>
        )}

        {/* 🎓 Graduated habits — permanent hero instincts */}
        {graduatedHabits?.length > 0 && (
          <div className="bg-white border-2 border-amber/40 p-4 rounded-3xl shadow-game-flat space-y-2.5">
            <h3 className="text-scale-xs font-black text-amber-dark uppercase tracking-wider">
              {t("game.me.gradTitle", { n: graduatedHabits.length })}
            </h3>
            <p className="text-scale-2xs text-gray-400 font-medium">
              {t("game.me.gradDesc")}
            </p>
            <div className="space-y-1.5">
              {graduatedHabits.map((h, i) => (
                <div key={i} className="bg-amber-light/40 border border-amber/30 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="text-lg">🏅</span>
                  <div className="min-w-0">
                    <p className="text-scale-2xs font-black text-forest-dark truncate">{h.title}</p>
                    <p className="text-[9px] text-gray-400 font-bold">
                      {t("game.me.gradDays", { days: h.days, date: new Date(h.graduatedAt).toLocaleDateString("vi-VN") })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 📖 Pokédex — full pet roster, owned vs undiscovered */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
          <h3 className="text-scale-xs font-black text-forest-dark uppercase tracking-wider">
            {t(`game.me.pokedex.${m}`, { a: pets?.length || 0, b: PET_ROSTER.length })}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {PET_ROSTER.map((entry) => {
              const owned = pets?.find((p) => p.eggType === entry.eggType && p.element === entry.element);
              const mood = owned ? getPetMood(owned) : null;
              return (
                <div
                  key={`${entry.eggType}_${entry.element}`}
                  className={`border-2 rounded-2xl p-2.5 text-center space-y-1 ${
                    owned ? "border-forest bg-forest-light/10" : "border-sand bg-sand-light/40"
                  }`}
                >
                  <div className={`text-3xl h-8 flex items-center justify-center ${owned ? "" : "grayscale opacity-30"}`}>
                    {owned ? entry.emoji : "❓"}
                  </div>
                  <p className={`text-[9px] font-black leading-tight ${owned ? "text-forest-dark" : "text-gray-300"}`}>
                    {owned ? entry.name : "???"}
                  </p>
                  {owned && (
                    <span className="text-[9px] font-bold text-gray-400">
                      {MOOD_EMOJI[mood]} {t(`game.me.mood.${mood}`)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 💌 Two-way pigeon: child writes to parents */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-2.5">
          <h3 className="text-scale-xs font-black text-forest-dark uppercase tracking-wider">{t("game.me.letterTitle")}</h3>
          <p className="text-scale-2xs text-gray-400 font-medium">
            {t("game.me.letterDesc")}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const r = sendChildMessage(letterText);
              if (r.success) {
                setLetterText("");
                showFlash(true, t("game.me.letterSent"));
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              placeholder={t("game.me.letterPlaceholder")}
              className="flex-grow min-h-tap bg-sand-light border-2 border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
              maxLength={200}
            />
            <button
              type="submit"
              disabled={!letterText.trim()}
              className={`min-w-tap min-h-tap rounded-xl text-lg flex items-center justify-center active:scale-95 transition-transform ${
                letterText.trim() ? "bg-sky text-white" : "bg-gray-100 text-gray-300"
              }`}
            >
              🕊️
            </button>
          </form>
        </div>

        {/* SHOP by slot */}
        {Object.entries(SLOT_LABEL_KEYS).map(([slot, labelKey]) => (
          <div key={slot} className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
            <h3 className="text-scale-xs font-black text-forest-dark uppercase tracking-wider">{t(labelKey)}</h3>
            <div className="grid grid-cols-2 gap-2">
              {COSMETICS_CATALOG.filter((c) => c.slot === slot).map((item) => {
                const owned = cosmetics.owned.includes(item.id);
                const isEquipped = cosmetics.equipped[slot] === item.id;
                return (
                  <div
                    key={item.id}
                    className={`border-2 rounded-2xl p-3 text-center space-y-1.5 transition-all ${
                      isEquipped ? "border-forest bg-forest-light/15" : "border-sand"
                    }`}
                  >
                    <div className="text-3xl h-9 flex items-center justify-center">
                      {item.emoji || (
                        <span
                          className="inline-block w-8 h-8 rounded-full border-4"
                          style={{ borderColor: item.value }}
                        />
                      )}
                    </div>
                    <p className="text-scale-2xs font-black text-forest-dark leading-tight">{item.name}</p>
                    <span className={`inline-block text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${RARITY_BADGE[item.rarity]}`}>
                      {t(`game.me.rarity.${item.rarity === "epic" ? "epic" : item.rarity === "rare" ? "rare" : "common"}`)}
                    </span>

                    {owned ? (
                      <button
                        onClick={() => handleToggleEquip(item)}
                        className={`w-full min-h-tap rounded-xl text-scale-2xs font-black border-2 active:scale-95 transition-transform ${
                          isEquipped
                            ? "bg-forest text-white border-forest"
                            : "bg-white text-forest border-forest/40"
                        }`}
                      >
                        {isEquipped ? t("game.me.equipped") : t("game.me.equip")}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        className={`w-full min-h-tap rounded-xl text-scale-2xs font-black border-2 active:scale-95 transition-transform ${
                          heroCoins >= item.cost
                            ? "bg-amber text-white border-amber"
                            : "bg-gray-100 text-gray-400 border-sand"
                        }`}
                      >
                        {item.cost} 🪙
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
        <button onClick={() => router.push("/dashboard")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">🌳</span>
          <span className="text-scale-2xs font-extrabold">{t("nav.adventure")}</span>
        </button>
        <button onClick={() => router.push("/rewards")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">🛒</span>
          <span className="text-scale-2xs font-extrabold">{t("nav.rewards")}</span>
        </button>
        <button onClick={() => router.push("/mining")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">⛏️</span>
          <span className="text-scale-2xs font-extrabold">{t("nav.mining")}</span>
        </button>
        <button onClick={() => {}} className="min-h-tap flex flex-col items-center p-2 text-forest-medium space-y-0.5">
          <span className="text-xl">🏠</span>
          <span className="text-scale-2xs font-black">{t("game.hero.myCorner").replace("🏠 ", "")}</span>
        </button>
      </div>
    </div>
  );
}
