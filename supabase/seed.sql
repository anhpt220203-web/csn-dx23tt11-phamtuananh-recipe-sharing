-- =============================================================================
-- SEED: dữ liệu mẫu cho tính năng công thức nấu ăn (recipe-sharing)
-- Chuyển từ src/prisma/data/recipes.ts + image-credits.json cũ (nhánh origin/dev).
-- Khớp schema migration 20261014140000_recipes.sql:
--   categories, recipes, recipe_ingredients (name, position),
--   recipe_steps (step, position), favorites, ratings.
-- =============================================================================
-- Cách chạy:
--   1. Áp dụng các migration trong supabase/migrations trước (tạo bảng + RLS).
--   2. Chạy file này trên database Supabase:
--        supabase db reset   (tự nạp supabase/seed.sql), hoặc
--        psql "$DATABASE_URL" -f supabase/seed.sql, hoặc dán vào SQL Editor.
--   File an toàn khi chạy lại nhiều lần (upsert theo slug).
--
-- Ảnh: image_url hiện trỏ tới /images/recipes/<slug>.jpg — hãy upload các file
-- ảnh này lên Supabase Storage (bucket "recipe-images", public) rồi UPDATE
-- image_url thành URL public của Storage. Cột source_name/source_url giữ thông
-- tin bản quyền ảnh (giấy phép mở, đã có trong image-credits.json cũ).
--
-- TÀI KHOẢN DEMO (tạo qua Supabase Auth — KHÔNG tạo bằng SQL):
--   Cách 1 (Dashboard): Authentication > Users > "Add user" > "Create new user",
--           nhập email + mật khẩu, tick "Auto Confirm User".
--   Cách 2 (Management API): POST /auth/v1/admin/users với service_role key.
--   Sau khi tạo, gán quyền admin cho tài khoản quản trị (dùng bởi kit.is_admin()):
--           update auth.users
--           set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--           where email = 'phamtuananh@example.com';
--   Danh sách tài khoản demo (mật khẩu: Demo@123456):
--     - phamtuananh@example.com  (admin)
--     - tranbich@example.com     (user)
--     - minhkhoi@example.com     (user)
--     - hoangyen@example.com     (user)
--     - duchuy@example.com       (user)
-- =============================================================================

begin;
insert into public.categories (slug, name, description) values ('mon-chinh', 'Món chính', 'Cơm, bún, phở và các món ăn chính cho bữa cơm gia đình.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();
insert into public.categories (slug, name, description) values ('mon-canh', 'Món canh', 'Các món canh, súp thanh mát hoặc đậm đà cho bữa cơm thêm trọn vị.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();
insert into public.categories (slug, name, description) values ('mon-khai-vi', 'Món khai vị', 'Gỏi, nem, salad và món khai vị kích thích vị giác.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();
insert into public.categories (slug, name, description) values ('mon-chay', 'Món chay', 'Món ăn từ rau củ, đậu hũ, nấm — thanh đạm và dễ nấu.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();
insert into public.categories (slug, name, description) values ('mon-an-vat', 'Món ăn vặt', 'Bánh, món ăn nhanh cho bữa xế và những buổi tụ tập.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();
insert into public.categories (slug, name, description) values ('mon-trang-mieng', 'Món tráng miệng', 'Chè, bánh ngọt và món ngọt khép lại bữa ăn.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();
insert into public.categories (slug, name, description) values ('do-uong', 'Đồ uống', 'Trà, sinh tố, nước ép và thức uống giải nhiệt.')
  on conflict (slug) do update set name = excluded.name, description = excluded.description, updated_at = now();


-- com-chien — Cơm chiên dương châu
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'com-chien', 'Cơm chiên dương châu', 'Cơm chiên tơi hạt cùng trứng, xúc xích và rau củ — nhanh gọn cho bữa sáng hoặc bữa tối.', '/images/recipes/com-chien.jpg',
       3, 20, 'Dễ',
       'Ảnh: ultrakml — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/34948727@N00/11017830464'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'com-chien');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'com-chien'), 1, 'Cơm nguội 3 chén'),
((select id from public.recipes where slug = 'com-chien'), 2, 'Trứng gà 2 quả'),
((select id from public.recipes where slug = 'com-chien'), 3, 'Xúc xích 2 cây'),
((select id from public.recipes where slug = 'com-chien'), 4, 'Đậu Hà Lan, cà rốt, ngô hạt 1 chén'),
((select id from public.recipes where slug = 'com-chien'), 5, 'Hành lá, tỏi băm'),
((select id from public.recipes where slug = 'com-chien'), 6, 'Nước mắm, hạt nêm, tiêu');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'com-chien');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'com-chien'), 1, 'Đánh tan trứng, chiên vàng rồi xắt sợi nhỏ.'),
((select id from public.recipes where slug = 'com-chien'), 2, 'Phi thơm tỏi, xào xúc xích và rau củ khoảng 2 phút.'),
((select id from public.recipes where slug = 'com-chien'), 3, 'Cho cơm nguội vào đảo lửa lớn cho hạt cơm tơi ra.'),
((select id from public.recipes where slug = 'com-chien'), 4, 'Nêm nước mắm, hạt nêm, tiêu; cho trứng và hành lá vào đảo đều rồi tắt bếp.');

-- pho-bo-ha-noi — Phở bò Hà Nội
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'pho-bo-ha-noi', 'Phở bò Hà Nội', 'Nước dùng trong, thơm mùi hồi quế, bánh phở mềm ăn kèm thịt bò tái và hành lá.', '/images/recipes/pho-bo-ha-noi.jpg',
       4, 240, 'Trung bình',
       'Ảnh: David McKelvey — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/94735786@N00/6914024252'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'pho-bo-ha-noi');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 1, 'Xương ống bò 1kg'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 2, 'Thịt bò bắp và bò tái 500g'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 3, 'Bánh phở 500g'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 4, 'Hành tây 2 củ, gừng 1 nhánh'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 5, 'Hoa hồi, quế, thảo quả, hạt mùi'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 6, 'Nước mắm, muối, đường phèn'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 7, 'Hành lá, ngò gai, giá đỗ, chanh, ớt');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'pho-bo-ha-noi');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 1, 'Chần xương bò qua nước sôi để loại bỏ tạp chất rồi rửa sạch.'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 2, 'Nướng hành tây và gừng cho thơm, rang nhẹ các loại gia vị khô.'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 3, 'Hầm xương với nước, hành gừng và gia vị trong 3–4 giờ, hớt bọt thường xuyên.'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 4, 'Nêm nước mắm, muối, đường phèn cho vừa vị rồi lọc lấy nước dùng trong.'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 5, 'Trụng bánh phở, xếp thịt bò mỏng lên trên, chan nước dùng thật nóng.'),
((select id from public.recipes where slug = 'pho-bo-ha-noi'), 6, 'Dọn kèm hành lá, ngò gai, giá đỗ, chanh và ớt.');

