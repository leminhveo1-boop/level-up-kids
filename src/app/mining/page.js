"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import confetti from "canvas-confetti";

export default function MiningCavePage() {
  const router = useRouter();
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
  const [caveLog, setCaveLog] = useState("Chào mừng dũng sĩ đến Động Khai Thác! Hãy dùng Năng Lượng ⚡ đập đá ma thuật để tìm kho báu nhé! ⛏️");
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
        setCaveLog(`🥚 Kỳ diệu! Dũng sĩ ${charName} đã ấp nở thành công Thú cưng: ${res.pet.name} ${res.pet.emoji}! 🎉`);
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
        <p className="mt-4 text-forest font-medium">Đang tải hang động ma thuật...</p>
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
      setErrorMessage("Hết Năng Lượng rồi dũng sĩ ơi! Hãy hoàn thành nhiệm vụ ngoài đời để nạp đầy bình ⚡");
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
        text: `${prefix}${result.coinReward} 🪙 ${result.isCritical ? "💪 SỨC MẠNH!" : ""}`,
        styleColor,
        x: clickX,
        y: clickY - 20,
      };

      setFloatingTexts((prev) => [...prev, newFloatingText]);

      // Log update
      if (result.lootType === "legendary") {
        setCaveLog(`🎉 QUÁ KHỦNG KHIẾP! ${charName} đã đào được ${result.title} cực hiếm và nhận ngay +${result.coinReward} 🪙! 🎉`);
      } else if (result.lootType === "epic") {
        setCaveLog(`👑 Tuyệt vời! Con đã đào được ${result.title} nhận +${result.coinReward} 🪙!`);
      } else {
        setCaveLog(`⛏️ Con đập đá và thu được ${result.title} (+${result.coinReward} 🪙).`);
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
              <span className="text-[9px] font-black text-forest-dark">{points} ĐIỂM</span>
            </div>
            
            {/* Hero Coin Wallet */}
            <div className="bg-amber-light border border-amber/30 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <span className="text-xs animate-bounce">🪙</span>
              <span className="text-[9px] font-black text-amber-dark">{heroCoins} COIN</span>
            </div>
          </div>
        </div>

        {/* CAVE WELCOME BOARD */}
        <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat text-center space-y-1">
          <h2 className="text-sm font-black text-forest-dark uppercase tracking-widest flex items-center justify-center gap-1">
            <span>⛏️</span>
            <span>ĐỘNG KHAI THÁC ANH HÙNG</span>
            <span>⛏️</span>
          </h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Tiêu hao 1 Năng Lượng ⚡ = 1 Click Đào Kho Báu 💎</p>
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
            ⛏️ Đập Đá Đào Mỏ
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
            🐾 Khu Thú Cưng
          </button>
        </div>

        {activeTab === "mine" ? (
          <>
            {/* MAIN MINING WORKSPACE: Rock & Elixir Bottle */}
            <div className="grid grid-cols-3 gap-4 items-center">
              
              {/* Left: Mana / Energy Elixir Bottle */}
              <div className="col-span-1 bg-white border-2 border-sand p-3.5 rounded-3xl shadow-game-flat flex flex-col items-center justify-center text-center space-y-3.5 relative select-none">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Năng Lượng</span>
                
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
                  <p className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wide">⚡ Năng lượng</p>
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
                <div className="absolute bottom-2 text-[8px] font-bold text-gray-400 select-none">
                  {energy > 0 ? "👉 Click liên tục lên đá để đào kho báu!" : "❌ Hết năng lượng!"}
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
                <span>Ấn Pháp Anh Hùng (Hero Runes) 🛡️</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-bold">
                {/* Exercise Buff */}
                <div className={`border rounded-2xl p-2.5 flex flex-col items-center justify-between min-h-[120px] transition-all duration-300 ${
                  hasExerciseBuff 
                    ? "bg-rose-50 border-red-200 text-terracotta shadow-sm scale-100" 
                    : "bg-gray-50/70 border-gray-100 text-gray-400 opacity-80"
                }`}>
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-base">🏃</span>
                    <span className="font-extrabold text-[9px] tracking-tight text-forest-dark uppercase">Ấn Pháp Thể Lực</span>
                  </div>
                  
                  {/* Detailed Description */}
                  <div className="text-[7.5px] font-bold text-gray-500 space-y-0.5 my-1 text-left w-full pl-0.5">
                    <p className="text-rose-600 font-extrabold">• Hiệu quả: 💪 Cú Đập Sức Mạnh x2 xu (20%)</p>
                    <p className="text-gray-400 font-medium">• Rèn luyện: Tập thể dục 15 phút 🏃‍♂️</p>
                  </div>

                  <span className={`text-[7.5px] font-black px-2 py-0.5 rounded-full uppercase border select-none ${
                    hasExerciseBuff 
                      ? "bg-rose-100 border-red-200 text-terracotta animate-pulse" 
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {hasExerciseBuff ? "ĐANG BẬT 🔥" : "Khóa 🔒"}
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
                    <span className="font-extrabold text-[9px] tracking-tight text-forest-dark uppercase">Ấn Pháp Trí Tuệ</span>
                  </div>
                  
                  {/* Detailed Description */}
                  <div className="text-[7.5px] font-bold text-gray-500 space-y-0.5 my-1 text-left w-full pl-0.5">
                    <p className="text-blue-600 font-extrabold">• Hiệu quả: 👁️ Mắt Tinh Anh dễ tìm rương hiếm</p>
                    <p className="text-gray-400 font-medium">• Rèn luyện: Đọc sách tinh hoa 20 phút 📚</p>
                  </div>

                  <span className={`text-[7.5px] font-black px-2 py-0.5 rounded-full uppercase border select-none ${
                    hasReadingBuff 
                      ? "bg-blue-100 border-blue-200 text-sky-dark animate-pulse" 
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {hasReadingBuff ? "ĐANG BẬT 🔥" : "Khóa 🔒"}
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
                    <span className="font-extrabold text-[9px] tracking-tight text-forest-dark uppercase">Ấn Pháp Chuyên Cần</span>
                  </div>
                  
                  {/* Detailed Description */}
                  <div className="text-[7.5px] font-bold text-gray-500 space-y-0.5 my-1 text-left w-full pl-0.5">
                    <p className="text-amber-600 font-extrabold">• Hiệu quả: 🔥 Ngọn Lửa Kiên Trì tăng tỷ lệ bạc/vàng</p>
                    <p className="text-gray-400 font-medium">• Rèn luyện: Duy trì Streak ≥ 3 ngày 🔥</p>
                  </div>

                  <span className={`text-[7.5px] font-black px-2 py-0.5 rounded-full uppercase border select-none ${
                    hasStreakBuff 
                      ? "bg-amber-100 border-yellow-200 text-amber-dark animate-pulse" 
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {hasStreakBuff ? "ĐANG BẬT 🔥" : `Khóa 🔒 (${streak}/3 ngày)`}
                  </span>
                </div>
              </div>
              <p className="text-[8px] text-gray-400 font-medium leading-normal text-center pt-1 select-none">
                💡 <strong>Mẹo anh hùng:</strong> Chăm chỉ hoàn thành nhiệm vụ đọc sách, thể dục và duy trì chuỗi Streak mỗi ngày ngoài đời để kích hoạt các Ấn Pháp Anh Hùng cực mạnh khi đào mỏ!
              </p>
            </div>

            {/* LOG CONSOLE: Realtime actions display */}
            <div className="bg-sand-dark/15 border-2 border-sand p-3.5 rounded-2xl text-[10px] font-extrabold text-forest-dark italic leading-relaxed text-center select-none">
              {caveLog}
            </div>

            {/* MINING HISTORY LOG BOX */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">📦 Kho Báu Đã Đào Được</h3>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {miningHistory.length === 0 ? (
                  <div className="text-center py-6 text-[10.5px] text-gray-400 font-bold">
                    📭 Thùng gỗ rỗng! Hãy bắt đầu click đập đá để thu thập kho báu...
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
                          <span className="text-[7.5px] font-extrabold uppercase text-gray-400">
                            {new Date(item.timestamp).toLocaleTimeString("vi-VN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${badgeStyle}`}>
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
                <span>Túi Đồ Vật Phẩm Thú Cưng</span>
              </h3>
              
              <div className="grid grid-cols-3 gap-2 select-none">
                {/* Eggs section */}
                <div className="bg-sand-light border border-sand p-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 select-none">
                  <span className="text-[10px] font-black text-forest-dark uppercase tracking-wider">🥚 Trứng</span>
                  <div className="text-[10px] text-gray-500 font-bold space-y-0.5">
                    <p>Thường: <span className="text-forest font-black">{inventory?.eggs?.base || 0}</span></p>
                    <p>Sói: <span className="text-amber font-black">{inventory?.eggs?.wolf || 0}</span></p>
                    <p>Rồng: <span className="text-terracotta font-black">{inventory?.eggs?.dragon || 0}</span></p>
                  </div>
                </div>

                {/* Potions section */}
                <div className="bg-sand-light border border-sand p-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 select-none">
                  <span className="text-[10px] font-black text-forest-dark uppercase tracking-wider">🧪 Thuốc Ấp</span>
                  <div className="text-[10px] text-gray-500 font-bold space-y-0.5">
                    <p>🔥 Lửa: <span className="text-terracotta font-black">{inventory?.potions?.fire || 0}</span></p>
                    <p>❄️ Băng: <span className="text-sky-dark font-black">{inventory?.potions?.ice || 0}</span></p>
                    <p>✨ Phép: <span className="text-clay font-black">{inventory?.potions?.magic || 0}</span></p>
                  </div>
                </div>

                {/* Foods section */}
                <div className="bg-sand-light border border-sand p-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-1 select-none">
                  <span className="text-[10px] font-black text-forest-dark uppercase tracking-wider">🥩 Thức Ăn</span>
                  <div className="text-[10px] text-gray-500 font-bold space-y-0.5">
                    <p>🥩 Thịt: <span className="text-terracotta font-black">{inventory?.foods?.meat || 0}</span></p>
                    <p>🍬 Kẹo: <span className="text-amber font-black">{inventory?.foods?.candy || 0}</span></p>
                    <p>🌿 Lá: <span className="text-forest font-black">{inventory?.foods?.leaf || 0}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* HATCHING ZONE */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider flex items-center gap-1">
                <span>🧪</span>
                <span>Lò Ấp Trứng Ma Thuật</span>
              </h3>

              {isHatching ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 select-none">
                  <div className="text-5xl animate-bounce duration-500 filter drop-shadow">🥚</div>
                  <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden border border-sand">
                    <div className="h-full bg-forest animate-shimmer" style={{ width: "100%" }}></div>
                  </div>
                  <p className="text-[10.5px] font-black text-forest animate-pulse uppercase tracking-wider">Đang truyền ma thuật ấp trứng...</p>
                </div>
              ) : showHatchSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-forest-light/20 border border-forest/10 rounded-2xl p-4 select-none">
                  <span className="text-5xl animate-bounce">🎉</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-400 uppercase">Ấp nở thành công!</p>
                    <h4 className="text-base font-black text-forest-dark">{hatchedPetName}</h4>
                  </div>
                  <button
                    onClick={() => setShowHatchSuccess(false)}
                    className="bg-forest text-white font-extrabold text-[10px] py-1.5 px-5 rounded-full border border-forest active:scale-95 transition-transform"
                    type="button"
                  >
                    ĐÓNG
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
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">1. Chọn Trứng</label>
                      <select
                        value={selectedEgg || ""}
                        onChange={(e) => setSelectedEgg(e.target.value || null)}
                        className="w-full bg-sand-light border-2 border-sand text-xs font-extrabold text-forest-dark rounded-xl p-2.5 focus:outline-none"
                      >
                        <option value="">-- Chọn Trứng --</option>
                        {inventory?.eggs?.base > 0 && <option value="base">🥚 Trứng Thường ({inventory.eggs.base})</option>}
                        {inventory?.eggs?.wolf > 0 && <option value="wolf">🐺 Trứng Sói ({inventory.eggs.wolf})</option>}
                        {inventory?.eggs?.dragon > 0 && <option value="dragon">🐉 Trứng Rồng ({inventory.eggs.dragon})</option>}
                      </select>
                    </div>

                    {/* Select Potion */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">2. Chọn Thuốc Ấp</label>
                      <select
                        value={selectedPotion || ""}
                        onChange={(e) => setSelectedPotion(e.target.value || null)}
                        className="w-full bg-sand-light border-2 border-sand text-xs font-extrabold text-forest-dark rounded-xl p-2.5 focus:outline-none"
                      >
                        <option value="">-- Chọn Thuốc --</option>
                        {inventory?.potions?.fire > 0 && <option value="fire">🔥 Thuốc Lửa ({inventory.potions.fire})</option>}
                        {inventory?.potions?.ice > 0 && <option value="ice">❄️ Thuốc Băng ({inventory.potions.ice})</option>}
                        {inventory?.potions?.magic > 0 && <option value="magic">✨ Thuốc Phép ({inventory.potions.magic})</option>}
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
                    ẤP TRỨNG NGAY! 🧪✨
                  </button>
                </div>
              )}
            </div>

            {/* MY PETS SANCTUARY */}
            <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-4">
              <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider flex items-center gap-1">
                <span>🐾</span>
                <span>Thú Cưng Của {charName} ({pets?.length || 0})</span>
              </h3>

              {pets?.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-gray-400 font-bold uppercase tracking-wider select-none">
                  🍃 Chuồng trống! Hãy ấp trứng để mở khóa thú cưng đầu tiên...
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
                          <span className="absolute top-2 right-2 bg-forest text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {petRole === "mount" ? "🏇 Đang Cưỡi" : "🐾 Đồng Hành"}
                          </span>
                        )}

                        <div className="flex items-center gap-3">
                          {/* Pet Emoji / Avatar */}
                          <div className="w-12 h-12 bg-white border border-sand rounded-xl flex items-center justify-center text-3xl shadow-inner animate-float select-none">
                            {pet.emoji}
                          </div>

                          <div className="flex-grow min-w-0 select-none">
                            <h4 className="text-xs font-black text-forest-dark truncate uppercase tracking-wider">{pet.name}</h4>
                            <p className="text-[8.5px] font-extrabold text-gray-400 uppercase tracking-wide">
                              Hệ {pet.element === "fire" ? "🔥 Lửa" : pet.element === "ice" ? "❄️ Băng" : "✨ Thần Kỳ"} • {pet.type}
                            </p>
                          </div>
                        </div>

                        {/* Intimacy / Feed Progress bar */}
                        <div className="space-y-1 select-none">
                          <div className="flex items-center justify-between text-[8px] font-black text-gray-400 uppercase tracking-wider">
                            <span>Độ Thân Mật (Tiến hóa)</span>
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
                              <span className="text-[8px] font-black text-gray-400 uppercase select-none">Cho ăn:</span>
                              
                              <button
                                onClick={() => handleFeed(pet.id, "meat")}
                                disabled={inventory?.foods?.meat < 1}
                                className={`text-[9.5px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 active:scale-95 transition-transform ${
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
                                className={`text-[9.5px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 active:scale-95 transition-transform ${
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
                                className={`text-[9.5px] font-black px-2 py-1 rounded-lg border flex items-center gap-0.5 active:scale-95 transition-transform ${
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
                            <span className="text-[9px] font-black text-amber-dark uppercase tracking-widest animate-pulse flex-grow select-none">
                              👑 ĐÃ TIẾN HÓA THÀNH THÚ CƯỠI! 👑
                            </span>
                          )}

                          {/* Companion Setter */}
                          <div className="flex items-center gap-1.5 ml-auto select-none">
                            {!isActive ? (
                              pet.isMount ? (
                                <button
                                  onClick={() => setActiveCompanion("mount", pet.id)}
                                  className="bg-forest hover:bg-forest-dark text-white font-extrabold text-[8.5px] py-1 px-3.5 rounded-lg border border-forest active:scale-95 transition-transform uppercase tracking-wider shadow-sm"
                                  type="button"
                                >
                                  Cưỡi Lên 🏇
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActiveCompanion("pet", pet.id)}
                                  className="bg-white hover:bg-sand-light text-forest font-extrabold text-[8.5px] py-1 px-3.5 rounded-lg border border-sand active:scale-95 transition-transform uppercase tracking-wider"
                                  type="button"
                                >
                                  Đi Theo 🐾
                                </button>
                              )
                            ) : (
                              <button
                                onClick={() => setActiveCompanion(null, null)}
                                className="bg-sand hover:bg-sand-dark text-gray-500 font-extrabold text-[8.5px] py-1 px-3.5 rounded-lg border border-sand active:scale-95 transition-transform uppercase tracking-wider"
                                type="button"
                              >
                                Thu Hồi 🏠
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
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Phiêu Lưu</span>
        </button>

        <button
          onClick={() => router.push("/rewards")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🛒</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Đổi Quà</span>
        </button>

        <button
          onClick={() => {}}
          className="flex flex-col items-center p-2 text-forest-medium space-y-0.5"
        >
          <span className="text-xl">⛏️</span>
          <span className="text-[9px] font-black uppercase tracking-wider">Đào Mỏ</span>
        </button>

        <button
          onClick={() => router.push("/parent")}
          className="flex flex-col items-center p-2 text-gray-400 hover:text-forest space-y-0.5"
        >
          <span className="text-xl">🔑</span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">Bố Mẹ</span>
        </button>
      </div>
    </div>
  );
}
