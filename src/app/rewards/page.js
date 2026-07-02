"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useLang } from "@/context/LanguageContext";

export default function RewardsPage() {
  const router = useRouter();
  const { t } = useLang();
  const {
    isLoaded,
    charName,
    rewards,
    claimReward,
    toggleTimerState,
    screenTimeLeft,
    isTimerActive,
    heroCoins,
    points,
  } = useGame();

  const [selectedReward, setSelectedReward] = useState(null); // Reward to redeem
  const [shortageReward, setShortageReward] = useState(null); // Reward that child doesn't have enough coins for
  const [pinInput, setPinInput] = useState(""); // Code to input
  const [errorMessage, setErrorMessage] = useState(""); // Pin error
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [rewardsTab, setRewardsTab] = useState("points"); // "points" or "heroCoins" tab

  useEffect(() => {
    if (isLoaded && !charName) {
      router.push("/");
    }
  }, [isLoaded, charName, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">{t("common.loading")}</p>
      </div>
    );
  }

  // Format screen time left to HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleOpenPinModal = (reward) => {
    setSelectedReward(reward);
    setPinInput("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleRedeemClick = (reward) => {
    const cost = reward.cost || 50;
    if (reward.currency === "heroCoins") {
      if (heroCoins < cost) {
        setShortageReward(reward);
        return;
      }
    } else {
      if (points < cost) {
        setShortageReward(reward);
        return;
      }
    }
    handleOpenPinModal(reward);
  };

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!pinInput) {
      setErrorMessage(t("game.rw.pinRequired"));
      return;
    }

    const result = claimReward(selectedReward.id, pinInput);
    if (result.success) {
      setSuccessMessage(result.message);
      setTimeout(() => {
        setSelectedReward(null);
      }, 1500);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="flex flex-col flex-grow relative pb-20">
      
      {/* Scrollable Area */}
      <div className="flex-grow p-5 space-y-6 overflow-y-auto">
        
        {/* Navigation header back button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider flex items-center gap-1"
          >
            🌳 Dashboard
          </button>
          
          {/* Dual Wallet Display */}
          <div className="flex items-center gap-2 select-none">
            {/* Points Wallet */}
            <div className="bg-forest-light/35 border border-forest/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="text-xs">⭐</span>
              <span className="text-[11px] font-black text-forest-dark">{points} {t("game.points")}</span>
            </div>
            
            {/* Hero Coins Wallet */}
            <div className="bg-amber-light border border-amber/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="text-xs">🪙</span>
              <span className="text-[11px] font-black text-amber-dark">{heroCoins} {t("game.coin")}</span>
            </div>
          </div>
        </div>

        {/* SCREEN TIME COUNTDOWN CONTAINER */}
        <div className="bg-white border-2 border-sand p-5 rounded-3xl shadow-game-flat text-center space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">{t("game.rw.screenTitle")}</h3>
            <p className="text-[10px] text-gray-400">{t("game.rw.screenSub")}</p>
          </div>

          {/* Time display */}
          <div className={`text-4xl font-black py-4 px-6 rounded-2xl border-2 font-mono shadow-inner tracking-wider select-none transition-all duration-300 ${
            screenTimeLeft > 0 
              ? "bg-amber-light border-amber text-amber animate-pulse" 
              : "bg-sand-light border-sand text-gray-400"
          }`}>
            {formatTime(screenTimeLeft)}
          </div>

          {/* Control buttons */}
          {screenTimeLeft > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimerState}
                className={`flex-grow font-extrabold text-sm py-3 px-4 rounded-xl border-2 btn-game-transition ${
                  isTimerActive 
                    ? "bg-terracotta border-terracotta text-white shadow-game-terracotta active:shadow-game-pressed"
                    : "bg-forest border-forest text-white shadow-game-forest active:shadow-game-pressed"
                }`}
              >
                {isTimerActive ? t("game.rw.timerPause") : t("game.rw.timerStart")}
              </button>
            </div>
          )}
        </div>

        {/* DUAL CURRENCY STORE TAB SWITCHER */}
        <div className="bg-sand-light border-2 border-sand p-1 rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-inner">
          <button
            onClick={() => setRewardsTab("points")}
            className={`w-1/2 py-3 px-4 rounded-xl border-2 btn-game-transition flex items-center justify-center gap-1.5 ${
              rewardsTab === "points"
                ? "bg-forest border-forest text-white shadow-game-forest"
                : "bg-white border-transparent text-gray-500 hover:text-forest"
            }`}
          >
            <span>🎮</span>
            <span>{t("game.rw.tabPoints")}</span>
          </button>
          <button
            onClick={() => setRewardsTab("heroCoins")}
            className={`w-1/2 py-3 px-4 rounded-xl border-2 btn-game-transition flex items-center justify-center gap-1.5 ${
              rewardsTab === "heroCoins"
                ? "bg-amber border-amber text-white shadow-game-amber"
                : "bg-white border-transparent text-gray-500 hover:text-amber"
            }`}
          >
            <span>🪙</span>
            <span>{t("game.rw.tabCoins")}</span>
          </button>
        </div>

        {/* REWARDS STORE ITEMS LIST */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">
              {rewardsTab === "points" ? t("game.rw.storeTitlePoints") : t("game.rw.storeTitleCoins")}
            </h3>
            <span className="text-[11px] font-black text-gray-400 bg-sand px-2 py-0.5 rounded-full uppercase">
              {t("game.rw.wallet")} {rewardsTab === "points" ? `${points} ⭐` : `${heroCoins} 🪙`}
            </span>
          </div>
          
          <div className="space-y-4">
            {rewards
              .filter((r) => {
                const currency = r.currency || "points";
                return currency === rewardsTab;
              })
              .map((r) => {
                const isAffordable = rewardsTab === "heroCoins" ? heroCoins >= r.cost : points >= r.cost;
                const costSymbol = rewardsTab === "heroCoins" ? "🪙" : "⭐";
                
                // Set up Rarity colors
                let rarityText = t("game.rw.rarity.common");
                let rarityBg = "bg-gray-100 text-gray-500 border-gray-200";
                let cardBorder = "border-sand shadow-game-flat hover:border-sand-dark";

                if (r.rarity === "rare") {
                  rarityText = t("game.rw.rarity.rare");
                  rarityBg = "bg-blue-50 text-sky border-blue-100";
                  cardBorder = "border-sky-light bg-blue-50/5 shadow-game-sky hover:border-sky";
                } else if (r.rarity === "epic") {
                  rarityText = t("game.rw.rarity.epic");
                  rarityBg = "bg-amber-50 text-amber border-yellow-100";
                  cardBorder = "border-amber bg-amber-50/5 shadow-game-amber hover:border-amber-dark";
                } else if (r.rarity === "legendary") {
                  rarityText = t("game.rw.rarity.legendary");
                  rarityBg = "bg-rose-50 text-terracotta border-red-100";
                  cardBorder = "border-red-400 bg-red-50/5 shadow-game-terracotta hover:border-red-500 animate-shimmer-red";
                }

                let badgeText = t("game.rw.badge.default");
                let badgeBg = "bg-sand text-gray-500 border-sand";
                if (r.type === "game_time") {
                  badgeText = t("game.rw.badge.game_time");
                  badgeBg = "bg-amber-light text-amber border-amber/30";
                } else if (r.type === "perk") {
                  badgeText = t("game.rw.badge.perk");
                  badgeBg = "bg-forest-accent text-forest border-forest/30";
                } else if (r.type === "card") {
                  badgeText = t("game.rw.badge.card");
                  badgeBg = "bg-sky-light text-sky border-sky/30";
                }

                return (
                  <div
                    key={r.id}
                    className={`bg-white border-2 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-100 ${cardBorder} ${
                      !isAffordable ? "opacity-85" : ""
                    }`}
                  >
                    {/* Reward Info */}
                    <div className="flex-grow space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase ${badgeBg}`}>
                          {badgeText}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${rarityBg}`}>
                          {rarityText}
                        </span>
                        {r.parentApproved && (
                          <span className="text-[10px] font-black text-forest flex items-center gap-0.5">
                            {t("game.rw.approved")}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-black text-forest-dark leading-snug">{r.title}</h4>
                      
                      {/* Cost display */}
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-dark">
                        <span>{t("game.rw.costLabel")}</span>
                        <span className="text-xs font-black flex items-center gap-0.5">
                          {r.cost} {costSymbol}
                        </span>
                      </div>
                    </div>

                  {/* Redeem Button */}
                  <button
                    onClick={() => handleRedeemClick(r)}
                    className={`font-black text-[10px] px-3.5 py-2.5 rounded-xl border-2 btn-game-transition ${
                      !isAffordable
                        ? "bg-gray-100 border-sand text-gray-400 shadow-game-flat cursor-pointer"
                        : r.type === "game_time" 
                        ? "bg-amber text-white border-amber shadow-game-amber" 
                        : r.type === "perk" 
                        ? "bg-forest text-white border-forest shadow-game-forest"
                        : "bg-sky text-white border-sky shadow-game-sky"
                    }`}
                  >
                    {isAffordable ? t("game.rw.redeem") : r.currency === "heroCoins" ? t("game.rw.shortCoin") : t("game.rw.shortPts")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* PASSCODE / PIN REDEEM DIALOG MODAL */}
      {selectedReward && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
          <form 
            onSubmit={handleRedeem}
            className="bg-white border-4 border-forest rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-5 relative"
          >
            
            {/* Modal Logo */}
            <div className="w-16 h-16 bg-forest-light rounded-full border-2 border-forest mx-auto flex items-center justify-center text-3xl shadow">
              🗝️
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-forest-dark uppercase tracking-wider">{t("game.rw.pinTitle")}</h3>
              <p className="text-[10.5px] text-gray-500">{t("game.rw.pinDesc")}</p>
            </div>

            {/* Input field */}
            <div className="space-y-2">
              <input
                type="password"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder={t("game.rw.pinPlaceholder")}
                className="w-full text-center bg-sand-light border-2 border-sand rounded-xl py-3 text-lg font-black text-forest-dark focus:outline-none focus:border-forest transition-colors letter-spacing-lg"
              />
              {errorMessage && <p className="text-[10px] font-bold text-terracotta">{errorMessage}</p>}
              {successMessage && <p className="text-[10px] font-bold text-forest">{successMessage}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="w-1/2 bg-white text-gray-400 font-extrabold text-xs py-3 rounded-xl border-2 border-sand shadow-game-flat btn-game-transition active:shadow-game-pressed"
              >
                {t("game.rw.cancel")}
              </button>
              <button
                type="submit"
                className="w-1/2 bg-forest text-sand-light font-black text-xs py-3 rounded-xl border-2 border-forest shadow-game-forest btn-game-transition active:shadow-game-pressed"
              >
                {t("game.rw.approveGift")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DUAL CURRENCY SHORTAGE MODAL */}
      {shortageReward && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div 
            className="bg-white border-4 border-terracotta rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4 relative animate-scale-up"
          >
            {/* Mascot */}
            <div className="w-16 h-16 bg-rose-50 border-2 border-terracotta rounded-full mx-auto flex items-center justify-center text-3xl shadow">
              {shortageReward.currency === "heroCoins" ? "🪙" : "⭐"}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-terracotta uppercase tracking-wider">
                {shortageReward.currency === "heroCoins" ? t("game.rw.shortTitleCoin") : t("game.rw.shortTitlePts")}
              </h3>
              <p className="text-[10px] text-gray-500">{t("game.rw.shortSub")}</p>
            </div>

            <div className="bg-sand-light border-2 border-sand p-4 rounded-2xl shadow-inner text-xs font-bold text-forest-dark space-y-2">
              <p className="text-gray-400 text-[10px] font-black uppercase">{t("game.rw.giftInProgress")}</p>
              <p className="text-xs font-black text-forest-dark truncate px-2">{shortageReward.title}</p>
              <div className="flex items-center justify-center gap-4 py-1.5 border-t border-sand mt-2 pt-2">
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-extrabold uppercase">{t("game.rw.have")}</p>
                  <p className="text-base font-black text-amber-dark">
                    {shortageReward.currency === "heroCoins" ? `${heroCoins} 🪙` : `${points} ⭐`}
                  </p>
                </div>
                <div className="text-xs text-gray-300 font-black">/</div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-400 font-extrabold uppercase">{t("game.rw.need")}</p>
                  <p className="text-base font-black text-forest-medium">
                    {shortageReward.cost} {shortageReward.currency === "heroCoins" ? "🪙" : "⭐"}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-terracotta font-black bg-rose-50 p-2 rounded-xl border border-red-100">
                {t(shortageReward.currency === "heroCoins" ? "game.rw.needMoreCoin" : "game.rw.needMorePts", {
                  n: shortageReward.cost - (shortageReward.currency === "heroCoins" ? heroCoins : points),
                })}
              </p>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
              💡 <strong>{t("game.rw.tipLabel")}</strong> {t(shortageReward.currency === "heroCoins" ? "game.rw.tipCoin" : "game.rw.tipPts")}
            </p>

            {/* Actions */}
            <button
              onClick={() => setShortageReward(null)}
              className="w-full bg-terracotta text-white font-black text-xs py-3 rounded-xl border-2 border-terracotta shadow-game-terracotta btn-game-transition active:shadow-game-pressed"
            >
              {t("game.rw.shortCta")}
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM TAB NAVIGATION */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🌳</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider">{t("nav.adventure")}</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center p-2 text-forest-medium space-y-0.5"
        >
          <span className="text-xl">🛒</span>
          <span className="text-[11px] font-black uppercase tracking-wider">{t("nav.rewards")}</span>
        </button>

        <button
          onClick={() => router.push("/mining")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">⛏️</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider">{t("nav.mining")}</span>
        </button>

        <button
          onClick={() => router.push("/parent")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🔑</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider">{t("nav.parent")}</span>
        </button>
      </div>
    </div>
  );
}
