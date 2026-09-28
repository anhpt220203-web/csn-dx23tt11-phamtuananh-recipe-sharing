# AGENTS.md — Hướng dẫn cho AI agent

## Repo là gì

Đồ án học phần **Thực tập đồ án cơ sở ngành (220265, 3 tín chỉ)** — Trường Đại học Trà Vinh.
Đề tài: **Website Quản lý và Chia sẻ Công thức Nấu Ăn**. Sinh viên Phạm Tuấn Anh (DX23TT11), GVHD ThS. Trầm Hoàng Nam.

**Tech stack**: Next.js 16 (App Router) + TypeScript, Prisma v6 + PostgreSQL (Supabase), Tailwind CSS v4 + shadcn/ui, Better-Auth, deploy Vercel. Xem `.specify/memory/constitution.md` v1.1.0 cho nguyên tắc ràng buộc.

## Thư mục

| Đường dẫn | Vai trò |
|---|---|
| `src/` | **Next.js project root** (full-stack): `app/` (pages + API routes), `components/` (shadcn/ui), `lib/` (prisma, auth, utils), `services/` (business logic), `prisma/` (schema + seed), `generated/` (gitignored) |
| `src/AGENTS.md` | Hướng dẫn coding agent cho Next.js (tạo bởi create-next-app; khối `nextjs-agent-rules` được `next dev` tự cập nhật) — **đọc trước khi sửa code Next.js** |
| `specs/` | Spec Kit artifacts: spec/plan/research/data-model/quickstart/tasks |
| `progress-report/` | Báo cáo tiến độ hằng tuần — tiêu chí chấm điểm |
| `thesis/{doc,pdf,abs,html,refs}/` | Sản phẩm báo cáo (Word, PDF, PPT + video thuyết trình) |
| `soft/`, `docker/` | Placeholder rỗng |
| `.specify/`, `.zcode/skills/speckit-*` | GitHub Spec Kit — constitution v1.1.0 |

## Ràng buộc học phần (quan trọng hơn convention kỹ thuật)

- Deadline: nộp báo cáo + slide + link video **trước 23h55 thứ Hai 19/10/2026**; bản cứng in 17/01/2027.
- Điểm tiến độ tính theo **lịch sử commit**: commit code ≥ 1 lần/tuần + upload báo cáo tuần vào `progress-report/` + cập nhật `README.md`. Không commit = coi như không hoàn thành dù đã nộp file.
- Chức năng đóng băng theo spec: đúng FR1–FR7; dữ liệu seed ≥ 30 công thức thật (có ảnh), 7 danh mục, ≥ 5 tài khoản demo.
- UI tiếng Việt hoàn toàn, mobile-first hiển thị tốt từ 375px; mật khẩu hash; mọi API ghi kiểm tra quyền ở phía server (NFR2).

## Lệnh

- Trình quản lý gói: **pnpm** (pin `packageManager: pnpm@12` trong `src/package.json`)
- Tất cả lệnh chạy từ **`src/`**: `pnpm dev` (localhost:3000), `pnpm build`, `pnpm lint`, `pnpm exec prisma migrate dev`, `pnpm exec prisma db seed`, `pnpm exec prisma studio`.
- Env: `src/.env.local` (`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BETTER_AUTH_SECRET`).
- Runtime: **Node.js 24 LTS** (pin trong `src/package.json` engines + `src/.nvmrc`).

## Gotchas

- Môi trường **Windows + Git Bash**; đường dẫn workspace dạng `P:\csn-dx23tt11-phamtuananh-recipe-sharing`, nhớ quote khi dùng trong shell.
- Tài liệu chính thức phải nằm ở `thesis/` hoặc `progress-report/`; không commit tài liệu nháp.
- Spec Kit workflow: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` → `/speckit-analyze`