-- thit-kho-trung — Thịt kho trứng
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'thit-kho-trung', 'Thịt kho trứng', 'Ba chỉ heo kho mềm, thấm vị nước dừa và nước mắm, ăn cùng trứng vịt kho và cơm trắng.', '/images/recipes/thit-kho-trung.jpg',
       4, 90, 'Dễ',
       'Ảnh: viviandnguyen_ — CC BY-SA 2.0 (Openverse)', 'https://www.flickr.com/photos/11849171@N00/6749934223'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'thit-kho-trung');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'thit-kho-trung'), 1, 'Thịt ba chỉ 700g'),
((select id from public.recipes where slug = 'thit-kho-trung'), 2, 'Trứng vịt 6 quả'),
((select id from public.recipes where slug = 'thit-kho-trung'), 3, 'Nước dừa tươi 1 lít'),
((select id from public.recipes where slug = 'thit-kho-trung'), 4, 'Nước mắm 4 muỗng'),
((select id from public.recipes where slug = 'thit-kho-trung'), 5, 'Đường thắng nước màu 2 muỗng'),
((select id from public.recipes where slug = 'thit-kho-trung'), 6, 'Hành tím, tỏi, tiêu');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'thit-kho-trung');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'thit-kho-trung'), 1, 'Thịt ba chỉ xắt miếng vuông, chần qua nước sôi rồi rửa sạch.'),
((select id from public.recipes where slug = 'thit-kho-trung'), 2, 'Ướp thịt với nước mắm, đường, hành tỏi băm và tiêu trong 30 phút.'),
((select id from public.recipes where slug = 'thit-kho-trung'), 3, 'Thắng đường cho lên màu cánh gián rồi cho thịt vào đảo săn.'),
((select id from public.recipes where slug = 'thit-kho-trung'), 4, 'Đổ nước dừa vào kho lửa nhỏ khoảng 45 phút cho thịt mềm.'),
((select id from public.recipes where slug = 'thit-kho-trung'), 5, 'Luộc trứng, bóc vỏ rồi cho vào kho thêm 15 phút cho thấm màu.');

-- bun-bo-hue — Bún bò Huế
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'bun-bo-hue', 'Bún bò Huế', 'Nước dùng đậm vị sả và mắm ruốc, ăn kèm bò bắp, chả lụa và chân giò.', '/images/recipes/bun-bo-hue.jpg',
       4, 180, 'Trung bình',
       'Ảnh: SauceSupreme — CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Bun_Bo_Hue_1.jpg'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'bun-bo-hue');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'bun-bo-hue'), 1, 'Xương ống bò 1kg'),
((select id from public.recipes where slug = 'bun-bo-hue'), 2, 'Bắp bò 400g, chân giò 400g'),
((select id from public.recipes where slug = 'bun-bo-hue'), 3, 'Sả 4 nhánh, mắm ruốc 2 muỗng'),
((select id from public.recipes where slug = 'bun-bo-hue'), 4, 'Ớt bột màu điều 1 muỗng'),
((select id from public.recipes where slug = 'bun-bo-hue'), 5, 'Bún sợi to 500g'),
((select id from public.recipes where slug = 'bun-bo-hue'), 6, 'Chả lụa, hành tím, gừng'),
((select id from public.recipes where slug = 'bun-bo-hue'), 7, 'Rau sống, hoa chuối, rau húng quế');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'bun-bo-hue');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'bun-bo-hue'), 1, 'Chần xương và thịt qua nước sôi, rửa sạch rồi hầm lửa nhỏ.'),
((select id from public.recipes where slug = 'bun-bo-hue'), 2, 'Hòa mắm ruốc với nước, lọc lấy phần nước trong cho vào nồi.'),
((select id from public.recipes where slug = 'bun-bo-hue'), 3, 'Đập dập sả cho vào nồi, thêm ớt bột màu điều để nước dùng có màu đỏ đẹp.'),
((select id from public.recipes where slug = 'bun-bo-hue'), 4, 'Hầm 2–3 giờ cho thịt chín mềm, nêm mắm ruốc và muối cho vừa ăn.'),
((select id from public.recipes where slug = 'bun-bo-hue'), 5, 'Xếp bún, thịt, chả lụa vào tô rồi chan nước dùng sôi.');

-- ga-chien-nuoc-mam — Gà chiên nước mắm
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'ga-chien-nuoc-mam', 'Gà chiên nước mắm', 'Cánh gà chiên giòn áo lớp nước mắm tỏi cay ngọt, rất hợp bữa cơm mưa.', '/images/recipes/ga-chien-nuoc-mam.jpg',
       3, 30, 'Dễ',
       'Ảnh: Ruth and Dave — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/95142644@N00/24449355688'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ga-chien-nuoc-mam');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 1, 'Cánh gà 600g'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 2, 'Nước mắm 3 muỗng'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 3, 'Đường 2 muỗng'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 4, 'Tỏi băm 1 muỗng'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 5, 'Bột năng 1 muỗng'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 6, 'Dầu ăn, tiêu, ớt băm');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ga-chien-nuoc-mam');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 1, 'Rửa gà, chần sơ rồi để ráo, ướp chút muối và tiêu.'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 2, 'Lăn gà qua bột năng mỏng rồi chiên vàng giòn, vớt ra để ráo dầu.'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 3, 'Phi tỏi vàng, cho nước mắm, đường và chút nước vào đun sánh.'),
((select id from public.recipes where slug = 'ga-chien-nuoc-mam'), 4, 'Cho gà vào đảo lửa lớn cho sốt bám đều rồi rắc tiêu, ớt.');

-- com-tam-suon-nuong — Cơm tấm sườn nướng
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'com-tam-suon-nuong', 'Cơm tấm sườn nướng', 'Sườn cốt lết ướp mật ong nướng thơm, ăn kèm cơm tấm, trứng và nước mắm chua ngọt.', '/images/recipes/com-tam-suon-nuong.jpg',
       2, 60, 'Trung bình',
       'Ảnh: Alpha from Melbourne, Australia — CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:C%C6%A1m_t%E1%BA%A5m_s%C6%B0%E1%BB%9Dn_b%C3%AC_ch%E1%BA%A3.jpg'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'com-tam-suon-nuong');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 1, 'Sườn cốt lết 600g'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 2, 'Cơm tấm 400g'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 3, 'Mật ong 2 muỗng, sả băm 2 muỗng'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 4, 'Nước mắm, đường, tỏi, tiêu'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 5, 'Dưa chua, đồ chua, hành phi'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 6, 'Trứng gà 2 quả');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'com-tam-suon-nuong');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 1, 'Dần sườn cho mềm rồi ướp với sả, mật ong, nước mắm, đường, tỏi trong 2 giờ.'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 2, 'Nướng sườn trên than hoặc lò ở nhiệt độ vừa, trở đều hai mặt.'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 3, 'Nấu cơm tấm chín tơi, chiên trứng ốp la.'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 4, 'Pha nước mắm chua ngọt: nước mắm, đường, chanh, tỏi ớt băm.'),
