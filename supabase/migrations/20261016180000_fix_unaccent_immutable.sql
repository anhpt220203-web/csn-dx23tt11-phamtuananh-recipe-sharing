-- Fix: hàm kit.unaccent của extension là STABLE, không dùng được trong index.
-- Tạo hàm bọc IMMUTABLE để dùng trong GIN index tìm kiếm không dấu.

create or replace function kit.unaccent_immutable(text)
returns text
language sql
immutable
parallel safe
as $$
  select kit.unaccent($1);
$$;

-- Tạo lại index dùng hàm IMMUTABLE
drop index if exists public.recipe_ingredients_name_trgm_idx;
create index if not exists recipe_ingredients_name_trgm_idx
    on public.recipe_ingredients using gin (kit.unaccent_immutable(name) gin_trgm_ops);
