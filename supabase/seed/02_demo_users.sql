-- =============================================================================
-- SEED DEMO USERS: 2 tài khoản demo (1 admin + 1 member).
-- Idempotent: dùng ON CONFLICT theo email, an toàn khi chạy lại nhiều lần.
--
-- QUAN TRỌNG — GoTrue v2.19x rất khó tính với user insert thẳng bằng SQL,
-- thiếu/khác bất kỳ mục nào dưới đây sẽ báo "Invalid login credentials"
-- hoặc 500 khi đăng nhập:
--   1. instance_id = '00000000-0000-0000-0000-000000000000' (zero UUID —
--      GoTrue tìm user theo instance_id; NULL không được match).
--   2. aud = '' (khớp GOTRUE_JWT_AUD mặc định rỗng).
--   3. Các cột token (confirmation_token, recovery_token, email_change*,
--      reauthentication_token, phone_change_token) phải là '' chứ KHÔNG
--      được NULL (GoTrue scan string, gặp NULL văng 500).
--   4. phone phải là NULL (unique index users_phone_key không cho 2 dòng '').
--   5. Bắt buộc có dòng tương ứng trong auth.identities (provider 'email')
--      — không có thì đăng nhập không bao giờ thành công.
-- Lưu ý khác: auth.users dùng partial unique index trên email
-- (users_email_partial_key ... WHERE is_sso_user = false), nên conflict
-- target phải khai báo cùng predicate đó.
-- Chạy sau 01_demo_recipe.sql. Mật khẩu: Demo@123456 (bcrypt qua pgcrypto).
-- =============================================================================

begin;

-- Đảm bảo extension pgcrypto có sẵn để dùng crypt()/gen_salt()
create extension if not exists "pgcrypto" schema extensions;

-- ─── 1. Admin: phamtuananh@example.com ───
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change,
  phone_change_token, reauthentication_token,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  '',
  'authenticated',
  'phamtuananh@example.com',
  extensions.crypt('Demo@123456', extensions.gen_salt('bf', 10)),
  now(), now(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"name":"Phạm Tuấn Anh","email_verified":true}',
  '', '', '', '', '', '', '',
  now(), now()
)
on conflict (email) where is_sso_user = false do update set
  instance_id = excluded.instance_id,
  aud = excluded.aud,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
  confirmed_at = coalesce(auth.users.confirmed_at, now()),
  raw_app_meta_data = auth.users.raw_app_meta_data || '{"role":"admin"}',
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

-- ─── 2. Member: member@example.com ───
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new,
  email_change_token_current, email_change,
  phone_change_token, reauthentication_token,
  created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  '22222222-2222-4222-8222-222222222222',
  '',
  'authenticated',
  'member@example.com',
  extensions.crypt('Demo@123456', extensions.gen_salt('bf', 10)),
  now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Thành viên Demo","email_verified":true}',
  '', '', '', '', '', '', '',
  now(), now()
)
on conflict (email) where is_sso_user = false do update set
  instance_id = excluded.instance_id,
  aud = excluded.aud,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
  confirmed_at = coalesce(auth.users.confirmed_at, now()),
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

-- ─── 3. auth.identities — GoTrue bắt buộc, không có là không đăng nhập được ───
insert into auth.identities (
  id, user_id, provider_id, identity_data,
  last_sign_in_at, created_at, updated_at
)
select
  u.id::text, u.id, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.email in ('phamtuananh@example.com', 'member@example.com')
on conflict (provider_id, user_id) do nothing;

-- ─── 4. Dòng public.accounts tương ứng (theo logic trigger kit.new_user_created_setup) ───
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
where u.email in ('phamtuananh@example.com', 'member@example.com')
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  updated_at = now();

commit;
