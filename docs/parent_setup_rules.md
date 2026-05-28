# ĐẶC TẢ BỔ SUNG — CẨM NANG THIẾT LẬP CHO BỐ MẸ (PARENT SETUP RULES)

> **Mục đích:** Giúp bố mẹ quy đổi các giới hạn đời thực (giờ chơi tối đa, ngân sách quà tính bằng TIỀN, mục tiêu của con) ra điểm số trong game theo nguyên tắc nhất quán — không đặt số cảm tính.
> **Ghép vào sau mục 6 của file `game_economy_spec.md`.**

---

## 9. THAM SỐ THIẾT LẬP CỦA BỐ MẸ (PARENT CONFIG)

```js
const PARENT_CONFIG = {
  // --- Giới hạn giải trí (đầu TIÊU điểm ⭐) ---
  SCREEN_MAX_MINUTES_PER_DAY: 60,   // giờ chơi TV/game/iPad tối đa MỖI NGÀY (phút)
  SCREEN_REDEEM_MAX_PER_WEEK: 5,    // số lần đổi giải trí tối đa MỖI TUẦN
  SCREEN_PACK_MINUTES: 20,          // 1 gói giải trí = bao nhiêu phút

  // --- Ngân sách quà (đầu TIÊU Hero Coin 🪙) ---
  TOP_REWARD_MONEY_VND: 500000,     // giá trị TIỀN của quà ĐỈNH (VNĐ)
  TOP_REWARD_EFFORT_DAYS: 14,       // số ngày nỗ lực mong muốn để đổi quà đỉnh

  // --- Ràng buộc đạo đức/giáo dục ---
  REQUIRE_ALL_MANDATORY: true,      // phải xong hết nhiệm vụ BẮT BUỘC 🔴 mới được đổi quà
  MANUAL_COIN_BONUS_MAX_PER_DAY: 50,// trần thưởng coin thủ công/ngày (chống lạm phát)
};
```

---

## 10. RULE 1 — QUY ĐỔI GIỜ GIẢI TRÍ RA ĐIỂM ⭐

### Nguyên tắc

Điểm ⭐ là "tiền tiêu vặt" để đổi giờ giải trí. Bố mẹ đặt **giới hạn cứng = 1 tiếng/ngày**, game không cho con vượt qua dù có dư điểm.

### Bước 1 — Xác định "giá" 1 gói giải trí (tính bằng Điểm ⭐)

Quy tắc neo: **làm xong trọn vẹn nhiệm vụ trong ngày mới đổi được tối đa số giờ giải trí cho phép**. Tức là 1 ngày nỗ lực = 1 tiếng giải trí.

```
Điểm ⭐ kiếm được/ngày  ≈ EU_BASE_EXP × TASKS_PER_DAY   // dùng EXP làm chuẩn quy đổi 1:1 cho Điểm
                       = 10 × 5 = 50 điểm/ngày

Số gói giải trí tối đa/ngày = SCREEN_MAX_MINUTES_PER_DAY / SCREEN_PACK_MINUTES
                            = 60 / 20 = 3 gói

Giá 1 gói (20 phút) = Điểm kiếm/ngày / Số gói tối đa
                    = 50 / 3 ≈ 17 điểm  (làm tròn 15-20 điểm)
```

> **Diễn giải cho bố mẹ:** Con làm hết việc trong ngày kiếm ~50 điểm, vừa đủ đổi 3 gói = 60 phút = đúng trần 1 tiếng. Con làm ít việc → kiếm ít điểm → tự động chơi ít hơn. Game tự cân, bố mẹ không phải canh.

### Bước 2 — Hai lớp giới hạn cứng (HARD LIMITS)

Dù con có bao nhiêu điểm, game vẫn chặn theo 2 lớp:

```js
function canRedeemScreenTime(child, packMinutes) {
  // Lớp 1: trần phút/ngày
  if (child.screenMinutesUsedToday + packMinutes > PARENT_CONFIG.SCREEN_MAX_MINUTES_PER_DAY)
    return { ok: false, reason: 'Đã đạt giới hạn 1 tiếng giải trí hôm nay' };

  // Lớp 2: trần số lần đổi/tuần
  if (child.screenRedeemsThisWeek >= PARENT_CONFIG.SCREEN_REDEEM_MAX_PER_WEEK)
    return { ok: false, reason: 'Đã hết lượt đổi giải trí tuần này' };

  // Lớp 3: phải xong nhiệm vụ bắt buộc
  if (PARENT_CONFIG.REQUIRE_ALL_MANDATORY && !child.allMandatoryDone)
    return { ok: false, reason: 'Cần hoàn thành hết nhiệm vụ bắt buộc 🔴 trước' };

  return { ok: true };
}
```

