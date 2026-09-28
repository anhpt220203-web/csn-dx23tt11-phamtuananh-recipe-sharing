# Tasks: Khởi tạo dự án Next.js 16 + AI Skills

**Input**: Design documents from `/specs/001-setup-nextjs16-skills/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (user stories),
[research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: Không có automated tests ở feature này — kiểm chứng thủ công theo
[quickstart.md](./quickstart.md) (map trực tiếp vào SC-001…SC-006). Test tasks
được đánh số T0XX và đánh dấu `[VALIDATE]` thay vì `[TEST]`.

**Organization**: Theo user story — mỗi story chạy独立, kiểm tra独立.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Chạy song song được (khác file, không phụ thuộc task chưa xong)
- **[Story]**: Thuộc user story nào (US1, US2, US3) — chỉ có ở các task trong phase story
- File path ghi rõ trong mô tả

---

## Phase 1: Setup (Khởi tạo hạ tầng chung)

**Purpose**: Scaffold Next.js 16, xoá placeholder, chuẩn bị cấu trúc `src/` thống nhất

- [X] T001 Scaffold Next.js 16 qua `npx create-next-app@latest` (App Router, TypeScript, Tailwind CSS v4, `--src-dir`, `--turbopack`) vào thư mục tạm rồi sao chép vào repo. **Kiến trúc cuối (chỉ đạo chủ dự án): Next.js project root = `src/`** — mọi file scaffold (package.json, next.config.ts, app/...) nằm trong `src/`.
- [X] T002 Trong `src/package.json`, thêm `"engines": { "node": ">=24" }` và tạo `src/.nvmrc` nội dung `24` — pin Node.js 24 LTS (Clarifications 2026-09-28).
- [X] T003 Xoá thư mục placeholder `scr/` bằng `git rm -r scr/`; `.gitignore` đã bổ sung đầy đủ patterns Node.js (node_modules/, .next/, .env*, .vercel...).
- [X] T004 Tạo `src/.env.example` với các biến: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BETTER_AUTH_SECRET` — không chứa giá trị thật.
- [X] T005 Chạy `pnpm lint` xác nhận ESLint hoạt động; thêm `tmp/**` vào eslint ignores (scratch space không lint).

**Checkpoint**: Scaffold xong, `src/` là Next.js project root thống nhất; chưa có business logic hay data.

---

## Phase 2: Foundational (Hạ tầng dữ liệu & xác thực — blockers cho mọi story)

**Purpose**: Prisma schema + Better-Auth + prisma client singleton; migration đầu tiên chạy thành công từ DB trống. **Không story nào bắt đầu trước khi phase này hoàn tất.**

- [X] T006 Cài Prisma v6 (`pnpm add prisma @prisma/client`); tạo `src/prisma.config.ts` (resilient — generate không cần DB); schema tại `src/prisma/schema.prisma` cấu hình `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")`, client output `../generated/prisma`.
- [X] T007 Cài Better-Auth (`pnpm add better-auth`); tạo `src/lib/auth.ts` cấu hình server: `betterAuth({ database: prismaAdapter(prisma, { provider: "postgresql" }), emailAndPassword: { enabled: true }, secret: process.env.BETTER_AUTH_SECRET });`; tạo `src/lib/auth-client.ts` cho client-side auth.
- [X] T008 Thêm model User, Session, Account, Verification vào `src/prisma/schema.prisma` theo chuẩn Better-Auth 1.4.x (thủ công vì CLI gặp lỗi generate khi chưa có client).
- [X] T009 Thêm 2 model nghiệp vụ tối thiểu vào `src/prisma/schema.prisma` (data-model.md §2):
  ```
  model Category { id Int @id @default(autoincrement()); name String; slug String @unique; description String?; recipes Recipe[] }
  model Recipe  { id Int @id @default(autoincrement()); categoryId Int; category Category @relation(fields: [categoryId], references: [id]); title String; slug String @unique; description String?; createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
  ```
- [X] T010 Tạo route handler Better-Auth tại `src/app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)` (chuẩn Better-Auth 1.4+), import `@/lib/auth`.
- [X] T011 Tạo `src/lib/prisma.ts` — singleton PrismaClient (globalThis pattern), import từ `./generated/prisma/client` (đường dẫn tương đối trong cùng project).
- [ ] T012 Chạy `pnpm exec prisma migrate dev --name init` (từ `src/`) — **CHỜ** `.env.local` đã điền `DATABASE_URL` + `DIRECT_URL` hợp lệ từ Supabase.

**Checkpoint**: Foundation xong — Better-Auth + schema Prisma sẵn sàng; story nào cũng có thể bắt đầu.

---

