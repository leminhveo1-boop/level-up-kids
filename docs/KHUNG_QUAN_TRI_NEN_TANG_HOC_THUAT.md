# Khung quản trị nền tảng học thuật và hiệu lực sản phẩm

> **Tên ngắn:** Khung Lý thuyết → Cơ chế → Bằng chứng (LCE)
> **Sản phẩm:** Level Up Kids
> **Trạng thái:** Tài liệu sống — nguồn bám để theo dõi, phản biện và điều chỉnh sản phẩm
> **Phiên bản khởi tạo:** 1.0 — 28/07/2026
> **Phạm vi hiện tại:** Trẻ 7–11 tuổi và phụ huynh trong bối cảnh trách nhiệm gia đình
> **Tài liệu nền:** [Nền tảng học thuật.md](Nền%20tảng%20học%20thuật.md)

---

## 0. Tài liệu này là gì?

Đây không phải một bài tổng hợp lý thuyết mới và cũng không phải một SPEC tính năng.

Đây là **khung quản trị sản phẩm dựa trên bằng chứng** dùng để trả lời, theo cùng một cấu trúc:

1. Level Up Kids muốn tạo ra thay đổi gì ngoài đời?
2. Lý thuyết nào giải thích vì sao thay đổi đó có thể xảy ra?
3. Cơ chế nào trong sản phẩm đang hiện thực hóa lý thuyết?
4. Sản phẩm đang đo được gì, chưa đo được gì?
5. Phần nào là bằng chứng khoa học, phần nào chỉ là giả định thiết kế?
6. Khi có phản hồi hoặc ý tưởng mới, dựa vào đâu để giữ, sửa hoặc bỏ?

Chuỗi kiểm soát bắt buộc:

```text
Vấn đề thật
  → Kết quả mong muốn
  → Năng lực cần hình thành
  → Lý thuyết hỗ trợ
  → Nguyên tắc thiết kế
  → Cơ chế sản phẩm
  → Tín hiệu đo
  → Bằng chứng
  → Quyết định điều chỉnh
```

Nếu một thay đổi không nối được vào chuỗi trên, thay đổi đó chưa đủ căn cứ để trở thành hướng sản phẩm.

---

## 1. Thứ tự quyền lực của tài liệu

Khi các tài liệu mâu thuẫn, dùng thứ tự sau:

1. **Quyết định founder đã chốt và ranh đỏ đạo đức/an toàn.**
2. **Dữ liệu hành vi thật từ gia đình**, nếu cách đo đáng tin.
3. **Bằng chứng nghiên cứu phù hợp đúng độ tuổi, bối cảnh và hành vi.**
4. **Khung học thuật tổng quát** được chuyển thành giả thuyết sản phẩm.
5. **Phản hồi định tính** từ trẻ, phụ huynh và người chăm sóc.
6. **Framework quản trị hoặc thiết kế** như 4DX, Kanban, Octalysis.
7. **Ý kiến AI, chuyên gia hoặc founder chưa qua kiểm chứng.**

Không được dùng một câu nghe hợp lý để lấn át dữ liệu thật. Không được dùng số liệu từ người lớn để tuyên bố thành chuẩn cho trẻ Việt Nam.

---

## 2. Product thesis — luận thuyết sản phẩm

### 2.1 Level Up Kids không phải là gì?

Level Up Kids không nên chỉ là:

- danh sách việc bố mẹ giao;
- habit tracker đếm chuỗi ngày;
- game làm nhiệm vụ để nhận điểm;
- sổ trả công việc nhà;
- công cụ giám sát hoặc chấm đạo đức của trẻ.

### 2.2 Level Up Kids là gì?

> **Level Up Kids là hệ điều hành tự quản cho trẻ trong đời sống gia đình: giúp trẻ nhìn trước trách nhiệm, chọn cách bắt đầu, thực hiện, xử lý khi vướng và dần cần ít sự nhắc nhở hơn.**

Game là lớp tạo hứng thú ban đầu. Giá trị dài hạn là năng lực tự quản được chuyển ra ngoài màn hình.

### 2.3 Bốn năng lực đích

1. **Nhận trách nhiệm:** biết mình có trách nhiệm gì và vì sao việc đó cần làm.
2. **Nhìn trước:** nhận ra việc quan trọng trước khi nó trở thành khẩn cấp.
3. **Tự tổ chức:** chọn thời điểm, thứ tự và bước đầu tiên phù hợp.
4. **Tự điều chỉnh:** thực hiện, tự kiểm tra, xử lý trở ngại và lập lại kế hoạch sau khi lỡ.

### 2.4 North Star

> **Tỷ lệ việc quan trọng do trẻ tự chọn thời điểm và tự bắt đầu mà không cần phụ huynh nhắc.**

North Star này chỉ hợp lệ khi đo được đủ ba thành phần:

| Thành phần | Cần biết |
|---|---|
| Việc quan trọng | Việc nào có ý nghĩa dài hạn hoặc thuộc trách nhiệm cốt lõi? |
| Trẻ có quyền lựa chọn | Trẻ có thật sự được chọn thời điểm, thứ tự hoặc cách làm không? |
| Không cần nhắc | Có ghi nhận thật số lần người lớn phải nhắc không? |

