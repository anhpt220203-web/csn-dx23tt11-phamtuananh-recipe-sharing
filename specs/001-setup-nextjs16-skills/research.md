# Research: Khởi tạo dự án Next.js 16 + AI Skills

**Feature**: 001-setup-nextjs16-skills | **Date**: 2026-09-28 | **Branch**: `001-setup-nextjs16-skills`

Kết quả nghiên cứu giải quyết toàn bộ điểm cần quyết định của Technical Context.
Mỗi mục theo format: Decision / Rationale / Alternatives considered.

## D1. Next.js 16.x — bộ khung ứng dụng

- **Decision**: Next.js 16 (bản ổn định hiện hành 16.3, phát hành 10/2025, điểm phát
  hành mới nhất 08/2026) tạo bằng `create-next-app` với App Router + TypeScript +
  Tailwind + thư mục `src/`. Turbopack là bundler mặc định cho dev và build.
- **Rationale**: khớp pin stack trong constitution v1.1.0 và chỉ định của chủ dự án
  ("cài Next.js 16"); Turbopack cho vòng lặp dev nhanh hơn — phù hợp một người làm
  trong 3 tuần. Lưu ý migrated: middleware mặc định giờ là `proxy.ts` (chỉ cần biết
  khi feature sau cần middleware); AMP đã bị loại ở v16 (không dùng).
- **Alternatives considered**: Next.js 15 (theo SRS §6.1 cũ — bị chủ dự án thay thế
  rõ ràng, constitution v1.1.0 đã ghi nhận); Vite/Remix (ngoài pin stack).

## D2. Prisma v6 (KHÔNG v7) — ORM dữ liệu

- **Decision**: pin Prisma **v6** + `@prisma/client` v6; cấu hình qua datasource block
  (`url` + `directUrl`) đọc từ biến môi trường.
