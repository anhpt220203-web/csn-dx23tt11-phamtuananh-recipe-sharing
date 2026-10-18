-- =============================================================================
-- SEED BATCH 2: 24 công thức từ trang tìm kiếm monngonmoingay.com (trang 2 + 3).
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
-- 1. Súp Tôm Gyoza
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'sup-tom-gyoza',
  'Súp Tôm Gyoza',
  'Nước súp ngọt thanh nấu từ tôm, ăn kèm bánh gyoza mềm thơm và cải thìa xanh mướt. Món súp nhẹ nhàng, ấm bụng, thích hợp cho bữa ăn thanh đạm.',
  'recipe-images/sup-tom-gyoza.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sup-tom-gyoza');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'sup-tom-gyoza'), v.position, v.name
from (values
  (1, 'Bánh xếp gyoza — 8 bánh'),
  (2, 'Tôm bóc vỏ — 100g'),
  (3, 'Cải thìa — 150g'),
  (4, 'Bắp hạt — 75g'),
  (5, 'Tỏi băm — 1 muỗng cà phê'),
  (6, 'Hành ngò — 1 ít'),
  (7, 'Hạt nêm — 1 ít'),
  (8, 'Bột ngọt — 1 ít'),
  (9, 'Tiêu, dầu mè, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-tom-gyoza');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'sup-tom-gyoza'), v.position, v.step
