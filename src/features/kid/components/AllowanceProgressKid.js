"use client";

import React from "react";
import { useGame } from "@/context/GameState";
import { budgetCoinsFor } from "@/lib/game/economy";
import { stripEmoji } from "@/lib/text";
import { Coins, PartyPopper } from "lucide-react";

/**
 * Pha E §8.2 — "Quỹ của con": trả lời "con kiếm xu thế nào".
 * Hiện tiến trình X/Y xu chu kỳ + bảng nhiệm vụ có xu. Chạm trần = lời khen (không phải lỗi).
 * Ẩn hoàn toàn khi bố mẹ chưa bật lương (budgetCoins = 0).
 */
export default function AllowanceProgressKid() {
  const { parentConfig, allowance, tasks } = useGame();
  const budgetCoins = budgetCoinsFor(parentConfig);
  if (budgetCoins <= 0) return null;

  const period = parentConfig?.allowancePeriod || "week";
  const periodWord = period === "month" ? "tháng" : "tuần";
  const earned = allowance?.earnedCoins || 0;
  const remaining = Math.max(0, budgetCoins - earned);
  const pct = Math.min(100, Math.round((earned / budgetCoins) * 100));
  const atCap = remaining === 0;
  const coinTasks = (tasks || []).filter((t) => (t.coinReward || 0) > 0);

  return (
    <div className="bg-white border-2 border-amber/40 rounded-2xl p-4 space-y-3 shadow-game-flat">
      <div className="flex items-center gap-1.5">
        <Coins size={18} className="text-coin" fill="currentColor" />
        <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">Quỹ tiêu vặt của con</h3>
      </div>

      {/* Tiến trình chu kỳ */}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-bold text-gray-500">{periodWord === "tháng" ? "Tháng" : "Tuần"} này con kiếm được</span>
          <span className="text-sm font-black text-coin">{earned} / {budgetCoins} 🪙</span>
        </div>
        <div className="h-2.5 bg-sand rounded-full overflow-hidden">
          <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {atCap ? (
          <p className="flex items-center gap-1.5 text-[11px] font-black text-forest">
            <PartyPopper size={14} /> Con đạt quỹ {periodWord} này rồi, giỏi lắm! {periodWord === "tháng" ? "Tháng" : "Tuần"} sau lại có quỹ mới nhé 🎉
          </p>
        ) : (
          <p className="text-[11px] font-bold text-gray-500">Còn <span className="text-coin font-black">{remaining} 🪙</span> nữa là đạt quỹ.</p>
        )}
      </div>

      {/* Làm gì để có xu? */}
      {coinTasks.length > 0 && !atCap && (
        <div className="border-t border-sand pt-2.5 space-y-1.5">
          <p className="text-[11px] font-black text-gray-500">Làm gì để có xu?</p>
          <div className="space-y-1">
            {coinTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-[11px]">
                <span className="flex-grow font-bold text-forest-dark truncate">{stripEmoji(t.title)}</span>
                <span className="flex-shrink-0 font-black text-coin flex items-center gap-0.5">
                  +{t.coinReward} <Coins size={12} fill="currentColor" /> mỗi lần
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
