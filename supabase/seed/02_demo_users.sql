-- =============================================================================
-- SEED DEMO USERS: 2 tài khoản demo (1 admin + 1 member).
-- Idempotent: dùng ON CONFLICT theo email, an toàn khi chạy lại nhiều lần.
-- LƯU Ý: auth.users dùng partial unique index trên email
-- (users_email_partial_key ... WHERE is_sso_user = false), nên conflict
-- target phải khai báo cùng predicate đó, nếu không Postgres báo lỗi
-- "there is no unique or exclusion constraint matching the ON CONFLICT
-- specification".
-- Chạy sau 01_demo.sql. Mật khẩu: Demo@123456 (hash bcrypt qua pgcrypto).
-- =============================================================================

begin;

-- Đảm bảo extension pgcrypto có sẵn để dùng crypt()/gen_salt()
create extension if not exists "pgcrypto" schema extensions;

-- ─── 1. Admin: phamtuananh@example.com ───
insert into auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values (
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'phamtuananh@example.com',
  extensions.crypt('Demo@123456', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"name":"Phạm Tuấn Anh"}',
  now(),
  now()
)
on conflict (email) where is_sso_user = false do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
  raw_app_meta_data = auth.users.raw_app_meta_data || '{"role":"admin"}',
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

-- ─── 2. Member: member@example.com ───
insert into auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values (
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'member@example.com',
  extensions.crypt('Demo@123456', extensions.gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Thành viên Demo"}',
  now(),
  now()
)
on conflict (email) where is_sso_user = false do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

-- ─── 3. Dòng public.accounts tương ứng (theo logic trigger kit.new_user_created_setup) ───
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