from (values
  (1, 'Luộc gyoza: đun sôi nước với ít hạt nêm, cho gyoza vào luộc khoảng 4 phút đến khi chín, vớt ra để riêng.'),
  (2, 'Sơ chế tôm: bóc vỏ, một nửa băm nhỏ, một nửa giữ nguyên con. Cải thìa cắt khúc vừa ăn.'),
  (3, 'Nấu súp: đun sôi nước, cho tôm băm và tôm nguyên con vào, thêm cải thìa và bắp hạt. Nêm hạt nêm, bột ngọt, tiêu cho vừa miệng.'),
  (4, 'Cho gyoza đã luộc vào nồi súp, thêm tỏi băm phi thơm và ít dầu mè. Múc ra tô, rắc hành ngò, dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 2. Thịt Bò Áp Chảo Mù Tạt
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'thit-bo-ap-chao-mu-tat',
  'Thịt Bò Áp Chảo Mù Tạt',
  'Thịt bò xiên cùng bắp và đậu bắp, áp chảo xém thơm, chấm xốt mayonnaise mù tạt béo cay. Món nướng chảo hấp dẫn, thịt mềm ngọt, thích hợp cho bữa tiệc nhỏ.',
  'recipe-images/thit-bo-ap-chao-mu-tat.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat'), v.position, v.name
from (values
  (1, 'Thịt bò phi lê — 300g'),
  (2, 'Bắp Mỹ — 1 trái'),
  (3, 'Đậu bắp — 8 trái'),
  (4, 'Cà chua bi — 5 trái'),
  (5, 'Hành tím băm — 1 muỗng cà phê'),
  (6, 'Tỏi băm — 1 muỗng cà phê'),
  (7, 'Hạt nêm thịt heo — 1 muỗng cà phê'),
  (8, 'Nước tương — 1 muỗng canh'),
  (9, 'Mù tạt xanh — 1 muỗng cà phê'),
  (10, 'Tiêu — 1/2 muỗng cà phê'),
  (11, 'Xốt mayonnaise — 2 muỗng canh'),
  (12, 'Giấm gạo — 1 ít'),
  (13, 'Dầu ăn — 1 ít'),
  (14, 'Que xiên — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'thit-bo-ap-chao-mu-tat'), v.position, v.step
from (values
  (1, 'Sơ chế: cắt thịt bò thành khối vuông khoảng 2cm. Ướp với 1 muỗng cà phê hành tím băm, 1 muỗng cà phê hạt nêm, 1 muỗng canh nước tương, 1 muỗng cà phê mù tạt xanh và 1/2 muỗng cà phê tiêu trong 15 phút.'),
  (2, 'Luộc bắp chín rồi cắt khúc vừa ăn. Đậu bắp rửa sạch, cắt đôi.'),
  (3, 'Xiên thịt: lần lượt xiên một miếng bắp, một miếng thịt bò, một miếng đậu bắp rồi thêm một miếng thịt bò.'),
  (4, 'Áp chảo: đun nóng ít dầu ăn, cho các xiên vào áp chảo đến khi thịt và rau củ chín đều, dậy mùi thơm.'),
  (5, 'Pha xốt chấm: trộn đều 2 muỗng canh xốt mayonnaise với 1 muỗng cà phê mù tạt và 1 muỗng cà phê tỏi băm. Dọn xiên thịt nóng cùng xốt chấm.')
) as v(position, step);

-- =============================================================================
-- 3. Tôm Xào Hạnh Nhân Chay
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'tom-xao-hanh-nhan-chay',
  'Tôm Xào Hạnh Nhân Chay',
  'Tôm chay và chả lụa chay xào cùng nấm rơm, bí ngòi và cà rốt, rắc hạnh nhân rang giòn bùi. Món chay thanh đạm mà đầy đủ sắc vị, thích hợp cho bữa cơm chay.',
  'recipe-images/tom-xao-hanh-nhan-chay.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay'), v.position, v.name
from (values
  (1, 'Chả lụa chay — 100g'),
  (2, 'Tôm chay — 50g'),
  (3, 'Nấm rơm búp — 50g'),
  (4, 'Cà rốt — 50g'),
  (5, 'Bí ngòi vàng — 100g'),
  (6, 'Hạnh nhân cắt lát rang — 50g'),
  (7, 'Tàu hũ ky chiên giòn — 2 miếng'),
  (8, 'Boaro băm — 10g'),
  (9, 'Ớt sừng cắt sợi — 1 trái'),
  (10, 'Bột ngọt — 1 muỗng cà phê'),
  (11, 'Hạt nêm nấm — 1,5 muỗng cà phê'),
  (12, 'Dầu hào chay — 1 muỗng cà phê'),
  (13, 'Nước tương — 1 ít'),
  (14, 'Tiêu, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'tom-xao-hanh-nhan-chay'), v.position, v.step
from (values
  (1, 'Sơ chế: chả lụa chay cắt sợi dài 5cm dày cỡ đầu đũa. Bí ngòi cắt sợi ngang dày 5mm. Nấm rơm chẻ đôi. Tôm chay rửa sơ qua nước nóng, vớt ra để ráo.'),
  (2, 'Phi thơm: đun nóng 2 muỗng canh dầu ăn, cho 1 muỗng canh boaro vào phi thơm.'),
  (3, 'Xào rau củ: cho rau củ và nấm rơm vào, đảo nhanh tay. Thêm tôm chay và chả lụa chay, tiếp tục xào đều.'),
  (4, 'Nêm 1 muỗng cà phê bột ngọt, 1,5 muỗng cà phê hạt nêm nấm và 1 muỗng cà phê dầu hào chay.'),
  (5, 'Xào đến khi các nguyên liệu vừa chín tới, thêm ớt sừng cắt sợi và một nửa lượng hạnh nhân rồi tắt bếp. Dọn ra đĩa, rắc phần hạnh nhân còn lại lên trên.')
) as v(position, step);

-- =============================================================================
-- 4. Cá Hồi Xốt Dâu Tây
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'ca-hoi-xot-dau-tay',
  'Cá Hồi Xốt Dâu Tây',
  'Phi lê cá hồi nướng chín vàng, béo ngậy, rưới xốt dâu tây chua ngọt thơm mùi húng quế. Món Âu sang trọng mà dễ làm, giàu omega-3, thích hợp đãi khách.',
  'recipe-images/ca-hoi-xot-dau-tay.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay'), v.position, v.name
from (values
  (1, 'Phi lê cá hồi — 200g'),
  (2, 'Dâu tây chín đỏ — 100g'),
  (3, 'Mật ong — 1 muỗng canh'),
  (4, 'Xốt mayonnaise — 1 ít'),
  (5, 'Lá húng quế băm — 1 ít'),
  (6, 'Muối — 1/2 muỗng cà phê'),
  (7, 'Tiêu — 1/3 muỗng cà phê')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'ca-hoi-xot-dau-tay'), v.position, v.step
from (values
  (1, 'Sơ chế: cắt cá hồi thành 4 miếng vừa ăn. Dâu tây: 3 quả cắt hạt lựu, phần còn lại xay nhuyễn làm xốt.'),
  (2, 'Ướp cá: trộn đều ít muối, 1/3 muỗng cà phê tiêu, 1/2 muỗng canh mật ong và 1 muỗng canh xốt mayonnaise. Cho cá vào, trộn nhẹ cho xốt phủ đều các mặt.'),
  (3, 'Nướng cá: cho vào nồi chiên không dầu, nướng ở 200°C trong 6 phút đến khi bề mặt chín vàng.'),
  (4, 'Làm xốt: trộn dâu tây xay nhuyễn với 2 muỗng canh xốt mayonnaise, 1/2 muỗng canh mật ong và 1 muỗng canh lá húng quế cắt nhỏ.'),
  (5, 'Bày cá ra đĩa, rưới xốt dâu tây lên trên, trang trí dâu cắt hạt lựu. Dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 5. Canh Nghêu Nấu Nấm
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-ngheu-nau-nam',
  'Canh Nghêu Nấu Nấm',
  'Nước canh ngọt tự nhiên từ nghêu tươi, nấu cùng nấm kim châm, đậu hũ và rau tần ô. Món canh thanh mát, bổ dưỡng, rất hợp cho bữa cơm gia đình.',
  'recipe-images/canh-ngheu-nau-nam.png',
  4, 10, 10, 'Dễ', 'published',
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
  (1, 'Nghêu tươi sống — 400g'),
  (2, 'Nấm kim châm — 75g'),
  (3, 'Rau tần ô — 75g'),
  (4, 'Hành tây tím — 1/2 củ'),
  (5, 'Đậu hũ trắng — 100g'),
  (6, 'Hành tím cắt lát — 3 củ'),
  (7, 'Bột ngọt — 1 muỗng cà phê'),
  (8, 'Đường — 1/2 muỗng cà phê'),
  (9, 'Nước mắm — 1 muỗng canh'),
  (10, 'Rau ngò rí, hành lá — 1 ít'),
  (11, 'Tiêu, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-ngheu-nau-nam');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-ngheu-nau-nam'), v.position, v.step
from (values
  (1, 'Sơ chế nghêu: đun nóng 2 muỗng canh dầu ăn, phi thơm 3 củ hành tím cắt lát. Cho nghêu vào đảo nhanh, thêm 2 chén nước, đậy nắp nấu đến khi nghêu mở vỏ thì tắt bếp.'),
  (2, 'Gỡ lấy phần thịt nghêu, giữ lại vài con nguyên vỏ để trang trí. Lọc kỹ nước luộc nghêu để làm nước nấu canh.'),
  (3, 'Nấu canh: thêm nước vào phần nước luộc cho đủ 1,2 lít rồi đun nóng. Nêm 1 muỗng cà phê bột ngọt và 1/2 muỗng cà phê đường.'),
  (4, 'Khi nước sôi, cho rau củ, nấm, đậu hũ và thịt nghêu vào nấu chung.'),
  (5, 'Chờ canh sôi trở lại, thêm rau tần ô rồi tắt bếp. Nêm 1 muỗng canh nước mắm, điều chỉnh vừa ăn. Múc ra tô, dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 6. Salad Đậu Rồng Thịt Bê
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-dau-rong-thit-be',
  'Salad Đậu Rồng Thịt Bê',
  'Thịt bê áp chảo mềm ngọt cắt lát mỏng, trộn cùng đậu rồng giòn mát và rau củ nhiều màu, rưới xốt phô mai cay béo thơm. Món salad sang trọng, hài hòa vị béo cay.',
  'recipe-images/salad-dau-rong-thit-be.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-dau-rong-thit-be');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-dau-rong-thit-be'), v.position, v.name
from (values
  (1, 'Đậu rồng non — 100g'),
  (2, 'Thịt bê — 100g'),
  (3, 'Ớt chuông đỏ — 25g'),
  (4, 'Ớt chuông vàng — 25g'),
  (5, 'Cà rốt — 50g'),
  (6, 'Hành tây — 50g'),
  (7, 'Xốt phô mai cay — 1 ít'),
  (8, 'Đậu phộng rang giã bể — 1 ít'),
  (9, 'Hành tím phi — 1 ít'),
  (10, 'Rau húng lủi — 1 ít'),
  (11, 'Tiêu — 1 muỗng cà phê'),
  (12, 'Hạt nêm thịt heo — 1/2 muỗng cà phê'),
  (13, 'Bơ lạt — 1 muỗng cà phê'),
  (14, 'Dầu ăn — 1 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-dau-rong-thit-be');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-dau-rong-thit-be'), v.position, v.step
from (values
  (1, 'Sơ chế rau: đậu rồng rửa sạch, để ráo, cắt lát xéo dày 3mm. Ngâm nước đá hoặc để ngăn mát tủ lạnh cho giữ độ giòn. Ớt chuông, cà rốt cắt sợi; hành tây cắt lát.'),
  (2, 'Ướp thịt bê với 1 muỗng cà phê tiêu, 1 muỗng canh dầu ăn và 1/2 muỗng cà phê hạt nêm.'),
  (3, 'Áp chảo một mặt thịt bê đến vừa chín tới. Thêm 1 muỗng cà phê bơ lạt, lật mặt còn lại áp chảo tiếp.'),
  (4, 'Lấy thịt ra, để nguội rồi cắt lát mỏng.'),
  (5, 'Bày đậu rồng và rau củ ra đĩa, xếp thịt bê lên trên. Rưới xốt phô mai cay, rắc đậu phộng rang, hành tím phi và húng lủi. Trộn đều khi ăn.')
) as v(position, step);

-- =============================================================================
-- 7. Rau Củ Xào Nấm Lộc Nhung
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'rau-cu-xao-nam-loc-nhung',
  'Rau Củ Xào Nấm Lộc Nhung',
  'Nấm lộc nhung giòn sần sật xào cùng đậu hũ chiên và rau củ, thấm xốt chay đậm đà pha từ nước tương, dầu hào và nước dừa tươi. Món chay ngon miệng, giàu dinh dưỡng.',
  'recipe-images/rau-cu-xao-nam-loc-nhung.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung'), v.position, v.name
from (values
  (1, 'Nấm lộc nhung khô — 80g'),
  (2, 'Đậu hũ chiên — 200g'),
  (3, 'Ớt chuông đỏ — 20g'),
  (4, 'Đậu cove — 30g'),
  (5, 'Cà rốt cắt que — 20g'),
  (6, 'Củ sắn cắt que — 30g'),
  (7, 'Nước dừa tươi — 1/2 chén'),
  (8, 'Boaro cắt lát — 1 chén'),
  (9, 'Nước tương — 1 muỗng canh'),
  (10, 'Hạt nêm nấm — 1 muỗng cà phê'),
  (11, 'Đường — 1 muỗng cà phê'),
  (12, 'Dầu hào chay — 1/2 muỗng canh'),
  (13, 'Giấm gạo — 1 muỗng canh'),
  (14, 'Tiêu xay — 1 muỗng cà phê'),
  (15, 'Dầu mè — 1 muỗng cà phê'),
  (16, 'Dầu ăn — 2 muỗng canh'),
  (17, 'Ngò rí — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'rau-cu-xao-nam-loc-nhung'), v.position, v.step
from (values
  (1, 'Sơ chế nấm: ngâm nấm lộc nhung trong nước đến khi mềm, xả lại vài lần với nước sạch. Vớt ra để thật ráo để khi xào không ra nhiều nước.'),
  (2, 'Pha xốt: cho 1 muỗng canh nước tương, 1 muỗng cà phê hạt nêm nấm, 1 muỗng cà phê đường, 1/2 muỗng canh dầu hào chay, 1 muỗng canh giấm gạo, 1 muỗng cà phê tiêu xay và 1 muỗng cà phê dầu mè vào chén, khuấy đều.'),
  (3, 'Xào nấm: làm nóng chảo với 2 muỗng canh dầu ăn, phi thơm boaro. Cho nấm lộc nhung vào xào trước, thêm 1 muỗng canh xốt đã pha cùng 3 muỗng canh nước dừa tươi, đảo đều 2 phút cho thấm.'),
  (4, 'Cho đậu cove, cà rốt, củ sắn và đậu hũ vào. Thêm toàn bộ xốt và nước dừa còn lại, đảo nhẹ tay.'),
  (5, 'Xào thêm 1 phút đến khi rau củ vừa chín tới, giữ độ giòn và màu đẹp thì tắt bếp. Dọn ra đĩa, rắc ngò rí.')
) as v(position, step);

-- =============================================================================
-- 8. Canh Đu Đủ Chay
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-du-du-chay',
  'Canh Đu Đủ Chay',
  'Đu đủ hườm bùi mềm nấu cùng nấm rơm, củ cải và đậu hũ trong nước dùng thanh ngọt, thơm mùi lá lốt và boaro phi. Món canh chay nhẹ nhàng, tốt cho tiêu hóa.',
  'recipe-images/canh-du-du-chay.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-du-du-chay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-du-du-chay'), v.position, v.name
from (values
  (1, 'Đu đủ hườm — 200g'),
  (2, 'Nấm rơm búp — 50g'),
  (3, 'Củ cải trắng — 50g'),
  (4, 'Đậu hũ trắng — 150g'),
  (5, 'Boaro cắt lát — 1 chén'),
  (6, 'Lá lốt — 10 lá'),
  (7, 'Bột canh — 1 muỗng cà phê'),
  (8, 'Muối — 1/2 muỗng cà phê'),
  (9, 'Đường — 1/2 muỗng cà phê'),
  (10, 'Dầu ăn — 2 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-du-du-chay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-du-du-chay'), v.position, v.step
from (values
  (1, 'Sơ chế: đu đủ và củ cải gọt vỏ, rửa sạch, cắt miếng vừa ăn. Nấm rơm gọt chân, ngâm nước vo gạo cho sạch, rửa lại nhiều lần. Khứa nhẹ hình chữ thập trên đầu nấm cho thấm gia vị.'),
  (2, 'Phi boaro: làm nóng nồi với 2 muỗng canh dầu ăn, phi thơm boaro rồi vớt ra để riêng. Cho nấm rơm vào đảo nhẹ cho dậy mùi.'),
  (3, 'Thêm 1,2 lít nước, cho đu đủ và củ cải vào nấu cùng.'),
  (4, 'Nêm 1 muỗng cà phê bột canh, 1/2 muỗng cà phê muối và 1/2 muỗng cà phê đường, khuấy nhẹ.'),
  (5, 'Nấu đến khi đu đủ và củ cải chín mềm bùi thì nêm nếm lại vừa ăn, tắt bếp. Múc ra tô, thêm boaro phi và lá lốt. Nước canh trong, vị ngọt thanh.')
) as v(position, step);

-- =============================================================================
-- 9. Chả Nấm Áp Chảo
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-nam-ap-chao',
  'Chả Nấm Áp Chảo',
  'Chả chay từ nhiều loại nấm và đậu hũ, áp chảo vàng giòn bên ngoài, nhân nhiều màu sắc bên trong, chấm nước tương tắc tỏi ớt chua cay mặn ngọt. Món chay hấp dẫn, giàu đạm thực vật.',
  'recipe-images/cha-nam-ap-chao.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cha-nam-ap-chao');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cha-nam-ap-chao'), v.position, v.name
from (values
  (1, 'Nấm đùi gà — 50g'),
  (2, 'Nấm kim châm — 50g'),
  (3, 'Nấm mèo — 3 muỗng canh'),
  (4, 'Rong biển ăn liền — 1 muỗng canh'),
  (5, 'Cà rốt cắt sợi — 20g'),
  (6, 'Đậu bắp cắt nhỏ — 40g'),
  (7, 'Đậu hũ trắng — 150g'),
  (8, 'Boaro cắt lát — 3 muỗng canh'),
  (9, 'Tiêu xanh giã bể — 2 muỗng canh'),
  (10, 'Bột chiên giòn — 1/2 gói'),
  (11, 'Nước tương — 3 muỗng canh'),
  (12, 'Đường — 1 muỗng canh'),
  (13, 'Nước cốt tắc — 1 muỗng canh'),
  (14, 'Tỏi ớt giã — 1 muỗng canh'),
  (15, 'Dầu ăn — 4 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-nam-ap-chao');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-nam-ap-chao'), v.position, v.step
from (values
  (1, 'Trộn nhân: cho nấm (đã luộc chín, vắt ráo), đậu hũ trắng (luộc, vắt ráo), cà rốt, đậu bắp, rong biển cắt sợi, tiêu xanh giã dập và boaro vào tô lớn, trộn nhẹ cho đều.'),
  (2, 'Thêm 1/2 gói bột chiên giòn cùng 2 muỗng canh nước, trộn đến khi hỗn hợp kết dính vừa phải. Để nghỉ vài phút cho bột hút ẩm.'),
  (3, 'Tạo hình: vo hỗn hợp thành viên vừa ăn, ép nhẹ cho dẹt đều.'),
  (4, 'Áp chảo: làm nóng chảo với 4 muỗng canh dầu ăn, cho từng viên chả vào áp chảo lửa vừa, trở đều hai mặt đến khi vàng giòn thì vớt ra, thấm dầu.'),
  (5, 'Pha nước chấm: trộn đều 3 muỗng canh nước tương, 1 muỗng canh đường, 1 muỗng canh nước cốt tắc và 1 muỗng canh tỏi ớt giã.'),
  (6, 'Dọn chả nóng giòn cùng nước chấm chua cay mặn ngọt.')
) as v(position, step);

-- =============================================================================
-- 10. Chả Giò Ngũ Vị
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-gio-ngu-vi',
  'Chả Giò Ngũ Vị',
  'Chả giò nhân thịt bò xay và giò sống thơm mùi ngũ vị hương, thêm lòng đỏ trứng muối béo bùi, chiên vàng giòn, chấm xốt mayonnaise tương ớt. Món chiên thơm phức, thích hợp đãi tiệc.',
  'recipe-images/cha-gio-ngu-vi.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'cha-gio-ngu-vi');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'cha-gio-ngu-vi'), v.position, v.name
from (values
  (1, 'Bánh tráng bò bía — 15 lá'),
  (2, 'Thịt bò xay — 100g'),
  (3, 'Giò sống — 40g'),
  (4, 'Lòng đỏ trứng vịt muối — 2 quả'),
  (5, 'Trứng gà — 1 quả'),
  (6, 'Củ năng — 50g'),
  (7, 'Khoai lang — 100g'),
  (8, 'Hành tỏi phi — 3 muỗng canh'),
  (9, 'Bột năng — 1 muỗng cà phê'),
  (10, 'Bột ngũ vị hương — 1/2 muỗng cà phê'),
  (11, 'Bột ngọt — 1 muỗng cà phê'),
  (12, 'Đường — 1 muỗng cà phê'),
  (13, 'Nước tương — 1 muỗng cà phê'),
  (14, 'Hạt nêm thịt heo — 1/2 muỗng cà phê'),
  (15, 'Xốt mayonnaise — 1 muỗng canh'),
  (16, 'Tương ớt — 1 muỗng canh'),
  (17, 'Dầu ăn — 1 ít'),
  (18, 'Rau xà lách, ớt sợi, hành lá — ăn kèm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-gio-ngu-vi');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-gio-ngu-vi'), v.position, v.step
from (values
  (1, 'Sơ chế: khoai lang gọt vỏ, bào sợi, chiên vàng giòn, để ráo dầu. Củ năng gọt vỏ, cắt sợi nhỏ. Lòng đỏ trứng muối cắt miếng vừa ăn. Trứng gà đánh tan.'),
  (2, 'Trộn nhân: cho thịt bò xay, giò sống vào tô, thêm trứng gà, củ năng, khoai lang chiên và hành tỏi phi. Nêm 1 muỗng cà phê bột năng, 1/2 muỗng cà phê bột ngũ vị hương, 1 muỗng cà phê bột ngọt, 1 muỗng cà phê đường, 1 muỗng cà phê nước tương và 1/2 muỗng cà phê hạt nêm. Trộn đều một chiều cho kết dính, để nghỉ cho thấm.'),
  (3, 'Cuốn chả: trải bánh bò bía, cho nhân vừa đủ vào giữa, xếp thêm lòng đỏ trứng muối, ớt sợi và hành lá. Phết trứng đánh tan lên mép bánh, gấp hai bên rồi cuộn chặt tay.'),
  (4, 'Chiên: đun nóng dầu, cho chả giò vào chiên lửa vừa, trở đều đến khi vỏ vàng giòn thì vớt ra, thấm dầu.'),
  (5, 'Pha xốt chấm: trộn đều 1 muỗng canh xốt mayonnaise với 1 muỗng canh tương ớt. Dọn chả giò nóng giòn cùng xà lách và xốt chấm.')
) as v(position, step);

-- =============================================================================
-- 11. Bún Nước Tương Đậu Hũ
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'bun-nuoc-tuong-dau-hu',
  'Bún Nước Tương Đậu Hũ',
  'Bún tươi trộn cùng đậu hũ áp chảo vàng giòn, rau sống tươi mát và nước tương pha chua ngọt. Món chay đơn giản, thanh đạm mà đủ chất cho bữa ăn nhẹ.',
  'recipe-images/bun-nuoc-tuong-dau-hu.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu'), v.position, v.name
from (values
  (1, 'Đậu hũ trắng — 3 miếng (400g)'),
  (2, 'Bún tươi — 800g'),
  (3, 'Rau thơm — 150g'),
  (4, 'Giá — 100g'),
  (5, 'Dưa leo — 200g'),
  (6, 'Đường — 2 muỗng canh'),
  (7, 'Nước tương — 3 muỗng canh'),
  (8, 'Nước cốt chanh — 1 muỗng canh'),
  (9, 'Tỏi ớt băm — 1 muỗng cà phê'),
  (10, 'Đậu phộng rang — 1 ít'),
  (11, 'Dầu ăn — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'bun-nuoc-tuong-dau-hu'), v.position, v.step
from (values
  (1, 'Sơ chế đậu hũ: rửa nhẹ, để ráo, cắt thành 3-6 miếng, ép nhẹ cho hơi dẹp để dễ chiên vàng đều.'),
  (2, 'Sơ chế rau: nhặt bỏ phần già úa, rửa sạch nhiều lần, để ráo. Dưa leo cắt sợi vừa ăn.'),
  (3, 'Áp chảo đậu hũ: đun nóng ít dầu, cho đậu vào áp chảo lửa vừa đến khi hai mặt vàng đều, hơi giòn thì gắp ra để ráo dầu.'),
  (4, 'Pha nước tương: cho 2 muỗng canh đường, 3 muỗng canh nước tương và 2 muỗng canh nước đun sôi để nguội vào chén, khuấy tan đường. Thêm 1 muỗng canh nước cốt chanh và 1 muỗng cà phê tỏi ớt băm, nếm lại cho vừa vị chua ngọt mặn.'),
  (5, 'Cho bún, rau, dưa leo và đậu hũ vào tô, rưới nước tương, trộn nhẹ cho thấm đều. Rắc đậu phộng rang, thưởng thức.')
) as v(position, step);

-- =============================================================================
-- 12. Salad Dưa Leo Thịt Gà
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-dua-leo-thit-ga',
  'Salad Dưa Leo Thịt Gà',
  'Thịt má đùi gà áp chảo thơm lừng cắt miếng, trộn cùng dưa leo, bắp cải tím và rau mầm giòn mát, rưới xốt mayonnaise giấm chua béo. Món salad tươi ngon, giàu đạm.',
  'recipe-images/salad-dua-leo-thit-ga.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-dua-leo-thit-ga');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-dua-leo-thit-ga'), v.position, v.name
from (values
  (1, 'Má đùi gà — 200g'),
  (2, 'Dưa leo — 200g'),
  (3, 'Rau mầm — 30g'),
  (4, 'Bắp cải tím — 30g'),
  (5, 'Ớt sừng — 10g'),
  (6, 'Hành tỏi băm — 10g'),
  (7, 'Đường — 1 muỗng canh'),
  (8, 'Giấm gạo — 1 muỗng canh'),
  (9, 'Xốt mayonnaise — 2 muỗng canh'),
  (10, 'Nước tương — 1 muỗng cà phê'),
  (11, 'Hạt nêm thịt heo — 1 muỗng cà phê'),
  (12, 'Muối, tiêu, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-dua-leo-thit-ga');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-dua-leo-thit-ga'), v.position, v.step
from (values
  (1, 'Ướp gà: má đùi gà lọc bỏ xương, rửa sạch, để ráo. Ướp với 1 muỗng canh hành tỏi băm, 1 muỗng cà phê nước tương và 1 muỗng cà phê hạt nêm, để thấm.'),
  (2, 'Sơ chế rau: dưa leo rửa sạch, bỏ ruột, cắt sợi, ướp ít đường rồi vớt ra để ráo cho giòn. Ớt sừng bỏ hạt cắt sợi, bắp cải tím bào sợi mỏng, rau mầm rửa nhẹ để ráo.'),
  (3, 'Pha xốt: hòa tan 1 muỗng canh đường với 1 muỗng canh giấm gạo và 2 muỗng canh nước lọc. Thêm 2 muỗng canh xốt mayonnaise, ít muối và tiêu, khuấy đều cho sánh vừa.'),
  (4, 'Áp chảo gà: đun nóng chảo với ít dầu, cho gà vào áp chảo lửa vừa, trở đều đến khi chín vàng thơm. Để nguội bớt rồi cắt miếng vừa ăn.'),
  (5, 'Trộn dưa leo, ớt sừng, bắp cải tím và rau mầm trong tô lớn. Xếp ra đĩa, cho thịt gà lên trên, để ngăn mát tủ lạnh cho mát giòn. Rưới xốt khi ăn.')
) as v(position, step);

-- =============================================================================
-- 13. Canh Gà Củ Sen
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-ga-cu-sen',
  'Canh Gà Củ Sen',
  'Gà ta hầm cùng củ sen, hạt sen, táo đỏ và kỷ tử cho nước canh ngọt thanh, bổ dưỡng. Món canh tẩm bổ, thích hợp cho người cần bồi bổ sức khỏe.',
  'recipe-images/canh-ga-cu-sen.png',
  4, 6, 7, 'Dễ', 'published',
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
  (1, 'Gà ta góc tư — 300g'),
  (2, 'Củ sen — 100g'),
  (3, 'Cà rốt — 50g'),
  (4, 'Hạt sen — 50g'),
  (5, 'Táo đỏ — 4 quả'),
  (6, 'Kỷ tử — 10g'),
  (7, 'Nấm đông cô — 4 tai nhỏ'),
  (8, 'Hành tím đập dập — 4 củ'),
  (9, 'Hạt nêm giảm muối — 1 muỗng cà phê'),
  (10, 'Đường — 1 muỗng cà phê'),
  (11, 'Nước mắm — 1 muỗng canh'),
  (12, 'Hành ngò, tiêu, muối, dầu ăn — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-ga-cu-sen');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-ga-cu-sen'), v.position, v.step
from (values
  (1, 'Ướp gà: cho gà (chặt miếng 4cm) vào tô, thêm hành tím đập dập và 1 muỗng cà phê hạt nêm giảm muối, trộn đều, để thấm.'),
  (2, 'Xào thịt gà: đun nóng nồi với 2 muỗng canh dầu ăn, cho thịt gà vào xào đến khi săn lại và xém nhẹ các mặt.'),
  (3, 'Nấu nước canh: thêm 1,2 lít nước, đun sôi rồi cho táo đỏ và nấm đông cô vào nấu khoảng 8 phút.'),
  (4, 'Thêm rau củ: nêm 1 muỗng cà phê đường, cho củ sen, hạt sen và cà rốt vào nấu thêm 5 phút.'),
  (5, 'Hoàn thiện: khi thịt gà và rau củ chín mềm, cho kỷ tử vào. Tắt bếp, thêm 1 muỗng canh nước mắm cùng hành ngò. Múc ra tô, rắc tiêu, dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 14. Cải Thìa Xào Hải Sâm
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cai-thia-xao-hai-sam',
  'Cải Thìa Xào Hải Sâm',
  'Hải sâm giòn sần sật xào nhanh cùng tôm, nấm đông cô và cải thìa trên lửa lớn, xốt sánh đậm đà. Món xào cao cấp, bổ dưỡng, thích hợp đãi tiệc.',
  'recipe-images/cai-thia-xao-hai-sam.png',
  4, 2, 3, 'Trung bình', 'published',
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
  (1, 'Hải sâm đông lạnh đã sơ chế — 100g'),
  (2, 'Tôm sú lột vỏ — 80g'),
  (3, 'Cải thìa — 50g'),
  (4, 'Nấm đông cô tươi — 8 tai'),
  (5, 'Cà rốt — 50g'),
  (6, 'Gừng non cắt sợi — 1 muỗng canh'),
  (7, 'Dầu hào — 1 muỗng canh'),
  (8, 'Hạt nêm thịt heo — 1 muỗng cà phê'),
  (9, 'Đường — 1/2 muỗng cà phê'),
  (10, 'Nước bột năng — 1 muỗng canh'),
  (11, 'Dầu ăn — 2 muỗng canh'),
  (12, 'Ngò rí, tiêu — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cai-thia-xao-hai-sam');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cai-thia-xao-hai-sam'), v.position, v.step
from (values
  (1, 'Sơ chế: hải sâm ngâm qua rượu gừng, rửa lại, để ráo, chần nhanh trong nước sôi với ít gừng lát rồi cắt miếng vừa ăn. Tôm lột vỏ. Cải thìa cắt vừa ăn, chần qua nước sôi. Nấm đông cô ngâm 10 phút với nước pha bột năng, rửa sạch. Cà rốt tỉa hoa, cắt lát 2 li, chần qua nước sôi.'),
  (2, 'Xào hải sâm: đun nóng 2 muỗng canh dầu ăn, phi thơm 1 muỗng canh gừng non cắt sợi. Cho hải sâm vào xào nhanh trên lửa lớn khoảng 1 phút.'),
  (3, 'Thêm tôm và nấm đông cô vào, tiếp tục đảo đều trên lửa lớn.'),
  (4, 'Nêm 1 muỗng canh dầu hào, 1 muỗng cà phê hạt nêm và 1/2 muỗng cà phê đường, trộn đều cho thấm.'),
  (5, 'Cho cà rốt và cải thìa vào, đảo nhanh đến khi rau vừa chín tới. Thêm 1 muỗng canh nước bột năng, trộn đều cho xốt sánh nhẹ rồi tắt bếp. Dọn ra đĩa, rắc ngò rí và tiêu, dùng nóng.')
) as v(position, step);

-- =============================================================================
-- 15. Salad Tonkatsu
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-tonkatsu',
  'Salad Tonkatsu',
  'Thịt heo chiên xù kiểu Nhật giòn rụm cắt lát, ăn kèm salad rau củ tươi và xốt dầu giấm chanh thơm mát, chấm thêm xốt mayonnaise tương ớt. Món salad kiểu Nhật lạ miệng, hấp dẫn.',
  'recipe-images/salad-tonkatsu.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-tonkatsu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-tonkatsu'), v.position, v.name
from (values
  (1, 'Thịt heo chiên xù tonkatsu — 2 bịch'),
  (2, 'Cần tây — 50g'),
  (3, 'Cà chua bi — 50g'),
  (4, 'Bông cải xanh — 50g'),
  (5, 'Bí đỏ — 50g'),
  (6, 'Hành tây — 1/2 củ'),
  (7, 'Hành tím bào mỏng — 30g'),
  (8, 'Đường — 1 muỗng canh'),
  (9, 'Muối — 1 muỗng cà phê'),
  (10, 'Dầu ô liu — 3 muỗng canh'),
  (11, 'Nước cốt chanh — 1 muỗng canh'),
  (12, 'Vỏ chanh mài — 1 muỗng canh'),
  (13, 'Giấm gạo — 3 muỗng canh'),
  (14, 'Rau húng lủi — 5g'),
  (15, 'Tiêu xay — 1/2 muỗng cà phê'),
  (16, 'Xốt mayonnaise, tương ớt — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-tonkatsu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-tonkatsu'), v.position, v.step
from (values
  (1, 'Sơ chế rau: cần tây bào lát ngâm nước đá; cà chua bi cắt đôi; bông cải xanh cắt miếng vừa, chần chín; bí đỏ cắt khối, luộc chín; hành tây bào mỏng ngâm đá. Vớt ra để ráo, giữ mát tủ lạnh.'),
  (2, 'Chiên thịt: đun nóng dầu, cho thịt heo chiên xù vào chiên ngập dầu lửa vừa khoảng 6 phút đến khi vàng. Vớt ra để nguội bớt, cắt lát xéo vừa ăn.'),
  (3, 'Pha xốt salad: trộn 3 muỗng canh giấm gạo, 1 muỗng canh đường, 1 muỗng cà phê muối, 30g hành tím bào, 1 muỗng canh vỏ chanh mài, 1/2 muỗng cà phê tiêu xay, 1 muỗng canh nước cốt chanh và 3 muỗng canh dầu ô liu, khuấy tan.'),
  (4, 'Pha xốt chấm: trộn xốt mayonnaise với tương ớt theo tỉ lệ 1:1.'),
  (5, 'Cho salad vào tô, thêm 1/3 lượng xốt dầu giấm trộn nhẹ. Bày salad một nửa đĩa, xếp thịt chiên xù nửa còn lại, rắc húng lủi. Rưới phần xốt còn lại, trộn đều khi ăn.')
) as v(position, step);

-- =============================================================================
-- 16. Salad Bacon Xốt Mè Rang
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-bacon-xot-me-rang',
  'Salad Bacon Xốt Mè Rang',
  'Bacon áp chảo thơm béo ăn kèm xà lách, cà chua, dưa leo và bắp hạt, rưới xốt mè rang đậm đà. Món salad kiểu Tây nhanh gọn, giàu năng lượng cho bữa sáng hay ăn nhẹ.',
  'recipe-images/salad-bacon-xot-me-rang.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-bacon-xot-me-rang');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-bacon-xot-me-rang'), v.position, v.name
from (values
  (1, 'Bacon xông khói — 60g'),
  (2, 'Bắp hạt — 30g'),
  (3, 'Xà lách lolo — 80g'),
  (4, 'Xà lách romain — 80g'),
  (5, 'Cà chua bi — 40g'),
  (6, 'Dưa leo baby — 50g'),
  (7, 'Xốt mè rang — 1 ít'),
  (8, 'Dầu ăn — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-bacon-xot-me-rang');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-bacon-xot-me-rang'), v.position, v.step
from (values
  (1, 'Sơ chế xà lách: rửa sạch, để ráo, cắt miếng vừa ăn.'),
  (2, 'Cà chua và dưa leo rửa sạch, cắt đôi thành lát vừa ăn. Bắp chần sơ trong nước sôi, vớt ra để ráo.'),
  (3, 'Áp chảo bacon: làm nóng chảo với ít dầu ăn, cho bacon vào áp chảo đến khi tươm mỡ và dậy mùi thơm. Vớt ra để ráo bớt dầu.'),
  (4, 'Xếp xà lách, cà chua, dưa leo và bắp ra đĩa, cho bacon lên trên.'),
  (5, 'Rưới đều xốt mè rang lên salad. Dùng ngay để rau giữ độ tươi giòn và bacon còn thơm ngon.')
) as v(position, step);

-- =============================================================================
-- 17. Súp Gà Chua Cay
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'sup-ga-chua-cay',
  'Súp Gà Chua Cay',
  'Súp gà chua cay với thịt gà xé sợi, măng, nấm đông cô và đậu hũ non trong nước dùng sánh nhẹ, thơm mùi sa tế và giấm. Món súp khai vị ấm nóng, kích thích vị giác.',
  'recipe-images/sup-ga-chua-cay.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'sup-ga-chua-cay');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'sup-ga-chua-cay'), v.position, v.name
from (values
  (1, 'Thịt ức gà — 100g'),
  (2, 'Măng tươi — 80g'),
  (3, 'Đậu hũ non — 100g'),
  (4, 'Nước dùng gà — 1 lít'),
  (5, 'Nấm đông cô tươi — 80g'),
  (6, 'Ớt sa tế — 1 muỗng canh'),
  (7, 'Bột năng — 40g'),
  (8, 'Hạt nêm gà — 1,5 muỗng canh'),
  (9, 'Giấm gạo — 1,5 muỗng canh'),
  (10, 'Đường — 1 muỗng cà phê'),
  (11, 'Ngò rí, ớt sừng, tiêu — 1 ít'),
  (12, 'Nước tương, ớt cắt lát — ăn kèm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'sup-ga-chua-cay');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'sup-ga-chua-cay'), v.position, v.step
from (values
  (1, 'Sơ chế: luộc chín ức gà, để nguội rồi xé sợi vừa ăn. Đậu hũ non cắt hạt lựu nhẹ tay. Măng rửa sạch, cắt sợi. Nấm đông cô bỏ gốc, thái sợi. Ngò rí cắt nhỏ, ớt sừng cắt lát.'),
  (2, 'Pha bột năng: hòa tan 4 muỗng canh bột năng với 1/2 chén nước, khuấy đều cho khỏi vón cục.'),
  (3, 'Nấu nước dùng: đun sôi nước dùng, cho thịt gà xé vào nấu lửa vừa.'),
  (4, 'Nêm 1,5 muỗng canh hạt nêm gà, 1,5 muỗng canh giấm gạo, 1 muỗng cà phê đường và 1 muỗng canh sa tế, khuấy tan.'),
  (5, 'Cho lần lượt măng, nấm đông cô và đậu hũ non vào, nấu đến vừa chín tới.'),
  (6, 'Rót từ từ nước bột năng vào, vừa rót vừa khuấy nhẹ đến khi súp sánh như ý thì tắt bếp. Múc ra tô, rắc ngò rí, ớt sừng và tiêu. Dùng nóng, kèm nước tương và ớt cắt lát.')
) as v(position, step);

-- =============================================================================
-- 18. Cơm Gạo Lứt Chiên Nghêu
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'com-gao-lut-chien-ngheu',
  'Cơm Gạo Lứt Chiên Nghêu',
  'Cơm gạo lứt chiên săn hạt cùng thịt nghêu ngọt thơm, rau củ và lòng đỏ trứng muối béo bùi. Món cơm chiên giàu chất xơ, tốt cho sức khỏe, vị đậm đà.',
  'recipe-images/com-gao-lut-chien-ngheu.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu'), v.position, v.name
from (values
  (1, 'Nghêu — 1kg'),
  (2, 'Cơm gạo lứt — 500g'),
  (3, 'Đậu cô ve — 60g'),
  (4, 'Cà rốt — 70g'),
  (5, 'Hành tây — 70g'),
  (6, 'Trứng vịt muối luộc — 1 quả'),
  (7, 'Hạt nêm thịt heo — 2 muỗng cà phê'),
  (8, 'Nước tương — 1/2 muỗng canh'),
  (9, 'Bột ngọt — 1 muỗng cà phê'),
  (10, 'Tỏi băm, hành, ngò, đường, dầu ăn, tiêu — nêm nếm')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'com-gao-lut-chien-ngheu'), v.position, v.step
from (values
  (1, 'Sơ chế nghêu: luộc nghêu với 1 chén nước đến khi mở miệng, tách lấy phần thịt.'),
  (2, 'Sơ chế rau củ: cà rốt, đậu cô ve, hành tây rửa sạch, cắt hạt lựu. Tách lòng đỏ trứng vịt muối, tán nhuyễn. Ngò rí rửa sạch, cắt nhuyễn.'),
  (3, 'Nêm cơm: trộn đều cơm gạo lứt với 2 muỗng cà phê hạt nêm, 1/2 muỗng canh nước tương và 1 muỗng cà phê bột ngọt.'),
  (4, 'Xào nghêu: phi thơm ít tỏi, cho thịt nghêu vào xào dậy mùi thơm rồi trút ra đĩa để riêng.'),
  (5, 'Xào rau củ: tiếp tục phi thơm tỏi, cho cà rốt, hành tây và đậu cô ve vào xào vừa chín tới.'),
  (6, 'Chiên cơm: cho cơm đã nêm vào chảo, đảo đều đến khi hạt cơm săn lại và hòa quyện với rau củ.'),
  (7, 'Thêm nghêu và một nửa lòng đỏ trứng muối tán nhuyễn, trộn đều rồi tắt bếp. Cho ra đĩa, rắc phần lòng đỏ còn lại, tiêu xay và ngò rí. Dùng nóng, kèm nước tương.')
) as v(position, step);

-- =============================================================================
-- 19. Canh Sườn Gyoza
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'canh-suon-gyoza',
  'Canh Sườn Gyoza',
  'Sườn non hầm mềm cùng củ cải, cà rốt và tôm khô cho nước dùng ngọt thanh, thêm bánh gyoza mềm thấm vị. Món canh đầy đặn, bổ dưỡng cho bữa cơm gia đình.',
  'recipe-images/canh-suon-gyoza.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'canh-suon-gyoza');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'canh-suon-gyoza'), v.position, v.name
from (values
  (1, 'Sườn non — 400g'),
  (2, 'Tôm khô — 30g'),
  (3, 'Củ cải trắng — 200g'),
  (4, 'Cà rốt — 200g'),
  (5, 'Bánh xếp gyoza — 2 gói'),
  (6, 'Hạt nêm thịt heo — 2 muỗng cà phê'),
  (7, 'Đường — 1/2 muỗng canh'),
  (8, 'Nước mắm — 1 muỗng canh'),
  (9, 'Rau ăn kèm (giá, hẹ, cần, xà lách) — 1 ít'),
  (10, 'Hành ngò, tiêu — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'canh-suon-gyoza');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'canh-suon-gyoza'), v.position, v.step
from (values
  (1, 'Sơ chế sườn: chần sườn qua nước sôi cho sạch bọt bẩn, rửa lại với nước sạch, để ráo.'),
  (2, 'Sơ chế rau củ: củ cải và cà rốt gọt vỏ, tỉa hoa, cắt khoanh dày 7mm. Tôm khô rửa sạch, để ráo. Rau ăn kèm nhặt rửa sạch, để ráo.'),
  (3, 'Hầm sườn: cho sườn non, củ cải và tôm khô vào nồi cùng 1,8 lít nước, hầm khoảng 20 phút. Thêm cà rốt, nấu thêm 5 phút đến khi rau củ chín mềm.'),
  (4, 'Nêm 2 muỗng cà phê hạt nêm, 1/2 muỗng canh đường và 1 muỗng canh nước mắm, khuấy nhẹ.'),
  (5, 'Cho gyoza vào nồi, nấu thêm 3 phút đến khi chín tới, thấm vị nước dùng mà không bị vỡ thì tắt bếp.'),
  (6, 'Múc canh ra tô, rắc hành ngò và ít tiêu. Dùng nóng kèm giá, hẹ, cần và xà lách.')
) as v(position, step);

-- =============================================================================
-- 20. Gà Nướng Chanh Sả Mayo
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'ga-nuong-chanh-sa-mayo',
  'Gà Nướng Chanh Sả Mayo',
  'Má đùi gà ướp sả, lá chúc và xốt mayonnaise, nướng bằng nồi chiên không dầu đến vàng xém thơm lừng, chấm xốt mayo tương ớt béo cay. Món nướng thơm phức, thịt mềm mọng.',
  'recipe-images/ga-nuong-chanh-sa-mayo.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo'), v.position, v.name
from (values
  (1, 'Má đùi gà — 250g'),
  (2, 'Xốt mayonnaise — 5 muỗng canh'),
  (3, 'Tương ớt — 2 muỗng canh'),
  (4, 'Mật ong — 1/2 muỗng canh'),
  (5, 'Sả băm — 1 muỗng canh'),
  (6, 'Tỏi băm — 1 muỗng canh'),
  (7, 'Ớt băm — 1/2 muỗng cà phê'),
  (8, 'Lá chúc cắt nhỏ — 2 muỗng cà phê'),
  (9, 'Bột canh — 1/2 muỗng canh'),
  (10, 'Dưa leo, củ cải, cà rốt ngâm chua ngọt, rau răm — 100g')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'ga-nuong-chanh-sa-mayo'), v.position, v.step
from (values
  (1, 'Sơ chế gà: dùng dao rạch mở phần má đùi gà cho miếng thịt dàn mỏng, dễ thấm gia vị.'),
  (2, 'Chuẩn bị xốt ướp: xay hoặc giã nhuyễn 1 muỗng canh sả băm, 1 muỗng canh tỏi băm, 1/2 muỗng cà phê ớt băm, 1/2 muỗng canh bột canh, 1 muỗng cà phê lá chúc băm, 1/2 muỗng canh mật ong và 2 muỗng canh xốt mayonnaise.'),
  (3, 'Ướp gà với 2/3 lượng xốt, trộn đều, ướp 15 phút cho thấm kỹ.'),
  (4, 'Nướng lần 1: cho gà vào nồi chiên không dầu, nướng ở 160°C trong 10 phút.'),
  (5, 'Nướng lần 2: lấy gà ra, phết phần xốt còn lại lên bề mặt, nướng tiếp ở 160°C thêm 5 phút đến khi gà chín, vàng xém nhẹ.'),
  (6, 'Pha xốt chấm: trộn đều 3 muỗng canh xốt mayonnaise, 2 muỗng canh tương ớt và 1 muỗng cà phê lá chúc băm. Bày gà ra đĩa, dùng kèm rau sống, đồ chua và xốt chấm.')
) as v(position, step);

-- =============================================================================
-- 21. Salad Rong Nho Đậu Hũ
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'salad-rong-nho-dau-hu',
  'Salad Rong Nho Đậu Hũ',
  'Rong nho giòn mát kết hợp đậu hũ non mềm béo và rau xà lách tươi, rưới xốt mè rang thơm bùi. Món salad thanh mát, giàu khoáng chất từ rong biển.',
  'recipe-images/salad-rong-nho-dau-hu.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'salad-rong-nho-dau-hu');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'salad-rong-nho-dau-hu'), v.position, v.name
from (values
  (1, 'Rong nho — 80g'),
  (2, 'Đậu hũ non — 100g'),
  (3, 'Xà lách lolo — 70g'),
  (4, 'Xà lách romain — 70g'),
  (5, 'Cà chua bi — 60g'),
  (6, 'Dưa leo baby — 20g'),
  (7, 'Xốt mè rang — 4 muỗng canh')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'salad-rong-nho-dau-hu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'salad-rong-nho-dau-hu'), v.position, v.step
from (values
  (1, 'Sơ chế rau củ: xà lách cắt miếng vừa ăn, cà chua cắt đôi, dưa leo cắt lát.'),
  (2, 'Sơ chế đậu hũ: cắt hạt lựu vừa ăn. Rong nho rửa với nước, để ráo.'),
  (3, 'Trộn rau củ: cho các loại rau đã sơ chế vào tô, trộn đều nhẹ tay.'),
  (4, 'Cho rong nho và đậu hũ lên trên cho đẹp mắt, giữ độ giòn của rong nho và độ mềm béo của đậu hũ.'),
  (5, 'Rưới 4 muỗng canh xốt mè rang lên trên. Trộn nhẹ trước khi ăn cho xốt áo đều.')
) as v(position, step);

-- =============================================================================
-- 22. Chả Giò Tôm Mayo
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'cha-gio-tom-mayo',
  'Chả Giò Tôm Mayo',
  'Chả giò nhân tôm trộn xốt mayonnaise béo ngậy, chiên vàng giòn rụm, chấm thêm mayo tương ớt. Món chiên giòn tan, nhân béo thơm, ăn kèm xà lách thanh mát.',
  'recipe-images/cha-gio-tom-mayo.png',
  4, 10, 10, 'Dễ', 'published',
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
  (1, 'Tôm — 200g'),
  (2, 'Hành tây — 100g'),
  (3, 'Hành lá — 10g'),
  (4, 'Bánh tráng bò bía — 10-12 lá'),
  (5, 'Xốt mayonnaise — 1 ít'),
  (6, 'Hạt nêm thịt heo — 1/3 muỗng cà phê'),
  (7, 'Tiêu — 1 ít'),
  (8, 'Bột năng — 1/2 muỗng cà phê'),
  (9, 'Dầu ăn — 1 ít'),
  (10, 'Xà lách — ăn kèm'),
  (11, 'Tương ớt — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'cha-gio-tom-mayo');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'cha-gio-tom-mayo'), v.position, v.step
from (values
  (1, 'Sơ chế tôm: luộc chín, bóc vỏ, cắt hạt lựu. Hành tây cắt hạt lựu, hành lá cắt nhỏ.'),
  (2, 'Làm hồ dán: nấu 1/2 muỗng cà phê bột năng với 1/2 chén nước đến khi sánh lại.'),
  (3, 'Xào nhân: xào thơm hành tây, cho tôm vào đảo đều, nêm 1/3 muỗng cà phê hạt nêm, hành lá và ít tiêu. Để nhân thật nguội.'),
  (4, 'Trộn xốt: trộn xốt mayonnaise vào hỗn hợp theo tỉ lệ 2 phần nhân : 1 phần mayonnaise.'),
  (5, 'Cuốn chả giò: trải bánh bía ra, cho nhân vào, cuốn tròn rồi dán mí bằng hồ.'),
  (6, 'Chiên: đun nóng dầu ăn, chờ dầu thật nóng rồi cho chả giò vào chiên nhanh, vừa vàng thì vớt ra để ráo dầu.'),
  (7, 'Dọn nóng để cảm nhận độ giòn của vỏ và vị béo thơm của nhân. Chấm xốt mayonnaise pha tương ớt, ăn kèm xà lách.')
) as v(position, step);

-- =============================================================================
-- 23. Rau Củ Và Mực Chiên
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'rau-cu-va-muc-chien',
  'Rau Củ Và Mực Chiên',
  'Mực lá và rau củ tẩm bột chiên giòn vàng ươm, ăn kèm lá húng lủi chiên giòn, chấm xốt mayonnaise tương xí muội béo thơm. Món chiên giòn rụm, hải sản tươi ngọt.',
  'recipe-images/rau-cu-va-muc-chien.png',
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

delete from public.recipe_ingredients where recipe_id = (select id from public.recipes where slug = 'rau-cu-va-muc-chien');
insert into public.recipe_ingredients (recipe_id, position, name)
select (select id from public.recipes where slug = 'rau-cu-va-muc-chien'), v.position, v.name
from (values
  (1, 'Mực lá — 150g'),
  (2, 'Củ sen cắt khoanh — 75g'),
  (3, 'Bí đỏ cắt que — 75g'),
  (4, 'Trứng gà — 1 quả'),
  (5, 'Bột tẩm khô chiên giòn — 1/2 gói'),
  (6, 'Xốt mayonnaise — 2 muỗng canh'),
  (7, 'Tương xí muội — 1 muỗng canh'),
  (8, 'Dầu ăn — 4 muỗng canh'),
  (9, 'Rau mầm, húng lủi — 1 ít'),
  (10, 'Nước gừng rượu — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'rau-cu-va-muc-chien');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'rau-cu-va-muc-chien'), v.position, v.step
from (values
  (1, 'Khử mùi tanh: rửa mực qua nước gừng và rượu khoảng 5 phút. Lau thật khô rồi cắt thành que dài cỡ ngón tay.'),
  (2, 'Tẩm bột: trộn mực và rau củ qua một lớp trứng mỏng, sau đó tẩm đều với 1/2 gói bột tẩm khô chiên giòn.'),
  (3, 'Chiên húng lủi: đun nóng dầu, cho lá húng lủi vào chiên giòn rồi vớt ra để ráo dầu.'),
  (4, 'Chiên rau củ: cho củ sen và bí đỏ vào chiên đến khi chín vừa, lớp ngoài vàng giòn.'),
  (5, 'Chiên mực: cho mực vào chiên vừa chín tới thì vớt ra ngay để giữ độ giòn, không bị khô dai.'),
  (6, 'Pha xốt chấm: trộn 2 muỗng canh xốt mayonnaise với 1 muỗng canh tương xí muội. Bày mực và rau củ ra đĩa cùng rau mầm, dùng nóng với xốt chấm.')
) as v(position, step);

-- =============================================================================
-- 24. Mì Xào Thịt Heo Rau Củ
-- =============================================================================
insert into public.recipes (
  category_id, slug, title, description, image_url,
  servings, prep_time, cook_time, difficulty, status, source_name
)
select
  c.id,
  'mi-xao-thit-heo-rau-cu',
  'Mì Xào Thịt Heo Rau Củ',
  'Mì trứng áp chảo xém thơm, phủ lên trên là thịt heo và rau củ xào xốt sánh đậm đà. Món mì đầy đặn, sợi mì dai thơm, xốt thấm vị, thích hợp cho bữa chính.',
  'recipe-images/mi-xao-thit-heo-rau-cu.png',
  4, 7, 8, 'Dễ', 'published',
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
  (1, 'Mì trứng đã ngâm — 200g'),
  (2, 'Thịt nạc dăm — 100g'),
  (3, 'Cải ngọt — 100g'),
  (4, 'Cà rốt — 70g'),
  (5, 'Tỏi băm — 10g'),
  (6, 'Gừng băm — 5g'),
  (7, 'Dầu hào — 10g'),
  (8, 'Đường — 4g'),
  (9, 'Nước tương — 4g'),
  (10, 'Bột ngọt — 3g'),
  (11, 'Hạt nêm thịt heo — 2g'),
  (12, 'Bột năng — 5g'),
  (13, 'Nước — 150g'),
  (14, 'Dầu ăn, tiêu — 1 ít'),
  (15, 'Ngò rí — 1 ít')
) as v(position, name);

delete from public.recipe_steps where recipe_id = (select id from public.recipes where slug = 'mi-xao-thit-heo-rau-cu');
insert into public.recipe_steps (recipe_id, position, step)
select (select id from public.recipes where slug = 'mi-xao-thit-heo-rau-cu'), v.position, v.step
from (values
  (1, 'Sơ chế: cải ngọt rửa sạch, cắt khúc 5cm. Cà rốt gọt vỏ, cắt sợi vừa ăn. Mì ngâm mềm theo hướng dẫn, vớt ra để ráo.'),
  (2, 'Áp chảo mì: cho dầu ăn vào chảo, đợi dầu thật nóng. Cho mì đã ráo vào áp chảo đến khi xém nhẹ mặt, xịt ít nước tương cho thơm.'),
  (3, 'Pha xốt: trộn đều 10g dầu hào, 4g đường, 4g nước tương, 3g bột ngọt, 2g hạt nêm, 5g bột năng và 150g nước.'),
  (4, 'Xào thịt và rau củ: phi thơm tỏi, gừng, cho thịt heo và cà rốt vào xào chín. Thêm cải ngọt, đảo đều.'),
  (5, 'Cho hỗn hợp xốt vào chảo, đảo đều khoảng 2 phút đến khi xốt áo đều thịt và rau củ thì tắt lửa.'),
  (6, 'Cho mì áp chảo ra đĩa, múc hỗn hợp thịt rau củ rưới đều lên trên. Thêm ngò rí, dùng nóng.')
) as v(position, step);

commit;
