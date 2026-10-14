# Implementation Plan: Đăng nhập và quản lý tài khoản

**Branch**: `002-auth-account-admin` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-auth-account-admin/spec.md`

## Summary

Cụ thể hóa FR4 bằng đăng ký/đăng nhập email-mật khẩu và mở rộng FR7 theo yêu cầu trực tiếp của chủ dự án với trang quản trị tài khoản. Dùng Better Auth và Prisma hiện có; thêm vai trò admin/user, trạng thái khóa, giao diện tiếng Việt và tài khoản demo phân vai. Tất cả thao tác quản trị được kiểm tra quyền ở phía máy chủ. Khi khóa tài khoản, cập nhật trạng thái và thu hồi phiên trong cùng giao dịch để bảo đảm phiên hiện tại chấm dứt ngay và không thể khóa quản trị viên hoạt động cuối cùng.

## Technical Context

**Language/Version**: TypeScript, Node.js 24 LTS

**Primary Dependencies**: Next.js 16 App Router, Better Auth 1.7.6, Prisma 6.19, Tailwind CSS 4, shadcn/ui; khai báo trực tiếp adapter Prisma chính thức của Better Auth để đáp ứng peer dependency của adapter hiện hữu.

**Storage**: PostgreSQL (Supabase), schema Prisma hiện có cho Better Auth (`user`, `session`, `account`, `verification`).

**Testing**: Kịch bản acceptance/quickstart thủ công; `pnpm lint` và `pnpm build` từ `src/` trong giai đoạn implement.

**Target Platform**: Web responsive, Vercel; giao diện tiếng Việt từ 375px.

**Project Type**: Ứng dụng web full-stack trong `src/`.

**Performance Goals**: Luồng đăng ký/đăng nhập hoàn tất trong 2 phút; danh sách quản trị phân trang 25 tài khoản/lần và chỉ trả các trường cần thiết. Đặc tả không đặt SLA số cho tìm kiếm tài khoản.

**Constraints**: Mật khẩu tối thiểu 8 ký tự và không lưu dạng đọc được; email chuẩn hóa chữ thường trước khi lưu; bảo vệ mọi thao tác quản trị phía server; khóa tài khoản chấm dứt các phiên hiện có ngay; không cho khóa quản trị viên hoạt động cuối cùng; giao diện 100% tiếng Việt và mobile-first; tài khoản demo không dùng làm thông tin xác thực môi trường sản xuất.

**Scale/Scope**: Tài khoản người dùng của website; tối thiểu 5 tài khoản demo, gồm ít nhất 1 admin và 1 user. Phạm vi trang quản trị: xem, tìm theo email/tên, khóa và mở khóa; không đổi vai trò, xóa, sửa email, đặt lại mật khẩu hoặc xem bí mật xác thực.

## Constitution Check

*GATE: Đánh giá trước nghiên cứu và sau thiết kế.*

| Nguyên tắc | Trạng thái | Căn cứ / xử lý |
|---|---|---|
| I. Đúng Spec — FR1–FR7 | PASS | Đăng nhập/đăng ký gắn FR4. Quản lý tài khoản mở rộng FR7 theo yêu cầu trực tiếp của chủ dự án. Đã đối chiếu SRS nguồn tmp/spec-recipe-website.md và đồng bộ phần mở rộng vào thesis/doc/SRS.md theo yêu cầu của chủ dự án. |
| II. Bảo mật & xác thực phía server | PASS | Server xác thực phiên/vai trò cho trang và thao tác quản trị; plugin không cấp các quyền admin ngoài feature; khóa tài khoản và thu hồi session trong một giao dịch; mật khẩu do Better Auth xử lý và hash. |
| III. UI tiếng Việt, mobile-first | PASS | Luồng đăng ký, đăng nhập, thông báo lỗi và trang tài khoản dùng tiếng Việt; layout hỗ trợ chiều rộng 375px. |
| IV. Stack & kiến trúc thống nhất | PASS | Dùng Next.js, Better Auth, adapter Prisma chính thức, Prisma, PostgreSQL, Tailwind/shadcn; business rule đặt trong service thay vì route handler. Adapter được khai báo trực tiếp vì Better Auth re-export adapter nhưng package adapter là peer dependency. |
| V. Dữ liệu demo và kiểm chứng | PASS | Giữ tối thiểu 5 tài khoản demo hiện hữu, phân vai ít nhất 1 admin và 1 user; hướng dẫn demo nêu tài khoản dành riêng môi trường demo. |

**Pre-implementation gate**: PASS — SRS nguồn đã được tìm thấy tại `tmp/spec-recipe-website.md`; phạm vi FR4/FR7/NFR5 đã được đồng bộ vào `thesis/doc/SRS.md` trước khi implement.

## Project Structure

### Documentation (this feature)

```text
specs/002-auth-account-admin/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── accounts.md
└── tasks.md                 # tạo ở bước /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/auth/[...all]/route.ts     # Better Auth handler hiện có
│   ├── dang-nhap/page.tsx             # trang mới
│   ├── dang-ky/page.tsx               # trang mới
│   ├── admin/tai-khoan/page.tsx       # trang mới, bảo vệ server-side
│   └── api/admin/accounts/            # route handlers cho tìm kiếm/khóa/mở khóa
├── components/
│   ├── auth/                          # biểu mẫu đăng nhập/đăng ký
│   └── admin/accounts/                # danh sách và thao tác tài khoản
├── lib/
│   ├── auth.ts                        # mở email/password và cấu hình admin plugin với ACL mặc định bị khóa
│   └── auth-client.ts                 # client Better Auth hiện có
├── services/
│   └── account-admin-service.ts       # quyền, tìm kiếm, khóa/mở khóa trong transaction
└── prisma/
    ├── schema.prisma                 # role và trường ban của plugin
    ├── migrations/                   # migration schema tài khoản
    └── seed.ts                       # tài khoản demo có phân vai
```

**Structure Decision**: Dùng cấu trúc web full-stack hiện hữu trong `src/`. Các kiểm tra phiên/quyền và quy tắc chống khóa admin cuối cùng nằm tại service phía server; UI chỉ gọi route được bảo vệ. `src/app/api/auth/[...all]/route.ts` tiếp tục là handler Better Auth hiện có.

## Complexity Tracking

Không có vi phạm cần biện minh. Khai báo `@better-auth/prisma-adapter` là runtime dependency trực tiếp để thỏa peer dependency đang bị thiếu của import Better Auth hiện hữu; đây là adapter chính thức của stack, không thêm hệ thống auth mới. Scope mở rộng FR7 đã được chủ dự án yêu cầu trực tiếp.