((select id from public.recipes where slug = 'com-tam-suon-nuong'), 5, 'Xếp cơm, sườn, trứng ra đĩa, rưới nước mắm và rắc hành phi.');

-- canh-chua-ca-loc — Canh chua cá lóc
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'canh-chua-ca-loc', 'Canh chua cá lóc', 'Vị chua thanh của me hòa với cá lóc tươi ngọt, thêm rau thơm và giá đỗ.', '/images/recipes/canh-chua-ca-loc.jpg',
       4, 35, 'Dễ',
       'Ảnh: Phương Huy (thảo luận) — Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Canh_chua_c%C3%A1_l%C3%B3c_%E1%BB%9F_Th%E1%BB%A7y_Tr%C3%BAc_Qu%C3%A1n,_%C4%91%C6%B0%E1%BB%9Dng_Nguy%E1%BB%85n_Nh%E1%BB%AF_L%C3%A3m_(1).jpg'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-chua-ca-loc');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 1, 'Cá lóc 600g'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 2, 'Me chín 100g'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 3, 'Cà chua 2 quả, dứa 1/4 quả'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 4, 'Giá đỗ, đậu bắp, bạc hà'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 5, 'Ngò om, ngò gai, rau răm'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 6, 'Nước mắm, đường, hành tím');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-chua-ca-loc');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 1, 'Cá lóc làm sạch, cắt khúc, ướp chút muối và tiêu.'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 2, 'Dầm me với nước sôi, lọc lấy nước chua.'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 3, 'Phi hành, xào cà chua và dứa cho thơm rồi đổ nước vào đun sôi.'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 4, 'Cho cá vào nấu chín, thêm nước me, nêm nước mắm và đường.'),
((select id from public.recipes where slug = 'canh-chua-ca-loc'), 5, 'Cho rau củ và rau thơm vào, đun sôi lại rồi tắt bếp.');

-- canh-mong-toi-tom — Canh mồng tơi nấu tôm
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'canh-mong-toi-tom', 'Canh mồng tơi nấu tôm', 'Món canh xanh mát, ngọt vị tôm tươi, nấu nhanh trong 10 phút.', '/images/recipes/canh-mong-toi-tom.jpg',
       3, 15, 'Dễ',
       'Ảnh: Phương Huy — CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:M%C3%B3n_c%C3%BAng_T%E1%BA%BFt_n%C4%83m_2019_t%E1%BA%A1i_%C4%90%C3%B4ng_H%C3%A0_(canh_c%C3%A1_d%C3%ACa_n%E1%BA%A5u_m%E1%BB%93ng_t%C6%A1i)_(1).jpg'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-mong-toi-tom');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 1, 'Rau mồng tơi 400g'),
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 2, 'Tôm tươi 200g'),
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 3, 'Hành tím, dầu ăn'),
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 4, 'Nước mắm, muối, hạt nêm');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-mong-toi-tom');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 1, 'Nhặt và rửa sạch rau mồng tơi, cắt khúc vừa ăn.'),
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 2, 'Tôm bóc vỏ, băm nhuyễn hoặc để nguyên con.'),
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 3, 'Phi thơm hành, xào tôm cho săn rồi đổ nước vào đun sôi.'),
((select id from public.recipes where slug = 'canh-mong-toi-tom'), 4, 'Cho rau vào nấu chín tới, nêm nếm vừa ăn rồi tắt bếp.');

-- sup-ga-nam-huong — Súp gà nấm hương
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'sup-ga-nam-huong', 'Súp gà nấm hương', 'Súp sánh mịn, thơm mùi nấm hương, ấm bụng cho những ngày se lạnh.', '/images/recipes/sup-ga-nam-huong.jpg',
       4, 30, 'Dễ',
       'Ảnh: David — Public domain (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Southern_Chinese_style_chicken_soup_with_mushrooms_and_corn.jpg'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sup-ga-nam-huong');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 1, 'Ức gà 300g'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 2, 'Nấm hương khô 30g'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 3, 'Trứng gà 1 quả'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 4, 'Bột năng 2 muỗng'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 5, 'Hành tím, ngò rí'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 6, 'Muối, tiêu, đường');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-ga-nam-huong');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 1, 'Ngâm nấm hương cho nở, cắt bỏ chân rồi thái sợi.'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 2, 'Luộc ức gà chín, xé sợi nhỏ, giữ lại nước luộc.'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 3, 'Cho nấm vào nước dùng đun sôi, nêm muối và đường.'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 4, 'Hòa bột năng với nước rồi rót từ từ để súp sánh lại.'),
((select id from public.recipes where slug = 'sup-ga-nam-huong'), 5, 'Đánh tan trứng, rót thành dòng mỏng tạo sợi, rắc ngò rí và tiêu.');

-- canh-bi-do-thit-bam — Canh bí đỏ thịt băm
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'canh-bi-do-thit-bam', 'Canh bí đỏ thịt băm', 'Bí đỏ ngọt bùi nấu cùng thịt băm, món canh dễ ăn cho cả nhà.', '/images/recipes/canh-bi-do-thit-bam.jpg',
       4, 25, 'Dễ',
       'Ảnh: Phương Huy — CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:B%E1%BB%AFa_c%C6%A1m_nh%C3%A0_Mheo,_ng19th1n2020_(n%E1%BB%93i_canh_b%C3%AD_%C4%91ao).jpg'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-bi-do-thit-bam');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 1, 'Bí đỏ 500g'),
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 2, 'Thịt heo băm 150g'),
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 3, 'Hành lá, hành tím'),
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 4, 'Muối, hạt nêm, tiêu');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-bi-do-thit-bam');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 1, 'Gọt vỏ bí đỏ, cắt miếng vừa ăn.'),
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 2, 'Phi thơm hành, xào thịt băm cho săn.'),
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 3, 'Cho bí đỏ và nước vào nấu khoảng 15 phút cho bí chín mềm.'),
((select id from public.recipes where slug = 'canh-bi-do-thit-bam'), 4, 'Nêm nếm vừa ăn, rắc hành lá và tiêu rồi tắt bếp.');

-- canh-rong-bien-dau-hu — Canh rong biển đậu hũ
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'canh-rong-bien-dau-hu', 'Canh rong biển đậu hũ', 'Canh thanh mát với rong biển và đậu hũ non, thích hợp bữa ăn nhẹ.', '/images/recipes/canh-rong-bien-dau-hu.jpg',
       3, 20, 'Dễ',
       'Ảnh: Richard Masoner / Cyclelicious — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/99247795@N00/4350584082'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-rong-bien-dau-hu');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 1, 'Rong biển khô 20g'),
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 2, 'Đậu hũ non 2 miếng'),
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 3, 'Tôm khô 30g'),
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 4, 'Hành tím, nước mắm');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-rong-bien-dau-hu');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 1, 'Ngâm rong biển cho nở rồi rửa sạch, cắt khúc.'),
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 2, 'Phi hành tím với tôm khô cho thơm.'),
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 3, 'Đổ nước vào đun sôi, cho đậu hũ cắt miếng vào nấu nhẹ.'),
((select id from public.recipes where slug = 'canh-rong-bien-dau-hu'), 4, 'Thêm rong biển, nêm nước mắm vừa ăn rồi tắt bếp ngay để đậu hũ không nát.');

