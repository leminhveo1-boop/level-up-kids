"use client";

import React, { useEffect, useState } from "react";
import { useGame } from "@/context/GameState";
import { pickMoment } from "@/lib/game/moments";
import { track } from "@/lib/analytics";
import { Lightbulb, RotateCw, Check, X, ChevronDown } from "lucide-react";

/**
 * 🃏 Thẻ "Khoảnh khắc" — 1 thẻ/ngày trong tab Duyệt, chọn theo tín hiệu thật
 * (việc con bỏ nhiều đêm > painpoint bố mẹ khai > lộ trình đang chạy).
 * "Vì sao" gấp lại mặc định — tránh ngộp (phản hồi phụ huynh thật).
 * Nút Đúng/Chưa trúng chỉ bắn analytics — đây là kênh đo giọng thẻ với khách.
 */
export default function MomentCard() {
  const { tasks, journey, parentConfig } = useGame();
  const [offset, setOffset] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [voted, setVoted] = useState(false);

  const moment = pickMoment({ tasks, journey, parentConfig }, offset);

  useEffect(() => {
    if (moment) track("moment_shown", { id: moment.id, offset });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moment?.id]);

  if (!moment) return null;

  const vote = (verdict) => {
    track("moment_feedback", { id: moment.id, verdict });
    setVoted(true);
  };

  const nextCard = () => {
    setOffset((o) => o + 1);
    setShowWhy(false);
    setVoted(false);
  };

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-3 shadow-game-flat">
      <div className="flex items-center justify-between">
        <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
          <Lightbulb size={16} /> Khoảnh khắc
        </h3>
        <button
          onClick={nextCard}
          className="min-h-tap text-scale-2xs font-bold text-gray-400 flex items-center gap-1 px-2"
        >
          <RotateCw size={12} /> Thẻ khác
        </button>
      </div>

      <p className="text-scale-xs font-bold text-forest-dark leading-relaxed">{moment.situation}</p>

      <div className="space-y-1.5">
        {moment.nen.map((line, i) => (
          <p key={`n${i}`} className="text-scale-2xs text-gray-600 font-medium leading-relaxed flex gap-1.5">
            <Check size={13} className="text-forest flex-shrink-0 mt-0.5" />
            <span>{line}</span>
          </p>
        ))}
        {moment.tranh.map((line, i) => (
          <p key={`t${i}`} className="text-scale-2xs text-gray-400 font-medium leading-relaxed flex gap-1.5">
            <X size={13} className="text-terracotta flex-shrink-0 mt-0.5" />
            <span>{line}</span>
          </p>
        ))}
      </div>

      {showWhy ? (
        <p className="text-scale-2xs text-gray-500 font-medium leading-relaxed bg-sand-light border border-sand rounded-xl p-3">
          {moment.visao}
        </p>
      ) : (
        <button
          onClick={() => setShowWhy(true)}
          className="text-scale-2xs font-black text-forest flex items-center gap-1"
        >
          <ChevronDown size={12} /> Vì sao nên làm vậy?
        </button>
      )}

      {voted ? (
        <p className="text-scale-2xs font-bold text-gray-400">Cảm ơn bố mẹ — phản hồi giúp thẻ trúng hơn.</p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => vote("dung")}
            className="min-h-tap flex-1 bg-forest text-white text-scale-2xs font-black rounded-xl active:scale-95 transition-transform"
          >
            Đúng con tôi
          </button>
          <button
            onClick={() => vote("chua_trung")}
            className="min-h-tap flex-1 bg-white border border-sand text-gray-500 text-scale-2xs font-black rounded-xl active:scale-95 transition-transform"
          >
            Chưa trúng
          </button>
        </div>
      )}
    </div>
  );
}
