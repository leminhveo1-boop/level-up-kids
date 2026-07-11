# 🚀 SESSION BOOTSTRAP — prompt mở phiên mới chạy theo plan

> Dán khối dưới vào **session mới** (Claude Code / gemini CLI / Antigravity), thay `[[TASK]]` bằng ID task từ [PLAN_MAP.md](PLAN_MAP.md). Chọn công cụ theo tier của task (🔷 bulk → gemini/Antigravity; 🔴 spec/verify → Claude Code).

---

## 📋 PROMPT (copy nguyên khối)

```
Bạn tiếp nhận dự án Level Up Kids (app thói quen cho trẻ 7–13 VN, thu 199k/năm qua
SePay, deploy Cloudflare Workers). Làm việc bằng TIẾNG VIỆT.

BƯỚC 0 — ĐỌC TRƯỚC KHI LÀM (nguồn sự thật, theo đúng thứ tự):
1. docs/PLAN_MAP.md   — biết đang ở đâu, task nào, thứ tự, tier model.
2. CLAUDE.md          — kiến trúc + quân luật giao diện + quy tắc báo cáo.
3. docs/SPEC_APP_LA_CHUYEN_GIA.md — 10 quyết định sản phẩm đã chốt.
4. Doc liên quan tới task đang làm (PLAN_MAP chỉ tới).

NHIỆM VỤ PHIÊN NÀY: [[TASK]]   (ví dụ: "PROD-3 — mở rộng catalog việc theo painpoint")
Làm ĐÚNG một task này, đúng DoD ghi trong PLAN_MAP. Không tự mở rộng phạm vi.

LUẬT CỨNG (vi phạm là hỏng thật, không được bỏ):
- AN TOÀN NỘI DUNG (thẻ Khoảnh khắc / Đọc vị con): giọng ẨN khoa học — KHÔNG thuật
  ngữ (Erikson/SDT...) trong text hiện cho bố mẹ; CẤM chẩn đoán tâm lý trẻ; CẤM quy
  kết kiểu "con thao túng/chọc tức". Chỉ mô tả + lăng kính rộng lượng. (docs/DEEP_03_HIEU_CON.md)
- DỮ LIỆU THẬT: preview nối Supabase PRODUCTION — KHÔNG mutate dữ liệu trẻ thật.
  Verify bằng /demo hoặc unit test. Có account test chưa-premium khoabuia1+luk040726
  (hỏi chủ dự án mật khẩu; verify xong ĐĂNG XUẤT).
- TEST + BUILD: `npx vitest run` phải XANH 100%. Build `npm run build`. TUYỆT ĐỐI
  không chạy build khi dev server đang chạy (hỏng cache .next).
- TDD cho logic: viết test đỏ trước → code cho xanh.
- GIAO DIỆN: parent monochrome (#F2F3F5, viền hairline, chữ thường, xanh forest chỉ
  cho primary); kid ấm + 1 accent xanh #2E7CD6. Icon = lucide-react, CẤM emoji làm
  icon chrome. Thư mục mới phải thêm glob vào tailwind.config content.
- BÁO CÁO BẰNG CHỨNG: chỉ báo "xong" khi có bằng chứng (output test/build, grep,
  screenshot). Chưa verify được thì nói thẳng "chưa verify", không đoán.

QUY TRÌNH KẾT THÚC:
- Xong + verify → commit tiếng Việt, conventional commits, KHÔNG attribution.
- Nếu là thay đổi observable trên web + đã verify → có thể deploy `npm run cf:deploy`.
  (Refactor lớn thì branch riêng, baby-step, không deploy giữa chừng.)
- Cập nhật trạng thái task trong docs/PLAN_MAP.md (tick + đổi ký hiệu).
- Báo lại: đã làm gì, bằng chứng gì, còn nợ gì.

Bắt đầu bằng việc đọc PLAN_MAP.md rồi xác nhận DoD của [[TASK]] trước khi code.
```

---

## 🎯 Chọn công cụ theo task (tra PLAN_MAP cột "Model/Công cụ")

| Task sẵn sàng chạy | Tier | Mở session bằng |
|---|---|---|
| **PROD-1** cân liều thưởng | 🔴 spec → 🟡 impl → 🔴 verify | **Claude Code** (đụng kinh tế lõi + an toàn) |
| **PROD-3** mở rộng catalog việc theo painpoint | 🔷 nội dung theo mẫu | **gemini CLI / Antigravity** (bulk, quota Google) |
| **PROD-4** giảm "ngộp" tab Tuần | 🟡 / 🔷 | Claude Sonnet hoặc gemini |
| ~~EXP-2b, EXP-3, EXP-4~~ | 🔒 bị chặn | chưa mở được (chờ WAIT-1 / OPS / PROD-1) |

**gemini CLI (không tốn token Claude), chạy an toàn:**
```bash
cd "D:/Antigravity/Pain Tool/Level Up Kids/level-up-kids"
gemini -p "$(cat docs/SESSION_BOOTSTRAP.md | sed -n '/PROMPT/,/```$/p')" --approval-mode auto_edit
```
(hoặc mở Antigravity IDE, dán khối PROMPT vào chat của nó). Dùng `auto_edit` (chỉ tự
duyệt sửa file), KHÔNG dùng `--yolo`. Xong đem kết quả nhờ Claude soát an toàn 1 lượt.

---

*Bootstrap do Claude Code lập 04/07/2026. Cập nhật cùng PLAN_MAP khi luật/đường dẫn đổi.*
