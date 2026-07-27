# Prompt đánh giá độc lập — nền tảng học thuật Level Up Kids

> **Tác giả prompt:** Claude (Anthropic) · **Model:** Opus 4.8 · **Ngày:** 2026-07-27
> **Mục đích:** Đưa cho **Antigravity (Gemini)** và **Grok** đánh giá ĐỘC LẬP nền tảng học thuật ở
> `docs/Nền tảng học thuật.md`, tìm **điểm mù** mà tài liệu chưa nghĩ tới — để phản biện chéo với
> đánh giá của Claude, tránh một model tự khen mình.
>
> **Cách dùng:** Mở một phiên chat MỚI trên Grok và trên Antigravity. Dán nguyên khối "PROMPT"
> bên dưới, rồi **đính kèm hoặc dán toàn bộ nội dung file `Nền tảng học thuật.md`** vào chỗ đánh dấu.
> Chạy trên CẢ HAI model, lưu 2 câu trả lời để so sánh chéo với bản deepdive của Claude.

---

## ✂️ PROMPT (dán từ đây trở xuống)

Bạn là **hội đồng chuyên gia top 0,1% thế giới** được thuê để phản biện một tài liệu thiết kế sản phẩm. Bạn KHÔNG phải người viết tài liệu và KHÔNG có động cơ làm hài lòng người viết. Nhiệm vụ của bạn là tìm ra những chỗ tài liệu **sai, thiếu, hoặc mù** — càng sắc càng tốt. Một lời khen vô căn cứ là thất bại; một điểm mù được chỉ ra kèm lập luận là thành công.

Bạn đồng thời đóng 6 vai, mỗi vai soi một góc khác nhau:

1. **Nhà tâm lý học phát triển trẻ em** (Piaget/Vygotsky, self-regulated learning, executive function ở trẻ 6–13).
2. **Nhà kinh tế học hành vi & động lực** (Deci/Ryan self-determination theory, overjustification, token economy, hyperbolic discounting).
3. **Product leader sản phẩm tiêu dùng / giáo dục** (retention, activation, North Star, đơn giản hoá, thất bại thực địa của app habit trẻ em).
4. **Chuyên gia UX cho trẻ em & thiết kế thuyết phục có đạo đức** (age-appropriate design, dark pattern, an toàn số cho trẻ).
5. **Nhà nhân học/văn hoá gia đình Việt Nam** (quan hệ cha mẹ – con, kỷ luật, tiền tiêu vặt, học thêm, thiết bị dùng chung, vai trò ông bà).
6. **Kỹ sư trưởng khả thi kỹ thuật** (một web app/PWA làm được gì, không làm được gì; đâu là ảo tưởng triển khai).

### Bối cảnh sản phẩm (để bạn đánh giá đúng ngữ cảnh, KHÔNG phải để khen)

- **Level Up Kids**: web app/PWA giúp gia đình Việt rèn trẻ 6–13 tuổi tự làm việc nhà/thói quen/trách nhiệm. Cơ chế hiện tại: trẻ làm nhiệm vụ → điểm treo (escrow) → bố mẹ duyệt → đổi quà. Có gamification (điểm, xu, pet, đào mỏ, boss).
- **Kinh doanh**: demo → trả phí 199.000đ/năm. Sống nhờ **giữ chân dài hạn**, không nhờ quảng cáo.
- **North Star do founder chốt**: *tỷ lệ việc quan trọng do trẻ tự chọn thời điểm và tự bắt đầu mà KHÔNG cần bố mẹ nhắc.* Đặc biệt: **thời gian trẻ dùng app nên GIẢM, không tối đa hoá** — trải nghiệm tốt là trẻ mở app ít nhưng vẫn nhớ và tự làm việc ngoài đời.
- **Ràng buộc văn hoá thực tế** (từ phỏng vấn 1 gia đình thật có trẻ 9 tuổi, nằm trong tài liệu): phụ huynh Việt hiện chưa coi trọng quyền riêng tư của trẻ; app đang vô tình thành "cửa ngõ" để trẻ xin mở thiết bị rồi chuyển sang YouTube; bố mẹ "biết cách đúng nhưng khi bận thì làm theo cách cũ".

### Tài liệu cần phản biện

Tài liệu là bản tổng hợp nền tảng học thuật do founder biên soạn, đề xuất biến app thành một "hệ điều hành tự quản lý" theo vòng **Kế hoạch → Làm → Nhìn lại**, dựa trên các khung: Self-Regulated Learning (Zimmerman), Ma trận thời gian (Eisenhower/Covey), 4DX, WOOP/implementation intentions (Gollwitzer/Oettingen), Kanban WIP. Nó đề xuất luồng "Chuẩn bị ngày mai" vào buổi tối, tách 4 loại công việc, chỉ số "Giữ lời / Chủ động / Đang rèn", chế độ sổ/không màn hình, và quản-lý-theo-ngoại-lệ cho phụ huynh.

