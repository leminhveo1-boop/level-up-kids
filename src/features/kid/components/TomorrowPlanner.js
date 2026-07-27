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
import { getPlanPhase, selectDefaultFocusTask } from "@/lib/game/planning";

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
}) {
  const phase = getPlanPhase(plan);
  const isTeen = uiMode === "teen";
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const fallbackFocus = useMemo(() => selectDefaultFocusTask(tasks)?.id || "", [tasks]);
  const [focusTaskId, setFocusTaskId] = useState(plan?.focusTaskId || fallbackFocus);
  const [firstStep, setFirstStep] = useState(plan?.firstStep || "");
  const [anchor, setAnchor] = useState(plan?.anchor || "");

  const focusItem = plan?.items?.find((item) => item.taskId === plan.focusTaskId);
  const activePlan = phase === "today" || phase === "tomorrow" ? plan : null;

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
              <p className="text-scale-2xs font-bold text-gray-500">Bắt đầu từ việc nào?</p>
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
              <span className="text-scale-2xs font-bold text-gray-500">Con sẽ bắt đầu khi nào?</span>
              <input
                value={anchor}
                onChange={(event) => setAnchor(event.target.value)}
                maxLength={80}
                placeholder="Ví dụ: Sau khi ăn tối"
                className="w-full min-h-tap bg-sand-light border border-sand rounded-xl px-3 text-scale-xs font-semibold text-forest-dark focus:outline-none focus:accent-border"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-scale-2xs font-bold text-gray-500">Bước đầu tiên thật nhỏ là gì?</span>
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

            <Button type="button" onClick={handleSave} className="w-full">
              Lưu kế hoạch ngày mai <ArrowRight size={16} />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <Card className={`no-print ${allTasksCompleted ? "accent-border" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl accent-soft-bg flex items-center justify-center flex-shrink-0">
            <CalendarDays size={20} />
          </div>
          <div className="flex-grow min-w-0">
            <h3 className="text-scale-sm font-bold text-forest-dark">
              {allTasksCompleted ? "Hôm nay đã xong. Chuẩn bị ngày mai nhé" : "Chuẩn bị ngày mai"}
            </h3>
            <p className="text-scale-2xs text-gray-500 mt-1">
              Lập một lần buổi tối, rồi dùng sổ hoặc giấy trong ngày.
            </p>
          </div>
          <Button type="button" onClick={startEditing} className="flex-shrink-0">
            Lập kế hoạch
          </Button>
        </div>
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
            {phase === "today" ? "Kế hoạch hôm nay" : "Kế hoạch ngày mai"} · {formatTargetDate(plan.targetDate)}
          </p>
          <h3 className="text-scale-base font-bold text-forest-dark mt-1">
            {phase === "today" ? "Bắt đầu từ đây" : "Kế hoạch đã sẵn sàng"}
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
        {phase === "today" && (
          <Button type="button" variant="ghost" onClick={onClear} className="flex-1">
            Đã chép vào sổ
          </Button>
        )}
      </div>
    </Card>
  );
}
