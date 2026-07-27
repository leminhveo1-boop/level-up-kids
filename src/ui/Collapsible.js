"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Vùng gấp/mở giảm mật độ phòng bố mẹ (#1 "ít mà rõ").
 *
 * Dùng React state + conditional render thay vì native <details>: đã kiểm chứng
 * <details> đóng KHÔNG ẩn content trong runtime browser/webview của app này.
 *
 * @param {object} props
 * @param {string} props.summary  Nhãn nút mở
 * @param {React.ComponentType<{size?:number}>} [props.icon]  Icon lucide (tùy chọn)
 * @param {boolean} [props.defaultOpen=false]
 * @param {"primary"|"quiet"} [props.tone="primary"]  primary = nút forest; quiet = nút hairline nhạt
 * @param {React.ReactNode} props.children
 */
export default function Collapsible({ summary, icon: Icon, defaultOpen = false, tone = "primary", children }) {
  const [open, setOpen] = useState(defaultOpen);
  const toneCls =
    tone === "primary" ? "bg-forest text-white" : "bg-white text-gray-600 border border-sand";
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full min-h-tap flex items-center justify-center gap-1.5 rounded-xl px-3 text-scale-xs font-black active:scale-[0.98] transition-transform ${toneCls}`}
      >
        {Icon && <Icon size={16} />}
        {summary}
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pt-2.5">{children}</div>}
    </div>
  );
}