-- goi-cuon-tom-thit — Gỏi cuốn tôm thịt
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'goi-cuon-tom-thit', 'Gỏi cuốn tôm thịt', 'Bánh tráng cuốn tôm tươi, thịt luộc và rau sống, chấm tương đậu phộng.', '/images/recipes/goi-cuon-tom-thit.jpg',
       4, 30, 'Dễ',
       'Ảnh: Jakub Kapusnak — CC CC0 1.0 (rawpixel)', 'https://www.rawpixel.com/image/447669/free-photo-image-takeaway-pho-goi-cuon'
from public.categories c where c.slug = 'mon-khai-vi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'goi-cuon-tom-thit');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 1, 'Bánh tráng cuốn 200g'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 2, 'Tôm tươi 300g'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 3, 'Thịt ba chỉ 300g'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 4, 'Bún tươi 200g'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 5, 'Xà lách, rau thơm, hẹ'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 6, 'Tương đậu, đậu phộng rang');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'goi-cuon-tom-thit');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 1, 'Luộc tôm và thịt ba chỉ, để nguội rồi thái lát mỏng.'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 2, 'Rửa sạch rau sống, để ráo nước.'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 3, 'Trải bánh tráng, xếp rau, bún, thịt và tôm rồi cuộn chặt tay.'),
((select id from public.recipes where slug = 'goi-cuon-tom-thit'), 4, 'Pha tương đậu với đường, nước và đậu phộng rang giã nhỏ làm nước chấm.');

-- nem-ran — Nem rán (chả giò)
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'nem-ran', 'Nem rán (chả giò)', 'Nem cuốn nhân thịt, mộc nhĩ và rau củ, rán vàng giòn, chấm nước mắm chua ngọt.', '/images/recipes/nem-ran.jpg',
       4, 45, 'Trung bình',
       'Ảnh: Phương Huy — CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:L%E1%BB%85_h%E1%BB%99i_%E1%BA%A9m_th%E1%BB%B1c_C%E1%BB%ADa_Vi%E1%BB%87t_th4n2023_%C4%91%E1%BA%B7c_s%E1%BA%A3n_ch%E1%BA%A3_gi%C3%B2_nem_r%C3%A1n_(1).jpg'
from public.categories c where c.slug = 'mon-khai-vi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'nem-ran');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'nem-ran'), 1, 'Bánh đa nem 1 gói'),
((select id from public.recipes where slug = 'nem-ran'), 2, 'Thịt heo xay 400g'),
((select id from public.recipes where slug = 'nem-ran'), 3, 'Mộc nhĩ, miến 50g'),
((select id from public.recipes where slug = 'nem-ran'), 4, 'Cà rốt, hành tây, giá đỗ'),
((select id from public.recipes where slug = 'nem-ran'), 5, 'Trứng gà 1 quả'),
((select id from public.recipes where slug = 'nem-ran'), 6, 'Nước mắm, hạt tiêu, hành khô');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'nem-ran');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'nem-ran'), 1, 'Ngâm mộc nhĩ và miến cho mềm, thái nhỏ cùng rau củ.'),
((select id from public.recipes where slug = 'nem-ran'), 2, 'Trộn thịt xay với rau củ, trứng, nước mắm và tiêu làm nhân.'),
((select id from public.recipes where slug = 'nem-ran'), 3, 'Cuộn nhân trong bánh đa nem thành cuốn vừa ăn, gấp kín hai đầu.'),
((select id from public.recipes where slug = 'nem-ran'), 4, 'Rán ngập dầu lửa vừa cho nem chín vàng đều các mặt.'),
((select id from public.recipes where slug = 'nem-ran'), 5, 'Vớt ra giấy thấm dầu, dọn kèm rau sống và nước mắm chua ngọt.');

-- goi-du-du-tom-kho — Gỏi đu đủ tôm khô
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'goi-du-du-tom-kho', 'Gỏi đu đủ tôm khô', 'Đu đủ bào giòn trộn tôm khô, đậu phộng và rau thơm, vị chua ngọt hài hòa.', '/images/recipes/goi-du-du-tom-kho.jpg',
       4, 25, 'Dễ',
       'Ảnh: stu_spivack — CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:G%E1%BB%8Fi_%C4%91u_%C4%91%E1%BB%A7_kh%C3%B4_b%C3%B2.jpg'
from public.categories c where c.slug = 'mon-khai-vi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'goi-du-du-tom-kho');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 1, 'Đu đủ xanh 500g'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 2, 'Tôm khô 80g'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 3, 'Đậu phộng rang 50g'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 4, 'Rau thơm, húng quế'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 5, 'Nước mắm, đường, chanh, tỏi ớt');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'goi-du-du-tom-kho');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 1, 'Bào đu đủ sợi nhỏ, ngâm nước muối loãng rồi vắt ráo.'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 2, 'Rửa tôm khô, rang hoặc chiên sơ cho thơm.'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 3, 'Pha nước trộn gỏi: nước mắm, đường, chanh, tỏi ớt băm.'),
((select id from public.recipes where slug = 'goi-du-du-tom-kho'), 4, 'Trộn đu đủ, tôm khô, rau thơm với nước trộn rồi rắc đậu phộng.');

-- salad-dau-giam — Salad dầu giấm
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'salad-dau-giam', 'Salad dầu giấm', 'Rau củ tươi giòn trộn dầu giấm nhẹ, dùng kèm bữa Âu hoặc ăn nhẹ buổi tối.', '/images/recipes/salad-dau-giam.jpg',
       3, 15, 'Dễ',
       'Ảnh: arvindgrover — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/60167034@N00/4201938036'
from public.categories c where c.slug = 'mon-khai-vi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-dau-giam');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'salad-dau-giam'), 1, 'Xà lách 200g'),
((select id from public.recipes where slug = 'salad-dau-giam'), 2, 'Cà chua bi 150g'),
((select id from public.recipes where slug = 'salad-dau-giam'), 3, 'Dưa leo 1 quả'),
((select id from public.recipes where slug = 'salad-dau-giam'), 4, 'Hành tây tím 1/2 củ'),
((select id from public.recipes where slug = 'salad-dau-giam'), 5, 'Dầu ô liu 3 muỗng'),
((select id from public.recipes where slug = 'salad-dau-giam'), 6, 'Giấm táo 2 muỗng, mật ong 1 muỗng');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-dau-giam');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'salad-dau-giam'), 1, 'Rửa sạch rau củ, ngâm nước đá cho giòn rồi vớt ráo.'),
((select id from public.recipes where slug = 'salad-dau-giam'), 2, 'Cắt cà chua bi đôi, dưa leo lát mỏng, hành tây thái mỏng.'),
((select id from public.recipes where slug = 'salad-dau-giam'), 3, 'Pha dầu giấm với mật ong, chút muối và tiêu.'),
((select id from public.recipes where slug = 'salad-dau-giam'), 4, 'Trộn đều tất cả trước khi dùng để rau không bị mềm.');

