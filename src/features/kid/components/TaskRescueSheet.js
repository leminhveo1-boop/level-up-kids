"use client";

import React, { useState } from "react";
import { CalendarClock, Clock, HeartHandshake, XCircle, ChevronLeft } from "lucide-react";
import { DROP_REASONS } from "@/lib/game/rescue";
import { stripEmoji } from "@/lib/text";

/**
 * B1.2 — "Thẻ Hỗ trợ" (rescue card): khi con chưa làm được 1 việc, thay vì để nó
 * đứng đó như "thất bại", con chọn 1 trong 4 lối GỠ VƯỚNG (không phạt, không xấu hổ):
 *   Để mai · Giờ khác hôm nay · Nhờ người lớn · Bỏ có lý do.
 *
 * Ngôn ngữ trung tính; 1 accent xanh; icon lucide (không emoji chrome).
 */

// Mốc giờ gợi ý cho "giờ khác hôm nay" — chỉ là nhãn (chưa nối lịch-giờ thật, xem rescue.js).
const LATER_SLOTS = ["Lát nữa", "Sau bữa tối", "Trước khi ngủ"];

const OptionRow = ({ Icon, label, hint, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full min-h-tap flex items-center gap-3 rounded-2xl border-2 border-sand bg-white px-4 py-3 text-left active:accent-soft-bg active:accent-border transition-colors"
  >
    <span className="w-9 h-9 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0 accent-text">
      <Icon size={18} />
    </span>
    <span className="min-w-0">
      <span className="block text-scale-sm font-bold text-forest-dark leading-snug">{label}</span>
      {hint ? <span className="block text-scale-2xs text-gray-500 mt-0.5">{hint}</span> : null}
    </span>
  </button>
);

export default function TaskRescueSheet({ task, onDefer, onHelp, onDrop, onClose }) {
  const [step, setStep] = useState("main"); // main | later | drop
  if (!task) return null;
  const title = stripEmoji(task.title);

  const pick = (fn) => {
    fn();
    onClose();
  };

  return (
    <div className="absolute inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div
        className="bg-sand-light w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2">
          {step !== "main" && (
            <button
              type="button"
              aria-label="Quay lại"
              onClick={() => setStep("main")}
              className="w-8 h-8 -ml-1 rounded-lg flex items-center justify-center text-gray-500 active:accent-soft-bg flex-shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h3 className="text-scale-base font-bold text-forest-dark leading-snug">
              {step === "drop" ? "Vì sao mình bỏ việc này?" : "Đang gỡ vướng"}
            </h3>
            <p className="text-scale-2xs text-gray-500 mt-0.5 line-clamp-1">{title}</p>
          </div>
        </div>

        {step === "main" && (
          <div className="space-y-2">
            <OptionRow Icon={CalendarClock} label="Để mai làm tiếp" hint="Không sao cả, mai mình làm" onClick={() => pick(() => onDefer("tomorrow"))} />
            <OptionRow Icon={Clock} label="Giờ khác hôm nay" hint="Chọn lúc hợp hơn" onClick={() => setStep("later")} />
            <OptionRow Icon={HeartHandshake} label="Nhờ người lớn" hint="Rủ bố mẹ làm cùng" onClick={() => pick(() => onHelp())} />
            <OptionRow Icon={XCircle} label="Bỏ việc này" hint="Có lý do chính đáng" onClick={() => setStep("drop")} />
          </div>
        )}

        {step === "later" && (
          <div className="space-y-2">
            {LATER_SLOTS.map((slot) => (
              <OptionRow key={slot} Icon={Clock} label={slot} onClick={() => pick(() => onDefer("later", slot))} />
            ))}
          </div>
        )}

        {step === "drop" && (
          <div className="space-y-2">
            {DROP_REASONS.map((r) => (
              <OptionRow key={r.id} Icon={XCircle} label={r.label} onClick={() => pick(() => onDrop(r.id))} />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-tap text-scale-xs font-bold text-gray-500 rounded-2xl active:bg-sand-light transition-colors"
        >
          Thôi, để mình làm tiếp
        </button>
      </div>
    </div>
  );
}
