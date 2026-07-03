"use client";

import React from "react";
import { useLang } from "@/context/LanguageContext";

const FILTERS = [
  { key: "all", labelKey: "game.filter.all", activeCls: "bg-forest text-white border-forest" },
  { key: "discipline", labelKey: "game.filter.discipline", activeCls: "bg-amber text-white border-amber" },
  { key: "strength", labelKey: "game.filter.strength", activeCls: "bg-terracotta text-white border-terracotta" },
  { key: "intellect", labelKey: "game.filter.intellect", activeCls: "bg-sky text-white border-sky" },
  { key: "creative", labelKey: "game.filter.creative", activeCls: "bg-clay text-white border-clay" },
  { key: "help", labelKey: "game.filter.help", activeCls: "bg-forest-medium text-white border-forest-medium" },
  { key: "connection", labelKey: "game.filter.connection", activeCls: "bg-terracotta text-white border-terracotta" },
];

/** Category filter pills above the task list. */
export default function TaskFilterBar({ taskFilter, onChange }) {
  const { t } = useLang();

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] font-bold">
      {FILTERS.map(({ key, labelKey, activeCls }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-full border transition-all ${
            taskFilter === key ? activeCls : "bg-white text-gray-500 border-sand hover:border-gray-300"
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
}
