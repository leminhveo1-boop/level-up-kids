# 🎚️ SPEC PROD-1 — Luật cân liều thưởng (đề bài, chờ founder chốt con số)

> **Người soạn:** Claude Code (**Opus 4.8**, `claude-opus-4-8`) — 11/07/2026 · Bước 1/3 của PROD-1 (design luật).
> **Trạng thái:** ĐỀ XUẤT. Đụng kinh tế lõi = quyết định khó-đổi → **founder duyệt hướng + con số trước khi implement (bước 2)**.
> **Nguồn ràng buộc:** thẻ #10 `lam_gi_cung_doi_thuong` ([moments.js](../src/lib/game/moments.js)) · [DEEP_03_HIEU_CON.md](DEEP_03_HIEU_CON.md) §2,§4 · [DANH_GIA_REPORT_PERSONA.md](DANH_GIA_REPORT_PERSONA.md) #2 · cơ chế hiện tại [economy.js](../src/lib/game/economy.js) + [constants.js](../src/lib/game/constants.js).

---

## 1. Rà cơ chế điểm/thưởng hiện tại (bằng chứng từ code)

**Dòng điểm `points`** (tiền màn-hình, cheat-worthy → gate escrow): `completeTask` →
`pointsAdded = ceil(basePoints × getStreakMultiplier(streak)) + focusBonus`, `basePoints` nhân đôi nếu crit.
- Bội số ngoại lai đang chồng lên: **streak-mult tới ×1.5** (streak≥7) · **crit 15% → ×2** · **focus-bonus +50%** (`FOCUS_BONUS_RATIO`).
- `rawPoints = task.points ?? task.exp` — điểm **tỉ lệ thuận effort** (t1=5…t10=15, xấp xỉ `exp/2`).
- **Escrow**: điểm treo tới khi bố mẹ duyệt (trừ Uy Tín≥80 / Tuần Bận). EXP/energy/stat nhả ngay để giữ vòng vui.
- **Graduation** (`GRADUATION_DAYS=30`): việc làm liền 30 ngày → "tốt nghiệp" thành *Bản Năng Anh Hùng*, **rời khỏi danh sách** (đã là 1 lớp fade-out overjustification — nhưng **nhảy vách**: full điểm tới ngày 30 rồi biến mất đột ngột).
- `habitStreak` / `missStreak` per-task đã được cộng trong `resetDailyTasks` (tái dùng được).

**Dòng `heroCoins`** (mining, đổi quà thật): kiếm gián tiếp qua energy, có `maxCoinBalance=7000`. Không phải trọng tâm PROD-1.

