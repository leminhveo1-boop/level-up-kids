"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { useLang } from "@/context/LanguageContext";
import confetti from "canvas-confetti";

export default function MiningCavePage() {
  const router = useRouter();
  const { t } = useLang();
  const { uiMode } = useAuth();
  const isTeen = uiMode === "teen";
  const m = isTeen ? "teen" : "kid";
  const {
    isLoaded,
    charName,
    energy,
    heroCoins,
    points,
    streak,
    tasks,
    mineTreasure,
    miningHistory,
    inventory,
    pets,
    activePet,
    activeMount,
    hatchPet,
    feedPet,
    setActiveCompanion,
  } = useGame();

  const [isStriking, setIsStriking] = useState(false); // Rock shake animation
  const [floatingTexts, setFloatingTexts] = useState([]); // Flying text list [{ id, text, type, x, y }]
  // null = show the welcome line (kept out of state so it follows the current locale)
  const [caveLog, setCaveLog] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [activeTab, setActiveTab] = useState("mine"); // 'mine' or 'pet'
  
  // Hatching states
  const [selectedEgg, setSelectedEgg] = useState(null);
  const [selectedPotion, setSelectedPotion] = useState(null);
  const [isHatching, setIsHatching] = useState(false);
  const [hatchedPetName, setHatchedPetName] = useState("");
  const [showHatchSuccess, setShowHatchSuccess] = useState(false);

  const handleHatch = () => {
    if (!selectedEgg || !selectedPotion) return;
    setIsHatching(true);
    setTimeout(() => {
      const res = hatchPet(selectedEgg, selectedPotion);
      setIsHatching(false);
      if (res.success) {
        setHatchedPetName(res.pet.name + " " + res.pet.emoji);
        setShowHatchSuccess(true);
        setSelectedEgg(null);
        setSelectedPotion(null);
        setCaveLog(t("game.mine.hatchLog", { name: charName, pet: `${res.pet.name} ${res.pet.emoji}` }));
      } else {
        setErrorMessage(res.message);
        setTimeout(() => setErrorMessage(""), 3500);
      }
    }, 2000);
  };

  const handleFeed = (petId, foodType) => {
    const res = feedPet(petId, foodType);
    if (res.success) {
      setCaveLog(res.message);
    } else {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(""), 3500);
    }
  };

  useEffect(() => {
    if (isLoaded && !charName) {
      router.push("/");
    }
  }, [isLoaded, charName, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">{t("game.mine.loading")}</p>
      </div>
    );
  }

  // Buff state detections
  const hasExerciseBuff = tasks.some((t) => t.category === "strength" && t.completed);
  const hasReadingBuff = tasks.some((t) => t.category === "intellect" && t.completed);
  const hasStreakBuff = streak >= 3;

  // Handle Mining Click
  const handleMineClick = (e) => {
    if (energy < 1) {
      setErrorMessage(t("game.mine.noEnergy"));
      setTimeout(() => setErrorMessage(""), 4500);
      return;
    }

    // Trigger rock animation
    setIsStriking(true);
    setTimeout(() => setIsStriking(false), 150);

    // Call Context Mining
    const result = mineTreasure();
    
    if (result.success) {
      // Calculate floating text position near click or center
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left || 150;
      const clickY = e.clientY - rect.top || 150;

      let styleColor = "text-amber font-black";
      let prefix = "+";
      if (result.lootType === "legendary") styleColor = "text-red-500 font-extrabold text-lg animate-bounce";
      else if (result.lootType === "epic") styleColor = "text-amber-dark font-black text-base";
      else if (result.lootType === "rare") styleColor = "text-sky-dark font-black";

      const newFloatingText = {
        id: Date.now() + Math.random(),
        text: `${prefix}${result.coinReward} 🪙 ${result.isCritical ? t("game.mine.crit") : ""}`,
        styleColor,
        x: clickX,
        y: clickY - 20,
      };

      setFloatingTexts((prev) => [...prev, newFloatingText]);

      // Log update
      if (result.lootType === "legendary") {
        setCaveLog(t("game.mine.logLegendary", { name: charName, title: result.title, coins: result.coinReward }));
      } else if (result.lootType === "epic") {
        setCaveLog(t("game.mine.logEpic", { title: result.title, coins: result.coinReward }));
      } else {
        setCaveLog(t("game.mine.logCommon", { title: result.title, coins: result.coinReward }));
      }

      // Re-cleanup floating text after 1.5s
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((t) => t.id !== newFloatingText.id));
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col flex-grow relative pb-20">
      {/* Scrollable Cave Zone */}
      <div className="flex-grow p-5 space-y-5 overflow-y-auto">
        
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
            
            {/* Hero Coin Wallet */}
            <div className="bg-amber-light border border-amber/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="text-xs animate-bounce">🪙</span>
              <span className="text-[11px] font-black text-amber-dark">{heroCoins} {t("game.coin")}</span>
            </div>
          </div>
        </div>

        {/* CAVE WELCOME BOARD */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat text-center space-y-1">
          <h2 className="text-sm font-black text-forest-dark uppercase tracking-widest flex items-center justify-center gap-1">
            <span>⛏️</span>
            <span>{t(`game.mine.caveTitle.${m}`)}</span>
            <span>⛏️</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            {t(`game.mine.caveSub.${m}`)}
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="grid grid-cols-2 gap-2 w-full select-none">
          <button
            onClick={() => setActiveTab("mine")}
            className={`py-2 px-4 rounded-2xl border-2 font-black text-[10px] uppercase btn-game-transition tracking-widest ${
              activeTab === "mine"
                ? "bg-forest text-white border-forest shadow-game-forest"
                : "bg-white text-gray-500 border-sand shadow-game-flat"
            }`}
            type="button"
          >
            {t("game.mine.tabMine")}
          </button>
          <button
            onClick={() => setActiveTab("pet")}
            className={`py-2 px-4 rounded-2xl border-2 font-black text-[10px] uppercase btn-game-transition tracking-widest ${
              activeTab === "pet"
                ? "bg-forest text-white border-forest shadow-game-forest"
                : "bg-white text-gray-500 border-sand shadow-game-flat"
            }`}
            type="button"
          >
            {t(`game.mine.tabPet.${m}`)}
          </button>
        </div>

        {activeTab === "mine" ? (
          <>
            {/* MAIN MINING WORKSPACE: Rock & Elixir Bottle */}
            <div className="grid grid-cols-3 gap-4 items-center">
              
              {/* Left: Mana / Energy Elixir Bottle */}
              <div className="col-span-1 bg-white border-2 border-sand p-3.5 rounded-3xl shadow-game-flat flex flex-col items-center justify-center text-center space-y-3.5 relative select-none">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{t("game.mine.energyLabel")}</span>
                
                {/* Bottle graphic representation */}
                <div className="w-10 h-16 bg-gray-100 border-2 border-sand rounded-b-2xl rounded-t-lg relative overflow-hidden shadow-inner flex flex-col justify-end">
                  {/* Energy Liquid */}
                  <div 
                    className="bg-sky h-full w-full transition-all duration-500 relative animate-pulse"
                    style={{ height: `${energy}%` }}
                  >
                    {/* Bubble FX */}
                    <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-float"></div>
                    <div className="absolute top-4 right-2 w-1 h-1 bg-white/40 rounded-full animate-float delay-75"></div>
                  </div>
                </div>

                {/* Counter */}
                <div className="space-y-0.5">
                  <p className="text-base font-black text-sky-dark">{energy}<span className="text-xs opacity-75">/100</span></p>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">{t("game.mine.energyUnit")}</p>
                </div>
              </div>

              {/* Right 2-cols: Interactive clicker magic ore */}
              <div className="col-span-2 bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat relative h-48 flex items-center justify-center overflow-hidden select-none">
                {/* Floating text values nổ lên */}
                {floatingTexts.map((ft) => (
                  <div
                    key={ft.id}
                    className={`absolute text-xs font-black animate-float-up pointer-events-none z-30 select-none ${ft.styleColor}`}
                    style={{ left: `${ft.x}px`, top: `${ft.y}px` }}
                  >
                    {ft.text}
                  </div>
                ))}

                {/* Rock Magical Crystal Button */}
                <button
                  onClick={handleMineClick}
                  className={`relative focus:outline-none transition-transform duration-75 active:scale-90 ${
                    isStriking ? "animate-wiggle scale-95" : ""
                  } ${energy < 1 ? "opacity-45" : ""}`}
                  disabled={energy < 1}
                  type="button"
                >
                  {/* Glowing Rare Ring effect */}
                  {hasReadingBuff && (
                    <div className="absolute inset-0 bg-amber/20 rounded-full blur-xl animate-pulse -z-10 scale-125"></div>
                  )}
                  {hasExerciseBuff && (
                    <div className="absolute inset-0 bg-red-400/10 rounded-full blur-xl animate-pulse -z-10 scale-125"></div>
                  )}

                  {/* Ore Icon */}
                  <div className="text-7xl filter drop-shadow-md select-none transform hover:scale-105 transition-transform">
                    {energy < 1 ? "🪵" : hasReadingBuff ? "💎" : "💎"}
                  </div>

                  {/* Crack indicators */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-3xl text-white/50 opacity-40 font-black tracking-widest select-none">⚡</span>
                  </div>
                </button>

                {/* Anti-spam text helper */}
                <div className="absolute bottom-2 text-[10px] font-bold text-gray-400 select-none">
                  {energy > 0 ? t("game.mine.clickHelp") : t("game.mine.clickEmpty")}
                </div>
              </div>
            </div>

            {/* Energy Empty Warning Banner */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-2xl text-[10.5px] font-black text-terracotta text-center animate-bounce shadow-sm">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* BUFFS / BOOSTERS ACTIVE INDICATOR */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-2.5">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider flex items-center gap-1">
                <span>🛡️</span>
                <span>{t("game.mine.runesTitle")}</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                {/* Exercise Buff */}
                <div className={`border rounded-2xl p-2.5 flex flex-col items-center justify-between min-h-[120px] transition-all duration-300 ${
                  hasExerciseBuff 
                    ? "bg-rose-50 border-red-200 text-terracotta shadow-sm scale-100" 
                    : "bg-gray-50/70 border-gray-100 text-gray-400 opacity-80"
                }`}>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-base">🏃</span>
                    <span className="font-extrabold text-[11px] tracking-tight text-forest-dark uppercase">{t("game.mine.rune.str")}</span>
                  </div>

                  {/* Detailed Description */}
                  <div className="text-[10px] font-bold text-gray-500 space-y-0.5 my-1 text-left w-full pl-0.5">
                    <p className="text-rose-600 font-extrabold">{t("game.mine.rune.strEffect")}</p>
                    <p className="text-gray-400 font-medium">{t("game.mine.rune.strTrain")}</p>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border select-none ${
                    hasExerciseBuff
                      ? "bg-rose-100 border-red-200 text-terracotta animate-pulse"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {hasExerciseBuff ? t("game.mine.runeOn") : t("game.mine.runeOff")}
                  </span>
                </div>

                {/* Reading Buff */}
                <div className={`border rounded-2xl p-2.5 flex flex-col items-center justify-between min-h-[120px] transition-all duration-300 ${
                  hasReadingBuff 
                    ? "bg-blue-50 border-blue-200 text-sky-dark shadow-sm scale-100" 
                    : "bg-gray-50/70 border-gray-100 text-gray-400 opacity-80"
                }`}>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-base">🧠</span>
                    <span className="font-extrabold text-[11px] tracking-tight text-forest-dark uppercase">{t("game.mine.rune.int")}</span>
                  </div>

                  {/* Detailed Description */}
                  <div className="text-[10px] font-bold text-gray-500 space-y-0.5 my-1 text-left w-full pl-0.5">
                    <p className="text-blue-600 font-extrabold">{t("game.mine.rune.intEffect")}</p>
                    <p className="text-gray-400 font-medium">{t("game.mine.rune.intTrain")}</p>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border select-none ${
                    hasReadingBuff
                      ? "bg-blue-100 border-blue-200 text-sky-dark animate-pulse"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {hasReadingBuff ? t("game.mine.runeOn") : t("game.mine.runeOff")}
                  </span>
                </div>

                {/* Streak Buff */}
                <div className={`border rounded-2xl p-2.5 flex flex-col items-center justify-between min-h-[120px] transition-all duration-300 ${
                  hasStreakBuff 
                    ? "bg-amber-50 border-yellow-200 text-amber-dark shadow-sm scale-100" 
                    : "bg-gray-50/70 border-gray-100 text-gray-400 opacity-80"
                }`}>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-base">💎</span>
                    <span className="font-extrabold text-[11px] tracking-tight text-forest-dark uppercase">{t("game.mine.rune.dil")}</span>
                  </div>

                  {/* Detailed Description */}
                  <div className="text-[10px] font-bold text-gray-500 space-y-0.5 my-1 text-left w-full pl-0.5">
                    <p className="text-amber-600 font-extrabold">{t("game.mine.rune.dilEffect")}</p>
                    <p className="text-gray-400 font-medium">{t("game.mine.rune.dilTrain")}</p>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border select-none ${
                    hasStreakBuff
                      ? "bg-amber-100 border-yellow-200 text-amber-dark animate-pulse"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {hasStreakBuff ? t("game.mine.runeOn") : t("game.mine.runeOffStreak", { n: streak })}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-normal text-center pt-1 select-none">
                💡 <strong>{t("game.mine.runeTipLabel")}</strong> {t("game.mine.runeTip")}
              </p>
            </div>

            {/* LOG CONSOLE: Realtime actions display */}
            <div className="bg-sand-dark/15 border-2 border-sand p-3.5 rounded-2xl text-[10px] font-extrabold text-forest-dark italic leading-relaxed text-center select-none">
              {caveLog ?? t("game.mine.welcome")}
            </div>

            {/* MINING HISTORY LOG BOX */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">{t("game.mine.historyTitle")}</h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {miningHistory.length === 0 ? (
                  <div className="text-center py-6 text-[10.5px] text-gray-400 font-bold">
                    {t("game.mine.historyEmpty")}
                  </div>
                ) : (
                  miningHistory.map((item) => {
                    let badgeStyle = "bg-gray-100 text-gray-500 border-gray-200";
                    if (item.rarity === "legendary") badgeStyle = "bg-rose-50 text-red-500 border-red-200 animate-pulse";
                    else if (item.rarity === "epic") badgeStyle = "bg-amber-50 text-amber-dark border-yellow-200";
                    else if (item.rarity === "rare") badgeStyle = "bg-blue-50 text-sky-dark border-blue-200";

                    return (
                      <div 
                        key={item.id}
                        className="bg-sand-light border border-sand p-2 rounded-xl flex items-center justify-between text-[10.5px] font-bold text-forest-dark"
                      >
                        <div className="flex flex-col truncate">
                          <span className="truncate max-w-[200px]">{item.title}</span>
                          <span className="text-[10px] font-extrabold uppercase text-gray-400">
                            {new Date(item.timestamp).toLocaleTimeString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${badgeStyle}`}>
                            {item.rarityText}
                          </span>
                          <span className="text-xs font-black text-amber-dark">
                            {item.isMaterial ? "" : `+${item.coins} 🪙`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* INVENTORY PANEL */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider flex items-center gap-1">
                <span>🎒</span>
                <span>{t("game.mine.invTitle")}</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2 select-none">
                {/* Eggs section */}
                <div className="bg-sand-light border border-sand p-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 select-none">
                  <span className="text-[10px] font-black text-forest-dark uppercase tracking-wider">{t("game.mine.eggs")}</span>
                  <div className="text-[10px] text-gray-500 font-bold space-y-0.5">
                    <p>{t("game.mine.eggBase")} <span className="text-forest font-black">{inventory?.eggs?.base || 0}</span></p>
                    <p>{t("game.mine.eggWolf")} <span className="text-amber font-black">{inventory?.eggs?.wolf || 0}</span></p>
                    <p>{t("game.mine.eggDragon")} <span className="text-terracotta font-black">{inventory?.eggs?.dragon || 0}</span></p>
                  </div>
                </div>

                {/* Potions section */}
                <div className="bg-sand-light border border-sand p-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 select-none">
                  <span className="text-[10px] font-black text-forest-dark uppercase tracking-wider">{t("game.mine.potions")}</span>
                  <div className="text-[10px] text-gray-500 font-bold space-y-0.5">
                    <p>{t("game.mine.potFire")} <span className="text-terracotta font-black">{inventory?.potions?.fire || 0}</span></p>
                    <p>{t("game.mine.potIce")} <span className="text-sky-dark font-black">{inventory?.potions?.ice || 0}</span></p>
                    <p>{t("game.mine.potMagic")} <span className="text-clay font-black">{inventory?.potions?.magic || 0}</span></p>
                  </div>
                </div>

                {/* Foods section */}
                <div className="bg-sand-light border border-sand p-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 select-none">
                  <span className="text-[10px] font-black text-forest-dark uppercase tracking-wider">{t("game.mine.foods")}</span>
                  <div className="text-[10px] text-gray-500 font-bold space-y-0.5">
                    <p>{t("game.mine.foodMeat")} <span className="text-terracotta font-black">{inventory?.foods?.meat || 0}</span></p>
                    <p>{t("game.mine.foodCandy")} <span className="text-amber font-black">{inventory?.foods?.candy || 0}</span></p>
                    <p>{t("game.mine.foodLeaf")} <span className="text-forest font-black">{inventory?.foods?.leaf || 0}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* HATCHING ZONE */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider flex items-center gap-1">
                <span>🧪</span>
                <span>{t("game.mine.hatchTitle")}</span>
              </h3>

              {isHatching ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 select-none">
                  <div className="text-5xl animate-bounce duration-500 filter drop-shadow">🥚</div>
                  <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden border border-sand">
                    <div className="h-full bg-forest animate-shimmer" style={{ width: "100%" }}></div>
                  </div>
                  <p className="text-[10.5px] font-black text-forest animate-pulse uppercase tracking-wider">{t("game.mine.hatching")}</p>
                </div>
              ) : showHatchSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-forest-light/20 border border-forest/10 rounded-2xl p-4 select-none">
                  <span className="text-5xl animate-bounce">🎉</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">{t("game.mine.hatchOk")}</p>
                    <h4 className="text-base font-black text-forest-dark">{hatchedPetName}</h4>
                  </div>
                  <button
                    onClick={() => setShowHatchSuccess(false)}
                    className="bg-forest text-white font-extrabold text-[10px] py-1.5 px-5 rounded-full border border-forest active:scale-95 transition-transform"
                    type="button"
                  >
                    {t("game.mine.close")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 p-2.5 rounded-xl text-[10px] font-black text-terracotta text-center">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {/* Select Egg */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">{t("game.mine.pickEgg")}</label>
                      <select
                        value={selectedEgg || ""}
                        onChange={(e) => setSelectedEgg(e.target.value || null)}
                        className="w-full bg-sand-light border-2 border-sand text-xs font-extrabold text-forest-dark rounded-xl p-2.5 focus:outline-none"
                      >
                        <option value="">{t("game.mine.pickEggPh")}</option>
                        {inventory?.eggs?.base > 0 && <option value="base">{t("game.mine.optEggBase", { n: inventory.eggs.base })}</option>}
                        {inventory?.eggs?.wolf > 0 && <option value="wolf">{t("game.mine.optEggWolf", { n: inventory.eggs.wolf })}</option>}
                        {inventory?.eggs?.dragon > 0 && <option value="dragon">{t("game.mine.optEggDragon", { n: inventory.eggs.dragon })}</option>}
                      </select>
                    </div>

                    {/* Select Potion */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">{t("game.mine.pickPotion")}</label>
                      <select
                        value={selectedPotion || ""}
                        onChange={(e) => setSelectedPotion(e.target.value || null)}
                        className="w-full bg-sand-light border-2 border-sand text-xs font-extrabold text-forest-dark rounded-xl p-2.5 focus:outline-none"
                      >
                        <option value="">{t("game.mine.pickPotionPh")}</option>
                        {inventory?.potions?.fire > 0 && <option value="fire">{t("game.mine.optPotFire", { n: inventory.potions.fire })}</option>}
                        {inventory?.potions?.ice > 0 && <option value="ice">{t("game.mine.optPotIce", { n: inventory.potions.ice })}</option>}
                        {inventory?.potions?.magic > 0 && <option value="magic">{t("game.mine.optPotMagic", { n: inventory.potions.magic })}</option>}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleHatch}
                    disabled={!selectedEgg || !selectedPotion}
                    className={`w-full py-3.5 rounded-2xl border-2 font-black text-sm uppercase btn-game-transition tracking-widest ${
                      selectedEgg && selectedPotion
                        ? "bg-amber text-white border-amber shadow-game-amber active:shadow-game-pressed"
                        : "bg-gray-100 text-gray-400 border-sand cursor-not-allowed"
                    }`}
                    type="button"
                  >
                    {t("game.mine.hatchBtn")}
                  </button>
                </div>
              )}
            </div>

            {/* MY PETS SANCTUARY */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider flex items-center gap-1">
                <span>🐾</span>
                <span>{t(`game.mine.petsTitle.${m}`, { name: charName, n: pets?.length || 0 })}</span>
              </h3>

              {pets?.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-gray-400 font-bold uppercase tracking-wider select-none">
                  {t(`game.mine.petsEmpty.${m}`)}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {pets.map((pet) => {
                    const isActive = activePet === pet.id || activeMount === pet.id;
                    const petRole = activeMount === pet.id ? "mount" : activePet === pet.id ? "pet" : null;
                    
                    return (
                      <div
                        key={pet.id}
                        className={`border-2 rounded-2xl p-4 space-y-3 relative overflow-hidden transition-all ${
                          isActive ? "border-forest bg-forest-light/10 shadow-sm" : "border-sand bg-sand-light/30"
                        }`}
                      >
                        {/* Active Badge */}
                        {isActive && (
                          <span className="absolute top-2 right-2 bg-forest text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {petRole === "mount" ? t("game.mine.badgeMount") : t("game.mine.badgePet")}
                          </span>
                        )}

                        <div className="flex items-center gap-3">
                          {/* Pet Emoji / Avatar */}
                          <div className="w-12 h-12 bg-white border border-sand rounded-xl flex items-center justify-center text-3xl shadow-inner animate-float select-none">
                            {pet.emoji}
                          </div>

                          <div className="flex-grow min-w-0 select-none">
                            <h4 className="text-xs font-black text-forest-dark truncate uppercase tracking-wider">{pet.name}</h4>
                            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">
                              {t("game.mine.elemPrefix")} {pet.element === "fire" ? t("game.mine.elemFire") : pet.element === "ice" ? t("game.mine.elemIce") : t("game.mine.elemMagic")} • {pet.type}
                            </p>
                          </div>
                        </div>

                        {/* Intimacy / Feed Progress bar */}
                        <div className="space-y-1 select-none">
                          <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-wider">
                            <span>{t("game.mine.intimacy")}</span>
                            <span className="text-forest-medium">{pet.feedProgress}%</span>
                          </div>
                          
                          <div className="h-2.5 bg-gray-100 border border-sand rounded-full overflow-hidden">
                            <div
                              className="h-full bg-forest-medium transition-all duration-300 rounded-full"
                              style={{ width: `${pet.feedProgress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Pet Actions Panel */}
                        <div className="pt-1 flex items-center gap-2 flex-wrap">
                          {/* Feed triggers if intimacy < 100 */}
                          {pet.feedProgress < 100 ? (
                            <div className="flex items-center gap-1.5 flex-grow">
                              <span className="text-[10px] font-black text-gray-400 uppercase select-none">{t("game.mine.feed")}</span>
                              
                              <button
                                onClick={() => handleFeed(pet.id, "meat")}
                                disabled={inventory?.foods?.meat < 1}
                                className={`text-[11px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 active:scale-95 transition-transform ${
                                  inventory?.foods?.meat > 0 
                                    ? "bg-white border-red-200 text-terracotta hover:bg-rose-50" 
                                    : "bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed"
                                }`}
                                type="button"
                              >
                                🥩 ({inventory?.foods?.meat || 0})
                              </button>

                              <button
                                onClick={() => handleFeed(pet.id, "candy")}
                                disabled={inventory?.foods?.candy < 1}
                                className={`text-[11px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 active:scale-95 transition-transform ${
                                  inventory?.foods?.candy > 0 
                                    ? "bg-white border-yellow-200 text-amber hover:bg-amber-light/20" 
                                    : "bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed"
                                }`}
                                type="button"
                              >
                                🍬 ({inventory?.foods?.candy || 0})
                              </button>

                              <button
                                onClick={() => handleFeed(pet.id, "leaf")}
                                disabled={inventory?.foods?.leaf < 1}
                                className={`text-[11px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 active:scale-95 transition-transform ${
                                  inventory?.foods?.leaf > 0 
                                    ? "bg-white border-green-200 text-forest hover:bg-green-50" 
                                    : "bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed"
                                }`}
                                type="button"
                              >
                                🌿 ({inventory?.foods?.leaf || 0})
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-black text-amber-dark uppercase tracking-widest animate-pulse flex-grow select-none">
                              {t("game.mine.evolved")}
                            </span>
                          )}

                          {/* Companion Setter */}
                          <div className="flex items-center gap-1.5 ml-auto select-none">
                            {!isActive ? (
                              pet.isMount ? (
                                <button
                                  onClick={() => setActiveCompanion("mount", pet.id)}
                                  className="bg-forest hover:bg-forest-dark text-white font-extrabold text-[10px] py-1 px-3.5 rounded-lg border border-forest active:scale-95 transition-transform uppercase tracking-wider shadow-sm"
                                  type="button"
                                >
                                  {t("game.mine.ride")}
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActiveCompanion("pet", pet.id)}
                                  className="bg-white hover:bg-sand-light text-forest font-extrabold text-[10px] py-1 px-3.5 rounded-lg border border-sand active:scale-95 transition-transform uppercase tracking-wider"
                                  type="button"
                                >
                                  {t("game.mine.follow")}
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => setActiveCompanion(null, null)}
                                className="bg-sand hover:bg-sand-dark text-gray-500 font-extrabold text-[10px] py-1 px-3.5 rounded-lg border border-sand active:scale-95 transition-transform uppercase tracking-wider"
                                type="button"
                              >
                                {t("game.mine.recall")}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TAB NAVIGATION (Duolingo style) */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t-2 border-sand p-2 flex items-center justify-around z-40 max-w-md mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🌳</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider">{t("nav.adventure")}</span>
        </button>

        <button
          onClick={() => router.push("/rewards")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🛒</span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider">{t("nav.rewards")}</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center p-2 text-forest-medium space-y-0.5"
        >
          <span className="text-xl">⛏️</span>
          <span className="text-[11px] font-black uppercase tracking-wider">{t("nav.mining")}</span>
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
