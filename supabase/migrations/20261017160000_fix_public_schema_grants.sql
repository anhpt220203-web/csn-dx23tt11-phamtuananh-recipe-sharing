-- Fix lỗi trang chủ crash với "permission denied for schema public"
-- cho người dùng chưa đăng nhập (role anon).
--
-- Nguyên nhân gốc:
-- 1. Migration gốc MakerKit (20241219010757_schema.sql) đã REVOKE toàn bộ
--    quyền trên schema public khỏi role anon, chỉ GRANT USAGE lại cho
--    authenticated và service_role. Khách vãng lai (anon) vì thế không
--    truy cập được BẤT KỲ bảng nào trong schema public.
-- 2. Các migration tạo bảng banners/tips (20261016160000) và
--    tags/recipe_tags/recipe_questions (20261016170000) chỉ tạo RLS policy
--    mà quên GRANT SELECT cho anon/authenticated.
--
-- Kết quả: trang chủ (gọi getCategories, getLatestRecipes, getActiveBanners,
-- getPublishedTips dưới quyền anon) throw -> Next.js error page
-- (React error #441: "An error occurred in the Server Components render").

-- 1. Cho phép anon dùng schema public (đọc các bảng công khai)
grant usage on schema public to anon;

-- 2. Cấp quyền đọc các bảng nội dung công khai còn thiếu GRANT
grant select on public.banners to anon, authenticated;
grant select on public.tips to anon, authenticated;
grant select on public.tags to anon, authenticated;
grant select on public.recipe_tags to anon, authenticated;
grant select on public.recipe_questions to anon, authenticated;

-- 3. Đảm bảo các bảng công thức chính cũng có đủ quyền (idempotent,
--    phòng khi migration gốc chưa chạy đầy đủ)
grant select on public.categories to anon, authenticated;
grant select on public.recipes to anon, authenticated;
grant select on public.recipe_ingredients to anon, authenticated;
grant select on public.recipe_steps to anon, authenticated;
