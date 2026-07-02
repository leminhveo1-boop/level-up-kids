# 🚀 Hướng Dẫn Triển Khai Production — Level Up Kids

> Kiến trúc V1: **Next.js 14 + Supabase (Auth/Postgres) + SePay (thanh toán) + Cloudflare Pages (hosting)**

## 1. Supabase

1. Tạo project tại [supabase.com](https://supabase.com) (region Singapore cho VN).
2. Mở **SQL Editor** → chạy toàn bộ file [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).
3. **Authentication → Providers → Email**: bật Email/Password (giữ "Confirm email" để chống spam).
4. Lấy key tại **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(bí mật — chỉ đặt trên server, không bao giờ đưa vào client)*

## 2. SePay (tự động kích hoạt Premium qua chuyển khoản)

1. Đăng ký [sepay.vn](https://sepay.vn), liên kết tài khoản ngân hàng nhận tiền.
2. Tạo **Webhook**: URL = `https://<domain>/api/webhooks/sepay`, kiểu xác thực **API Key** — đặt giá trị trùng env `SEPAY_WEBHOOK_API_KEY`.
3. Cơ chế: mỗi tài khoản phụ huynh có `payment_code` duy nhất dạng `LUKXXXXXXXX` (hiện ở trang `/premium` kèm VietQR). Khách chuyển khoản đúng nội dung → webhook match → tự động lên Premium. Idempotent theo `sepay_tx_id`, giao dịch không khớp được log vào bảng `payments` (status `unmatched`) để đối soát tay.

## 3. Mã kích hoạt thủ công (bán qua shop/đại lý)

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-codes.mjs 10 365
# → 10 mã dạng LUKID-XXXX-XXXX, mỗi mã 365 ngày Premium
```
Khách nhập mã tại `/premium`. Mã dùng 1 lần (khóa bằng RPC `redeem_activation_code`).

## 4. Cloudflare Pages

1. Push repo lên GitHub, vào **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Build settings:
   - Build command: `npx @cloudflare/next-on-pages@1`
   - Build output directory: `.vercel/output/static`
3. **Settings → Functions → Compatibility flags**: thêm `nodejs_compat` (cả Production & Preview).
4. **Settings → Environment variables**: đặt toàn bộ biến trong [`.env.example`](../.env.example) (secrets đánh dấu *Encrypt*).
5. Gắn custom domain, bật HTTPS (mặc định).

## 5. Checklist trước khi mở bán

- [ ] Chạy `npm test` (42 unit test economy/pets/migrate) và `npm run build` pass
- [ ] Đăng ký tài khoản thật → tạo 1 con (free) → xác nhận bị chặn tạo con thứ 2
- [ ] Nhập mã kích hoạt test → lên Premium → tạo được nhiều con
- [ ] Chuyển khoản test 10.000₫ sai nội dung → thấy record `unmatched` trong bảng `payments`
- [ ] Chuyển khoản đúng nội dung + đủ tiền → tự động Premium trong ~1 phút
- [ ] Cài PWA trên Android/iOS, tắt mạng → app vẫn mở, hiện trang offline khi điều hướng lạ
- [ ] Thay icon placeholder trong `public/icons/` bằng bộ icon thương hiệu chính thức

## 6. Chế độ local-only (không cần server)

Nếu **không** đặt env Supabase, app tự chạy chế độ local-only (dữ liệu trong máy, không đăng nhập) — hữu ích cho demo/offline hoàn toàn. Premium/thanh toán yêu cầu cloud.
