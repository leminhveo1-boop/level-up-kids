# 📋 BẢN AUDIT SẢN PHẨM — "Hành Trình Anh Hùng Quốc Bảo" (Level Up Kids)

> **Người thực hiện:** Claude Code (model **Opus 4.8**, `claude-opus-4-8`)
> **Thời điểm đánh giá:** 30/06/2026
> **Phạm vi:** Toàn bộ codebase tại commit `320089f` — lõi `src/context/GameState.js`, 6 màn hình trong `src/app/`, tài liệu trong `docs/`, cấu hình PWA (`public/manifest.json`, `src/app/layout.js`).
> **Phương pháp:** Đọc tĩnh (static review) toàn bộ mã nguồn & tài liệu. **Chưa** chạy thử runtime, **chưa** kiểm thử trên thiết bị thật, **chưa** đo hiệu năng thực tế.
>
> ⚠️ **Lưu ý khi đem đi phản biện:** Đây là đánh giá do một mô hình AI (Claude Opus 4.8) tạo ra dựa trên đọc code tại một thời điểm. Trọng số và thang điểm mang tính chủ quan của người đánh giá; con số tổng (6.3/10) là để định hướng thảo luận, không phải một chuẩn đo tuyệt đối. Mọi phát hiện đều dẫn chiếu file:dòng để bên phản biện tự kiểm chứng.

---

## 1. Mô tả sản phẩm

**Loại sản phẩm:** Web app game hóa (Gamification OS) việc nhà & thói quen cho trẻ em — single-page PWA, mobile-first.

**Đối tượng:** 1 trẻ (bé Quốc Bảo) + bố mẹ (vai quản trị). Hiện là sản phẩm **single-child, single-device**.

**Tech stack:** Next.js 14 (App Router), React 18, TailwindCSS, Framer Motion, canvas-confetti, lucide-react. **Toàn bộ trạng thái lưu trong `localStorage`** (key `quocbao_game_state`), không có backend/database.

**Vòng lặp cốt lõi (core loop):**

> Làm việc tốt ngoài đời → tick nhiệm vụ trong app → nhận **EXP + Điểm ⭐ + Năng Lượng ⚡** → vào Hang Đào Mỏ (`src/app/mining/page.js`) tiêu Năng Lượng đập đá kiếm **Hero Coin 🪙** → đổi quà thật (kem, LEGO) qua duyệt PIN của bố mẹ.

**Hệ thống chính:**

- **Nhân vật RPG:** 3 lớp (Chiến Binh / Pháp Sư / Thần Cây), 5 chỉ số (Thể lực, Trí tuệ, Kỷ luật, Sáng tạo, Giúp đỡ), level + EXP (`getLevelTitle` — `src/app/dashboard/page.js:119`).
- **Kinh tế kép (dual wallet):** Điểm ⭐ (đổi giờ giải trí) + Hero Coin 🪙 (đổi quà thật) — có quy đổi ra VNĐ.
- **Cơ chế may rủi (gacha):** Critical 15% nhân đôi điểm, streak multiplier (1.1–1.5x), đào mỏ random rarity, drop trứng/thuốc/thức ăn (`mineTreasure` — `src/context/GameState.js:617`).
- **Pet & Mount:** ấp trứng → cho ăn → tiến hóa thành thú cưỡi (buff +10% năng lượng, +5% crit).
- **Ấn Pháp (buffs):** tập thể dục / đọc sách / streak ≥ 3 mở buff khi đào mỏ.
- **Khu quản trị bố mẹ (`src/app/parent/page.js`):** PIN gate, CRUD nhiệm vụ/quà, chỉnh ví, tặng vật phẩm, gửi "thư bồ câu", thiết lập giới hạn (giờ màn hình/ngày, số lần đổi/tuần, trần ví, tỷ giá VNĐ, bắt buộc nhiệm vụ).
- **Safety caps:** giới hạn giờ màn hình, trần coin (mặc định 7000), gate nhiệm vụ bắt buộc trước khi đổi quà.

---

## 2. Bảng điểm tổng quan

