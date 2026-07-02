# 🎭 PERSONA JTBD + TEST GIẢ LẬP TRẢI NGHIỆM & SỔ NỢ TÍNH NĂNG

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 02/07/2026
> **Mục đích:** (1) Liệt kê tính năng còn nợ so với các roadmap đã cam kết trong docs; (2) Dựng 5 persona theo khung **Jobs To Be Done** và chạy test giả lập từng hành trình để lộ ra khoảng trống trải nghiệm → xác định đúng cái cần hoàn thiện.
> ⚠️ *Test giả lập dựa trên đọc mã + smoke test, KHÔNG thay thế test với người thật. Persona là công cụ tư duy, không phải dữ liệu thị trường.*

---

## PHẦN 1 — SỔ NỢ TÍNH NĂNG (đối chiếu roadmap đã cam kết)

> **CẬP NHẬT 02/07/2026:** Đã trả xong D1–D3 (Đợt Sức Sống), Teen reframe, D8 (so-với-chính-mình + auto-duyệt Uy Tín), **referral 2 chiều +6 tháng**, **D5 Cây Thế Giới + D6 Căn Cứ Anh Hùng + D7 Mùa**, và **D4 chia nhỏ việc hay bỏ (Fogg)**. Nợ kỹ thuật đã trả: tách dashboard, E2E luồng tiền, i18n VI/EN toàn màn game. **Còn lại DUY NHẤT: D9 friend V2** — hoãn tới đợt audit an toàn/kiểm duyệt trước launch (trẻ kết nối xuyên gia đình). Cần **chạy migration 0009_referral.sql trên Supabase** để referral hoạt động.

### ✅ Đã làm (điểm qua)
Escrow/Uy Tín (đã redesign V1.3), Kanban, Goal bar, Bồ câu 2 chiều, Tốt nghiệp thói quen 🎓, Streak freeze, Onboarding wizard, Analytics, Báo cáo tuần + chart, Push, Email tuần, Duyệt từ xa realtime, Avatar cosmetics (Góc Của Tớ), Sổ Vàng, Thẻ Khoe Con, Teen Mode, Parent-log, đa gia đình/đa con, Demo→Paid, SePay HMAC.

### 🔴 CÒN NỢ — theo mức ưu tiên khoa học/ROI

| # | Tính năng nợ | Nguồn cam kết | Trạng thái | Vì sao còn quan trọng |
|---|---|---|:--:|---|
| D1 | **Pet "sống"** (đói theo ngày, thoại trên dashboard, bộ sưu tập Pokédex) | FEATURE_AUDIT B1 | ❌ chưa | Pet là driver cảm xúc số 1 của trẻ, hiện chỉ là buff tĩnh — chống chán tháng 2+ |
| D2 | **Boss tuần thành sự kiện thật** (loot riêng, HP scale, co-op anh em) | FEATURE_AUDIT B2, UX_AUDIT | ⚠️ khung trang trí | `boss/page.js` hiện gần như trang trí (audit chấm 4/10), không có phần thưởng riêng |
| D3 | **Co-op & tặng đồ giữa anh chị em** (Friend V1 trong nhà) | UX_AUDIT Phần 7.2 | ⚠️ mới thấy nhau | Family strip đã cho thấy nhau, nhưng chưa đánh boss chung / tặng vật phẩm |
| D4 | **Habit stacking + tự chia nhỏ nhiệm vụ hay fail** | SCIENTIFIC P2 (Fogg) | ❌ chưa | Nhiệm vụ liên tục bỏ → app nên gợi ý chia nhỏ thay vì để trẻ nản |
| D5 | **Cây Thế Giới gia đình 🌳** (sứ mệnh chung, Octalysis CD1) | SCIENTIFIC P2, UX 7.1 | ❌ chưa | Drive "Ý nghĩa/Sứ mệnh" đang yếu (4/10) — biến việc nhà thành "nuôi khu rừng của nhà" |
| D6 | **Căn Cứ Anh Hùng** (trang trí phòng ảo bằng coin) | SCIENTIFIC P3, UX 7.1 | ❌ chưa | Coin sink sâu hơn + sáng tạo (CD3); hiện coin chỉ đổi quà thật + cosmetics nhẹ |
| D7 | **Mùa 6-8 tuần + lễ tổng kết** (Fresh Start) | SCIENTIFIC P3 | ❌ chưa | Cho trẻ đang tụt dốc cơ hội "làm lại"; chất liệu marketing theo mùa |
| D8 | **So-với-chính-mình tường minh** ("+18% so với tuần trước") + league nhóm | UX 7.3 | ⚠️ có chart | Có biểu đồ 7 ngày nhưng chưa có câu so sánh động lực rõ ràng |
| D9 | **Friend V2** (friend-code 2 nhà quen, sticker cổ vũ) | UX 7.2 | ❌ chưa | Mở rộng xã hội an toàn — để sau, cần kiểm soát kỹ |

