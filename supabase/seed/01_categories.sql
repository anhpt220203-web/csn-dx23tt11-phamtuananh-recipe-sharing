-- =============================================================================
-- SEED 01: Danh mục món ăn (7 danh mục)
-- Idempotent: upsert theo slug, an toàn khi chạy lại.
-- =============================================================================

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


