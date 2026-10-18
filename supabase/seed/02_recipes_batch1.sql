-- =============================================================================
-- SEED BATCH 1: 12 công thức từ trang tìm kiếm monngonmoingay.com (trang 1).
-- Nội dung (tên + định lượng nguyên liệu, thứ tự/nội dung các bước, thời gian,
-- khẩu phần, độ khó) đã được đối chiếu CHÍNH XÁC với bản gốc ngày 2026-10-18
-- và VIẾT LẠI bằng lời của mình, KHÔNG sao chép nguyên văn.
-- Ghi nguồn: 'Tóm tắt từ monngonmoingay.com'.
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
  'Bông cải trắng và xanh giòn ngọt luộc vừa chín, trộn cùng tôm xào bơ tỏi thơm lừng, thêm húng lủi và vỏ chanh vàng, rưới xốt mayonnaise béo mịn. Món salad tươi mát, giàu chất xơ, làm khai vị rất hợp.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-bong-cai-tron-tom-bap.png',
  4, 5, 5, 'Dễ', 'published',
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
  (1, 'Tôm sú tươi bóc vỏ, chừa đuôi — 200g'),
  (2, 'Bông cải trắng — 100g'),
  (3, 'Bông cải xanh — 100g'),
  (4, 'Cà rốt — 50g'),
  (5, 'Rau húng lủi — 20g'),
  (6, 'Chanh vàng — 1 trái'),
  (7, 'Bơ lạt — 20g'),
  (8, 'Tỏi băm — 5g'),
  (9, 'Xốt mayonnaise — 3 muỗng canh'),
  (10, 'Muối, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-bong-cai-tron-tom-bap');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-bong-cai-tron-tom-bap'), v.position, v.step
