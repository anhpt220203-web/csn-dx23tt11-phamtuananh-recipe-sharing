# Implementation Plan: Khởi tạo dự án Next.js 16 + AI Skills

**Branch**: `001-setup-nextjs16-skills` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-setup-nextjs16-skills/spec.md`

## Summary

Khởi tạo nền tảng full-stack chạy được cho Website Quản lý & Chia sẻ Công thức Nấu Ăn:
Next.js 16 (App Router, Turbopack) + TypeScript trong thư mục `src/` thống nhất, lớp dữ
liệu Prisma v6 kết nối PostgreSQL trên Supabase (pooled + direct URL), khung xác thực
Better-Auth (email/password, mật khẩu hash), Tailwind CSS v4 + shadcn/ui, seed pipeline
tối thiểu (≥ 1 danh mục + 1 công thức theo ERD SRS §4), trang chủ tiếng Việt chạy tại
localhost:3000, README tái lập được toàn bộ từ máy trống, và bản preview Vercel dùng demo.
Feature này là enabler cho toàn bộ FR1–FR7 — không chứa tính năng nghiệp vụ.

## Technical Context

**Language/Version**: TypeScript 5.x trên Node.js 24 LTS (pin theo Clarifications
2026-09-28; Next.js 16 yêu cầu Node ≥ 20.9); Next.js 16.3.6 + React 19.2

**Package Manager**: pnpm v12 (quyết định chủ dự án 28/09/2026, thay npm — xem
research.md D7); `packageManager: pnpm@12.6.0` pinned trong `src/package.json`;
whitelist build scripts trong `src/pnpm-workspace.yaml` (`allowBuilds`)

**Primary Dependencies**: Next.js 16 (App Router, Turbopack mặc định), Prisma v6 +
`@prisma/client` (v6 thay v7 — xem research.md D2), Better-Auth (Prisma adapter),
Tailwind CSS v4 (CSS-first config), shadcn/ui (CLI `npx shadcn@latest init`)

**Agent Tooling** (docs Next.js guides/ai-agents + guides/mcp): `AGENTS.md` +
`CLAUDE.md` tại `src/` (khối `nextjs-agent-rules` do `next dev` quản lý,
trỏ docs bundled `node_modules/next/dist/docs/`); `.mcp.json` ở repo root với
`next-devtools-mcp` (kết nối `/_next/mcp` khi dev server chạy); 5 skills Next.js
trong `.zcode/skills/` (next-dev-loop + 4 adoption/optimizer)

**Storage**: PostgreSQL (Supabase) — kết nối runtime qua Supavisor pooler (port 6543,
`?pgbouncer=true&connection_limit=1`), migration qua `DIRECT_URL` (port 5432)

**Testing**: Kiểm tra thủ công end-to-end theo [quickstart.md](./quickstart.md) (map
trực tiếp vào SC-001…SC-006); framework unit/contract test sẽ pin ở feature nghiệp vụ
đầu tiên (FR1)

**Target Platform**: Web — trình duyệt desktop & mobile (hiển thị tốt từ 375px, NFR3);
deploy preview trên Vercel

**Project Type**: web-app Next.js full-stack MỘT project tại `src/` — `app/` gộp
UI + API routes, `lib/` (prisma, auth), `services/` (business logic), `prisma/`
(schema + seed) cùng một project root

**Performance Goals**: NFR1 (tải trang chi tiết < 2s, tìm kiếm < 1s @ ~5.000 công thức)
đo ở feature FR1; riêng scaffold này: `pnpm dev` sẵn sàng nhận request < 60s trên
máy dev thông thường; trang chủ tải < 2s trên preview Vercel

**Constraints**: UI tiếng Việt hoàn toàn; mobile-first 375px; secrets chỉ trong
`.env.local` (không commit); Node.js 24 LTS; commit ≥ 1 lần/tuần (điều kiện chấm điểm);
mật khẩu hash — không lưu plain (NFR2)

**Scale/Scope**: 1 người phát triển, ~3 tuần code (SRS §6.3); scope feature này: scaffold
+ auth khung + schema tối thiểu + seed tối thiểu + README + preview deploy; không gồm
FR1–FR7 (mỗi FR một feature kế tiếp)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Nguyên tắc | Trạng thái | Ghi chú kiểm tra |
|---|---|---|
| I. Đúng Spec — Phạm vi đóng băng | ✅ PASS | Feature là enabler hạ tầng cho FR1–FR7, không thêm tính năng nghiệp vụ; schema Category + Recipe tối thiểu bắt nguồn từ Clarifications 2026-09-28 (giải quyết mâu thuẫn FR-007 ↔ Key Entities); mọi việc truy vết được về spec feature này |
| II. Bảo mật & Xác thực phía Server | ✅ PASS | Better-Auth hash mật khẩu (NFR2); chưa có API ghi nào; secrets chỉ trong `.env.local`, `.gitignore` chặn `.env*` trước commit đầu; truy vấn qua Prisma parameterized |
| III. UI Tiếng Việt, Mobile-First | ✅ PASS | Trang chủ tiếng Việt là kết quả hiển thị mặc định; Tailwind mobile-first; shadcn/ui là bộ component duy nhất; không có màn hình tiếng Anh sót |
| IV. Stack & Kiến trúc Thống nhất | ✅ PASS | Đúng pin stack constitution v1.1.0 (Next.js 16 + TS + Prisma/Supabase + Tailwind/shadcn + Better-Auth + Vercel); mã trong `src/` thống nhất, placeholder `scr/` bị xoá; không dependency runtime ngoài danh sách trên |
| V. Dữ liệu Thật & Nghiệm thu | ✅ PASS (ghi chú) | Seed pipeline tối thiểu (≥ 1 danh mục + 1 công thức, idempotent) đúng phạm vi spec; nội dung ≥ 30 công thức thật (NFR5) là feature kế tiếp — đúng ranh giới spec, không phải vi phạm |

**Gate result**: Không có vi phạm — không cần mục Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-setup-nextjs16-skills/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # KHÔNG sinh ở feature này (xã giải thích bên dưới)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

**contracts/ không sinh ở feature này**: scaffold chưa có interface ngoài nào (không
endpoint nghiệp vụ, không CLI public). API REST theo SRS §5.2 sẽ được định nghĩa thành
contracts ở từng feature FR1–FR7; schema auth route `/api/auth/[...all]` do Better-Auth
quản lý theo chuẩn thư viện (xem research.md D3).

### Source Code (repository root)

```text
src/                     # Next.js project root (full-stack, một project duy nhất)
├── app/                 # App Router
│   ├── layout.tsx       # layout gốc, metadata tiếng Việt
│   ├── page.tsx         # trang chủ tiếng Việt
│   ├── globals.css      # Tailwind v4 CSS-first (@import "tailwindcss", @theme)
│   └── api/auth/[...all]/route.ts  # route handler Better-Auth (chuẩn thư viện)
├── components/ui/       # component shadcn/ui (do CLI sinh)
├── lib/                 # prisma.ts (singleton), auth.ts (server), auth-client.ts, utils.ts
├── services/            # tầng nghiệp vụ (dùng từ feature FR1+ — NFR6 tách tầng)
├── prisma/              # schema.prisma + seed.ts
├── generated/prisma/    # Prisma client auto-gen (gitignored)
├── public/              # tài nguyên tĩnh
├── prisma.config.ts     # Prisma v6 config (resilient — generate không cần DB)
├── .env.example         # DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_ANON_KEY, BETTER_AUTH_SECRET
├── .nvmrc               # 24 (Node.js 24 LTS)
├── AGENTS.md + CLAUDE.md# hướng dẫn coding agent (chuẩn create-next-app v16)
└── package.json / next.config.ts / tsconfig.json / eslint.config.mjs / components.json

Import alias: `@/*` → mọi thư mục trong src/ (vd `@/lib/prisma`)
```

**Structure Decision**: `src/` là Next.js project root DUY NHẤT (full-stack một
project — quyết định cuối của chủ dự án 28/09/2026, sau khi thử tách frontend/
backend/ thì đơn giản hoá lại). Backend concerns (Prisma, auth, services) là một
phần của cùng project; tầng `services/` + `lib/` giữ NFR6 (tách tầng route/service/
model). pnpm v12, một package.json duy nhất, env gộp về `src/.env.local`.
chống lấn sân để giữ NFR6 (tách tầng route/service/model) ngay từ đầu.

## Complexity Tracking

> Không có vi phạm Constitution cần biện minh — bảng trống.

## Post-Design Constitution Re-check (sau Phase 1)

- I–V giữ nguyên kết quả ✅ PASS. Thiết kế Phase 1 không phát sinh dependency mới ngoài
  danh sách stack, không thêm tính năng nghiệp vụ, không đưa secret vào file nào nằm
  trong git. Chi tiết quyết định phiên bản/best practice xem [research.md](./research.md);
  schema chi tiết xem [data-model.md](./data-model.md); đường xác thực từng bước xem
  [quickstart.md](./quickstart.md).