**Giới hạn hiện tại:** code đã có `importance`, `plannedLastNight` và `remindersToday`, nhưng `remindersToday` chưa có luồng ghi nhận thực tế. Vì vậy North Star hiện mới là **định nghĩa đúng nhưng chưa đo tin cậy**.

### 2.5 Outcome hierarchy

| Tầng | Kết quả cần tạo | Ví dụ tín hiệu |
|---|---|---|
| Gia đình | Giảm nhắc, giảm cãi, tăng hợp tác | số lần nhắc; số xung đột quanh nhiệm vụ |
| Trẻ | Tăng tự bắt đầu và tự điều chỉnh | self-start; xử lý việc vướng; lập kế hoạch tối |
| Hành vi | Làm việc quan trọng đều và độc lập hơn | importantDone; plannedLastNight; recovery |
| Sản phẩm | Dùng app ngắn nhưng có tác dụng ngoài đời | số phiên; phút sử dụng; tỷ lệ dùng chế độ sổ |

Không dùng retention hoặc time-on-site của trẻ làm bằng chứng thay thế cho tiến bộ ngoài đời.

---

## 3. Guardrails — điều không được hy sinh

Mọi thay đổi phải giữ các ranh đỏ sau:

1. **Không tối đa hóa thời gian trẻ ở trong app.**
2. **Không biến điểm số thành phán xét phẩm chất** như “ngoan”, “hư”, “thất hứa”.
3. **Không so trẻ với anh em, bạn bè hoặc percentile không có dữ liệu chuẩn.**
4. **Không để phụ huynh trừ xu một phía.**
5. **Không coi một lần lỡ là thất bại bản thân.**
6. **Không thưởng tiền cho mọi nghĩa vụ cơ bản theo cùng một cơ chế.**
7. **Không áp một cơ chế giống nhau cho mọi độ tuổi.**
8. **Không ép trẻ học tên framework.** Lý thuyết phải nằm dưới trải nghiệm.
9. **Không tuyên bố hiệu quả khoa học khi mới chỉ có cơ sở lý thuyết.**
10. **Không dùng ngưỡng thiết kế như chuẩn phát triển phổ quát.**
11. **Không thêm việc tới mức lấn át nghỉ ngơi, vui chơi và quan hệ gia đình.**
12. **Không để dữ liệu trở thành công cụ giám sát hoặc trách mắng.**

---

## 4. Bản đồ nền tảng lý thuyết

### 4.1 Xương sống: Self-Regulated Learning — Zimmerman

Chu kỳ:

```text
Forethought / Plan
  → Performance / Do
  → Self-reflection / Review
  → quay lại Plan tốt hơn
```

Vai trò trong Level Up Kids:

- **Plan:** chuẩn bị ngày mai, chọn điểm bắt đầu, đặt bước đầu tiên.
- **Do:** thực hiện một việc, theo dõi tiến độ, xử lý trở ngại.
- **Review:** nhìn nhận ngày hôm nay, phân biệt “khó” với “thất bại”, điều chỉnh ngày sau.

Mức độ phù hợp:

- phù hợp mạnh với mục tiêu tự quản;
- cần giản lược nhiều cho trẻ nhỏ;
- không được biến thành form phản tư dài hoặc quy trình quản trị người lớn.

Nguồn: Panadero (2017) và các tổng quan về mô hình SRL; tổng quan chu kỳ Zimmerman gồm `forethought → performance → self-reflection`.

### 4.2 Động lực: Self-Determination Theory — Deci & Ryan

Ba nhu cầu:

| Nhu cầu | Hàm ý sản phẩm |
|---|---|
| Autonomy | Trẻ được chọn thời điểm, thứ tự, cách làm và cách gỡ vướng trong ranh giới gia đình |
| Competence | Việc vừa sức, có bước nhỏ, phản hồi theo tiến bộ và được phục hồi sau khi lỡ |
| Relatedness | Bố mẹ là người đồng hành, công nhận và giữ ranh giới; không là máy chấm điểm |

Phân biệt quan trọng:

- **Gia đình quyết định trách nhiệm nào phải tồn tại.**
- **Trẻ có quyền tự chủ trong cách thực hiện trách nhiệm.**

Đó không phải tự do bỏ mọi nghĩa vụ; cũng không phải “phantom autonomy” khi app cho trẻ bấm chọn nhưng mọi quyết định thật vẫn do người lớn áp đặt.

### 4.3 Hình thành thói quen: automaticity, không phải đếm ngày

Nghiên cứu Lally ghi nhận thời gian đạt mức tự động hóa cao trong mẫu người lớn dao động lớn, khoảng 18–254 ngày. Không có mốc ngày chung để tuyên bố một thói quen của trẻ đã hoàn tất.

Theo dõi một việc trên nhiều chiều:

