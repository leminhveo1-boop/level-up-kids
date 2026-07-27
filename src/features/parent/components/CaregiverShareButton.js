"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { Share2, Check } from "lucide-react";
import { buildTodayScheduleText } from "@/lib/game/caregiverShare";

/**
 * C2.4 — Nút "Chia sẻ lịch hôm nay cho ông bà".
 *
 * Người nhắc trẻ khung chiều thường là ông bà, KHÔNG dùng app. Nút này dựng một
 * đoạn text thô (Zalo/SMS) rồi bung navigator.share; máy nào không hỗ trợ thì
 * chép vào clipboard. Ông bà chỉ đọc & nhắc — trẻ vẫn tự tick trong app.
 *
 * Subtle, ít chữ — tôn quân luật phòng bố mẹ (phụ huynh thật chê "ngộp").
 */
export default function CaregiverShareButton() {
  const { charName, tasks } = useGame();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const dateLabel = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const text = buildTodayScheduleText({ charName, tasks, dateLabel });

    // Ưu tiên share sheet gốc (mở thẳng Zalo/SMS trên điện thoại); fallback clipboard.
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      // người dùng huỷ share sheet — không coi là lỗi, thử clipboard bên dưới
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // môi trường không có clipboard (hiếm) — im lặng, không chặn luồng
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full min-h-tap flex items-center justify-center gap-2 bg-white border border-sand rounded-xl px-4 py-3 text-scale-xs font-bold text-gray-500 shadow-game-flat active:scale-[0.99] transition-transform"
    >
      {copied ? (
        <>
          <Check size={16} className="text-forest" /> Đã chép — dán vào Zalo cho ông bà
        </>
      ) : (
        <>
          <Share2 size={16} /> Chia sẻ lịch hôm nay cho ông bà
        </>
      )}
    </button>
  );
}
