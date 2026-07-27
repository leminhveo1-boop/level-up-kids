"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useGame } from "@/context/GameState";

/**
 * GĐ0 A0.5 — Thẻ "mở lớp năng lực mới" (đề xuất phụ huynh).
 * Chỉ hiện khi hệ thống thấy bé đã sẵn sàng THĂNG level (scaffoldPendingLevel).
 * THĂNG là quyết định của phụ huynh (không tự nhảy); GIÁNG thì auto im lặng nên
 * không có thẻ tương ứng. "Để sau" chỉ ẩn trong phiên — lần mở sau vẫn hiện lại
 * (không nhắc gắt, nhưng không mất đề xuất).
 */
const LEVEL_COPY = {
  2: {
    name: "Con chọn, app gợi ý",
    detail: "Bé sẽ tự chọn việc và có ô nhìn nhận nhẹ cuối ngày, thay vì chỉ tick theo app.",
  },
  3: {
    name: "Con tự lập kế hoạch",
    detail: "Bé tự sắp kế hoạch trọn ngày, phân biệt việc quan trọng và việc gấp.",
  },
};

export default function ScaffoldUnlockCard() {
  const { scaffoldPendingLevel, confirmScaffoldLevelUp } = useGame();
  const [dismissed, setDismissed] = useState(false);

  const copy = LEVEL_COPY[scaffoldPendingLevel];
  if (!copy || dismissed) return null;

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-sand-light flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-forest-dark" />
        </div>
        <div className="min-w-0">
          <p className="text-scale-sm font-bold text-forest-dark leading-snug">
            Bé đã sẵn sàng cho lớp năng lực mới
          </p>
          <p className="text-scale-2xs text-gray-500 mt-0.5">
            {copy.name} — {copy.detail}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="min-h-tap px-3 rounded-lg text-scale-2xs font-bold text-gray-500 hover:text-forest-dark"
        >
          Để sau
        </button>
        <button
          type="button"
          onClick={() => confirmScaffoldLevelUp()}
          className="flex-1 min-h-tap rounded-lg bg-forest text-white text-scale-2xs font-bold flex items-center justify-center gap-1.5"
        >
          Mở lớp mới <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
