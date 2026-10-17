-- =============================================================================
-- Migration tự động chạy seed demo (1 danh mục + 1 công thức).
-- Nội dung đồng bộ với supabase/seed/01_demo.sql.
-- Idempotent: upsert theo slug, an toàn khi chạy lại nhiều lần.
-- =============================================================================

begin;

-- ─── Danh mục: Món chính ───
insert into public.categories (slug, name, description)
values (
  'mon-chinh',
  'Món chính',
  'Cơm, bún, phở và các món ăn chính cho bữa cơm gia đình.'
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

-- ─── Công thức: Gà chiên vị bơ tỏi ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status,
  calories, protein_g, carbs_g, sugar_g, fat_g, fiber_g,
  source_name
)
select
  c.id,
  'ga-chien-vi-bo-toi',
  'Gà chiên vị bơ tỏi',
  'Cánh gà chiên giòn rụm với lớp bột tẩm vị bơ tỏi thơm lừng, ăn kèm salad xoài chua ngọt và xốt mayonnaise béo ngậy. Món ăn phù hợp cho bữa cơm gia đình hay tụ họp bạn bè.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/ga-chien-vi-bo-toi.png',
  4, 15, 20, 'Dễ', 'published',
  450, 28, 25, 8, 28, 3,
  'Tóm tắt từ monngonmoingay.com'
from public.categories c
where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url,
  servings = excluded.servings,
  prep_time = excluded.prep_time,
  cook_time = excluded.cook_time,
  difficulty = excluded.difficulty,
  status = excluded.status,
  calories = excluded.calories,
  protein_g = excluded.protein_g,
  carbs_g = excluded.carbs_g,
  sugar_g = excluded.sugar_g,
  fat_g = excluded.fat_g,
  fiber_g = excluded.fiber_g,
  source_name = excluded.source_name,
  updated_at = now();

-- ─── Nguyên liệu ───
delete from public.recipe_ingredients
where recipe_id = (select id from public.recipes where slug = 'ga-chien-vi-bo-toi');

insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'ga-chien-vi-bo-toi'), v.position, v.name
from (values
  (1, 'Cánh gà — 400g'),
  (2, 'Xà lách — 100g'),
  (3, 'Cà chua bi — 100g'),
  (4, 'Xoài cát — 1/2 trái'),
  (5, 'Bột tẩm khô chiên giòn vị bơ tỏi — 1 gói'),
  (6, 'Xốt Mayonnaise — 2 muỗng canh (24g)'),
  (7, 'Chanh vàng — 1 trái'),
  (8, 'Ớt sừng cắt nhỏ — 1/2 muỗng cà phê'),
  (9, 'Rau húng lủi — 5g'),
  (10, 'Dầu ăn — vừa đủ để chiên'),
  (11, 'Muối, tiêu — nêm nếm')
) as v(position, name);

-- ─── Các bước thực hiện ───
delete from public.recipe_steps
where recipe_id = (select id from public.recipes where slug = 'ga-chien-vi-bo-toi');

insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'ga-chien-vi-bo-toi'), v.position, v.step
from (values
  (1, 'Sơ chế: khứa nhẹ vài đường trên cánh gà để thấm gia vị, rửa sạch và để ráo. Xà lách cắt miếng vừa ăn, cà chua bi cắt đôi, xoài gọt vỏ cắt hạt lựu. Húng lủi lặt lấy lá.'),
  (2, 'Trộn salad: cho xà lách, cà chua bi và xoài hạt lựu vào tô lớn, trộn đều và để riêng.'),
  (3, 'Tẩm bột và chiên: đun nóng dầu ăn trong chảo sâu lòng. Xóc đều cánh gà với bột tẩm khô vị bơ tỏi sao cho phủ kín. Cho gà vào chiên đến khi chín vàng giòn, vớt ra để ráo dầu.'),
  (4, 'Pha xốt: trộn đều xốt Mayonnaise với xoài hạt lựu cắt nhỏ, nước cốt chanh, vỏ chanh mài nhuyễn và ớt sừng cắt nhỏ.'),
  (5, 'Trình bày: xếp gà chiên giòn và salad ra đĩa, rưới xốt mayonnaise lên trên. Dùng ngay khi còn nóng sẽ ngon nhất.')
) as v(position, step);

commit;