-- dau-hu-sot-ca-chua — Đậu hũ sốt cà chua
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'dau-hu-sot-ca-chua', 'Đậu hũ sốt cà chua', 'Đậu hũ chiên vàng om sốt cà chua đậm đà, món chay quen thuộc cho bữa cơm.', '/images/recipes/dau-hu-sot-ca-chua.jpg',
       3, 25, 'Dễ',
       'Ảnh: Vegan Feast Catering — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/25128194@N02/3978558867'
from public.categories c where c.slug = 'mon-chay'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'dau-hu-sot-ca-chua');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 1, 'Đậu hũ 4 miếng'),
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 2, 'Cà chua 3 quả'),
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 3, 'Hành tím, hành lá'),
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 4, 'Nước tương, đường, tiêu');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'dau-hu-sot-ca-chua');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 1, 'Cắt đậu hũ thành miếng vuông, chiên vàng đều các mặt.'),
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 2, 'Băm nhỏ hành tím, xào cà chua cho nhuyễn và lên màu đỏ đẹp.'),
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 3, 'Cho chút nước, nêm nước tương và đường vừa ăn.'),
((select id from public.recipes where slug = 'dau-hu-sot-ca-chua'), 4, 'Cho đậu hũ vào om lửa nhỏ 5 phút cho thấm sốt, rắc hành lá.');

-- rau-cu-xao-nam — Rau củ xào nấm
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'rau-cu-xao-nam', 'Rau củ xào nấm', 'Bông cải, cà rốt và nấm xào nhanh lửa lớn, giữ độ giòn ngọt tự nhiên.', '/images/recipes/rau-cu-xao-nam.jpg',
       3, 20, 'Dễ',
       'Ảnh: jeffreyw — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/7927684@N03/6306839645'
from public.categories c where c.slug = 'mon-chay'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'rau-cu-xao-nam');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 1, 'Bông cải xanh 300g'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 2, 'Cà rốt 1 củ'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 3, 'Nấm rơm hoặc nấm đùi gà 200g'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 4, 'Tỏi băm, dầu hào chay'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 5, 'Muối, đường, tiêu');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'rau-cu-xao-nam');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 1, 'Cắt rau củ thành miếng vừa ăn, chần sơ qua nước sôi có chút muối.'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 2, 'Phi thơm tỏi, cho nấm vào xào trước cho ra nước.'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 3, 'Cho rau củ vào xào lửa lớn khoảng 3 phút.'),
((select id from public.recipes where slug = 'rau-cu-xao-nam'), 4, 'Nêm dầu hào chay, đường và tiêu, đảo đều rồi tắt bếp.');

-- bun-xao-chay — Bún xào chay thập cẩm
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'bun-xao-chay', 'Bún xào chay thập cẩm', 'Bún xào cùng nấm, đậu hũ và rau củ, món chay no bụng mà không ngán.', '/images/recipes/bun-xao-chay.jpg',
       3, 25, 'Dễ',
       'Ảnh: crd! — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/61324768@N00/5815842044'
from public.categories c where c.slug = 'mon-chay'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'bun-xao-chay');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'bun-xao-chay'), 1, 'Bún tươi 400g'),
((select id from public.recipes where slug = 'bun-xao-chay'), 2, 'Đậu hũ 2 miếng'),
((select id from public.recipes where slug = 'bun-xao-chay'), 3, 'Nấm hương 50g, cà rốt, cải ngọt'),
((select id from public.recipes where slug = 'bun-xao-chay'), 4, 'Giá đỗ 150g'),
((select id from public.recipes where slug = 'bun-xao-chay'), 5, 'Nước tương, dầu hào chay');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'bun-xao-chay');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'bun-xao-chay'), 1, 'Chiên đậu hũ vàng rồi cắt miếng nhỏ.'),
((select id from public.recipes where slug = 'bun-xao-chay'), 2, 'Xào nấm và rau củ với nước tương cho chín tới.'),
((select id from public.recipes where slug = 'bun-xao-chay'), 3, 'Cho bún vào đảo cùng lửa lớn, thêm dầu hào chay.'),
((select id from public.recipes where slug = 'bun-xao-chay'), 4, 'Cho giá đỗ vào sau cùng, đảo nhanh rồi tắt bếp để giá còn giòn.');

-- canh-du-du-chay — Canh đu đủ chay
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'canh-du-du-chay', 'Canh đu đủ chay', 'Canh đu đủ nấu nấm và đậu hũ, vị ngọt thanh nhẹ nhàng.', '/images/recipes/canh-du-du-chay.jpg',
       3, 25, 'Dễ',
       'Ảnh: goodiesfirst — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/49215102@N00/7797210780'
from public.categories c where c.slug = 'mon-chay'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-du-du-chay');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'canh-du-du-chay'), 1, 'Đu đủ xanh 400g'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 2, 'Đậu hũ 2 miếng'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 3, 'Nấm rơm 100g'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 4, 'Hành tím, ngò rí'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 5, 'Muối, hạt nêm chay');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-du-du-chay');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'canh-du-du-chay'), 1, 'Gọt vỏ đu đủ, cắt miếng vừa ăn.'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 2, 'Phi thơm hành, cho đu đủ vào xào sơ.'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 3, 'Đổ nước vào nấu cho đu đủ chín mềm.'),
((select id from public.recipes where slug = 'canh-du-du-chay'), 4, 'Thêm nấm và đậu hũ, nêm hạt nêm chay rồi rắc ngò rí.');

-- dau-hu-chien-sa-ot — Đậu hũ chiên sả ớt
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'dau-hu-chien-sa-ot', 'Đậu hũ chiên sả ớt', 'Đậu hũ chiên giòn rim sả ớt cay thơm, ăn kèm cơm trắng rất bắt vị.', '/images/recipes/dau-hu-chien-sa-ot.jpg',
       3, 25, 'Dễ',
       'Ảnh: avlxyz — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/10559879@N00/2076217681'
