# 🎯 KẾ HOẠCH B-LITE — "ĐƯỜNG DẪN CHO BỐ MẸ" KHÔNG CẦN AI COACH, MỤC TIÊU 10.000 NGƯỜI DÙNG VN

> **Người thực hiện:** Claude Code (model **Fable 5**, `claude-fable-5`) — 03/07/2026
> **CẬP NHẬT 03/07/2026:** ✅ **PHẦN A ĐÃ SHIP** — A1 Lộ Trình (12 packs, engine thuần `lib/game/journeys.js`, wizard mới, UI trẻ + bố mẹ, demo seed), A2 Tuần Bận (busy mode trong SystemTab; auto-duyệt Uy Tín ≥80 đã có từ trước), A3 câu so-với-chính-mình vào email tuần. 176 unit test xanh, build xanh, verify trên demo. Phần B founder tự chạy (ads + free traffic).
> **Quyết định của founder:** đi phương án B nhưng **hoãn AI coach** (quá phức tạp); mục tiêu **~10.000 người dùng VN**; nâng cấp coach sau.
> **Nguyên tắc:** tái dùng tối đa những gì đã xây (task engine, escrow/Uy Tín, D4 chia nhỏ Fogg, tốt nghiệp 🎓, push/email, referral). B-lite = đổi *cách đóng gói*, không đập đi xây lại.

---

## TƯ TƯỞNG CHỦ ĐẠO

**"Coach" có 2 phần — phần phức tạp và phần không:**
- ❌ *Phức tạp (hoãn):* AI chatbot trả lời tự do, cần kiểm định chuyên gia, rủi ro trust.
- ✅ *Không phức tạp (làm ngay):* **lộ trình thói quen theo tuổi soạn sẵn** + **mẹo tuần tĩnh cho bố mẹ**. Đây chính là "đường dẫn để bố mẹ không bơ vơ" — dạng content + config, không cần AI.

So sánh: Good Inside bán $279/năm mà lõi sản phẩm là *workshop + script soạn sẵn* — AI Gigi chỉ thêm vào 2024. Content đóng gói đi trước, AI đi sau. Mình đi đúng trình tự đó.

---

## PHẦN A — NÂNG CẤP SẢN PHẨM (3 việc, theo thứ tự)

### A1. 🛤️ "Lộ Trình" — tính năng lõi của B-lite (ưu tiên 1)
Biến trải nghiệm giao việc từ *"bố mẹ tự nghĩ nhiệm vụ"* → *"chọn 1 lộ trình, mọi thứ tự chạy"*.

**Mỗi Lộ Trình (pack) gồm:**
- 1 thói quen mục tiêu gắn nhóm tuổi (VD: "Tự soạn cặp sách" 7–9 tuổi, 3 tuần)
- Chuỗi nhiệm vụ tăng dần độ khó, chia nhỏ sẵn theo Fogg (reuse engine D4)
- Tiêu chí tốt nghiệp + nghi thức 🎓 (reuse graduation)
- **Mẹo cho bố mẹ mỗi tuần** (3–5 câu tĩnh: vì sao con hay bỏ ở giai đoạn này, nên nói gì, tránh gì) — đẩy qua push/email sẵn có
- Cột mốc kỳ vọng ("70% bé bỏ dở ở ngày 4–6 — bình thường, đây là cách vượt") — chống bơ vơ bằng lời soạn sẵn, chưa cần cộng đồng

**Bộ 12 lộ trình khởi điểm (phủ 6–14, mỗi nhóm tuổi ≥3):**
| Nhóm tuổi | Lộ trình |
|---|---|
| 6–8 | Buổi sáng tự lập · Đánh răng không nhắc · Dọn đồ chơi · Đọc sách 15' |
| 9–11 | Tự soạn cặp · Làm bài không cằn nhằn · Việc nhà cố định · Ngủ đúng giờ |
| 12–14 (Teen) | Quản lý tiền tiêu vặt · Tự quản giờ màn hình · Nấu 1 bữa/tuần · Kế hoạch tuần cá nhân |

**Kỹ thuật:** packs = data tĩnh (JSON) + `lib/game/curriculum.js` thuần + unit test như lệ; wizard onboarding đổi bước 2 thành "chọn lộ trình theo tuổi con". Nội dung: Claude soạn nháp trên nền [SCIENTIFIC_UPGRADE.md](SCIENTIFIC_UPGRADE.md) (Fogg/PDCA đã có) → anh duyệt từng pack.

**Vì sao đây là đòn xoay định vị:** landing đổi từ "game phát triển bản thân" → **"Lộ trình 3 tuần giúp con tự soạn cặp — không cằn nhằn"**. Bán *kết quả có thời hạn*, không bán *bảng điểm*. Đây cũng là format quảng cáo/TikTok tự nhiên nhất.

### A2. 🚗 Chế độ tự lái cho bố mẹ (ưu tiên 2 — chống churn người trả tiền)
- Auto-duyệt nhiệm vụ trust-only khi Uy Tín con ≥80 (trust score đã có, chỉ nối — JTBD persona 1 đã chỉ ra)
- Digest 1 thông báo/ngày thay vì rải; nút "tuần bận" (7 ngày auto, chỉ hỏi khi bất thường)
- Mục tiêu đo được: bố mẹ chỉ cần mở app **≤2 lần/tuần** mà hệ thống vẫn chạy

