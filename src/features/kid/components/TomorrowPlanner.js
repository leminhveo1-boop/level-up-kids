"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  Printer,
  X,
} from "lucide-react";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import {
  getPlanPhase,
  selectDefaultFocusTask,
  selectMicroChoiceCandidates,
  shouldOfferTomorrowPlanning,
} from "@/lib/game/planning";

function formatTargetDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(year, month - 1, day));
}

export default function TomorrowPlanner({
  tasks,
  plan,
  onSave,
  onClear,
  allTasksCompleted = false,
  uiMode = "kid",
  scaffoldLevel = 1,
}) {
  // A0.5 — Scaffolding gate: Level 1 = micro-choice THUẦN (con chỉ chạm 1 việc).
  // WOOP (khi nào · bước đầu) chỉ bung từ Level 2+ (hoặc rescue B1.2 sau này).
  const showWoopEntry = scaffoldLevel >= 2;
  const phase = getPlanPhase(plan);
  const isTeen = uiMode === "teen";
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fallbackFocus = useMemo(() => selectDefaultFocusTask(tasks)?.id || "", [tasks]);
  const microCandidates = useMemo(
    () => selectMicroChoiceCandidates(tasks, { focusId: fallbackFocus }),
    [tasks, fallbackFocus]
  );
  const [focusTaskId, setFocusTaskId] = useState(plan?.focusTaskId || fallbackFocus);
  const [firstStep, setFirstStep] = useState(plan?.firstStep || "");
  const [anchor, setAnchor] = useState(plan?.anchor || "");

  const focusItem = plan?.items?.find((item) => item.taskId === plan.focusTaskId);
  const activePlan = phase === "today" || phase === "tomorrow" ? plan : null;
  const shouldShow = shouldOfferTomorrowPlanning({ plan, allTasksCompleted });

  const startEditing = () => {
    setFocusTaskId(phase === "tomorrow" ? plan?.focusTaskId || fallbackFocus : fallbackFocus);
    setFirstStep(phase === "tomorrow" ? plan?.firstStep || "" : "");
    setAnchor(phase === "tomorrow" ? plan?.anchor || "" : "");
    setEditing(true);
  };

  const handleSave = () => {
    const result = onSave({ focusTaskId, firstStep, anchor });
    if (result?.success) {
      setEditing(false);
      setShowAll(false);
    }
  };

  // A0.3 — micro-choice 1 chạm: chọn việc bắt đầu là XONG (WOOP để trống, các
  // việc còn lại vẫn được giữ trong plan). Đây là đường mặc định, ≤15s.
  const handleMicroPick = (taskId) => {
    onSave({ focusTaskId: taskId });
  };

  const resetDraft = () => {
    setFocusTaskId(fallbackFocus);
    setFirstStep("");
    setAnchor("");
  };

  if (!shouldShow) return null;

  if (editing) {
    return (
      <div className="fixed inset-0 z-[80] bg-sand-light overflow-y-auto no-print">
        <div className="w-full max-w-md mx-auto p-5">
          <Card className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0">
                <NotebookPen size={20} />
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-scale-base font-bold text-forest-dark">
                  {isTeen ? "Kế hoạch ngày mai của bạn" : "Ngày mai, kế hoạch của con là"}
                </h3>
                <p className="text-scale-2xs text-gray-500 mt-1">
                  Tất cả việc vẫn được giữ. Chọn một việc con muốn bắt đầu sớm.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="hit-target w-9 h-9 rounded-full flex items-center justify-center text-gray-500"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-scale-2xs font-bold text-gray-500">1. Việc con sẽ bắt đầu trước</p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(tasks || []).map((task) => {
                  const selected = task.id === focusTaskId;
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setFocusTaskId(task.id)}
                      className={`w-full min-h-tap text-left rounded-xl px-3 py-3 flex items-center gap-3 border transition-colors ${
                        selected ? "accent-border accent-soft-bg" : "border-sand bg-white"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                          selected ? "accent-bg accent-border" : "border-sand-dark"
                        }`}
                      >
                        {selected && <Check size={13} />}
                      </span>
                      <span className="text-scale-xs font-semibold text-forest-dark leading-snug">
                        {task.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-scale-2xs font-bold text-gray-500">2. Con sẽ bắt đầu khi nào?</span>
              <input
                value={anchor}
                onChange={(event) => setAnchor(event.target.value)}
                maxLength={80}
                placeholder="Ví dụ: Sau khi ăn tối"
                className="w-full min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-semibold text-forest-dark focus:outline-none focus:accent-border"
              />
              <div className="flex flex-wrap gap-2">
                {["Sau khi ăn tối", "Sau khi tắm", "Lúc 19:30"].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setAnchor(example)}
                    className="min-h-9 px-3 rounded-full bg-sand-light text-scale-2xs font-semibold text-gray-600"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-scale-2xs font-bold text-gray-500">3. Hành động đầu tiên thật nhỏ</span>
              <input
                value={firstStep}
                onChange={(event) => setFirstStep(event.target.value)}
                maxLength={160}
                placeholder="Ví dụ: Mở sách ở trang đang đọc"
                className="w-full min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-semibold text-forest-dark focus:outline-none focus:accent-border"
              />
              <span className="block text-scale-2xs text-gray-500">
                Có thể dùng nút micro trên bàn phím để nói thay vì gõ.
              </span>
            </label>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Đặt lại
              </Button>
              <Button type="button" onClick={handleSave} className="flex-1">
                Khoá kế hoạch <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    // A0.3 — MICRO-CHOICE: 1 câu hỏi, chạm 1 việc là xong (≤15s). Chống nghịch
    // lý màn hình (rủi ro #1): không giữ trẻ lại điền form 3 bước mỗi tối.
    const heading = allTasksCompleted
      ? isTeen
        ? "Xong hôm nay rồi. Mai bạn bắt đầu từ việc nào?"
        : "Hôm nay xong hết rồi! Mai con bắt đầu từ việc nào?"
      : isTeen
        ? "Mai bạn bắt đầu từ việc nào?"
        : "Ngày mai, con bắt đầu từ việc nào?";
    return (
      <Card className={`no-print ${allTasksCompleted ? "accent-border" : ""} space-y-3`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0">
            <CalendarDays size={20} />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-scale-sm font-bold text-forest-dark leading-snug">{heading}</h3>
            <p className="text-scale-2xs text-gray-500 mt-1">
              Chạm 1 việc — xong. Các việc khác vẫn được giữ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {microCandidates.map((task, index) => (
            <button
              key={task.id}
              type="button"
              onClick={() => handleMicroPick(task.id)}
              className={`w-full min-h-tap text-left rounded-xl px-3 py-3 flex items-center gap-3 border transition-colors ${
                index === 0 ? "accent-border accent-soft-bg" : "border-sand bg-white"
              }`}
            >
              <span className="w-7 h-7 rounded-full accent-soft-bg flex items-center justify-center flex-shrink-0">
                <ArrowRight size={15} />
              </span>
              <span className="text-scale-xs font-semibold text-forest-dark leading-snug flex-grow min-w-0">
                {task.title}
              </span>
              {task.importance && (
                <span className="text-scale-2xs font-bold accent-text flex-shrink-0">Quan trọng</span>
              )}
            </button>
          ))}
        </div>

        {showWoopEntry && (
          <button
            type="button"
            onClick={startEditing}
            className="w-full min-h-9 flex items-center justify-center gap-1 text-scale-2xs font-bold text-gray-500"
          >
            <NotebookPen size={14} /> Thêm chi tiết ngày mai (khi nào · bước đầu)
          </button>
        )}
      </Card>
    );
  }

  return (
    <Card id="tomorrow-plan-print" className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0 no-print">
          <CalendarDays size={20} />
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-scale-2xs font-semibold text-gray-500">
            {phase === "today" ? "Hôm qua con đã chuẩn bị rồi" : "Kế hoạch ngày mai"} · {formatTargetDate(plan.targetDate)}
          </p>
          <h3 className="text-scale-base font-bold text-forest-dark mt-1">
            {phase === "today" ? "Bắt đầu từ đây" : "Đã khoá kế hoạch"}
          </h3>
        </div>
        <div className="flex items-center gap-1 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="hit-target w-9 h-9 rounded-full flex items-center justify-center text-gray-500"
            aria-label="In kế hoạch"
            title="In hoặc lưu PDF"
          >
            <Printer size={17} />
          </button>
          {phase === "tomorrow" && (
            <button
              type="button"
              onClick={startEditing}
              className="hit-target min-w-9 h-9 rounded-full px-2 text-scale-2xs font-bold accent-text"
            >
              Sửa
            </button>
          )}
        </div>
      </div>

      {focusItem && (
        <div className="accent-soft-bg rounded-xl p-3 space-y-2">
          <p className="text-scale-xs font-bold text-forest-dark">{focusItem.title}</p>
          {plan.anchor && <p className="text-scale-2xs text-gray-600">Khi: {plan.anchor}</p>}
          {plan.firstStep && <p className="text-scale-2xs text-gray-600">Bước đầu: {plan.firstStep}</p>}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAll((value) => !value)}
        className="w-full min-h-tap flex items-center justify-between text-scale-2xs font-bold text-gray-600 no-print"
      >
        <span>Toàn bộ {plan.items?.length || 0} việc vẫn được giữ</span>
        {showAll ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <div className={`${showAll ? "block" : "hidden"} print-plan-list space-y-2`}>
        {(plan.items || []).map((item) => (
          <div key={item.taskId} className="flex items-start gap-2 text-scale-xs text-forest-dark">
            <span className="plan-checkbox" aria-hidden="true" />
            <span className={item.taskId === plan.focusTaskId ? "font-bold" : "font-semibold"}>
              {item.title}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 no-print">
        <Button type="button" variant="secondary" onClick={() => window.print()} className="flex-1">
          <Printer size={15} /> In / lưu PDF
        </Button>
        {phase === "tomorrow" && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (confirm("Xóa kế hoạch này để làm lại từ đầu?")) onClear();
            }}
            className="flex-1"
          >
            Xóa & làm lại
          </Button>
        )}
      </div>
    </Card>
  );
}
