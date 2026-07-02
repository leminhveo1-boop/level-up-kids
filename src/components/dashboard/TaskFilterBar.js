"use client";

import React from "react";

const FILTERS = [
  { key: "all", label: "Tất cả", activeCls: "bg-forest text-white border-forest" },
  { key: "discipline", label: "⚡ Kỷ luật", activeCls: "bg-amber text-white border-amber" },
  { key: "strength", label: "❤️ Thể lực", activeCls: "bg-terracotta text-white border-terracotta" },
  { key: "intellect", label: "🧠 Trí tuệ", activeCls: "bg-sky text-white border-sky" },
  { key: "creative", label: "🎨 Sáng tạo", activeCls: "bg-clay text-white border-clay" },
  { key: "help", label: "🤝 Giúp đỡ", activeCls: "bg-forest-medium text-white border-forest-medium" },
  { key: "connection", label: "💞 Kết nối", activeCls: "bg-terracotta text-white border-terracotta" },
];

/** Category filter pills above the task list. */
export default function TaskFilterBar({ taskFilter, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
      {FILTERS.map(({ key, label, activeCls }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-full border transition-all ${
            taskFilter === key ? activeCls : "bg-white text-gray-500 border-sand hover:border-gray-300"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
