"use client";

import React, { useState } from "react";
import { ChevronDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { buildScoreboard, GROUP_KEYS } from "@/lib/game/scoreboard";

/**
 * D3.3 — Scoreboard "So với chính mình" (kid + teen).
 * SPEC docs/SPEC_D3_2_SCOREBOARD.md §8. Chạm-mở (mặc định đóng, giảm mật độ).
 *
 * Quân luật kid: chữ nâu ấm (class cũ tự remap), 1 accent xanh, KHÔNG %, đỏ cấm ở
 * đây (trend "down" KHÔNG phải lỗi → dùng chữ ấm, không đỏ). Tự-quy-chiếu tuyệt đối.
 */

// Emoji nhận diện vùng = game-data (đồng bộ StatsGrid), không phải icon chrome.
const GROUP_EMOJI = { strength: "❤️", intellect: "🧠", discipline: "⚡", creative: "🎨", help: "🤝" };

function GroupRow({ g }) {
  let TrendIcon = null;
  let trendCls = "text-gray-500";
  let trendText = "";
  if (g.trend === "up") {
    TrendIcon = TrendingUp;
    trendCls = "accent-text";
    trendText = `hơn tuần trước ${g.trendDelta} việc`;
  } else if (g.trend === "down") {
    TrendIcon = TrendingDown; // chữ ấm, KHÔNG đỏ — chậm một nhịp không phải thất bại
    trendText = "chậm hơn tuần trước một nhịp";
  } else if (g.trend === "flat") {
    TrendIcon = Minus;
    trendText = "đều như tuần trước";
  }

  return (
    <div className="bg-sand-light border border-sand rounded-xl p-2.5 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{GROUP_EMOJI[g.key]}</span>
          <span className="text-scale-xs font-bold text-forest-dark truncate">{g.label}</span>
        </span>
        <span className="text-scale-2xs font-semibold text-gray-500 flex-shrink-0">
          {g.effort} việc · giữ nhịp {g.activeDays} ngày
        </span>
      </div>

      {/* Phong độ (Độ bền Khiên) — thước game bền, không phải % hoàn thành */}
      <div className="flex items-center gap-2">
        <span className="text-scale-2xs font-semibold text-gray-400 flex-shrink-0">Phong độ</span>
        <span className="h-1.5 flex-1 rounded-full bg-sand overflow-hidden">
          <span className="block h-full accent-bg rounded-full" style={{ width: `${Math.round(g.form * 100)}%` }} />
        </span>
      </div>

      {TrendIcon && (
        <p className={`flex items-center gap-1 text-scale-2xs font-semibold ${trendCls}`}>
          <TrendIcon size={12} className="flex-shrink-0" />
          {trendText}
        </p>
      )}
    </div>
  );
}

export default function ScoreboardPanel({ history, uiMode }) {
  const [open, setOpen] = useState(false);
  const sb = buildScoreboard(history, { uiMode });

  return (
    <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full min-h-tap flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
      >
        <span className="text-xs font-black text-forest-dark uppercase tracking-wider">So với chính mình</span>
        <ChevronDown size={16} className={`accent-text transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        (!sb.hasData ? (
          <p className="text-scale-xs text-gray-500 text-center font-semibold">
            Làm thêm vài ngày nữa, hành trình của con sẽ hiện ở đây 🌱
          </p>
        ) : (
          <div className="space-y-2">
            {GROUP_KEYS.map((k) => (
              <GroupRow key={k} g={sb.groups[k]} />
            ))}
            <p className="text-scale-2xs text-gray-400 text-center pt-0.5">
              Chỉ so với chính con tuần trước — không so với ai khác 💛
            </p>
          </div>
        ))}
    </div>
  );
}
