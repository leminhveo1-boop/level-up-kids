"use client";

import React from "react";

const STAT_CELLS = [
  { key: "strength", emoji: "❤️", label: "Thể Lực", cellCls: "bg-rose-50 border-red-100", valueCls: "text-terracotta" },
  { key: "intellect", emoji: "🧠", label: "Trí Tuệ", cellCls: "bg-blue-50 border-blue-100", valueCls: "text-sky" },
  { key: "discipline", emoji: "⚡", label: "Kỷ Luật", cellCls: "bg-amber-50 border-yellow-100", valueCls: "text-amber" },
  { key: "creative", emoji: "🎨", label: "Sáng Tạo", cellCls: "bg-purple-50 border-purple-100", valueCls: "text-clay" },
  { key: "help", emoji: "🤝", label: "Giúp Đỡ", cellCls: "bg-green-50 border-green-100", valueCls: "text-forest-medium" },
];

/** ⚔️ 5 Stars of Power grid. */
export default function StatsGrid({ stats }) {
  return (
    <div className="bg-white border-2 border-sand p-4 rounded-3xl shadow-game-flat space-y-3">
      <h3 className="text-xs font-black text-forest-dark uppercase tracking-wider text-center">⚔️ 5 CHỈ SỐ SỨC MẠNH ANH HÙNG</h3>

      <div className="grid grid-cols-5 gap-1.5">
        {STAT_CELLS.map(({ key, emoji, label, cellCls, valueCls }) => (
          <div key={key} className={`${cellCls} border rounded-xl p-2 flex flex-col items-center justify-center text-center space-y-1`}>
            <span className="text-base">{emoji}</span>
            <span className="text-[9px] font-bold text-gray-500">{label}</span>
            <span className={`text-xs font-black ${valueCls}`}>{stats[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