**>>> [DÁN TOÀN BỘ NỘI DUNG FILE `Nền tảng học thuật.md` VÀO ĐÂY] <<<**

### Yêu cầu bắt buộc về chất lượng phản biện

- **Tự phản biện trước khi kết luận.** Với mỗi điểm mù bạn nêu, hãy tự hỏi "tài liệu có thể đã ngầm trả lời điều này ở đâu chưa?" trước khi khẳng định nó bị bỏ sót. Đừng bịa ra lỗ hổng không tồn tại.
- **Phân biệt sự thật và bịa.** Tài liệu tự thừa nhận nhiều "trích dẫn", thời lượng và tỷ lệ trong đó là do AI sáng tác, không phải số liệu nghiên cứu. Nếu bạn viện dẫn lý thuyết/nghiên cứu, phải nêu **tên tác giả hoặc phát hiện có thật**; nếu không chắc, ghi rõ "cần kiểm chứng" thay vì bịa nguồn.
- **Không xu nịnh.** Không mở đầu bằng khen. Vào thẳng vấn đề.
- **Ưu tiên điểm mù ĐẮT GIÁ và PHẢN TRỰC GIÁC** — thứ mà chính một chuyên gia cũng dễ bỏ qua — hơn là những góp ý hiển nhiên.
- **Gắn với hệ quả.** Mỗi điểm mù phải nói rõ: nếu bỏ qua thì hỏng chuyện gì (retention? hiệu quả giáo dục? xung đột gia đình? rủi ro đạo đức/pháp lý? sập khi triển khai?).

### Định dạng đầu ra (BẮT BUỘC theo đúng thứ tự này, để đối chiếu chéo giữa các model)

**Phần A — Đánh giá độ vững của khung hiện có (ngắn).**
Khung lý thuyết trong tài liệu có điểm nào áp dụng SAI, dùng quá tay, hoặc mâu thuẫn nội bộ không? (Ví dụ: một khung dành cho người lớn có văn phòng bị ép lên trẻ 7 tuổi; hai đề xuất chỏi nhau.) Tối đa 5 gạch đầu dòng, mỗi cái 1–3 câu.

**Phần B — 10–15 ĐIỂM MÙ bổ sung (phần chính).**
Mỗi điểm mù trình bày đúng cấu trúc:
- **Tên điểm mù** (một cụm ngắn).
- **Vắng ở đâu / mù chỗ nào**: tài liệu đang thiếu hoặc hiểu sai điều gì.
- **Vì sao quan trọng**: hệ quả nếu bỏ qua.
- **Căn cứ**: lý thuyết/nghiên cứu/thực tế thị trường (nêu tên thật, hoặc ghi "cần kiểm chứng").
- **Đề xuất tối thiểu**: một cách xử lý rẻ nhất, không phải tính năng khổng lồ.

Cố gắng bao phủ đủ 6 góc nhìn ở trên. Nếu một góc không tìm ra điểm mù đáng kể, nói thẳng "góc X: không có bổ sung đáng kể" thay vì cố nặn.

**Phần C — 3 rủi ro LỚN NHẤT nếu xây theo tài liệu này y nguyên.**
Xếp hạng, mỗi rủi ro 2–3 câu, kèm một câu "dấu hiệu sớm để nhận ra rủi ro đang xảy ra".

**Phần D — 3 câu hỏi mà tài liệu CHƯA đặt ra nhưng bắt buộc phải trả lời trước khi code lớn.**

**Phần E — Một câu tổng kết**: nếu chỉ được sửa MỘT điều trong tài liệu này, đó là gì?

Giữ toàn bộ câu trả lời bằng **tiếng Việt**. Được phép thẳng thắn đến mức khó nghe, miễn là có lập luận.

## ✂️ (hết PROMPT)

---

## Ghi chú cho founder (không nằm trong prompt)

- Chạy trên **cả Grok và Antigravity**, mỗi model một phiên sạch, để có 2 góc độc lập.
- Khi có 2 kết quả, đối chiếu với **bản deepdive của Claude** (`docs/DEEPDIVE_TRIEN_KHAI_VS_HOC_THUAT.md`).
  Điểm mù mà **≥2/3 nguồn cùng chỉ ra** = ưu tiên cao, gần như chắc chắn đúng.
  Điểm chỉ 1 nguồn nêu = cân nhắc, có thể là góc riêng hoặc là ảo giác của model đó.
- Prompt cố tình ép định dạng A–E giống nhau để bạn xếp 3 bản cạnh nhau so hàng-với-hàng.
