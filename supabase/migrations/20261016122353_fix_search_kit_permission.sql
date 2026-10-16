-- Fix: /tim-kiem lỗi "permission denied for schema kit".
--
-- Hàm public.search_recipes chạy ở chế độ SECURITY INVOKER (mặc định) và gọi
-- kit.unaccent(...) trong thân hàm. Khi role anon/authenticated gọi RPC qua
-- PostgREST, lệnh gọi kit.unaccent cũng chạy với quyền của caller — mà các
-- role này chưa có USAGE trên schema kit nên bị từ chối.
--
-- Giải pháp: grant USAGE trên schema kit + EXECUTE trên các hàm unaccent
-- cho anon/authenticated. Index GIN (kit.gin_trgm_ops) không cần quyền
-- runtime vì index không thực thi ở thời điểm query của user thường.

grant usage on schema kit to anon, authenticated;

-- Hàm unaccent của extension (search_recipes dùng bản 1 tham số).
-- Grant cả 2 overload cho chắc chắn.
grant execute on function kit.unaccent(text) to anon, authenticated;
grant execute on function kit.unaccent(regdictionary, text) to anon, authenticated;

-- Hàm bọc IMMUTABLE dùng trong GIN index (phòng khi có query khác gọi trực tiếp).
grant execute on function kit.unaccent_immutable(text) to anon, authenticated;
