"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { COIN_RATE_VND } from "@/lib/game/constants";
import { budgetCoinsFor, suggestAllowanceSplit } from "@/lib/game/economy";
import Collapsible from "@/ui/Collapsible";
import { Wallet, Wand2, Check, X } from "lucide-react";

const PERIOD_LABEL = { week: "tuần", month: "tháng" };

/**
 * Pha E §8.1 — "Quỹ tiêu vặt của con": bố mẹ đặt quỹ VNĐ/chu kỳ (trần KIẾM xu),
 * xem đã phát bao nhiêu, và 1-chạm auto-chia quỹ vào nhiệm vụ (§4.5, xem trước rồi áp).
 */
export default function AllowanceCard({ showFlash }) {
  const { parentConfig, setParentConfig, allowance, tasks, applyAllowanceSplit } = useGame();
  const period = parentConfig?.allowancePeriod || "week";
  const budgetVnd = parentConfig?.allowanceBudgetVnd || 0;
  const budgetCoins = budgetCoinsFor(parentConfig);
  const earned = allowance?.earnedCoins || 0;
  const pct = budgetCoins > 0 ? Math.min(100, Math.round((earned / budgetCoins) * 100)) : 0;
  const periodWord = PERIOD_LABEL[period];

  const [preview, setPreview] = useState(null); // [{id, title, coinReward}] | null

  const setBudget = (vnd) =>
    setParentConfig((cfg) => ({ ...(cfg || {}), allowanceBudgetVnd: Math.max(0, parseInt(vnd) || 0) }));
  const setPeriod = (p) => setParentConfig((cfg) => ({ ...(cfg || {}), allowancePeriod: p }));

  const openPreview = () => {
    const splits = suggestAllowanceSplit(tasks, parentConfig);
    const byId = new Map(splits.map((s) => [s.id, s.coinReward]));
    setPreview(tasks.map((t) => ({ id: t.id, title: t.title, coinReward: byId.get(t.id) || 0 })));
  };

  const applyPreview = () => {
    applyAllowanceSplit(preview.map((p) => ({ id: p.id, coinReward: p.coinReward })));
    setPreview(null);
    showFlash?.("Đã chia quỹ vào nhiệm vụ! 🪙");
  };

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
      <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
        <Wallet size={18} className="text-amber-dark" /> Quỹ tiêu vặt của con
      </h3>

      {/* Số tiền quỹ + chu kỳ */}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-scale-2xs font-bold text-gray-500 space-y-1">
          <span>Quỹ mỗi {periodWord} (VNĐ)</span>
          <input
            type="number"
            inputMode="numeric"
            value={budgetVnd || ""}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0 = chưa bật"
            className="w-full min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
            min={0}
          />
        </label>
        <div className="text-scale-2xs font-bold text-gray-500 space-y-1">
          <span>Chu kỳ nạp lại</span>
          <div className="grid grid-cols-2 gap-1.5">
            {["week", "month"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`min-h-tap rounded-xl text-scale-2xs font-black border transition-colors ${
                  period === p ? "border-forest bg-forest-light/20 text-forest-dark" : "border-sand text-gray-500"
                }`}
              >
                {p === "week" ? "Tuần" : "Tháng"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {budgetCoins > 0 ? (
        <>
          <p className="text-scale-2xs font-bold text-gray-500">
            = <span className="text-coin font-black">{budgetCoins} 🪙</span> / {periodWord} (1🪙 ={" "}
            {COIN_RATE_VND.toLocaleString("vi-VN")}₫)
          </p>

          {/* Tiến trình đã phát trong chu kỳ */}
          <div className="space-y-1">
            <div className="flex justify-between text-scale-2xs font-bold text-gray-500">
              <span>Đã phát {periodWord} này</span>
              <span className="text-coin font-black">{earned} / {budgetCoins} 🪙</span>
            </div>
            <div className="h-2 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <p className="text-scale-2xs text-gray-500 font-medium leading-relaxed">
            Con chỉ kiếm được tối đa số này mỗi {periodWord}. Hết quỹ, việc tốt vẫn tính Điểm ⭐.
          </p>

          {/* Auto-chia quỹ */}
          {preview ? (
            <div className="bg-sand-light border border-sand rounded-xl p-3 space-y-2">
              <p className="text-scale-2xs font-black text-forest-dark">Gợi ý xu mỗi nhiệm vụ (sửa được sau khi áp):</p>
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {preview.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-scale-2xs">
                    <span className="flex-grow font-bold text-forest-dark truncate">{p.title}</span>
                    <span className="font-black text-coin flex-shrink-0">+{p.coinReward} 🪙</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyPreview}
                  className="flex-grow min-h-tap bg-forest text-white text-scale-xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <Check size={16} /> Áp dụng
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="min-w-tap min-h-tap bg-sand text-gray-600 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                  aria-label="Huỷ"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openPreview}
              className="w-full min-h-tap bg-forest-light/30 border border-forest/30 text-forest-dark text-scale-xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
            >
              <Wand2 size={16} /> Tự động chia quỹ vào nhiệm vụ
            </button>
          )}
        </>
      ) : (
        <Collapsible summary="Lương xu để làm gì?" tone="quiet">
          <p className="text-scale-2xs text-gray-500 font-medium leading-relaxed">
            Đặt một số tiền quỹ để con kiếm <span className="text-coin font-bold">Xu 🪙</span> đổi quà đời thực —
            minh bạch, có trần mỗi {periodWord}. Để trống (0) nghĩa là chưa bật; con vẫn chơi bằng Điểm ⭐ như thường.
          </p>
        </Collapsible>
      )}
    </div>
  );
}
