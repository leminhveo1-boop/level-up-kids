"use client";

import React, { useState } from "react";
import { GIFT_CATALOG } from "@/lib/game/gifting";
import { useLang } from "@/context/LanguageContext";

const CLASS_EMOJI = { Mage: "🔮", Druid: "🌱" };

/** 👨‍👩‍👧‍👦 D3: siblings strip — switch player + send gifts (family circle V1). */
export default function FamilyStrip({ childProfiles, activeChildId, heroCoins, onSelectChild, sendGift }) {
  const { t } = useLang();
  const [giftPickerFor, setGiftPickerFor] = useState(null);
  const [giftFlash, setGiftFlash] = useState("");

  const handleSendGift = async (toChildId, giftId) => {
    const r = await sendGift(toChildId, giftId);
    setGiftFlash(r.message || "");
    setTimeout(() => setGiftFlash(""), 3500);
    if (r.success) setGiftPickerFor(null);
  };

  return (
    <div className="w-full bg-white border-2 border-sand p-3 rounded-2xl shadow-game-flat space-y-2">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{t("game.family.title")}</span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {childProfiles.map((sib) => {
          const isMe = sib.id === activeChildId;
          const sibEmoji = CLASS_EMOJI[sib.char_class] || "🛡️";
          return (
            <div key={sib.id} className="flex-shrink-0 flex items-center gap-1">
              <button
                onClick={() => {
                  if (!isMe && confirm(t("game.family.switchConfirm", { name: sib.name }))) {
                    onSelectChild(sib.id);
                  }
                }}
                className={`min-h-tap flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all active:scale-95 ${
                  isMe ? "border-forest bg-forest-light/20" : "border-sand bg-sand-light"
                }`}
              >
                <span className="text-lg">{sibEmoji}</span>
                <span className="text-[11px] font-black text-forest-dark">
                  {sib.name} {isMe && t("game.family.me")}
                </span>
              </button>
              {!isMe && (
                <button
                  onClick={() => setGiftPickerFor(giftPickerFor === sib.id ? null : sib.id)}
                  className="min-h-tap min-w-tap flex items-center justify-center rounded-xl border-2 border-purple-200 bg-purple-50 text-base active:scale-95 transition-transform"
                  title={t("game.family.giftFor", { name: sib.name })}
                >
                  🎁
                </button>
              )}
            </div>
          );
        })}
      </div>

      {giftPickerFor && (
        <div className="border-t border-sand pt-2 space-y-1.5">
          <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider">
            {t("game.family.giftTitle", { name: childProfiles.find((c) => c.id === giftPickerFor)?.name })}
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {GIFT_CATALOG.map((g) => (
              <button
                key={g.id}
                onClick={() => handleSendGift(giftPickerFor, g.id)}
                disabled={heroCoins < g.cost}
                className={`min-h-tap text-left px-2.5 py-2 rounded-xl border-2 text-[10px] font-bold flex items-center justify-between gap-1 transition-transform active:scale-95 ${
                  heroCoins < g.cost
                    ? "border-sand bg-sand-light text-gray-300"
                    : "border-purple-200 bg-purple-50 text-purple-800"
                }`}
              >
                <span>{g.emoji} {g.label}</span>
                <span>{g.cost}🪙</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {giftFlash && (
        <p className="text-[10px] font-bold text-purple-700 text-center">{giftFlash}</p>
      )}
    </div>
  );
}
