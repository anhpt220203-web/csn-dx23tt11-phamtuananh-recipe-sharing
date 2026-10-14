# Website Quản lý & Chia sẻ Công thức Nấu Ăn

Đồ án học phần **Thực tập đồ án cơ sở ngành (220265)** — Trường Đại học Trà Vinh.
Sinh viên: Phạm Tuấn Anh (DX23TT11) | GVHD: ThS. Trầm Hoàng Nam.

## Yêu cầu runtime

- **Node.js ≥ 22.13** (khuyến nghị Node.js 24 LTS)
- **pnpm ≥ 11** (repo pin `pnpm@11.18.0`; monorepo dùng pnpm workspace + Turbo)
- **Supabase CLI** (để chạy DB local / link project cloud): `npm i -g supabase`
- Docker (chỉ khi chạy Supabase local)

## Cài đặt & chạy

```bash
git clone <repo-url> recipe-sharing && cd recipe-sharing
cd src                                 # monorepo root (MakerKit)
pnpm install

# 1. Biến môi trường cho app web
cp apps/web/.env.example apps/web/.env.local   # điền Supabase URL + keys

# 2. Database: áp dụng migration + nạp dữ liệu mẫu
pnpm --filter web supabase:start        # khởi động Supabase local (cần Docker)
pnpm --filter web supabase:reset        # migrate + tự nạp supabase/seed.sql
# — hoặc trỏ sang project Supabase cloud:
#   pnpm --filter web supabase link --project-ref <ref>
#   pnpm --filter web supabase db push

# 3. Chạy dev
pnpm dev                               # hoặc: pnpm --filter web dev
```

Mở `http://localhost:3000` — trang chủ tiếng Việt hiển thị.

> **Ghi chú tài liệu:** `specs/` và `thesis/` hiện vẫn mô tả stack cũ
> (Prisma + Better-Auth) — cần cập nhật ở giai đoạn hoàn thiện báo cáo.

## Cấu trúc thư mục

```
src/                              # Monorepo root (MakerKit Turbo)
├── apps/
│   └── web/                      # App Next.js 16 (App Router) — "Công Thức Việt"
│       ├── app/
│       │   ├── (marketing)/      # Trang công khai: /, /danh-muc, /cong-thuc/[slug],
│       │   │                     #   /tim-kiem, /faq (+ header/footer tiếng Việt)
│       │   ├── auth/             # /auth/sign-in, /auth/sign-up (Supabase Auth)
│       │   ├── admin/            # /admin/* — quản trị công thức, danh mục, tài khoản
│       │   ├── home/             # Dashboard người dùng (MakerKit)
│       │   └── yeu-thich/        # Công thức đã lưu (yêu cầu đăng nhập)
│       ├── components/recipes/   # RecipeCard, SearchForm, FavoriteButton, RatingWidget…
│       ├── lib/recipes/          # queries.ts (đọc), favorite-actions.ts, rating-actions.ts (ghi)
│       ├── supabase/
│       │   ├── migrations/       # 20241219_schema.sql (MakerKit) + 20261014_recipes.sql
│       │   └── seed.sql          # 7 danh mục + 33 công thức thật (có ảnh, ghi nguồn CC)
│       ├── public/images/recipes/# 33 ảnh minh họa công thức (kèm fallback khi lỗi)
│       ├── i18n/messages/vi/     # Bản dịch tiếng Việt (auth, marketing, common…)
│       └── .env.example          # Mẫu biến môi trường
├── packages/                     # @kit/*: ui, supabase, auth, next… (MakerKit)
├── tooling/                      # Cấu hình dùng chung (typescript, tailwind…)
└── turbo.json                    # Pipeline build/lint/typecheck
```

Import alias trong app web: `~/` (ví dụ `~/lib/recipes/queries`).

## Biến môi trường

`src/apps/web/.env.local` (xem `src/apps/web/.env.example`):

| Biến | Lấy ở đâu |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Project Settings > API (chỉ dùng phía server) |
| `NEXT_PUBLIC_SITE_URL` | URL deploy (local: `http://localhost:3000`) |
| `NEXT_PUBLIC_PRODUCT_NAME`… | Tên website, tiêu đề, mô tả, locale (`vi`) |

Auth dùng **Supabase Auth** (mật khẩu được hash bởi Supabase, không tự lưu
mật khẩu trong DB). Mọi thao tác ghi (yêu thích, đánh giá, trang admin) đều
kiểm tra quyền ở phía server (Server Actions + RLS policies trên Postgres).

## Tài khoản demo

Tạo 5 tài khoản qua **Supabase Dashboard > Authentication > Users > Add user**
("Create new user", tick "Auto Confirm User"), mật khẩu `Demo@123456`:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `phamtuananh@example.com` | `Demo@123456` |
| Người dùng | `tranbich@example.com` | `Demo@123456` |
| Người dùng | `minhkhoi@example.com` | `Demo@123456` |
| Người dùng | `hoangyen@example.com` | `Demo@123456` |
| Người dùng | `duchuy@example.com` | `Demo@123456` |

Gán quyền admin (sau khi tạo user qua Dashboard hoặc Management API):

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'phamtuananh@example.com';
```

Đăng nhập tại `/auth/sign-in`; trang quản trị tại `/admin`.

> Đây là thông tin dùng riêng cho môi trường trình diễn; không dùng cho production.

## Lệnh hữu ích

Chạy từ `src/` (monorepo root):

| Lệnh | Mô tả |
|---|---|
| `pnpm install` | Cài dependencies toàn monorepo |
| `pnpm dev` | Dev server (Turbo, tất cả apps) |
| `pnpm build` | Build production toàn monorepo |
| `pnpm typecheck` | Kiểm tra TypeScript toàn monorepo |
| `pnpm lint` / `pnpm lint:fix` | Kiểm tra / tự sửa (oxlint) |
| `pnpm format` / `pnpm format:fix` | Kiểm tra / tự sửa format (oxfmt) |
| `pnpm --filter web supabase:start` | Khởi động Supabase local |
| `pnpm --filter web supabase:reset` | Migrate + seed lại DB local |
| `pnpm --filter web supabase:typegen` | Sinh lại TypeScript types từ DB |

## Deploy Vercel

1. Import repo vào Vercel, đặt **Root Directory = `src/apps/web`**.
2. Framework Preset: Next.js (mặc định).
3. Thêm Environment Variables (xem bảng ở mục "Biến môi trường"), với
   `NEXT_PUBLIC_SITE_URL` là URL production (https).
4. Trên Supabase cloud: chạy các migration trong
   `src/apps/web/supabase/migrations/` (`supabase db push`) rồi chạy
   `src/apps/web/supabase/seed.sql` một lần (SQL Editor) để nạp dữ liệu mẫu.

## Tech Stack

- Next.js 16 (App Router) + TypeScript — monorepo MakerKit (pnpm + Turbo)
- Supabase: Postgres + Auth + RLS (không dùng Prisma/Better-Auth)
- Tailwind CSS v4 + shadcn/ui (`@kit/ui`)
- pnpm · Node.js 24 LTS · Deploy: Vercel (Root Directory = `src/apps/web`)
