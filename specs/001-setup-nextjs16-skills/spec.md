# Feature Specification: Khởi tạo dự án Next.js 16 + AI Skills

**Feature Branch**: `001-setup-nextjs16-skills`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "cài Nextjs 16 + Skills"

## Clarifications

### Session 2026-09-28

- Q: FR-005 ghi "Better-Auth/Auth.js" là either/or — khung xác thực nào được chọn
  cho scaffold? → A: **Better-Auth**.
- Q: Scaffold có tạo sẵn schema nghiệp vụ tối thiểu để seed kiểm chứng đường dữ
  liệu thật không (mâu thuẫn giữa FR-007 và Key Entities)? → A: **Có — Category +
  Recipe tối thiểu theo ERD SRS §4**, chỉ trường cốt lõi.
- Q: README pin phiên bản Node.js nào để kiểm chứng tiêu chí "chạy được trên máy
  trống"? → A: **Node.js 24 LTS**.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chạy được dự án trên máy trống (Priority: P1)

Một người phát triển clone repo về máy tính trống (chưa từng mở dự án này), cài đặt
theo đúng từng bước trong README, khởi chạy máy chủ phát triển và mở trang web tại
localhost:3000 — trang chủ hiển thị nội dung tiếng Việt, không có thông báo lỗi.

**Why this priority**: Đây là nền tảng của mọi tính năng nghiệp vụ FR1–FR7 và của
nghĩa vụ commit code hằng tuần (điều kiện chấm tiến độ). Không chạy được dự án thì
không có gì để demo với GVHD.

**Independent Test**: Có thể kiểm tra độc lập bằng cách clone repo vào một thư mục
trống, làm theo README, và xác nhận trang chủ mở được tại localhost:3000. Giá trị:
dự án bước vào trạng thái "chạy được".

**Acceptance Scenarios**:

1. **Given** repo mới clone về máy trống đã cài runtime theo README, **When** người
   dùng chạy lần lượt các bước cài đặt → cấu hình → khởi động trong README, **Then**
   trang chủ mở tại localhost:3000 và hiển thị trang mặc định bằng tiếng Việt.
2. **Given** dự án đang chạy, **When** người dùng sửa một nội dung hiển thị trên
   trang chủ, **Then** thay đổi hiển thị ngay khi tải lại trang (chế độ phát triển
   cập nhật tức thì).
3. **Given** một máy hoàn toàn chưa có dữ liệu dự án, **When** chạy toàn bộ các lệnh
   trong README theo đúng thứ tự, **Then** không bước nào báo lỗi và không cần thao
   tác nào ngoài README.

---

### User Story 2 - Dữ liệu mẫu nạp và đọc được (Priority: P2)

Người phát triển cấu hình biến môi trường kết nối cơ sở dữ liệu, tạo cấu trúc dữ
liệu và nạp dữ liệu mẫu khởi điểm; ứng dụng đọc và hiển thị được dữ liệu đó trên
trang chủ thay vì trang trống.

**Why this priority**: Mọi tính năng nghiệp vụ (danh mục công thức, tài khoản, đánh
giá) đều cần lớp dữ liệu hoạt động; cơ chế nạp dữ liệu mẫu là tiền đề trực tiếp của
yêu cầu NFR5 (≥ 30 công thức thật) ở feature kế tiếp.

**Independent Test**: Có thể kiểm tra độc lập bằng cách cấu hình biến môi trường,
chạy migrate + seed, rồi xác nhận trang chủ hiển thị nội dung sinh ra từ dữ liệu mẫu.

**Acceptance Scenarios**:

1. **Given** biến môi trường đã cấu hình đúng, **When** người dùng chạy lệnh tạo
   cấu trúc dữ liệu, **Then** cấu trúc được tạo thành công mà không có lỗi.
2. **Given** cấu trúc dữ liệu đã tạo, **When** người dùng chạy lệnh nạp dữ liệu mẫu,
   **Then** dữ liệu khởi điểm (ít nhất 1 danh mục và 1 công thức mẫu) xuất hiện.
3. **Given** dữ liệu mẫu đã nạp, **When** mở trang chủ, **Then** trang hiển thị nội
   dung từ dữ liệu mẫu (không còn trang trống/lỗi kết nối).
4. **Given** dữ liệu mẫu đã nạp từ lần chạy trước, **When** chạy lại lệnh nạp dữ liệu
   mẫu, **Then** không sinh ra bản ghi trùng lặp.

---

### User Story 3 - Chuỗi công cụ phát triển sẵn sàng (Priority: P3)

Người phát triển dùng được toàn bộ "hàng rào công cụ" của dự án: quy trình AI skills
Spec Kit (speckit) hoạt động trên codebase mới — feature kế tiếp sinh được tài liệu
spec/plan/tasks vào đúng thư mục feature — và bản preview công khai truy cập được
qua URL để demo.