> **Lưu ý quan trọng:** Điểm ⭐ và giới hạn giờ là HAI tầng độc lập. Có điểm KHÔNG có nghĩa là được chơi — vẫn phải nằm trong trần phút/ngày VÀ còn lượt đổi/tuần. Đây là điểm mấu chốt chống "con cày điểm để chơi cả ngày".

---

## 11. RULE 2 — QUY ĐỔI TIỀN QUÀ RA HERO COIN 🪙

### Nguyên tắc

Quà thật được mua bằng tiền của bố mẹ. Cần một "tỷ giá" cố định: **1 VNĐ tương ứng bao nhiêu Coin**, để mọi món quà được định giá nhất quán.

### Bước 1 — Tính tỷ giá gốc (Coin ↔ Tiền)

Neo từ quà ĐỈNH: quà 500k phải cần đúng 14 ngày nỗ lực.

```
Coin cần cho quà đỉnh = COIN_TARGET_PER_DAY × TOP_REWARD_EFFORT_DAYS
                      = 250 × 14 = 3500 coin

Tỷ giá = TOP_REWARD_MONEY_VND / Coin cần cho quà đỉnh
       = 500000 / 3500 ≈ 143 VNĐ / coin
```

> **Diễn giải cho bố mẹ:** Mỗi Hero Coin con đào được "đáng giá" khoảng 143 đồng. Con cần dồn 3.500 coin (≈ 2 tuần chăm chỉ) để đổi món quà 500k. Đây là cách giữ quà đỉnh có giá trị, không bị đổi quá sớm.

### Bước 2 — Định giá MỌI món quà tự động theo tiền

Bố mẹ chỉ cần nhập **giá tiền thật** của món quà, game tự tính ra số coin:

```js
function giftPriceInCoin(moneyVND) {
  const RATE = PARENT_CONFIG.TOP_REWARD_MONEY_VND /
               (CONFIG.COIN_TARGET_PER_DAY * PARENT_CONFIG.TOP_REWARD_EFFORT_DAYS);
  return Math.round(moneyVND / RATE);
}
```

### Bảng quy đổi mẫu (tỷ giá ~143đ/coin)

| Món quà | Giá tiền thật | Coin cần | Số ngày nỗ lực |
|---|---:|---:|---:|
| Ly kem | 30.000đ | ~210 | ~1 ngày |
| Đồ chơi nhỏ | 80.000đ | ~560 | ~2 ngày |
| Vé xem phim | 120.000đ | ~840 | ~3 ngày |
| Đồ chơi tự chọn | 200.000đ | ~1.400 | ~6 ngày |
| LEGO xịn | 350.000đ | ~2.450 | ~10 ngày |
| **Quà ĐỈNH (mơ ước)** | **500.000đ** | **~3.500** | **~14 ngày** |

---

## 12. RULE 3 — KHUNG ĐẶT NHIỆM VỤ CHO BỐ MẸ (TASK DESIGN RULES)

Hướng dẫn bố mẹ đặt nhiệm vụ cân bằng, tránh 2 lỗi thường gặp (giao quá ít → con nhàm; giao quá nhiều → con nản).

### Quy tắc số lượng

| Độ tuổi con | Habits (+) | Dailies | To-Dos | Bắt buộc 🔴 |
|---|---:|---:|---:|---:|
| 4-6 tuổi | 2-3 | 2-3 | 1-2 | tối đa 2 |
| 7-9 tuổi | 3-4 | 3-4 | 2-3 | tối đa 3 |
| 10-12 tuổi | 4-5 | 4-5 | 3-4 | tối đa 4 |

> **Quy tắc vàng:** Nhiệm vụ BẮT BUỘC 🔴 không quá 1/3 tổng số việc. Quá nhiều việc bắt buộc → con thấy như "đi làm", mất tính chơi.

### Quy tắc gán trọng số (nhắc lại mục 5)

