# Original User Request

## Initial Request — 2026-07-15T15:50:45+07:00

Thực hiện kiểm toán và đánh giá toàn diện dự án "Level Up Kids" nhằm đánh giá tính tuân thủ kiến trúc, chất lượng mã nguồn, độ bao phủ kiểm thử, an ninh cấu hình và thiết kế giao diện UX/UI theo tiêu chuẩn cao cấp.

Working directory: d:/Antigravity/Pain Tool/Level Up Kids/level-up-kids
Integrity mode: benchmark

## Requirements

### R1. Kiểm toán Kiến trúc, Theming và UX/UI (Dual Bounded Context & Theme Scope)
Đánh giá tính tuân thủ của codebase hiện tại với cấu trúc Dual Bounded Context (`app/(kid)` vs `app/(parent)`), cách áp dụng theme scope qua `ThemeScope` và thuộc tính `data-ui-mode`, quân luật giao diện (Parent tối giản, màu xanh forest; Kid màu kem ấm, chữ nâu ấm 3 tầng, nhấn xanh dương, tiền tệ ⭐). Đánh giá thiết kế UX/UI hiện tại so với tiêu chuẩn cao cấp (top tier) và chỉ ra các điểm chưa nhất quán.

### R2. Kiểm toán An ninh và Cấu hình Hệ thống (Security & Configuration Audit)
Kiểm tra xem có rò rỉ API keys, thông tin cấu hình nhạy cảm (như file `.env` hoặc file cấu hình Supabase/Wrangler) trong repo không. Kiểm tra lỗi logic hoặc các lỗ hổng bảo mật tiềm ẩn trong code backend/Supabase.

### R3. Đánh giá chất lượng và độ bao phủ của hệ thống kiểm thử (Test Suite & Build Audit)
Thực thi và đánh giá hệ thống test hiện tại (Vitest, Playwright), kiểm tra xem test suite có hoạt động ổn định và bao phủ tốt các luồng nghiệp vụ cốt lõi không. Đánh giá tính khả thi và ổn định khi build dự án (`npm run build`).

### R4. Tối ưu mã nguồn và quản lý tài nguyên (Code Optimization & Dead Code)
Phát hiện code thừa (dead code), các thư viện chưa được dùng đến, các cấu trúc code có hiệu năng chưa tối ưu.

## Verification Plan

### Automated Tests
- Chạy lệnh `npx vitest run` và kiểm tra xem các test có pass 100% không.
- Chạy lệnh `npm run build` để kiểm tra khả năng biên dịch dự án.

### Manual Verification
- Nhóm teamwork phải tạo ra một file báo cáo kiểm toán chi tiết định dạng Markdown đặt tên là `PROJECT_AUDIT_REPORT.md` tại thư mục gốc của dự án.
- Báo cáo phải bao gồm đầy đủ kết quả thực thi test/build thực tế và phân tích chi tiết cho từng Requirement (R1 đến R4).

## Acceptance Criteria

### Báo cáo Kiểm toán (Audit Report)
- [ ] Báo cáo `PROJECT_AUDIT_REPORT.md` phải được tạo ra thành công tại thư mục gốc của dự án.
- [ ] Báo cáo phải có cấu trúc rõ ràng, phân tích chi tiết cho từng Requirement từ R1 đến R4.
- [ ] Chỉ rõ các file vi phạm quy tắc Dual Bounded Context, Theming hoặc Quân luật giao diện nếu có (R1).
- [ ] Liệt kê toàn bộ các cấu hình nhạy cảm được quét và xác nhận có hay không rò rỉ API key/credentials (R2).
- [ ] Đính kèm log output thực tế của các lệnh `npx vitest run` và `npm run build` vào báo cáo (R3).
- [ ] Đưa ra danh sách ít nhất 3 đề xuất tối ưu hiệu năng/mã nguồn thừa hoặc cải tiến UX/UI cụ thể kèm kế hoạch refactor đề xuất (R4).
- [ ] Mọi phân tích phải đi kèm đường dẫn file chính xác (`[filename](file:///...)`) dẫn tới mã nguồn dự án để người dùng dễ dàng kiểm tra.
