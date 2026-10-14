# Data Model: Đăng nhập và quản lý tài khoản

**Feature**: `002-auth-account-admin`  
**Date**: 2026-10-13  
**Nguồn**: Feature spec FR-001–FR-011; Better Auth Admin plugin; Prisma schema hiện có.

## Existing entity extensions

### Tài khoản (`user`)

| Field | Type | Required | Rule / Meaning |
|---|---|---:|---|
| `id` | String | Yes | Định danh tài khoản duy nhất; đã có. |
| `name` | String | Yes | Tên hiển thị; đã có. |
| `email` | String | Yes | Địa chỉ đăng nhập duy nhất; chuẩn hóa trim/lowercase trước khi lưu. DB giữ unique constraint. |
| `emailVerified` | Boolean | Yes | Trạng thái xác minh hiện có; feature không thêm luồng xác minh email. |
| `image` | String? | No | Ảnh hồ sơ tùy chọn hiện có; ngoài trang quản trị hiện tại. |
| `role` | String | Yes | Vai trò Better Auth: `user` mặc định; `admin` chỉ được cấp lúc khởi tạo/seed bởi server. Không cho người dùng tự đổi. |
| `banned` | Boolean | Yes | `false` = hoạt động; `true` = khóa. Trường do Admin plugin quản lý. |
| `banReason` | String? | No | Thông tin nội bộ tùy chọn; không bắt buộc trong UI feature này. |
| `banExpires` | DateTime? | No | Thời điểm hết khóa; feature đặt null cho khóa không thời hạn. |
| `createdAt`, `updatedAt` | DateTime | Yes | Thời điểm tạo/cập nhật hiện có. |

**Credential**: tài khoản `account` hiện hữu chứa thông tin xác thực email/password do Better Auth quản lý; hash được lưu theo cơ chế của Better Auth, không đưa vào danh sách/quá trình trả dữ liệu quản trị.

**Ràng buộc**:

- Đăng ký công khai luôn gán `role=user`, bất kể có trường `role` giả mạo trong payload.
- Cần kiểm tra/canonicalize dữ liệu email đã có trước khi áp dụng chuẩn lowercase nếu có dữ liệu production.
- Tài khoản admin không bị khóa nếu đó là admin hoạt động cuối cùng. Việc đếm và thay trạng thái phải nằm trong một transaction tuần tự hóa để tránh race giữa hai yêu cầu khóa đồng thời.
- Không dùng trường xóa mềm mới; trạng thái khóa được thể hiện qua `banned` và giữ lịch sử tài khoản.

### Phiên đăng nhập (`session`)

Các trường hiện có `id`, `token`, `userId`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt` tiếp tục được dùng.

- Quan hệ: một tài khoản có nhiều phiên; xóa phiên tài khoản khi khóa sẽ làm phiên ở mọi thiết bị hết hiệu lực.
- Khóa: transaction cập nhật `user.banned=true` và xóa mọi `session` có `userId` tương ứng.
- Mở khóa: đặt `banned=false`, xóa `banReason`/`banExpires`; người dùng phải đăng nhập lại để có session mới.

### Vai trò

| Role | Quyền trong feature |
|---|---|
| `user` | Đăng nhập, đăng xuất; không truy cập dữ liệu/quản trị tài khoản. |
| `admin` | Xem và tìm kiếm tài khoản; khóa/mở khóa qua service server-side. Không đổi role, xóa, sửa email, đặt lại mật khẩu, impersonate hoặc quản lý session tùy ý. |

## State transitions

```text
user:  (đăng ký) → role=user, banned=false
user:  banned=false --admin khóa--> banned=true + tất cả session bị thu hồi
user:  banned=true  --admin mở khóa--> banned=false (không tự tạo session)
session: đăng nhập hợp lệ → active --đăng xuất/khóa tài khoản--> revoked
```

## Relationships

- `user 1—N session` (đã có, cascade khi xóa user).
- `user 1—N account` (đã có; thông tin provider/password của Better Auth).
- Không thêm quan hệ tới recipe trong feature này.

## Demo seed invariants

- Tối thiểu 5 tài khoản demo sau khi seed; ít nhất một `admin`, một `user`.
- Chạy lại seed phải idempotent và bảo toàn role đúng cho các account demo.
- Không ghi mật khẩu dạng rõ vào schema; seed dùng Better Auth. Credential demo không được dùng cho môi trường production.