**Why this priority**: Đảm bảo các feature FR1–FR7 sau đó được phát triển đúng quy
trình đã cam kết trong constitution và luôn có bản chạy công khai để demo/báo cáo
tuần. Không chặn việc viết code nghiệp vụ ngay nên đứng sau P1/P2.

**Independent Test**: Có thể kiểm tra độc lập bằng cách chạy một vòng specify trên
codebase mới (xác nhận artifact ghi đúng nơi quy định) và mở URL preview công khai.

**Acceptance Scenarios**:

1. **Given** dự án đã scaffold xong, **When** người phát triển tạo một feature mới
   bằng lệnh speckit-specify, **Then** thư mục feature và tệp spec được sinh đúng
   vị trí mà `.specify/feature.json` đang trỏ tới, không cần sửa cấu hình thủ công.
2. **Given** mã nguồn đã được đưa lên repository từ xa, **When** triển khai bản
   preview, **Then** một URL công khai truy cập được và hiển thị đúng trang chủ.
3. **Given** constitution tại `.specify/memory/constitution.md`, **When** AI skills
   chạy bất kỳ lệnh speckit nào, **Then** các nguyên tắc (phạm vi FR1–FR7, bảo mật,
   tiếng Việt) được nạp làm ràng buộc.

---

### Edge Cases

- Biến môi trường thiếu hoặc sai giá trị → các lệnh khởi động/tạo cấu trúc dữ liệu
  phải dừng với thông báo lỗi rõ ràng chỉ đúng tên biến còn thiếu, không lỗi mù mờ.
- Cổng 3000 đang bị tiến trình khác chiếm → hệ thống báo rõ tình trạng và hướng dẫn
  cách chạy trên cổng khác.
- Máy chưa cài đúng phiên bản runtime theo README (Node.js 24 LTS) → quá trình
  kiểm tra phải thông báo phiên bản yêu cầu thay vì lỗi khó hiểu giữa chừng.
- Lệnh nạp dữ liệu mẫu chạy nhiều lần liên tiếp → phải cho kết quả nhất quán, không
  nhân đôi bản ghi (chạy được lặp lại).
- Truy cập trang chủ khi chưa có dữ liệu mẫu → hiển thị trạng thái trống thân thiện
  bằng tiếng Việt, không màn hình lỗi trắng.
- Secrets bị vô tình ghi vào tệp theo dõi git → `.gitignore` phải chặn sẵn mọi biến
  thể tệp môi trường (`.env*`) trước khi commit đầu tiên của feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI được khởi tạo là ứng dụng web full-stack trên nền
  Next.js 16 (App Router) với TypeScript — yêu cầu bắt buộc của chủ dự án, thay thế
  Next.js 15 nêu trong SRS §6.1 (constitution đã cập nhật v1.1.0 ghi nhận điều chỉnh
  này).
- **FR-002**: Toàn bộ mã ứng dụng PHẢI nằm trong thư mục `src/` thống nhất; placeholder
  `scr/` PHẢI được xoá hoặc đổi tên, không được tồn tại hai thư mục song song.
- **FR-003**: Hệ thống PHẢI cấu hình sẵn Tailwind CSS và shadcn/ui để các feature sau
  dùng chung một bộ component UI.
- **FR-004**: Hệ thống PHẢI cấu hình lớp dữ liệu Prisma kết nối PostgreSQL (Supabase);
  lệnh tạo cấu trúc dữ liệu (`npx prisma migrate dev`) chạy thành công từ trạng thái trống.
- **FR-005**: Hệ thống PHẢI tích hợp sẵn khung xác thực **Better-Auth** (quyết định
  tại Clarifications 2026-09-28) kèm cấu trúc dữ liệu tài khoản tương ứng (mật khẩu
  được băm) — chưa yêu cầu màn hình đăng nhập hoàn chỉnh.
- **FR-006**: Hệ thống PHẢI khởi chạy được bằng một lệnh `npm run dev` tại localhost:3000.
- **FR-007**: Hệ thống PHẢI có cơ chế nạp dữ liệu mẫu chạy bằng `npx prisma db seed`
  với dữ liệu khởi điểm tối thiểu (≥ 1 danh mục + 1 công thức mẫu) nạp vào đúng
  schema nghiệp vụ Category + Recipe tối thiểu (theo ERD SRS §4) để kiểm chứng
  trọn vẹn đường đi của dữ liệu; nội dung seed thật (≥ 30 công thức có ảnh, 7 danh
  mục, ≥ 5 tài khoản — NFR5) thuộc phạm vi feature kế tiếp.
