# AGENTS.md — Hướng dẫn cho AI agent

## Repo là gì

Đồ án học phần **Thực tập đồ án chuyên ngành (220266, 3 tín chỉ)** — Trường Đại học Trà Vinh.
Đề tài: **Website Quản lý và Chia sẻ Công thức Nấu Ăn**. Sinh viên Phạm Tuấn Anh (DX23TT11), GVHD ThS. Trầm Hoàng Nam.

**Tech stack**: Next.js 16 (App Router) + TypeScript, Supabase (Postgres + Auth + RLS — Supabase-native, không dùng Prisma/Better-Auth), Tailwind CSS v4 + shadcn/ui (`@kit/ui`), monorepo MakerKit (pnpm workspace + Turbo), deploy Vercel. Xem `.specify/memory/constitution.md` v1.1.0 cho nguyên tắc ràng buộc. **Lưu ý:** `specs/` và `thesis/` vẫn mô tả stack cũ (Prisma/Better-Auth) — cần cập nhật ở giai đoạn hoàn thiện báo cáo, không tự sửa tài liệu luận văn.

## Thư mục

| Đường dẫn | Vai trò |
|---|---|
| `src/` | **Monorepo root (MakerKit, pnpm + Turbo)**: `apps/web/` (Next.js app "Công Thức Món Ngon"), `packages/` (`@kit/*`), `tooling/` (config dùng chung) |
| `src/apps/web/` | App chính: `app/(marketing)/` (trang công khai: `/`, `/danh-muc`, `/cong-thuc/[slug]`, `/tim-kiem`, `/faq`), `app/admin/` (quản trị), `app/auth/` (Supabase Auth), `components/recipes/`, `lib/recipes/` (queries + server actions), `public/images/recipes/` (33 ảnh mẫu) |
| `supabase/` (repo root) | **Cấu hình Supabase CLI chuẩn duy nhất** (`config.toml`, project_id `recipe-sharing`): `migrations/` (17 migrations), `seed/` (01_demo.sql + 02_demo_users.sql — nạp thủ công sau `db reset`). KHÔNG tạo lại `src/apps/web/supabase/` (bản stale đã xoá 17/10/2026 — supabase CLI tự đi lên tìm config ở repo root) |
| `src/apps/web/AGENTS.md` | Khối `nextjs-agent-rules` cho Next.js (tạo bởi `next dev` — đọc trước khi sửa code Next.js) |
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

- Trình quản lý gói: **pnpm** (monorepo; xem `packageManager` trong `src/package.json`)
- Tất cả lệnh chạy từ **`src/`**: `pnpm dev` (localhost:3000), `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format`.
- Supabase (CLI): `pnpm --filter web supabase:start` (DB local, cần Docker), `pnpm --filter web supabase:reset` (migrate — tự tìm `supabase/config.toml` ở repo root), `pnpm --filter web supabase:typegen` (sinh types). Sau `db reset` phải nạp seed thủ công: `docker cp supabase/seed/02_demo_users.sql supabase_db_recipe-sharing:/tmp/ && MSYS_NO_PATHCONV=1 docker exec supabase_db_recipe-sharing psql -U postgres -d postgres -f /tmp/02_demo_users.sql`. Trỏ cloud: `supabase link --project-ref <ref>` rồi `supabase db push`.
- Env: `src/apps/web/.env.local` (copy từ `src/apps/web/.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Runtime: **Node.js 24 LTS**.
- Quy trình Git: luôn tạo nhánh mới từ `dev` để cook, PR về `dev`; chỉ merge `dev` → `main` khi user yêu cầu demo.

## Gotchas

- Môi trường **Windows + Git Bash**; đường dẫn workspace dạng `P:\csn-dx23tt11-phamtuananh-recipe-sharing`, nhớ quote khi dùng trong shell.
- Tài liệu chính thức phải nằm ở `thesis/` hoặc `progress-report/`; không commit tài liệu nháp.
- Spec Kit workflow: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` → `/speckit-analyze`

## Tài liệu tham chiếu khi cook

- **Handbook MakerKit Next.js + Supabase (Lite)** — tóm tắt tiếng Việt toàn bộ docs (15 section, 48 trang): `~/workspace/your_files/handbook-makerkit-next-supabase-lite.md`
- Tra cứu pattern khi cook: kiến trúc phân lớp (onion), tổ chức `lib/<entity>` + `components/<entity>` + `app/(app)/<entity>`, Server Actions + CSRF token, Supabase Auth/OAuth, Stripe payments/webhooks, RLS, production checklist...
- **Lưu ý stack khác biệt**: docs gốc là bản legacy; đồ án dùng **Supabase Auth trực tiếp** (không qua Better-Auth) và **truy vấn Supabase thay Prisma** — chỉ tham khảo pattern/triết lý tổ chức, không copy nguyên cấu hình auth.
