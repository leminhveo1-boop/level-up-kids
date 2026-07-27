"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { generatePraiseSuggestions } from "@/lib/game/recognition";
import { compareWeeks } from "@/lib/game/progress";
import { buildShareCard } from "@/lib/game/shareCard";
import { getEquipped } from "@/lib/game/cosmetics";
import Collapsible from "@/ui/Collapsible";
import { Send, Share2, BookOpen, Sparkles } from "lucide-react";

/** Emoji đại diện theo lớp cho avatar trên thẻ ảnh (canvas không vẽ được SVG của HeroCard). */
const CLASS_EMOJI = { Mage: "🧙", Druid: "🌿", Warrior: "🛡️" };

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
    cosmetics,
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

  // ===== Thẻ Thành Tích — nội dung chọn bởi logic thuần (1 hero, milestone peak-end) =====
  const mandatoryTotal = tasks.filter((t) => t.isMandatory).length;
  const mandatoryAllDone = mandatoryTotal > 0 && tasks.filter((t) => t.isMandatory && t.completed).length === mandatoryTotal;
  const card = buildShareCard({ charName, level, streak, weekCompare, mandatoryAllDone });

  const handleSendPraise = (text, idx) => {
    sendEncouragement(text);
    setSentIdx((prev) => [...prev, idx]);
    showFlash("Đã gửi lời khen qua bồ câu! 🕊️ Con sẽ thấy ngay trên màn hình.");
  };

  // ===== Thẻ Thành Tích Tuần — 9:16 share card via canvas (CAC≈0 growth loop) =====
  // Redesign (docs/DEEP_05): nền kem ấm · 1 con số HERO xanh · avatar con là nhân
  // vật chính · title case (KHÔNG IN HOA) · so-với-chính-mình · watermark mờ.
  const handleShareCard = async () => {
    const W = 720, H = 1280;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    // ── Nền kem ấm (không corporate xanh lá) ──
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#FDF8F0");
    grad.addColorStop(1, "#F0E8D8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";

    // ── Title (title case) + subtitle ──
    ctx.fillStyle = "#33271A";
    ctx.font = "bold 48px system-ui";
    ctx.fillText(card.title, W / 2, 150);
    ctx.fillStyle = "#6C5F4E";
    ctx.font = "600 32px system-ui";
    ctx.fillText(card.subtitle, W / 2, 200);

    // ── Ruy-băng milestone (chỉ khi có), accent vàng tiền tệ ──
    if (card.milestone) {
      const label = card.milestone.reason;
      ctx.font = "bold 30px system-ui";
      const tw = ctx.measureText(label).width;
      const bw = tw + 64, bx = (W - bw) / 2, by = 232, bh = 56;
      ctx.fillStyle = "#E8A13A";
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 28);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(label, W / 2, by + 38);
    }

    // ── Avatar con là nhân vật chính (emoji lớp + mũ trang bị) ──
    const avatarY = card.milestone ? 470 : 440;
    const classEmoji = CLASS_EMOJI[charClass] || CLASS_EMOJI.Warrior;
    ctx.font = "150px system-ui";
    ctx.fillText(classEmoji, W / 2, avatarY);
    const hatEmoji = getEquipped({ cosmetics }).hat?.emoji;
    if (hatEmoji) {
      ctx.font = "72px system-ui";
      ctx.fillText(hatEmoji, W / 2 + 60, avatarY - 96);
    }

    // ── HERO: MỘT con số duy nhất, xanh dương accent ──
    const heroY = avatarY + 230;
    ctx.fillStyle = "#2E7CD6";
    ctx.font = "bold 130px system-ui";
    ctx.fillText(card.hero.value, W / 2, heroY);
    ctx.fillStyle = "#5C5243";
    ctx.font = "600 36px system-ui";
    ctx.fillText(card.hero.label, W / 2, heroY + 56);

    // ── Evidence strip (≤2 dòng, so-với-chính-mình) ──
    let ey = heroY + 130;
    ctx.fillStyle = "#5C5243";
    ctx.font = "500 32px system-ui";
    card.evidence.forEach((line) => {
      ctx.fillText(line, W / 2, ey);
      ey += 48;
    });

    // ── Narrative: 1 câu, tự xuống dòng nếu dài ──
    ctx.fillStyle = "#6C5F4E";
    ctx.font = "italic 30px system-ui";
    const words = card.narrative.split(" ");
    let line = "", ny = ey + 24;
    const maxW = W - 140;
    words.forEach((w) => {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, W / 2, ny);
        ny += 42;
        line = w;
      } else {
        line = test;
      }
    });
    if (line) ctx.fillText(line, W / 2, ny);

    // ── Watermark mờ (nhận diện, không lấn) ──
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#33271A";
    ctx.font = "600 26px system-ui";
    ctx.fillText("Level Up Kids · levelupkids.vn", W / 2, H - 64);
    ctx.globalAlpha = 1;

    const dataUrl = canvas.toDataURL("image/png");

    // Try native share, fall back to download
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `thanh-tich-${charName}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Cột mốc của ${charName}` });
        return;
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `thanh-tich-${charName}.png`;
    a.click();
    showFlash("Đã lưu thẻ thành tích của " + charName + " 📸 — cất làm kỷ niệm hay chia sẻ tuỳ bố mẹ.");
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

        <Collapsible summary={`Xem ${praises.length} gợi ý lời khen`} icon={BookOpen} tone="quiet">
          <div className="space-y-3">
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
        </Collapsible>
      </div>

      {/* ===== Thẻ Thành Tích Tuần — shareable keepsake card ===== */}
      {/* Peak-end: chỉ TỰ nổi bật ở milestone; ngày thường thì gấp lại (đỡ ngộp). */}
      {card.milestone ? (
        <div className="bg-amber-light/40 border border-amber/40 rounded-xl p-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <Sparkles size={18} className="text-amber-dark flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-scale-sm font-black text-forest-dark">Cột mốc của {charName}!</h3>
              <p className="text-scale-2xs text-gray-600 font-medium leading-relaxed">
                {card.milestone.reason} Một khoảnh khắc đáng nhớ — lưu lại tấm thẻ để dành làm kỷ niệm, hay gửi ông bà xem.
              </p>
            </div>
          </div>
          <button
            onClick={handleShareCard}
            className="w-full min-h-tap bg-forest text-white text-scale-xs font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Share2 size={16} /> Lưu ảnh cột mốc
          </button>
        </div>
      ) : (
        <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
          <h3 className="text-scale-sm font-black text-forest-dark">📸 Thẻ Thành Tích Tuần</h3>
          <Collapsible summary="Lưu thẻ thành tích" icon={Share2}>
            <div className="space-y-2">
              <p className="text-scale-2xs text-gray-400">
                Lưu chặng đường tuần này của {charName} thành một tấm thẻ đẹp — để dành làm kỷ niệm, hoặc chia sẻ nếu bố mẹ muốn.
              </p>
              <button
                onClick={handleShareCard}
                className="w-full min-h-tap bg-forest text-white text-scale-xs font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <Share2 size={16} /> Lưu ảnh thành tích
              </button>
            </div>
          </Collapsible>
        </div>
      )}

      {flash && (
        <p className="text-scale-xs font-bold text-center text-forest bg-forest-light/30 border border-forest/20 rounded-xl p-2.5">
          {flash}
        </p>
      )}
    </div>
  );
}
