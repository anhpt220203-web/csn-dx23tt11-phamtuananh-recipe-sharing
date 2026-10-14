# Research: Đăng nhập và quản lý tài khoản

**Feature**: `002-auth-account-admin`  
**Date**: 2026-10-13

## Decisions

### 1. Tái sử dụng Better Auth và Prisma đang có

- **Decision**: Giữ Better Auth 1.7.6, Prisma 6 và adapter PostgreSQL hiện tại; khai báo `@better-auth/prisma-adapter` là dependency trực tiếp để đáp ứng peer dependency của adapter được re-export từ Better Auth; không thêm nhà cung cấp xác thực.
- **Rationale**: Repo đã có `src/lib/auth.ts`, auth catch-all route, Prisma schema core và seed tạo người dùng qua `auth.api.signUpEmail`. Better Auth có email/password và Prisma adapter tích hợp sẵn.
- **Alternatives considered**: Xây xác thực thủ công hoặc thêm dịch vụ OAuth/email bên ngoài. Loại vì vượt phạm vi, tăng bề mặt bảo trì và đi ngược nguyên tắc stack thống nhất.
- **Sources**: [Better Auth Email](https://better-auth.com/docs/concepts/email), [Prisma adapter](https://better-auth.com/docs/adapters/prisma), [Database schema](https://better-auth.com/docs/concepts/database).

### 2. Dùng Admin plugin làm nền cho role và trạng thái khóa, nhưng giới hạn quyền

- **Decision**: Bật Admin plugin để dùng role và trường `banned`, nhưng ACL không cấp các API admin built-in cho vai trò ứng dụng. Trang ứng dụng chỉ cung cấp xem/tìm kiếm và khóa/mở khóa qua các route/service riêng.
- **Rationale**: Plugin cung cấp schema role/ban và chặn tạo session khi tài khoản bị ban. Dù plugin có endpoint danh sách/tìm kiếm, app dùng service riêng để giới hạn DTO và chỉ cấp các route trong scope. Mặc định `admin` có quyền rộng nên cấu hình ACL tùy chỉnh không cấp bất kỳ quyền list/get/ban/set-role/delete/password/email/impersonation nào của plugin. Custom service kiểm tra role admin và chỉ trả DTO giới hạn. Admin UI và server routes vẫn xác thực role độc lập.
- **Alternatives considered**: Tự xây role/status riêng và toàn bộ auth lifecycle. Loại vì trùng chức năng với Better Auth. Dùng nguyên ACL mặc định cũng bị loại vì cho phép thao tác ngoài scope.
- **Sources**: [Better Auth Admin plugin — roles, permissions, list, ban/unban](https://better-auth.com/docs/plugins/admin).

### 3. Đảm bảo khóa cuối cùng và thu hồi session tức thời

- **Decision**: Không gọi endpoint ban mặc định từ giao diện. Route quản trị của ứng dụng gọi service riêng; service kiểm tra phiên và vai trò admin từ server, kiểm tra còn admin hoạt động khác, sau đó dùng giao dịch Prisma mức Serializable để cập nhật `banned` và xóa mọi session của tài khoản. ACL của plugin không cấp quyền cho bất kỳ endpoint quản lý nào để không thể bỏ qua guard hoặc DTO giới hạn qua endpoint plugin. Mở khóa cập nhật lại trạng thái ban; không tạo lại session.
- **Rationale**: Better Auth xác nhận ban user chặn sign-in và xóa các session hiện có. Tuy nhiên endpoint ban mặc định không bảo vệ quy tắc riêng “không khóa admin cuối cùng”; service hẹp và transaction bảo vệ invariant kể cả khi có hai thao tác đồng thời. Plugin vẫn dùng `banned` để ngăn cấp phiên mới.
- **Alternatives considered**: Chỉ ẩn nút ban; dùng endpoint plugin mặc định và kiểm tra admin cuối cùng ở UI. Loại vì client-side checks không bảo vệ server và endpoint có thể bị gọi trực tiếp. Chỉ xóa cookie trên thiết bị hiện tại cũng không thu hồi phiên trên thiết bị khác.
- **Sources**: [Better Auth Admin plugin](https://better-auth.com/docs/plugins/admin), [Session management](https://better-auth.com/docs/concepts/session-management), [Better Auth security](https://better-auth.com/docs/reference/security).

### 4. Giữ quy tắc tài khoản demo trong seed hiện hữu

- **Decision**: Duy trì tối thiểu năm tài khoản demo; seed tạo hoặc cập nhật vai trò sao cho có admin và user, tiếp tục dùng Better Auth để tạo thông tin xác thực. Tài khoản/password demo chỉ dành cho môi trường demo, được hướng dẫn qua tài liệu demo, không dùng làm thông tin xác thực production.
- **Rationale**: Hiện seed có năm email demo nhưng tất cả đang là user và có mật khẩu mẫu dùng chung. Cần thêm phân vai idempotent và chỉ công bố credential theo ranh giới môi trường đã định.
- **Alternatives considered**: Thêm tài khoản thứ sáu hoặc đổi email mẫu; chưa cần vì năm tài khoản hiện hữu đáp ứng ngưỡng số lượng và có thể phân vai lại.
- **Source**: `src/prisma/seed.ts`, FR-010/FR-011 và Constitution NFR5.

### 5. Chuẩn hóa email trước khi kiểm tra duy nhất

- **Decision**: Chuẩn hóa email thành lowercase/trim ở server trước khi đăng ký và tìm kiếm; giữ ràng buộc unique của DB để bảo vệ tính duy nhất.
- **Rationale**: Đặc tả yêu cầu email không phân biệt chữ hoa/thường. Trước migration, rà các email hiện hữu có thể trùng sau chuẩn hóa.
- **Alternatives considered**: Chỉ kiểm tra client-side hoặc cho phép khác biệt chữ hoa/thường. Loại vì có thể tạo tài khoản trùng về mặt người dùng.

## Known Constraints

- Better Auth Admin plugin mặc định cấp nhiều thao tác hơn feature cần; custom ACL và test gọi trực tiếp các endpoint bị cấm là bắt buộc.
- Hiện tại session được lưu trong database; không bật cookie-cache trong feature này để tránh session cache làm trái yêu cầu thu hồi ngay.
- SRS nguồn ở tmp/spec-recipe-website.md đã được đối chiếu với FR4/FR7/NFR5 và đồng bộ vào thesis/doc/SRS.md theo chỉ đạo chủ dự án.
- Tùy chọn cụ thể về min password length sẽ được xác nhận theo Better Auth 1.7.6 tại lúc implement; đặc tả chốt tối thiểu 8 ký tự. Phiên bản hiện cài đặt mặc định ngưỡng 8 ký tự.