| Chiều | Câu hỏi |
|---|---|
| Ổn định | Con có làm đủ các lần đã lên kế hoạch không? |
| Độc lập | Người lớn phải nhắc bao nhiêu lần? |
| Tự động | Đến đúng hoàn cảnh, con có tự bắt đầu không? |
| Phục hồi | Sau khi lỡ, con có tự quay lại hoặc lập lại kế hoạch không? |

`30 ngày tốt nghiệp`, `fade từ ngày 14` và mọi ngưỡng tương tự chỉ là **tham số sản phẩm cần kiểm chứng**, không phải kết luận của nghiên cứu Lally.

### 4.4 Reinforcement thinning và rủi ro overjustification

Phần thưởng có thể giúp hành vi mới bắt đầu, nhưng phần thưởng hữu hình được dự đoán trước và mang tính kiểm soát có thể làm giảm động lực nội tại trong một số điều kiện.

Nguyên tắc dùng thưởng:

- việc mới/khó có thể nhận reinforcement rõ;
- ghi nhận năng lực và tính chủ động tăng dần;
- phần thưởng ngoại lai rút dần, không cắt đột ngột;
- nghĩa vụ ổn định không nên nhận tiền cho từng lần;
- đóng góp vượt trách nhiệm có thể nhận xu minh bạch;
- không dùng “mất thưởng” như hình phạt bất ngờ.

### 4.5 WOOP/MCII và implementation intentions

WOOP:

1. Wish — con muốn đạt gì?
2. Outcome — đạt được thì thế nào?
3. Obstacle — điều gì thường cản?
4. Plan — nếu trở ngại X xảy ra, con sẽ làm Y.

MCII có bằng chứng thử nghiệm ở học sinh, nhưng cách áp dụng trong Level Up Kids phải theo tuổi:

- không bắt trẻ làm đủ bốn bước mỗi ngày;
- trẻ nhỏ dùng câu hỏi cụ thể hoặc câu chuyện;
- chỉ mở khi một việc vướng lặp lại hoặc khi scaffolding đủ cao;
- kế hoạch “nếu–thì” phải do trẻ hiểu và chấp nhận.

### 4.6 Fogg Behavior Model

Hành vi phụ thuộc vào động lực, khả năng thực hiện và prompt phù hợp.

Hàm ý:

- khi trẻ bỏ lặp lại, đừng chỉ tăng thưởng;
- kiểm tra việc có quá khó, quá dài hoặc không có mốc bắt đầu;
- chia nhỏ nhiệm vụ;
- gắn vào một neo sinh hoạt có sẵn;
- giảm ma sát xác nhận.

### 4.7 Growth mindset và process praise

Phản hồi phải hướng vào quá trình có thể thay đổi:

- “Con đã tự bắt đầu.”
- “Con biết nhờ giúp khi việc khó.”
- “Con quay lại sau một ngày lỡ.”

Tránh:

- “Con là đứa ngoan vì đạt 90%.”
- “Con mất phong độ vì lười.”
- xếp hạng anh em hoặc dùng phần trăm để trách mắng.

### 4.8 Erikson, Kohlberg và phát triển theo tuổi

Các khung phát triển được dùng như **lăng kính thiết kế**, không phải công cụ chẩn đoán cá nhân.

Hàm ý hiện tại:

- trẻ nhỏ cần cơ chế cụ thể, phản hồi gần và ít trừu tượng;
- 7–11 tuổi phù hợp với cảm giác năng lực, đóng góp và được công nhận;
- càng lớn, autonomy và self-monitoring càng quan trọng;
- hệ quả liên quan tài sản phải có hiểu biết, tự nguyện và khả năng phục hồi.

Các ranh tuổi `8`, `9`, `12` trong code là ranh sản phẩm bảo thủ, chưa phải chuẩn thực nghiệm phổ quát.

### 4.9 Framework quản trị được mượn — không gọi là “khoa học trẻ em”

| Framework | Phần được mượn | Giới hạn |
|---|---|---|
| Covey Time Matrix | ưu tiên việc quan trọng trước khi gấp | trẻ nhỏ không nên tự phân loại ma trận trừu tượng |
| 4DX | một mục tiêu quan trọng, lead measure, scoreboard, nhịp review | framework doanh nghiệp, chưa phải can thiệp đã chứng minh cho trẻ |
| Kanban | trực quan hóa, WIP=1, hoàn tất trước khi mở thêm | dễ biến thành checklist mẹ giao nếu thiếu autonomy |
| PDCA | Plan–Do–Check–Act và escrow như điểm Check | không thay thế SRL hoặc nghiên cứu phát triển trẻ |
| Octalysis | cân bằng động lực game | framework thiết kế, không phải bằng chứng hiệu quả giáo dục |

Quy tắc: framework quản trị chỉ được dùng làm **cấu trúc vận hành ẩn**, không được dùng làm căn cứ duy nhất cho tuyên bố khoa học.

---

## 5. Bản đồ cơ chế hiện tại

### 5.1 Plan

