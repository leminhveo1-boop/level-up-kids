# 🔁 AUDIT LỖI XÁC MINH & THIẾT KẾ LẠI THEO CHUẨN NGÀNH

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 02/07/2026
> **Bối cảnh:** Chủ sản phẩm phát hiện 2 lỗi UX trong hệ xác minh P0 (escrow) mà em đã dựng ở bản B3. Tài liệu này thừa nhận sai lầm gốc, rà soát toàn bộ các cơ chế mắc cùng một lỗi, và đối chiếu với các khung chuẩn top-tier để đề xuất thiết kế lại.

---

## 1. SAI LẦM GỐC: trộn lẫn "LÀM" với "CHỨNG MINH ĐÃ LÀM"

Một hệ theo dõi thói quen tốt phải tách bạch **3 thời điểm** hoàn toàn khác nhau:

| Thời điểm | Xảy ra ở đâu | App nên đóng vai gì |
|---|---|---|
| **DO** (làm việc thật) | Ngoài đời — đọc sách, dậy sớm, dọn phòng | **VẮNG MẶT.** Điện thoại nên nằm yên trong túi |
| **CLAIM** (ghi nhận) | 1 chạm sau khi làm xong | Sổ ghi nhẹ — *tuyên bố* "con đã làm", không phải *bằng chứng* |
| **SETTLE** (đối soát) | Bố mẹ duyệt theo lịch của họ | Hàng đợi bất đồng bộ (escrow đã có) |

**Em đã sai ở chỗ:** buộc app phải **hiện diện ngay trong bước DO** — thứ lẽ ra nó phải vắng mặt. Cụ thể:

- ⏱️ **Timer bắt buộc chạy trong app:** để "check" được nhiệm vụ đọc sách 20 phút, con phải mở app, bấm "Bắt đầu", và app chặn mọi việc khác cho tới khi đồng hồ chạy đủ. → **Con phải cầm điện thoại suốt lúc đọc sách** — đúng thứ phụ huynh muốn TRÁNH. Tool phản bội chính mục tiêu của nó.
- 👀 **Witness PIN đồng bộ:** "Dậy đúng giờ" yêu cầu con chạy đi tìm bố/mẹ để nhập mã ngay lúc 6h sáng. → Ma sát vô lý ở đúng khoảnh khắc bất tiện nhất.

Đây là ví dụ kinh điển của **cơ chế mâu thuẫn với mục tiêu sản phẩm** (mechanic-goal conflict).

---

## 2. RÀ SOÁT: các cơ chế khác mắc CÙNG lỗi này

| # | Cơ chế hiện tại | Lỗi | Mức độ |
|---|---|---|---|
| A | ⏱️ Timer chạy-trong-app + gate ≥80% mới cho check (`t2,t3,t4`) | Buộc cầm điện thoại suốt hoạt động phi-màn-hình | 🔴 Nghiêm trọng |
| B | 👀 Witness PIN đồng bộ tại chỗ (`t1` dậy sớm, `tc1` kể chuyện) | Buộc phụ huynh có mặt đúng khoảnh khắc, phá vỡ sự tự nhiên | 🔴 Nghiêm trọng |
| C | WIP-1 khoá: đang chạy 1 timer thì **disable** nút bắt đầu việc khác | Trẻ thật sự làm nhiều việc xen kẽ (học + phụ bếp); mô hình sai thực tế | 🟠 Cao |
| D | 📸 Photo spot-check bắt buộc trong ngày bị cắm cờ | Với trẻ nhỏ = phải có điện thoại + camera lúc làm; một số việc khó chụp | 🟡 Trung bình |
| E | Nút "Nhắc bố mẹ 🕊️", tick nhiệm vụ | Đều giả định trẻ cầm máy — ổn nếu chỉ ở bước CLAIM (1 chạm nhanh), KHÔNG ổn nếu kéo dài | 🟡 Trung bình |
| F | Vòng lặp đào mỏ: thưởng cho việc-thật là **click-trong-app** đổi energy → coin | Phần thưởng cho hành vi tốt lại chính là *thời gian màn hình* mà app đang cố giới hạn | 🟡 Cần theo dõi |

