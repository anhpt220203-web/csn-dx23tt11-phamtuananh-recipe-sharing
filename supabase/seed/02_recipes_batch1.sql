-- =============================================================================
-- SEED BATCH 1: 12 công thức từ trang tìm kiếm monngonmoingay.com (trang 1).
-- Nội dung VIẾT LẠI hoàn toàn bằng lời của mình (mô tả, nguyên liệu, các bước),
-- KHÔNG sao chép nguyên văn từ nguồn. Ghi nguồn: 'Tóm tắt từ monngonmoingay.com'.
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
-- 1. Salad Bông Cải Trộn Tôm Bắp
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-bong-cai-tron-tom-bap',
  'Salad Bông Cải Trộn Tôm Bắp',
  'Bông cải xanh giòn ngọt trộn cùng tôm tươi và bắp hạt, rưới xốt chua ngọt thanh mát. Món salad đầy màu sắc, giàu chất xơ, thích hợp làm món khai vị hoặc ăn nhẹ giữ dáng.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-bong-cai-tron-tom-bap.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-bong-cai-tron-tom-bap');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-bong-cai-tron-tom-bap'), v.position, v.name
from (values
  (1, 'Bông cải xanh — 300g'),
  (2, 'Tôm tươi — 200g'),
  (3, 'Bắp ngọt — 1 trái'),
  (4, 'Cà rốt — 1/2 củ'),
  (5, 'Xốt Mayonnaise — 3 muỗng canh'),
  (6, 'Sữa đặc — 1 muỗng canh'),
  (7, 'Nước cốt chanh — 1 muỗng canh'),
  (8, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-bong-cai-tron-tom-bap');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-bong-cai-tron-tom-bap'), v.position, v.step
from (values
  (1, 'Sơ chế: bông cải tách miếng vừa ăn, ngâm nước muối loãng rồi rửa sạch. Tôm bóc vỏ, bỏ chỉ đen. Bắp tách hạt. Cà rốt gọt vỏ, cắt hạt lựu.'),
  (2, 'Luộc chín: đun sôi nước, cho bông cải và cà rốt vào chần khoảng 2-3 phút cho vừa chín tới, vớt ra ngâm nước đá để giữ màu xanh và độ giòn. Luộc tôm và bắp hạt cho chín, để ráo.'),
  (3, 'Pha xốt: trộn đều xốt Mayonnaise với sữa đặc, nước cốt chanh, chút muối và tiêu cho vừa miệng.'),
  (4, 'Trộn salad: cho tất cả nguyên liệu đã luộc vào tô lớn, rưới xốt lên, trộn nhẹ tay cho thấm đều.'),
  (5, 'Trình bày ra đĩa, dùng ngay khi còn mát sẽ ngon nhất.')
) as v(position, step);

-- =============================================================================
-- 2. Đậu Hũ Nhồi Xốt Me
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'dau-hu-nhoi-xot-me',
  'Đậu Hũ Nhồi Xốt Me',
  'Miếng đậu hũ vàng ươm nhồi nhân thịt băm đậm đà, chan xốt me chua ngọt sánh mịn. Món ăn dân dã mà hấp dẫn, vị chua thanh của me quyện với đậu béo bùi, ăn với cơm nóng rất đưa cơm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/dau-hu-nhoi-xot-me.png',
  3, 20, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'dau-hu-nhoi-xot-me');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'dau-hu-nhoi-xot-me'), v.position, v.name
from (values
  (1, 'Đậu hũ trắng — 4 miếng'),
  (2, 'Thịt heo băm — 200g'),
  (3, 'Nấm mèo — 20g'),
  (4, 'Me vắt — 50g'),
  (5, 'Hành tím băm — 1 muỗng canh'),
  (6, 'Tỏi băm — 1 muỗng cà phê'),
  (7, 'Hành lá — 2 nhánh'),
  (8, 'Đường, nước mắm, tiêu — nêm nếm'),
  (9, 'Dầu ăn — để chiên')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'dau-hu-nhoi-xot-me');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'dau-hu-nhoi-xot-me'), v.position, v.step