| Cơ chế | Lý thuyết | Trạng thái hiện tại | Điều chưa biết |
|---|---|---|---|
| Chuẩn bị ngày mai sau 19h hoặc khi xong việc | SRL Forethought | Đã code | gia đình có dùng đều không? |
| Micro-choice tối đa 4 ứng viên | autonomy, giảm cognitive load | Đã code | 4 có phải số phù hợp theo tuổi? |
| Chọn một việc bắt đầu | Kanban WIP, initiation | Đã code | có làm trẻ tự bắt đầu thật không? |
| `importance` ưu tiên việc quan trọng | Time Matrix ẩn | Đã code một phần | ai gắn đúng importance? |
| `dueDate` | ưu tiên trước khẩn cấp | Chỉ lưu dữ liệu | chưa tham gia tính toán |
| `firstStep`, `anchor` | Fogg, implementation intention | Có, mở theo scaffolding | wording nào trẻ hiểu tốt? |

### 5.2 Do

| Cơ chế | Lý thuyết | Trạng thái hiện tại | Điều chưa biết |
|---|---|---|---|
| Một chạm ghi nhận hoàn thành | giảm ma sát | Đã code | có dẫn tới tick khống không? |
| Điểm treo chờ bố mẹ duyệt | PDCA Check, trust-but-verify | Đã code | duyệt từng việc có làm bố mẹ mệt? |
| Auto-approve theo Uy Tín/24h | management by exception | Đã code | có giảm tải nhưng vẫn đủ tin cậy? |
| Focus session tùy chọn | ability, tập trung | Đã code | có giúp hành vi hay tăng time-on-site? |
| Quỹ xu minh bạch có trần | contingency rõ ràng | Đã code | trẻ có biến mọi việc thành giao dịch? |

### 5.3 Review và recovery

| Cơ chế | Lý thuyết | Trạng thái hiện tại | Điều chưa biết |
|---|---|---|---|
| Review cảm nhận một chạm | SRL Reflection giản lược | Đã code | ba mood có tạo insight đủ dùng? |
| Chuyển ngày/chọn giờ/nhờ giúp/bỏ có lý do | autonomy, recovery | Đã code | lối nào được dùng và có giảm shame? |
| Dời ba lần → xem lại cùng bố mẹ | điều chỉnh kế hoạch | Đã code | ngưỡng ba lần chưa được kiểm chứng |
| Chia nhiệm vụ thành bản nhỏ | Fogg Ability | Đã code | việc nhỏ có dẫn lại về việc gốc? |

### 5.4 Scaffolding

| Cơ chế | Mục tiêu | Trạng thái |
|---|---|---|
| Level 1 — app dẫn, con tick | giảm tải điều hành | Đã code |
| Level 2 — con chọn, app gợi ý | tăng autonomy có nâng đỡ | Đã code |
| Level 3 — con tự lập | app lùi về hậu trường | Đã code |
| Giáng tự động khi trẻ đuối | trả lại hỗ trợ, không phạt | Đã code |
| Thăng cần phụ huynh xác nhận | tránh tự suy diễn năng lực | Đã code |

Các ngưỡng hiện tại như `mandatoryRate`, `remindersAvg`, `plannedRate`, `reviewedRate` là **policy v1**, phải được theo dõi và hiệu chỉnh từ dữ liệu, không gọi là chuẩn phát triển.

### 5.5 Thưởng, fade và tốt nghiệp

| Cơ chế | Ý định | Rủi ro |
|---|---|---|
| Fade điểm sau streak 14 | giảm lệ thuộc thưởng | 14 và floor 0.6 là phán xét game-economy |
| Tốt nghiệp sau 30 ngày | chuyển identity, giảm tracking | 30 ngày không chứng minh automaticity |
| Điểm ⭐ và Xu 🪙 tách vai trò | phân biệt game với tiền thật | task chưa có taxonomy trách nhiệm |
| Streak, pet, boss | duy trì hứng thú | có thể kéo time-on-site và tạo break-streak anxiety |

### 5.6 Scoreboard và hệ quả

| Cơ chế | Ý định | Ranh an toàn |
|---|---|---|
| Năm vùng năng lực | cho trẻ thấy tiến bộ đa chiều | không so với trẻ khác |
| Độ bền Khiên có sàn | hồi phục được, không về 0 | không biến thành điểm đạo đức |
| Restitution từ 9 tuổi | sửa chữa thiệt hại, đồng thuận hai bên | không trừ xu một phía |
| Cọc cam kết từ 12 tuổi | commitment device tự nguyện | mặc định dùng Điểm; cọc nhỏ, biết trước |

---

## 6. Thang bằng chứng

Mỗi tuyên bố hoặc cơ chế phải có cấp bằng chứng:

| Cấp | Tên | Ý nghĩa |
|---|---|---|
| E0 | Ý tưởng | trực giác hoặc đề xuất, chưa có nguồn |
| E1 | Có nền lý thuyết | có nghiên cứu/framework liên quan nhưng chưa chứng minh cơ chế LUK |
| E2 | Đã hiện thực hóa | có code, test hoặc thiết kế kiểm được |
| E3 | Có bằng chứng sử dụng | người dùng mục tiêu hiểu và dùng được trong pilot |
| E4 | Có tín hiệu kết quả | dữ liệu trước–sau cho thấy thay đổi mong muốn, guardrail không xấu đi |
| E5 | Có bằng chứng nhân quả | thử nghiệm đối chứng hoặc thiết kế nghiên cứu đủ mạnh |