### 🟡 NỢ KỸ THUẬT / VẬN HÀNH (không phải tính năng người dùng)
- E2E Playwright cho luồng tiền · i18n màn game chính (VI/EN) · tách `dashboard/page.js` (1049 dòng) · a11y audit chính thức · tension "phần thưởng = giờ màn hình" (cân lại) · SePay/domain/CF-token config tay.

---

## PHẦN 2 — 5 PERSONA JTBD + TEST GIẢ LẬP

> Khung JTBD: *"Khi [tình huống], tôi muốn [động lực], để [kết quả mong đợi]."* Persona xoay quanh **công việc họ thuê app làm**, không phải nhân khẩu học.

---

### 👩‍💼 Persona 1 — "Mẹ Bận Rộn" (Người trả tiền + vận hành)
**Job:** *"Khi tôi đi làm cả ngày không kèm con được, tôi muốn một hệ thống tự chạy giúp con hình thành thói quen tốt, để tôi bớt cằn nhằn và bớt cảm giác tội lỗi."*

**Hành trình giả lập:** cài → demo thấy "Bé Demo" đẹp → mua 199k qua QR (tự kích hoạt) → wizard 3 bước → tối mở app duyệt lô 30 giây → nhận email tuần.

- ✅ **Job được phục vụ tốt:** auto-approve 24h (quên vẫn ổn), parent-log tick giúp, duyệt gộp, push nhắc 20h, email tuần, Sổ Vàng gợi ý lời khen.
- 🔴 **Khoảng trống:** không có **"chế độ tự lái"** cho tuần bận — vd tự duyệt các việc trust-only của con có Uy Tín cao, chỉ hỏi khi bất thường. Hiện vẫn phải mở app mỗi tối. → *gợi ý: "Auto-duyệt thông minh" cho con Uy Tín ≥80 (đã có trust score, chỉ cần nối).* 

---

### 📺 Persona 2 — "Bố Chống Màn Hình"
**Job:** *"Khi con đòi TV/iPad liên tục, tôi muốn biến giờ màn hình thành phần thưởng có kiểm soát, để không phải cãi nhau mỗi ngày."*

- ✅ **Tốt:** giới hạn phút/ngày + lần/tuần, timer đếm ngược, gate nhiệm vụ bắt buộc trước khi đổi, tỷ giá minh bạch.
- 🟡 **Tension gốc chưa giải:** phần thưởng lớn thường LẠI là giờ màn hình → app vừa hạn chế vừa phát screen time. → *gợi ý: đẩy mạnh quà-thật + trải nghiệm-gia-đình lên đầu store, gắn nhãn "không màn hình"; D6 Căn Cứ / D5 Cây làm coin sink phi-màn-hình.*

---

### 🧒 Persona 3 — "Bé 8 tuổi" (Người dùng chính, Kid Mode)
**Job:** *"Khi làm việc nhà chán, tôi muốn cảm giác như chơi game và khoe được với em/bạn, để việc tốt trở nên đáng làm."*

**Hành trình:** tick nhiệm vụ → EXP/coin → đào mỏ → ấp pet → Góc Của Tớ mua mũ.

- ✅ **Tốt:** gacha đào mỏ, pet, cosmetics, streak, tốt nghiệp, goal bar.
- 🔴 **Khoảng trống lớn nhất:**
  - **Pet vô hồn (D1):** ấp xong pet không làm gì trên dashboard — trẻ 8 tuổi mong pet "sống", đói, nói chuyện.
  - **Khoe/đọ với em còn hời hợt (D3):** thấy tên em trong "Nhà Mình" nhưng không tặng đồ / không đánh boss chung → thiếu chất "cùng chơi".
  - **Boss chán (D2):** đánh boss thụ động, không có rương loot → không có đỉnh cảm xúc hằng tuần.

