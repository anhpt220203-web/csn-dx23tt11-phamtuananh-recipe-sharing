-- =============================================================================
-- Dọn dữ liệu seed cũ (33 công thức + 7 danh mục từ seed.sql ban đầu).
--
-- Migration 20261016113243_seed_data.sql đã chạy trên cloud qua PR #35 rồi bị
-- xóa khỏi repo. Migration này xóa dữ liệu cũ đó để chuẩn bị seed demo mới.
-- Chỉ xóa data thuộc 7 slug danh mục seed cũ — dữ liệu do người dùng tạo
-- (admin thêm tay) được giữ nguyên.
-- Thứ tự xóa: recipe_steps → recipe_ingredients → recipes → categories
-- (do FK recipes.category_id là ON DELETE RESTRICT).
-- Idempotent: chạy lại nhiều lần vẫn an toàn.
-- =============================================================================

-- 1. Xóa các bước thực hiện của công thức seed cũ
delete from public.recipe_steps
where recipe_id in (
  select r.id
  from public.recipes r
  join public.categories c on c.id = r.category_id
  where c.slug in (
    'mon-chinh', 'mon-canh', 'mon-khai-vi',
    'mon-chay', 'mon-an-vat', 'mon-trang-mieng', 'do-uong'
  )
);

-- 2. Xóa nguyên liệu của công thức seed cũ
delete from public.recipe_ingredients
where recipe_id in (
  select r.id
  from public.recipes r
  join public.categories c on c.id = r.category_id
  where c.slug in (
    'mon-chinh', 'mon-canh', 'mon-khai-vi',
    'mon-chay', 'mon-an-vat', 'mon-trang-mieng', 'do-uong'
  )
);

-- 3. Xóa công thức seed cũ (favorites/ratings tự cascade theo FK)
delete from public.recipes
where category_id in (
  select id from public.categories
  where slug in (
    'mon-chinh', 'mon-canh', 'mon-khai-vi',
    'mon-chay', 'mon-an-vat', 'mon-trang-mieng', 'do-uong'
  )
);

-- 4. Xóa 7 danh mục seed cũ
delete from public.categories
where slug in (
  'mon-chinh', 'mon-canh', 'mon-khai-vi',
  'mon-chay', 'mon-an-vat', 'mon-trang-mieng', 'do-uong'
);