Quy tắc diễn đạt:

- E0–E1: “giả thuyết”, “dựa trên”, “có cơ sở để thử”.
- E2: “đã triển khai”, không được nói “đã hiệu quả”.
- E3–E4: “quan sát thấy trong pilot/dữ liệu”, phải nêu cỡ mẫu và giới hạn.
- E5: mới được dùng ngôn ngữ mạnh về hiệu quả nhân quả.

### 6.1 Đánh giá hiện tại

| Tuyên bố/cơ chế | Cấp hiện tại | Ghi chú |
|---|---:|---|
| Plan–Do–Review là xương sống phù hợp | E1 | lý thuyết vững, chuyển sang bối cảnh LUK chưa được thử đầy đủ |
| Planner micro-choice buổi tối | E2 | đã code; chưa có bằng chứng sử dụng |
| Rescue bốn lối giảm xấu hổ | E2 | đã code; outcome tâm lý chưa đo |
| Scaffolding 1–3 | E2 | thuật toán có test; ngưỡng chưa hiệu chỉnh |
| Fade điểm 14→30 ngày | E2 | code có; tham số là giả định |
| “30 ngày = tốt nghiệp thói quen” | E0 | không được tuyên bố như khoa học |
| Scoreboard so-với-chính-mình | E2 | đã code; chưa biết ảnh hưởng hành vi/phụ huynh |
| App giúp bố mẹ đỡ nhắc | E0/E1 | North Star chưa đo thật |
| App giúp con tự lập lâu dài | E0/E1 | chưa có dữ liệu dọc |
| Ranh tuổi hệ quả 8/9/12 | E1/E2 | có lăng kính phát triển + code; ranh cụ thể chưa thực nghiệm |

---

## 7. Sổ đăng ký giả định quan trọng

| ID | Giả định | Rủi ro nếu sai | Cách kiểm chứng | Trạng thái |
|---|---|---|---|---|
| A-01 | Trẻ dùng planner buổi tối mà không thấy như thêm bài tập | churn, chống đối | usability test 7–11 tuổi | Chưa kiểm |
| A-02 | Micro-choice giúp trẻ tự bắt đầu ngoài đời | app chỉ tạo cảm giác tự chủ | đo self-start + phỏng vấn | Chưa kiểm |
| A-03 | Phụ huynh ghi số lần nhắc đủ thật và không quá phiền | North Star rác | prototype ghi nhận cực nhẹ | Chưa có cơ chế |
| A-04 | Fade điểm không bị hiểu là bị phạt | giảm động lực | test copy + theo dõi bỏ việc | Chưa kiểm |
| A-05 | Tốt nghiệp sau 30 ngày không làm trẻ bỏ nghĩa vụ | trách nhiệm biến mất | theo dõi sau graduation | Chưa kiểm |
| A-06 | Điểm và xu không làm nghĩa vụ thành giao dịch | overjustification | phân tích lời nói/hành vi đòi thưởng | Chưa kiểm |
| A-07 | Parent approval tạo trust, không tạo giám sát | xung đột gia đình | số reject, thời gian duyệt, phỏng vấn | Chưa kiểm |
| A-08 | Scoreboard tạo process praise, không tạo shaming | phụ huynh dùng số để trách | quan sát cách phụ huynh đọc card | Chưa kiểm |
| A-09 | Age gates phù hợp đủ an toàn | cơ chế sai độ tuổi | review chuyên gia + pilot theo nhóm tuổi | Chưa kiểm |
| A-10 | Game có thể rút dần mà retention gia đình vẫn giữ | game nuốt mục tiêu hoặc churn | cohort theo scaffold/tuổi | Chưa kiểm |

---

## 8. Nợ bằng chứng và khoảng cách hiện tại

### P0 — phải giải quyết để đo đúng luận thuyết

1. **Đo số lần phụ huynh phải nhắc.** `remindersToday` hiện luôn có nguy cơ bằng 0 vì chưa có luồng ghi.
2. **Tách loại nhiệm vụ:** tối thiểu `obligation`, `habit`, `project`, `contribution`.
3. **Chốt định nghĩa “trẻ tự chọn”** để tránh phantom autonomy.
4. **Đo recovery:** trẻ dời/chia/nhờ rồi có quay lại giải quyết không?
5. **Đo child time-on-site** như guardrail, không như mục tiêu tăng trưởng.

### P1 — cần để chống lệch cơ chế

1. Cho `dueDate` tham gia phát hiện việc quan trọng sắp thành khẩn cấp.
2. Kiểm tra xu chỉ chảy vào đúng loại việc, không phát đại trà cho nghĩa vụ.
3. Kiểm tra hiệu ứng fade và graduation sau 14/30 ngày.
4. Thêm tín hiệu phụ huynh quản theo ngoại lệ thay vì duyệt vi mô.
5. Theo dõi quá tải và thời gian nghỉ.

### P2 — cần để nâng mức tin cậy khoa học

