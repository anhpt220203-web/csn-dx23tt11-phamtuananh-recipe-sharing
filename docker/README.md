# Docker — build & chạy demo "Công Thức Việt"

## Chuẩn bị

1. Cài [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) hoặc Docker Engine (Linux).
2. Chuẩn bị Supabase cloud:
   - Lấy `URL`, `anon key`, `service_role key` tại Supabase Dashboard → Project Settings → API.
   - Chạy `src/supabase/seed.sql` trong SQL Editor để nạp 33 công thức mẫu + 7 danh mục (file idempotent, chạy lại an toàn).
3. Copy `docker/.env.example` thành `docker/.env` và điền 4 giá trị trên.

## Cách 1: docker compose (khuyên dùng)

Từ repo root:

```bash
cp docker/.env.example docker/.env   # rồi điền key thật
docker compose -f docker/docker-compose.yml --env-file docker/.env up --build
```

Mở http://localhost:3000 để xem demo. Dừng bằng `Ctrl+C`, xóa container bằng:

```bash
docker compose -f docker/docker-compose.yml down
```

## Cách 2: docker build + docker run thủ công

Từ repo root:

```bash
docker build -f docker/Dockerfile -t cong-thuc-viet:demo . \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi... \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000

docker run --rm -p 3000:3000 \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... \
  cong-thuc-viet:demo
```

## Lưu ý

- `NEXT_PUBLIC_*` là biến **build-time**: đổi giá trị phải build lại image.
- `SUPABASE_SERVICE_ROLE_KEY` là **secret runtime**: chỉ truyền lúc chạy container (`-e` hoặc `environment:`), không bake vào image, không commit lên git.
- Dockerfile dùng Next.js `output: 'standalone'` (đã bật trong `src/apps/web/next.config.mjs`) nên image gọn, chạy bằng user `nextjs` không phải root.
- Muốn đổi tên site/màu theme lúc build, truyền thêm `--build-arg NEXT_PUBLIC_SITE_TITLE="..."` (xem danh sách ARG trong `docker/Dockerfile`).