from (values
  (1, 'Sơ chế: nấm mèo ngâm nở, băm nhỏ. Hành lá cắt nhỏ. Me vắt dằm với nước ấm, lọc lấy nước cốt.'),
  (2, 'Làm nhân: trộn thịt băm với nấm mèo, hành lá, chút muối, tiêu và nước mắm cho đều, ướp 10 phút.'),
  (3, 'Nhồi đậu: đậu hũ cắt miếng vuông, khoét một mặt tạo hốc, nhồi nhân thịt vào đầy.'),
  (4, 'Chiên đậu: đun nóng dầu, cho đậu đã nhồi vào chiên vàng đều các mặt, vớt ra để ráo dầu.'),
  (5, 'Làm xốt me: phi thơm hành tỏi, cho nước cốt me vào, nêm đường và nước mắm cho vừa vị chua ngọt, đun sánh lại.'),
  (6, 'Xếp đậu ra đĩa, rưới xốt me lên trên, rắc thêm hành lá. Dùng nóng với cơm.')
) as v(position, step);

-- =============================================================================
-- 3. Canh Lươn Nấu Cải Chua
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-luon-nau-cai-chua',
  'Canh Lươn Nấu Cải Chua',
  'Thịt lươn dai ngọt nấu cùng cải chua giòn giòn trong nước dùng chua thanh. Món canh đậm chất miền quê, vừa bổ dưỡng vừa kích thích vị giác, ăn nóng với cơm rất ngon.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-luon-nau-cai-chua.png',
  4, 25, 25, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-luon-nau-cai-chua');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-luon-nau-cai-chua'), v.position, v.name
