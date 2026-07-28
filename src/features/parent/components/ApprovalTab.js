"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import MomentCard from "./MomentCard";
import InsightCard from "./InsightCard";
import CaregiverShareButton from "./CaregiverShareButton";
import { REJECT_REASONS } from "@/lib/game/economy";
import { restitutionEnabled } from "@/lib/game/age";
import { maxRestitution } from "@/lib/game/consequences";
import { Check, X, ShieldCheck, HandHeart, Users, Trees, Send, PlusCircle, ChevronDown, PenLine, Zap, Wrench } from "lucide-react";

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
    ageInfo,
    restitutions,
    proposeRestitution,
  } = useGame();

  const [flash, setFlash] = useState("");
  const [quickMsg, setQuickMsg] = useState("");
  const [bonusAmount, setBonusAmount] = useState(10);
  // Progressive disclosure — secondary tools stay folded so the landing isn't
  // overwhelming (real parent feedback: "vào thấy ngộp, quá nhiều chữ").
  const [showLog, setShowLog] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  // C2.5: id việc đang chọn lý do trả-về (mở picker 3 lý do inline thay confirm cụt)
  const [rejectingId, setRejectingId] = useState(null);
  // §13 Mảnh B — đề nghị đền bù (gấp, chỉ 9t+ có tuổi)
  const [showRestitution, setShowRestitution] = useState(false);
  const [restReason, setRestReason] = useState("");
  const [restAmount, setRestAmount] = useState(1);

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

  // C2.5: trả việc về kèm lý do DoD cụ thể — con biết đúng chỗ cần hoàn thiện.
  const handleRejectWithReason = (task, reason) => {
    rejectTask(task.id, reason.id);
    setRejectingId(null);
    showFlash(`Đã gửi "${task.title}" về cho ${charName} làm lại — lý do: ${reason.label}.`);
  };

  // §13 Mảnh B — đề nghị đền bù: CHỈ tạo pending, con phải đồng ý mới chuyển xu.
  const REST_ERR = {
    AGE_NOT_ELIGIBLE: "Cần nhập tuổi con (≥9) ở phần Hệ Thống trước.",
    INVALID_AMOUNT: "Số xu chưa hợp lệ.",
    REASON_REQUIRED: "Ghi rõ chuyện gì cần sửa chữa.",
    AMOUNT_TOO_HIGH: `Tối đa ${maxRestitution(heroCoins)} xu (30% ví con).`,
  };
  const handleProposeRestitution = () => {
    const r = proposeRestitution({ reason: restReason, amount: Number(restAmount) });
    if (r.success) {
      showFlash(`Đã gửi đề nghị đền bù cho ${charName} — chờ con đồng ý.`);
      setRestReason("");
      setRestAmount(1);
    } else {
      showFlash(REST_ERR[r.error] || "Không gửi được đề nghị.");
    }
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
      {/* C2.2 — Insight điểm-mạnh: ngày mai đã sẵn sàng + quan sát để bố mẹ khen.
          Thay bảng-số phán xét bằng gợi-ý-hành-vi tích cực (T3, ẩn %). */}
      <InsightCard />

      {/* Nudge banner from child */}
      {todayNudges > 0 && pending.length > 0 && (
        <div className="bg-amber-light border border-amber/40 rounded-xl p-3 flex items-center gap-2 text-scale-xs font-bold text-amber-dark">
          <span className="text-lg">🕊️</span>
          <span>{charName} đã nhắc bố mẹ duyệt {todayNudges} lần hôm nay — con đang mong đấy!</span>
        </div>
      )}

      {/* Trust score — one compact line, no paragraph */}
      <div className="flex items-center gap-3 px-1">
        <ShieldCheck size={16} className="text-forest flex-shrink-0" />
        <div className="flex-grow bg-sand h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${trustScore >= 80 ? "bg-forest" : trustScore >= 40 ? "bg-amber" : "bg-terracotta"}`}
            style={{ width: `${trustScore}%` }}
          />
        </div>
        <span className="text-scale-2xs font-bold text-gray-500 flex-shrink-0">Uy Tín {trustScore}</span>
      </div>

      {/* Pending queue — the one job of this screen */}
      <div className="bg-white border border-sand rounded-xl p-4 space-y-3 shadow-game-flat">
        <div className="flex items-center justify-between">
          <h3 className="text-scale-sm font-black text-forest-dark">
            Chờ duyệt {pendingCount > 0 && <span className="text-forest">({pendingCount})</span>}
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
            Không có gì chờ duyệt ✨
          </p>
        ) : (
          <div className="space-y-2">
            {pending.map((task) => {
              const meta = VERIFY_META[task.verifyType] || VERIFY_META.trust;
              const MetaIcon = meta.icon;
              const isRejecting = rejectingId === task.id;
              return (
                <div key={task.id} className="border border-sand rounded-xl p-3 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-sand-light border border-sand flex items-center justify-center flex-shrink-0">
                      <MetaIcon size={18} className="text-gray-400" />
                    </div>

                    <div className="flex-grow min-w-0">
                      <p className="text-scale-xs font-bold text-forest-dark truncate">{task.title}</p>
                      <p className="text-scale-2xs text-gray-400">
                        {meta.label} · +{task.pendingPoints} ⭐ treo
                        {task.completedAt ? ` · ${new Date(task.completedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                      </p>
                    </div>

                    {!isRejecting && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => approveTask(task.id)}
                          className="min-w-tap min-h-tap rounded-xl bg-forest-light text-forest border border-forest/30 flex items-center justify-center active:scale-90 transition-transform"
                          title="Duyệt"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setRejectingId(task.id)}
                          className="min-w-tap min-h-tap rounded-xl bg-rose-50 text-terracotta border border-red-200 flex items-center justify-center active:scale-90 transition-transform"
                          title="Gửi về cho con làm lại"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* C2.5 — picker lý do: bố mẹ chọn 1 nút, con biết đúng chỗ cần hoàn thiện */}
                  {isRejecting && (
                    <div className="space-y-2 border-t border-sand pt-2.5">
                      <p className="text-scale-2xs font-bold text-gray-500">Gửi về cho con làm lại vì:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {REJECT_REASONS.map((reason) => (
                          <button
                            key={reason.id}
                            onClick={() => handleRejectWithReason(task, reason)}
                            className="min-h-tap px-3 rounded-xl bg-rose-50 text-terracotta border border-red-200 text-scale-2xs font-bold active:scale-95 transition-transform"
                          >
                            {reason.label}
                          </button>
                        ))}
                        <button
                          onClick={() => setRejectingId(null)}
                          className="min-h-tap px-3 rounded-xl bg-sand-light text-gray-500 border border-sand text-scale-2xs font-bold active:scale-95 transition-transform"
                        >
                          Thôi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* §13 Mảnh B — Đề nghị đền bù (chỉ 9t+ có tuổi). Gấp mặc định, không phải phạt. */}
      {restitutionEnabled(ageInfo) && (
        <div className="bg-white border border-sand rounded-xl shadow-game-flat">
          <button
            onClick={() => setShowRestitution((v) => !v)}
            className="w-full flex items-center justify-between p-4 min-h-tap"
          >
            <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
              <Wrench size={16} /> Đề nghị đền bù
              {restitutions.some((r) => r.status === "pending") && (
                <span className="text-gray-400 font-bold">
                  ({restitutions.filter((r) => r.status === "pending").length} chờ con đồng ý)
                </span>
              )}
            </h3>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showRestitution ? "rotate-180" : ""}`} />
          </button>
          {showRestitution && (
            <div className="px-4 pb-4 space-y-2.5 border-t border-sand pt-3">
              <p className="text-scale-2xs text-gray-400">
                Khi có hư hỏng cụ thể, đề nghị con góp một ít xu vào Quỹ sửa chữa của nhà. Đây là
                <b className="text-gray-500"> sửa chữa, không phải phạt</b> — con phải đồng ý thì mới ghi nhận.
              </p>
              <input
                type="text"
                value={restReason}
                onChange={(e) => setRestReason(e.target.value)}
                placeholder="Chuyện gì cần sửa? (vd: làm vỡ cốc khi đùa)"
                className="w-full min-h-tap rounded-xl border border-sand bg-white px-3 text-scale-2xs font-bold text-forest-dark"
              />
              <div className="flex items-center gap-2">
                <label className="text-scale-2xs font-bold text-gray-500">Số xu</label>
                <input
                  type="number"
                  min={1}
                  max={maxRestitution(heroCoins)}
                  value={restAmount}
                  onChange={(e) => setRestAmount(e.target.value)}
                  className="w-16 min-h-tap rounded-xl border border-sand bg-white px-2 text-scale-2xs font-bold text-forest-dark text-center"
                />
                <span className="text-scale-2xs text-gray-400">tối đa {maxRestitution(heroCoins)} (30% ví con)</span>
              </div>
              <button
                onClick={handleProposeRestitution}
                className="w-full min-h-tap rounded-xl bg-forest text-white text-scale-2xs font-black active:scale-95 transition-transform"
              >
                Gửi đề nghị cho {charName}
              </button>
              {restitutions.filter((r) => r.status === "pending").map((r) => (
                <p key={r.id} className="text-scale-2xs text-gray-400">
                  • Đang chờ con đồng ý: “{r.reason}” · {r.amount} xu
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Parent-log — folded by default (progressive disclosure) */}
      <div className="bg-white border border-sand rounded-xl shadow-game-flat">
        <button
          onClick={() => setShowLog((v) => !v)}
          className="w-full flex items-center justify-between p-4 min-h-tap"
        >
          <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
            <PenLine size={16} /> Tick giúp con {notDone.length > 0 && <span className="text-gray-400 font-bold">({notDone.length})</span>}
          </h3>
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${showLog ? "rotate-180" : ""}`} />
        </button>
        {showLog && (
          <div className="px-4 pb-4 space-y-2">
            {notDone.length === 0 ? (
          <p className="text-scale-2xs text-gray-400 text-center py-3">Hôm nay con đã làm hết nhiệm vụ rồi! 🎉</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {notDone.map((task) => (
              <div key={task.id} className="border border-sand rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="flex-grow text-scale-2xs font-bold text-forest-dark truncate">{task.title}</span>
                {task.verifyType === "parent" && (
                  <Users size={12} className="text-forest-medium flex-shrink-0" />
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
        )}
      </div>

      {/* Quick actions — folded by default */}
      <div className="bg-white border border-sand rounded-xl shadow-game-flat">
        <button
          onClick={() => setShowQuick((v) => !v)}
          className="w-full flex items-center justify-between p-4 min-h-tap"
        >
          <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
            <Zap size={16} /> Thao tác nhanh
          </h3>
          <ChevronDown size={18} className={`text-gray-400 transition-transform ${showQuick ? "rotate-180" : ""}`} />
        </button>
        {showQuick && (
        <div className="px-4 pb-4 space-y-3">
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
        )}
      </div>

      {/* C2.4 — Chia sẻ lịch hôm nay cho ông bà (Zalo/SMS, không cần app) */}
      <CaregiverShareButton />

      {/* Thẻ Khoảnh khắc — tri thức đúng-lúc sau 1 phút duyệt (SPEC_APP_LA_CHUYEN_GIA) */}
      <MomentCard />

      {flash && (
        <p className="text-scale-xs font-bold text-center text-forest bg-forest-light/30 border border-forest/20 rounded-xl p-2.5 animate-fade-in">
          {flash}
        </p>
      )}
    </div>
  );
}