- **Việc dễ, ngắn** (uống nước, chào hỏi): `w` thấp 0.2-0.5 → thưởng nhỏ, khuyến khích làm nhiều lần.
- **Việc vừa** (đánh răng, dọn bàn): `w` ~0.5-1.0.
- **Việc khó, dài, có giá trị giáo dục cao** (học, đọc sách, việc nhà lớn): `w` cao 1.5-3.0 → thưởng đậm.

### Quy tắc cân bằng 3 hệ năng lực

Đảm bảo nhiệm vụ trải đều 3 trục để con phát triển toàn diện (khớp 3 lớp nhân vật Warrior/Mage/Druid):

```
- Thể chất (Warrior): tập thể dục, vận động, việc nhà tay chân
- Trí tuệ (Mage): học, đọc, giải đố
- Giúp đỡ (Druid): phụ việc nhà, chăm em, lễ phép
```

Tỷ lệ gợi ý: mỗi trục chiếm ~1/3 tổng trọng số nhiệm vụ trong tuần.

---

## 13. RULE 4 — MỤC TIÊU & PHẦN THƯỞNG CỘT MỐC (MILESTONE RULES)

Quy đổi mốc cấp độ ra phần thưởng tiền thật, dùng cùng tỷ giá mục 11:

| Cột mốc | Ngày đạt (ước lượng) | Ngân sách quà gợi ý | Coin tương đương |
|---|---:|---:|---:|
| Cấp 10 | ~tuần 1 | ~80.000đ | ~560 |
| Cấp 25 | ~tuần 1-2 | ~150.000đ | ~1.050 |
| Cấp 50 | ~giữa hè | ~250.000đ | ~1.750 |
| Cấp 100 | ~cuối hè | ~500.000đ (quà đỉnh) | ~3.500 |

> **Lưu ý:** Phần thưởng cột mốc (theo cấp độ) NÊN tách khỏi quà mua bằng coin, để tránh con nhận thưởng hai lần cho cùng một nỗ lực. Cột mốc = "thưởng thành tích danh dự", coin = "tiền con tự tích để mua". Nếu muốn gộp, trừ coin khi trao quà cột mốc.

---

## 14. RULE 5 — TRẦN AN TOÀN TỔNG (SAFETY CAPS)

Các giới hạn cứng để hệ thống không bao giờ "vỡ trận":

```js
const SAFETY_CAPS = {
  MAX_SCREEN_MINUTES_DAY: 60,        // tuyệt đối không vượt
  MAX_GIFT_MONEY_MONTH: 800000,      // tổng tiền quà tối đa/tháng (kiểm soát ngân sách bố mẹ)
  MAX_MANUAL_COIN_DAY: 50,           // thưởng tay tối đa/ngày
  MAX_COIN_BALANCE: 7000,            // trần ví coin (chống tích trữ vô hạn → ép con tiêu, tránh chán)
};
```

> **Vì sao cần trần ví coin:** Nếu con tích quá nhiều coin không tiêu, động lực giảm (kiểu "đủ rồi, khỏi làm nữa"). Đặt trần ~2 lần giá quà đỉnh để con luôn có lý do tiêu và tiếp tục cố gắng.

---

## 15. BẢNG TÓM TẮT CHO BỐ MẸ (QUICK REFERENCE)

| Bố mẹ muốn đặt | Nhập gì vào game | Game tự tính ra |
|---|---|---|
| Giới hạn giờ chơi | Số phút/ngày + số lần/tuần | Giá mỗi gói (điểm ⭐) + chặn vượt trần |
| Quà thật | Giá tiền (VNĐ) | Số coin cần + số ngày nỗ lực |
| Nhiệm vụ | Tên việc + độ khó + thời lượng | EXP + năng lượng mỗi việc |
| Mục tiêu cột mốc | Ngân sách quà mốc | Coin tương đương + thời điểm đạt |

**Quy trình thiết lập 4 bước cho bố mẹ:**
1. Đặt trần giờ giải trí (1 tiếng/ngày, 5 lần/tuần) → game khóa cứng.
2. Nhập giá tiền các món quà → game tự ra số coin.
3. Tạo danh sách nhiệm vụ, gán độ khó → game tự chia EXP & năng lượng.
4. Chọn quà cột mốc theo cấp độ → trao khi con đạt mốc.
