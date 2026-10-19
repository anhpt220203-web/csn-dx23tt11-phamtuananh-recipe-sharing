# Website Quản lý & Chia sẻ Công thức Nấu Ăn

Đồ án học phần **Thực tập đồ án cơ sở ngành (220265)** — Trường Đại học Trà Vinh.
Sinh viên: Phạm Tuấn Anh (DX23TT11) | GVHD: ThS. Trầm Hoàng Nam.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript — full-stack
- **Supabase** (PostgreSQL + Auth + Storage) — Supabase-native, không dùng Prisma/Better-Auth
- **Tailwind CSS v4** + shadcn/ui (`@kit/ui`)
- Monorepo MakerKit: pnpm workspace + Turbo
- pnpm v12 · Node.js 24 LTS · Deploy: Vercel (Root Directory = `src/apps/web`)

## Yêu cầu runtime

- **Node.js 24 LTS**
- **pnpm 12** (`corepack enable` rồi `corepack prepare pnpm@12.14.0 --activate`)
- **Supabase CLI** (để chạy DB local): `npm i -g supabase`
- Docker (chỉ khi chạy Supabase local)

## Cấu trúc thư mục

```
├── src/                              # Monorepo root (MakerKit: pnpm + Turbo)
│   ├── apps/web/                     # App Next.js "Công thức món ngon"
│   │   ├── app/
│   │   │   ├── (marketing)/          # Trang công khai: /, /danh-muc,
│   │   │   │                         #   /cong-thuc/[slug], /tim-kiem, /faq,
│   │   │   │                         #   /yeu-thich, /profile
│   │   │   ├── admin/                # /admin/* — quản trị (yêu cầu role admin)
│   │   │   └── auth/                 # /auth/sign-in, /auth/sign-up, /auth/callback
│   │   ├── components/recipes/       # RecipeCard, SearchForm, FavoriteButton…
│   │   ├── lib/recipes/              # queries (đọc), actions (ghi)
│   │   ├── config/                   # paths, navigation, app config
│   │   ├── i18n/messages/vi/         # Bản dịch tiếng Việt
│   │   └── public/images/            # Logo, favicon, ảnh công thức
│   └── packages/                     # @kit/*: ui, supabase, auth… (MakerKit)
├── supabase/                         # Supabase project (root)
│   ├── migrations/                   # SQL migrations (tự chạy khi merge vào dev)
│   ├── seed/                         # Dữ liệu mẫu
│   └── config.toml
├── docker/                           # Docker demo (optional)
├── specs/                            # Spec Kit artifacts
├── thesis/                           # Báo cáo, slide, video
└── progress-report/                  # Báo cáo tiến độ hằng tuần
```

## Cài đặt & chạy

```bash
git clone <repo-url> recipe-sharing && cd recipe-sharing

# 1. Cài dependencies (từ monorepo root)
cd src
pnpm install

# 2. Biến môi trường cho app web
cp apps/web/.env.example apps/web/.env.local   # điền Supabase URL + keys

# 3. Database — chọn 1 trong 2 cách:
# Cách A: Supabase local (cần Docker)
pnpm --filter web supabase:start
pnpm --filter web supabase:reset                # migrate + seed

# Cách B: Supabase cloud
#   Link project rồi push migrations, chạy seed trong SQL Editor
pnpm --filter web supabase link --project-ref <ref>
pnpm --filter web supabase db push

# 4. Chạy dev
pnpm dev                                        # hoặc: pnpm --filter web dev
```

Mở `http://localhost:3000` — trang chủ tiếng Việt hiển thị.

> **Lưu ý**: `specs/` và `thesis/` hiện vẫn mô tả stack cũ
> (Prisma + Better-Auth) — cần cập nhật ở giai đoạn hoàn thiện báo cáo.

## Biến môi trường

`src/apps/web/.env.local` (xem `src/apps/web/.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` — URL project Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (dùng phía client)
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (chỉ dùng phía server, không expose)

## Lệnh hữu ích

Chạy từ `src/` (monorepo root):

| Lệnh | Mô tả |
|---|---|
| `pnpm dev` | Dev server (localhost:3000) |
| `pnpm build` | Build production (`pnpm --filter web build`) |
| `pnpm lint` | Kiểm tra lint (oxlint) |
| `pnpm typecheck` | Kiểm tra TypeScript |

## Quy trình Git

- Nhánh `dev`: nhánh phát triển chính. Tạo nhánh mới từ `dev` để làm tính năng.
- Đặt tên nhánh theo chuẩn: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`…
- Tạo PR về `dev`. Không tự merge khi chưa được duyệt.
- Nhánh `main`: production. Chỉ merge `dev` → `main` khi cần demo/deploy.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Quản trị viên | `phamtuananh@example.com` | `Demo@123456` |
| Người dùng | `member@example.com` | `Demo@123456` |

Đây là thông tin dùng riêng cho môi trường trình diễn; không dùng cho production.

## Bảo mật

Xem chi tiết tại [SECURITY.md](./SECURITY.md). Tóm tắt:

- **Xác thực**: Supabase Auth (email/mật khẩu + magic link), mật khẩu hash bcrypt.
- **Phân quyền**: RLS trên mọi bảng, kiểm tra quyền phía server cho mọi API ghi.
- **Dữ liệu**: bài `draft` không lộ ra trang công khai; không commit secret vào git.

## Tài liệu & Sản phẩm đồ án

- **Demo trực tuyến (Production):** [https://congthucmonngon.vercel.app/](https://congthucmonngon.vercel.app/)
- **Video thuyết trình:** [Xem trên Google Drive](https://drive.google.com/file/d/1Js6hktgXg87k_ujcDFoxUNEDk5Ned2Hc/view?usp=drive_link)
- **Slide thuyết trình (PPTX):** [Mở trên Google Slides / Drive](https://docs.google.com/presentation/d/1aqfQHe6DhOZyawVVkuZ3dp2ga1ycWgZp/edit?usp=drive_link&ouid=113373514251718277949&rtpof=true&sd=true)
- **Đặc tả yêu cầu phần mềm:** [SRS v2.0 (Next.js 16 + Supabase)](./thesis/refs/SRS.md)