- **Rationale**: có báo cáo tương thích chưa trơn giữa Better-Auth CLI
  (`@better-auth/cli generate`) và Prisma v7 — schema/config cần sửa tay sau mỗi lần
  chạy CLI (better-auth discussion #6681). Với tiến độ 3 tuần và seed/auth chạy CLI
  nhiều lần, v6 là lựa chọn ổn định, tài liệu đầy đủ (Prisma ORM v6 docs), không mất
  gì về tính năng cần dùng.
- **Alternatives considered**: Prisma v7 (mới nhất nhưng dính gotcha tương thích ở
  trên + đổi cách cấu hình sang `prisma.config.ts`); Drizzle (ngoài pin stack).

## D3. Better-Auth — khung xác thực

- **Decision**: Better-Auth với Prisma adapter (`prismaAdapter(prisma, { provider:
  "postgresql" })`), bật `emailAndPassword: { enabled: true }`, route handler chuẩn
  `/api/auth/[...all]`; schema auth sinh bằng `npx @better-auth/cli generate` sau khi
  khai báo cấu hình auth.
- **Rationale**: quyết định của chủ dự án tại Clarifications 2026-09-28; mật khẩu
  được hash sẵn bởi thư viện (đáp ứng NFR2); tài liệu chính thức có guide Prisma +
  Next.js từng bước; sinh đúng bảng user/session/account/verification.
- **Alternatives considered**: Auth.js/NextAuth v5 (phân quyền chi tiết dài dòng hơn,
  bị loại ở Clarifications); tự viết auth (vi phạm tinh thần dùng stack chuẩn, tốn
  thời gian, rủi ro bảo mật).

## D4. Supabase + Prisma — hai chuỗi kết nối

- **Decision**: hai biến kết nối trong env file của project (`src/.env.local`,
  gitignored):
  - `DATABASE_URL` — Supavisor **transaction pooler** (port 6543) kèm
    `?pgbouncer=true&connection_limit=1&sslmode=require` cho runtime app;
  - `DIRECT_URL` — kết nối trực tiếp (port 5432) cho `prisma migrate dev` / db seed.
  - Datasource: `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`.
- **Rationale**: hướng dẫn chính thức Prisma (ORM v6) + Supabase: pooler cho runtime
  (giới hạn kết nối), kết nối trực tiếp cho migration; `pgbouncer=true` tắt prepared
  statements — bắt buộc vì Supavisor transaction mode không hỗ trợ prepared statements
  (Supabase troubleshooting). Danh sách biến mở rộng so với FR-008 (thêm `DIRECT_URL`,
  `BETTER_AUTH_SECRET`) — FR-008 liệt kê mức tối thiểu, không cấm biến bổ sung; ghi
  nhận trong `.env.example`.
- **Alternatives considered**: một chuỗi kết nối duy nhất (migrate qua pooler sẽ lỗi
  hoặc treo); session pooler port 5432 cho runtime (tốn kết nối hơn cần thiết).

## D5. Tailwind CSS v4 + shadcn/ui — lớp UI

- **Decision**: Tailwind v4 (đi kèm `create-next-app`, cấu hình CSS-first: `@import
  "tailwindcss"` trong `globals.css`, token qua `@theme`, không `tailwind.config.js`)
  + shadcn/ui init bằng CLI `npx shadcn@latest init` (package `shadcn-ui` cũ đã deprecated).
- **Rationale**: là chuẩn hiện hành 2026 cho Next.js 16 + React 19; shadcn/ui cho
  component copy-paste vào `src/components/ui` — tuỳ chủ, không khoá dependency;
  mobile-first bằng breakpoint nhỏ mặc định của Tailwind.
- **Alternatives considered**: Tailwind v3 + config JS (cũ, dễ lệch chuẩn với
  create-next-app v16); MUI/Ant (ngoài pin stack, nặng hơn).

## D6. Seed pipeline — idempotent, chạy CLI

- **Decision**: `prisma/seed.ts` khai báo trong cấu hình Prisma (`prisma.seed`),
  chạy bằng `pnpm exec prisma db seed` (từ `src/`); nạp tối thiểu 1 Category + 1 Recipe (theo ERD SRS
  §4, trường cốt lõi) theo kiểu upsert theo `slug` → chạy nhiều lần không nhân đôi.
- **Rationale**: đáp ứng FR-007 + edge case "chạy lặp lại không trùng lặp"; upsert
  theo unique key là pattern đơn giản nhất không cần transaction thủ công.
- **Alternatives considered**: `deleteMany` + `createMany` ( destructive — mất dữ
  liệu người dùng nếu chạy nhầm ở môi trường chung); seed bằng SQL thô (lệch chuẩn ORM).

## D7. pnpm v12 + agent tooling (bổ sung khi implement, 28/09/2026)

- **Decision**: pnpm v12 làm package manager cho cả frontend và backend
  (`packageManager: pnpm@12.6.0` pinned); whitelist lifecycle scripts trong
  `pnpm-workspace.yaml` (`allowBuilds`). Kèm theo: agent tooling theo docs Next.js —
  `AGENTS.md` + `CLAUDE.md` tại `src/` (khối managed `nextjs-agent-rules`),
  `.mcp.json` ở repo root với `next-devtools-mcp@latest`, 5 skills Next.js trong
  `.zcode/skills/`.
- **Rationale**: chỉ định của chủ dự án ("chuyển qua dùng pnpm"); pnpm 12 chặn
  postinstall mặc định nên phải whitelist Prisma engines + esbuild. MCP + skills cho
  agent thấy runtime thật (lỗi build/runtime/type qua `/_next/mcp`) thay vì chỉ tin
  "compile được"; docs bundled trong `node_modules/next/dist/docs/` giữ kiến thức
  agent khớp phiên bản cài đặt.
- **Alternatives considered**: npm (flat node_modules, chậm hơn, đã dùng ban đầu rồi
  chuyển); yarn/bun (ngoài nhu cầu); bỏ qua MCP/skills (agent mù runtime, phụ thuộc
  training data lỗi thời).

## D8. Đơn giản hoá: một project duy nhất tại `src/` (28/09/2026)

- **Decision**: bỏ tách `src/frontend/` + `src/backend/` + `src/shared/`; `src/` là
  Next.js project root duy nhất chứa cả backend concerns (prisma/, lib/prisma.ts,
  lib/auth.ts, services/). Một package.json, một node_modules, env gộp về
  `src/.env.local`. Import `@/lib/auth` hoạt động lại bình thường (không cần
  `turbopack.root`/`externalDir` — next.config.ts revert về mặc định).
- **Rationale**: chỉ đạo cuối của chủ dự án sau khi đã thử tách 2 project. Một
  project duy nhất khớp chuẩn create-next-app, xoá mọi ma sát Turbopack cross-root,
  gọn cho một người phát triển trong 3 tuần. Tầng `services/` + `lib/` vẫn giữ NFR6
  (tách tầng route/service/model).
- **Alternatives considered**: giữ tách frontend/backend (đã thử — phát sinh hack
  turbopack root + 2 package.json + import relative 5 cấp, khó bảo trì).

## Nguồn tham chiếu

- Next.js 16: [devbriefs — proxy.ts migration & Turbopack](https://devbriefs.com),
  [tapflare](https://tapflare.com), [developersdigest](https://www.developersdigest.tech)
- Better-Auth: [Prisma adapter](https://better-auth.com/docs/adapters/prisma),
  [Database/schema generate](https://better-auth.com/docs/concepts/database),
  [Guide Prisma + Next.js](https://www.prisma.io/docs/guides/authentication/better-auth/nextjs),
  [Gotcha Prisma v7 (#6681)](https://github.com/better-auth/better-auth/discussions/6681)
- Supabase + Prisma: [Supabase Docs — Prisma](https://supabase.com/docs/guides/database/prisma),
  [Prisma Docs — Supabase (v6)](https://www.prisma.io/docs/orm/v6/overview/databases/supabase),
  [Prisma — PgBouncer](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer),
  [Supabase troubleshooting](https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting)
- Tailwind v4 + shadcn: [shadcn-guide](https://lobehub.com), [windframe](https://windframe.dev)