**Mẫu số chung:** mọi lỗi 🔴🟠 đều vi phạm nguyên tắc *"app vắng mặt trong bước DO"*. Escrow (SETTLE) em xây **đúng** — sai lầm là đã đấu các cổng đồng bộ, đòi-điện-thoại làm **lối vào** escrow, thay vì để CLAIM luôn là 1 chạm không ma sát.

---

## 3. KHUNG CHUẨN TOP-TIER cho bài toán này

Không cần phát minh — đây là bài toán đã được giải kỹ ở nhiều ngành. 5 khung tham chiếu:

### 3.1 Token Economy (Applied Behavior Analysis) — chuẩn vàng lâm sàng
Hệ củng cố hành vi trẻ em được nghiên cứu kỹ nhất (dùng trong trị liệu ABA, lớp học đặc biệt). **Quy tắc cốt lõi: NGƯỜI LỚN quan sát và phát token; đứa trẻ KHÔNG BAO GIỜ phải "chứng minh" với một cỗ máy.** Việc xác minh vốn dĩ là *phán đoán bất đồng bộ của người lớn*. → Em đã đảo ngược nguyên tắc này (bắt trẻ chứng minh với máy).

### 3.2 Greenlight / GoHenry / BusyKid — chuẩn thương mại trực tiếp
Đây là các app "việc nhà + tiền tiêu vặt cho trẻ" top-tier, đã giải **chính xác** bài toán xác minh cha-con. Luồng của họ: **trẻ chạm "xong" → việc rơi vào app của BỐ MẸ → bố mẹ duyệt theo lịch riêng → tiền/thưởng nhả.** Không timer trẻ phải cầm, không PIN đồng bộ. Bố mẹ là **người duyệt theo lô, bất đồng bộ**.

### 3.3 Fogg Behavior Model — B = MAP (Motivation × Ability × Prompt)
Nguyên tắc: tại khoảnh khắc hành vi, **Ability phải cao (ma sát thấp)**. Timer/witness gate của em làm ma sát *tăng vọt* đúng lúc hành vi diễn ra. Fogg: "make the target behavior easy to do."

### 3.4 Self-Determination Theory (Deci & Ryan)
Động lực nội tại cần *tự chủ*. Nghiên cứu kinh điển của Deci: **giám sát và đánh giá làm GIẢM động lực nội tại.** Bắt cầm điện thoại + PIN cha mẹ = giám sát → giết chính động lực app muốn nuôi.

### 3.5 Goodhart's Law / Forest & Duolingo (honor system)
"When a measure becomes a target, it ceases to be a good measure." Các app streak top-tier (Duolingo, Habitica, Streaks, **Forest**) hầu như **không xác minh** — họ tin self-report và khiến phần thưởng chỉ có ý nghĩa nếu bạn thật sự làm ("bạn chỉ lừa chính mình"). Đặc biệt **Forest**: timer là **công cụ cam kết mà người dùng TỰ CHỌN cho sự tập trung của mình**, không bao giờ là cổng bắt buộc để chứng minh với người khác. → Đây chính là cách reframe timer đúng đắn.

**Nguyên tắc kinh tế học gian lận (Trust & Safety):** xác minh *theo ngoại lệ (lấy mẫu)*, không phải mặc định; chi phí xác minh phải NHỎ HƠN chi phí gian lận nó ngăn. Với "con đã đánh răng chưa", chi phí gian lận ≈ 0, còn chi phí PIN-6h-sáng thì cao → **không bao giờ xác minh đồng bộ.**

---

## 4. THIẾT KẾ LẠI — "Claim nhẹ, Settle bất đồng bộ"

Giữ nguyên escrow + trust score + auto-approve 24h (phần này đúng). Thay đổi **cách vào escrow**: mọi nhiệm vụ đều CLAIM bằng **1 chạm không ma sát**, đẩy TẤT CẢ việc xác minh sang bước SETTLE bất đồng bộ của bố mẹ.

### 4.1 Chuyển đổi từng kiểu xác minh

