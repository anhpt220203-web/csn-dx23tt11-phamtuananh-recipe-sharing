-- ═══════════════════════════════════════════════════════════
-- Đảm bảo hàm kit.unaccent_immutable tồn tại TRƯỚC khi
-- 20261016122353_fix_search_kit_permission.sql cấp quyền execute
-- (file đó chạy trước 20261016180000_fix_unaccent_immutable.sql
-- — nơi định nghĩa đầy đủ hàm — nên db reset từ đầu bị lỗi
-- "function kit.unaccent_immutable(text) does not exist").
-- Định nghĩa giống hệt bản ở 20261016180000, idempotent.
-- ═══════════════════════════════════════════════════════════

create or replace function kit.unaccent_immutable(text)
returns text
language sql
immutable
parallel safe
as $$
  select kit.unaccent($1);
$$;
