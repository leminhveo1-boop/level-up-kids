"use client";

import React from "react";
import { JOURNEY_PAINPOINTS, INTAKE_MAX_PAINPOINTS } from "@/lib/game/journeys";

/**
 * Màn "chẩn đoán" 30 giây: bố mẹ tick điều đang đau đầu (tối đa 3)
 * → app kê lộ trình. Dùng chung cho onboarding và phòng bố mẹ.
 * @param {{ selected: string[], onChange: (next: string[]) => void }} props
 */
export default function PainpointPicker({ selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((p) => p !== id));
      return;
    }
    if (selected.length >= INTAKE_MAX_PAINPOINTS) return;
    onChange([...selected, id]);
  };

  const isFull = selected.length >= INTAKE_MAX_PAINPOINTS;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
          Điều đang đau đầu nhất với con?
        </p>
        <span className="text-[10px] font-bold text-gray-400">
          {selected.length}/{INTAKE_MAX_PAINPOINTS}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {JOURNEY_PAINPOINTS.map((p) => {
          const on = selected.includes(p.id);
          const blocked = !on && isFull;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              disabled={blocked}
              aria-pressed={on}
              className={`min-h-tap rounded-xl border-2 px-2 py-1.5 text-left text-[11px] font-bold leading-tight transition-all ${
                on
                  ? "border-forest bg-forest-light/20 text-forest-dark"
                  : blocked
                    ? "border-sand bg-white text-gray-300"
                    : "border-sand bg-white text-gray-500"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