from public.categories c where c.slug = 'mon-chay'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'dau-hu-chien-sa-ot');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 1, 'Đậu hũ 4 miếng'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 2, 'Sả 3 nhánh, ớt 2 quả'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 3, 'Nước tương 3 muỗng'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 4, 'Đường 1 muỗng'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 5, 'Tỏi băm, dầu ăn');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'dau-hu-chien-sa-ot');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 1, 'Đậu hũ cắt miếng vừa ăn, chiên vàng giòn rồi vớt ra.'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 2, 'Băm nhuyễn sả, ớt và tỏi.'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 3, 'Phi thơm hỗn hợp sả ớt, thêm nước tương và đường đun sánh.'),
((select id from public.recipes where slug = 'dau-hu-chien-sa-ot'), 4, 'Cho đậu hũ vào rim lửa nhỏ cho sốt bám đều rồi tắt bếp.');

-- banh-mi-trung-op-la — Bánh mì trứng ốp la
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'banh-mi-trung-op-la', 'Bánh mì trứng ốp la', 'Bữa sáng nhanh gọn với trứng ốp la, xúc xích và bánh mì giòn.', '/images/recipes/banh-mi-trung-op-la.jpg',
       1, 10, 'Dễ',
       'Ảnh: David Jackmanson — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/58301516@N00/45675255101'
from public.categories c where c.slug = 'mon-an-vat'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'banh-mi-trung-op-la');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 1, 'Bánh mì 2 ổ'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 2, 'Trứng gà 2 quả'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 3, 'Xúc xích 2 cây'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 4, 'Bơ, tương ớt, tiêu'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 5, 'Dưa leo, ngò rí');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'banh-mi-trung-op-la');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 1, 'Chiên trứng ốp la lòng đào, rắc chút tiêu.'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 2, 'Chiên xúc xích cho chín vàng.'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 3, 'Nướng bánh mì cho giòn, phết bơ mỏng.'),
((select id from public.recipes where slug = 'banh-mi-trung-op-la'), 4, 'Kẹp trứng, xúc xích, dưa leo vào bánh mì rồi rưới tương ớt.');

-- banh-xeo-mien-trung — Bánh xèo miền Trung
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'banh-xeo-mien-trung', 'Bánh xèo miền Trung', 'Bánh xèo vỏ giòn rụm, nhân tôm thịt và giá đỗ, cuốn rau sống chấm nước mắm.', '/images/recipes/banh-xeo-mien-trung.jpg',
       3, 40, 'Trung bình',
       'Ảnh: stu_spivack — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/35034346243@N01/3137674688'
from public.categories c where c.slug = 'mon-an-vat'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'banh-xeo-mien-trung');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 1, 'Bột bánh xèo 200g'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 2, 'Nước cốt dừa 100ml'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 3, 'Tôm 150g, thịt ba chỉ 150g'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 4, 'Giá đỗ, hành lá'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 5, 'Nghệ, muối, dầu ăn'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 6, 'Rau sống, nước mắm chua ngọt');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'banh-xeo-mien-trung');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 1, 'Pha bột bánh xèo với nước, nước cốt dừa, chút nghệ và muối, để nghỉ 30 phút.'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 2, 'Xào sơ tôm và thịt với hành.'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 3, 'Tráng bột mỏng trên chảo nóng, cho nhân và giá đỗ vào một nửa bánh.'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 4, 'Đậy nắp cho bánh chín giòn rồi gấp đôi lại.'),
((select id from public.recipes where slug = 'banh-xeo-mien-trung'), 5, 'Dọn bánh nóng cùng rau sống và nước mắm chua ngọt.');

-- ha-cao-hap — Há cảo hấp
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'ha-cao-hap', 'Há cảo hấp', 'Vỏ há cảo dai mềm, nhân tôm thịt ngọt thơm, chấm xì dầu giấm.', '/images/recipes/ha-cao-hap.jpg',
       4, 50, 'Trung bình',
       'Ảnh: roland — CC CC0 1.0 (flickr)', 'https://www.flickr.com/photos/35034347371@N01/10167337'
from public.categories c where c.slug = 'mon-an-vat'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ha-cao-hap');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'ha-cao-hap'), 1, 'Bột há cảo 200g'),
((select id from public.recipes where slug = 'ha-cao-hap'), 2, 'Tôm 250g, thịt heo xay 150g'),
((select id from public.recipes where slug = 'ha-cao-hap'), 3, 'Hành lá, gừng'),
((select id from public.recipes where slug = 'ha-cao-hap'), 4, 'Xì dầu, dầu mè, tiêu');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ha-cao-hap');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'ha-cao-hap'), 1, 'Nhào bột với nước nóng già rồi ủ 30 phút cho bột mềm.'),
((select id from public.recipes where slug = 'ha-cao-hap'), 2, 'Trộn tôm băm với thịt, hành, gừng và gia vị làm nhân.'),
((select id from public.recipes where slug = 'ha-cao-hap'), 3, 'Cán bột mỏng, cho nhân vào và gấp viền thành hình há cảo.'),
((select id from public.recipes where slug = 'ha-cao-hap'), 4, 'Hấp 10 phút trên lửa lớn, dọn kèm xì dầu pha giấm.');

-- banh-trang-tron — Bánh tráng trộn
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'banh-trang-tron', 'Bánh tráng trộn', 'Bánh tráng cắt sợi trộn đều với tôm khô, trứng cút và xoài xanh.', '/images/recipes/banh-trang-tron.jpg',
       2, 20, 'Dễ',
       'Ảnh: Cohaithaofoody — CC BY-SA 4.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Chi_ti%E1%BA%BFt_b%C3%A1nh_tr%C3%A1ng_tr%E1%BB%99n_C%C3%B4_Hai_Th%E1%BA%A3o_.jpg'
from public.categories c where c.slug = 'mon-an-vat'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'banh-trang-tron');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'banh-trang-tron'), 1, 'Bánh tráng trộn 200g'),
((select id from public.recipes where slug = 'banh-trang-tron'), 2, 'Tôm khô 50g'),
((select id from public.recipes where slug = 'banh-trang-tron'), 3, 'Trứng cút 10 quả'),
((select id from public.recipes where slug = 'banh-trang-tron'), 4, 'Xoài xanh 1 quả'),
((select id from public.recipes where slug = 'banh-trang-tron'), 5, 'Sa tế, dầu hành, đậu phộng'),
((select id from public.recipes where slug = 'banh-trang-tron'), 6, 'Muối tôm, đường');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'banh-trang-tron');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'banh-trang-tron'), 1, 'Trứng cút luộc chín, bóc vỏ; xoài xanh bào sợi.'),
((select id from public.recipes where slug = 'banh-trang-tron'), 2, 'Xịt nước lên bánh tráng cho mềm vừa, cắt sợi.'),
((select id from public.recipes where slug = 'banh-trang-tron'), 3, 'Trộn bánh tráng với tôm khô, xoài, trứng cút và sa tế.'),
((select id from public.recipes where slug = 'banh-trang-tron'), 4, 'Nêm muối tôm, đường, dầu hành rồi rắc đậu phộng lên trên.');

