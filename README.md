# Website Quản lý & Chia sẻ Công thức Nấu Ăn

Đồ án học phần **Thực tập đồ án cơ sở ngành (220265)** — Trường Đại học Trà Vinh.
Sinh viên: Phạm Tuấn Anh (DX23TT11) | GVHD: ThS. Trầm Hoàng Nam.

## Yêu cầu runtime

- **Node.js 24 LTS** (xem `src/.nvmrc`)
- npm (đi kèm Node)

## Cài đặt & chạy

```bash
git clone <repo-url> recipe-sharing && cd recipe-sharing
cd src                            # Next.js project root
pnpm install
cp .env.example .env.local        # điền giá trị Supabase
pnpm exec prisma migrate dev      # tạo cấu trúc dữ liệu
pnpm exec prisma db seed          # nạp dữ liệu mẫu
pnpm dev
```

Mở `http://localhost:3000` — trang chủ tiếng Việt hiển thị.

## Cấu trúc thư mục

```
src/                          # Next.js project root (full-stack)
├── app/                      # App Router: pages, layouts, globals.css, api/ (routes)
│   └── api/auth/[...all]/    # Endpoint Better-Auth
├── components/ui/            # UI components (shadcn/ui)
├── lib/                      # prisma.ts (singleton), auth.ts (server), auth-client.ts, utils.ts
├── services/                 # Business logic (tầng service — NFR6, dùng từ FR1+)
├── prisma/                   # schema.prisma + seed.ts
├── generated/prisma/         # Prisma client auto-gen (gitignored)
├── public/                   # Tài nguyên tĩnh
├── package.json              # Dependencies (pnpm)
├── prisma.config.ts          # Prisma v6 config
└── next.config.ts / tsconfig.json / eslint.config.mjs / components.json
```

Import alias: `@/*` (ví dụ `@/lib/prisma`, `@/components/ui/button`).

## Biến môi trường

`src/.env.local` (xem `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — từ dashboard Supabase > Connect
- `DATABASE_URL` / `DIRECT_URL` — Supavisor pooler (IPv4): `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require`
  - ⚠️ Host direct `db.<ref>.supabase.co` chỉ có **IPv6** — mạng không hỗ trợ IPv6 sẽ báo `P1001`; dùng pooler cho cả hai biến (session pooler 5432 chạy được cả migration)
- `BETTER_AUTH_SECRET` — sinh random: `openssl rand -base64 32`

Supabase client đã tích hợp qua shadcn registry (`@supabase/supabase-js` +
`@supabase/ssr`): `src/lib/client.ts` (browser), `src/lib/server.ts` (server
components/route handlers), `src/lib/middleware.ts` (helper `updateSession` —
wire vào middleware khi cần refresh session Supabase).

## Lệnh hữu ích

| Lệnh | Thư mục | Mô tả |
|---|---|---|
| `pnpm dev` | Dev server localhost:3000 |
| `pnpm build` | Build production |
| `pnpm lint` / `pnpm lint:fix` | Kiểm tra / tự sửa ESLint |
| `pnpm exec prisma migrate dev` | Tạo/áp dụng migration |
| `pnpm exec prisma db seed` | Nạp dữ liệu mẫu |
| `pnpm exec prisma studio` | Quản lý data qua UI |

## Agent tooling (Next.js AI Agents guide)

- `src/AGENTS.md` + `src/CLAUDE.md` — hướng dẫn coding agent, khối
  `nextjs-agent-rules` trỏ vào docs bundled `node_modules/next/dist/docs/`
  (tự cập nhật theo phiên bản Next.js bởi `next dev`).
- `.mcp.json` — Next.js MCP server (`next-devtools-mcp`): agent đọc lỗi
  build/runtime/type trực tiếp từ dev server qua `/_next/mcp`. Chạy `pnpm dev`
  trước để MCP có dữ liệu.
- `.zcode/skills/next-*` — 5 skills Next.js chính thức: `next-dev-loop`
  (verify runtime sau mỗi edit), các skill adoption/optimizer cho Cache Components
  và Partial Prefetching (dùng khi tối ưu hiệu năng ở feature FR1+).

## Tech Stack

- Next.js 16 (App Router, Turbopack) + TypeScript — full-stack trong `src/`
- Prisma v6 + PostgreSQL (Supabase)
- Tailwind CSS v4 + shadcn/ui
- Better-Auth (email/password)
- pnpm v12 · Node.js 24 LTS · Deploy: Vercel (Root Directory = `src`)
