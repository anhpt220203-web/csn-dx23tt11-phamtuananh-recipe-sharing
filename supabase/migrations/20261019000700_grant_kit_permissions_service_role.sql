-- Fix: quyền thực thi kit.unaccent_immutable cho role service_role
-- Khi cập nhật / lưu công thức từ admin action (chạy bằng service_role key),
-- việc insert vào recipe_ingredients kích hoạt cập nhật GIN index:
--   kit.unaccent_immutable(name) kit.gin_trgm_ops
-- Nếu service_role thiếu quyền USAGE trên schema kit hoặc EXECUTE trên hàm này,
-- Postgres sẽ báo lỗi: "permission denied for function unaccent_immutable".

GRANT USAGE ON SCHEMA kit TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA kit TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION kit.unaccent_immutable(text) TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA kit GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;