- **FR-008**: Hệ thống PHẢI đọc cấu hình từ `.env.local` với các biến `DATABASE_URL`,
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`; không secret nào được đưa vào git.
- **FR-009**: `README.md` PHẢI hướng dẫn đầy đủ các bước chạy từ máy trống (pin rõ
  runtime **Node.js 24 LTS**; cài đặt, cấu hình, tạo cấu trúc dữ liệu, nạp dữ liệu,
  khởi chạy) và mọi lệnh ghi trong README PHẢI hoạt động đúng như mô tả.
- **FR-010**: Quy trình AI skills Spec Kit (các lệnh speckit trong `.zcode/skills`)
  PHẢI vận hành được trên codebase mới: feature kế tiếp sinh tài liệu đúng vào thư
  mục feature mà `.specify/feature.json` trỏ tới, và constitution được nạp làm ràng buộc.
- **FR-011**: Hệ thống PHẢI triển khai được bản preview công khai lên Vercel từ
  repository; URL preview truy cập được và hiển thị đúng trang chủ.

### Key Entities *(include if feature involves data)*

- Schema nghiệp vụ tối thiểu do feature này tạo (Clarifications 2026-09-28):
  **Category** (danh mục món ăn) và **Recipe** (công thức) với các trường cốt lõi
  theo ERD SRS §4 — định danh, tên, quan hệ Category 1–N Recipe; CHƯA gồm trường
  mở rộng (ảnh, đánh giá, yêu thích — thuộc feature FR1/FR5/FR6 kế tiếp).
- Dữ liệu tài khoản do khung **Better-Auth** quản lý: **tài khoản người dùng cơ
  bản** (định danh, thông tin xác thực được băm — không lưu mật khẩu dạng thô).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trên máy tính trống (chỉ cài sẵn runtime theo README), một người đi từ
  clone repo đến xem trang web chạy tại localhost:3000 trong ≤ 15 phút, chỉ làm theo
  README.
- **SC-002**: 100% lệnh ghi trong README chạy đúng như mô tả — không có lệnh nào
  báo lỗi hoặc cần bước "ngầm" không được ghi.
- **SC-003**: Sau khi nạp dữ liệu mẫu, trang chủ hiển thị nội dung sinh ra từ dữ
  liệu đó (không còn trang trống hay lỗi kết nối).
- **SC-004**: Không tìm thấy bất kỳ thông tin nhạy cảm nào (mật khẩu, khoá, chuỗi
  kết nối) trong mã nguồn và trong lịch sử git sau khi scaffold.
- **SC-005**: Feature kế tiếp trong chuỗi speckit sinh được spec/plan/tasks vào đúng
  thư mục feature mà không cần hiệu chỉnh cấu hình thủ công nào.
- **SC-006**: Bản preview công khai truy cập được qua URL từ xa và hiển thị đúng
  trang chủ (dùng làm link demo cho báo cáo tuần).

## Assumptions

- "Skills" trong mô tả được hiểu là **bộ AI skills Spec Kit** (các lệnh `speckit-*`
  tại `.zcode/skills/`, cấu hình `ai_skills: true` trong `.specify/init-options.json`)
  đã cài sẵn — feature này chỉ bảo đảm chúng vận hành cùng codebase mới, không cài
  lại từ đầu.
- Next.js 16 là phiên bản ổn định hiện hành (09/2026). Đây là điều chỉnh có chủ đích
  của chủ dự án so với Next.js 15 trong SRS §6.1: constitution đã cập nhật lên v1.1.0;
  SRS và README được đồng bộ lại nội dung stack ở bước implement của feature này.
- Tài khoản Supabase và Vercel (gói miễn phí) đã có sẵn để cấu hình môi trường và
  triển khai preview.
- Nội dung seed thật theo NFR5 (≥ 30 công thức có ảnh, 7 danh mục, ≥ 5 tài khoản
  demo) là feature riêng kế tiếp — feature này chỉ dựng pipeline seed và dữ liệu
  kiểm chứng tối thiểu.
- Thư mục mã nguồn thống nhất là `src/`: README, timeline và constitution đều ghi
  `src/`; placeholder hiện tại `scr/` bị thay thế.
- README viết bằng tiếng Việt; các lệnh giữ nguyên dạng gốc tiếng Anh.
- Điều chỉnh kiến trúc khi implement (chỉ đạo chủ dự án 28/09/2026, ghi nhận tại
  research.md D7–D8): `src/` là Next.js project root duy nhất (full-stack —
  app/, components/, lib/, services/, prisma/, package.json, prisma.config.ts cùng
  một project; bỏ tách frontend/backend). Env gộp 1 nơi: `src/.env.local` chứa
  DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_ANON_KEY, BETTER_AUTH_SECRET —
  FR-008 thỏa nguyên văn.
- Agent tooling theo docs Next.js (guides/ai-agents, guides/mcp): AGENTS.md +
  CLAUDE.md trong `src/`, `.mcp.json` (next-devtools-mcp) ở repo root,
  5 skills Next.js trong `.zcode/skills/`.
- Scope ngoài feature này: mọi tính năng nghiệp vụ FR1–FR7, giao diện tiếng Việt
  đầy đủ, nội dung seed thật, kiểm thử bảo mật chuyên sâu (thuộc các feature sau).
