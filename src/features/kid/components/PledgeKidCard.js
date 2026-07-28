"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { pledgeEnabled } from "@/lib/game/age";
import { Target, Coins, Star, Check } from "lucide-react";

const PLEDGE_ERR = {
  INVALID_STAKE: "Nhập số cọc lớn hơn 0 nhé.",
  GOAL_REQUIRED: "Viết điều con muốn cam kết trước nha.",
  INSUFFICIENT: "Con chưa đủ để đặt cọc mức này.",
  AGE_NOT_ELIGIBLE: "",
  INVALID_CURRENCY: "",
};

/**
 * §13 Mảnh B (kid) — Cọc cam kết TỰ NGUYỆN cho 12–13t/teen (commitment device).
 * Bất biến §13.4: con tự chọn đặt (opt-in), mặc định Điểm ⭐ (tài nguyên game mềm);
 * xu thật chỉ khi con chủ động chọn; cọc lỡ → Quỹ chung nhà, KHÔNG về túi bố mẹ.
 * Ẩn hoàn toàn nếu chưa đủ tuổi (gate pledgeEnabled).
 */
export default function PledgeKidCard() {
  const { ageInfo, uiMode, points, heroCoins, pledges, createPledge, resolvePledge } = useGame();
  const [showForm, setShowForm] = useState(false);
  const [goal, setGoal] = useState("");
  const [stake, setStake] = useState(20);
  const [currency, setCurrency] = useState("points");
  const [error, setError] = useState("");

  if (!pledgeEnabled(ageInfo, uiMode)) return null;

  const openPledges = (pledges || []).filter((p) => p.status === "open");

  const handleCreate = () => {
    const outcome = createPledge({ goal, stake: Number(stake), currency });
    if (!outcome?.success) {
      setError(PLEDGE_ERR[outcome?.error] || "Chưa đặt được, thử lại nhé.");
      return;
    }
    setGoal("");
    setStake(currency === "points" ? 20 : 5);
    setError("");
    setShowForm(false);
  };

  return (
    <div className="bg-white border-2 border-sand rounded-2xl p-4 space-y-3 shadow-game-flat">
      <div className="flex items-center gap-1.5">
        <Target size={18} className="text-forest" />
        <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">Đặt cọc cam kết</h3>
        <span className="text-[10px] font-bold text-gray-500">(tuỳ chọn)</span>
      </div>

      {/* Cọc đang mở */}
      {openPledges.length > 0 && (
        <div className="space-y-2">
          {openPledges.map((p) => (
            <div key={p.id} className="bg-sand-light rounded-xl p-3 space-y-2">
              <p className="text-[13px] font-bold text-forest-dark leading-snug">“{p.goal}”</p>
              <p className="text-[12px] font-bold text-gray-600 flex items-center gap-1">
                Đã cọc
                <span className="text-coin font-black flex items-center gap-0.5">
                  {p.stake} {p.currency === "points" ? <Star size={12} className="text-coin" fill="currentColor" /> : <Coins size={12} className="text-coin" fill="currentColor" />}
                </span>
                {p.currency === "points" ? "Điểm" : "xu"}
              </p>
              <div className="flex gap-2 pt-0.5">
                <button
                  onClick={() => resolvePledge(p.id, true)}
                  className="min-h-tap flex-grow bg-forest text-white text-[12px] font-black px-3 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1"
                >
                  <Check size={14} /> Mình đã giữ được
                </button>
                <button
                  onClick={() => resolvePledge(p.id, false)}
                  className="min-h-tap flex-shrink-0 bg-sand text-forest-dark text-[12px] font-bold px-3 rounded-xl active:scale-95 transition-transform"
                >
                  Lần này mình lỡ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tạo cọc mới */}
      {showForm ? (
        <div className="space-y-2.5 border-t border-sand pt-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500">Mình cam kết:</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ví dụ: Tuần này ngày nào cũng học bài trước 8h"
              className="w-full text-[13px] font-bold text-forest-dark bg-sand-light rounded-xl px-3 py-2.5 border border-sand focus:border-forest outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500">Đặt cọc:</label>
            <div className="flex gap-2">
              <button
                onClick={() => { setCurrency("points"); if (currency !== "points") setStake(20); }}
                className={`flex-1 min-h-tap text-[12px] font-bold rounded-xl px-2 py-2 border-2 transition-colors flex items-center justify-center gap-1 ${currency === "points" ? "bg-forest-light border-forest text-forest" : "bg-white border-sand text-gray-500"}`}
              >
                <Star size={13} className="text-coin" fill="currentColor" /> Điểm
              </button>
              <button
                onClick={() => { setCurrency("coins"); if (currency !== "coins") setStake(5); }}
                className={`flex-1 min-h-tap text-[12px] font-bold rounded-xl px-2 py-2 border-2 transition-colors flex items-center justify-center gap-1 ${currency === "coins" ? "bg-forest-light border-forest text-forest" : "bg-white border-sand text-gray-500"}`}
              >
                <Coins size={13} className="text-coin" fill="currentColor" /> xu (thật)
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-20 text-[13px] font-black text-forest-dark bg-sand-light rounded-xl px-3 py-2 border border-sand focus:border-forest outline-none text-center"
              />
              <span className="text-[11px] font-bold text-gray-500">
                {currency === "points" ? "Điểm" : "xu"} · con đang có {currency === "points" ? points : heroCoins}
              </span>
            </div>
          </div>

          <p className="text-[11px] font-medium text-gray-500 leading-snug">
            Giữ được → nhận lại đủ. Lỡ → cọc vào <span className="font-bold text-forest">Quỹ chung nhà</span> (không về túi bố mẹ).
          </p>

          {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="min-h-tap flex-grow bg-forest text-white text-[12px] font-black px-3 rounded-xl active:scale-95 transition-transform"
            >
              Đặt cọc
            </button>
            <button
              onClick={() => { setShowForm(false); setError(""); }}
              className="min-h-tap flex-shrink-0 bg-sand text-forest-dark text-[12px] font-bold px-3 rounded-xl active:scale-95 transition-transform"
            >
              Thôi
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="min-h-tap w-full bg-forest-light text-forest text-[12px] font-black px-3 py-2.5 rounded-xl active:scale-95 transition-transform"
        >
          + Đặt một cọc cam kết
        </button>
      )}
    </div>
  );
}
