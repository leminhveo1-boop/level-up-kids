# 🔨 KẾ HOẠCH XÂY — "APP LÀ CHUYÊN GIA" (bám hạ tầng có sẵn)

> **Người soạn:** Claude Code (model **Fable 5**, `claude-fable-5`) — 03/07/2026
> Thực thi [SPEC_APP_LA_CHUYEN_GIA.md](SPEC_APP_LA_CHUYEN_GIA.md). Mọi bước bám file THẬT trong repo, không vẽ trên giấy.

---

## Hiện trạng hạ tầng (đã kiểm 03/07/2026)

| Mảnh | File | Trạng thái |
|---|---|---|
| Catalog lộ trình | `src/lib/game/journeys.js` | ✅ 12 journeys; **lứa 7–11 có 6**: school_bag, reading, morning (7–9) · homework, chores, sleep (10–12). Chưa có tag painpoint |
| Onboarding | `src/app/(public)/setup/page.js` (431 dòng) | ✅ Có sẵn — chèn bước intake vào đây |
| Chọn lộ trình phòng bố mẹ | `src/features/parent/components/JourneySection.js` (161 dòng) | ✅ Có — nơi hiện đề xuất "kê đơn" |
| Nội dung thẻ | `docs/KHOANH_KHAC_7_11.md` | ⏳ 10 thẻ mẫu **chờ founder đo phản hồi** |
| Email tuần | `supabase/functions/weekly-email` | ✅ Có — chỗ đính lát "Đọc vị con" |
| Dữ liệu hành vi | `context/GameState` (events/history) | ✅ Có sẵn tick/bỏ/duyệt — sensor cho Đọc vị |

## 4 bước xây (thứ tự + phụ thuộc)

### B2 — Intake "chẩn đoán" → kê lộ trình ⚡ *làm được NGAY, không chờ thẻ*
1. `journeys.js`: thêm field `painpoints: []` cho 6 journey 7–11 (vd homework_1012 ← "nản bài", "lười học") + hàm thuần `recommendJourneys(ageBand, painpoints)` → tests vitest.
2. `setup/page.js`: thêm 1 bước ~30s — chọn tuổi + tick tối đa 3–4 painpoint (10 painpoint = đúng danh sách bộ thẻ: nản bài · lười học · mè nheo · nói dối · bừa bộn · ganh em · thua cuộc · điện thoại · ngang bướng · đòi thưởng). Lưu vào state gia đình.
3. `JourneySection.js`: hiện lộ trình **được kê riêng** lên đầu, kèm 1 câu lý do ("Anh/chị chọn 'con hay nản bài' → lộ trình này xây sức bền từng bước") — khoảnh khắc *"app nghiên cứu hộ con tôi"*.
- ⚠️ Quân luật: parent UI monochrome, ít chữ (phụ huynh chê "ngộp"); intake ≤ 2 màn.

### B3 — Thẻ Khoảnh khắc trong phòng bố mẹ 🔒 *chờ duyệt giọng thẻ*
1. `src/lib/game/moments.js` MỚI (logic thuần, audience-agnostic): catalog thẻ {painpoint, trigger, 4 mảnh} + `pickMomentFor(event, state)`.
2. Component `MomentCard` (dùng primitives `ui/Card`) — 1 thẻ/lần, đúng "mỗi màn 1 điểm nhấn".
3. Trigger v1 (từ events có sẵn): bố mẹ **bác** việc → thẻ tương ứng · con **bỏ ≥3 lần** cùng nhóm việc/tuần · **cột mốc lộ trình** (đã có parentTip làm chỗ neo).
- Sau khi founder báo phản hồi 10 thẻ → nhân bộ (mỗi painpoint 3–5 thẻ) rồi mới code bước này.

### B4 — Lát "Đọc vị con" trong weekly-email 🔒 *sau B3*
- `weekly-email`: thêm khối rule-based (KHÔNG AI): quy luật quan sát được → 1 cách đọc soạn sẵn + 1 gợi ý. Trần an toàn theo [DEEP_03](DEEP_03_HIEU_CON.md): mô tả quy luật + "có thể con…", cấm giọng chẩn đoán, cấm quy kết "thao túng".

### B5 — Nút chia sẻ 3 mạch (viral) 🔒 *cuối cùng*
- Theo [DEEP_04](DEEP_04_VIRAL_VN.md); chỉ làm khi B3/B4 chạy thật — viral khuếch đại giá trị đã có, không tạo ra giá trị.

## Nợ kèm theo (đã ghi nhận, xử trong lúc xây)
- **Cân liều thưởng** để không dạy con "làm vì thưởng" + không làm nhiễu sensor Đọc vị (thẻ #10 + DEEP #3).
- 12–13 checklist người lớn: SAU khi 7–11 xong.
- Value Gap quà/việc đúng tuổi: nợ cũ, cùng đợt B2 có thể vá một phần (catalog việc theo painpoint).

---

*Kế hoạch do Claude Code (Fable 5) soạn 03/07/2026, đã kiểm hiện trạng file trong repo. B2 khởi công được ngay; B3–B5 mở khóa theo phản hồi thẻ của founder. Liên quan [[SPEC_APP_LA_CHUYEN_GIA.md]], [[KHOANH_KHAC_7_11.md]], [[DEEP_03_HIEU_CON.md]], [[DEEP_04_VIRAL_VN.md]].*
