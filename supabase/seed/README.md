# Seed Data

Thư mục này chứa dữ liệu mẫu cho database, được tách từ `supabase/seed.sql`
theo pattern chuẩn của Supabase CLI.

## Cấu trúc

| File | Nội dung |
|------|----------|
| `01_categories.sql` | 7 danh mục món ăn |
| `02_recipes.sql` | 33 công thức + nguyên liệu + các bước nấu |

Các file được đánh số để chạy theo đúng thứ tự (categories trước, recipes sau).
Tất cả đều idempotent (upsert theo slug) — an toàn khi chạy lại nhiều lần.

## Cách chạy

### Local (Supabase CLI)
```bash
# Từ thư mục supabase/
supabase db reset  # tự chạy migrations + seed.sql
```

### Cloud (Supabase Dashboard)
1. Mở **SQL Editor** → **New query**
2. Chạy từng file theo thứ tự: `01_categories.sql` → `02_recipes.sql`
3. Hoặc chạy file migration `supabase/migrations/*_seed_data.sql` (tự động qua GitHub integration)

### PsQL
```bash
psql "$DATABASE_URL" -f supabase/seed/01_categories.sql
psql "$DATABASE_URL" -f supabase/seed/02_recipes.sql
```

## Lưu ý

- **Tài khoản demo** KHÔNG tạo bằng SQL — tạo qua Dashboard (Authentication > Users)
  hoặc Management API, xem hướng dẫn trong `supabase/seed.sql`.
- **Ảnh công thức**: `image_url` hiện trỏ tới `/images/recipes/<slug>.jpg` —
  upload lên Supabase Storage (bucket `recipe-images`) rồi UPDATE thành URL public.
