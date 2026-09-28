# Data Model: Khởi tạo dự án Next.js 16 + AI Skills

**Feature**: 001-setup-nextjs16-skills | **Date**: 2026-09-28 | **ERD nguồn**: SRS §4.1
(`tmp/spec-recipe-website.md`)

Phạm vi schema của feature này là **tối thiểu** theo Clarifications 2026-09-28:
khung xác thực Better-Auth + 2 entity nghiệp vụ cốt lõi (Category, Recipe). Các bảng
mở rộng của ERD SRS được **hoãn có chủ đích** cho feature FR1–FR7 (bảng hoãn ở cuối).

## 1. Nhóm xác thực (Better-Auth quản lý — sinh bởi `@better-auth/cli generate`)

### User (người dùng)
| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | string (PK) | do Better-Auth sinh (cuid) |
| name | string | tên hiển thị |
| email | string, UNIQUE | định danh đăng nhập |
| emailVerified | boolean | mặc định false |
| createdAt / updatedAt | datetime | do thư viện quản lý |

### Account (thông tin xác thực)
| Trường | Kiểu | Ghi chú |
|---|---|---|
| id | string (PK) | |
| userId | string (FK → User.id, CASCADE) | |
| providerId | string | `"credential"` cho email/password |
| accountId | string | |
| password | string | **đã hash bởi Better-Auth** — không lưu plain (NFR2) |

### Session & Verification
- **Session**: phiên đăng nhập (id, userId FK, token UNIQUE, expiresAt, ipAddress,
  userAgent) — do thư viện quản lý, hết hạn tự vô hiệu.
- **Verification**: token xác minh (dùng về sau nếu bật verify email).

> Mapping với ERD SRS: bảng `USERS` (id int, password_hash, role enum) được thay bằng
> bộ bảng chuẩn Better-Auth ở trên — hash nằm ở `Account.password`, `role` ("user |
> admin") sẽ thêm như extra field khi feature FR4/FR7 cần phân quyền.

## 2. Entity nghiệp vụ tối thiểu (feature này tạo)

### Category (danh mục món ăn)
| Trường | Kiểu | Ràng buộc / Validation |
|---|---|---|
| id | int autoincrement (PK) | |
| name | string | bắt buộc, không rỗng, hiển thị tiếng Việt |
| slug | string, UNIQUE | định danh URL, lowercase + gạch nối |
| description | string? | tùy chọn |

### Recipe (công thức)
| Trường | Kiểu | Ràng buộc / Validation |
|---|---|---|
| id | int autoincrement (PK) | |
| categoryId | int (FK → Category.id) | bắt buộc — Category 1–N Recipe |
| title | string | bắt buộc, tên món tiếng Việt |
| slug | string, UNIQUE | định danh URL |
| description | string? | mô tả ngắn |
| createdAt / updatedAt | datetime | tự động |

**Quan hệ**: `Category 1 ── N Recipe` (xóa Category có recipe sẽ bị chặn ở tầng Prisma
qua quan hệ bắt buộc — hành vi mặc định an toàn cho seed/demo).

## 3. Trường/bảng HOÃN cho feature kế tiếp (không tạo ở feature này)

| Thành phần của ERD SRS | Hoãn về |
|---|---|
| `recipes.image_url`, `cook_time_minutes`, `servings`, `difficulty`, `status`, `created_by` | FR1 (hiển thị công thức) |
| `recipe_ingredients`, `recipe_steps` + chỉ mục tìm kiếm (SRS §4.2) | FR1/FR2/FR3 |
| `favorites` | FR5 |
| `ratings` + ràng buộc UNIQUE(user_id, recipe_id) | FR6 |
| `users.role` enum, trang quản trị | FR4/FR7 |

## 4. Dữ liệu seed (đối chiếu FR-007)

- Tối thiểu: **1 Category** (vd: "Món ăn Việt Nam") + **1 Recipe** thuộc category đó.
- Chiến lược: **upsert theo `slug`** → chạy `pnpm exec prisma db seed` (từ `src/`) nhiều lần cho kết quả
  nhất quán (edge case "không nhân đôi bản ghi").
- Nội dung seed thật (≥ 30 công thức có ảnh, 7 danh mục, ≥ 5 tài khoản demo — NFR5)
  thuộc feature kế tiếp, KHÔNG ở feature này.
