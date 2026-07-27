"use client";

import React from "react";
import { Smile, Meh, Frown, Check } from "lucide-react";
import Card from "@/ui/Card";
import { useGame } from "@/context/GameState";

/**
 * B1.1 — Nhìn nhận cuối ngày: 1 chạm, 3 mức cảm nhận, KHÔNG ô text (trẻ nhỏ chưa
 * viết phản tư được — self-reflection ép thành ảo tưởng). App tự suy tín hiệu trễ
 * từ dữ liệu; ở đây chỉ hỏi "hôm nay thế nào". Tín hiệu `reviewed` nuôi reviewedRate
 * của scaffolding (2→3).
 *
 * Progressive disclosure (T1): lớp Review mở từ Scaffolding Level 2 — cùng nhịp
 * với WOOP entry của TomorrowPlanner. Hiện khi con đã xong hết việc trong ngày.
 *
 * ponytail: trigger dựa "xong hết việc" (không có đồng hồ phiên) — trần: ngày làm
 * dở không được hỏi. Nâng cấp: mốc giờ tối khi có session-clock (D3.1).
 */
const MOODS = [
  { id: "good", Icon: Smile, label: "Tốt" },
  { id: "ok", Icon: Meh, label: "Ổn" },
  { id: "tough", Icon: Frown, label: "Hơi khó" },
];

export default function DailyReviewCard({ allTasksCompleted = false }) {
  const { scaffoldLevel = 1, todayReview, submitDailyReview } = useGame();

  // Lớp Review mở từ Level 2; chỉ hỏi khi đã xong việc trong ngày.
  if (scaffoldLevel < 2 || !allTasksCompleted) return null;

  if (todayReview) {
    const picked = MOODS.find((m) => m.id === todayReview.mood);
    return (
      <Card className="accent-border flex items-center gap-3 py-3">
        <span className="w-9 h-9 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0">
          <Check size={18} />
        </span>
        <p className="text-scale-xs font-semibold text-forest-dark">
          Đã ghi cảm nhận hôm nay{picked ? ` — ${picked.label.toLowerCase()}` : ""}. Nghỉ ngơi nhé!
        </p>
      </Card>
    );
  }

  return (
    <Card className="accent-border space-y-3">
      <div>
        <h3 className="text-scale-sm font-bold text-forest-dark leading-snug">
          Hôm nay của con thế nào?
        </h3>
        <p className="text-scale-2xs text-gray-500 mt-1">Chạm 1 mặt — không cần viết gì cả.</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map(({ id, Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => submitDailyReview(id)}
            className="min-h-tap flex flex-col items-center justify-center gap-1 rounded-xl border border-sand bg-white py-3 text-forest-dark transition-colors active:accent-soft-bg active:accent-border"
          >
            <Icon size={26} />
            <span className="text-scale-2xs font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
