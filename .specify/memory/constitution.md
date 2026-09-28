<!--
SYNC IMPACT REPORT
Version change: (template chưa điền — chưa từng ban hành) → 1.0.0
Modified principles: không có (soạn thảo lần đầu)
Added sections:
  - Nguyên tắc I. Đúng Spec — Phạm vi đóng băng
  - Nguyên tắc II. Bảo mật & Xác thực phía Server (NON-NEGOTIABLE)
  - Nguyên tắc III. UI Tiếng Việt, Mobile-First & Hiệu Năng
  - Nguyên tắc IV. Stack & Kiến trúc Thống nhất
  - Nguyên tắc V. Dữ liệu Thật & Kiểm chứng theo Tiêu chí Nghiệm thu
  - Ràng Buộc Học Phần & Sản Phẩm Nộp
  - Quy Trình Phát Triển & Nhịp Nộp Bài
  - Governance
Removed sections: không có
Follow-up TODOs: không còn placeholder nào. Lưu ý đã ghi vào Nguyên tắc IV:
thư mục placeholder `scr/` phải được thống nhất thành `src/` khi scaffold Next.js.
Báo cáo này là tài liệu tạm phục vụ review, xoá trước khi commit constitution.

AMENDMENT 1.1.0 → 1.2.0 (2026-09-28): Nguyên tắc IV — bổ sung layout `src/frontend/`
(Next.js project root) + `src/backend/` (Prisma + Better-Auth) + `src/shared/` theo
chỉ đạo chủ dự án; cập nhật trạng thái `scr/` đã xử lý. Quy Trình — lệnh chuyển sang
pnpm v12, env tách 2 nơi (frontend/.env.local + backend/.env). MINOR bump
(mở rộng đáng kể guidance của Nguyên tắc IV).

AMENDMENT 1.2.0 → 1.3.0 (2026-09-28): Nguyên tắc IV — đơn giản hoá layout: `src/`
là Next.js project root DUY NHẤT (full-stack: app/, components/, lib/, services/,
prisma/ cùng một project, một package.json), bỏ tách frontend/backend/shared;
env gộp về `src/.env.local`. Quy Trình — toàn bộ lệnh chạy từ `src/`. MINOR bump.
-->

# Website Quản lý & Chia sẻ Công thức Nấu Ăn — Constitution

## Core Principles

### I. Đúng Spec — Phạm vi đóng băng

Mọi tính năng phải truy vết được về FR1–FR7 trong đặc tả yêu cầu phần mềm (SRS).
Phạm vi chức năng đã đóng băng như sau:

- FR1 — Hiển thị công thức theo nhóm món ăn (danh mục), cung cấp tên món, hình ảnh,
  nguyên liệu và các bước thực hiện.
- FR2 — Trang chi tiết công thức (nguyên liệu, các bước, ảnh, đánh giá).
- FR3 — Tìm kiếm món ăn theo tên, nguyên liệu hoặc nhóm món.
- FR4 — Tài khoản người dùng (đăng ký, đăng nhập, hồ sơ).
- FR5 — Đánh dấu công thức yêu thích.
- FR6 — Đánh giá món ăn.
- FR7 — Trang quản trị: thêm, sửa, xóa và cập nhật công thức, danh mục và hình ảnh.

Quy tắc bất di bất dịch:

- KHÔNG được thêm tính năng ngoài FR1–FR7 (không chat, không gợi ý AI, không mạng xã hội…).
- Nếu cần thay đổi phạm vi: phải sửa SRS trước, sau đó mới được viết code — không code trước,
  spec sau.
- Mỗi task trong `tasks.md` phải ghi rõ nó thuộc FR nào; task không truy vết được về FR
  thì không đưa vào kế hoạch.

**Rationale**: đồ án bị chấm đúng theo tiêu chí nghiệm thu của SRS; làm lệch phạm vi
là mất điểm và trễ deadline, trong khi thời gian chỉ ~3 tuần code cho 1 người.

### II. Bảo mật & Xác thực phía Server (NON-NEGOTIABLE)

- Mọi API ghi (POST/PUT/PATCH/DELETE) PHẢI kiểm tra phiên đăng nhập và phân quyền ở
  phía server (NFR2). Client-side check chỉ là UX, không bao giờ là lớp bảo vệ.
