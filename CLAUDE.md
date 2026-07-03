# CLAUDE.md — Level Up Kids

App thói quen cho gia đình Việt: trẻ làm nhiệm vụ → điểm treo (escrow) → bố mẹ duyệt → đổi quà thật. Demo→paid 199k/năm (SePay). Deploy Cloudflare Workers (`npm run cf:deploy`).

## Kiến trúc Dual Bounded Context (duyệt 03/07/2026)

- **2 tệp người dùng = 2 giao diện tách biệt**: route groups `app/(kid)` và `app/(parent)` (+ `(public)` cho landing/auth/onboarding). Không dùng chung shell/theme một cách khiên cưỡng.
- Theme áp qua `ThemeScope` trong layout của từng group (set `data-ui-mode` trên `<html>`) — KHÔNG hack `useEffect` trong page, KHÔNG thêm `UiModeApplier` kiểu cũ.
- **Theming 2 tầng (CHÍNH THỨC, không churn thêm):** (1) token `--accent`/`.accent-*` + primitives `ui/Card,Button,Pill` cho **code mới**; (2) remap brand-color theo `[data-ui-mode]` trong globals.css cho **code cũ**. Cả hai render đúng như nhau. KHÔNG migrate 216 usage cũ sang token — đó là churn vô hình (người dùng thấy y hệt), rủi ro cao giá trị 0. Chỉ migrate khi ĐANG SỬA component đó vì lý do khác.
- `lib/game/*` là logic thuần dùng chung (audience-agnostic) — refactor UI không được đụng.
- `context/GameState` là 1 document sync Supabase — KHÔNG tách store; cô lập bằng hook mặt tiền khi cần.

## Quân luật giao diện

**Parent (SaaS monochrome):** canvas `#F2F3F5`, card trắng, viền hairline, chữ thường weight 700 (cấm IN HOA/900), xanh forest CHỈ cho primary action. Ít chữ — phụ huynh thật đã chê "ngộp".

**Kid (ấm + 1 accent):** nền kem ấm; chữ **nâu ấm 3 tầng** `#33271A / #5C5243 / #6C5F4E` — **CẤM xám slate lạnh** (gray-400/500 mặc định); **DUY NHẤT 1 màu nhấn XANH DƯƠNG `#2E7CD6`** cho mọi hành động (checkbox, progress, CTA, active); `#E8A13A` chỉ cho tiền tệ ⭐; đỏ chỉ cho bắt buộc/cảnh báo. Giữ chất vui bằng hình khối/icon lớn, không bằng nhiều màu.

**Chung:** lưới 8pt (spacing/padding/gap bội số 4–8); whitespace hoặc nền lõm thay viền; 3 tầng typography (Title 20/700 · Body 14–15/600 · Caption 12/500); icon chrome = `lucide-react` (cấm emoji làm icon chrome; emoji chỉ sống trong game-data: tên nhiệm vụ gốc, pet, quà); mỗi màn đúng 1 điểm nhấn; mỗi dòng nội dung tối đa 1 icon.

## Quy tắc báo cáo (bắt buộc)

- **Trước khi báo xong: chỉ ra kết quả cụ thể chứng minh** (output test/build, số đo computed, screenshot, git log, grep count).
- **Chỉ báo những việc có bằng chứng.** Việc chưa chứng minh được thì không nói là xong.
- **Chưa verify được thì nói thẳng "chưa verify"** thay vì đoán.

## Quy trình

- Làm xong + verify → tự commit & deploy luôn, không hỏi (trừ refactor lớn: branch riêng, baby-step, mỗi bước tests+build xanh mới đi tiếp, xong hết mới merge+deploy).
- Tests: `npx vitest run` (phải xanh 100%). Build: `npm run build`. **KHÔNG chạy build khi dev server đang chạy** (hỏng cache `.next`).
- Preview nối Supabase **production**: verify bằng `/demo` (không persist); KHÔNG mutate dữ liệu trẻ thật.
- Commit tiếng Việt, conventional commits, không attribution.

## Đã cắt bỏ (không hồi sinh nếu không có quyết định mới)

GuideModal (📜) · photo-evidence phía kid (`lib/localPhotos`, `lib/image`) · `UiModeApplier` · BottomNav viết tay trong parent page. Nợ đã ghi nhận: quà/việc đề xuất theo đúng độ tuổi (Value Gap — làm sau UX), tab Tuần phòng bố mẹ còn dày.
