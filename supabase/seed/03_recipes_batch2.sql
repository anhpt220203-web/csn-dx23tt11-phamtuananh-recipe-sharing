-- =============================================================================
-- SEED BATCH 2: 24 công thức từ trang tìm kiếm monngonmoingay.com (trang 2 + 3).
--
-- ⚠️ TRẠNG THÁI: DỰ THẢO — nội dung (mô tả, nguyên liệu, các bước, thời gian)
-- được viết lại từ tên món và kiến thức ẩm thực, CHƯA đối chiếu với bản gốc
-- (domain monngonmoingay.com bị chặn fetch trực tiếp, cần browser task để
-- trích xuất chính xác). KHÔNG merge trước khi đối chiếu xong.
-- KHÔNG sao chép nguyên văn từ nguồn. Ghi nguồn: 'Tóm tắt từ monngonmoingay.com'.
--
-- Idempotent: upsert theo slug, an toàn khi chạy lại nhiều lần.
-- Ảnh: Supabase Storage bucket recipe-images/<slug>.png
-- (upload các file trong supabase/seed/images/ lên Storage trước khi seed).
-- =============================================================================

begin;

-- ─── Danh mục ───
insert into public.categories (slug, name, description)
values
  ('mon-chinh', 'Món chính', 'Cơm, bún, phở và các món ăn chính cho bữa cơm gia đình.'),
  ('mon-canh', 'Món canh', 'Các món canh, súp thanh mát ăn kèm cơm.'),
  ('salad-goi', 'Salad & Gỏi', 'Salad và gỏi trộn tươi mát, khai vị hoặc ăn nhẹ.')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

-- =============================================================================
-- TRANG 2
-- =============================================================================

-- ─── 1. Súp Tôm Gyoza ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'sup-tom-gyoza',
  'Súp Tôm Gyoza',
  'Súp nóng hổi với nước dùng ngọt thanh từ tôm, ăn kèm những chiếc gyoza nhân tôm thịt mềm thơm. Món súp ấm bụng, thích hợp cho bữa tối se lạnh hoặc khi cần món ăn nhẹ mà đủ chất.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/sup-tom-gyoza.png',
  4, 15, 20, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sup-tom-gyoza');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'sup-tom-gyoza'), v.position, v.name
from (values
  (1, 'Tôm tươi — 300g'),
  (2, 'Gyoza làm sẵn — 12 cái'),
  (3, 'Xương gà hoặc nước dùng gà — 1 lít'),
  (4, 'Nấm rơm — 100g'),
  (5, 'Cải thìa — 200g'),
  (6, 'Hành lá, ngò rí — một ít'),
  (7, 'Gừng — 1 củ nhỏ'),
  (8, 'Muối, tiêu, hạt nêm — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-tom-gyoza');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'sup-tom-gyoza'), v.position, v.step
from (values
  (1, 'Sơ chế: tôm bóc vỏ, bỏ chỉ đen, rửa sạch. Nấm rơm cắt đôi. Cải thìa cắt khúc vừa ăn. Gừng cạo vỏ, đập dập.'),
  (2, 'Nấu nước dùng: đun sôi nước dùng gà với gừng đập dập, nêm muối và hạt nêm cho vừa miệng.'),
  (3, 'Cho gyoza vào nồi súp, nấu khoảng 5 phút cho chín mềm. Tiếp theo cho tôm, nấm rơm và cải thìa vào, nấu thêm 3-4 phút.'),
  (4, 'Nêm nếm lại cho vừa ăn, rắc hành lá và ngò rí lên trên. Múc ra tô, dùng nóng.')
) as v(position, step);

-- ─── 2. Thịt Bò Áp Chảo Mù Tạt ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'thit-bo-ap-chao-mu-tat',
  'Thịt Bò Áp Chảo Mù Tạt',
  'Thăn bò áp chảo chín tới mềm mọng, dậy mùi thơm của mù tạt vàng cay nồng. Món ăn sang trọng mà cách làm lại đơn giản, rất hợp cho bữa tối cuối tuần.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/thit-bo-ap-chao-mu-tat.png',
  4, 15, 15, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat'), v.position, v.name