- Mật khẩu PHẢI được hash (bcrypt/argon2), tuyệt đối không lưu dạng plain.
- Truy vấn dữ liệu PHẢI đi qua Prisma (parameterized) — không nối chuỗi SQL thủ công.
- File upload PHẢI validate kiểu nội dung và giới hạn dung lượng; tên file ảnh PHẢI
  được sinh lại bởi server (tránh trùng và lộ thông tin — NFR4).
- Secret (DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, auth keys…) chỉ nằm trong
  `.env.local`, KHÔNG được commit; `.env*` phải có trong `.gitignore`.

**Rationale**: NFR2 là yêu cầu phi chức năng được chấm trực tiếp; một lỗ hổng bảo mật
cơ bản (mật khẩu plain, API ghi không kiểm tra quyền) là lỗi loại trừ khi nghiệm thu.

### III. UI Tiếng Việt, Mobile-First & Hiệu Năng

- Toàn bộ giao diện người dùng PHẢI là tiếng Việt hoàn toàn — không để sót nhãn,
  thông báo lỗi hay trang trống bằng tiếng Anh (NFR3).
- Mọi màn hình PHẢI hiển thị tốt từ bề rộng 375px trở lên; phát triển theo hướng
  mobile-first (Tailwind breakpoint nhỏ trước).
- Component UI dùng thống nhất shadcn/ui; không trộn lẫn nhiều bộ UI kit.
- Hiệu năng bắt buộc (NFR1): tải trang chi tiết < 2s; tìm kiếm trả kết quả < 1s với
  ~5.000 công thức — PHẢI dùng đúng các chỉ mục đã thiết kế trong SRS §4.2 và
  lazy-load ảnh (NFR4).

**Rationale**: tiếng Việt + mobile 375px là yêu cầu chấm trực tiếp của học phần và
là trải nghiệm của nhóm đối tượng dùng thử; hiệu năng là tiêu chí nghiệm thu số hóa
được, không phải "cải thiện sau".

### IV. Stack & Kiến trúc Thống nhất

- Stack bắt buộc: Next.js 16 (App Router) + TypeScript, Prisma +
  PostgreSQL (Supabase), Tailwind CSS + shadcn/ui, Better-Auth/Auth.js, deploy Vercel.
  (Sửa đổi 2026-09-28: chủ dự án nâng pin từ Next.js 15 nêu trong SRS §6.1 lên
  Next.js 16; SRS và README cập nhật theo ở bước implement.)
  PostgreSQL (Supabase), Tailwind CSS + shadcn/ui, Better-Auth/Auth.js, deploy Vercel.
- Code PHẢI tách tầng route/service/model rõ ràng (NFR6); không viết toàn bộ logic
  trong route handler.
- Mã nguồn là MỘT Next.js project duy nhất tại `src/` (chỉ đạo cuối chủ dự án
  28/09/2026): `app/` (pages + API routes), `components/` (shadcn/ui), `lib/`
  (prisma singleton, auth server/client, utils), `services/` (business logic),
  `prisma/` (schema + seed), `generated/` (gitignored). Placeholder `scr/` đã xoá.
- Code PHẢI tách tầng route/service/model rõ ràng (NFR6); không viết toàn bộ logic
  trong route handler; frontend gọi backend qua tầng services/lib của backend,
  không import trực tiếp generated Prisma client vào component UI.
- KHÔNG thêm dependency runtime mới khi thư viện chuẩn của stack đã giải quyết được;
  mọi dependency mới phải ghi lý do vào `plan.md` hoặc `progress-report/` tuần đó.

**Rationale**: stack khuyến nghị trong SRS là full-stack một framework — phù hợp 1
người / 3 tuần; thêm công nghệ ngoài stack làm tăng bề mặt học và rủi ro trễ deadline.

### V. Dữ liệu Thật & Kiểm chứng theo Tiêu chí Nghiệm thu

- Dữ liệu seed PHẢI đạt tối thiểu (NFR5): ≥ 30 công thức thật (có ảnh thật của món),
  7 danh mục, ≥ 5 tài khoản dùng thử để demo.
- Một tính năng chỉ được coi là XONG khi chạy được theo kịch bản và đạt "Tiêu chí
  nghiệm thu tổng thể" (SRS §7); chưa qua nghiệm thu thì chưa được ghi hoàn thành
  trong báo cáo tuần.
