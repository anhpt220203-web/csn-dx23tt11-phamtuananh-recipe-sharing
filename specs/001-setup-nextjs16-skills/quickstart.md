# Quickstart: Kiểm chứng end-to-end — Khởi tạo dự án Next.js 16 + AI Skills

**Feature**: 001-setup-nextjs16-skills | **Date**: 2026-09-28

Hướng dẫn chạy lại toàn bộ kịch bản nghiệm thu của feature từ máy trống. Mỗi bước
ghi rõ **kết quả mong đợi**; cuối file là bảng đối chiếu với Success Criteria
(SC-001…SC-006 trong [spec.md](./spec.md)). Chi tiết thiết kế xem
[plan.md](./plan.md) · [research.md](./research.md) · [data-model.md](./data-model.md).

## Prerequisites

- **Node.js 24 LTS** (`node -v` ≥ 24.x) — phiên bản pin theo Clarifications 2026-09-28
- Git, **pnpm** v12+ (`npm i -g pnpm` nếu chưa có)
- Tài khoản Supabase có project PostgreSQL đã tạo (lấy 2 chuỗi kết nối: pooler 6543
  và direct 5432)
- Tài khoản Vercel (cho phần kiểm tra deploy preview)

## 1. Chạy dự án từ máy trống (→ SC-001, SC-002)

```bash
git clone <repo-url> recipe-sharing && cd recipe-sharing
git checkout 001-setup-nextjs16-skills

cd src                            # Next.js project root
pnpm install
cp .env.example .env.local        # điền DATABASE_URL / DIRECT_URL / SUPABASE_URL / ANON_KEY / BETTER_AUTH_SECRET
pnpm exec prisma migrate dev      # tạo cấu trúc dữ liệu
pnpm exec prisma db seed          # nạp dữ liệu mẫu tối thiểu
pnpm dev
```

**Kết quả mong đợi**:

- Mỗi lệnh chạy không lỗi; nếu thiếu biến môi trường → thông báo chỉ rõ tên biến thiếu
  (không lỗi mù mờ). Nếu port 3000 bận → console báo rõ và hướng dẫn `pnpm dev -- -p <port>`.
- Mở `http://localhost:3000`: trang chủ **tiếng Việt**, hiển thị nội dung đọc từ dữ
  liệu seed (tên danh mục + tên công thức mẫu) — không trang trắng/lỗi.
- Toàn bộ quá trình từ clone đến thấy trang chủ ≤ 15 phút chỉ theo README.

## 2. Kiểm chứng dữ liệu (→ SC-003, edge case idempotent)

```bash
pnpm exec prisma db seed    # chạy lần 2 (từ src/)
```

**Kết quả mong đợi**: seed chạy lại thành công, số bản ghi Category/Recipe không tăng
(upsert theo slug); trang chủ vẫn hiển thị đúng 1 danh mục + 1 công thức mẫu.

Truy cập trang chủ khi DB chưa seed (xóa bản ghi rồi reload): hiển thị trạng thái trống
thân thiện tiếng Việt, không màn hình lỗi trắng.

## 3. Kiểm chứng bảo mật cơ bản (→ SC-004)

```bash
git status                      # .env.local / .env KHÔNG xuất hiện (đã bị .gitignore chặn)
git log --all --full-history -p | grep -i "supabase\|password\|anon_key"   # không có secret nào
```

**Kết quả mong đợi**: không tìm thấy secret/chuỗi kết nối trong working tree và lịch
sử git; mật khẩu trong bảng `Account.password` là chuỗi hash (kiểm bằng Supabase
Table Editor), không plain.

## 4. Kiểm chứng quy trình AI skills (→ SC-005)

- Chạy `/speckit-specify` cho feature kế tiếp (vd: nội dung seed thật NFR5).
- **Kết quả mong đợi**: thư mục mới `specs/002-...` được sinh đúng theo
  `.specify/feature.json`; constitution v1.1.0 được nạp làm ràng buộc (Next.js 16,
  phạm vi FR1–FR7, tiếng Việt). Không cần sửa cấu hình thủ công.

## 5. Kiểm chứng deploy preview (→ SC-006)

- Import repository vào Vercel: đặt **Root Directory = `src`** (Vercel tự
  nhận pnpm qua trường `packageManager`); thêm biến môi trường: `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `BETTER_AUTH_SECRET` + `DATABASE_URL` (pooler). Deploy preview.
- **Kết quả mong đợi**: URL preview truy cập được từ xa, hiển thị đúng trang chủ
  tiếng Việt với dữ liệu seed → dùng làm link demo cho báo cáo tuần.

## Bảng đối chiếu Success Criteria

| SC | Kịch bản kiểm chứng | Kết quả mong đợi chính |
|---|---|---|
| SC-001 | Bước 1 | Clone → trang chủ ≤ 15 phút, chỉ theo README |
| SC-002 | Bước 1 | 100% lệnh trong README chạy đúng mô tả |
| SC-003 | Bước 1–2 | Trang chủ hiển thị dữ liệu seed, seed idempotent |
| SC-004 | Bước 3 | Không secret trong git; mật khẩu hash |
| SC-005 | Bước 4 | Feature kế tiếp sinh đúng nơi, constitution được nạp |
| SC-006 | Bước 5 | Preview URL công khai hiển thị đúng trang chủ |