from (values
  (1, 'Lươn — 400g'),
  (2, 'Cải chua — 300g'),
  (3, 'Cà chua — 2 trái'),
  (4, 'Hành tím — 2 củ'),
  (5, 'Ớt hiểm — 1 trái'),
  (6, 'Rau ngổ, ngò gai — một ít'),
  (7, 'Nước mắm, muối, đường, bột ngọt — nêm nếm'),
  (8, 'Dầu ăn — 1 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-luon-nau-cai-chua');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-luon-nau-cai-chua'), v.position, v.step
from (values
  (1, 'Sơ chế lươn: làm sạch nhớt bằng muối và giấm, rửa kỹ, cắt khúc vừa ăn. Ướp lươn với chút muối và tiêu khoảng 10 phút.'),
  (2, 'Sơ chế rau: cải chua rửa sạch, vắt ráo, cắt khúc. Cà chua cắt múi cau. Hành tím băm nhỏ.'),
  (3, 'Xào thơm: phi hành tím với dầu ăn, cho lươn vào xào săn lại.'),
  (4, 'Nấu canh: đổ khoảng 1 lít nước vào nồi, đun sôi rồi cho cải chua và cà chua vào. Nêm nước mắm, muối, đường cho vừa vị chua mặn hài hòa.'),
  (5, 'Hoàn thành: nấu thêm 5 phút cho cải mềm, cho ớt và rau ngổ, ngò gai vào rồi tắt bếp. Múc ra tô, dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 4. Salad Ức Gà Xốt Việt Quất
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-uc-ga-xot-viet-quat',
  'Salad Ức Gà Xốt Việt Quất',
  'Ức gà áp chảo mềm ngọt ăn kèm rau xanh tươi mát, điểm nhấn là xốt việt quất chua ngọt lạ miệng. Món salad giàu đạm, ít béo, phù hợp cho người ăn kiêng mà vẫn đầy đủ dinh dưỡng.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-uc-ga-xot-viet-quat.png',
  2, 15, 15, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-uc-ga-xot-viet-quat');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-uc-ga-xot-viet-quat'), v.position, v.name
from (values
  (1, 'Ức gà — 300g'),
  (2, 'Xà lách các loại — 150g'),
  (3, 'Việt quất tươi — 80g'),
  (4, 'Hạt óc chó — 30g'),
  (5, 'Dầu ô liu — 2 muỗng canh'),
  (6, 'Mật ong — 1 muỗng canh'),
  (7, 'Giấm táo — 1 muỗng canh'),
  (8, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-uc-ga-xot-viet-quat');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-uc-ga-xot-viet-quat'), v.position, v.step
from (values
  (1, 'Sơ chế: ức gà rửa sạch, thấm khô, ướp muối và tiêu 10 phút. Rau xà lách rửa sạch, để ráo.'),
  (2, 'Áp chảo gà: đun nóng chảo với chút dầu ô liu, cho ức gà vào áp mỗi mặt khoảng 5-6 phút đến khi chín vàng, để nghỉ 5 phút rồi cắt lát mỏng.'),
  (3, 'Làm xốt: dằm nhuyễn một nửa việt quất, trộn với dầu ô liu, mật ong, giấm táo và chút muối.'),
  (4, 'Trình bày: xếp rau ra đĩa, đặt gà cắt lát lên trên, rưới xốt việt quất, rắc hạt óc chó và việt quất còn lại. Dùng ngay.')
) as v(position, step);

-- =============================================================================
-- 5. Súp Gyoza Miso Cay
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'sup-gyoza-miso-cay',
  'Súp Gyoza Miso Cay',
  'Nước súp miso đậm đà vị cay nhẹ, thả những chiếc gyoza nhân thịt mềm thơm cùng rau củ. Món súp kiểu Nhật biến tấu, ấm bụng và lạ miệng, thích hợp cho bữa tối se lạnh.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/sup-gyoza-miso-cay.png',
  3, 20, 20, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sup-gyoza-miso-cay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'sup-gyoza-miso-cay'), v.position, v.name
from (values
  (1, 'Gyoza làm sẵn — 12 cái'),
  (2, 'Tương miso — 3 muỗng canh'),
  (3, 'Nước dùng gà — 1 lít'),
  (4, 'Nấm đông cô — 100g'),
  (5, 'Cải thìa — 200g'),
  (6, 'Tỏi băm — 1 muỗng cà phê'),
  (7, 'Gừng băm — 1 muỗng cà phê'),
  (8, 'Ớt bột Hàn Quốc — 1 muỗng cà phê'),
  (9, 'Hành lá — 2 nhánh'),
  (10, 'Dầu mè — 1 muỗng cà phê')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-gyoza-miso-cay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'sup-gyoza-miso-cay'), v.position, v.step
from (values
  (1, 'Sơ chế: nấm đông cô cắt lát, cải thìa cắt khúc, hành lá cắt nhỏ.'),
  (2, 'Xào thơm: phi tỏi và gừng với chút dầu, cho ớt bột vào đảo nhanh tay.'),
  (3, 'Nấu súp: đổ nước dùng gà vào, đun sôi rồi cho nấm và cải thìa vào nấu 5 phút.'),
  (4, 'Nêm miso: múc một vá nước súp hòa tan tương miso rồi đổ lại vào nồi, khuấy đều. Thả gyoza vào, nấu thêm 4-5 phút cho gyoza chín nổi lên.'),
  (5, 'Hoàn thành: nêm lại cho vừa miệng, rưới dầu mè, rắc hành lá. Múc ra tô, dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 6. Sườn Cọng Nướng Rau Củ
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'suon-cong-nuong-rau-cu',
  'Sườn Cọng Nướng Rau Củ',
  'Sườn cọng ướp đậm đà nướng xém cạnh thơm phức, ăn kèm rau củ nướng ngọt tự nhiên. Món nướng hấp dẫn cho bữa tiệc cuối tuần, thịt mềm róc xương quyện vị rau củ tươi ngon.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/suon-cong-nuong-rau-cu.png',
  4, 30, 40, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'suon-cong-nuong-rau-cu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'suon-cong-nuong-rau-cu'), v.position, v.name
from (values
  (1, 'Sườn cọng — 800g'),
  (2, 'Khoai tây — 2 củ'),
  (3, 'Cà rốt — 1 củ'),
  (4, 'Bông cải xanh — 200g'),
  (5, 'Hành tây — 1 củ'),
  (6, 'Tỏi băm — 1 muỗng canh'),
  (7, 'Mật ong — 2 muỗng canh'),
  (8, 'Nước tương — 3 muỗng canh'),
  (9, 'Dầu hào — 2 muỗng canh'),
  (10, 'Tiêu, ngũ vị hương — nêm nếm'),
  (11, 'Dầu ô liu — 2 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'suon-cong-nuong-rau-cu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'suon-cong-nuong-rau-cu'), v.position, v.step
from (values
  (1, 'Sơ chế: sườn rửa sạch, chặt miếng vừa ăn, chần qua nước sôi để loại bỏ bọt bẩn. Rau củ gọt vỏ, cắt miếng vừa.'),
  (2, 'Ướp sườn: trộn sườn với tỏi băm, mật ong, nước tương, dầu hào, tiêu và ngũ vị hương. Ướp ít nhất 30 phút (ngon nhất ướp 2 tiếng trong tủ lạnh).'),
  (3, 'Ướp rau củ: trộn rau củ với dầu ô liu, chút muối và tiêu.'),
  (4, 'Nướng: làm nóng lò 200°C. Xếp sườn và rau củ lên khay có lót giấy nến. Nướng 35-40 phút, trở mặt giữa chừng và phết thêm nước ướp cho đến khi sườn xém vàng.'),
  (5, 'Trình bày ra đĩa lớn, dùng nóng kèm cơm hoặc bánh mì.')
) as v(position, step);

-- =============================================================================
-- 7. Thịt Bò Xào Đậu Rồng Sa Tế
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'thit-bo-xao-dau-rong-sa-te',
  'Thịt Bò Xào Đậu Rồng Sa Tế',
  'Thịt bò mềm xào nhanh tay với đậu rồng giòn ngọt, thấm vị sa tế cay thơm đặc trưng. Món xào đậm đà, màu sắc bắt mắt, ăn với cơm trắng nóng hổi rất hao cơm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/thit-bo-xao-dau-rong-sa-te.png',
  3, 15, 10, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'thit-bo-xao-dau-rong-sa-te');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'thit-bo-xao-dau-rong-sa-te'), v.position, v.name
from (values
  (1, 'Thịt bò thăn — 300g'),
  (2, 'Đậu rồng — 250g'),
  (3, 'Sa tế — 2 muỗng canh'),
  (4, 'Tỏi băm — 1 muỗng canh'),
  (5, 'Ớt sừng — 1 trái'),
  (6, 'Nước tương — 1 muỗng canh'),
  (7, 'Dầu hào — 1 muỗng canh'),
  (8, 'Đường — 1 muỗng cà phê'),
  (9, 'Dầu ăn — 2 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'thit-bo-xao-dau-rong-sa-te');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'thit-bo-xao-dau-rong-sa-te'), v.position, v.step
from (values
  (1, 'Sơ chế: thịt bò cắt lát mỏng ngang thớ, ướp với nước tương, dầu hào, đường và chút dầu ăn 10 phút. Đậu rồng tước xơ, cắt xéo miếng vừa ăn. Ớt sừng cắt lát.'),
  (2, 'Xào bò: đun nóng chảo với dầu ăn, phi thơm tỏi, cho thịt bò vào xào nhanh trên lửa lớn đến khi vừa chín tái thì trút ra đĩa.'),
  (3, 'Xào đậu: cho thêm chút dầu vào chảo, cho đậu rồng và sa tế vào xào khoảng 2-3 phút cho đậu vừa chín tới vẫn giữ độ giòn.'),
  (4, 'Hoàn thành: cho thịt bò trở lại chảo, đảo đều với ớt sừng khoảng 1 phút, nêm lại cho vừa miệng rồi tắt bếp. Dọn ra đĩa, dùng nóng với cơm.')
) as v(position, step);

-- =============================================================================
-- 8. Gyoza Chiên Giòn
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'gyoza-chien-gion',
  'Gyoza Chiên Giòn',
  'Những chiếc gyoza vỏ giòn rụm, nhân thịt rau củ đậm đà, chấm cùng nước tương giấm chua ngọt. Món ăn vặt kiểu Nhật được nhiều người yêu thích, làm tại nhà đơn giản mà ngon không kém ngoài hàng.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/gyoza-chien-gion.png',
  4, 30, 15, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'gyoza-chien-gion');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'gyoza-chien-gion'), v.position, v.name
from (values
  (1, 'Vỏ gyoza làm sẵn — 30 cái'),
  (2, 'Thịt heo băm — 300g'),
  (3, 'Bắp cải — 200g'),
  (4, 'Hẹ — 50g'),
  (5, 'Gừng băm — 1 muỗng cà phê'),
  (6, 'Nước tương — 1 muỗng canh'),
  (7, 'Dầu mè — 1 muỗng canh'),
  (8, 'Muối, tiêu — nêm nếm'),
  (9, 'Dầu ăn — để chiên'),
  (10, 'Giấm đen, nước tương — làm nước chấm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'gyoza-chien-gion');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'gyoza-chien-gion'), v.position, v.step
from (values
  (1, 'Làm nhân: bắp cải băm nhỏ, vắt ráo nước. Trộn thịt băm với bắp cải, hẹ cắt nhỏ, gừng, nước tương, dầu mè, muối tiêu cho đều, ướp 15 phút.'),
  (2, 'Gói gyoza: đặt một muỗng nhân vào giữa vỏ bánh, thấm nước viền bánh rồi gấp đôi, xếp ly mép bánh cho kín.'),
  (3, 'Chiên: đun nóng dầu trong chảo chống dính, xếp gyoza vào chiên mặt đáy vàng giòn khoảng 2-3 phút.'),
  (4, 'Hấp: đổ khoảng 1/3 chén nước vào chảo, đậy nắp hấp 4-5 phút cho nhân chín. Mở nắp, chiên thêm 1-2 phút cho đáy giòn lại.'),
  (5, 'Pha nước chấm: trộn nước tương với giấm đen theo tỉ lệ 2:1. Xếp gyoza ra đĩa, dùng nóng kèm nước chấm.')
) as v(position, step);

-- =============================================================================
-- 9. Canh Mồng Tơi Tôm Bắp
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-mong-toi-tom-bap',
  'Canh Mồng Tơi Tôm Bắp',
  'Canh mồng tơi nấu tôm ngọt thanh, thêm bắp hạt giòn ngọt tạo vị lạ miệng. Món canh dân dã, mát lành, giàu vitamin, là lựa chọn tuyệt vời cho bữa cơm gia đình ngày hè.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-mong-toi-tom-bap.png',
  4, 15, 15, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-mong-toi-tom-bap');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-mong-toi-tom-bap'), v.position, v.name
from (values
  (1, 'Rau mồng tơi — 300g'),
  (2, 'Tôm tươi — 200g'),
  (3, 'Bắp ngọt — 1 trái'),
  (4, 'Hành tím — 1 củ'),
  (5, 'Muối, bột ngọt — nêm nếm'),
  (6, 'Dầu ăn — 1 muỗng cà phê')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-mong-toi-tom-bap');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-mong-toi-tom-bap'), v.position, v.step
from (values
  (1, 'Sơ chế: rau mồng tơi nhặt lấy lá non, rửa sạch. Tôm bóc vỏ, bỏ chỉ đen, giã hoặc băm sơ. Bắp tách hạt. Hành tím băm nhỏ.'),
  (2, 'Xào tôm: phi thơm hành tím với chút dầu, cho tôm vào xào săn.'),
  (3, 'Nấu canh: đổ khoảng 1 lít nước vào, đun sôi rồi cho bắp hạt vào nấu 5 phút.'),
  (4, 'Hoàn thành: cho rau mồng tơi vào, nêm muối và bột ngọt vừa ăn, nấu thêm 2-3 phút cho rau vừa chín tới thì tắt bếp. Múc ra tô, dùng nóng với cơm.')
) as v(position, step);

-- =============================================================================
-- 10. Canh Cá Tầm Vị Thái
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-ca-tam-vi-thai',
  'Canh Cá Tầm Vị Thái',
  'Cá tầm thịt chắc ngọt nấu trong nước dùng chua cay đậm chất Thái với sả, riềng, lá chanh. Món canh lạ miệng, thơm nồng, vừa bổ dưỡng vừa kích thích vị giác.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-ca-tam-vi-thai.png',
  4, 20, 25, 'Trung bình', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-canh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-ca-tam-vi-thai');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-ca-tam-vi-thai'), v.position, v.name
from (values
  (1, 'Cá tầm — 500g'),
  (2, 'Sả — 3 cây'),
  (3, 'Riềng — 1 củ nhỏ'),
  (4, 'Lá chanh — 5 lá'),
  (5, 'Cà chua — 2 trái'),
  (6, 'Nấm rơm — 150g'),
  (7, 'Ớt hiểm — 2 trái'),
  (8, 'Nước cốt chanh — 2 muỗng canh'),
  (9, 'Nước mắm — 2 muỗng canh'),
  (10, 'Đường — 1 muỗng cà phê'),
  (11, 'Rau ngò — một ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-ca-tam-vi-thai');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-ca-tam-vi-thai'), v.position, v.step
from (values
  (1, 'Sơ chế: cá tầm làm sạch, cắt khúc vừa ăn, ướp chút muối 10 phút. Sả đập dập cắt khúc, riềng cắt lát, lá chanh vò nhẹ. Cà chua cắt múi, nấm rơm cắt đôi.'),
  (2, 'Nấu nước dùng: đun sôi khoảng 1.2 lít nước, cho sả, riềng, lá chanh vào nấu 5 phút cho thơm.'),
  (3, 'Cho cá: thả cá tầm vào, nấu khoảng 8-10 phút cho cá chín. Vớt bọt để nước trong.'),
  (4, 'Thêm rau củ: cho cà chua, nấm rơm và ớt vào, nấu thêm 5 phút.'),
  (5, 'Nêm nếm: nêm nước mắm, đường cho vừa vị mặn ngọt, tắt bếp rồi mới cho nước cốt chanh vào để giữ vị chua thanh. Rắc rau ngò, múc ra tô dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 11. Chả Giò Sò Điệp Xốt Trứng Muối
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-gio-so-diep-xot-trung-muoi',
  'Chả Giò Sò Điệp Xốt Trứng Muối',
  'Chả giò giòn tan nhân sò điệp ngọt thịt, chấm xốt trứng muối béo ngậy mặn mà. Món khai vị sang trọng, hấp dẫn từ hình thức đến hương vị, thích hợp cho bữa tiệc gia đình.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/cha-gio-so-diep-xot-trung-muoi.png',
  4, 30, 20, 'Khó', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'mon-chinh'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cha-gio-so-diep-xot-trung-muoi');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cha-gio-so-diep-xot-trung-muoi'), v.position, v.name
from (values
  (1, 'Sò điệp — 300g'),
  (2, 'Thịt heo băm — 150g'),
  (3, 'Bánh tráng bò bía — 20 cái'),
  (4, 'Trứng muối — 4 quả (lấy lòng đỏ)'),
  (5, 'Cà rốt — 1/2 củ'),
  (6, 'Nấm mèo — 20g'),
  (7, 'Miến — 50g'),
  (8, 'Hành lá — 2 nhánh'),
  (9, 'Xốt Mayonnaise — 3 muỗng canh'),
  (10, 'Muối, tiêu, đường — nêm nếm'),
  (11, 'Dầu ăn — để chiên')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-gio-so-diep-xot-trung-muoi');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-gio-so-diep-xot-trung-muoi'), v.position, v.step
from (values
  (1, 'Sơ chế: sò điệp rửa sạch, thấm khô, cắt hạt lựu. Nấm mèo ngâm nở băm nhỏ. Miến ngâm mềm cắt ngắn. Cà rốt bào sợi. Hành lá cắt nhỏ.'),
  (2, 'Làm nhân: trộn sò điệp, thịt băm với cà rốt, nấm mèo, miến, hành lá. Nêm muối, tiêu, chút đường cho vừa ăn.'),
  (3, 'Cuốn chả: trải bánh tráng ra, cho nhân vào giữa, gấp hai mép rồi cuốn chặt tay.'),
  (4, 'Chiên: đun nóng dầu, cho chả giò vào chiên vàng giòn các mặt, vớt ra để ráo dầu.'),
  (5, 'Làm xốt: hấp chín lòng đỏ trứng muối, tán nhuyễn rồi trộn đều với xốt Mayonnaise.'),
  (6, 'Trình bày chả giò ra đĩa kèm chén xốt trứng muối. Dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 12. Gỏi Bưởi Thịt Bò Xốt Mè Rang
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'goi-buoi-thit-bo-xot-me-rang',
  'Gỏi Bưởi Thịt Bò Xốt Mè Rang',
  'Tép bưởi mọng nước chua ngọt trộn cùng thịt bò mềm, rưới xốt mè rang thơm béo. Món gỏi thanh mát, cân bằng vị chua ngọt mặn, ăn khai vị hay ăn chơi đều hợp.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/goi-buoi-thit-bo-xot-me-rang.png',
  3, 20, 10, 'Dễ', 'published',
  'Tóm tắt từ monngonmoingay.com'
from public.categories c where c.slug = 'salad-goi'
on conflict (slug) do update set
  category_id = excluded.category_id, title = excluded.title,
  description = excluded.description, image_url = excluded.image_url,
  servings = excluded.servings, prep_time = excluded.prep_time,
  cook_time = excluded.cook_time, difficulty = excluded.difficulty,
  status = excluded.status, source_name = excluded.source_name,
  updated_at = now();

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'goi-buoi-thit-bo-xot-me-rang');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'goi-buoi-thit-bo-xot-me-rang'), v.position, v.name
from (values
  (1, 'Bưởi — 1 trái'),
  (2, 'Thịt bò thăn — 250g'),
  (3, 'Cà rốt — 1/2 củ'),
  (4, 'Hành tây — 1/2 củ'),
  (5, 'Rau răm — một ít'),
  (6, 'Đậu phộng rang — 30g'),
  (7, 'Mè rang — 2 muỗng canh'),
  (8, 'Nước mắm — 2 muỗng canh'),
  (9, 'Đường — 2 muỗng canh'),
  (10, 'Nước cốt chanh — 1 muỗng canh'),
  (11, 'Ớt băm — 1 muỗng cà phê'),
  (12, 'Tỏi băm — 1 muỗng cà phê')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'goi-buoi-thit-bo-xot-me-rang');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'goi-buoi-thit-bo-xot-me-rang'), v.position, v.step
from (values
  (1, 'Sơ chế: bưởi gọt vỏ, tách lấy tép, bẻ miếng vừa ăn. Cà rốt bào sợi, hành tây cắt mỏng ngâm nước đá cho giòn. Rau răm cắt nhỏ.'),
  (2, 'Xào bò: thịt bò cắt lát mỏng, ướp chút muối tiêu 10 phút. Xào nhanh trên lửa lớn cho vừa chín tới, để nguội.'),
  (3, 'Pha xốt: trộn nước mắm, đường, nước cốt chanh, tỏi ớt băm cho tan đều, thêm mè rang vào.'),
  (4, 'Trộn gỏi: cho bưởi, thịt bò, cà rốt, hành tây vào tô lớn, rưới xốt vào trộn đều nhẹ tay.'),
  (5, 'Trình bày ra đĩa, rắc đậu phộng rang và rau răm lên trên. Dùng ngay.')
) as v(position, step);

commit;