| Kiểu cũ (sai) | Kiểu mới (đúng) |
|---|---|
| ⏱️ **Timer bắt buộc, chặn việc khác** | ⏱️ **Timer là "Bạn Đồng Hành Tập Trung" TÙY CHỌN** (kiểu Forest). Con đọc sách giấy ngoài đời → xong → 1 chạm "Đã đọc". NẾU con muốn, có thể bật timer để nhận *bonus nhỏ* + hiệu ứng cây lớn lên — nhưng không bao giờ bắt buộc, không bao giờ khoá việc khác. |
| 👀 **Witness PIN đồng bộ tại chỗ** | ✅ **Xoá cổng đồng bộ.** "Dậy đúng giờ" chỉ là một *claim* mà bố mẹ lặng lẽ xác nhận trong lô duyệt buổi tối (bố mẹ vốn BIẾT con có dậy đúng giờ hay không — họ ở đó). Nhiệm vụ kết nối 💞: *giá trị nằm ở chính sự kết nối*, cú chạm chỉ là ghi nhận sau đó. |
| WIP-1 **disable** việc khác | Giữ gợi ý trực quan "tập trung một việc" (Kanban) nhưng **không bao giờ khoá** — trẻ hoàn toàn có thể làm bài tập XEN KẼ phụ bếp. |
| 📸 Photo bắt buộc | Chỉ cho việc thật sự để lại sản phẩm (tranh vẽ, phòng đã dọn), **tùy chọn**, và **bố mẹ cũng đính ảnh được**; không bao giờ là con đường duy nhất. |

### 4.2 Bổ sung: "Chế độ ghi nhận của Bố Mẹ" (Parent-log)
Theo mô hình Token Economy: cho phép **bố mẹ tự tick giúp con** từ máy của họ (realtime đã có sẵn). Nhiều việc nhỏ (dậy sớm, ăn hết rau) tự nhiên nhất là bố mẹ ghi nhận — con không cần đụng điện thoại chút nào. Đây là luồng chính của Greenlight/BusyKid.

### 4.3 Kết quả: app chỉ xuất hiện ở 2 khoảnh khắc BÌNH YÊN
- **Con:** một lần check-in nhanh buổi tối, tổng kết ngày (1-2 phút).
- **Bố mẹ:** một lần duyệt lô buổi tối (30 giây).
Không còn ai phải *cầm điện thoại trong lúc sống*.

---

## 5. TENSION SÂU HƠN cần bàn (ngoài phạm vi fix này)

**Phần thưởng = thời gian màn hình.** App giới hạn giờ màn hình, nhưng phần thưởng lớn cho hành vi tốt lại thường là "thêm giờ chơi game" + bản thân việc đào mỏ là click-trong-app. Điều này có thể vô tình *củng cố hành vi tìm-kiếm-màn-hình*. Chưa nghiêm trọng vì có trần giới hạn, nhưng nên cân nhắc dịch trọng tâm phần thưởng sang **quà thật ngoài đời + trải nghiệm cùng gia đình** (đã có, nên khuếch đại) thay vì giờ màn hình. Ghi nhận để bàn riêng.

---

## 6. ĐỀ XUẤT THỰC THI (chờ chủ sản phẩm duyệt)

| Ưu tiên | Việc | Ghi chú |
|---|---|---|
| P0 | Bỏ gate đồng bộ: timer→tùy chọn, witness→claim thường, bỏ WIP-1 disable | Sửa `completeTask` gates + dashboard UI + đổi `verifyType` mặc định |
| P0 | Thêm "Bố mẹ tick giúp" trong tab Duyệt (parent-log) | Tận dụng realtime đã có |
| P1 | Timer thành "Bạn Đồng Hành Tập Trung" tùy chọn có bonus (Forest-style) | Reframe, không xoá giá trị tập trung |
| P2 | Rà lại cân bằng phần thưởng: đẩy mạnh quà thật/trải nghiệm > giờ màn hình | Bàn riêng |

---

*Tài liệu do Claude Code (Opus 4.8) soạn 02/07/2026, thừa nhận sai lầm thiết kế của chính hệ P0 trước đó. Các khung lý thuyết (Token Economy/ABA, Fogg, SDT, Goodhart) và tham chiếu thương mại (Greenlight, GoHenry, BusyKid, Forest, Duolingo) trích theo hiểu biết đã kiểm chứng rộng rãi trong ngành; nên đối chiếu thực địa khi triển khai.*
