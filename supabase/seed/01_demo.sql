-- =============================================================================
-- SEED DEMO: 1 danh mục + 1 công thức mẫu để kiểm tra giao diện.
-- Nội dung do nhóm tự biên soạn (demo), không sao chép từ nguồn khác.
-- Idempotent: upsert theo slug, an toàn khi chạy lại nhiều lần.
-- Ảnh: /images/recipes/com-chien.jpg (đã có sẵn trong public/images/recipes/).
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

-- ─── Công thức: Cơm chiên dương châu ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status,
  calories, protein_g, carbs_g, sugar_g, fat_g, fiber_g,
  source_name
)
select
  c.id,
  'com-chien-duong-chau',
  'Cơm chiên dương châu',
  'Hạt cơm chiên tơi, vàng ươm màu trứng, điểm xuyết xúc xích, đậu Hà Lan và cà rốt. Món ăn nhanh gọn, đủ chất cho bữa sáng hay những tối bận rộn.',
  '/images/recipes/com-chien.jpg',
  3, 15, 20, 'Dễ', 'published',
  550, 18, 72, 3, 18, 3,
  'Demo — Công Thức Việt'
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
where recipe_id = (select id from public.recipes where slug = 'com-chien-duong-chau');

insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'com-chien-duong-chau'), v.position, v.name
from (values
  (1, 'Cơm trắng đã nấu chín, để nguội — 3 chén'),
  (2, 'Trứng gà — 2 quả'),
  (3, 'Xúc xích — 2 cây (có thể thay bằng lạp xưởng)'),
  (4, 'Đậu Hà Lan — 50g'),
  (5, 'Cà rốt — 1/2 củ'),
  (6, 'Hành lá — 2 nhánh'),
  (7, 'Tỏi băm — 1 muỗng cà phê'),
  (8, 'Nước mắm — 1 muỗng canh'),
  (9, 'Hạt nêm — 1 muỗng cà phê'),
  (10, 'Tiêu xay — 1/2 muỗng cà phê'),
  (11, 'Dầu ăn — 2 muỗng canh')
) as v(position, name);

-- ─── Các bước thực hiện ───
delete from public.recipe_steps
where recipe_id = (select id from public.recipes where slug = 'com-chien-duong-chau');

insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'com-chien-duong-chau'), v.position, v.step
from (values
  (1, 'Sơ chế nguyên liệu: cơm nấu chín để nguội (hoặc dùng cơm nguội qua đêm) rồi đánh cho tơi hạt. Trứng đập ra chén, đánh tan với một chút hạt nêm. Cà rốt gọt vỏ, thái hạt lựu rồi luộc sơ cùng đậu Hà Lan khoảng 2 phút, vớt ra để ráo. Xúc xích thái hạt lựu, hành lá thái nhỏ.'),
  (2, 'Chiên trứng: đun nóng 1 muỗng canh dầu ăn trên lửa vừa, cho trứng vào đảo nhanh tay đến khi trứng vừa chín tơi thì trút ngay ra đĩa, tránh chiên quá khô.'),
  (3, 'Xào nhân: cho nốt phần dầu ăn vào chảo, phi thơm tỏi băm. Cho xúc xích vào đảo khoảng 1 phút cho săn lại, tiếp theo cho cà rốt và đậu Hà Lan vào đảo đều.'),
  (4, 'Chiên cơm: cho cơm vào chảo, tăng lửa lớn, đảo đều tay khoảng 3–4 phút cho hạt cơm săn và tơi. Nêm nước mắm và hạt nêm, đảo thêm 1 phút cho gia vị thấm đều.'),
  (5, 'Hoàn thiện: cho trứng chiên trở lại chảo, đảo nhẹ cho quyện đều. Rắc hành lá và tiêu xay, tắt bếp. Múc cơm ra đĩa, dùng nóng sẽ ngon nhất.')
) as v(position, step);

commit;
