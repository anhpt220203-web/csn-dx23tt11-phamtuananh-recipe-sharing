# Docker — demo "Công Thức Việt" (Next.js + Supabase self-hosted)

`docker compose up` dựng **toàn bộ stack local**, không cần Supabase Cloud:

| Service      | Vai trò                              | Port host |
| ------------ | ------------------------------------ | --------- |
| `web-dev`    | App Next.js **dev, hot reload** (mặc định) | 3000 |
| `web`        | App Next.js prod (standalone, `--profile prod`) | 3000 |
| `kong`       | API gateway Supabase (`/auth`, `/rest`, `/storage`) | 8000 |
| `db`         | Postgres 15 (Supabase)               | 54322     |
| `auth`       | GoTrue (Supabase Auth)               | —         |
| `rest`       | PostgREST                            | —         |
| `storage`    | Storage API (file ảnh upload)        | —         |
| `db-migrate` | One-shot: migrations + seed + import ảnh + tài khoản demo | — |

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
4. Nếu máy đang chạy Supabase CLI local (`supabase start`) thì **stop trước** để tránh trùng cổng 54322:
   ```bash
   pnpm --filter web supabase:stop
   ```

## Chạy dev (hot reload — mặc định)

Từ repo root:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env up
```

- `web-dev` mount toàn bộ `src/`, chạy `next dev` — **sửa code trên máy host là trang tự cập nhật**.
- Cổng 3000 bận? Chạy `WEB_PORT=3100 docker compose -f docker/docker-compose.yml --env-file docker/.env up`
  rồi mở http://localhost:3100.
- Lần đầu `db-migrate` tự động: chạy migrations trong `supabase/migrations/`, nạp
  seed `supabase/seed/*.sql` (7 danh mục + 34 công thức + 2 tài khoản), import
  ảnh trong `supabase/seed/images/` vào Storage rồi gắn `image_url` theo slug.
- Dừng: `Ctrl+C` hoặc `docker compose -f docker/docker-compose.yml down`.
- Xoá toàn bộ data demo (DB + storage + node_modules volume): `... down -v`.

## Chạy prod (build standalone)

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env --profile prod up --build
```

Web build production (Next.js standalone) chạy ở http://localhost:3000. Khi bật
`--profile prod`, service `web-dev` không chạy.

**Ảnh demo**: ném file vào `supabase/seed/images/` với tên
`<slug-cong-thuc>.jpg|.png|.webp` (xem `supabase/seed/images/README.md`) rồi
`down -v` + `up` lại — `db-migrate` tự upload vào Storage và gắn `image_url`.
Trình duyệt chỉ thấy ảnh qua proxy `/api/image/...` (cùng origin), không lộ
link storage gốc.

## Tài khoản demo (mật khẩu: `Demo@123456`)

- `phamtuananh@example.com` — admin (quản trị)
- `member@example.com` — user thường

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

Seed đã tự chạy lần đầu. File seed idempotent (upsert), chạy lại an toàn:

```bash
docker compose -f docker/docker-compose.yml --env-file docker/.env run --rm db-migrate
```

(Không cần `down -v`: script đọc marker `seed:<tên-file>` trong
`supabase_migrations.schema_migrations`, muốn nạp lại thì xoá marker tương ứng
hoặc chạy `down -v`.)

## Lưu ý

- `NEXT_PUBLIC_SUPABASE_URL` cố định `http://kong:8000` (dev: qua env của
  service; prod: bake lúc build) — trình duyệt và container cùng gọi qua tên
  `kong`, cần entry `"127.0.0.1 kong"` trong file hosts của máy host.
- Ảnh công thức được phục vụ qua **proxy** `/api/image/<bucket>/<path>` —
  link storage thật không bao giờ xuất hiện trong HTML.
- `SUPABASE_SERVICE_ROLE_KEY` là secret runtime: chỉ truyền lúc chạy container,
  không bake vào image, không commit lên git.
- Các key trong `.env.example` là **key demo cho local** — tuyệt đối không dùng ở production.
- Dockerfile dùng Next.js `output: 'standalone'` (bật qua `OUTPUT_STANDALONE=true`
  khi build Docker), chạy bằng user `nextjs` không phải root.
- Không dùng Supabase Studio trong stack này để nhẹ máy (cần thì mở PR thêm service `studio`).
- Muốn đổi tên site/màu theme lúc build, xem danh sách ARG trong `docker/Dockerfile`.
