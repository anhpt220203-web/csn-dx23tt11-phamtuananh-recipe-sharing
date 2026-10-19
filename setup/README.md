# Hướng dẫn cài đặt

Website **Công Thức Món Ngon** — Thực tập đồ án chuyên ngành (220266), Trường Đại học Trà Vinh.

## Yêu cầu

- Node.js 24 LTS, pnpm, Git
- Docker Desktop (chạy Supabase cục bộ)
- Danh sách và link tải: xem [`soft/README.md`](../soft/README.md)

## Các bước cài đặt nhanh

1. `git clone https://github.com/anhpt220203-web/csn-dx23tt11-phamtuananh-recipe-sharing`
2. `cd src && pnpm install`
3. Sao chép `src/apps/web/.env.example` thành `src/apps/web/.env.local`, điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. `pnpm --filter web supabase:start` rồi `pnpm --filter web supabase:reset` (áp dụng các migration trong `supabase/migrations`).
5. Nạp dữ liệu mẫu trong `supabase/seed` theo thứ tự: `01_demo_recipe.sql`, `02_demo_users.sql`, `02_recipes_batch1.sql`, `03_recipes_batch2.sql`.
6. `pnpm dev` và mở http://localhost:3000.

## Tài liệu liên quan

- Hướng dẫn chi tiết và tài khoản dùng thử: [`README.md`](../README.md) và [`thesis/refs/DEMO_ACCOUNTS.md`](../thesis/refs/DEMO_ACCOUNTS.md)
- Triển khai bằng Docker: [`docker/README.md`](../docker/README.md)
- Dữ liệu mẫu và ảnh: [`supabase/seed/README.md`](../supabase/seed/README.md)