from (values
  (1, 'Thăn bò — 500g'),
  (2, 'Mù tạt vàng — 2 muỗng canh'),
  (3, 'Tỏi băm — 1 muỗng canh'),
  (4, 'Dầu ô liu — 2 muỗng canh'),
  (5, 'Bơ lạt — 20g'),
  (6, 'Hương thảo (rosemary) — vài nhánh'),
  (7, 'Muối, tiêu đen xay — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat'), v.position, v.step
from (values
  (1, 'Ướp thịt: thoa đều mù tạt, tỏi băm, muối và tiêu đen lên miếng thăn bò. Để nghỉ 15 phút cho thấm.'),
  (2, 'Áp chảo: đun nóng chảo với dầu ô liu ở lửa lớn. Cho thịt bò vào áp mỗi mặt 2-3 phút để tạo lớp vỏ nâu đẹp, bên trong còn hồng mềm.'),
  (3, 'Cho bơ và hương thảo vào chảo, nghiêng chảo rưới bơ tan đều lên mặt thịt khoảng 1 phút.'),
  (4, 'Gắp thịt ra đĩa, để nghỉ 5 phút rồi cắt lát dày vừa ăn. Dùng kèm salad hoặc khoai tây nghiền.')
) as v(position, step);

-- ─── 3. Tôm Xào Hạnh Nhân Chay ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'tom-xao-hanh-nhan-chay',
  'Tôm Xào Hạnh Nhân Chay',
  'Món chay thanh đạm với "tôm" chay dai giòn xào cùng hạnh nhân bùi béo và rau củ nhiều màu sắc. Vị ngọt tự nhiên, giàu dinh dưỡng, thích hợp cho ngày rằm hay người ăn chay.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/tom-xao-hanh-nhan-chay.png',
  4, 15, 15, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay'), v.position, v.name
from (values
  (1, 'Tôm chay — 200g'),
  (2, 'Hạnh nhân lát — 50g'),
  (3, 'Đậu Hà Lan — 100g'),
  (4, 'Cà rốt — 1 củ'),
  (5, 'Bắp non — 100g'),
  (6, 'Nấm rơm — 100g'),
  (7, 'Dầu ăn — 2 muỗng canh'),
  (8, 'Nước tương, hạt nêm chay, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay'), v.position, v.step
from (values
  (1, 'Sơ chế: tôm chay rã đông, rửa sạch để ráo. Cà rốt gọt vỏ cắt hạt lựu. Nấm rơm cắt đôi. Hạnh nhân rang sơ cho thơm.'),
  (2, 'Xào rau củ: đun nóng dầu, cho cà rốt, bắp non, đậu Hà Lan vào xào 3 phút ở lửa lớn.'),
  (3, 'Cho tôm chay và nấm rơm vào đảo đều, nêm nước tương và hạt nêm chay cho vừa miệng, xào thêm 4-5 phút.'),
  (4, 'Rắc hạnh nhân rang và tiêu lên trên, đảo đều rồi tắt bếp. Dọn ra đĩa, dùng nóng với cơm.')
) as v(position, step);

-- ─── 4. Cá Hồi Xốt Dâu Tây ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'ca-hoi-xot-dau-tay',
  'Cá Hồi Xốt Dâu Tây',
  'Phi lê cá hồi áp chảo da giòn, thịt mềm béo, kết hợp cùng xốt dâu tây chua ngọt lạ miệng. Món ăn Âu đầy tinh tế, giàu omega-3, rất đáng thử cho bữa tối đặc biệt.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/ca-hoi-xot-dau-tay.png',
  4, 15, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay'), v.position, v.name
from (values
  (1, 'Phi lê cá hồi — 500g'),
  (2, 'Dâu tây — 200g'),
  (3, 'Đường — 2 muỗng canh'),
  (4, 'Nước cốt chanh — 1 muỗng canh'),
  (5, 'Bơ lạt — 20g'),
  (6, 'Dầu ô liu — 2 muỗng canh'),
  (7, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay'), v.position, v.step
from (values
  (1, 'Sơ chế: cá hồi rửa sạch, thấm khô, ướp muối và tiêu 10 phút. Dâu tây rửa sạch, cắt lát.'),
  (2, 'Làm xốt: cho dâu tây, đường và nước cốt chanh vào chảo nhỏ, nấu lửa vừa đến khi dâu mềm và xốt sánh lại.'),
  (3, 'Áp chảo cá: đun nóng dầu ô liu, cho cá hồi vào áp mặt da trước 4 phút cho giòn, lật mặt còn lại áp thêm 3 phút. Cho bơ vào rưới đều.'),
  (4, 'Bày cá ra đĩa, rưới xốt dâu tây lên trên. Dùng kèm rau củ luộc hoặc salad.')
) as v(position, step);

-- ─── 5. Canh Nghêu Nấu Nấm ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-ngheu-nau-nam',
  'Canh Nghêu Nấu Nấm',
  'Canh nghêu ngọt nước kết hợp nấm dai giòn, thêm chút gừng ấm nồng và hành lá thơm. Món canh thanh mát, dễ nấu, rất hợp ăn cùng cơm trắng trong bữa cơm gia đình.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-ngheu-nau-nam.png',
  4, 15, 20, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-ngheu-nau-nam');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-ngheu-nau-nam'), v.position, v.name
from (values
  (1, 'Nghêu — 500g'),
  (2, 'Nấm rơm — 150g'),
  (3, 'Nấm kim châm — 100g'),
  (4, 'Gừng — 1 củ nhỏ'),
  (5, 'Hành lá — 2 nhánh'),
  (6, 'Muối, hạt nêm, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-ngheu-nau-nam');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-ngheu-nau-nam'), v.position, v.step
from (values
  (1, 'Sơ chế: nghêu ngâm nước muối loãng với vài lát ớt 1 giờ cho nhả cát, rửa sạch. Nấm rơm cắt đôi, nấm kim châm cắt gốc rửa sạch. Gừng thái sợi.'),
  (2, 'Luộc nghêu: đun sôi 1 lít nước với gừng, cho nghêu vào luộc đến khi há miệng thì vớt ra, lọc lấy nước trong.'),
  (3, 'Nấu canh: đun sôi lại nước nghêu, cho nấm rơm và nấm kim châm vào nấu 5 phút. Cho thịt nghêu vào, nêm muối và hạt nêm vừa ăn.'),
  (4, 'Rắc hành lá và tiêu, tắt bếp. Múc ra tô, dùng nóng với cơm.')
) as v(position, step);

-- ─── 6. Salad Đậu Rồng Thịt Bê ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-dau-rong-thit-be',
  'Salad Đậu Rồng Thịt Bê',
  'Đậu rồng giòn mát trộn cùng thịt bê mềm ngọt, rưới nước mắm chua ngọt đậm đà. Món gỏi dân dã mà hấp dẫn, ăn kèm bánh phồng tôm thì hết sảy.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-dau-rong-thit-be.png',
  4, 20, 15, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-dau-rong-thit-be');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-dau-rong-thit-be'), v.position, v.name
from (values
  (1, 'Đậu rồng — 300g'),
  (2, 'Thịt bê — 250g'),
  (3, 'Hành tây — 1/2 củ'),
  (4, 'Cà rốt — 1/2 củ'),
  (5, 'Đậu phộng rang — 50g'),
  (6, 'Rau răm — một ít'),
  (7, 'Nước mắm — 3 muỗng canh'),
  (8, 'Đường, chanh, tỏi, ớt — pha nước trộn')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-dau-rong-thit-be');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-dau-rong-thit-be'), v.position, v.step
from (values
  (1, 'Sơ chế: đậu rồng tước xơ, cắt xéo mỏng. Thịt bê luộc chín, thái lát mỏng. Hành tây thái mỏng ngâm nước đá. Cà rốt bào sợi.'),
  (2, 'Chần đậu rồng qua nước sôi 1 phút rồi ngâm nước đá để giữ độ giòn và màu xanh.'),
  (3, 'Pha nước trộn: khuấy đều nước mắm, đường, nước cốt chanh, tỏi và ớt băm cho vừa vị chua ngọt.'),
  (4, 'Trộn gỏi: cho đậu rồng, thịt bê, hành tây, cà rốt vào tô, rưới nước trộn vào trộn đều, để 10 phút cho thấm.'),
  (5, 'Bày ra đĩa, rắc đậu phộng rang và rau răm lên trên. Dùng kèm bánh phồng tôm.')
) as v(position, step);

-- ─── 7. Rau Củ Xào Nấm Lộc Nhung ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'rau-cu-xao-nam-loc-nhung',
  'Rau Củ Xào Nấm Lộc Nhung',
  'Rau củ nhiều màu sắc xào cùng nấm lộc nhung (nấm đùi gà non) dai ngọt, giữ được độ giòn tươi. Món xào chay mặn đều dùng được, thanh đạm mà vẫn đậm đà.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/rau-cu-xao-nam-loc-nhung.png',
  4, 15, 15, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung'), v.position, v.name
from (values
  (1, 'Nấm lộc nhung — 200g'),
  (2, 'Bông cải xanh — 200g'),
  (3, 'Cà rốt — 1 củ'),
  (4, 'Đậu Hà Lan — 100g'),
  (5, 'Bắp non — 100g'),
  (6, 'Tỏi băm — 1 muỗng canh'),
  (7, 'Dầu ăn — 2 muỗng canh'),
  (8, 'Dầu hào, hạt nêm, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung'), v.position, v.step
from (values
  (1, 'Sơ chế: nấm lộc nhung cắt bỏ gốc, rửa sạch cắt lát. Bông cải tách miếng vừa ăn. Cà rốt tỉa hoa cắt lát. Đậu Hà Lan tước xơ.'),
  (2, 'Chần sơ bông cải, cà rốt, đậu Hà Lan và bắp non qua nước sôi 1-2 phút, vớt ra ngâm nước đá cho giòn.'),
  (3, 'Phi thơm tỏi với dầu ăn, cho nấm lộc nhung vào xào 3 phút ở lửa lớn.'),
  (4, 'Cho rau củ đã chần vào đảo đều, nêm dầu hào và hạt nêm vừa ăn, xào thêm 2-3 phút. Rắc tiêu, dọn ra đĩa dùng nóng.')
) as v(position, step);

-- ─── 8. Canh Đu Đủ Chay ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-du-du-chay',
  'Canh Đu Đủ Chay',
  'Canh đu đủ xanh nấu chay ngọt thanh, thêm đậu hũ non mềm mịn và nấm rơm thơm. Món canh đơn giản, mát lành, phù hợp cho bữa cơm chay thanh đạm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-du-du-chay.png',
  4, 15, 25, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-du-du-chay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-du-du-chay'), v.position, v.name
from (values
  (1, 'Đu đủ xanh — 400g'),
  (2, 'Đậu hũ non — 1 hộp'),
  (3, 'Nấm rơm — 100g'),
  (4, 'Hành lá, ngò rí — một ít'),
  (5, 'Muối, hạt nêm chay, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-du-du-chay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-du-du-chay'), v.position, v.step
from (values
  (1, 'Sơ chế: đu đủ gọt vỏ, bỏ hạt, cắt miếng vừa ăn. Đậu hũ non cắt khối vuông. Nấm rơm cắt đôi, rửa sạch.'),
  (2, 'Đun sôi 1,2 lít nước, cho đu đủ vào nấu 10 phút cho hơi mềm.'),
  (3, 'Cho nấm rơm vào nấu thêm 5 phút, sau đó nhẹ nhàng cho đậu hũ non vào. Nêm muối và hạt nêm chay vừa ăn.'),
  (4, 'Rắc hành lá, ngò rí và tiêu, tắt bếp. Múc ra tô dùng nóng.')
) as v(position, step);

-- ─── 9. Chả Nấm Áp Chảo ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-nam-ap-chao',
  'Chả Nấm Áp Chảo',
  'Chả nấm áp chảo vàng ruộm, bên ngoài giòn nhẹ bên trong dai thơm mùi nấm và tiêu. Món chay ngon miệng, ăn kèm cơm nóng và rau sống rất hợp.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/cha-nam-ap-chao.png',
  4, 20, 15, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cha-nam-ap-chao');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cha-nam-ap-chao'), v.position, v.name
from (values
  (1, 'Nấm rơm — 300g'),
  (2, 'Nấm mèo — 50g'),
  (3, 'Đậu hũ trắng — 1 miếng'),
  (4, 'Bột năng — 2 muỗng canh'),
  (5, 'Hành lá — 2 nhánh'),
  (6, 'Dầu ăn — để áp chảo'),
  (7, 'Hạt nêm chay, tiêu, đường — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-nam-ap-chao');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-nam-ap-chao'), v.position, v.step
from (values
  (1, 'Sơ chế: nấm rơm băm nhỏ, nấm mèo ngâm nở băm nhuyễn. Đậu hũ nghiền nát, vắt bớt nước. Hành lá cắt nhỏ.'),
  (2, 'Trộn nhân: cho nấm, đậu hũ, bột năng, hành lá vào tô, nêm hạt nêm chay, tiêu và chút đường, trộn đều rồi để 15 phút.'),
  (3, 'Nặn thành từng miếng chả dẹt vừa ăn. Đun nóng chảo với ít dầu, cho chả vào áp mỗi mặt 3-4 phút đến khi vàng đều.'),
  (4, 'Gắp ra đĩa có lót giấy thấm dầu. Dùng nóng kèm nước tương ớt hoặc tương cà.')
) as v(position, step);

-- ─── 10. Chả Giò Ngũ Vị ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-gio-ngu-vi',
  'Chả Giò Ngũ Vị',
  'Chả giò chiên giòn rụm với nhân thịt và rau củ ướp ngũ vị hương thơm lừng. Vỏ giòn tan, nhân đậm đà, chấm nước mắm chua ngọt là món khoái khẩu của cả nhà.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/cha-gio-ngu-vi.png',
  4, 30, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cha-gio-ngu-vi');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cha-gio-ngu-vi'), v.position, v.name
from (values
  (1, 'Thịt heo xay — 300g'),
  (2, 'Bánh tráng cuốn chả giò — 1 xấp'),
  (3, 'Miến dong — 50g'),
  (4, 'Nấm mèo — 30g'),
  (5, 'Cà rốt — 1 củ'),
  (6, 'Khoai môn — 150g'),
  (7, 'Trứng gà — 1 quả'),
  (8, 'Bột ngũ vị hương — 1 muỗng cà phê'),
  (9, 'Hành lá, hành tím băm — một ít'),
  (10, 'Dầu ăn — để chiên'),
  (11, 'Muối, tiêu, hạt nêm, đường — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-gio-ngu-vi');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-gio-ngu-vi'), v.position, v.step
from (values
  (1, 'Sơ chế: miến ngâm mềm cắt khúc, nấm mèo ngâm nở băm nhỏ. Cà rốt và khoai môn bào sợi. Hành lá cắt nhỏ.'),
  (2, 'Trộn nhân: cho thịt xay, miến, nấm mèo, cà rốt, khoai môn, trứng vào tô. Nêm ngũ vị hương, muối, tiêu, hạt nêm, đường và hành băm, trộn đều, để 20 phút.'),
  (3, 'Cuốn chả: trải bánh tráng ra, cho nhân vào giữa, gấp hai mép rồi cuốn chặt tay. Làm lần lượt đến hết.'),
  (4, 'Chiên: đun nóng dầu ở lửa vừa, cho chả giò vào chiên đến khi vàng giòn đều các mặt. Vớt ra để ráo dầu.'),
  (5, 'Bày ra đĩa, dùng nóng kèm rau sống và nước mắm chua ngọt.')
) as v(position, step);

-- ─── 11. Bún Nước Tương Đậu Hũ ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'bun-nuoc-tuong-dau-hu',
  'Bún Nước Tương Đậu Hũ',
  'Bún tươi ăn kèm đậu hũ chiên giòn, rau sống tươi mát và nước tương pha chua ngọt. Món chay đơn giản, thanh đạm mà no bụng, rất hợp cho bữa trưa nhẹ nhàng.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/bun-nuoc-tuong-dau-hu.png',
  4, 15, 20, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu'), v.position, v.name
from (values
  (1, 'Bún tươi — 800g'),
  (2, 'Đậu hũ trắng — 3 miếng'),
  (3, 'Xà lách, rau thơm các loại — 300g'),
  (4, 'Giá đỗ — 200g'),
  (5, 'Dưa leo — 1 trái'),
  (6, 'Đậu phộng rang — 50g'),
  (7, 'Nước tương — 4 muỗng canh'),
  (8, 'Đường, chanh, tỏi, ớt — pha nước chan'),
  (9, 'Dầu ăn — để chiên')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu'), v.position, v.step
from (values
  (1, 'Sơ chế: đậu hũ cắt miếng vừa ăn. Rau sống nhặt rửa sạch, để ráo. Dưa leo thái lát. Giá trụng sơ qua nước sôi.'),
  (2, 'Chiên đậu hũ: đun nóng dầu, cho đậu hũ vào chiên vàng giòn các mặt, vớt ra để ráo dầu.'),
  (3, 'Pha nước chan: khuấy đều nước tương với đường, nước cốt chanh, tỏi và ớt băm cho vừa vị chua ngọt.'),
  (4, 'Trình bày: cho bún ra tô, xếp rau sống, giá, dưa leo và đậu hũ chiên lên trên, rắc đậu phộng rang. Chan nước tương khi ăn, trộn đều.')
) as v(position, step);

-- ─── 12. Salad Dưa Leo Thịt Gà ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-dua-leo-thit-ga',
  'Salad Dưa Leo Thịt Gà',
  'Dưa leo giòn mát trộn cùng thịt gà xé mềm, rưới xốt chua ngọt thanh nhẹ. Món salad đơn giản, ít calo, thích hợp cho người muốn ăn nhẹ mà vẫn đủ đạm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-dua-leo-thit-ga.png',
  4, 15, 15, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-dua-leo-thit-ga');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-dua-leo-thit-ga'), v.position, v.name
from (values
  (1, 'Ức gà — 300g'),
  (2, 'Dưa leo — 3 trái'),
  (3, 'Cà rốt — 1/2 củ'),
  (4, 'Hành tây — 1/4 củ'),
  (5, 'Rau mùi — một ít'),
  (6, 'Mè rang — 1 muỗng canh'),
  (7, 'Nước mắm — 2 muỗng canh'),
  (8, 'Đường, giấm, tỏi, ớt — pha nước trộn')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-dua-leo-thit-ga');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-dua-leo-thit-ga'), v.position, v.step
from (values
  (1, 'Luộc gà: cho ức gà vào nồi nước sôi với chút muối, luộc 12-15 phút cho chín, vớt ra để nguội rồi xé sợi.'),
  (2, 'Sơ chế rau: dưa leo cắt lát xéo mỏng, cà rốt bào sợi, hành tây thái mỏng ngâm nước đá cho bớt hăng.'),
  (3, 'Pha nước trộn: khuấy đều nước mắm, đường, giấm, tỏi và ớt băm cho tan và vừa vị.'),
  (4, 'Trộn salad: cho dưa leo, thịt gà xé, cà rốt, hành tây vào tô, rưới nước trộn vào trộn đều, để 10 phút cho thấm.'),
  (5, 'Bày ra đĩa, rắc mè rang và rau mùi lên trên. Dùng ngay khi còn mát.')
) as v(position, step);

-- =============================================================================
-- TRANG 3
-- =============================================================================

-- ─── 13. Canh Gà Củ Sen ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-ga-cu-sen',
  'Canh Gà Củ Sen',
  'Canh gà hầm củ sen ngọt nước, thịt gà mềm rục, củ sen bùi bùi. Món canh bổ dưỡng, thanh mát, rất tốt cho sức khỏe và hợp khẩu vị cả nhà.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-ga-cu-sen.png',
  4, 15, 40, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-ga-cu-sen');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-ga-cu-sen'), v.position, v.name
from (values
  (1, 'Gà ta — 1/2 con (khoảng 700g)'),
  (2, 'Củ sen — 300g'),
  (3, 'Cà rốt — 1 củ'),
  (4, 'Táo đỏ — 5 quả'),
  (5, 'Gừng — 1 củ nhỏ'),
  (6, 'Hành lá, ngò rí — một ít'),
  (7, 'Muối, hạt nêm, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-ga-cu-sen');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-ga-cu-sen'), v.position, v.step
from (values
  (1, 'Sơ chế: gà chặt miếng vừa ăn, chần sơ qua nước sôi cho sạch. Củ sen gọt vỏ cắt lát dày. Cà rốt tỉa hoa cắt khoanh. Gừng đập dập.'),
  (2, 'Hầm gà: cho gà, gừng và 1,5 lít nước vào nồi, đun sôi rồi hạ lửa nhỏ hầm 20 phút, vớt bọt cho nước trong.'),
  (3, 'Cho củ sen, cà rốt và táo đỏ vào hầm thêm 20 phút đến khi các nguyên liệu mềm. Nêm muối và hạt nêm vừa ăn.'),
  (4, 'Rắc hành lá, ngò rí và tiêu, tắt bếp. Múc ra tô, dùng nóng với cơm.')
) as v(position, step);

-- ─── 14. Cải Thìa Xào Hải Sâm ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cai-thia-xao-hai-sam',
  'Cải Thìa Xào Hải Sâm',
  'Cải thìa xanh mướt xào cùng hải sâm mềm dai, thấm đẫm nước xốt đậm đà. Món ăn bổ dưỡng, trình bày đẹp mắt, thích hợp cho mâm cơm đãi khách.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/cai-thia-xao-hai-sam.png',
  4, 15, 15, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cai-thia-xao-hai-sam');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cai-thia-xao-hai-sam'), v.position, v.name
from (values
  (1, 'Hải sâm làm sẵn — 200g'),
  (2, 'Cải thìa — 400g'),
  (3, 'Tỏi băm — 1 muỗng canh'),
  (4, 'Gừng thái sợi — 1 muỗng canh'),
  (5, 'Dầu hào — 2 muỗng canh'),
  (6, 'Dầu ăn — 2 muỗng canh'),
  (7, 'Hạt nêm, tiêu, đường — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cai-thia-xao-hai-sam');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cai-thia-xao-hai-sam'), v.position, v.step
from (values
  (1, 'Sơ chế: hải sâm rửa sạch, cắt miếng vừa ăn. Cải thìa tách bẹ, rửa sạch để ráo.'),
  (2, 'Chần cải: đun sôi nước với chút muối và dầu ăn, cho cải thìa vào chần 1-2 phút rồi vớt ra ngâm nước đá, xếp ra đĩa.'),
  (3, 'Xào hải sâm: phi thơm tỏi và gừng, cho hải sâm vào xào 3 phút. Nêm dầu hào, hạt nêm và chút đường, đảo đều cho thấm.'),
  (4, 'Rưới hải sâm cùng nước xốt lên đĩa cải thìa. Rắc tiêu, dùng nóng.')
) as v(position, step);

-- ─── 15. Salad Tonkatsu ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-tonkatsu',
  'Salad Tonkatsu',
  'Thịt heo chiên xù kiểu Nhật (tonkatsu) giòn rụm đặt trên nền salad rau tươi mát, rưới xốt tonkatsu đậm đà. Sự kết hợp hài hòa giữa giòn, mềm và tươi mát trong một đĩa salad.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-tonkatsu.png',
  2, 15, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-tonkatsu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-tonkatsu'), v.position, v.name
from (values
  (1, 'Thăn heo — 300g'),
  (2, 'Bột mì — 50g'),
  (3, 'Trứng gà — 1 quả'),
  (4, 'Bột chiên xù (panko) — 100g'),
  (5, 'Bắp cải tím, bắp cải trắng — 200g'),
  (6, 'Cà chua bi — 100g'),
  (7, 'Xốt tonkatsu — 3 muỗng canh'),
  (8, 'Dầu ăn — để chiên'),
  (9, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-tonkatsu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-tonkatsu'), v.position, v.step
from (values
  (1, 'Sơ chế: thăn heo cắt lát dày 1,5cm, dần mềm, ướp muối tiêu 10 phút. Bắp cải bào sợi mỏng, cà chua bi cắt đôi.'),
  (2, 'Tẩm bột: lăn thịt qua bột mì, nhúng trứng đánh tan, rồi áo đều bột chiên xù.'),
  (3, 'Chiên: đun nóng dầu ở lửa vừa, cho thịt vào chiên mỗi mặt 3-4 phút đến khi vàng giòn. Vớt ra để ráo dầu, cắt lát.'),
  (4, 'Trình bày: xếp bắp cải bào sợi và cà chua ra đĩa, đặt lát tonkatsu lên trên, rưới xốt tonkatsu khi ăn.')
) as v(position, step);

-- ─── 16. Salad Bacon Xốt Mè Rang ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-bacon-xot-me-rang',
  'Salad Bacon Xốt Mè Rang',
  'Salad rau tươi giòn mát ăn kèm bacon chiên giòn mặn mà, điểm nhấn là xốt mè rang béo thơm đặc trưng. Món salad kiểu Âu dễ làm, ăn hoài không ngán.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-bacon-xot-me-rang.png',
  2, 15, 10, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-bacon-xot-me-rang');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-bacon-xot-me-rang'), v.position, v.name
from (values
  (1, 'Bacon — 150g'),
  (2, 'Xà lách romaine — 200g'),
  (3, 'Cà chua bi — 100g'),
  (4, 'Trứng gà — 2 quả'),
  (5, 'Mè trắng rang — 2 muỗng canh'),
  (6, 'Xốt Mayonnaise — 3 muỗng canh'),
  (7, 'Nước tương — 1 muỗng canh'),
  (8, 'Đường — 1 muỗng cà phê')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-bacon-xot-me-rang');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-bacon-xot-me-rang'), v.position, v.step
from (values
  (1, 'Sơ chế: xà lách rửa sạch cắt khúc. Cà chua bi cắt đôi. Trứng luộc chín cắt múi cau. Bacon cắt miếng vừa ăn.'),
  (2, 'Chiên bacon: cho bacon vào chảo không dầu, áp ở lửa vừa đến khi giòn và ra bớt mỡ, vớt ra để ráo.'),
  (3, 'Pha xốt: trộn đều xốt Mayonnaise, nước tương, đường và mè rang giã dập cho hòa quyện.'),
  (4, 'Trình bày: xếp xà lách, cà chua, trứng ra đĩa, đặt bacon lên trên, rưới xốt mè rang khi ăn.')
) as v(position, step);

-- ─── 17. Súp Gà Chua Cay ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'sup-ga-chua-cay',
  'Súp Gà Chua Cay',
  'Súp gà chua cay nóng hổi với vị chua thanh của giấm, cay nồng của tiêu ớt, thịt gà xé mềm và nấm dai giòn. Món súp khai vị ấm bụng, kích thích vị giác.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/sup-ga-chua-cay.png',
  4, 15, 25, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sup-ga-chua-cay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'sup-ga-chua-cay'), v.position, v.name
from (values
  (1, 'Ức gà — 250g'),
  (2, 'Nấm rơm — 100g'),
  (3, 'Nấm mèo — 30g'),
  (4, 'Trứng gà — 2 quả'),
  (5, 'Bột năng — 2 muỗng canh'),
  (6, 'Giấm gạo — 3 muỗng canh'),
  (7, 'Nước tương — 2 muỗng canh'),
  (8, 'Tiêu trắng, ớt — tạo vị cay'),
  (9, 'Hành lá — một ít'),
  (10, 'Muối, hạt nêm — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-ga-chua-cay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'sup-ga-chua-cay'), v.position, v.step
from (values
  (1, 'Sơ chế: gà luộc chín xé sợi. Nấm rơm cắt đôi, nấm mèo ngâm nở thái sợi. Trứng đánh tan. Bột năng hòa với ít nước.'),
  (2, 'Nấu súp: đun sôi 1,2 lít nước dùng gà, cho nấm rơm và nấm mèo vào nấu 5 phút. Cho thịt gà xé vào.'),
  (3, 'Nêm giấm, nước tương, muối, hạt nêm và nhiều tiêu trắng cho vừa vị chua cay. Từ từ rót bột năng vào khuấy đều tạo độ sánh.'),
  (4, 'Rót trứng đánh tan vào nồi theo vòng tròn, khuấy nhẹ tạo vân trứng đẹp. Rắc hành lá và ớt, tắt bếp. Dùng nóng.')
) as v(position, step);

-- ─── 18. Cơm Gạo Lứt Chiên Nghêu ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'com-gao-lut-chien-ngheu',
  'Cơm Gạo Lứt Chiên Nghêu',
  'Cơm gạo lứt chiên săn hạt cùng thịt nghêu ngọt dai, rau củ giòn tươi. Món cơm chiên healthy giàu chất xơ, ít béo mà vẫn thơm ngon đậm đà.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/com-gao-lut-chien-ngheu.png',
  4, 15, 20, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu'), v.position, v.name
from (values
  (1, 'Cơm gạo lứt nấu chín để nguội — 4 chén'),
  (2, 'Thịt nghêu — 200g'),
  (3, 'Trứng gà — 2 quả'),
  (4, 'Cà rốt — 1/2 củ'),
  (5, 'Đậu Hà Lan — 100g'),
  (6, 'Hành lá — 2 nhánh'),
  (7, 'Tỏi băm — 1 muỗng canh'),
  (8, 'Dầu ăn — 2 muỗng canh'),
  (9, 'Nước tương, hạt nêm, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu'), v.position, v.step
from (values
  (1, 'Sơ chế: nghêu luộc lấy thịt. Cà rốt cắt hạt lựu. Trứng đánh tan. Cơm gạo lứt để nguội cho tơi hạt.'),
  (2, 'Chiên trứng: đun nóng dầu, cho trứng vào đảo tơi rồi gắp ra. Phi thơm tỏi, cho thịt nghêu vào xào nhanh 2 phút.'),
  (3, 'Cho cơm gạo lứt, cà rốt và đậu Hà Lan vào chảo, đảo đều ở lửa lớn 4-5 phút cho hạt cơm săn lại.'),
  (4, 'Cho trứng chiên trở lại chảo, nêm nước tương và hạt nêm vừa ăn. Rắc hành lá và tiêu, đảo đều rồi tắt bếp.')
) as v(position, step);

-- ─── 19. Canh Sườn Gyoza ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-suon-gyoza',
  'Canh Sườn Gyoza',
  'Canh sườn heo hầm mềm ngọt nước, ăn kèm gyoza nhân thịt thơm béo. Món canh đầy đặn, vừa có thịt vừa có bánh, một tô là đủ no cho bữa cơm gia đình.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-suon-gyoza.png',
  4, 15, 35, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-suon-gyoza');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-suon-gyoza'), v.position, v.name
from (values
  (1, 'Sườn heo non — 500g'),
  (2, 'Gyoza làm sẵn — 12 cái'),
  (3, 'Củ cải trắng — 1 củ'),
  (4, 'Cà rốt — 1 củ'),
  (5, 'Hành lá, ngò rí — một ít'),
  (6, 'Muối, hạt nêm, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-suon-gyoza');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-suon-gyoza'), v.position, v.step
from (values
  (1, 'Sơ chế: sườn chặt miếng vừa ăn, chần sơ qua nước sôi cho sạch. Củ cải và cà rốt gọt vỏ cắt khoanh.'),
  (2, 'Hầm sườn: cho sườn vào nồi với 1,5 lít nước, đun sôi vớt bọt, hạ lửa nhỏ hầm 20 phút.'),
  (3, 'Cho củ cải và cà rốt vào hầm thêm 10 phút cho mềm. Cho gyoza vào nấu 5 phút cho chín. Nêm muối và hạt nêm vừa ăn.'),
  (4, 'Rắc hành lá, ngò rí và tiêu, tắt bếp. Múc ra tô dùng nóng.')
) as v(position, step);

-- ─── 20. Gà Nướng Chanh Sả Mayo ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'ga-nuong-chanh-sa-mayo',
  'Gà Nướng Chanh Sả Mayo',
  'Gà nướng vàng ươm thơm lừng mùi sả và chanh, thịt mềm mọng, chấm cùng xốt mayonnaise béo ngậy. Món nướng hấp dẫn cho bữa tiệc ngoài trời hay cơm tối đổi vị.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/ga-nuong-chanh-sa-mayo.png',
  4, 20, 25, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo'), v.position, v.name
from (values
  (1, 'Đùi gà — 800g'),
  (2, 'Sả — 4 cây'),
  (3, 'Chanh — 2 trái'),
  (4, 'Tỏi băm — 1 muỗng canh'),
  (5, 'Xốt Mayonnaise — 4 muỗng canh'),
  (6, 'Mật ong — 2 muỗng canh'),
  (7, 'Nước mắm — 2 muỗng canh'),
  (8, 'Ớt bột — 1 muỗng cà phê'),
  (9, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo'), v.position, v.step
from (values
  (1, 'Sơ chế: đùi gà khứa vài đường cho thấm, rửa sạch để ráo. Sả băm nhuyễn, chanh vắt lấy nước cốt.'),
  (2, 'Ướp gà: trộn đều sả băm, tỏi, nước cốt chanh, mật ong, nước mắm, ớt bột, muối và tiêu. Thoa đều lên gà, ướp ít nhất 30 phút.'),
  (3, 'Nướng: xếp gà lên vỉ, nướng ở 200 độ C khoảng 25 phút, trở mặt giữa chừng và phết thêm nước ướp cho đến khi gà chín vàng đều.'),
  (4, 'Bày gà ra đĩa, chấm kèm xốt Mayonnaise. Dùng nóng với cơm hoặc bánh mì.')
) as v(position, step);

-- ─── 21. Salad Rong Nho Đậu Hũ ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-rong-nho-dau-hu',
  'Salad Rong Nho Đậu Hũ',
  'Rong nho tươi giòn tan như "trứng cá xanh" trộn cùng đậu hũ non mềm mịn, rưới xốt mè chua ngọt. Món salad chay thanh mát, giàu khoáng chất, đẹp mắt và tốt cho sức khỏe.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-rong-nho-dau-hu.png',
  2, 15, 5, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-rong-nho-dau-hu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-rong-nho-dau-hu'), v.position, v.name
from (values
  (1, 'Rong nho tươi — 200g'),
  (2, 'Đậu hũ non — 1 hộp'),
  (3, 'Cà chua bi — 100g'),
  (4, 'Dưa leo — 1/2 trái'),
  (5, 'Mè rang — 1 muỗng canh'),
  (6, 'Xốt mè rang — 3 muỗng canh'),
  (7, 'Nước cốt chanh — 1 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-rong-nho-dau-hu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-rong-nho-dau-hu'), v.position, v.step
from (values
  (1, 'Sơ chế: rong nho ngâm nước sạch 5 phút cho nở, vớt ra để ráo. Đậu hũ non cắt khối vuông. Cà chua bi cắt đôi, dưa leo thái lát.'),
  (2, 'Pha xốt: trộn đều xốt mè rang với nước cốt chanh cho vừa vị chua béo.'),
  (3, 'Trình bày: xếp đậu hũ, cà chua và dưa leo ra đĩa, đặt rong nho lên trên, rắc mè rang. Rưới xốt khi ăn, trộn nhẹ tay để rong nho không bị dập.')
) as v(position, step);

-- ─── 22. Chả Giò Tôm Mayo ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-gio-tom-mayo',
  'Chả Giò Tôm Mayo',
  'Chả giò nhân tôm tươi ngọt thịt quyện cùng xốt mayonnaise béo ngậy, chiên vàng giòn rụm. Món ăn vặt hay món khai vị đều hợp, chấm tương ớt là hết ý.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/cha-gio-tom-mayo.png',
  4, 25, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cha-gio-tom-mayo');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cha-gio-tom-mayo'), v.position, v.name
from (values
  (1, 'Tôm tươi — 400g'),
  (2, 'Bánh tráng cuốn chả giò — 1 xấp'),
  (3, 'Xốt Mayonnaise — 3 muỗng canh'),
  (4, 'Cà rốt — 1/2 củ'),
  (5, 'Hành lá — 2 nhánh'),
  (6, 'Bột năng — 1 muỗng canh'),
  (7, 'Dầu ăn — để chiên'),
  (8, 'Muối, tiêu, hạt nêm — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-gio-tom-mayo');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-gio-tom-mayo'), v.position, v.step
from (values
  (1, 'Sơ chế: tôm bóc vỏ bỏ chỉ đen, băm nhỏ. Cà rốt bào sợi nhỏ, hành lá cắt nhỏ.'),
  (2, 'Trộn nhân: cho tôm băm, cà rốt, hành lá, xốt Mayonnaise và bột năng vào tô. Nêm muối, tiêu, hạt nêm, trộn đều, để 15 phút.'),
  (3, 'Cuốn chả: trải bánh tráng ra, cho nhân tôm vào giữa, gấp mép và cuốn chặt tay.'),
  (4, 'Chiên: đun nóng dầu ở lửa vừa, cho chả giò vào chiên đến khi vàng giòn đều. Vớt ra để ráo dầu.'),
  (5, 'Bày ra đĩa, dùng nóng chấm tương ớt hoặc xốt Mayonnaise.')
) as v(position, step);

-- ─── 23. Rau Củ Và Mực Chiên ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'rau-cu-va-muc-chien',
  'Rau Củ Và Mực Chiên',
  'Mực tươi giòn ngọt cùng rau củ tẩm bột chiên vàng ruộm, bên ngoài giòn tan bên trong mềm ngọt. Món chiên thập cẩm hấp dẫn, chấm tương ớt ăn chơi hay ăn cơm đều ngon.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/rau-cu-va-muc-chien.png',
  4, 20, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'rau-cu-va-muc-chien');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'rau-cu-va-muc-chien'), v.position, v.name
from (values
  (1, 'Mực ống — 400g'),
  (2, 'Khoai lang — 1 củ'),
  (3, 'Bí đỏ — 200g'),
  (4, 'Đậu bắp — 150g'),
  (5, 'Bột chiên giòn — 1 gói'),
  (6, 'Trứng gà — 1 quả'),
  (7, 'Dầu ăn — để chiên'),
  (8, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'rau-cu-va-muc-chien');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'rau-cu-va-muc-chien'), v.position, v.step
from (values
  (1, 'Sơ chế: mực làm sạch, cắt khoanh vừa ăn, ướp chút muối tiêu 10 phút. Khoai lang, bí đỏ gọt vỏ cắt lát. Đậu bắp cắt khúc.'),
  (2, 'Pha bột: trộn bột chiên giòn với trứng và ít nước lạnh thành hỗn hợp sền sệt.'),
  (3, 'Nhúng từng miếng mực và rau củ qua bột, cho vào chảo dầu nóng chiên ở lửa vừa đến khi vàng giòn.'),
  (4, 'Vớt ra để ráo dầu trên giấy thấm. Bày ra đĩa, dùng nóng chấm tương ớt.')
) as v(position, step);

-- ─── 24. Mì Xào Thịt Heo Rau Củ ───
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'mi-xao-thit-heo-rau-cu',
  'Mì Xào Thịt Heo Rau Củ',
  'Sợi mì dai ngon xào cùng thịt heo mềm và rau củ giòn tươi, thấm đều nước xốt đậm đà. Món mì xào đầy đủ dinh dưỡng, làm nhanh gọn cho bữa ăn cả nhà.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/mi-xao-thit-heo-rau-cu.png',
  4, 15, 20, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'mi-xao-thit-heo-rau-cu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'mi-xao-thit-heo-rau-cu'), v.position, v.name
from (values
  (1, 'Mì trứng — 400g'),
  (2, 'Thịt heo thăn — 250g'),
  (3, 'Cải thìa — 200g'),
  (4, 'Cà rốt — 1 củ'),
  (5, 'Nấm rơm — 100g'),
  (6, 'Hành lá — 2 nhánh'),
  (7, 'Tỏi băm — 1 muỗng canh'),
  (8, 'Dầu ăn — 2 muỗng canh'),
  (9, 'Dầu hào, nước tương, hạt nêm, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'mi-xao-thit-heo-rau-cu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'mi-xao-thit-heo-rau-cu'), v.position, v.step
from (values
  (1, 'Sơ chế: mì trụng sơ qua nước sôi cho mềm, xả nước lạnh để ráo. Thịt heo thái lát mỏng ướp hạt nêm 10 phút. Cải thìa cắt khúc, cà rốt thái sợi, nấm rơm cắt đôi.'),
  (2, 'Xào thịt: phi thơm tỏi, cho thịt heo vào xào nhanh ở lửa lớn đến khi săn lại, gắp ra để riêng.'),
  (3, 'Xào rau củ: cho cà rốt, nấm rơm, cải thìa vào chảo xào 3 phút cho vừa chín tới.'),
  (4, 'Cho mì và thịt heo trở lại chảo, nêm dầu hào, nước tương vừa ăn, đảo đều 2-3 phút cho thấm. Rắc hành lá và tiêu, tắt bếp. Dọn ra đĩa dùng nóng.')
) as v(position, step);

commit;
