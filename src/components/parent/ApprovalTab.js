"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import { useAuth } from "@/context/AuthContext";
import { getLocalPhoto } from "@/lib/localPhotos";
import { Check, X, ShieldCheck, HandHeart, Users, Trees, Send, PlusCircle } from "lucide-react";

const VERIFY_META = {
  trust: { icon: HandHeart, label: "Con tự ghi nhận" },
  parent: { icon: Users, label: "Bố mẹ ghi nhận" },
  focus: { icon: Trees, label: "Có tập trung" },
};

/**
 * Tab ✅ DUYỆT — parent's 1-minute daily review (P0 escrow).
 * Everything a busy parent does daily lives here, ≤2 taps.
 */
export default function ApprovalTab() {
  const {
    charName,
    tasks,
    trustScore,
    pendingCount,
    approvalNudges,
    approveTask,
    approveAllPending,
    rejectTask,
    parentCompleteTask,
    heroCoins,
    setHeroCoins,
    points,
    setPoints,
    sendEncouragement,
  } = useGame();
  const { activeChildId } = useAuth();

  const [photoPreview, setPhotoPreview] = useState(null); // dataURL being viewed
  const [flash, setFlash] = useState("");
  const [quickMsg, setQuickMsg] = useState("");
  const [bonusAmount, setBonusAmount] = useState(20);

  const pending = tasks.filter((t) => t.approval === "pending");
  // Tasks the child hasn't claimed yet — parent can log them directly
  const notDone = tasks.filter((t) => !t.completed);
  const todayNudges = approvalNudges.length;

  const handleParentLog = (task) => {
    parentCompleteTask(task.id);
    showFlash(`Đã ghi nhận & duyệt "${task.title}" giúp ${charName}! ✅`);
  };

  const showFlash = (text) => {
    setFlash(text);
    setTimeout(() => setFlash(""), 3000);
  };

  const handleApproveAll = () => {
    const r = approveAllPending();
    showFlash(`Đã duyệt ${r.count} nhiệm vụ, nhả ${r.totalReleased} ⭐ cho ${charName}! ✅`);
  };

  const handleReject = (task) => {
    if (!confirm(`Bác nhiệm vụ "${task.title}"?\nĐiểm treo sẽ bị hủy và Uy Tín của con giảm mạnh.`)) return;
    rejectTask(task.id);
    showFlash(`Đã bác "${task.title}" — Uy Tín của con -8. ⚠️`);
  };

  const handleQuickBonus = (currency) => {
    if (bonusAmount <= 0) return;
    if (currency === "points") {
      setPoints((prev) => prev + bonusAmount);
      showFlash(`Đã thưởng nóng +${bonusAmount} ⭐!`);
    } else {
      setHeroCoins((prev) => prev + bonusAmount);
      showFlash(`Đã thưởng nóng +${bonusAmount} 🪙!`);
    }
  };

  const handleQuickPigeon = (e) => {
    e.preventDefault();
    if (!quickMsg.trim()) return;
    sendEncouragement(quickMsg.trim());
    setQuickMsg("");
    showFlash("Đã buộc thư vào chân bồ câu! 🕊️");
  };

  return (
    <div className="space-y-4">
      {/* Nudge banner from child */}
      {todayNudges > 0 && pending.length > 0 && (
        <div className="bg-amber-light border border-amber/40 rounded-xl p-3 flex items-center gap-2 text-scale-xs font-bold text-amber-dark">
          <span className="text-lg">🕊️</span>
          <span>{charName} đã nhắc bố mẹ duyệt {todayNudges} lần hôm nay — con đang mong đấy!</span>
        </div>
      )}

      {/* Trust score */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-scale-xs font-bold text-gray-600">
            <ShieldCheck size={16} className="text-forest" /> Uy Tín của {charName}
          </span>
          <span className="text-scale-sm font-black text-forest-dark">{trustScore}/100</span>
        </div>
        <div className="w-full bg-sand h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${trustScore >= 80 ? "bg-forest" : trustScore >= 40 ? "bg-amber" : "bg-terracotta"}`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
        <p className="text-scale-2xs text-gray-400">
          {trustScore >= 80
            ? "Uy Tín cao — con làm thật, báo thật. Hãy khen con nhé!"
            : "Duyệt đúng mỗi ngày giúp Uy Tín tăng; bác nhiệm vụ khai sai sẽ trừ mạnh."}
        </p>
      </div>

      {/* Pending queue */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-scale-sm font-black text-forest-dark">
            ⏳ Chờ duyệt ({pendingCount})
          </h3>
          {pending.length > 0 && (
            <button
              onClick={handleApproveAll}
              className="min-h-tap bg-forest text-white text-scale-xs font-black px-4 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Check size={16} /> Duyệt tất cả
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="text-scale-xs text-gray-400 text-center py-6">
            ✨ Không có gì chờ duyệt. Nhiệm vụ chưa duyệt sau 24h sẽ tự động được tính cho con.
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((task) => {
              const meta = VERIFY_META[task.verifyType] || VERIFY_META.trust;
              const MetaIcon = meta.icon;
              const localPhoto = getLocalPhoto(activeChildId, task.id);
              return (
                <div key={task.id} className="border border-sand rounded-xl p-3 flex items-center gap-3">
                  {/* Optional device-only photo, if the child attached one on this device */}
                  {localPhoto ? (
                    <button
                      onClick={() => setPhotoPreview(localPhoto)}
                      className="w-12 h-12 rounded-lg overflow-hidden border border-sand flex-shrink-0"
                      title="Xem ảnh con đính (lưu trên máy này)"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={localPhoto} alt="ảnh con đính" className="w-full h-full object-cover" />
                    </button>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-sand-light border border-sand flex items-center justify-center flex-shrink-0">
                      <MetaIcon size={18} className="text-gray-400" />
                    </div>
                  )}

                  <div className="flex-grow min-w-0">
                    <p className="text-scale-xs font-bold text-forest-dark truncate">{task.title}</p>
                    <p className="text-scale-2xs text-gray-400">
                      {meta.label} · +{task.pendingPoints} ⭐ treo
                      {task.completedAt ? ` · ${new Date(task.completedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => approveTask(task.id)}
                      className="min-w-tap min-h-tap rounded-xl bg-forest-light text-forest border border-forest/30 flex items-center justify-center active:scale-90 transition-transform"
                      title="Duyệt"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => handleReject(task)}
                      className="min-w-tap min-h-tap rounded-xl bg-rose-50 text-terracotta border border-red-200 flex items-center justify-center active:scale-90 transition-transform"
                      title="Bác — con sẽ bị trừ Uy Tín"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Parent-log — mark a task done for the child (Token Economy) */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <div className="space-y-0.5">
          <h3 className="text-scale-sm font-black text-forest-dark">✍️ Tick giúp con</h3>
          <p className="text-scale-2xs text-gray-400">
            Nhiều việc (dậy sớm, cùng nhau đọc sách...) bố mẹ tự ghi nhận là tiện nhất — con không cần chạm điện thoại.
          </p>
        </div>
        {notDone.length === 0 ? (
          <p className="text-scale-2xs text-gray-400 text-center py-3">Hôm nay con đã làm hết nhiệm vụ rồi! 🎉</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {notDone.map((task) => (
              <div key={task.id} className="border border-sand rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="flex-grow text-scale-2xs font-bold text-forest-dark truncate">{task.title}</span>
                {task.verifyType === "parent" && (
                  <span className="text-[10px] text-forest-medium font-black flex-shrink-0">👨‍👩‍👧</span>
                )}
                <button
                  onClick={() => handleParentLog(task)}
                  className="min-h-tap flex items-center gap-1 bg-forest-light text-forest border border-forest/30 text-[11px] font-black px-3 rounded-xl active:scale-95 transition-transform flex-shrink-0"
                  title="Ghi nhận & duyệt giúp con"
                >
                  <PlusCircle size={14} /> Xong
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
        <h3 className="text-scale-sm font-black text-forest-dark">⚡ Thao tác nhanh</h3>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-20 min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none"
            min={0}
          />
          <button
            onClick={() => handleQuickBonus("points")}
            className="flex-1 min-h-tap bg-forest-light text-forest border border-forest/30 rounded-xl text-scale-xs font-black active:scale-95 transition-transform"
          >
            +⭐ Thưởng ({points})
          </button>
          <button
            onClick={() => handleQuickBonus("coins")}
            className="flex-1 min-h-tap bg-amber-light text-amber-dark border border-amber/30 rounded-xl text-scale-xs font-black active:scale-95 transition-transform"
          >
            +🪙 Thưởng ({heroCoins})
          </button>
        </div>

        <form onSubmit={handleQuickPigeon} className="flex items-center gap-2">
          <input
            type="text"
            value={quickMsg}
            onChange={(e) => setQuickMsg(e.target.value)}
            placeholder="Gửi lời khen nhanh cho con..."
            className="flex-grow min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
            maxLength={150}
          />
          <button
            type="submit"
            className="min-w-tap min-h-tap bg-sky text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            title="Gửi bồ câu 🕊️"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {flash && (
        <p className="text-scale-xs font-bold text-center text-forest bg-forest-light/30 border border-forest/20 rounded-xl p-2.5 animate-fade-in">
          {flash}
        </p>
      )}

      {/* Photo preview modal */}
      {photoPreview && (
        <div
          className="absolute inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={() => setPhotoPreview(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPreview} alt="bằng chứng" className="max-w-full max-h-[70vh] rounded-2xl" />
        </div>
      )}
    </div>
  );
}
