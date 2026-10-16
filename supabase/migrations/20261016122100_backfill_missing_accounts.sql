-- ============================================================================
-- Backfill: tạo dòng public.accounts còn thiếu cho user trong auth.users
--
-- Nguyên nhân: tài khoản tạo tay qua Supabase Dashboard (Authentication > Users
-- > Add user) không kích hoạt trigger kit.new_user_created_setup() trong một số
-- trường hợp, dẫn tới thiếu dòng trong public.accounts. Trang /home/settings
-- query bảng này bằng .single() nên throw error và kẹt ở màn hình loading.
--
-- Migration này quét mọi user trong auth.users chưa có dòng tương ứng trong
-- public.accounts và tạo dòng mới, dùng cùng logic đặt tên với trigger gốc:
--   1. raw_user_meta_data ->> 'name'
--   2. phần trước @ của email
--   3. chuỗi rỗng
-- Idempotent: chỉ insert khi chưa tồn tại (a.id is null), an toàn chạy lại.
-- ============================================================================

insert into public.accounts (id, name, picture_url, email, created_by)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'name', ''),
    nullif(split_part(u.email, '@', 1), ''),
    ''
  ),
  u.raw_user_meta_data ->> 'avatar_url',
  u.email,
  u.id
from auth.users u
left join public.accounts a on a.id = u.id
where a.id is null
on conflict (id) do nothing;