### A3. 📊 Câu tiến bộ 1 dòng (ưu tiên 3 — đã có D8, chỉ hoàn thiện)
Đưa "so-với-chính-mình" (+18% so tuần trước) lên đầu email tuần + Thẻ Khoe Con → mỗi tuần bố mẹ nhận 1 câu trả lời cho "app này có tác dụng không?", và câu đó share được.

**❌ Không làm đợt này:** AI coach, cộng đồng, friend V2, thêm content game mới (pet/boss/mùa đã đủ).

---

## PHẦN B — ĐƯỜNG TỚI 10.000 NGƯỜI DÙNG VN

Funnel giả định: 10.000 đăng ký → ~8–12% trả phí (~800–1.200 gia đình × 199k ≈ **160–240 triệu/năm**). Mốc kiểm chứng: **100 → 1.000 → 10.000** (mỗi mốc phải giữ được retention tuần 4 ≥40% mới đổ tiền/sức sang mốc sau).

### B1. Sửa nền tăng trưởng (kỹ thuật, ~vài ngày)
1. **Landing SSR/prerender** — hiện Google chỉ thấy "Đang tải thế giới phiêu lưu…" = SEO bằng 0. Mỗi Lộ Trình thành 1 landing page riêng ("dạy con 8 tuổi tự soạn cặp") = 12 cửa SEO đúng từ khóa bố mẹ tìm.
2. **Chạy migration `0009_referral.sql` trên Supabase** — referral 2 chiều +6 tháng đã code xong nhưng CHƯA SỐNG vì thiếu bước này (việc tay, chỉ anh làm được).
3. **Đóng gói Google Play qua TWA** — PWA hiện tại lên Play Store với chi phí thấp; bố mẹ VN tin "app trên CH Play" hơn link web.

### B2. Định giá cho mục tiêu 10k (quyết định của anh — ảnh hưởng doanh thu)
Đề xuất: **free tier thật** thay vì chỉ demo — miễn phí: 1 con + 1 lộ trình + 3 nhiệm vụ/ngày; 199k/năm: không giới hạn + full game (pet/boss/căn cứ) + báo cáo tuần. Lý do: mục tiêu giai đoạn này là *người dùng và bài học*, không phải tối đa doanh thu; free tier là nhiên liệu của referral và school channel. (Giữ nguyên demo→paid hiện tại cũng chạy được nhưng trần tăng trưởng thấp hơn nhiều.)

### B3. Kênh (xếp theo chi phí/hiệu quả cho solo founder)
1. **Referral 2 chiều** (đã build): +6 tháng cho cả 2 bên — kích hoạt sau khi chạy migration; gắn nút giới thiệu vào email tuần + màn tốt nghiệp 🎓 (khoảnh khắc tự hào nhất).
2. **Thẻ Khoe Con + câu D8** lên Facebook/Zalo: mỗi tốt nghiệp lộ trình = 1 bài khoe tự nhiên có link.
3. **Hội nhóm Facebook phụ huynh tiểu học** (hàng trăm nhóm 10k–500k thành viên): content "nhật ký 3 tuần dạy con tự soạn cặp" — kể chuyện theo lộ trình, không quảng cáo thô.
4. **Cô giáo tiểu học**: tặng tài khoản premium cho cô + ưu đãi phụ huynh trong lớp — phiên bản thủ công của playbook ClassDojo, thử 3–5 lớp trước.
5. **PR báo mạng** (aFamily, VnExpress Đời sống, Cafebiz): câu chuyện "bố Việt tự xây app dạy con làm việc nhà" — dễ được đăng, miễn phí.

### B4. Số đo bắt buộc theo dõi (bảng `events` đã có)
| Chỉ số | Ngưỡng khỏe |
|---|---|
| % gia đình mới kích hoạt ≥1 Lộ Trình trong 48h | ≥60% |
| % hoàn thành tuần 1 của lộ trình | ≥50% |
| Retention gia đình tuần 4 | ≥40% |
| Referral: % người trả phí gửi ≥1 lời mời | ≥20% |
| Bố mẹ mở app/tuần (sau A2) | ≤3 lần mà hệ vẫn chạy = tốt |

---

## TRÌNH TỰ THỰC THI

- **Đợt 1 (1–2 tuần):** A1 Lộ Trình (engine + 12 packs + wizard mới) · A2 tự lái · landing SSR + 12 trang lộ trình · anh chạy migration 0009. → Ship.
- **Đợt 2 (2–4 tuần sau ship):** quyết định free tier · TWA lên Play Store · kích hoạt kênh 1–3 (referral, khoe, hội nhóm) · đo mốc 100 gia đình.
- **Đợt 3:** school pilot 3–5 lớp + PR · đo mốc 1.000 · chỉ khi retention tuần 4 ≥40% mới scale ads/kênh trả tiền lên 10.000.
- **Sau 10k / retention chứng minh:** quay lại nâng cấp coach (AI trên nền content Lộ Trình đã được kiểm chứng + cân nhắc gương mặt chuyên gia).

**2 quyết định thuộc về anh trước khi build:** (1) duyệt danh sách 12 lộ trình khởi điểm; (2) free tier thật hay giữ demo→paid.

---

*Tài liệu do Claude Code (model Fable 5, `claude-fable-5`) soạn 03/07/2026. Con số funnel/ngưỡng là giả định làm việc để có mốc đo, không phải dự báo.*