-- banh-khot — Bánh khọt
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'banh-khot', 'Bánh khọt', 'Bánh khọt nhỏ xinh, vỏ ngoài giòn trong mềm, ăn kèm rau sống và nước mắm.', '/images/recipes/banh-khot.jpg',
       4, 45, 'Trung bình',
       'Ảnh: Đam Mê Ẩm Thực — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/148481438@N03/37118601101'
from public.categories c where c.slug = 'mon-an-vat'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'banh-khot');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'banh-khot'), 1, 'Bột gạo 200g, bột nghệ 1 muỗng'),
((select id from public.recipes where slug = 'banh-khot'), 2, 'Nước cốt dừa 150ml'),
((select id from public.recipes where slug = 'banh-khot'), 3, 'Tôm 150g'),
((select id from public.recipes where slug = 'banh-khot'), 4, 'Đậu xanh hấp 100g'),
((select id from public.recipes where slug = 'banh-khot'), 5, 'Hành lá, dầu ăn');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'banh-khot');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'banh-khot'), 1, 'Pha bột gạo với nước cốt dừa, nghệ và chút muối, để nghỉ 30 phút.'),
((select id from public.recipes where slug = 'banh-khot'), 2, 'Đổ bột vào khuôn bánh khọt đã nóng dầu.'),
((select id from public.recipes where slug = 'banh-khot'), 3, 'Cho tôm và đậu xanh lên mỗi bánh.'),
((select id from public.recipes where slug = 'banh-khot'), 4, 'Đậy nắp cho bánh chín vàng, rắc hành lá rồi gỡ ra đĩa.');

-- banh-flan-caramel — Bánh flan caramel
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'banh-flan-caramel', 'Bánh flan caramel', 'Bánh flan mềm mịn béo nhẹ vị trứng sữa, phủ lớp caramel thơm đắng ngọt.', '/images/recipes/banh-flan-caramel.jpg',
       6, 60, 'Trung bình',
       'Ảnh: avlxyz — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/10559879@N00/4247062952'
from public.categories c where c.slug = 'mon-trang-mieng'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'banh-flan-caramel');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'banh-flan-caramel'), 1, 'Trứng gà 4 quả'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 2, 'Sữa tươi 400ml'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 3, 'Sữa đặc 100g'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 4, 'Đường 80g'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 5, 'Vani 1 muỗng cà phê');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'banh-flan-caramel');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'banh-flan-caramel'), 1, 'Thắng đường với chút nước cho lên màu cánh gián rồi tráng đáy khuôn.'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 2, 'Đun sữa tươi với sữa đặc cho ấm, để nguội bớt.'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 3, 'Đánh nhẹ trứng với vani rồi hòa vào hỗn hợp sữa, lọc qua rây.'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 4, 'Đổ khuôn, hấp cách thủy hoặc nướng cách thủy ở 150°C khoảng 40 phút.'),
((select id from public.recipes where slug = 'banh-flan-caramel'), 5, 'Để nguội, làm lạnh rồi úp bánh ra đĩa.');

-- che-ba-mau — Chè ba màu
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'che-ba-mau', 'Chè ba màu', 'Đậu xanh, đậu đỏ và thạch lá dứa ba tầng màu, chan nước cốt dừa béo ngậy.', '/images/recipes/che-ba-mau.jpg',
       4, 60, 'Dễ',
       'Ảnh: Zxcvasdfqwer888 — CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Ch%C3%A8_B%E1%BA%AFp.jpg'
from public.categories c where c.slug = 'mon-trang-mieng'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'che-ba-mau');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'che-ba-mau'), 1, 'Đậu xanh cà 150g'),
((select id from public.recipes where slug = 'che-ba-mau'), 2, 'Đậu đỏ 150g'),
((select id from public.recipes where slug = 'che-ba-mau'), 3, 'Bột rau câu 10g, lá dứa'),
((select id from public.recipes where slug = 'che-ba-mau'), 4, 'Nước cốt dừa 300ml'),
((select id from public.recipes where slug = 'che-ba-mau'), 5, 'Đường 200g');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'che-ba-mau');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'che-ba-mau'), 1, 'Ngâm đậu đỏ qua đêm rồi hấp chín, tán nhuyễn với đường.'),
((select id from public.recipes where slug = 'che-ba-mau'), 2, 'Đậu xanh hấp chín, tán nhuyễn và nêm đường.'),
((select id from public.recipes where slug = 'che-ba-mau'), 3, 'Nấu thạch rau câu với nước lá dứa, để nguội rồi cắt sợi.'),
((select id from public.recipes where slug = 'che-ba-mau'), 4, 'Nấu nước cốt dừa với chút đường và muối.'),
((select id from public.recipes where slug = 'che-ba-mau'), 5, 'Xếp ba lớp vào ly, chan nước cốt dừa lên trên và thêm đá.');

-- rau-cau-dua — Rau câu dừa
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'rau-cau-dua', 'Rau câu dừa', 'Thạch rau câu dai giòn vị dừa tươi, mát lạnh cho ngày nóng.', '/images/recipes/rau-cau-dua.jpg',
       6, 25, 'Dễ',
       'Ảnh: Nanimo — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/20286921@N00/416152350'
from public.categories c where c.slug = 'mon-trang-mieng'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'rau-cau-dua');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'rau-cau-dua'), 1, 'Bột rau câu 10g'),
((select id from public.recipes where slug = 'rau-cau-dua'), 2, 'Nước dừa tươi 800ml'),
((select id from public.recipes where slug = 'rau-cau-dua'), 3, 'Cơm dừa non 100g'),
((select id from public.recipes where slug = 'rau-cau-dua'), 4, 'Đường 120g');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'rau-cau-dua');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'rau-cau-dua'), 1, 'Ngâm bột rau câu với nước dừa 15 phút cho nở.'),
((select id from public.recipes where slug = 'rau-cau-dua'), 2, 'Đun hỗn hợp với đường, khuấy đều cho bột tan hết.'),
((select id from public.recipes where slug = 'rau-cau-dua'), 3, 'Cho cơm dừa non vào khuôn.'),
((select id from public.recipes where slug = 'rau-cau-dua'), 4, 'Rót thạch vào khuôn, để nguội rồi làm lạnh cho thạch đông lại.');

-- banh-chuoi-nuong — Bánh chuối nướng
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'banh-chuoi-nuong', 'Bánh chuối nướng', 'Chuối chín ngọt quyện nước cốt dừa và bánh mì, nướng lên thơm bùi.', '/images/recipes/banh-chuoi-nuong.jpg',
       6, 55, 'Dễ',
       'Ảnh: Tri Nguyen | P h o t o g r a p h y — CC BY 2.0 (flickr)', 'https://www.flickr.com/photos/47615229@N06/6049207740'