---

### 🎧 Persona 4 — "Teen 13 tuổi" (Teen Mode)
**Job:** *"Khi bố mẹ bắt làm việc nhà, tôi muốn thứ không trẻ con và cho tôi tiền/quyền tự chủ thật, để không thấy bị kiểm soát."*

- ✅ **Tốt:** dark theme, giọng coach, hiện quy đổi VNĐ, không confetti thừa.
- 🔴 **Khoảng trống:** Teen Mode mới là **lớp da** — nội dung game (pet, ấp trứng, "Ấn Pháp Anh Hùng") vẫn nguyên chất nhi đồng khi teen mở ra → **cringe**. i18n màn game chưa xong nên không có lối thoát ngôn ngữ. → *gợi ý: teen cần reframe/ẩn pet→"collection", boss→"weekly challenge", và một "sổ tiền tiêu vặt" nghiêm túc hơn (đồng bộ với D2/D6).* **Đây là nợ khiến nửa thị trường 12+ vẫn chưa dùng được thật.**

---

### 👵 Persona 5 — "Người mua quà hoài nghi" (Bố ở xa / ông bà)
**Job:** *"Khi cân nhắc trả 199k hoặc tặng, tôi muốn bằng chứng con thật sự tiến bộ, để thấy đáng tiền và khoe được."*

- ✅ **Tốt:** báo cáo tuần + chart, Thẻ Khoe Con (share FB/Zalo), email tuần.
- 🟡 **Khoảng trống:** chưa có **so-với-chính-mình tường minh (D8)** ("tuần này +18%") — bằng chứng tiến bộ đang là biểu đồ thô, chưa thành 1 câu khiến người mua "gật". Chưa có mã giới thiệu hoạt động end-to-end (thẻ khoe có nhắc nhưng chưa nối referral thật).

---

## PHẦN 3 — TỔNG HỢP: cái cần HOÀN THIỆN (xếp theo tần suất đau qua các persona)

| Hạng | Tính năng | Chạm mấy persona | Lý do |
|:--:|---|:--:|---|
| **1** | **D1 Pet "sống"** | Bé 8t (mạnh) | Driver giữ chân số 1, rẻ, đã có nền pet |
| **2** | **D2 Boss sự kiện + D3 co-op anh em** | Bé 8t, Teen | Đỉnh cảm xúc tuần + chất "cùng chơi" gia đình |
| **3** | **Teen content reframe** (pet→collection, boss→challenge) | Teen (chặn thị trường 12+) | Mở nửa thị trường; đi kèm D1/D2 |
| **4** | **D8 So-với-chính-mình + referral thật** | Người mua, Mẹ bận | Biến "chất lượng" thành lý do mua/khoe |
| **5** | **Auto-duyệt thông minh (Uy Tín cao)** | Mẹ bận | Chế độ tự lái — tận dụng trust score sẵn có |
| **6** | **D5 Cây Thế Giới / D6 Căn Cứ** | Bố chống-màn-hình, Bé | Coin sink phi-màn-hình + sứ mệnh (CD1) |
| 7 | D4 habit stacking, D7 seasons, D9 friend V2 | rải | Đợt sau |

---

## KHUYẾN NGHỊ THỰC THI

**Đợt "Sức Sống" (đề xuất làm trước, ~1 tuần):** D1 Pet sống + D2 Boss sự kiện + D3 tặng đồ/co-op anh em — vì cùng chạm 2 persona người-dùng-lõi và biến app từ "bảng nhiệm vụ đẹp" thành "thế giới đáng quay lại mỗi ngày". Tất cả đi qua `lib/game/*` thuần + unit test như lệ.

**Đợt "Bằng Chứng & Teen" (kế tiếp):** D8 so-với-chính-mình + referral + teen content reframe — mở thị trường 12+ và tăng conversion.

*Lưu ý phương pháp bất biến:* mỗi tính năng phải trả lời "giúp bán hay giúp giữ?", đi qua lõi thuần + test, và lý tưởng là **kiểm chứng với 5–10 gia đình beta** trước khi dồn sức cho các đợt lớn hơn (Cây/Căn Cứ/Seasons).

---

*Tài liệu do Claude Code (Opus 4.8) soạn 02/07/2026; persona & test giả lập là công cụ phân tích, chưa qua kiểm chứng người dùng thật.*