| # | Tiêu chí | Trọng số | Điểm /10 | Có trọng số |
|---|----------|:---:|:---:|:---:|
| 1 | Giá trị & ý tưởng sản phẩm | 15% | **9** | 1.35 |
| 2 | Thiết kế game hóa & tâm lý động lực | 15% | **9** | 1.35 |
| 3 | Trải nghiệm UX/UI | 12% | **8** | 0.96 |
| 4 | Kiến trúc & chất lượng code | 12% | **6** | 0.72 |
| 5 | Bảo mật & quyền riêng tư | 10% | **4** | 0.40 |
| 6 | Độ tin cậy dữ liệu & lưu trữ | 10% | **4** | 0.40 |
| 7 | Kiểm thử & QA | 8% | **1** | 0.08 |
| 8 | Khả năng mở rộng / đa người dùng | 6% | **3** | 0.18 |
| 9 | Tài liệu & hướng dẫn | 6% | **8** | 0.48 |
| 10 | Hoàn thiện kỹ thuật (PWA/build/a11y) | 6% | **6** | 0.36 |

### 🏆 ĐIỂM TỔNG: **6.3 / 10** — *Nguyên mẫu (MVP) chất lượng tốt, chưa sẵn sàng production diện rộng*

```
Ý tưởng/giá trị     █████████░  9.0
Game hóa            █████████░  9.0
UX/UI               ████████░░  8.0
Tài liệu            ████████░░  8.0
Kiến trúc/code      ██████░░░░  6.0
Hoàn thiện KT       ██████░░░░  6.0
Bảo mật             ████░░░░░░  4.0
Tin cậy dữ liệu     ████░░░░░░  4.0
Đa người dùng       ███░░░░░░░  3.0
Kiểm thử/QA         █░░░░░░░░░  1.0
```

---

## 3. Điểm mạnh nổi bật ✅

- **Thiết kế kinh tế rất chín:** tách 2 ví theo mục đích (giải trí vs quà thật), chống lạm phát (coin thường = 1, trần ví, streak cân bằng để không phình điểm), quy đổi VNĐ minh bạch cho bố mẹ. Đây là phần tốt nhất của sản phẩm.
- **Tâm lý động lực bài bản:** variable reward (gacha), critical hit, streak, buff gắn với hành vi thật (đọc sách / thể dục) → khuyến khích đúng thói quen muốn rèn.
- **Cơ chế an toàn cho trẻ:** giới hạn giờ màn hình/ngày + /tuần, gate "nhiệm vụ bắt buộc", PIN duyệt quà — thể hiện tư duy "parental control" tốt.
- **UX/UI:** mobile-first sạch, theme nhất quán (forest/sand/amber), micro-interaction (confetti, sound Web Audio, stopwatch tập trung, bồ câu đưa thư) tạo cảm xúc tốt cho trẻ.
- **Auto-migration self-healing** khi load localStorage (`src/context/GameState.js:164`) — xử lý nâng cấp dữ liệu cũ khéo léo.
- **Tài liệu phong phú** (`GUIDE.md` + `docs/` chiến lược game hóa, economy spec, parent setup rules).

---

## 4. Vấn đề & rủi ro (phân mức)

### 🔴 CRITICAL

1. **Bảo mật hoàn toàn client-side & giả tạo.** PIN bố mẹ (mặc định `1234`) lưu **plaintext** trong localStorage. Trẻ chỉ cần mở DevTools → Application → sửa `quocbao_game_state` là đổi được coin, PIN, duyệt quà — toàn bộ "cổng bảo mật" bị vô hiệu. Với app tại nhà có thể chấp nhận, nhưng cần nêu rõ đây là "rào cản trung thực" chứ không phải bảo mật thật.
2. **Không có kiểm thử nào (0% coverage).** Logic kinh tế phức tạp (điểm, năng lượng, level-up, revert khi bỏ tick, drop rate) hoàn toàn chưa được test. Rủi ro hồi quy cao mỗi lần sửa.

### 🟠 HIGH

