"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { COSMETICS_CATALOG, getEquipped } from "@/lib/game/cosmetics";

const SLOT_LABELS = {
  hat: "🎩 Mũ & Phụ Kiện Đầu",
  frame: "🖼️ Khung Avatar",
  petAccessory: "🐾 Đồ Cho Thú Cưng",
};

const RARITY_BADGE = {
  common: "bg-gray-100 text-gray-500 border-gray-200",
  rare: "bg-blue-50 text-sky-dark border-blue-200",
  epic: "bg-amber-50 text-amber-dark border-yellow-200",
};

/** Góc Của Tớ 🏠 — avatar/pet cosmetics shop (Octalysis CD4, sibling identity). */
export default function MyCornerPage() {
  const router = useRouter();
  const { isLoaded, charName, heroCoins, cosmetics, buyCosmetic, equipCosmetic, pets, activePet, activeMount } = useGame();

  const [flash, setFlash] = useState(null); // { ok, text }

  useEffect(() => {
    if (isLoaded && !charName) router.push("/");
  }, [isLoaded, charName, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang mở Góc Của Tớ...</p>
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
      showFlash(true, `Đã mua & mặc luôn ${item.name}! ✨`);
    } else if (r.error === "NOT_ENOUGH_COINS") {
      showFlash(false, `Còn thiếu ${r.shortage} 🪙 nữa — đi đào mỏ thôi! ⛏️`);
    } else {
      showFlash(false, "Không mua được, thử lại nhé!");
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
            <span className="text-scale-2xs font-black text-amber-dark">{heroCoins} COIN</span>
          </div>
        </div>

        {/* PREVIEW CARD — hero with equipped cosmetics */}
        <div className="bg-white border-2 border-sand p-5 rounded-3xl shadow-game-flat text-center space-y-3">
          <h2 className="text-scale-sm font-black text-forest-dark uppercase tracking-widest">🏠 Góc Của {charName}</h2>

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
            Mua đồ bằng Hero Coin 🪙 để tạo phong cách riêng — không đụng hàng với anh chị em nhà mình!
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

        {/* SHOP by slot */}
        {Object.entries(SLOT_LABELS).map(([slot, label]) => (
          <div key={slot} className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
            <h3 className="text-scale-xs font-black text-forest-dark uppercase tracking-wider">{label}</h3>
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
                      {item.rarity === "epic" ? "Sử thi" : item.rarity === "rare" ? "Hiếm" : "Thường"}
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
                        {isEquipped ? "ĐANG DÙNG ✓" : "MẶC VÀO"}
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
          <span className="text-scale-2xs font-extrabold">Phiêu Lưu</span>
        </button>
        <button onClick={() => router.push("/rewards")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">🛒</span>
          <span className="text-scale-2xs font-extrabold">Đổi Quà</span>
        </button>
        <button onClick={() => router.push("/mining")} className="min-h-tap flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5">
          <span className="text-xl">⛏️</span>
          <span className="text-scale-2xs font-extrabold">Đào Mỏ</span>
        </button>
        <button onClick={() => {}} className="min-h-tap flex flex-col items-center p-2 text-forest-medium space-y-0.5">
          <span className="text-xl">🏠</span>
          <span className="text-scale-2xs font-black">Của Tớ</span>
        </button>
      </div>
    </div>
  );
}
