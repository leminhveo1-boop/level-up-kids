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

### 2.1 Đường liều (con số CHỐT sau phản biện founder 11/07/2026 — xem §7 nền khoa học)
Gọi `h = habitStreak` của việc lúc `completeTask`, `p = (h − FADE_START) / (GRADUATION_DAYS − FADE_START)` clamp [0,1]:

| Giai đoạn | `h` | Hệ số liều `doseFactor` | Ý nghĩa |
|---|---|---|---|
| **Khởi động** | `0 … FADE_START` | `1.0` (đủ liều) | việc mới/đang khó → giữ nguyên động lực khởi phát |
| **Rút dần (ease-in)** | `FADE_START+1 … GRADUATION_DAYS-1` | `1 − (1−FADE_FLOOR)·p²` | nửa đầu phẳng, dốc dồn về sát tốt nghiệp |
| **Tốt nghiệp** | `≥ GRADUATION_DAYS` | (rời list — ceremony cũ) | thành *Bản Năng Anh Hùng* |

**Con số chốt:** `FADE_START = 14` · **đường cong ease-in `p²`** (lồi, không tuyến tính) · `FADE_FLOOR = 0.6`.

`doseFactor(h) = h <= FADE_START ? 1 : max(FADE_FLOOR, 1 − (1−FADE_FLOOR) * p²)` với `p = (h−FADE_START)/(GRADUATION_DAYS−FADE_START)`.

Bảng thực tế (việc 10đ, FLOOR=0.6): h=14→10.0 · h=18→9.8 · h=22→9.0 · h=26→7.8 · h=29→6.5 · h≥30 tốt nghiệp.

**Vì sao đổi so với đề xuất đầu (10 / tuyến tính / 0.4):**
- `10→14`: "21 ngày tạo thói quen" là **myth** (Maltz 1960, không phải nghiên cứu habit); số thực nghiệm ~66 ngày (Lally 2010) — cả hai vô nghĩa làm mốc trực tiếp. `FADE_START` = "khi nào an toàn rút liều" (overjustification), không phải "khi nào thói quen xong". 14 = cửa sổ fade tới graduation-30 còn 16 ngày (đủ mượt); 21 chỉ còn 9 ngày (dốc như cliff).
- **tuyến tính → ease-in `p²`**: giải quyết lo "bắt đầu sớm" — nửa đầu (h=14–20) giảm <3%, dốc dồn về cuối.
- `0.4→0.6`: floor 40% rủi ro trẻ diễn giải "cùng công sức, ít điểm = phạt" + tụt tiền-màn-hình thật (đảo nội tại). 60% = tín hiệu rút liều rõ mà không thành phạt.

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
  - **⚠️ NỢ UI (chưa làm — cố ý):** `TaskCard.js:29,65` hiện `+{task.points}` tĩnh → khi `habitStreak>FADE_START` sẽ lệch với điểm thực nhận (đã dose). **KHÔNG sửa nửa vời** (hiện số giảm trần trụi = đúng cái "như phạt" founder lo). Cần thiết kế lớp chuyển-frame + founder duyệt TRƯỚC khi deploy logic tới trẻ thật. Cửa sổ an toàn: fade chỉ kích hoạt sau >14 ngày liên tục ⇒ có thời gian làm UI trước khi trẻ nào chạm ngưỡng.
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

## 6. Quyết định đã chốt (phản biện founder 11/07/2026)
1. **Con số:** `FADE_START=14`, `FADE_FLOOR=0.6`, đường cong ease-in `p²` — CHỐT (xem §2.1 + §7).
2. **Phạm vi:** áp cho **mọi việc daily** — founder chốt.
3. **Mốc bắt đầu:** giữ `1.0` tại đúng `h=FADE_START`, giảm từ `FADE_START+1` — CHỐT.

## 7. Nền khoa học (để phản biện / mang đi bảo vệ)
- **"21 ngày tạo thói quen" = myth.** Nguồn gốc Maxwell Maltz, *Psycho-Cybernetics* (1960) — quan sát bệnh nhân phẫu thuật quen diện mạo mới "≥21 ngày", KHÔNG phải nghiên cứu hình thành thói quen.
- **Số thực nghiệm ~66 ngày.** Lally, van Jaarsveld, Potts & Wardle (2010), *How are habits formed*, European Journal of Social Psychology 40(6): trung bình 66 ngày đạt automaticity, dao động 18–254 ngày tuỳ độ khó. → Không mốc nào (10/21/30) là "thói quen xong"; `FADE_START` trả lời câu khác.
- **Overjustification effect.** Deci, Koestner & Ryan (1999) meta-analysis *A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation* — thưởng ngoại lai **expected + tangible + contingent** (đúng loại "điểm đổi quà") xói mòn động lực nội tại mạnh nhất. → Cơ sở để RÚT liều thưởng khi hành vi đã có đà; và rút DẦN + thay bằng ghi nhận năng lực (competence) an toàn hơn cắt đột ngột.
- **Trần rủi ro:** literature không cho "floor tối ưu" — `FADE_FLOOR` là phán xét game-econ, cân giữa cai-thưởng (nội tại bền) và tránh-diễn-giải-phạt (an toàn UX cho trẻ 7–11).

---

*SPEC do Claude Code (Opus 4.8) soạn + phản biện 11/07/2026. Bước 1/3 PROD-1, con số đã chốt. Liên quan [[DEEP_03_HIEU_CON.md]], [[SPEC_APP_LA_CHUYEN_GIA.md]], [[PLAN_MAP.md]].*
