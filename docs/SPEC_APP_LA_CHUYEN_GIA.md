# 🎯 BẢN CHỐT — "APP LÀ CHUYÊN GIA" (đợt 1: lứa 7–11)

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 03/07/2026
> **Nguyên tắc gốc (founder chốt):** *Bản thân APP là chuyên gia.* Khách trả tiền để có trải nghiệm **"đã có người nghiên cứu hộ tôi cách nuôi con theo tuổi, cắt gọt sẵn, biến thành lộ trình."* Không đi tìm chuyên gia người thật — đó chỉ là truyền thông, không phải sản phẩm. Con hào cạnh tranh = công *nghiên cứu + cắt gọt + lộ trình hóa* nằm TRONG sản phẩm.
> **Nền:** [DEEP_02_EXPERT_MODEL.md](DEEP_02_EXPERT_MODEL.md) + [DEEP_01_STAGE_MECHANIC.md](DEEP_01_STAGE_MECHANIC.md). Base khách thật: 7–13 (lớp 1–7); đợt này **chỉ 7–11**.

---

## 10 quyết định (founder duyệt 03/07/2026, chọn 10/10 phương án đề xuất)

| # | Quyết định | Chốt |
|---|---|---|
| 1 | Hình thức "app làm chuyên gia" | **Đánh giá đầu vào → kê lộ trình riêng cho con** (cảm giác *được nghiên cứu hộ*) |
| 2 | Nội dung khởi đầu | **Thói quen + tự lập + học tập** (đúng Industry 7–11, an toàn, né lâm sàng) |
| 3 | Nhóm 12–13 | **Hoãn — dồn 7–11 trước** (wedge mạnh + đông khách nhất) |
| 4 | Giọng thẩm quyền | **Ẩn khoa học, nội dung tự chứng minh** (tránh ngộp; tin đến từ "đúng con tôi") |
| 5 | Đơn vị nội dung | **Thẻ "Khoảnh khắc" 4 mảnh** = {tình huống + NÊN nói + TRÁNH nói + vì sao} |
| 6 | Vị trí xuất hiện | **Trong phòng bố mẹ, gắn việc/lộ trình đang chạy** (point-of-need, không kho thụ động) |
| 7 | Đánh giá đầu vào hỏi gì | **Tuổi + tick 3–4 painpoint nóng** (~30 giây) |
| 8 | Phục vụ ai | **Bố mẹ** (người trả tiền + cần chuyên gia); con là người thực thi qua game |
| 9 | Ranh giới free/paid | **Nội dung chuyên gia = premium** (vài thẻ free làm mồi) → đòn bẩy gia hạn |
| 10 | Nhịp đẩy | **Theo nhịp lộ trình + khi có sự kiện** (con trượt việc → thẻ liên quan) |

---

## Sản phẩm rút ra (một luồng mạch lạc)

1. **Onboarding = "chẩn đoán":** bố mẹ chọn tuổi con (7–11) + tick 3–4 painpoint (lười học / không tự giác / mè nheo / nản / bừa bộn…). App **"kê" một lộ trình riêng** (chọn + sắp từ `JOURNEY_CATALOG` theo tuổi × painpoint). → Đây là khoảnh khắc *"app nghiên cứu hộ con tôi"*.
2. **Trong quá trình dùng:** phòng bố mẹ hiện **thẻ Khoảnh khắc đúng lúc** — gắn việc con đang làm / vừa trượt / cột mốc lộ trình. Giọng ẩn khoa học, dùng-được-ngay.
3. **Kiếm tiền:** game cơ bản free; **lộ trình riêng đầy đủ + kho Khoảnh khắc = premium.** Chính là thứ đáng để gia hạn (không phải email nhắc — theo [PARENT_DEEP_RESEARCH.md](PARENT_DEEP_RESEARCH.md)).

**Thẻ Khoảnh khắc = một mũi tên 3 đích:** mảnh *vì sao* → cơ chế "hiểu con" (DEEP #3); mảnh *NÊN/TRÁNH nói* → đạn viral "nói hộ nỗi khổ" (DEEP #4).

---

## Thứ tự build (content-first, code sau)

| B | Việc | Vì sao trước |
|---|---|---|
| 1 | **Viết bộ thẻ Khoảnh khắc 7–11** phủ các painpoint ở đánh giá (lười học, không tự giác, mè nheo, nản bài, bừa bộn, ganh em…) | Tài sản LÕI. Không có nội dung tốt thì code chỉ là vỏ. Rẻ, làm được ngay, không cần dev. |
| 2 | **Map painpoint → lộ trình** + màn đánh giá đầu vào (intake) chọn/sắp từ `JOURNEY_CATALOG` | Biến "app là chuyên gia" thành trải nghiệm *được kê đơn riêng* |
| 3 | **Gắn thẻ vào phòng bố mẹ** theo trigger (việc/bước lộ trình) | Point-of-need (quyết định #6, #10) |
| 4 | **Gate premium** cho lộ trình đầy đủ + kho thẻ | Đòn bẩy gia hạn (#9) |

**Ràng buộc chất lượng:** vì bỏ chuyên gia người thật (quyết định #4), **nội dung phải TỰ đủ tốt để phụ huynh tin** — mỗi thẻ bám khung phát triển có bằng chứng (Erikson/SDT/authoritative) nhưng viết bằng lời đời thường, không phô thuật ngữ.

---

*Bản chốt do Claude Code (Opus 4.8) soạn 03/07/2026 từ 10 quyết định founder duyệt. Là spec để thực thi; nội dung thẻ cần bám framework phát triển. Liên quan [[DEEP_02_EXPERT_MODEL.md]], [[DEEP_01_STAGE_MECHANIC.md]], [[KE_HOACH_B_LITE_10K.md]].*
