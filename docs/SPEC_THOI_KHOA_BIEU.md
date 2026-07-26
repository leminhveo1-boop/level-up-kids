# 📅 THIẾT KẾ — "THỜI KHÓA BIỂU" (thời khóa biểu → tự sinh nhiệm vụ học tập)

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`) — 27/07/2026
> **Trạng thái:** BẢN THIẾT KẾ CHỜ DUYỆT — chưa viết code. Đợt 3 chỉ code sau khi founder duyệt mô hình dữ liệu ở đây.
> **Nguồn:** phản hồi phụ huynh thật (con Bùi Thế Khoa), painpoint **#3**: *"kế hoạch tuần nên bám thời khóa biểu ở lớp; môn nào học hôm nay → bài tập về nhà + chuẩn bị bài cho môn ngày mai; có môn có bài tập/có môn không, có môn cần soạn/có môn không; thời khóa biểu dùng 2–3 tháng, KHÔNG bắt làm lại mỗi tuần."*
> **Nền:** mô hình hiện tại — `tasks[]` là bảng nhiệm vụ ngày, mỗi ngày reset `completed=false` ([economy.js:671](../src/lib/game/economy.js)); Lộ Trình swap task theo tuần bằng tag `journeyId` ([journeys.js:608](../src/lib/game/journeys.js)). Thời khóa biểu **tái dùng đúng pattern này**, không đập kiến trúc.

---

## 1. User story (điều phụ huynh thật sự muốn)

> *"Tôi nhập thời khóa biểu lớp con MỘT LẦN. Từ đó mỗi tối app tự nhắc con: hôm nay có Toán–Văn–Anh → làm bài tập; mai có Lý–Sử → soạn sách vở + xem bài trước. Tôi không phải gõ lại mỗi tuần. Khi app gợi ý sai (môn này không có bài tập) tôi sửa được ngay."*

Ba điều kiện gắt rút ra:
1. **Nhập một lần, chạy 2–3 tháng** — thời khóa biểu là *cấu hình đứng yên*, không phải việc-lặp-mỗi-tuần.
2. **Tự sinh nhiệm vụ theo thứ trong tuần** — thứ Hai sinh khác thứ Ba.
3. **Sửa được** (nối painpoint **#2**) — nguồn sự thật là thời khóa biểu; nhiệm vụ chỉ là *dẫn xuất*. Sửa cờ môn → lần sinh sau đổi theo. Đây là cách nối #2 và #3 gọn nhất.

---

## 2. Mô hình dữ liệu (đề xuất)

Một field mới `timetable` trong document GameState (đã sync Supabase per-child sẵn — không thêm bảng, không thêm store, đúng CLAUDE.md "context/GameState là 1 document").

```js
timetable = {
  version: 1,
  updatedAt: <ts>,
  enabled: true,               // công tắc tổng: tắt = không tự sinh gì

  // Danh mục môn (parent định nghĩa 1 lần) — nguồn sự thật cho #2
  subjects: {
    [subjectId]: {
      id: "toan",
      name: "Toán",
      hasHomework: true,       // môn này có bài tập về nhà?
      needsPrep: true,         // môn này cần soạn/xem bài trước?
    },
    // ...
  },

  // Lịch 7 thứ: mỗi thứ là mảng subjectId theo đúng thời khóa biểu lớp
  week: {
    mon: ["toan", "van", "anh"],
    tue: ["ly", "su", "toan"],
    wed: [...],
    thu: [...],
    fri: [...],
    sat: [],                   // cuối tuần thường rỗng — nhưng lớp học thêm thì điền
    sun: [],
  },
}
```

**Vì sao tách `subjects` (danh mục) khỏi `week` (lịch xếp):** danh mục giữ cờ `hasHomework`/`needsPrep` một chỗ duy nhất → sửa "Toán không có bài tập" một lần, áp cho MỌI ngày có Toán. Nếu nhét cờ vào từng ô lịch thì sửa 1 môn phải sửa 5 chỗ (drift, đúng thứ ponytail cấm).

---

## 3. Luật tự sinh nhiệm vụ (thuật toán lõi)

Hàm thuần mới `generateTimetableTasks(timetable, date)` → trả về mảng task cho *ngày `date`*. Chạy khi sang ngày mới, ngay sau `resetDailyTasks`.

Với ngày `D` (thứ trong tuần = `wd`):

1. **Bài tập hôm nay:** gom các môn trong `week[wd]` có `hasHomework === true`.
   → nếu có ≥1 môn, sinh **1 nhiệm vụ gộp**: *"📚 Làm bài tập về nhà: Toán, Văn, Anh"*.
2. **Soạn bài cho ngày mai:** lấy `week[wd của D+1]` (ngày dương lịch kế tiếp), gom môn có `needsPrep === true`.
   → nếu có ≥1 môn, sinh **1 nhiệm vụ gộp**: *"🎒 Soạn sách vở + xem bài mai: Lý, Sử"*.

Quy tắc "ngày mai = ngày dương kế tiếp" tự xử đúng mọi lịch:
- **Chủ nhật tối** → mai là thứ Hai có môn → sinh task soạn bài. (đúng đời thật: tối CN soạn cặp cho thứ Hai)
- **Thứ Sáu tối** → mai thứ Bảy rỗng → KHÔNG sinh task soạn (cho con nghỉ).
- Lớp học thứ Bảy → điền `week.sat` → thứ Sáu tự sinh task soạn. Không cần cấu hình thêm.

**Tối đa 2 task học/ngày** — đúng quân luật kid ("mỗi màn 1 điểm nhấn") và giảm áp lực duyệt cho phụ huynh (#1 chê "ngộp").

---

## 4. Các quyết định + khuyến nghị

| # | Quyết định | Khuyến nghị (chọn) | Vì sao / đánh đổi |
|---|---|---|---|
| A | **Độ mịn nhiệm vụ** | **Gộp 2 task/ngày** (1 bài tập + 1 soạn bài), liệt kê tên môn trong tiêu đề | Per-môn = 6+ task/ngày → ngập bảng (kid quá tải, phụ huynh ngộp). "Làm hết bài hôm nay" là 1 hành vi tự nhiên (Fogg). *Ceiling ponytail:* muốn tách per-môn sau này → thêm cờ `granularity:"per-subject"`, sinh N task. |
| B | **Nguồn sự thật khi sửa (#2)** | Sửa **cờ môn trong `timetable`**, KHÔNG sửa task đã sinh | Task là dẫn xuất; sửa gốc thì mọi ngày đổi theo. Nối #2 sạch. |
| C | **Nơi lưu** | Field `timetable` trong GameState (per-child, đã sync) | Không thêm bảng Supabase, không tách store — đúng CLAUDE.md. |
| D | **Nguồn "thứ hôm nay"** | Caller truyền `new Date()` vào lúc sang ngày ([GameState.js:207](../src/context/GameState.js)) | `resetDailyTasks` đóng ngày CŨ; sinh task cần thứ của ngày MỚI = `todayStr` đang có sẵn ở effect đó. |
| E | **Cuối tuần / ngày nghỉ** | `week.sat`/`week.sun` rỗng mặc định → không sinh gì; parent điền nếu có học | Đơn giản, không cần khái niệm "ngày nghỉ" riêng (YAGNI). |
| F | **Sống chung với Lộ Trình** | Độc lập: task timetable tag `source:"timetable"`, task Lộ Trình tag `journeyId`. Reset xoá & sinh lại theo tag riêng | Không đụng logic journey. Con có thể vừa chạy Lộ Trình vừa có nhiệm vụ học từ TKB. |
| G | **exp/points/energy** | Mặc định như nhiệm vụ trí tuệ (exp 20, points 20, energy 15, `category:"intellect"`, `verifyType:"parent"`); parent chỉnh được | Bám `JOURNEY_CATALOG` homework 10–12t. `verifyType:"parent"` vì bài tập cần bố mẹ xác nhận. |
| H | **Nghỉ hè / thi / đổi TKB** | `enabled:false` tạm tắt; đổi TKB = sửa `week` (không mất danh mục môn) | 1 công tắc + sửa lịch, đủ cho 2–3 tháng/kỳ. |

**Điểm nối #2 (sửa gợi ý sai):** vì task học là *dẫn xuất* của `timetable`, màn "sửa gợi ý" ở phòng bố mẹ chỉ cần cho phép: bật/tắt `hasHomework`/`needsPrep` mỗi môn, thêm/xoá môn khỏi ô thứ, đổi tên môn. Không cần UI sửa từng task lẻ — sửa gốc là đủ và không drift.

---

## 5. Ăn khớp code hiện có (tái dùng, diff tối thiểu)

1. **Hàm thuần mới** `src/lib/game/timetable.js`: `generateTimetableTasks(timetable, date)` + helpers (`weekdayKey(date)`, `nextDay(date)`). Thuần, không React — cùng contract `lib/game/*` (audience-agnostic, có test đỏ trước).
2. **`resetDailyTasks`** ([economy.js:595](../src/lib/game/economy.js)): thêm bước — lọc bỏ task cũ `source==="timetable"` (giống journey lọc theo `journeyId`), rồi caller sinh lại cho ngày mới. Task timetable KHÔNG "graduate" (nó theo lịch, không phải habit) → loại khỏi vòng `habitStreak`.
3. **GameState** ([GameState.js:207–217](../src/context/GameState.js)): trong effect sang-ngày, sau `resetDailyTasks(prev, ...)` gọi thêm sinh task từ `timetable` với `new Date()`. Path "Giả lập ngày mới" ([GameState.js:794](../src/context/GameState.js)) cũng nối tương tự để verify được ở /demo.
4. **Task schema:** dùng nguyên field sẵn có (`id,title,exp,points,energy,category,completed,statKey,statVal,custom,isMandatory,verifyType`) + thêm `source:"timetable"`, `subjectIds:[...]`, `kind:"homework"|"prep"`. Không đổi TaskCard.
5. **UI phòng bố mẹ:** section "📅 Thời khóa biểu" trong tab Nhiệm vụ & Quà (cạnh Lộ Trình) — lưới 7 thứ, mỗi thứ chọn môn từ danh mục; mỗi môn 2 toggle (bài tập / soạn bài). Component mới, không đụng ManageTab cũ.

---

## 6. Không làm ở v1 (YAGNI — chốt để khỏi phình)

- ❌ Nhắc giờ cụ thể từng tiết / đồng bộ lịch trường điện tử.
- ❌ Task per-môn (đã chọn gộp — có ceiling nâng cấp).
- ❌ Khái niệm "tuần chẵn/lẻ", "ngày lễ VN", "lịch thi" tách riêng — dùng `enabled` + sửa `week`.
- ❌ Đề xuất môn/độ khó theo tuổi (đó là nợ Value Gap, làm sau).

---

## 7. Kế hoạch build Đợt 3 (baby-step, test đỏ trước — chỉ chạy sau khi duyệt)

Branch riêng `feat/thoi-khoa-bieu`. Mỗi bước: `npx vitest run` xanh + `npm run build` xanh mới đi tiếp.

1. **Test đỏ + `timetable.js`:** `generateTimetableTasks` phủ ca — có/không bài tập, soạn cho mai, CN→T2, T6→T7 rỗng, `enabled:false`, lịch rỗng. (thuần, dễ test tất định)
2. **Nối reset:** economy lọc `source:"timetable"`; GameState sinh lại khi sang ngày + "giả lập ngày mới". Test reset giữ đúng task.
3. **UI phòng bố mẹ:** section nhập TKB + toggle cờ môn (đây cũng là màn "sửa gợi ý" của #2).
4. **Verify /demo:** seed 1 timetable mẫu, giả lập ngày mới, xác nhận đúng 2 task đúng nội dung; đổi cờ môn → sinh lại đổi theo. Rồi merge + deploy (bump SW).

---

## 8. Chờ founder duyệt (3 chốt còn mở)

1. **Độ mịn (quyết định A):** đồng ý **gộp 2 task/ngày**? (khuyến nghị: có — chống ngập bảng; per-môn để dành nâng cấp)
2. **Verify bài tập (G):** `verifyType:"parent"` (bố mẹ xác nhận con đã làm bài) hay `"trust"` (con tự ghi nhận)? (khuyến nghị: `parent` cho bài tập, vì đây là thứ phụ huynh muốn nắm; con lớn có thể hạ `trust` sau)
3. **Điểm số:** dùng mặc định trí tuệ (exp/points 20, energy 15) hay để parent nhập lúc tạo? (khuyến nghị: mặc định + cho chỉnh — nhập một lần đã mệt, đừng bắt gõ số cho từng môn)
