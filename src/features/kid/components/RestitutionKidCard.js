"use client";

import React from "react";
import { useGame } from "@/context/GameState";
import { Wrench, Coins } from "lucide-react";

/**
 * §13 Mảnh B (kid) — con NHÌN đề nghị đền bù của bố mẹ và tự quyết.
 * Bất biến §13.4: xu chỉ chuyển khi con CHẠM "đồng ý" (2 bên đồng thuận), không
 * nút trừ-một-phía; khung "cùng sửa chữa", KHÔNG trừng phạt/đỏ báo động.
 * Ẩn hoàn toàn khi không có đề nghị pending nào.
 */
export default function RestitutionKidCard() {
  const { restitutions, agreeRestitution, dismissRestitution } = useGame();
  const pending = (restitutions || []).filter((r) => r.status === "pending");
  if (pending.length === 0) return null;

  return (
    <div className="bg-white border-2 border-sand rounded-2xl p-4 space-y-3 shadow-game-flat">
      <div className="flex items-center gap-1.5">
        <Wrench size={18} className="text-forest" />
        <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider">Bố mẹ đề nghị cùng sửa chữa</h3>
      </div>

      <div className="space-y-2.5">
        {pending.map((item) => (
          <div key={item.id} className="bg-sand-light rounded-xl p-3 space-y-2">
            <p className="text-[13px] font-bold text-forest-dark leading-snug">“{item.reason}”</p>
            <p className="text-[12px] font-bold text-gray-600 flex items-center gap-1">
              Góp <span className="text-coin font-black flex items-center gap-0.5">{item.amount} <Coins size={12} className="text-coin" fill="currentColor" /></span> vào Quỹ sửa chữa của nhà
            </p>
            <p className="text-[11px] font-medium text-gray-500">Đây là để sửa chữa cùng nhau, không phải bị phạt nhé.</p>
            <div className="flex gap-2 pt-0.5">
              <button
                onClick={() => agreeRestitution(item.id)}
                className="min-h-tap flex-grow bg-forest text-white text-[12px] font-black px-3 rounded-xl active:scale-95 transition-transform"
              >
                Mình đồng ý góp
              </button>
              <button
                onClick={() => dismissRestitution(item.id)}
                className="min-h-tap flex-shrink-0 bg-sand text-forest-dark text-[12px] font-bold px-3 rounded-xl active:scale-95 transition-transform"
              >
                Nói chuyện đã
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
