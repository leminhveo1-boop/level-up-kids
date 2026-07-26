"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

// Quân luật kid: 1 màu nhấn duy nhất — pill active dùng chung accent xanh,
// không đổi màu theo danh mục.
const FILTERS = [
  { key: "all", labelKey: "game.filter.all" },
  { key: "discipline", labelKey: "game.filter.discipline" },
  { key: "strength", labelKey: "game.filter.strength" },
  { key: "intellect", labelKey: "game.filter.intellect" },
  { key: "creative", labelKey: "game.filter.creative" },
  { key: "help", labelKey: "game.filter.help" },
  { key: "connection", labelKey: "game.filter.connection" },
];

/** Category filter pills above the task list. */
export default function TaskFilterBar({ taskFilter, onChange }) {
  const { t } = useLang();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
      {FILTERS.map(({ key, labelKey }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`min-h-tap px-3.5 rounded-full border transition-all whitespace-nowrap ${
            taskFilter === key ? "accent-bg accent-border" : "bg-white text-gray-500 border-sand hover:border-gray-300"
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