## Phase 3: User Story 1 — Chạy được dự án trên máy trống (Priority: P1) 🎯 MVP

**Goal**: Clone → install → seed → `pnpm dev` → trang chủ tiếng Việt hiển thị tại localhost:3000, không lỗi. Đây là MVP.

**Independent Test**: Chạy toàn bộ bước trong [quickstart.md §1](./quickstart.md) từ máy trống (≤ 15 phút chỉ theo README).

### Implementation cho User Story 1

- [X] T013 [US1] Tạo `src/app/layout.tsx`: root layout tiếng Việt (lang="vi"), metadata tiếng Việt (title: "Website Quản lý & Chia sẻ Công thức Nấu Ăn", description tiếng Việt); import `globals.css`; bọc children.
- [X] T014 [US1] Tạo `src/app/globals.css` theo Tailwind v4 CSS-first: `@import "tailwindcss";` + `@theme { ... }` (shadcn init đã bổ sung token design).
- [X] T015 [US1] Chạy `npx shadcn@latest init` → xác nhận `src/components/ui/button.tsx` + `src/lib/utils.ts` được tạo; `components.json` ở `src/` (path `tailwind.css` = `app/globals.css`).
- [X] T016 [US1] Tạo `src/app/page.tsx` — trang chủ tiếng Việt đơn giản: heading "Website Quản lý & Chia sẻ Công thức Nấu Ăn" + mô tả.
- [X] T017 [US1] Viết README.md đầy đủ (tiếng Việt, command gốc): Node 24 LTS, cài đặt, `.env`, migrate, seed, dev server.
- [X] T018 [US1] **[VALIDATE]** `pnpm build` thành công, `pnpm dev` chạy localhost:3000, trang chủ tiếng Việt hiển thị; SC-001 + SC-002 pass.

**Checkpoint**: MVP — dự án chạy được, trang chủ tiếng Việt, sẵn sàng demo. Có thể commit và báo cáo tuần.

---

## Phase 4: User Story 2 — Dữ liệu seed nạp và đọc được (Priority: P2)

**Goal**: Seed pipeline hoạt động; trang chủ hiển thị nội dung từ Category + Recipe thay vì trang trống; seed lặp lại không trùng lặp.

**Independent Test**: Chạy [quickstart.md §2](./quickstart.md): seed 2 lần liên tiếp → kết quả nhất quán; xem trang chủ hiện tên category + recipe.

### Implementation cho User Story 2

- [ ] T019 [US2] Tạo `src/prisma/seed.ts`: upsert ≥ 1 Category (slug `"mon-viet-nam"`, tên "Món ăn Việt Nam") + ≥ 1 Recipe thuộc category đó (slug `"com-chien"`, tên "Cơm chiên dương châu") theo unique key `slug`, idempotent; seed config đã khai báo trong `src/package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`.
- [ ] T020 [US2] Chạy `pnpm exec prisma db seed` lần đầu (từ `src/`) → xác nhận Category + Recipe xuất hiện trong DB (qua Prisma Studio hoặc Supabase Table Editor).
- [ ] T021 [US2] Cập nhật `src/app/page.tsx`: đọc Category + Recipe từ DB và hiển thị tên category + tên recipe trên trang chủ tiếng Việt (nếu có ≥ 1 bản ghi), thay vì chỉ hiển thị heading/static text.
- [ ] T022 [US2] **[VALIDATE]** Chạy quickstart §2: seed lần 2 không nhân đôi; xem trang chủ hiển thị đúng nội dung seed; xóa dữ liệu → hiện trạng thái trống tiếng Việt; xác nhận SC-003.

**Checkpoint**: Đường đi dữ liệu hoàn chỉnh: seed → DB → Prisma → Trang chủ tiếng Việt.

---

## Phase 5: User Story 3 — Chuỗi công cụ phát triển sẵn sàng (Priority: P3)

**Goal**: AI skills Speckit chạy đúng trên codebase mới; bản preview Vercel dùng demo; git sạch secret.

**Independent Test**: Chạy [quickstart.md §3–5](./quickstart.md).

### Implementation cho User Story 3

