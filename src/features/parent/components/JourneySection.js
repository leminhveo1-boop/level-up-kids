"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { getJourneysForAge, getJourneyStatus, JOURNEY_AGE_BANDS } from "@/lib/game/journeys";
import { track } from "@/lib/analytics";
import { Map, Square } from "lucide-react";

/**
 * 🛤️ Lộ Trình (B-lite) — the parent's guided path, top of tab Nhiệm vụ & Quà.
 * Active journey → this week's tip + expectation (the anti-lost content) + progress.
 * No journey → pick one from the catalog (grouped by age band).
 */
export default function JourneySection({ showFlash }) {
  const { journey, tasks, journeysCompleted, startJourney, cancelJourney, charName } = useGame();
  const status = getJourneyStatus({ journey, tasks });

  return (
    <div className="bg-white border-2 border-forest/30 rounded-xl p-4 space-y-3">
      <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
        <Map size={16} /> Lộ Trình 3 Tuần
      </h3>

      {status ? (
        <ActiveJourneyCard status={status} charName={charName} cancelJourney={cancelJourney} showFlash={showFlash} />
      ) : (
        <JourneyPicker startJourney={startJourney} showFlash={showFlash} />
      )}

      {journeysCompleted.length > 0 && (
        <div className="bg-sand-light border border-sand rounded-xl p-3 space-y-1">
          <p className="text-scale-2xs font-black text-gray-400 uppercase tracking-wider">🏆 Đã chinh phục</p>
          <div className="flex flex-wrap gap-1.5">
            {journeysCompleted.map((r, i) => (
              <span
                key={`${r.id}_${i}`}
                className="text-scale-2xs font-bold text-forest-dark bg-forest-light/30 border border-forest/20 rounded-full px-2.5 py-1"
                title={`${r.successDays}/${r.totalDays} ngày đạt`}
              >
                {r.icon} {r.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveJourneyCard({ status, charName, cancelJourney, showFlash }) {
  const { def, week, weeks, dayInStage, stageSuccessDays, successDays, totalDays, stageTitle, parentTip, expectation, stageTasks } = status;

  return (
    <div className="space-y-3">
      {/* Header + week dots */}
      <div className="flex items-start gap-3">
        <span className="text-3xl flex-shrink-0">{def.icon}</span>
        <div className="flex-grow min-w-0">
          <p className="text-scale-xs font-black text-forest-dark">{def.title}</p>
          <p className="text-scale-2xs font-bold text-amber-dark">{stageTitle}</p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: weeks }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < week - 1 ? "bg-forest" : i === week - 1 ? "bg-amber" : "bg-sand"}`}
              />
            ))}
            <span className="text-[11px] font-black text-gray-400 ml-1">TUẦN {week}/{weeks}</span>
          </div>
        </div>
      </div>

      {/* Progress this week + overall */}
      <p className="text-scale-2xs font-bold text-gray-500">
        Tuần này: <span className="text-forest-dark">{stageSuccessDays}/{dayInStage || 0} ngày đạt</span> · Cả lộ trình:{" "}
        <span className="text-forest-dark">{successDays}/{totalDays} ngày</span>
      </p>

      {/* Today's journey tasks */}
      <div className="space-y-1">
        {stageTasks.map((t) => (
          <p key={t.id} className={`text-scale-2xs font-bold ${t.completed ? "text-forest" : "text-gray-500"}`}>
            {t.completed ? "✅" : "⬜"} {t.title}
          </p>
        ))}
      </div>

      {/* 💡 The đường dẫn content — this is what the parent pays for */}
      <div className="bg-forest-light/20 border border-forest/20 rounded-xl p-3 space-y-1">
        <p className="text-scale-2xs font-black text-forest-dark uppercase tracking-wider">💡 Mẹo tuần này cho bố mẹ</p>
        <p className="text-scale-xs text-gray-600 font-medium leading-relaxed">{parentTip}</p>
      </div>
      <div className="bg-amber-light/30 border border-amber/30 rounded-xl p-3 space-y-1">
        <p className="text-scale-2xs font-black text-amber-dark uppercase tracking-wider">🧭 Chuyện bình thường sẽ xảy ra</p>
        <p className="text-scale-xs text-gray-600 font-medium leading-relaxed">{expectation}</p>
      </div>

      <button
        onClick={() => {
          if (confirm(`Dừng lộ trình "${def.title}" của ${charName}? Tiến độ tuần sẽ mất.`)) {
            cancelJourney();
            track("journey_cancelled", { id: def.id, week });
            showFlash("Đã dừng lộ trình. Có thể bắt đầu lộ trình khác bất cứ lúc nào! 🛤️");
          }
        }}
        className="w-full min-h-tap bg-white border border-sand text-gray-400 text-scale-2xs font-black rounded-xl flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
      >
        <Square size={12} /> DỪNG LỘ TRÌNH
      </button>
    </div>
  );
}

function JourneyPicker({ startJourney, showFlash }) {
  const [band, setBand] = useState("7-9");
  const journeys = getJourneysForAge(band);

  return (
    <div className="space-y-2.5">
      <p className="text-scale-2xs text-gray-500 font-medium leading-relaxed">
        Chọn MỘT thói quen mục tiêu — nhiệm vụ mỗi tuần, mẹo đồng hành và mốc kỳ vọng đã soạn sẵn. Mỗi lúc một lộ trình để con không quá tải.
      </p>

      <div className="grid grid-cols-4 gap-1.5">
        {JOURNEY_AGE_BANDS.map((b) => (
          <button
            key={b.id}
            onClick={() => setBand(b.id)}
            className={`min-h-tap rounded-xl border-2 text-scale-2xs font-black transition-all ${
              band === b.id ? "border-forest bg-forest-light/20 text-forest-dark" : "border-sand text-gray-500"
            }`}
          >
            {b.id}
          </button>
        ))}
      </div>

      {journeys.map((j) => (
        <div key={j.id} className="border border-sand rounded-xl p-3 flex items-center gap-2.5">
          <span className="text-2xl flex-shrink-0">{j.icon}</span>
          <div className="flex-grow min-w-0">
            <p className="text-scale-xs font-black text-forest-dark">{j.title}</p>
            <p className="text-scale-2xs text-gray-500 font-medium leading-snug">{j.goal}</p>
          </div>
          <button
            onClick={() => {
              const r = startJourney(j.id);
              if (r.success) {
                track("journey_started", { id: j.id, source: "parent_room" });
                showFlash(`Đã bắt đầu lộ trình "${j.title}"! Nhiệm vụ tuần 1 đã vào bảng của con. 🛤️`);
              }
            }}
            className="min-h-tap flex-shrink-0 bg-forest text-white text-scale-2xs font-black px-3 rounded-xl active:scale-95 transition-transform"
          >
            BẮT ĐẦU
          </button>
        </div>
      ))}
    </div>
  );
}