3. **Mất dữ liệu dễ xảy ra.** Chỉ localStorage, không backup/sync. Xóa cache trình duyệt / đổi máy / chế độ ẩn danh = mất sạch tiến trình. Không có export/import.
4. **PWA chưa hoàn chỉnh.** `GUIDE.md` quảng cáo "cài như app Store thật", nhưng repo **chỉ có `manifest.json`, không có service worker** → không chạy offline, "installability" hạn chế. Đây là lệch giữa marketing và thực tế.
5. **File quá lớn so với chuẩn:** `src/app/parent/page.js` (1261 dòng), `src/context/GameState.js` (1173 dòng) — vượt mức 800 dòng khuyến nghị. Khó bảo trì; nên tách economy logic, pet logic, parent config thành module/hook riêng.

### 🟡 MEDIUM

6. **Vi phạm immutability** trong `completeTask` (`src/context/GameState.js:359`): gán trực tiếp `t.earnedPoints` / `t.earnedEnergy` lên object state cũ trước khi spread — mutate state, dễ gây bug khó lần.
7. **Level-up chỉ xử lý 1 cấp/lần tick.** Nếu 1 nhiệm vụ EXP lớn vượt nhiều cấp, phần EXP dư bị xử lý sai.
8. **Hardcode 1 trẻ "Quốc Bảo"** ở nhiều nơi (default state, message, redirect) → không tái sử dụng cho gia đình khác / nhiều con mà không sửa code.
9. **Logic boss dùng `bossDefeated` từ closure** (có thể stale) trong setState — nên dùng dạng functional / đọc trong updater.

### 🟢 LOW

10. **Accessibility:** nhiều cỡ chữ siêu nhỏ (`text-[7.5px]`, `text-[8px]`) cho app trẻ em → khó đọc; nên tăng kích thước & kiểm tra contrast.
11. **Còn dùng `console.error`** trong load state (`src/context/GameState.js:240`).

---

## 5. Khuyến nghị ưu tiên (roadmap)

| Ưu tiên | Hành động | Vì sao |
|---|---|---|
| P0 | Thêm **export/import JSON** (hoặc cloud sync) để chống mất dữ liệu | Rủi ro mất tiến trình là đau nhất với trẻ |
| P0 | Viết **unit test cho economy core** (`completeTask`, `mineTreasure`, `claimReward`) | Bảo vệ logic tiền tệ phức tạp |
| P1 | Hoàn thiện **service worker** (next-pwa) để PWA đúng như quảng cáo | Khớp marketing ↔ thực tế |
| P1 | **Tách `GameState.js` & `parent/page.js`** thành các hook/module (`useEconomy`, `usePets`, `useParentConfig`) | Vượt giới hạn 800 dòng |
| P2 | Tham số hóa tên trẻ / hỗ trợ **nhiều hồ sơ con** | Mở rộng ra ngoài 1 bé |
| P2 | Sửa **immutability** + **level-up đa cấp** + a11y cỡ chữ | Chất lượng & độ bền |

---

## 6. Kết luận

Đây là một **MVP gia đình xuất sắc về mặt thiết kế game hóa & sư phạm** (ý tưởng/động lực ~9/10), nhưng đang yếu ở **kỹ thuật nền tảng**: không test, dữ liệu mong manh, bảo mật chỉ mang tính hình thức, và lệch giữa lời quảng cáo PWA với thực tế. Khắc phục nhóm P0/P1 có thể nâng tổng điểm từ **6.3 lên ~8/10**.

---

## 7. Ghi chú về tính khách quan (cho phiên phản biện)

- Bản đánh giá này do **Claude Code — Opus 4.8** soạn ngày **30/06/2026**, dựa trên **đọc mã tĩnh**, không chạy runtime. Một số rủi ro (vd. mất dữ liệu, PWA offline) là suy luận từ cấu trúc code, nên kiểm chứng bằng test thực tế trên thiết bị.
- **Trọng số & thang điểm là lựa chọn của người đánh giá** — bên phản biện hoàn toàn có thể đề xuất bộ trọng số khác (vd. nếu xác định rõ đây chỉ là app dùng nội bộ 1 nhà thì trọng số "bảo mật", "đa người dùng" nên giảm, kéo tổng điểm lên).
- Mọi phát hiện đều có **dẫn chiếu file:dòng** để tái kiểm tra độc lập.