### Phát hiện phản-trực-giác (định hình SPEC)
Vector **"farm điểm bằng việc dễ"** (report persona #2) ở LUK **rất hẹp**: danh sách việc cố định (trẻ không tự tạo việc), `completeTask` return sớm nếu `task.completed` (không tick lại cùng việc trong ngày), điểm tỉ lệ effort (chọn việc dễ ⇒ ít điểm), escrow chặn tick bừa. → **Không cần trần cứng chống farm** — đó sẽ là giải pháp cho vấn đề đã được escrow + thiết kế list xử lý (YAGNI, tránh churn vô hình theo [CLAUDE.md](../CLAUDE.md)).

Vấn đề LỚN thật (3 nguồn đồng quy) **không phải farm** mà là:
1. **Overjustification** — app treo điểm cho **mọi** việc, kể cả việc bổn phận đã thành nếp → thẻ #10: *"việc gì cũng gắn thưởng, con dần chỉ làm vì thưởng"*. Đây là động lực **nội tại**, không phải chống-gian-lận.
2. **Sensor đọc vị bị nhiễu** — DEEP #3 §4: *"con bỏ vì khó hay vì thưởng bèo?"*. Điểm đồng đều cho việc nếp làm mờ tín hiệu.

---

## 2. Luật đề xuất: FADE-OUT tiệm tiến theo `habitStreak` (thay cliff 30 ngày)

**Một luật lõi, diff nhỏ, tái dùng `habitStreak` sẵn có** — đúng sách overjustification (rút dần thưởng ngoại lai khi hành vi đã nội tại hoá), thay vì thêm cơ chế trần mới.

### 2.1 Đường liều (đề xuất — con số CHỜ FOUNDER CHỐT)
Gọi `h = habitStreak` của việc lúc `completeTask`:

| Giai đoạn | `h` | Hệ số liều `doseFactor` | Ý nghĩa |
|---|---|---|---|
| **Khởi động** | `0 … FADE_START-1` | `1.0` (đủ liều) | việc mới/đang khó → giữ nguyên động lực khởi phát |
| **Rút dần** | `FADE_START … GRADUATION_DAYS-1` | giảm tuyến tính `1.0 → FADE_FLOOR` | việc đã vững → chuyển dần ngoại lực sang bản năng |
| **Tốt nghiệp** | `≥ GRADUATION_DAYS` | (rời list — ceremony cũ) | thành *Bản Năng Anh Hùng* |

Con số đề xuất: **`FADE_START = 10`**, **`FADE_FLOOR = 0.4`** (điểm việc nếp không bao giờ xuống dưới 40% trước tốt nghiệp — giữ chút ghi nhận, tránh cảm giác "làm đều bị phạt").

`doseFactor(h) = h < FADE_START ? 1 : max(FADE_FLOOR, 1 - (1-FADE_FLOOR) * (h - FADE_START) / (GRADUATION_DAYS - FADE_START))`

### 2.2 Áp vào đâu (bảo toàn bất biến an toàn ở §3)
- Áp `doseFactor` lên **`basePoints`** trước khi nhân bội số streak/crit và cộng focus-bonus. Chỉ **`points`**, không đụng EXP/energy/stat/boss/coins (những thứ nuôi vòng vui + không phải "thưởng đổi được").
- **Không áp** cho việc chưa từng thành nếp (`h < FADE_START`) → người mới, việc khó, việc thỉnh thoảng **không bị ảnh hưởng gì** (đảm bảo "không đảo nội tại" cho phần đông trải nghiệm).

### 2.3 Vì sao luật này làm sensor SẠCH hơn (không phải bẩn thêm)
Khi việc đã nếp có điểm thấp mà con **vẫn làm** → tín hiệu nội tại rõ; con **bỏ** → tín hiệu "đang né/khó" rõ, **không lẫn** giả thuyết "vì thưởng bèo" (điểm việc nếp vốn đã thấp là *chủ ý thiết kế*, ai cũng biết). B4 đọc vị đứng trên dữ liệu sạch hơn.

---

## 3. Rào an toàn — BẤT BIẾN "không đảo động lực nội tại" (test phải khoá)

Đây là phần **verify bước 3** sẽ chấm. Mọi bất biến dưới đây là hard-constraint:

- **INV-1** Việc `habitStreak < FADE_START` → điểm **không đổi** so với hiện tại (byte-for-byte). Người mới/việc khó không bị chạm.
- **INV-2** `doseFactor` **đơn điệu không tăng** theo `h`, và **luôn ∈ [FADE_FLOOR, 1]** — không bao giờ âm, không bao giờ >1, không bao giờ 0 trước graduation.
- **INV-3** Fade **chỉ giảm `points`**. EXP, energy, stat, boss-damage, heroCoins, streak, trustScore **không đổi** → vòng vui same-day và tiến trình nhân vật nguyên vẹn.
- **INV-4** Không tạo điểm âm hoặc pending âm; `pointsAdded ≥ 0` luôn.
- **INV-5 (giọng/UX cho kid)** Khi điểm việc bắt đầu fade, UI kid **chuyển frame tích cực** ("gần thành Bản Năng 🎓 — con làm gần như tự động rồi"), **cấm** hiển thị kiểu trừng phạt ("bị trừ điểm"). Tôn trọng quân luật kid ([CLAUDE.md](../CLAUDE.md)): 1 accent xanh, nâu ấm, lucide.
- **INV-6 (an toàn nội dung)** Không thêm bất kỳ câu nào chẩn đoán/quy kết trẻ (DEEP #3 §4). Luật này thuần kinh tế, không sinh nhận định về trẻ.
- **INV-7 (tương thích dữ liệu cũ)** State trẻ thật đang chạy: task thiếu `habitStreak` ⇒ coi như `0` ⇒ INV-1 ⇒ **không ai bị tụt điểm khi deploy**. Không cần migration.

---

## 4. Khung test TDD (bước 2 viết đỏ trước)

File `tests/reward-dose.test.js` (mới). AAA, `rng` tất định, không chạm React.

1. `doseFactor(h)` — bảng giá trị biên: `h=0,9 → 1.0`; `h=FADE_START → 1.0` (chưa giảm ở mốc bắt đầu, hoặc giảm 1 nấc — **chốt ở §6**); `h=GRADUATION_DAYS-1 → ≈FADE_FLOOR`; đơn điệu không tăng (property test quét h=0..30).
2. **INV-1**: `completeTask` với task `habitStreak=5` cho `pointsAdded` **bằng hệt** nhánh code cũ (snapshot số cụ thể).
3. **INV-3**: task `habitStreak=25` — `points` giảm nhưng `exp/energy/stats/bossHp/heroCoins` **y như** khi `habitStreak=0`.
4. **INV-4**: không có cấu hình nào cho `pointsAdded < 0`.
5. Tương tác bội số: fade áp **trước** streak-mult/crit/focus (thứ tự đúng §2.2) — test 1 ca có đủ streak≥7 + focus + h=25.
6. **INV-7**: task **không có** field `habitStreak` → xử như `h=0` → điểm không đổi.

Mục tiêu coverage ≥80% cho nhánh mới. Toàn bộ `npx vitest run` phải xanh 100% (không được vỡ economy.test/habits.test hiện có).

---

## 5. Điều CỐ Ý KHÔNG làm (chống over-engineering)
- ❌ **Trần điểm cứng/ngày** — vector farm hẹp (§1); trần cứng gây churn vô hình + rủi ro cắt điểm việc thật của trẻ chăm (đảo nội tại). Bỏ.
- ❌ **Phân loại lại toàn bộ task duty/stretch** (PA3) — can thiệp lớn, đụng seed + cân bằng trẻ thật. Fade theo `habitStreak` đạt cùng mục tiêu thẻ #10 với diff nhỏ.
- ❌ **AI/đọc-vị trong PROD-1** — đó là B4 (EXP-3), có rào riêng.

---

## 6. Câu hỏi mở cho founder (chốt trước bước 2 implement)
1. **Con số:** `FADE_START=10`, `FADE_FLOOR=0.4` — chốt hay chỉnh? (FADE_FLOOR thấp = cai thưởng mạnh hơn, rủi ro hụt hẫng cao hơn.)
2. **Phạm vi việc fade:** áp cho **mọi việc daily** (mọi việc lặp đều là ứng viên thành nếp) hay **chỉ việc "bổn phận"** (loại trừ việc kết nối `tc1`, việc sáng tạo)? Đề xuất: mọi việc daily, vì graduation vốn áp cho mọi việc.
3. **Điểm bắt đầu fade tại `h=FADE_START`:** giảm ngay 1 nấc hay giữ 1.0 tới hết mốc rồi mới giảm? Đề xuất: giữ 1.0 tại đúng `FADE_START`, giảm từ `FADE_START+1`.

---

*SPEC do Claude Code (Opus 4.8) soạn 11/07/2026. Là đề bài bước 1/3 PROD-1; con số chờ founder chốt. Liên quan [[DEEP_03_HIEU_CON.md]], [[SPEC_APP_LA_CHUYEN_GIA.md]], [[PLAN_MAP.md]].*
