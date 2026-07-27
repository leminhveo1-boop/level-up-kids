"use client";

import React from "react";
import { useGame } from "@/context/GameState";
import { buildParentInsight } from "@/lib/game/insight";
import { CalendarCheck, Sprout } from "lucide-react";

/**
 * C2.2 — Insight điểm-mạnh ở đầu tab Duyệt (roadmap 2a). Thay "bảng-số phán xét"
 * bằng: (1) card "Ngày mai đã sẵn sàng · N thường · M quan trọng", (2) 1–2 quan
 * sát điểm-mạnh gợi bố mẹ khen. Mọi logic ánh xạ/ẩn-% nằm ở lib/game/insight.js;
 * component này chỉ render. Quân luật parent: card trắng, viền hairline, chữ ≤700,
 * forest chỉ điểm nhấn nhỏ. Không hiện gì khi không có tín hiệu (fallback vẫn có
 * 1 câu nâng đỡ nên luôn có insight — nhưng ẩn card ngày-mai nếu chưa lập kế hoạch).
 */
export default function InsightCard() {
  const { charName, uiMode, history, streak, tomorrowPlan } = useGame();

  const { tomorrow, insights } = buildParentInsight({
    charName,
    uiMode,
    history,
    streak,
    tomorrowPlan,
  });

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-3 shadow-game-flat">
      {tomorrow && (
        <div className="flex items-start gap-2.5">
          <CalendarCheck size={16} className="text-forest flex-shrink-0 mt-0.5" />
          <p className="text-scale-xs font-bold text-forest-dark leading-snug">{tomorrow.text}</p>
        </div>
      )}

      <div className="space-y-2">
        {insights.map((text, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <Sprout size={15} className="text-forest-medium flex-shrink-0 mt-0.5" />
            <p className="text-scale-xs font-medium text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
