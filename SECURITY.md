# Chính sách Bảo mật

## Biện pháp bảo mật đang áp dụng

### Xác thực (Authentication)
- **Supabase Auth**: đăng nhập email/mật khẩu + magic link. Mật khẩu được hash
  bằng bcrypt phía Supabase, không lưu plaintext.
- Đăng nhập Google đã tắt; chỉ giữ email/password và magic link.
- Session quản lý bằng cookie httpOnly, secure.

### Phân quyền (Authorization)
- **Row Level Security (RLS)** bật trên mọi bảng `public.*`. Policy kiểm tra
  `auth.uid()` và hàm `kit.is_admin()` (role admin lưu trong
  `auth.users.raw_app_meta_data`).
- Mọi API ghi (Server Actions) kiểm tra quyền ở phía server trước khi chạm DB.
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) chỉ dùng phía server
  (Server Components/Actions), không bao giờ expose ra client.

### Dữ liệu
- Bài viết ở trạng thái `draft` không hiển thị ra trang công khai
  (mọi query public đều lọc `status = 'published'`).
- Không commit secret, token, API key vào git. Biến môi trường qua `.env.local`
  (xem `src/apps/web/.env.example`).
- GitHub PAT dùng cho CI/deploy được lưu trong credential helper, thu hồi
  sau khi kết thúc đồ án.

### Ứng dụng
- Next.js App Router: mọi trang admin yêu cầu đăng nhập + role admin
  (kiểm tra ở layout server-side, redirect nếu không đủ quyền).
- CSRF protection cho Server Actions theo pattern MakerKit.
- Không render HTML thô từ dữ liệu người dùng (tránh XSS).

## Phạm vi

Chính sách này áp dụng cho codebase tại nhánh `main` của repo này.
