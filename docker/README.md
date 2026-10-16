# Docker — demo "Công Thức Việt" (Next.js + Supabase self-hosted)

`docker compose up` dựng **toàn bộ stack local**, không cần Supabase Cloud:

| Service    | Vai trò                              | Port host |
| ---------- | ------------------------------------ | --------- |
| `web`      | App Next.js (standalone)             | 3000      |
| `kong`     | API gateway Supabase (`/auth`, `/rest`, `/storage`) | 8000 |
| `db`       | Postgres 15 (Supabase)               | 54322     |
| `auth`     | GoTrue (Supabase Auth)               | —         |
| `rest`     | PostgREST                            | —         |
| `storage`  | Storage API (file ảnh upload)        | —         |
| `db-migrate` | One-shot: chạy migrations + seed + tạo tài khoản demo | — |

## Chuẩn bị (làm 1 lần)

1. Cài [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) hoặc Docker Engine (Linux).
2. Copy `docker/.env.example` thành `docker/.env` (đã có sẵn key demo, dùng ngay được):
   ```bash
   cp docker/.env.example docker/.env
   ```
3. **Quan trọng**: thêm dòng sau vào file hosts để trình duyệt gọi được Supabase local qua tên `kong`:
   ```
   127.0.0.1 kong
   ```
   - Windows: mở Notepad **quyền Admin**, sửa `C:\Windows\System32\drivers\etc\hosts`
   - macOS/Linux: `sudo nano /etc/hosts`

## Chạy demo

Từ repo root:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build
```

Lần đầu chạy, `db-migrate` sẽ tự động:
- Chạy toàn bộ migrations trong `src/supabase/migrations/` (tạo bảng, RLS, RPC tìm kiếm...)
- Nạp `src/supabase/seed.sql` → 33 công thức mẫu + 7 danh mục
- Tạo 5 tài khoản demo qua Supabase Auth

Mở http://localhost:3000 để xem demo.

**Tài khoản demo** (mật khẩu: `Demo@123456`):
- `phamtuananh@example.com` — admin (quản trị)
- `tranbich@example.com`, `minhkhoi@example.com`, `hoangyen@example.com`, `duchuy@example.com` — user thường

Dừng: `Ctrl+C`, hoặc:
```bash
docker compose -f docker/docker-compose.yml down
```

Xóa toàn bộ data demo (DB + storage) để chạy lại từ đầu:
```bash
docker compose -f docker/docker-compose.yml down -v
```

## Kiểm tra nhanh

```bash
# API gateway có trả lời không
curl http://kong:8000/auth/v1/health

# REST API có dữ liệu danh mục không (cần header apikey)
curl -H "apikey: $(grep '^ANON_KEY=' docker/.env | cut -d= -f2)" \
  "http://kong:8000/rest/v1/categories?select=name&limit=3"

# Xem log của service migrate
docker compose -f docker/docker-compose.yml logs db-migrate
```

## Nạp lại seed thủ công

Seed đã tự chạy lần đầu. Muốn nạp lại (file idempotent, chạy lại an toàn):

```bash
docker compose -f docker/docker-compose.yml run --rm \
  -v ./src/supabase/seed.sql:/seed/seed.sql db-migrate \
  bash -c 'PGPASSWORD=$POSTGRES_PASSWORD psql -h db -U postgres -d postgres -f /seed/seed.sql'
```

Hoặc kết nối trực tiếp vào Postgres (port host `54322`, user `postgres`, password trong `docker/.env`):
```bash
psql -h localhost -p 54322 -U postgres -d postgres
```

## Lưu ý

- `NEXT_PUBLIC_SUPABASE_URL` được cố định là `http://kong:8000` trong `docker-compose.yml` (bake vào image lúc build). Đổi giá trị phải build lại.
- `SUPABASE_SERVICE_ROLE_KEY` là secret runtime: chỉ truyền lúc chạy container, không bake vào image, không commit lên git.
- Các key trong `.env.example` là **key demo cho local** — tuyệt đối không dùng ở production.
- Dockerfile dùng Next.js `output: 'standalone'` (đã bật trong `src/apps/web/next.config.mjs`), chạy bằng user `nextjs` không phải root.
- Không dùng Supabase Studio trong stack này để nhẹ máy (cần thì mở PR thêm service `studio`).
- Muốn đổi tên site/màu theme lúc build, xem danh sách ARG trong `docker/Dockerfile`.
