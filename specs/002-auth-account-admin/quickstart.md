# Quickstart: Đăng nhập và quản lý tài khoản

**Feature**: `002-auth-account-admin`

> SRS nguồn ở tmp/spec-recipe-website.md đã được dùng để đối chiếu scope và cập nhật trong thesis/doc/SRS.md. Không dùng tài khoản demo cho production.

## Chuẩn bị

1. Node.js 24 LTS và pnpm 12.
2. Cấu hình `src/.env.local` theo README (DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET và biến Supabase cần thiết).
3. Từ `src/`, cài dependencies và áp dụng migration theo quy trình dự án:

```bash
pnpm install
pnpm exec prisma migrate dev
pnpm exec prisma generate
pnpm exec prisma db seed
pnpm dev
```

4. Mở `http://localhost:3000`; dùng credential demo do README/hướng dẫn demo cung cấp.

## Kịch bản nghiệm thu

### Đăng ký và đăng nhập

1. Mở `/dang-ky`, tạo tài khoản với email mới và mật khẩu dài ít nhất 8 ký tự.
2. Xác nhận tài khoản có vai trò `user`, thấy trạng thái đăng nhập và có thể đăng xuất.
3. Đăng nhập lại thành công; sai mật khẩu, email trùng hoặc mật khẩu dưới 8 ký tự bị từ chối bằng thông báo tiếng Việt.
4. Gửi payload đăng ký có `role=admin`; xác nhận tài khoản mới vẫn là `user`.

### Quyền trang quản trị

1. Đăng nhập tài khoản demo admin, mở `/admin/tai-khoan`; kiểm tra email/tên tìm được và vai trò/trạng thái hiển thị.
2. Thử mở trang và gọi trực tiếp route quản trị bằng khách và user thường; cả hai phải bị từ chối phía server.
3. Với admin, thử gọi các endpoint plugin không thuộc scope (đổi role, xóa, đổi mật khẩu, impersonate, ban trực tiếp); xác nhận ACL từ chối.

### Khóa và mở khóa

1. Mở cùng một tài khoản user trên hai phiên/thiết bị; admin khóa user.
2. Xác nhận cả hai phiên không thể tiếp tục dùng route cần xác thực và user bị từ chối khi đăng nhập lại.
3. Mở khóa; user có thể đăng nhập lại và hoạt động bình thường.
4. Cố khóa admin hoạt động cuối cùng; hệ thống từ chối. Gửi hai thao tác đồng thời để xác nhận invariant không bị phá vỡ.

### Demo và responsive

1. Seed hai lần; tổng số tài khoản demo vẫn ít nhất 5, bao gồm admin và user.
2. Dùng account demo tương ứng để xác nhận admin có trang quản lý, user không có quyền.
3. Lặp lại luồng chính ở viewport 375px; không có cuộn ngang, thông báo và nhãn đều tiếng Việt.

## Lệnh hoàn tất dự kiến

```bash
pnpm lint
pnpm build
```

Đây là hướng dẫn kiểm chứng dành cho giai đoạn implement; chưa chạy lệnh trong bước lập kế hoạch.