- [ ] T023 [US3] Kiểm tra `.specify/feature.json` trỏ đúng `specs/001-setup-nextjs16-skills` (đã có từ lệnh `/speckit-specify` trước đó); chạy thử `/speckit-specify` với feature mới nhỏ → xác nhận `specs/00X-...` được sinh đúng chỗ, constitution v1.1.0 được nạp (Next.js 16, FR1–FR7 scope freeze).
- [ ] T024 [US3] Push branch `001-setup-nextjs16-skills` lên remote; import repo vào Vercel; cấu hình biến môi trường; chạy deploy preview; mở URL xác nhận trang chủ hiển thị tiếng Việt + dữ liệu seed → SC-006.
- [ ] T025 [US3] **[VALIDATE]** Chạy quickstart §3: `git status` — `.env.local` không hiện; `git log --all -p` — không có secret; xác nhận SC-004.
- [ ] T026 [US3] **[VALIDATE]** Xác nhận SC-005: feature kế tiếp trong speckit sinh artifact đúng nơi theo `.specify/feature.json` (kết quả thực tế từ T023).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Đồng bộ tài liệu, chuẩn bị cho feature kế tiếp

- [ ] T027 [P] Cập nhật ghi chú stack trong `tmp/spec-recipe-website.md` §6.1: Next.js 15 → Next.js 16 (đồng bộ với constitution v1.1.0; tmp/ là scratch space git-ignored, không cần commit nội dung này).
- [ ] T028 Cập nhật `README.md` cuối cùng: trạng thái hiện tại, hướng dẫn chạy, link preview Vercel, ảnh chụp màn hình trang chủ (điều kiện chấm tiến độ hằng tuần).
- [ ] T029 Chạy toàn bộ quickstart.md end-to-end từ bước 1→5 xác nhận SC-001…SC-006 đều pass.
- [ ] T030 Commit artifacts feature 001 (plan/research/data-model/quickstart/tasks) theo nhóm logic; merge hoặc giữ branch tùy workflow; đảm bảo ≥ 1 commit tuần hiện tại (điều kiện chấm tiến độ).

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          ──→ Phase 2 (Foundational) ──→ Phase 3 (US1 MVP) ──→ Phase 4 (US2)
                                                               ↑                      │
                                                               └── Phase 5 (US3) ←────┘ (sau US1 hoặc song song US2)
                                                                                         ↓
                                                                                   Phase 6 (Polish)
```

### User Story Dependencies

- **US1 (P1)**: phụ thuộc Phase 2; KHÔNG phụ thuộc story khác → có thể bắt đầu ngay sau Foundational.
- **US2 (P2)**: phụ thuộc Phase 2 + US1 hoàn thành (trang chủ page.tsx đã có, US2 cập nhật nội dung hiển thị thay vì tạo mới); independence_cho phép chạy parallel nếu tách file page.tsx riêng.
- **US3 (P3)**: phụ thuộc Phase 2 + US1 (codebase chạy được mới deploy/speckit-test); có thể chạy song song với US2 (không đụng file chung).

### Parallel Opportunities

```bash
# Phase 1: các task [P] song song (nếu có nhiều agent):
Task: T003 — Xoá scr/, kiểm tra .gitignore
Task: T004 — Tạo .env.example
Task: T005 — Kiểm tra ESLint

# Phase 2: song song sau khi cài xong deps:
Task: T009 — Thêm Category + Recipe schema
Task: T010 — Tạo auth route handler

# Phase 3→4+5: US2 và US3 song song được
Developer A: T019–T022 (US2 — seed + trang chủ hiển thị)
Developer B: T023–T026 (US3 — speckit test + Vercel deploy)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) — ĐỦ ĐỂ BÁO CÁO TUẦN

1. Hoàn thành Phase 1: Setup
2. Hoàn thành Phase 2: Foundational (PRISMA + BETTER-AUTH)
3. Hoàn thành Phase 3: US1 (trang chủ tiếng Việt chạy tại localhost)
4. **STOP & VALIDATE**: Chạy quickstart §1; commit ≥ 1 lần trong tuần
5. Upload báo cáo tuần vào `progress-report/`; cập nhật `README.md`

### Incremental Delivery

1. Setup + Foundational → Foundation xong
2. US1 → Chạy localhost tiếng Việt → **DEMO CHO GVHD** → Deploy preview
3. US2 → Seed pipeline hoạt động → trang chủ có dữ liệu → **DEMO NÂNG CAO**
4. US3 → Speckit + Vercel clean → Chuẩn bị tooling cho FR1–FR7
5. Mỗi story thêm giá trị mà không phá story trước.

---

## Notes

- Không có automated tests ở feature này — Spec Kit manual validation theo quickstart.md
- [VALIDATE] = task kiểm chứng end-to-end, chạy thủ công, ghi lại kết quả
- Commit sau mỗi phase hoàn thành; ghi rõ message theo convention: `feat(scope): ...` hoặc `chore(scope): ...`
- Sau feature này, feature kế tiếp (FR1–FR7) sẽ dùng `/speckit-specify` trên branch mới
- Constitution v1.1.0 là ràng buộc xuyên suốt; mọi task PHẢI tuân thủ 5 nguyên tắc