1. Có chuyên gia phát triển trẻ/giáo dục độc lập review khung và nội dung.
2. Pilot theo dải tuổi thay vì gộp toàn bộ 7–11.
3. Ghi rõ cỡ mẫu, thời gian và sai lệch dữ liệu.
4. So sánh trước–sau ở mức gia đình.
5. Khi đủ mẫu, thiết kế thử nghiệm đối chứng cho một cơ chế hẹp.

---

## 9. Scorecard hiệu lực sản phẩm

Không cần hiển thị toàn bộ scorecard cho phụ huynh hoặc trẻ. Đây là bảng quản trị nội bộ.

### 9.1 Chỉ số kết quả

| Mã | Chỉ số | Cách hiểu | Guardrail |
|---|---|---|---|
| O1 | Số lần nhắc/ngày | painkiller trực tiếp | không khuyến khích bố mẹ “cố không nhắc” khi an toàn cần nhắc |
| O2 | Self-start quan trọng | North Star | chỉ tính khi trẻ có quyền lựa chọn thật |
| O3 | Planned last night | hành vi forethought | không ép lập kế hoạch mọi ngày |
| O4 | Recovery rate | tự điều chỉnh sau khi lỡ | không coi dời hợp lý là thất bại |
| O5 | Parent review time | tải vận hành gia đình | không đánh đổi chất lượng xác nhận |
| O6 | Conflict pulse | cãi vã quanh nhiệm vụ | thu thập nhẹ, không chẩn đoán |

### 9.2 Chỉ số năng lực

| Mã | Chỉ số | Ý nghĩa |
|---|---|---|
| C1 | Responsibility clarity | con biết việc nào thuộc trách nhiệm của mình |
| C2 | Planning independence | con tự chọn điểm bắt đầu/thời điểm |
| C3 | Obstacle handling | con biết chia nhỏ, dời, nhờ giúp hoặc bỏ có lý do |
| C4 | Reflection | con có nhìn nhận và điều chỉnh |
| C5 | Reward independence | con vẫn làm nghĩa vụ khi thưởng giảm |

### 9.3 Guardrail metrics

| Mã | Guardrail | Dấu hiệu xấu |
|---|---|---|
| G1 | Child screen time | tăng dần dù năng lực ngoài đời không tăng |
| G2 | Reward bargaining | trẻ thường xuyên hỏi “được bao nhiêu xu?” trước nghĩa vụ |
| G3 | Shame/reactance | trẻ né app, tick khống, dùng ngôn ngữ tự hạ thấp |
| G4 | Parent surveillance | bố mẹ mở app chủ yếu để bắt lỗi |
| G5 | Overload | nhiều việc dời liên tục, thiếu thời gian nghỉ |
| G6 | Sibling fairness | so bì điểm/xu hoặc tranh cãi giữa anh em |

### 9.4 Chất lượng dữ liệu

Mỗi chỉ số phải ghi:

- nguồn sự kiện;
- ai nhập;
- thời điểm nhập;
- có thể bị game/hack thế nào;
- missing data được xử lý ra sao;
- có dùng để phán xét trẻ hay không.

Không dùng số `0` mặc định như bằng chứng trẻ không cần nhắc.

---

## 10. Giao thức điều chỉnh sản phẩm

### Bước 1 — Ghi vấn đề quan sát được

Không bắt đầu bằng giải pháp.

```text
Ai gặp vấn đề?
Trong hoàn cảnh nào?
Hành vi quan sát được là gì?
Tần suất bao nhiêu?
Hậu quả ngoài đời là gì?
Nguồn bằng chứng?
```

### Bước 2 — Neo vào outcome và guardrail

Mỗi đề xuất phải trả lời:

- muốn làm chỉ số nào tốt lên?
- guardrail nào có thể xấu đi?
- có phục vụ North Star không?

### Bước 3 — Chỉ rõ lý thuyết và giới hạn

```text
Khung/lý thuyết:
Nghiên cứu hoặc nguồn:
Đúng đối tượng chưa?
Đúng hành vi chưa?
Đúng bối cảnh Việt Nam chưa?
Phần nào là suy luận của đội sản phẩm?
```

### Bước 4 — Viết giả thuyết kiểm được

Mẫu:

> Nếu [nhóm người dùng] gặp [tình huống] và sản phẩm cung cấp [cơ chế], thì [hành vi/kết quả] sẽ thay đổi từ [baseline] tới [mục tiêu], trong khi [guardrail] không xấu đi quá [ngưỡng].

### Bước 5 — Chọn thay đổi nhỏ nhất

Ưu tiên:

1. copy hoặc thứ tự trải nghiệm;
2. tín hiệu đo;
3. rule/policy có thể đảo ngược;
4. cơ chế dữ liệu;
5. schema/contract/kiến trúc.

### Bước 6 — Định nghĩa bằng chứng trước khi làm

Phải chốt trước:

- sự kiện nào được ghi;
- khoảng thời gian;
- nhóm tuổi;
- điều kiện đạt;
- điều kiện dừng;
- điều kiện rollback.

### Bước 7 — Quyết định

Chỉ có bốn kết quả:

