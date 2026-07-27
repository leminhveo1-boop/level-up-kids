"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameState";
import {
  WEEKDAY_KEYS,
  createEmptyTimetable,
  createSampleTimetableText,
  generateTimetableTasks,
  parseTimetableText,
  TIMETABLE_TASK_DEFAULTS,
} from "@/lib/game/timetable";
import Collapsible from "@/ui/Collapsible";
import {
  Backpack,
  BookOpen,
  CalendarDays,
  FileText,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

/** Nhãn thứ tiếng Việt cho từng ô lịch. */
const WEEKDAY_LABELS = {
  mon: "Thứ 2",
  tue: "Thứ 3",
  wed: "Thứ 4",
  thu: "Thứ 5",
  fri: "Thứ 6",
  sat: "Thứ 7",
  sun: "Chủ nhật",
};

/**
 * 📅 Thời khóa biểu — bố mẹ nhập TKB lớp MỘT LẦN, app tự sinh nhiệm vụ học mỗi ngày.
 * Sửa cờ môn = sửa gợi ý (nối #2). Mọi thay đổi cấu trúc commit ngay → board con cập nhật sống.
 */
export default function TimetableSection({ showFlash }) {
  const { timetable, setTimetable, charName } = useGame();
  const tt = timetable || createEmptyTimetable();
  const subjects = tt.subjects || {};
  const subjectList = Object.values(subjects);
  const defaults = { ...TIMETABLE_TASK_DEFAULTS, ...(tt.taskDefaults || {}) };

  const [newName, setNewName] = useState("");
  const [quickText, setQuickText] = useState("");
  const [quickError, setQuickError] = useState("");

  const commit = (next) => setTimetable(next);

  const addSubject = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;
    commit({ ...tt, subjects: { ...subjects, [id]: { id, name, hasHomework: true, needsPrep: true } } });
    setNewName("");
    showFlash?.("Đã thêm môn học! ✅");
  };

  const toggleFlag = (id, flag) => {
    const s = subjects[id];
    if (!s) return;
    commit({ ...tt, subjects: { ...subjects, [id]: { ...s, [flag]: !s[flag] } } });
  };

  const deleteSubject = (id) => {
    const nextSubjects = { ...subjects };
    delete nextSubjects[id];
    const nextWeek = Object.fromEntries(
      WEEKDAY_KEYS.map((k) => [k, (tt.week?.[k] || []).filter((x) => x !== id)])
    );
    commit({ ...tt, subjects: nextSubjects, week: nextWeek });
  };

  const assign = (dayKey, subjectId) => {
    if (!subjectId) return;
    const day = tt.week?.[dayKey] || [];
    if (day.includes(subjectId)) return;
    commit({ ...tt, week: { ...tt.week, [dayKey]: [...day, subjectId] } });
  };

  const unassign = (dayKey, subjectId) => {
    commit({ ...tt, week: { ...tt.week, [dayKey]: (tt.week?.[dayKey] || []).filter((x) => x !== subjectId) } });
  };

  const setDefault = (key, value) => {
    commit({ ...tt, taskDefaults: { ...defaults, [key]: Math.max(0, parseInt(value) || 0) } });
  };

  const toggleEnabled = () => commit({ ...tt, enabled: !(tt.enabled ?? true) });

  const importQuickText = () => {
    const result = parseTimetableText(quickText);
    if (!result.success) {
      setQuickError("Chưa đọc được lịch. Mỗi dòng cần bắt đầu như “T2:” hoặc “Thứ 2:”.");
      return;
    }
    commit({
      ...result.timetable,
      taskDefaults: tt.taskDefaults,
      updatedAt: Date.now(),
    });
    setQuickError("");
    showFlash?.("Đã tạo thời khóa biểu từ nội dung vừa dán! ✅");
  };

  const useSample = () => {
    setQuickText(createSampleTimetableText());
    setQuickError("");
  };

  const clearTimetable = () => {
    if (!confirm("Xóa toàn bộ môn và lịch học hiện tại?")) return;
    commit(createEmptyTimetable());
    setQuickText("");
    setQuickError("");
    showFlash?.("Đã xóa thời khóa biểu.");
  };

  const enabled = tt.enabled ?? true;
  const preview = enabled ? generateTimetableTasks(tt, new Date()) : [];

  return (
    <div className="bg-white border border-sand rounded-xl p-4 space-y-3">
      {/* Header + công tắc tổng */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-scale-sm font-black text-forest-dark flex items-center gap-1.5">
          <CalendarDays size={16} /> Thời khóa biểu
        </h3>
        <button
          onClick={toggleEnabled}
          className={`min-h-tap px-3 rounded-xl text-scale-2xs font-black border transition-colors ${
            enabled ? "bg-forest text-white border-forest" : "bg-white text-gray-500 border-sand"
          }`}
        >
          {enabled ? "Đang bật" : "Đang tắt"}
        </button>
      </div>

      <p className="text-scale-2xs text-gray-500 font-medium leading-relaxed">
        Dán lịch lớp một lần. App sẽ tự nhắc {charName || "con"} làm bài hôm nay và soạn cặp cho ngày mai.
      </p>

      {enabled && (
        <>
          <div className="bg-sand-light rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-forest" />
              <p className="text-scale-xs font-bold text-forest-dark">Cách nhanh nhất: dán nguyên lịch</p>
            </div>
            <textarea
              value={quickText}
              onChange={(event) => {
                setQuickText(event.target.value);
                setQuickError("");
              }}
              rows={6}
              placeholder={"T2: Toán, Tiếng Việt, Tiếng Anh\nT3: Toán, Khoa học\nT4: Tiếng Việt, Thể dục"}
              className="w-full bg-white border border-sand rounded-xl px-3 py-2 text-scale-xs font-semibold text-forest-dark focus:outline-none focus:border-forest resize-y"
            />
            {quickError && <p className="text-scale-2xs font-semibold text-terracotta">{quickError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={importQuickText}
                disabled={!quickText.trim()}
                className="flex-1 min-h-tap bg-forest text-white text-scale-xs font-bold rounded-xl disabled:opacity-40"
              >
                Tạo lịch
              </button>
              <button
                type="button"
                onClick={useSample}
                className="min-h-tap px-3 bg-white border border-sand text-gray-600 text-scale-2xs font-bold rounded-xl"
              >
                Xem bản mẫu
              </button>
            </div>
            <p className="text-scale-2xs text-gray-500">
              Mỗi dòng là một thứ. Ngăn các môn bằng dấu phẩy; ngày nghỉ có thể để trống.
            </p>
          </div>

          <Collapsible
            summary={`Chỉnh chi tiết${subjectList.length ? ` · ${subjectList.length} môn` : ""}`}
            icon={SlidersHorizontal}
          >
          <div className="space-y-3">
          {/* ---- Danh mục môn ---- */}
          <div className="bg-sand-light border border-sand rounded-xl p-3 space-y-2">
            <p className="text-scale-2xs font-black text-gray-500 uppercase tracking-wider">Môn học & quy tắc</p>

            <form onSubmit={addSubject} className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên môn (Toán, Văn, Anh...)"
                maxLength={24}
                className="flex-grow min-h-tap bg-white border border-sand rounded-xl px-3 text-scale-xs font-bold text-forest-dark focus:outline-none focus:border-forest"
              />
              <button
                type="submit"
                className="min-h-tap flex-shrink-0 bg-forest text-white text-scale-2xs font-black px-3 rounded-xl flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Plus size={14} /> Thêm
              </button>
            </form>

            {subjectList.length === 0 ? (
              <p className="text-scale-2xs text-gray-400 font-medium italic">Chưa có môn nào — thêm môn để bắt đầu.</p>
            ) : (
              <div className="space-y-1.5">
                {subjectList.map((s) => (
                  <div key={s.id} className="bg-white border border-sand rounded-xl px-2.5 py-2 flex items-center gap-2">
                    <span className="flex-grow text-scale-2xs font-black text-forest-dark truncate" title={s.name}>{s.name}</span>
                    <button
                      onClick={() => toggleFlag(s.id, "hasHomework")}
                      title="Có bài tập về nhà?"
                      className={`min-h-tap px-2 rounded-lg text-[11px] font-black border flex items-center gap-1 transition-colors ${
                        s.hasHomework ? "bg-forest text-white border-forest" : "bg-white text-gray-400 border-sand"
                      }`}
                    >
                      <BookOpen size={12} /> Bài tập
                    </button>
                    <button
                      onClick={() => toggleFlag(s.id, "needsPrep")}
                      title="Cần soạn/xem bài trước?"
                      className={`min-h-tap px-2 rounded-lg text-[11px] font-black border flex items-center gap-1 transition-colors ${
                        s.needsPrep ? "bg-forest text-white border-forest" : "bg-white text-gray-400 border-sand"
                      }`}
                    >
                      <Backpack size={12} /> Soạn bài
                    </button>
                    <button
                      onClick={() => deleteSubject(s.id)}
                      className="min-w-tap min-h-tap flex items-center justify-center text-terracotta hover:text-red-700 flex-shrink-0"
                      title="Xóa môn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- Xếp lịch tuần ---- */}
          {subjectList.length > 0 && (
            <div className="bg-sand-light border border-sand rounded-xl p-3 space-y-2">
              <p className="text-scale-2xs font-black text-gray-500 uppercase tracking-wider">Xếp môn theo thứ</p>
              {WEEKDAY_KEYS.filter((k) => k !== "sun").concat("sun").map((dayKey) => {
                const dayIds = tt.week?.[dayKey] || [];
                const unassigned = subjectList.filter((s) => !dayIds.includes(s.id));
                return (
                  <div key={dayKey} className="flex items-start gap-2">
                    <span className="text-scale-2xs font-black text-forest-dark w-16 flex-shrink-0 pt-1.5">{WEEKDAY_LABELS[dayKey]}</span>
                    <div className="flex-grow flex flex-wrap items-center gap-1.5">
                      {dayIds.length === 0 && <span className="text-scale-2xs text-gray-400 font-medium pt-1.5">nghỉ</span>}
                      {dayIds.map((id) => subjects[id] && (
                        <button
                          key={id}
                          onClick={() => unassign(dayKey, id)}
                          className="text-[11px] font-black text-forest-dark bg-white border border-forest/30 rounded-full pl-2.5 pr-1.5 py-1 flex items-center gap-1 active:scale-95 transition-transform"
                          title="Bỏ khỏi ngày này"
                        >
                          {subjects[id].name} <span className="text-terracotta">×</span>
                        </button>
                      ))}
                      {unassigned.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => { assign(dayKey, e.target.value); e.target.value = ""; }}
                          className="min-h-tap bg-white border border-sand rounded-full px-2 text-[11px] font-bold text-gray-500 focus:outline-none"
                        >
                          <option value="" disabled>+ môn</option>
                          {unassigned.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ---- Điểm mặc định (decision C — cho chỉnh) ---- */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-scale-2xs font-black text-gray-500">Điểm mỗi nhiệm vụ:</span>
            {[["exp", "EXP/Điểm ⭐"], ["energy", "NL ⚡"]].map(([key, label]) => (
              <label key={key} className="text-scale-2xs font-bold text-gray-500 flex items-center gap-1">
                {label}
                <input
                  type="number"
                  min={0}
                  value={key === "exp" ? defaults.exp : defaults.energy}
                  onChange={(e) => {
                    if (key === "exp") { setDefault("exp", e.target.value); setDefault("points", e.target.value); }
                    else setDefault("energy", e.target.value);
                  }}
                  className="w-14 min-h-tap bg-white border border-sand rounded-lg px-2 text-scale-xs font-bold text-forest-dark focus:outline-none"
                />
              </label>
            ))}
          </div>
          </div>
          </Collapsible>

          {subjectList.length > 0 && (
            <button
              type="button"
              onClick={clearTimetable}
              className="w-full min-h-tap flex items-center justify-center gap-2 text-scale-2xs font-bold text-gray-500"
            >
              <RotateCcw size={14} /> Xóa lịch và làm lại
            </button>
          )}

          {/* ---- Xem trước hôm nay ---- */}
          <div className="bg-forest-light/20 border border-forest/20 rounded-xl p-3 space-y-1">
            <p className="text-scale-2xs font-black text-forest-dark uppercase tracking-wider">📋 Hôm nay con sẽ có</p>
            {preview.length === 0 ? (
              <p className="text-scale-2xs text-gray-500 font-medium">Chưa có nhiệm vụ học nào cho hôm nay.</p>
            ) : (
              preview.map((t) => (
                <p key={t.id} className="text-scale-2xs font-bold text-gray-600">• {t.title}</p>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