- Seed script PHẢI chạy được bằng `npx prisma db seed` trên máy trống, không phụ
  thuộc dữ liệu cục bộ trên máy dev.

**Rationale**: demo trước GVHD là bằng chứng chính của đồ án; dữ liệu giả/ảnh rỗng
làm sập demo, và "tự đánh giá đã xong" không trùng tiêu chí nghiệm thu là rủi ro
tiến độ lớn nhất của project một người.

## Ràng Buộc Học Phần & Sản Phẩm Nộp

- **Deadline không được trễ**: nộp báo cáo + slide + link video trước **23h55 thứ
  Hai 19/10/2026**; bản cứng in nộp **17/01/2027**.
- **Format văn bản nộp (TVU BM5)**: Times New Roman 13pt, giãn dòng 1.5, lề trái
  3cm / lề phải–trên–dưới 2cm, số trang góc phải dưới, nội dung 30–50 trang.
- **Phân loại tài liệu**: tài liệu chính thức PHẢI nằm ở `thesis/` (báo cáo, slide, PDF) hoặc
  `progress-report/` (báo cáo tuần). Không commit tài liệu nháp vào vùng git-ignored.
- Video thuyết trình và slide PHẢI được đặt trong `thesis/` và được nhắc tới trong
  `README.md` để người chấm tìm thấy.

## Quy Trình Phát Triển & Nhịp Nộp Bài

**Việc lặp hằng tuần (điều kiện chấm tiến độ — bỏ một cái là mất điểm tuần đó):**

1. Commit code ít nhất 1 lần/tuần — không commit = coi như không hoàn thành dù đã
   nộp file.
2. Upload báo cáo tiến độ tuần vào `progress-report/`.
3. Cập nhật `README.md` (trạng thái, cách chạy, ảnh chụp màn hình mới nhất).

**Quy trình Spec Kit cho từng tính năng:**

- Trình tự bắt buộc: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` →
  `/speckit-tasks` → `/speckit-implement` → `/speckit-analyze` (kiểm tra chéo
  nhất quán trước khi code).
- Source tham chiếu duy nhất cho phạm vi là đặc tả yêu cầu phần mềm (SRS); mọi
  artifact sinh ra (spec/plan/tasks) không được mâu thuẫn với SRS.

**Lệnh chuẩn sau khi scaffold (trình quản lý gói: pnpm v12, chạy từ `src/`):**

- `pnpm dev` — localhost:3000; `pnpm build`; `pnpm lint`.
- `pnpm exec prisma migrate dev` — tạo/áp dụng migration.
- `pnpm exec prisma db seed` — nạp dữ liệu mẫu đạt NFR5.
- Cấu hình môi trường trong `src/.env.local`, không commit: `DATABASE_URL`,
  `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BETTER_AUTH_SECRET`.

## Governance

- Constitution này VƯỢT ưu tiên mọi tài liệu quy trình khác (README, AGENTS.md,
  plan/tasks) khi có mâu thuẫn về nguyên tắc. AGENTS.md giữ vai trò hướng dẫn vận
  hành hằng ngày; nếu nó mâu thuẫn constitution thì sửa AGENTS.md theo constitution.
- **Sửa đổi**: mọi sửa đổi phải ghi lý do trong Sync Impact Report, tăng version
  theo semver — MAJOR khi bỏ/định nghĩa lại nguyên tắc (gây phá vỡ tính tương thích
  của governance), MINOR khi thêm nguyên tắc/mục hoặc mở rộng đáng kể, PATCH khi
  chỉnh lời văn/sai chính tả — và cập nhật ngày Last Amended.
- **Kiểm tra tuân thủ**: mỗi báo cáo tuần đối chiếu (a) commit lịch có ≥ 1 lần,
  (b) tính năng làm trong tuần có truy vết về FR1–FR7, (c) nguyên tắc II (bảo mật)
  không bị vi phạm trong code mới. Vi phạm nguyên tắc NON-NEGOTIABLE phải được sửa
  ngay trong tuần phát hiện, trước khi làm tính năng mới.
- Nguyên tắc I–V là điều kiện cần khi nghiệm thu; muốn miễn trừ nguyên tắc nào cho
  một task cụ thể phải nêu rõ lý do trong báo cáo tuần tương ứng.

**Version**: 1.3.0 | **Ratified**: 2026-09-28 | **Last Amended**: 2026-09-28
