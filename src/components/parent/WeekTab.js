"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { generatePraiseSuggestions } from "@/lib/game/recognition";
import { compareWeeks } from "@/lib/game/progress";
import { Send, Share2 } from "lucide-react";

const STAT_META = {
  strength: { label: "Thể lực", color: "bg-terracotta", emoji: "❤️" },
  intellect: { label: "Trí tuệ", color: "bg-sky", emoji: "🧠" },
  discipline: { label: "Kỷ luật", color: "bg-amber", emoji: "⚡" },
  creative: { label: "Sáng tạo", color: "bg-clay", emoji: "🎨" },
  help: { label: "Giúp đỡ", color: "bg-forest-medium", emoji: "🤝" },
};

/** Tab 📊 TUẦN NÀY — progress overview (weekly report V1.2 will extend this). */
export default function WeekTab() {
  const {
    charName,
    charClass,
    level,
    streak,
    streakFreezes,
    trustScore,
    stats,
    tasks,
    parentConfig,
    screenMinutesUsedToday,
    screenRedeemsThisWeek,
    heroCoins,
    points,
    sendEncouragement,
    history,
    childMessages,
    readAllChildMessages,
  } = useGame();

  const [flash, setFlash] = useState("");
  const [sentIdx, setSentIdx] = useState([]);
  const showFlash = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(""), 3000);
  };

  const completedToday = tasks.filter((t) => t.completed).length;
  const rejectedToday = tasks.filter((t) => t.wasRejected).length;

  // D8: self-comparison headline — this week vs last week, from daily snapshots
  const weekCompare = compareWeeks(history, { completed: completedToday, total: tasks.length });

  const praises = generatePraiseSuggestions({ charName, streak, trustScore, tasks });

  const handleSendPraise = (text, idx) => {
    sendEncouragement(text);
    setSentIdx((prev) => [...prev, idx]);
    showFlash("Đã gửi lời khen qua bồ câu! 🕊️ Con sẽ thấy ngay trên màn hình.");
  };

  // ===== Thẻ Khoe Con — 9:16 share card via canvas (CAC≈0 growth loop) =====
  const handleShareCard = async () => {
    const W = 720, H = 1280;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#4CAF50");
    grad.addColorStop(1, "#1B5E20");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // card panel
    ctx.fillStyle = "#FDFBF7";
    const rx = 48, px = 60, py = 200, pw = W - 120, ph = 760;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, rx);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.fillStyle = "#FDFBF7";
    ctx.font = "bold 44px system-ui";
    ctx.fillText("🌟 ANH HÙNG NHÍ TUẦN NÀY 🌟", W / 2, 120);

    ctx.fillStyle = "#1B5E20";
    ctx.font = "90px system-ui";
    ctx.fillText("🦸", W / 2, py + 150);
    ctx.font = "bold 56px system-ui";
    ctx.fillText(charName, W / 2, py + 240);
    ctx.font = "bold 34px system-ui";
    ctx.fillStyle = "#D97706";
    ctx.fillText(`CẤP ${level} · 🔥 STREAK ${streak} NGÀY`, W / 2, py + 300);

    ctx.fillStyle = "#444";
    ctx.font = "32px system-ui";
    ctx.fillText(`✅ ${completedToday} nhiệm vụ hôm nay`, W / 2, py + 380);
    ctx.fillText(`🤝 Uy Tín ${trustScore}/100`, W / 2, py + 435);
    ctx.fillText(`⭐ ${points} điểm · 🪙 ${heroCoins} coin`, W / 2, py + 490);

    // D8: the one-line proof of progress — only brag when it's up
    if (weekCompare.status === "up") {
      ctx.fillStyle = "#D97706";
      ctx.font = "bold 34px system-ui";
      ctx.fillText(`📈 +${weekCompare.deltaPct}% so với tuần trước`, W / 2, py + 548);
    }

    ctx.fillStyle = "#2E7D32";
    ctx.font = "italic 30px system-ui";
    ctx.fillText('"Mỗi việc tốt là một bước lên cấp!"', W / 2, py + 620);

    ctx.fillStyle = "#999";
    ctx.font = "28px system-ui";
    ctx.fillText("Level Up Kids — levelupkids.vn", W / 2, H - 80);

    const dataUrl = canvas.toDataURL("image/png");

    // Try native share, fall back to download
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `khoe-con-${charName}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Thành tích của ${charName}!` });
        return;
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `khoe-con-${charName}.png`;
    a.click();
    showFlash("Đã tải Thẻ Khoe Con — đăng Facebook/Zalo khoe ngay! 📸");
  };

  return (
    <div className="space-y-4">
      {/* Child summary */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-1">
        <h3 className="text-scale-sm font-black text-forest-dark">
          {charName} — Cấp {level} ({charClass})
        </h3>
        <p className="text-scale-2xs text-gray-500">
          🔥 Streak {streak} ngày · ❄️ {streakFreezes} thẻ đóng băng · 🤝 Uy Tín {trustScore}/100
        </p>
        <p className="text-scale-2xs text-gray-500">
          Hôm nay: {completedToday}/{tasks.length} nhiệm vụ
          {rejectedToday > 0 && ` · ${rejectedToday} bị bác ⚠️`} · Ví: {points} ⭐ / {heroCoins} 🪙
        </p>
      </div>

      {/* ===== V1.2: 7-day chart (history snapshots + today live) ===== */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">📊 7 ngày gần nhất</h3>
        {/* D8: so-với-chính-mình — bằng chứng tiến bộ thành 1 câu */}
        {weekCompare.status !== "insufficient" && (
          <p
            className={`text-scale-2xs font-black rounded-xl px-3 py-2 border ${
              weekCompare.status === "up"
                ? "bg-forest-light/30 border-forest/20 text-forest-dark"
                : weekCompare.status === "down"
                  ? "bg-amber-light/40 border-amber/30 text-gray-600"
                  : "bg-sand-light border-sand text-gray-600"
            }`}
          >
            {weekCompare.message}
          </p>
        )}
        {(() => {
          const days = [
            ...history.slice(-6),
            { date: "Hôm nay", completed: completedToday, total: tasks.length, live: true },
          ];
          const maxTotal = Math.max(1, ...days.map((d) => d.total || 1));
          return (
            <div className="flex items-end gap-1.5 h-28">
              {days.map((d, i) => {
                const pct = Math.round(((d.completed || 0) / Math.max(1, d.total || 1)) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                    <span className="text-[10px] font-black text-forest-dark">{d.completed || 0}</span>
                    <div className="w-full bg-sand rounded-t-lg relative overflow-hidden" style={{ height: "72px" }}>
                      <div
                        className={`absolute bottom-0 inset-x-0 rounded-t-lg transition-all ${d.live ? "bg-amber" : "bg-forest-medium"}`}
                        style={{ height: `${Math.max(4, pct * 0.72)}px` }}
                        title={`${d.date}: ${d.completed}/${d.total} (${pct}%)`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 truncate w-full text-center">
                      {d.live ? "Nay" : String(d.date).split("/").slice(0, 2).join("/")}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}
        {history.length === 0 && (
          <p className="text-scale-2xs text-gray-400 text-center">
            Biểu đồ sẽ đầy dần sau mỗi ngày sử dụng — dữ liệu chốt lúc sang ngày mới.
          </p>
        )}
      </div>

      {/* ===== V1.2: Thư con gửi 💌 (two-way pigeon) ===== */}
      {childMessages.length > 0 && (
        <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-scale-sm font-black text-forest-dark">
              💌 Thư {charName} gửi bố mẹ
              {childMessages.some((m) => !m.read) && (
                <span className="ml-1.5 bg-terracotta text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  {childMessages.filter((m) => !m.read).length} mới
                </span>
              )}
            </h3>
            {childMessages.some((m) => !m.read) && (
              <button
                onClick={readAllChildMessages}
                className="text-scale-2xs font-bold text-sky-dark underline"
              >
                Đã đọc hết
              </button>
            )}
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {childMessages.slice(0, 10).map((m) => (
              <div
                key={m.id}
                className={`rounded-xl px-3 py-2 text-scale-2xs font-medium leading-relaxed border ${
                  m.read ? "bg-sand-light border-sand text-gray-500" : "bg-amber-light/50 border-amber/30 text-forest-dark"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats bars */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">📈 5 chỉ số năng lực</h3>
        {Object.entries(stats).map(([key, val]) => {
          const meta = STAT_META[key];
          if (!meta) return null;
          const percentage = Math.min(100, Math.round((val / 100) * 100));
          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-scale-2xs font-bold text-gray-600">
                <span>{meta.emoji} {meta.label}</span>
                <span>{val} điểm</span>
              </div>
              <div className="w-full bg-sand h-2.5 rounded-full overflow-hidden">
                <div className={`${meta.color} h-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Screen-time & weekly limits */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
        <h3 className="text-scale-sm font-black text-forest-dark">⏱️ Giới hạn giải trí</h3>
        <div className="flex justify-between text-scale-xs font-bold text-gray-600">
          <span>Hôm nay</span>
          <span>{screenMinutesUsedToday}/{parentConfig.screenMaxMinutesPerDay} phút</span>
        </div>
        <div className="w-full bg-sand h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber h-full transition-all"
            style={{ width: `${Math.min(100, (screenMinutesUsedToday / Math.max(1, parentConfig.screenMaxMinutesPerDay)) * 100)}%` }}
          />
        </div>
        <p className="text-scale-2xs text-gray-400">
          Tuần này đã đổi {screenRedeemsThisWeek}/{parentConfig.screenRedeemMaxPerWeek} lượt giải trí.
        </p>
      </div>

      {/* ===== Sổ Vàng Ghi Nhận — data-driven process praise (Dweck) ===== */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <div className="space-y-0.5">
          <h3 className="text-scale-sm font-black text-forest-dark">📖 Sổ Vàng — Gợi ý lời khen hôm nay</h3>
          <p className="text-scale-2xs text-gray-400">
            Khen QUÁ TRÌNH thay vì tư chất — soạn sẵn từ dữ liệu thật của con, chạm 1 phát để gửi 🕊️
          </p>
        </div>

        {praises.map((text, idx) => (
          <div key={idx} className="border border-sand rounded-xl p-3 flex items-start gap-2">
            <p className="flex-grow text-scale-2xs text-gray-600 font-medium leading-relaxed">{text}</p>
            <button
              onClick={() => handleSendPraise(text, idx)}
              disabled={sentIdx.includes(idx)}
              className={`min-w-tap min-h-tap rounded-xl flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform ${
                sentIdx.includes(idx) ? "bg-sand text-gray-400" : "bg-sky text-white"
              }`}
              title="Gửi qua bồ câu"
            >
              {sentIdx.includes(idx) ? "✓" : <Send size={16} />}
            </button>
          </div>
        ))}
      </div>

      {/* ===== Thẻ Khoe Con — shareable brag card ===== */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
        <h3 className="text-scale-sm font-black text-forest-dark">📸 Thẻ Khoe Con</h3>
        <p className="text-scale-2xs text-gray-400">
          Xuất ảnh thành tích tuần của {charName} để đăng Facebook/Zalo — khoe con một chút cũng đáng mà!
        </p>
        <button
          onClick={handleShareCard}
          className="w-full min-h-tap bg-clay text-white text-scale-xs font-black rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Share2 size={16} /> XUẤT THẺ KHOE CON
        </button>
      </div>

      {flash && (
        <p className="text-scale-xs font-bold text-center text-forest bg-forest-light/30 border border-forest/20 rounded-xl p-2.5">
          {flash}
        </p>
      )}
    </div>
  );
}
