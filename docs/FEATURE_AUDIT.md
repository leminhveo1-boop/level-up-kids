# ⭐ AUDIT TÍNH NĂNG & LỘ TRÌNH NÂNG CẤP 10 SAO — Level Up Kids

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`)
> **Thời điểm:** 30/06/2026 — sau khi hoàn tất Production V1 (branch `feat/production-v1`)
> **Bối cảnh kinh doanh:** Bán trực tiếp cho phụ huynh VN, mô hình **Demo → Trả phí 199.000₫/năm** (không có tầng free). Mọi đề xuất dưới đây được chấm theo tiêu chí: *có làm tăng tỷ lệ mua (conversion) hoặc tỷ lệ gia hạn (retention) không?*

---

## 1. Bảng chấm sao tính năng hiện có

Thang 10 ⭐. "Điểm nâng cấp" = tiềm năng nếu làm các đề xuất ở mục 2.

| # | Tính năng | Hiện tại | Tiềm năng | Nhận xét ngắn |
|---|-----------|:---:|:---:|---|
| 1 | Nhiệm vụ ngày + EXP/level/5 chỉ số | ⭐7 | ⭐9 | Lõi tốt, nhưng nhiệm vụ tĩnh — làm mãi 10 việc sẽ chán sau 2-3 tuần |
| 2 | Streak 🔥 | ⭐6 | ⭐9 | Có multiplier nhưng **mất streak = mất trắng** → trẻ nản bỏ app (bài học từ Duolingo) |
| 3 | Đào mỏ + Hero Coin | ⭐8 | ⭐9 | Cơ chế "nghiện" tốt nhất app; thiếu chiều sâu (chỉ 1 loại đá, click lặp) |
| 4 | Pet / ấp trứng / thú cưỡi | ⭐7 | ⭐10 | Driver cảm xúc số 1 của trẻ, nhưng pet hiện **không làm gì** ngoài buff ẩn — cần "sống" hơn |
| 5 | Boss tuần | ⭐4 | ⭐8 | Gần như trang trí: đánh boss thụ động qua tick nhiệm vụ, không có phần thưởng riêng rõ |
| 6 | Đổi giờ giải trí + timer khóa | ⭐8 | ⭐9 | Giá trị "bán cho bố mẹ" mạnh nhất — đây là painkiller thật sự |
| 7 | Cửa hàng đổi quà thật | ⭐7 | ⭐9 | Hoạt động tốt; thiếu ảnh quà, thiếu "mục tiêu lớn" trực quan để trẻ nhìn mỗi ngày |
| 8 | Phòng quản trị bố mẹ | ⭐7 | ⭐9 | Đủ CRUD nhưng bố mẹ phải "vận hành tay" nhiều (reset ngày, duyệt từng lần bằng PIN trên máy con) |
| 9 | Thư bồ câu động viên | ⭐8 | ⭐9 | Điểm chạm cảm xúc rất riêng — nên khai thác sâu hơn (ảnh, voice) |
| 10 | Multi-child + cloud sync | ⭐8 | ⭐9 | Mới xây V1, chắc; thiếu app "điều khiển từ xa" cho bố mẹ |
| 11 | PWA offline | ⭐7 | ⭐8 | Đã có SW; thiếu push notification — mảnh ghép retention lớn nhất còn thiếu |
| 12 | Demo → Paywall | ⭐8 | ⭐9 | Funnel gọn; thiếu số liệu đo (analytics) để tối ưu |
| 13 | Báo cáo tiến bộ cho bố mẹ | ⭐2 | ⭐10 | **Lỗ hổng lớn nhất**: 5 thanh chỉ số tĩnh, không có dữ liệu theo thời gian — trong khi đây chính là "lý do trả tiền & gia hạn" của người cầm ví |
| 14 | Âm thanh/hiệu ứng | ⭐6 | ⭐8 | Có confetti + beep; thiếu nhạc nền, thiếu nút tắt tiếng |
| 15 | Onboarding người mới | ⭐5 | ⭐9 | Có demo nhưng vào app thật thì bố mẹ phải tự mò; chưa có wizard 3 bước đầu tiên |

**Điểm trung bình hiện tại: ~6.5/10 → tiềm năng sau lộ trình: ~9/10**

---

## 2. Đề xuất nâng cấp — xếp theo ROI kinh doanh

### 🥇 Nhóm A — Tăng GIA HẠN (làm trước, vì 199k/năm sống chết ở năm thứ 2)

**A1. Báo Cáo Tuần Cho Bố Mẹ 📊 (tính năng đáng tiền nhất chưa có)**
- Lưu `daily_snapshots` (ngày, số nhiệm vụ xong, điểm, phút màn hình đã dùng) — thêm 1 bảng Supabase
- Màn "Báo cáo tuần" trong phòng bố mẹ: biểu đồ 7 ngày, so sánh tuần trước, top nhiệm vụ hay bỏ
- Gửi email tóm tắt tuần (Supabase Edge Function + Resend) — *mỗi email tuần là 1 lần nhắc "app này đáng tiền"*
- Ước lượng: 3-4 ngày công

**A2. Push Notification (PWA Web Push) 🔔**
- Nhắc trẻ buổi sáng ("Nhiệm vụ mới đã mở! ⚡"), nhắc streak sắp đứt buổi tối, báo bố mẹ khi con xin đổi quà
- Retention loop hoàn chỉnh: không có push, app "out of sight, out of mind"
- Ước lượng: 2-3 ngày (VAPID + bảng subscriptions + Edge Function cron)

**A3. Streak Freeze / Thẻ Đóng Băng ❄️**
- 1 ngày nghỉ không mất streak (mua bằng Hero Coin hoặc bố mẹ tặng) — chống hiệu ứng "đứt gánh bỏ app"
- Ước lượng: 0.5 ngày (thuần logic economy, dễ test)

### 🥈 Nhóm B — Tăng CHIỀU SÂU cho trẻ (chống chán tháng thứ 2+)

**B1. Pet "sống" hơn 🐾**
- Pet đói theo ngày (quên cho ăn 3 ngày → buồn, mất buff — không chết, tránh tàn nhẫn)
- Pet xuất hiện trên dashboard với animation + câu thoại ngẫu nhiên ("Đi đào mỏ không anh hùng?")
- Bộ sưu tập pet (Pokédex mini) — sưu tầm = lý do cày dài hạn

**B2. Boss tuần thành sự kiện thật 👾**
- Boss có loot riêng (rương boss: coin lớn + trứng hiếm), HP scale theo tuần
- Cả nhà cùng đánh: nhiều con → mỗi bé góp damage, dạy teamwork anh chị em
- Lịch boss xoay vòng 4 con/tháng với hình dạng khác nhau (Thần Lười, Quỷ Bừa Bộn, Ma Cáu Kỉnh, Rồng Trì Hoãn)

**B3. Mùa & sự kiện (Seasons) 🎃**
- Skin đào mỏ theo mùa (Trung Thu, Tết, Hè) + nhiệm vụ sự kiện giới hạn
- Lý do quay lại hằng quý + chất liệu marketing ("Sự kiện Tết đã mở!")

**B4. Tùy biến avatar 🎨**
- Mở khóa trang phục/màu/khung avatar bằng Hero Coin — coin sink mới (hiện coin chỉ để đổi quà thật, dễ tồn kho)

### 🥉 Nhóm C — Giảm ma sát cho bố mẹ (tăng conversion + word-of-mouth)

**C1. Onboarding wizard 3 bước** — sau khi thanh toán: tạo con → chọn 5 nhiệm vụ gợi ý theo tuổi → đặt 3 phần quà đầu tiên. Từ "trả tiền" đến "con chơi được" dưới 3 phút.
**C2. Duyệt quà từ xa** — bố mẹ mở app trên máy mình thấy yêu cầu đổi quà realtime (Supabase Realtime), bấm duyệt không cần nhập PIN trên máy con.
**C3. QR đăng nhập máy con** — máy bố mẹ quét sinh session cho máy con, con không cần biết mật khẩu tài khoản.
**C4. Analytics funnel** — đếm sự kiện demo_start / paywall_view / payment_success (bảng events đơn giản) để biết rơi ở đâu mà chỉnh.

### Nhóm D — Nợ kỹ thuật còn lại (từ audit trước, chưa xử lý hết)

- D1. Dịch i18n phần màn hình game (dashboard/mining/parent) — hiện mới phủ auth/premium/demo
- D2. Icon thương hiệu thật thay icon placeholder
- D3. E2E test (Playwright) cho funnel demo → thanh toán → tạo con
- D4. Tách nhỏ `parent/page.js` (1261 dòng) thành các section component

---

## 3. Lộ trình đề xuất

| Bản | Nội dung | Mục tiêu kinh doanh |
|---|---|---|
| **V1.1** (1 tuần) | A3 Streak Freeze + C1 Onboarding wizard + C4 Analytics + D2 icon | Bịt lỗ rò conversion ngay khi mở bán |
| **V1.2** (2-3 tuần) | A1 Báo cáo tuần + A2 Push notification + C2 duyệt từ xa | Vũ khí gia hạn + lý do tăng giá sau này |
| **V1.3** (3-4 tuần) | B1 Pet sống + B2 Boss sự kiện + B4 avatar | Chống chán, giữ trẻ cày tháng 2-6 |
| **V2** (quý sau) | B3 Seasons + C3 QR login + D1 i18n full + D3 E2E | Mở rộng thị trường + chất lượng 10 sao |

**Quy tắc vàng khi làm thêm tính năng:** mọi cơ chế mới phải đi qua `lib/game/*` thuần + unit test (như economy hiện tại), và phải trả lời được "tính năng này giúp *bán* hay giúp *giữ*?" — nếu không giúp cả hai thì để V2+.

---

*Tài liệu do Claude Code (Opus 4.8) soạn ngày 30/06/2026 để phục vụ thảo luận roadmap; ước lượng ngày công là tương đối, cần review lại khi bắt tay làm.*
