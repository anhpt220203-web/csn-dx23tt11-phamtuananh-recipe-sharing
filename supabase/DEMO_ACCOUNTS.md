# Tài khoản demo

Mật khẩu chung cho tất cả tài khoản demo: `Demo@123456`

| Email | Vai trò | Tên hiển thị |
|---|---|---|
| `phamtuananh@example.com` | admin | Phạm Tuấn Anh |
| `member@example.com` | member | Thành viên Demo |

## Nguồn tạo

Hai tài khoản được tạo bởi seed SQL `supabase/seed/02_demo_users.sql`: chèn thẳng
vào `auth.users` với mật khẩu hash bcrypt (qua `pgcrypto`), email đã xác nhận, và
tạo dòng tương ứng trong `public.accounts`. Seed idempotent — chạy lại sẽ cập nhật
mật khẩu về `Demo@123456` thay vì tạo trùng user.

### Môi trường local (Supabase CLI + Docker)

Sau khi `db reset` (migrate xong), nạp seed thủ công:

```bash
docker cp supabase/seed/02_demo_users.sql supabase_db_recipe-sharing:/tmp/
MSYS_NO_PATHCONV=1 docker exec supabase_db_recipe-sharing psql -U postgres -d postgres -f /tmp/02_demo_users.sql
```

Lệnh reset đầy đủ chạy từ `src/`: `pnpm --filter web supabase:reset`.

### Môi trường cloud (project liên kết)

`supabase db push` chỉ đẩy migrations, **không** đẩy seed. Chạy nội dung file
`supabase/seed/02_demo_users.sql` trong SQL Editor của Dashboard, hoặc tạo tay
2 tài khoản theo một trong hai cách dưới đây.

## Cách tạo thủ công (khi không dùng seed)

### Cách 1 — Dashboard

1. Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Nhập email + mật khẩu `Demo@123456`, tick **Auto Confirm User** → **Create user**.
3. Lặp lại cho cả 2 tài khoản.

Sau đó gán admin cho `phamtuananh@example.com` trong **SQL Editor**:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'phamtuananh@example.com';
```

### Cách 2 — Auth Admin API (cần service_role key)

```bash
# Admin (gồm luôn app_metadata role)
curl -X POST 'https://<project-ref>.supabase.co/auth/v1/admin/users' \
  -H "apikey: <service_role_key>" \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "phamtuananh@example.com",
    "password": "Demo@123456",
    "email_confirm": true,
    "user_metadata": {"name": "Phạm Tuấn Anh"},
    "app_metadata": {"role": "admin"}
  }'

# Member
curl -X POST 'https://<project-ref>.supabase.co/auth/v1/admin/users' \
  -H "apikey: <service_role_key>" \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "member@example.com",
    "password": "Demo@123456",
    "email_confirm": true,
    "user_metadata": {"name": "Thành viên Demo"}
  }'
```

## Kiểm tra

```sql
select email, raw_app_meta_data->>'role' as role
from auth.users
where email in ('phamtuananh@example.com', 'member@example.com');
```

## Lưu ý

- Hàm `kit.is_admin()` (dùng trong RLS) đọc JWT `app_metadata.role` — chính là
  `raw_app_meta_data ->> 'role'` — phải bằng `'admin'` mới được quyền ghi.
- **Không** commit service_role key lên git.