- **Giữ:** tín hiệu tốt và guardrail an toàn.
- **Sửa:** hướng đúng nhưng cơ chế/threshold chưa đúng.
- **Bỏ:** không cải thiện outcome hoặc làm guardrail xấu.
- **Chưa kết luận:** dữ liệu thiếu hoặc phép đo chưa tin cậy.

---

## 11. Mẫu Change Card

Sao chép block này cho mỗi điều chỉnh đáng kể:

```markdown
### CHANGE-YYYY-MM-DD-XX — Tên thay đổi

- Trạng thái: Đề xuất | Thử nghiệm | Giữ | Sửa | Bỏ | Chưa kết luận
- Chủ sở hữu:
- Nhóm tuổi:
- Vấn đề quan sát:
- Outcome mục tiêu:
- Guardrail:
- Lý thuyết hỗ trợ:
- Cấp bằng chứng trước thay đổi:
- Giả thuyết:
- Cơ chế nhỏ nhất:
- Tín hiệu cần ghi:
- Baseline:
- Ngưỡng thành công:
- Điều kiện dừng/rollback:
- Kết quả:
- Cấp bằng chứng sau thay đổi:
- Quyết định:
- Link code/spec/dữ liệu:
```

---

## 12. Decision log khởi tạo

| ID | Quyết định | Loại | Trạng thái | Căn cứ | Điều kiện mở lại |
|---|---|---|---|---|---|
| D-01 | Định vị là hệ điều hành tự quản, không chỉ habit tracker | Product thesis | Giữ | nền học thuật + mục tiêu founder | dữ liệu cho thấy gia đình chỉ cần chore tracker |
| D-02 | SRL Plan–Do–Review làm xương sống | Học thuật | Giữ có điều kiện | lý thuyết + cơ chế hiện tại | pilot cho thấy Review/Plan gây tải |
| D-03 | Lập kế hoạch buổi tối, không buổi sáng | UX policy | Giữ có điều kiện | nhịp sống gia đình VN từ phản hồi founder | dữ liệu gia đình cho thấy khung khác tốt hơn |
| D-04 | Micro-choice thay quy trình năm bước | UX policy | Giữ có điều kiện | giảm cognitive load | trẻ vẫn không hiểu/chọn đại |
| D-05 | Game là lớp tạo hứng thú, không là giá trị dài hạn | Product doctrine | Giữ | North Star ngoài đời | retention sụp khi game rút dù outcome tốt |
| D-06 | Không so trẻ với trẻ khác | Ranh đỏ | Đóng băng | đạo đức + process praise | chỉ mở bằng quyết định mới có review an toàn |
| D-07 | Không trừ xu một phía | Ranh đỏ | Đóng băng | autonomy + chống lạm dụng | không mở nếu thiếu consent hai bên |
| D-08 | Fade từ 14, tốt nghiệp 30 ngày | Policy | Thử nghiệm | game-economy, không phải chuẩn khoa học | dữ liệu cho thấy bị hiểu là phạt hoặc trách nhiệm biến mất |
| D-09 | Hệ quả phân tầng 8/9/12 | Policy | Thử nghiệm bảo thủ | lăng kính phát triển + phản biện | review chuyên gia hoặc pilot yêu cầu đổi |
| D-10 | App không tuyên bố là giải pháp đã chứng minh khoa học | Claim policy | Đóng băng | chưa có E4/E5 | chỉ mở khi có nghiên cứu phù hợp |

---

## 13. Nhịp rà soát

### Hằng tuần — tín hiệu vận hành

- dữ liệu có ghi đúng không?
- có lỗi hoặc hành vi hack rõ ràng không?
- guardrail nào chuyển xấu?
- có phản hồi gia đình nào lặp lại?

### Hằng tháng — hiệu lực cơ chế

- Plan–Do–Review có được dùng đủ không?
- reminders có giảm thật không?
- trẻ có tự bắt đầu hơn không?
- fade/graduation có gây lệch?
- nhóm tuổi nào phản ứng khác?

### Hằng quý — luận thuyết sản phẩm

- North Star còn đúng không?
- game đang là mồi hay đã nuốt trải nghiệm?
- app có giảm tải thật cho phụ huynh không?
- trẻ có chuyển năng lực ra ngoài màn hình không?
- có đủ căn cứ nâng cấp cấp bằng chứng không?

### Khi nào phải review khẩn

- trẻ tick khống hàng loạt;
- phụ huynh dùng điểm để trách mắng;
- xung đột gia đình tăng;
- trẻ né app hoặc lo âu vì streak;
- xu làm mọi việc thành giao dịch;
- một nhóm tuổi phản ứng ngược rõ rệt;
- số đo North Star bị phát hiện không đáng tin.

---

## 14. Quy tắc viết claim và truyền thông

### Được nói

- “Thiết kế dựa trên các nguyên tắc về tự điều chỉnh và động lực.”
- “Giúp gia đình tạo một quy trình để con chuẩn bị, thực hiện và nhìn lại.”
- “Sản phẩm theo dõi tiến bộ của con so với chính con.”

### Chưa được nói

