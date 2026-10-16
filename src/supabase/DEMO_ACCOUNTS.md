# Tài khoản demo — hướng dẫn tạo và phân quyền admin

Tài khoản Supabase Auth **không** tạo bằng SQL mà tạo qua Dashboard hoặc Auth Admin API.
Mật khẩu chung cho tất cả tài khoản demo: `Demo@123456`

| Email | Vai trò | Ghi chú |
|---|---|---|
| `phamtuananh@example.com` | admin | Quản trị viên |
| `tranbich@example.com` | user | Người dùng thường |
| `minhkhoi@example.com` | user | Người dùng thường |
| `hoangyen@example.com` | user | Người dùng thường |
| `duchuy@example.com` | user | Người dùng thường |

## Cách 1 — Tạo thủ công qua Dashboard (khuyên dùng)

1. Vào Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Nhập email + mật khẩu `Demo@123456`, tick **Auto Confirm User** → **Create user**.
3. Lặp lại cho cả 5 tài khoản.

### Gán quyền admin

Sau khi tạo xong `phamtuananh@example.com`, vào **SQL Editor** chạy:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
where email = 'phamtuananh@example.com';
```

Kiểm tra:

```sql
select email, raw_app_meta_data->>'role' as role
from auth.users
where email like '%@example.com';
```

## Cách 2 — Tạo qua Auth Admin API (cần service_role key)

```bash
# Tạo user (lặp lại cho từng email)
curl -X POST 'https://<project-ref>.supabase.co/auth/v1/admin/users' \
  -H "apikey: <service_role_key>" \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "phamtuananh@example.com",
    "password": "Demo@123456",
    "email_confirm": true,
    "user_metadata": {"name": "Phạm Tuấn Anh"}
  }'

# Gán quyền admin (thay <user-id> bằng id trả về ở bước trên)
curl -X PUT 'https://<project-ref>.supabase.co/auth/v1/admin/users/<user-id>' \
  -H "apikey: <service_role_key>" \
  -H "Authorization: Bearer <service_role_key>" \
  -H "Content-Type: application/json" \
  -d '{"app_metadata": {"role": "admin"}}'
```

## Lưu ý

- Hàm `kit.is_admin()` trong RLS kiểm tra `raw_app_meta_data ->> 'role' = 'admin'`.
- **Không** commit service_role key lên git.
- Trên môi trường Docker local (`docker compose up`), service `db-migrate` tự tạo cả 5 tài khoản — không cần làm tay.