from public.categories c where c.slug = 'mon-trang-mieng'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'banh-chuoi-nuong');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 1, 'Chuối chín 6 quả'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 2, 'Bánh mì 3 lát'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 3, 'Nước cốt dừa 200ml'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 4, 'Sữa đặc 100g'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 5, 'Bơ, đường, vani');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'banh-chuoi-nuong');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 1, 'Cắt chuối lát mỏng, bánh mì cắt nhỏ.'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 2, 'Trộn chuối với sữa đặc, nước cốt dừa và vani.'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 3, 'Trộn bánh mì vào hỗn hợp cho hỗn hợp kết dính.'),
((select id from public.recipes where slug = 'banh-chuoi-nuong'), 4, 'Đổ vào khuôn có phết bơ, nướng 170°C khoảng 40 phút cho mặt vàng.');

-- tra-dao-cam-sa — Trà đào cam sả
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'tra-dao-cam-sa', 'Trà đào cam sả', 'Trà đen thơm hòa cùng đào ngâm, cam tươi và sả, giải nhiệt sảng khoái.', '/images/recipes/tra-dao-cam-sa.jpg',
       3, 20, 'Dễ',
       'Ảnh: Bùi Thụy Đào Nguyên — CC BY-SA 3.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:M%E1%BB%99t_c%C3%A2y_cam.jpg'
from public.categories c where c.slug = 'do-uong'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'tra-dao-cam-sa');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 1, 'Trà đen túi lọc 2 gói'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 2, 'Đào ngâm 1 hộp'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 3, 'Cam vàng 1 quả'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 4, 'Sả 2 nhánh'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 5, 'Đường, đá viên');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'tra-dao-cam-sa');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 1, 'Hãm trà đen với nước nóng 5 phút rồi lọc bỏ bã.'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 2, 'Đập dập sả, đun với chút nước và đường cho thơm rồi lọc lấy nước sả.'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 3, 'Pha trà với nước sả và nước đào ngâm, nêm vừa ngọt.'),
((select id from public.recipes where slug = 'tra-dao-cam-sa'), 4, 'Thêm lát cam, miếng đào và đá viên trước khi dùng.');

-- sinh-to-bo — Sinh tố bơ
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'sinh-to-bo', 'Sinh tố bơ', 'Bơ sáp béo mịn xay cùng sữa đặc, thức uống bổ dưỡng cho bữa sáng.', '/images/recipes/sinh-to-bo.jpg',
       2, 10, 'Dễ',
       'Ảnh: avlxyz — CC BY-SA 2.0 (flickr)', 'https://www.flickr.com/photos/10559879@N00/3082402772'
from public.categories c where c.slug = 'do-uong'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sinh-to-bo');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'sinh-to-bo'), 1, 'Bơ sáp 2 quả'),
((select id from public.recipes where slug = 'sinh-to-bo'), 2, 'Sữa đặc 3 muỗng'),
((select id from public.recipes where slug = 'sinh-to-bo'), 3, 'Sữa tươi 200ml'),
((select id from public.recipes where slug = 'sinh-to-bo'), 4, 'Đá viên');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sinh-to-bo');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'sinh-to-bo'), 1, 'Bơ gọt vỏ, bỏ hạt, cắt miếng.'),
((select id from public.recipes where slug = 'sinh-to-bo'), 2, 'Cho bơ, sữa đặc, sữa tươi và đá vào máy xay.'),
((select id from public.recipes where slug = 'sinh-to-bo'), 3, 'Xay nhuyễn đến khi hỗn hợp mịn đều.'),
((select id from public.recipes where slug = 'sinh-to-bo'), 4, 'Rót ra ly, trang trí thêm lát bơ nếu thích.');

-- nuoc-chanh-day-hat-chia — Nước chanh dây hạt chia
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'nuoc-chanh-day-hat-chia', 'Nước chanh dây hạt chia', 'Chanh dây chua ngọt kết hợp hạt chia, uống mát và tốt cho tiêu hoá.', '/images/recipes/nuoc-chanh-day-hat-chia.jpg',
       3, 15, 'Dễ',
       'Ảnh: Victoria Rachitzky from Sao Paulo agora, Brasil — CC BY 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:Half_a_passionfruit_with_spoon.jpg'
from public.categories c where c.slug = 'do-uong'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 1, 'Chanh dây 3 quả'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 2, 'Hạt chia 1 muỗng'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 3, 'Đường hoặc mật ong 3 muỗng'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 4, 'Nước lọc 600ml'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 5, 'Đá viên');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 1, 'Ngâm hạt chia với nước 10 phút cho nở.'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 2, 'Lọc lấy nước chanh dây, giữ lại một ít hạt.'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 3, 'Pha nước chanh dây với nước lọc và đường cho vừa vị.'),
((select id from public.recipes where slug = 'nuoc-chanh-day-hat-chia'), 4, 'Cho hạt chia và đá vào, khuấy đều trước khi uống.');

-- ca-phe-sua-da — Cà phê sữa đá
insert into public.recipes (category_id, slug, title, description, image_url, servings, cook_time, difficulty, source_name, source_url)
select c.id, 'ca-phe-sua-da', 'Cà phê sữa đá', 'Cà phê phin đậm vị hòa cùng sữa đặc, thêm đá cho ly cà phê đúng điệu.', '/images/recipes/ca-phe-sua-da.jpg',
       1, 15, 'Dễ',
       'Ảnh: Simon Law from Montréal, QC, Canada — CC BY-SA 2.0 (Wikimedia Commons)', 'https://commons.wikimedia.org/wiki/File:C%C3%A0_ph%C3%AA_s%E1%BB%AFa_%C4%91%C3%A1_(509309424).jpg'
from public.categories c where c.slug = 'do-uong'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, cook_time = excluded.cook_time,
  difficulty = excluded.difficulty, source_name = excluded.source_name,
  source_url = excluded.source_url, updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ca-phe-sua-da');
insert into public.recipe_ingredients (recipe_id, position, name) values
((select id from public.recipes where slug = 'ca-phe-sua-da'), 1, 'Cà phê xay 25g'),
((select id from public.recipes where slug = 'ca-phe-sua-da'), 2, 'Sữa đặc 3 muỗng'),
((select id from public.recipes where slug = 'ca-phe-sua-da'), 3, 'Nước sôi 100ml'),
((select id from public.recipes where slug = 'ca-phe-sua-da'), 4, 'Đá viên');

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ca-phe-sua-da');
insert into public.recipe_steps (recipe_id, position, step) values
((select id from public.recipes where slug = 'ca-phe-sua-da'), 1, 'Cho cà phê vào phin, tráng qua nước sôi rồi chắt bỏ nước đầu.'),
((select id from public.recipes where slug = 'ca-phe-sua-da'), 2, 'Rót nước sôi vào phin, đậy nắp và chờ cà phê nhỏ giọt.'),
((select id from public.recipes where slug = 'ca-phe-sua-da'), 3, 'Cho sữa đặc vào ly, rót cà phê nóng vào và khuấy đều.'),
((select id from public.recipes where slug = 'ca-phe-sua-da'), 4, 'Thêm đá viên và khuấy lại trước khi dùng.');

commit;