- “Được khoa học chứng minh giúp trẻ tự lập.”
- “30 ngày tạo thói quen.”
- “Phù hợp chuẩn phát triển cho mọi trẻ 7–11.”
- “Giảm X% số lần bố mẹ nhắc” khi chưa có dữ liệu đáng tin.
- “App là chuyên gia tâm lý/giáo dục” theo nghĩa thẩm quyền chuyên môn.

Nên định vị hiện tại là:

> **Sản phẩm tự quản gia đình có thiết kế dựa trên bằng chứng, đang tiếp tục được kiểm chứng và điều chỉnh từ dữ liệu sử dụng thật.**

---

## 15. Nguồn và tài liệu liên quan

### Tài liệu nội bộ

- [Nền tảng học thuật.md](Nền%20tảng%20học%20thuật.md) — lập luận gốc và Product thesis.
- [DEEPDIVE_TRIEN_KHAI_VS_HOC_THUAT.md](DEEPDIVE_TRIEN_KHAI_VS_HOC_THUAT.md) — khoảng cách giữa lý thuyết và code tại thời điểm audit.
- [SCIENTIFIC_UPGRADE.md](SCIENTIFIC_UPGRADE.md) — PDCA, Kanban, Octalysis, Fogg, SDT và overjustification.
- [SPEC_A0.4_SCAFFOLDING_LEVELS.md](SPEC_A0.4_SCAFFOLDING_LEVELS.md) — ba mức nâng đỡ theo năng lực.
- [SPEC_PROD1_CAN_LIEU_THUONG.md](SPEC_PROD1_CAN_LIEU_THUONG.md) — luật giảm liều thưởng.
- [SPEC_D3_2_SCOREBOARD.md](SPEC_D3_2_SCOREBOARD.md) — scoreboard so-với-chính-mình.
- [SPEC_KINH_TE_XU_MINH_BACH.md](SPEC_KINH_TE_XU_MINH_BACH.md) — kinh tế xu và hệ quả theo tuổi.
- [Phan_bien_Nen_tang_hoc_thuat_Gemini_Flash.md](Phan_bien_Nen_tang_hoc_thuat_Gemini_Flash.md) — phản biện tải nhận thức, giám sát và rủi ro vận hành.
- [../model-grok.md](../model-grok.md) — phản biện độc lập về độ tuổi, ngưỡng và bằng chứng.

### Nguồn học thuật/chính thức

- Lally, P. et al. (2010), *How are habits formed: Modelling habit formation in the real world*.
  https://doi.org/10.1002/ejsp.674
- Deci, E. L., Koestner, R., & Ryan, R. M. (1999), *A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation*.
  https://doi.org/10.1037/0033-2909.125.6.627
- Review of Zimmerman’s cyclical model of self-regulated learning.
  https://revistas.um.es/analesps/article/view/analesps.30.2.167221
- Duckworth, A. L. et al., *From Fantasy to Action: MCII Improves Academic Performance in Children*.
  https://doi.org/10.1177/1948550613476307
- *Teaching self-regulation*, Nature Human Behaviour.
  https://doi.org/10.1038/s41562-022-01449-w
- Official Kanban Guide.
  https://kanban.university/kanban-guide/
- FranklinCovey Time Matrix và 4DX — chỉ dùng như framework vận hành, không dùng làm bằng chứng phát triển trẻ.

---

## 16. Trạng thái kết luận hiện tại

### Điều đã có cơ sở để giữ

- Product thesis tự quản thay vì habit tracker.
- Plan–Do–Review làm xương sống.
- Trẻ được tự chủ trong cách thực hiện, gia đình giữ ranh giới trách nhiệm.
- Review và rescue phải nhân văn, phục hồi được.
- So con với chính con.
- Game và thưởng phải rút dần về hậu trường.
- Thiết kế phải phân tầng theo năng lực và độ tuổi.

### Điều đang là policy thử nghiệm

- micro-choice tối đa 4;
- planner sau 19h;
- cửa sổ scaffolding 7–14 ngày;
- fade bắt đầu ngày 14, floor 0.6;
- graduation ngày 30;
- các ngưỡng promote/demote;
- ranh tuổi hệ quả 8/9/12;
- số lần dời trước khi review cùng bố mẹ.

### Điều chưa được chứng minh

- Level Up Kids thực sự làm giảm số lần bố mẹ nhắc;
- trẻ chuyển năng lực từ app ra đời sống;
- fade làm tăng động lực nội tại;
- graduation duy trì nghĩa vụ sau khi bỏ tracking;
- scoreboard không bị dùng để shaming;
- cơ chế hiện tại phù hợp cho toàn bộ trẻ Việt Nam 7–11;
- sản phẩm tạo hiệu quả dài hạn đủ để gia đình gia hạn.

### Câu hỏi ưu tiên số 1

> **Làm thế nào đo thật, với ma sát cực thấp và không biến thành giám sát, rằng trẻ đã tự bắt đầu việc quan trọng mà không cần người lớn nhắc?**

Cho tới khi trả lời được câu này, North Star vẫn là định hướng đúng nhưng chưa phải công cụ điều hành đáng tin.
