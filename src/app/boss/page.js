"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

export default function BossPage() {
  const router = useRouter();
  const { uiMode } = useAuth();
  const isTeen = uiMode === "teen";
  const {
    isLoaded,
    charName,
    bossHp,
    bossMaxHp,
    bossName,
    bossDefeated,
    bossChestOpened,
    bossCycleCount,
    openBossChest,
    tasks,
  } = useGame();

  const [isAttacking, setIsAttacking] = useState(false);
  const [lootResult, setLootResult] = useState(null);

  useEffect(() => {
    if (isLoaded && !charName) {
      router.push("/");
    }
  }, [isLoaded, charName, router]);

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
        <p className="mt-4 text-forest font-medium">Đang tải...</p>
      </div>
    );
  }

  // Count active tasks completed today to show child their combat contributions
  const activeHits = tasks.filter((t) => t.completed).length;

  const EGG_LABELS = { dragon: "Trứng Rồng 🐉", wolf: "Trứng Sói 🐺", base: "Trứng Thường 🥚" };

  const handleOpenChest = () => {
    const result = openBossChest();
    if (!result.success) return;
    playSoundEffect();
    confetti({
      particleCount: 150,
      spread: 80,
      colors: ["#D97706", "#4CAF50", "#E11D48"],
    });
    setLootResult(result.loot);
  };

  const playSoundEffect = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  };

  return (
    <div className="flex flex-col flex-grow relative pb-20">
      
      {/* Scrollable Content */}
      <div className="flex-grow p-5 space-y-6 overflow-y-auto flex flex-col justify-between">
        
        {/* Header back navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.push("/dashboard")}
            className="text-xs font-bold text-gray-500 hover:text-forest-dark uppercase tracking-wider flex items-center gap-1"
          >
            🌳 Dashboard
          </button>
          <span className="text-xs font-black text-terracotta">{isTeen ? "🎯 THỬ THÁCH TUẦN" : "👾 BOSS THỬ THÁCH TUẦN"}</span>
        </div>

        {/* BATTLEGROUND CONTAINER */}
        <div className="flex-grow flex flex-col items-center justify-center py-6 space-y-6">
          
          {bossDefeated ? (
            /* Defeated state - Treasure Chest Unlocked! */
            <div className="text-center space-y-6 animate-float">
              <div className="w-44 h-44 bg-amber-50 border-4 border-amber rounded-full flex items-center justify-center shadow-game-amber mx-auto">
                <svg className="w-28 h-28 text-amber animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 10h20v10H2V10z" fill="#FEF3C7" />
                  <path d="M2 10s4-6 10-6 10 6 10 6" fill="#D97706" />
                  <circle cx="12" cy="10" r="2.5" fill="#FAF8F5" />
                  <path d="M12 2v4" stroke="#B45309" strokeWidth="2" />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-forest uppercase tracking-tight">
                  {isTeen ? "HOÀN THÀNH THỬ THÁCH TUẦN!" : "TIÊU DIỆT BOSS THÀNH CÔNG!"}
                </h2>
                <p className="text-xs font-bold text-gray-500 max-w-xs mx-auto">
                  {isTeen
                    ? `Tuyệt vời! Bạn đã hoàn thành thử thách tuần này. ${bossChestOpened ? "Phần thưởng đã nhận — hẹn thử thách tuần sau nhé!" : "Chạm để nhận phần thưởng thật!"}`
                    : `Tuyệt vời! Con đã đánh bại ${bossName} tuần này. ${bossChestOpened ? "Rương đã mở — hẹn boss tuần sau nhé!" : "Hãy chạm vào rương báu để nhận phần thưởng thật!"}`}
                </p>
              </div>

              {lootResult ? (
                <div className="bg-amber-50 border-2 border-amber rounded-2xl p-4 max-w-xs mx-auto space-y-1">
                  <p className="text-sm font-black text-amber-800">+{lootResult.coins} 🪙 Hero Coins</p>
                  {lootResult.egg && (
                    <p className="text-sm font-black text-amber-800">+1 {EGG_LABELS[lootResult.egg]}</p>
                  )}
                </div>
              ) : bossChestOpened ? (
                <div className="bg-white border-2 border-sand rounded-2xl p-4 max-w-xs mx-auto">
                  <p className="text-xs font-bold text-gray-400">
                    {isTeen
                      ? `📦 Phần thưởng chu kỳ ${bossCycleCount || 1} đã nhận rồi. Thử thách mới xuất hiện tuần sau!`
                      : `📦 Rương chu kỳ ${bossCycleCount || 1} đã mở rồi. Boss mới sẽ xuất hiện tuần sau!`}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleOpenChest}
                  className="bg-amber text-sand-light font-black text-sm py-4 px-8 rounded-2xl border-2 border-amber shadow-game-amber btn-game-transition active:shadow-game-pressed"
                >
                  {isTeen ? "NHẬN THƯỞNG 🪙" : "MỞ RƯƠNG KHO BÁU 🪙"}
                </button>
              )}
            </div>
          ) : (
            /* Active Battle State */
            <div className="text-center space-y-6 w-full">
              
              {/* Boss Title & Attributes */}
              <div className="space-y-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-terracotta-light text-terracotta border border-terracotta/30 uppercase">
                  {isTeen ? `THỬ THÁCH TUẦN · CHU KỲ #${bossCycleCount || 1}` : `BOSS TUẦN NÀY · CHU KỲ #${bossCycleCount || 1}`}
                </span>
                <h2 className="text-lg font-black text-forest-dark uppercase tracking-tight">{bossName}</h2>
              </div>

              {/* Boss Character Visual (Cute Sleeping Sloth SVG) */}
              <div className={`w-40 h-40 bg-sand border-4 border-sand-dark rounded-full flex items-center justify-center shadow-game-flat mx-auto transition-transform ${
                isAttacking ? "scale-90 border-terracotta" : "scale-100"
              }`}>
                <svg className="w-24 h-24 text-forest-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Sleeping face */}
                  <circle cx="12" cy="12" r="9" fill="#E4DCCF" stroke="#1B2E1E" strokeWidth="2" />
                  <path d="M8 13s1.5 1.5 3 0M13 13s1.5 1.5 3 0" stroke="#1B2E1E" strokeWidth="2" strokeLinecap="round" />
                  {/* Zzz floating */}
                  <text x="16" y="8" fill="#D97706" fontSize="5" fontWeight="bold" className="animate-pulse">Z</text>
                  <text x="18" y="5" fill="#D97706" fontSize="4" fontWeight="bold" className="animate-pulse">z</text>
                </svg>
              </div>

              {/* Boss Health Bar */}
              <div className="space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between items-center text-xs font-black text-gray-500">
                  <span>{isTeen ? "TIẾN ĐỘ THỬ THÁCH" : "MÁU BOSS (HP)"}</span>
                  <span className="text-terracotta">{bossHp} / {bossMaxHp} {isTeen ? "" : "HP"}</span>
                </div>
                
                <div className="w-full bg-sand h-4 rounded-full border-2 border-sand overflow-hidden shadow-inner">
                  <div 
                    className="bg-terracotta h-full transition-all duration-300"
                    style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Battle Info / Combat Instructions */}
              <div className="bg-white border-2 border-sand p-4 rounded-2xl shadow-game-flat text-xs font-bold text-gray-500 leading-normal max-w-xs mx-auto space-y-2">
                {isTeen ? (
                  <>
                    <div className="text-forest-dark">
                      🎯 Hôm nay bạn đã hoàn thành <strong className="text-terracotta text-sm">{activeHits} nhiệm vụ</strong>!
                    </div>
                    <p className="text-[10px]">
                      Mỗi nhiệm vụ hoàn thành sẽ tự động cộng tiến độ cho thử thách tuần này! Kiên trì dọn dẹp, đọc sách, học bài để hoàn thành mục tiêu tuần nhé!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-forest-dark">
                      ⚔️ Hôm nay con đã tung ra <strong className="text-terracotta text-sm">{activeHits} đòn đánh</strong>!
                    </div>
                    <p className="text-[10px]">
                      Mỗi khi con tích chọn hoàn thành nhiệm vụ ngoài đời thực, con sẽ tự động tấn công giảm máu Boss tuần này! Hãy kiên trì dọn dẹp, đọc sách, học bài để tiêu diệt Thần Lười Biếng nhé!
                    </p>
                  </>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* BOTTOM TAB NAVIGATION */}
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
          <span className="text-xl">👾</span>
          <span className="text-[9px] font-black uppercase tracking-wider">{isTeen ? "Thử Thách" : "Boss Tuần"}</span>
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