from (values
  (1, 'Sơ chế rau củ: tách bông cải thành miếng vừa ăn, rửa sạch. Cà rốt gọt vỏ, tỉa hoa, cắt lát mỏng.'),
  (2, 'Luộc bông cải: đun sôi nước với ít muối, cho bông cải và cà rốt vào luộc vừa chín tới. Vớt ra ngâm nước đá cho giữ màu và độ giòn, để ráo.'),
  (3, 'Sơ chế chanh và rau thơm: cắt lát một phần chanh để trang trí, mài ít vỏ chanh (tránh phần cùi trắng cho khỏi đắng). Húng lủi nhặt rửa sạch, cắt nhỏ.'),
  (4, 'Xào tôm: đun chảy bơ, phi thơm tỏi băm rồi cho tôm vào xào đến khi chín. Trút ra đĩa, để nguội.'),
  (5, 'Trộn salad: cho bông cải, tôm, húng lủi và vỏ chanh mài vào tô lớn, thêm 3 muỗng canh xốt mayonnaise, trộn nhẹ tay cho xốt phủ đều.'),
  (6, 'Bày ra đĩa, vắt thêm miếng chanh lên trên cho vị chua thanh, trang trí vài lát chanh vàng rồi thưởng thức.')
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
  'Đậu hũ chiên nhồi nhân thịt băm, nấm mèo và bún tàu, rim trong xốt me chua ngọt sánh mịn. Vị chua thanh của me quyện với nhân đậm đà, ăn cùng cơm nóng và rau sống rất đưa cơm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/dau-hu-nhoi-xot-me.png',
  4, 5, 5, 'Dễ', 'published',
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
  (1, 'Đậu hũ chiên — 2 miếng (300g)'),
  (2, 'Thịt heo xay — 100g'),
  (3, 'Nấm mèo — 20g'),
  (4, 'Bún tàu — 20g'),
  (5, 'Nước me — 1/3 chén'),
  (6, 'Ngò rí — 3 cây'),
  (7, 'Ớt băm — 1 muỗng canh'),
  (8, 'Hành tím băm — 1 muỗng canh'),
  (9, 'Tỏi băm — 1 ít'),
  (10, 'Hạt nêm — 1 muỗng cà phê'),
  (11, 'Bột ngọt — 1/2 muỗng cà phê'),
  (12, 'Bột năng — 1/2 muỗng canh'),
  (13, 'Đường — 1 muỗng canh'),
  (14, 'Nước mắm — 1 muỗng canh'),
  (15, 'Tiêu, dầu ăn — nêm nếm'),
  (16, 'Dưa leo, cà chua, xà lách — ăn kèm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'dau-hu-nhoi-xot-me');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'dau-hu-nhoi-xot-me'), v.position, v.step
from (values
  (1, 'Sơ chế: ngâm nấm mèo đến khi nở, rửa sạch, cắt bỏ chân rồi cắt sợi. Ngâm bún tàu cho mềm, để ráo, cắt khúc ngắn. Ngò rí rửa sạch, cắt nhỏ.'),
  (2, 'Chuẩn bị đậu hũ: cắt đôi từng miếng đậu, nhẹ tay lấy bớt phần ruột bên trong, giữ vỏ đủ dày để không bị vỡ khi nhồi.'),
  (3, 'Trộn nhân: trộn phần ruột đậu với thịt xay, nấm mèo, bún tàu và 1/2 muỗng canh bột năng. Nêm 1 muỗng cà phê hạt nêm, 1/2 muỗng cà phê bột ngọt và ít tiêu, trộn đều. Nhồi nhân vào từng miếng đậu, ấn nhẹ cho chắc.'),
  (4, 'Pha xốt me: phi thơm hành tím và tỏi băm, thêm 1/3 chén nước và 1/3 chén nước me, 1 muỗng canh đường, 1 muỗng canh nước mắm. Đun sôi, nếm lại cho vừa vị chua ngọt rồi thêm ớt băm.'),
  (5, 'Rim đậu hũ: cho đậu đã nhồi vào chảo xốt, rim lửa nhỏ đến khi nhân chín hẳn và đậu thấm vị. Khi xốt hơi sánh, trở nhẹ cho xốt phủ đều rồi tắt bếp.'),
  (6, 'Gắp đậu ra đĩa, rưới xốt me lên trên, rắc ít tiêu. Dùng nóng với cơm, kèm dưa leo, cà chua và xà lách.')
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
  'Thịt lươn dai ngọt nấu cùng cải chua giòn và cà chua trong nước dùng chua thanh, thơm mùi sả và rau om ngò gai. Món canh dân dã, bổ dưỡng, ăn nóng với cơm rất ngon.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-luon-nau-cai-chua.png',
  4, 5, 5, 'Dễ', 'published',
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
  (1, 'Lươn — 250g'),
  (2, 'Cải chua cọng — 300g'),
  (3, 'Cà chua — 100g'),
  (4, 'Sả — 2 cây'),
  (5, 'Hành tỏi băm — 1 ít'),
  (6, 'Ớt sa tế — 1 muỗng canh'),
  (7, 'Tỏi phi — 1 muỗng cà phê'),
  (8, 'Rau om, ngò gai — 1 ít'),
  (9, 'Gia vị nêm sẵn lẩu Thái — 1 gói'),
  (10, 'Đường — 1/2 muỗng canh'),
  (11, 'Nước mắm, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-luon-nau-cai-chua');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-luon-nau-cai-chua'), v.position, v.step
from (values
  (1, 'Sơ chế lươn: cắt khúc dài khoảng 4cm, ướp với 1 muỗng cà phê gia vị nêm sẵn lẩu Thái và 1 muỗng canh hành tỏi băm, để thấm.'),
  (2, 'Sơ chế rau củ: cà chua rửa sạch, cắt múi cau; cải chua cắt khúc vừa ăn. Sả đập dập, cắt khúc 4cm. Rau om, ngò gai cắt khúc 2cm.'),
  (3, 'Xào lươn: phi thơm 1 muỗng canh hành tỏi băm cùng sả, cho lươn vào xào săn, đảo nhẹ tay. Trút lươn ra để riêng, bỏ phần sả.'),
  (4, 'Xào rau: cho cải chua và cà chua vào chảo, xào mềm rồi nêm 1/2 muỗng canh đường.'),
  (5, 'Nấu canh: thêm 1,5 lít nước, đun sôi rồi cho lươn vào, nấu khoảng 5 phút cho lươn chín mềm.'),
  (6, 'Nêm 1 muỗng canh ớt sa tế và phần gia vị nêm sẵn lẩu Thái còn lại, khuấy nhẹ. Cho 1 muỗng cà phê tỏi phi, rau om và ngò gai vào rồi tắt bếp. Múc ra tô, dùng nóng, chấm lươn với nước mắm ớt tùy thích.')
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
  'Ức gà áp chảo mềm mọng cắt lát, bày cùng rau củ nhiều màu sắc và việt quất tươi, rưới xốt chua ngọt béo nhẹ từ sữa chua và mayonnaise. Món salad thanh mát, giàu đạm, đẹp mắt.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/salad-uc-ga-xot-viet-quat.png',
  4, 2, 3, 'Dễ', 'published',
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
  (1, 'Ức gà — 200g'),
  (2, 'Việt quất tươi — 100g'),
  (3, 'Xà lách romaine — 50g'),
  (4, 'Bắp cải tím — 30g'),
  (5, 'Ớt chuông đỏ — 70g'),
  (6, 'Cà chua bi vàng — 30g'),
  (7, 'Sữa chua không đường — 1 hũ'),
  (8, 'Hạnh nhân lát rang vàng — 2 muỗng canh'),
  (9, 'Mật ong — 1 muỗng canh'),
  (10, 'Nước cốt tắc — 2 muỗng canh'),
  (11, 'Xốt mayonnaise — 1 ít'),
  (12, 'Hạt nêm thịt heo — 1 muỗng cà phê'),
  (13, 'Tỏi băm — 1 muỗng cà phê'),
  (14, 'Muối, tiêu, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-uc-ga-xot-viet-quat');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-uc-ga-xot-viet-quat'), v.position, v.step
from (values
  (1, 'Sơ chế rau củ: bắp cải tím và xà lách cắt sợi, ớt chuông cắt sợi vừa ăn, cà chua bi cắt đôi. Việt quất chia đôi: một nửa dằm nhẹ, một nửa để nguyên.'),
  (2, 'Ướp gà: lạng ức gà thành miếng mỏng, ướp với 1 muỗng cà phê hạt nêm và 1 muỗng cà phê tỏi băm, trộn đều.'),
  (3, 'Áp chảo gà: làm nóng chảo, cho gà vào áp chảo lửa lớn, trở đều hai mặt đến khi chín hoàn toàn mà vẫn mềm mọng. Để nguội rồi cắt lát mỏng.'),
  (4, 'Pha xốt việt quất: trộn 1 muỗng canh mật ong, 2 muỗng canh nước cốt tắc, chút muối và 1/4 muỗng cà phê tiêu. Thêm xốt mayonnaise và 4 muỗng canh sữa chua, khuấy mịn. Cho việt quất dằm vào, trộn đều.'),
  (5, 'Bày rau củ thành từng cụm quanh đĩa, đặt lát gà ở giữa. Rắc hạnh nhân và việt quất nguyên quả lên trên. Rưới xốt khi ăn, trộn nhẹ cho thấm đều.')
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
  'Nước súp miso cay thơm nồng nấu cùng bánh gyoza mềm, nấm đùi gà và cải bó xôi, thêm trứng lòng đào béo ngậy. Món súp kiểu Nhật ấm nóng, đậm đà, thích hợp cho bữa tối se lạnh.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/sup-gyoza-miso-cay.png',
  4, 2, 3, 'Dễ', 'published',
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
  (1, 'Bánh xếp gyoza — 12 cái'),
  (2, 'Trứng gà — 2 quả'),
  (3, 'Tương miso — 3,5 muỗng canh'),
  (4, 'Tương ớt Hàn Quốc — 1,5 muỗng canh'),
  (5, 'Nước dùng gà — 1,5 lít'),
  (6, 'Cải bó xôi — 150g'),
  (7, 'Nấm đùi gà — 100g'),
  (8, 'Boa rô — 1 chén'),
  (9, 'Hành tây băm — 1/2 chén'),
  (10, 'Nước tương — 2 muỗng canh'),
  (11, 'Dầu ăn — 2 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-gyoza-miso-cay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'sup-gyoza-miso-cay'), v.position, v.step
from (values
  (1, 'Luộc trứng lòng đào: cho trứng vào nồi nước đang sôi, luộc 6-7 phút rồi ngâm nước lạnh, bóc vỏ, cắt đôi.'),
  (2, 'Sơ chế rau nấm: cải bó xôi nhặt rửa sạch, cắt khúc 5cm. Nấm đùi gà cắt que dài 5cm đều nhau.'),
  (3, 'Xào thơm: đun nóng 2 muỗng canh dầu, phi thơm phần gốc boa rô, thêm hành tây băm xào mềm.'),
  (4, 'Nấu nước súp: cho 2 muỗng canh nước tương, 3,5 muỗng canh tương miso và 1,5 muỗng canh tương ớt Hàn Quốc vào, đảo đều. Rót 1,5 lít nước dùng gà, khuấy tan rồi đun sôi.'),
  (5, 'Cho nấm và gyoza vào nấu 4 phút, đảo nhẹ tay. Thêm cải bó xôi, nấu sôi thêm 1 phút rồi tắt bếp, cho lá boa rô vào.'),
  (6, 'Múc súp ra tô, đặt hai nửa trứng lòng đào lên trên. Dùng ngay khi còn nóng.')
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
  'Sườn non cọng ướp xốt nướng đậm đà, nướng bằng nồi chiên không dầu đến xém vàng, ăn kèm khoai tây, ớt chuông và thơm áp chảo. Món nướng thơm lừng, thịt mềm thấm vị, thích hợp cho bữa tiệc gia đình.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/suon-cong-nuong-rau-cu.png',
  6, 6, 6, 'Dễ', 'published',
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
  (1, 'Sườn non cọng — 500g'),
  (2, 'Ớt chuông đỏ — 100g'),
  (3, 'Khoai tây — 200g'),
  (4, 'Thơm — 40g'),
  (5, 'Xốt ướp thịt nướng vị truyền thống — 1 gói'),
  (6, 'Muối — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'suon-cong-nuong-rau-cu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'suon-cong-nuong-rau-cu'), v.position, v.step
from (values
  (1, 'Ướp sườn: chặt sườn thành 6 khúc, ướp với 1 gói xốt ướp thịt nướng trong 30 phút cho thấm.'),
  (2, 'Sơ chế rau củ: ớt chuông cắt miếng vừa ăn, khoai tây cắt lát mỏng. Thơm lấy 1 lát rắc chút muối rồi áp chảo, cắt thành 6 miếng để trình bày.'),
  (3, 'Nướng sườn: cho sườn vào nồi chiên không dầu, nướng ở 190°C trong 15 phút.'),
  (4, 'Ướp rau củ: trộn rau củ với phần xốt ướp còn dư, để thấm 5 phút.'),
  (5, 'Nướng chung: trở mặt sườn, cho rau củ vào nướng cùng ở 200°C thêm 10 phút đến khi sườn chín mềm, rau củ chín tới.'),
  (6, 'Bày sườn, thơm, khoai tây và ớt chuông ra đĩa, dùng nóng.')
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
  'Thịt bò xào nhanh trên lửa lớn giữ độ mềm ngọt, đảo cùng đậu rồng và cà rốt giòn ngọt, thêm sa tế cay thơm. Món xào đậm đà, màu sắc bắt mắt, ăn với cơm nóng rất hao cơm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/thit-bo-xao-dau-rong-sa-te.png',
  4, 5, 5, 'Dễ', 'published',
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
  (1, 'Thịt bò — 200g'),
  (2, 'Đậu rồng — 250g'),
  (3, 'Cà rốt — 50g'),
  (4, 'Tỏi băm — 1 muỗng cà phê'),
  (5, 'Ngò rí — 1 ít'),
  (6, 'Hạt nêm thịt heo — 1 muỗng cà phê'),
  (7, 'Nước tương — 1 muỗng cà phê'),
  (8, 'Bột ngọt — 1/3 muỗng cà phê'),
  (9, 'Tiêu — 1/3 muỗng cà phê'),
  (10, 'Dầu ăn — 1 muỗng canh'),
  (11, 'Sa tế — 1/2 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'thit-bo-xao-dau-rong-sa-te');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'thit-bo-xao-dau-rong-sa-te'), v.position, v.step
from (values
  (1, 'Sơ chế rau: đậu rồng tước bỏ phần xơ già, rửa sạch, cắt vát miếng vừa ăn. Cà rốt tỉa hoa, cắt lát mỏng.'),
  (2, 'Ướp thịt bò: cắt lát mỏng, ướp với 1 muỗng cà phê hạt nêm, 1 muỗng cà phê nước tương, 1/3 muỗng cà phê bột ngọt, 1 muỗng cà phê tỏi băm, 1/3 muỗng cà phê tiêu và 1 muỗng canh dầu ăn. Trộn đều, để thấm.'),
  (3, 'Xào thịt bò: phi thơm tỏi, cho thịt bò vào xào nhanh trên lửa lớn đến khi vừa chín tới thì trút ra để riêng, giữ độ mềm ngọt.'),
  (4, 'Xào rau: cho cà rốt và đậu rồng vào chảo, xào đến vừa chín tới. Cho thịt bò trở lại, đảo nhanh tay trên lửa lớn.'),
  (5, 'Thêm 1/2 muỗng canh sa tế, xóc đều cho thấm vị rồi tắt bếp. Dọn ra đĩa, dùng nóng với cơm.')
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
  'Bánh gyoza áo ba lớp bột chiên vàng giòn rụm, nhân nóng hổi bên trong, chấm cùng xốt mayonnaise trộn tương ớt béo cay. Món ăn vặt kiểu Nhật giòn tan, ăn kèm rau tươi mát.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/gyoza-chien-gion.png',
  4, 5, 5, 'Dễ', 'published',
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
  (1, 'Bánh xếp gyoza — 8 miếng'),
  (2, 'Bột mì — 50g'),
  (3, 'Bột xù — 50g'),
  (4, 'Trứng gà — 1 quả'),
  (5, 'Dưa leo — 50g'),
  (6, 'Xà lách — 100g'),
  (7, 'Cà chua bi — 50g'),
  (8, 'Xốt mayonnaise — 2 muỗng canh'),
  (9, 'Tương ớt — 2 muỗng canh'),
  (10, 'Dầu ăn — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'gyoza-chien-gion');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'gyoza-chien-gion'), v.position, v.step
from (values
  (1, 'Áo bột cho gyoza: không cần rã đông, lần lượt lăn gyoza qua bột mì, nhúng vào trứng gà đánh tan rồi áo đều một lớp bột xù bên ngoài.'),
  (2, 'Sơ chế rau ăn kèm: rửa sạch, để ráo, cắt miếng vừa ăn rồi bày ra đĩa.'),
  (3, 'Chiên gyoza: đun nóng dầu, cho gyoza vào chiên lửa vừa khoảng 4-5 phút đến khi vỏ vàng giòn, vớt ra để ráo dầu.'),
  (4, 'Pha xốt chấm: trộn đều 2 muỗng canh xốt mayonnaise với 2 muỗng canh tương ớt. Dọn gyoza nóng giòn cùng rau và xốt chấm.')
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
  'Nước canh ngọt thanh từ tôm và viên mọc giò sống, thêm rau mồng tơi xanh mướt. Món canh dân dã, dễ nấu, bổ dưỡng cho bữa cơm gia đình hằng ngày.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-mong-toi-tom-bap.png',
  4, 5, 5, 'Dễ', 'published',
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
  (2, 'Tôm sú bóc vỏ — 200g'),
  (3, 'Giò sống — 100g'),
  (4, 'Bắp hạt — 20g'),
  (5, 'Cà rốt — 20g'),
  (6, 'Hành tím băm — 1 muỗng cà phê'),
  (7, 'Bột ngọt — 1 muỗng cà phê'),
  (8, 'Hạt nêm thịt heo — 2 muỗng cà phê'),
  (9, 'Nước mắm — 1/2 muỗng canh'),
  (10, 'Tiêu — 1/3 muỗng cà phê')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-mong-toi-tom-bap');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-mong-toi-tom-bap'), v.position, v.step
from (values
  (1, 'Sơ chế rau: mồng tơi rửa sạch, để ráo, cắt khúc khoảng 4cm. Bắp hạt và cà rốt băm nhỏ.'),
  (2, 'Làm viên mọc: lấy 100g tôm đập dập, trộn đều với giò sống, bắp hạt, cà rốt, 1 muỗng cà phê hành tím băm, 1/3 muỗng cà phê tiêu và 1/4 muỗng cà phê bột ngọt. Vo thành từng viên vừa ăn.'),
  (3, 'Sơ chế tôm còn lại: chẻ lưng, làm sạch để giữ độ ngọt.'),
  (4, 'Nấu canh: đun sôi 1,2 lít nước, cho tôm và các viên mọc vào nấu khoảng 2 phút cho chín đều.'),
  (5, 'Cho mồng tơi vào, nêm 1 muỗng cà phê bột ngọt, 2 muỗng cà phê hạt nêm và 1/2 muỗng canh nước mắm. Khuấy nhẹ, nấu đến khi rau vừa chín tới rồi tắt bếp.')
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
  'Cá tầm nấu cùng thơm, cà chua và nấm rơm trong nước dùng chua cay kiểu Thái, thêm kèo nèo, rau nhút và rau thơm. Món canh chua cay hấp dẫn, thịt cá dai ngọt, nước dùng đậm đà.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/canh-ca-tam-vi-thai.png',
  4, 2, 3, 'Dễ', 'published',
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
  (1, 'Cá tầm — 150g'),
  (2, 'Thơm — 1/4 trái'),
  (3, 'Cà chua — 1/2 trái'),
  (4, 'Nấm rơm — 50g'),
  (5, 'Kèo nèo, rau nhút — 50g'),
  (6, 'Rau om, ngò gai, húng quế — 1 ít'),
  (7, 'Gia vị nêm sẵn lẩu Thái — 1 gói'),
  (8, 'Tỏi băm — 2 muỗng canh'),
  (9, 'Dầu ăn — 2 muỗng canh'),
  (10, 'Nước mắm — 1 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-ca-tam-vi-thai');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-ca-tam-vi-thai'), v.position, v.step
from (values
  (1, 'Ướp cá: cá tầm rửa sạch, để nguyên miếng, ướp với 1/2 muỗng canh gia vị nêm sẵn lẩu Thái cho thấm.'),
  (2, 'Sơ chế rau củ: thơm cắt rẽ quạt, cà chua cắt múi cau, nấm rơm cắt đôi. Kèo nèo, rau nhút rửa sạch, cắt khúc 5cm.'),
  (3, 'Áp cá: đun nóng 2 muỗng canh dầu ăn, phi thơm 2 muỗng canh tỏi băm rồi vớt tỏi phi ra. Tắt bếp, cho cá tầm vào áp nhẹ trong dầu tỏi cho thơm.'),
  (4, 'Nấu canh: mở lửa, cho nấm vào xào sơ, thêm 1,5 lít nước nóng và phần gia vị nêm sẵn lẩu Thái còn lại, đun sôi.'),
  (5, 'Cho thơm và cà chua vào nấu 3 phút. Thêm rau nhút, đợi sôi lại thì tắt bếp. Cho kèo nèo, 1 muỗng canh nước mắm và rau nêm vào. Múc ra tô, dùng nóng.')
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
  'Chả giò nhân sò điệp, thanh cua và phô mai mozzarella kéo sợi, chiên vàng giòn, chấm xốt phô mai trứng muối béo ngậy. Món chiên cao cấp, giòn rụm, thích hợp đãi tiệc.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/cha-gio-so-diep-xot-trung-muoi.png',
  4, 2, 3, 'Dễ', 'published',
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
  (1, 'Bánh tráng bía — 8 cái'),
  (2, 'Cồi sò điệp — 100g'),
  (3, 'Thanh cua — 25g'),
  (4, 'Bắp luộc tách hạt — 50g'),
  (5, 'Bông cải xanh — 50g'),
  (6, 'Phô mai mozzarella — 32g'),
  (7, 'Trứng gà — 1 quả'),
  (8, 'Bột chiên xù — 1/2 chén (40g)'),
  (9, 'Hạt nêm giảm muối — 1 muỗng cà phê'),
  (10, 'Tiêu xay — 1/2 muỗng cà phê'),
  (11, 'Xốt phô mai trứng muối — 1 ít'),
  (12, 'Dầu ăn — 1 ít'),
  (13, 'Gừng — vài lát')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-gio-so-diep-xot-trung-muoi');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-gio-so-diep-xot-trung-muoi'), v.position, v.step
from (values
  (1, 'Sơ chế nhân: thanh cua xé sợi, bắp luộc tách hạt, bông cải xanh luộc chín cắt hạt lựu. Phô mai mozzarella cắt que dài 5cm cỡ đầu đũa.'),
  (2, 'Sơ chế sò điệp: rửa sạch, thấm khô, áp chảo cùng vài lát gừng cho thơm.'),
  (3, 'Trộn nhân: trộn đều các nguyên liệu đã chuẩn bị (trừ phô mai) với 1 muỗng cà phê hạt nêm giảm muối và 1/2 muỗng cà phê tiêu xay.'),
  (4, 'Cuốn chả giò: trải bánh tráng bía, đặt một que phô mai vào giữa rồi cho nhân lên trên, cuốn chặt tay.'),
  (5, 'Áo bột: lăn chả giò qua trứng gà rồi áo đều bột xù. Để ngăn mát tủ lạnh ít nhất 15 phút cho giữ form.'),
  (6, 'Chiên ngập dầu đến khi vàng giòn, vớt ra để trên giấy thấm dầu. Dọn nóng, chấm xốt phô mai trứng muối.')
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
  'Bưởi da xanh chua ngọt trộn cùng thịt bò áp chảo mềm mọng, cà rốt, dưa leo giòn mát và xốt mè rang thơm béo. Món gỏi thanh mát, hài hòa vị chua ngọt mặn béo, ăn kèm bánh phồng tôm.',
  'https://dnxxmmacrvsmngprnrlq.supabase.co/storage/v1/object/public/recipe-images/goi-buoi-thit-bo-xot-me-rang.png',
  4, 2, 3, 'Dễ', 'published',
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
  (1, 'Bưởi da xanh — 400g'),
  (2, 'Thịt bò phi lê — 100g'),
  (3, 'Cà rốt cắt sợi — 80g'),
  (4, 'Dưa leo cắt sợi — 100g'),
  (5, 'Ớt sừng cắt sợi — 1 trái'),
  (6, 'Húng lủi, rau răm — 1 ít'),
  (7, 'Xốt mè rang — 2 muỗng canh'),
  (8, 'Bánh phồng tôm chiên — ăn kèm'),
  (9, 'Muối, tiêu, hành phi, mè trắng rang, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'goi-buoi-thit-bo-xot-me-rang');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'goi-buoi-thit-bo-xot-me-rang'), v.position, v.step
from (values
  (1, 'Sơ chế bưởi: tách thành múi nhỏ 3-4cm, bỏ hạt.'),
  (2, 'Sơ chế thịt bò: cắt miếng dày 1,5cm, giữ miếng lớn, ướp chút muối và tiêu.'),
  (3, 'Sơ chế rau củ: cà rốt, dưa leo, ớt sừng rửa sạch, cắt sợi vừa ăn.'),
  (4, 'Áp chảo thịt bò đến chín tới, để nguội rồi cắt lát mỏng vừa ăn.'),
  (5, 'Trộn gỏi: trộn đều bưởi, cà rốt, dưa leo, ớt sừng cùng một nửa thịt bò, một nửa rau thơm và 2 muỗng canh xốt mè rang cho thấm đều.'),
  (6, 'Bày ra đĩa, xếp phần thịt bò và rau thơm còn lại lên trên, rắc hành phi và mè rang. Dùng kèm bánh phồng tôm chiên.')
) as v(position, step);

commit;
