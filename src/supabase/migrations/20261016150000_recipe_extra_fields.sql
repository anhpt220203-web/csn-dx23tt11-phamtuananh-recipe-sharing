-- Bổ sung trường bổ sung thông tin hiển thị công thức (2026-10-16):
-- - prep_time: thời gian chuẩn bị (phút), hiển thị trên card + trang chi tiết
-- - Các chỉ số dinh dưỡng cho accordion "Giá trị dinh dưỡng" ở trang chi tiết

alter table public.recipes
  add column if not exists prep_time integer,
  add column if not exists calories numeric,
  add column if not exists protein_g numeric,
  add column if not exists carbs_g numeric,
  add column if not exists sugar_g numeric,
  add column if not exists fat_g numeric,
  add column if not exists fiber_g numeric;

comment on column public.recipes.prep_time is 'Thời gian chuẩn bị (phút)';
comment on column public.recipes.calories is 'Năng lượng (kcal)';
comment on column public.recipes.protein_g is 'Chất đạm (g)';
comment on column public.recipes.carbs_g is 'Tinh bột (g)';
comment on column public.recipes.sugar_g is 'Đường (g)';
comment on column public.recipes.fat_g is 'Chất béo (g)';
comment on column public.recipes.fiber_g is 'Chất xơ (g)';
