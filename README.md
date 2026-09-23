# Website Quản lý và Chia sẻ Công thức Nấu Ăn
 
> Đồ án thực tập cơ sở ngành — Học phần 220265 (3 tín chỉ)
> Tháng 9–10/2026
 
## Giới thiệu
 
Website cho phép người dùng xem, tìm kiếm công thức nấu ăn theo nhóm món; lưu yêu thích; đánh giá sao; quản trị nội dung qua trang admin.
 
## Tính năng chính
 
| Mã | Chức năng | Mô tả |
|---|---|---|
| FR1 | Hiển thị công thức theo nhóm | 7 danh mục: Món chính, Món tráng miệng, Món khai vị, Món canh, Món chay, Đồ uống, Món ăn vặt |
| FR2 | Chi tiết công thức | Nguyên liệu (checklist), các bước thực hiện, thời gian, độ khó |
| FR3 | Tìm kiếm | Theo tên món, nguyên liệu, nhóm món + bộ lọc + sắp xếp |
| FR4 | Tài khoản | Đăng ký / đăng nhập / đăng xuất (session/cookie) |
| FR5 | Yêu thích | Lưu/bỏ công thức yêu thích |
| FR6 | Đánh giá | Sao 1–5 + nhận xét, 1 người / 1 đánh giá / 1 công thức |
| FR7 | Quản trị | CRUD công thức, danh mục, upload ảnh, thống kê |
 
## Công nghệ
 
| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Storage ảnh | Supabase Storage |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Better-Auth / Auth.js |
| Deploy | Vercel |
| Version Control | GitHub |
 
## Cài đặt & Chạy dự án
 
### Yêu cầu
- Node.js >= 18
- npm hoặc bun
- Tài khoản Supabase (miễn phí)
 
### Các bước
 
```bash
# 1. Clone repo
git clone https://github.com/anhpt220203-web/csn-dx23tt11-phamtuananh-recipe-sharing.git
cd csn-dx23tt11-phamtuananh-recipe-sharing
 
# 2. Cài dependencies
npm install
 
# 3. Cấu hình biến môi trường
cp .env.example .env.local
# Chỉnh sửa .env.local với thông tin Supabase của bạn
 
# 4. Chạy Prisma migration
npx prisma migrate dev
 
# 5. Seed dữ liệu mẫu
npx prisma db seed
 
# 6. Chạy dev server
npm run dev
```
 
Truy cập: http://localhost:3000
 
### Biến môi trường (.env.local)
 
```env
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
```
 
## Cấu trúc thư mục
 
```
├── src/
│   ├── app/              # Next.js App Router (trang + API routes)
│   ├── components/       # React components
│   ├── lib/              # Utility, Prisma client, auth config
│   └── styles/           # Global styles (Tailwind)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Dữ liệu mẫu
├── public/               # Static assets
├── progress-report/      # Báo cáo tiến độ hằng tuần
└── README.md
```
 
## Dữ liệu mẫu
 
- >= 30 công thức nấu ăn thật (có ảnh)
- 7 danh mục món ăn
- >= 5 tài khoản dùng thử
 
## Liên hệ
 
| | Thông tin |
|---|---|
| Sinh viên | Phạm Tuấn Anh |
| MSSV | 170123497 |
| Lớp | DX23TT11 |
| GVHD | ThS. Trầm Hoàng Nam |
 
## License
 
Đồ án học phần — Trường Đại học Trà Vinh
