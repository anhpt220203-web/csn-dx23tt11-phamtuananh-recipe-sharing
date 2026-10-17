#!/bin/bash
# =============================================================================
# Import ảnh demo công thức vào Supabase Storage + gắn image_url theo slug.
#
# Dùng được cả local lẫn trong docker (service db-migrate gọi script này):
#   - Local:   pnpm --filter web seed:images
#              (env đọc từ src/apps/web/.env.local nếu chưa đặt)
#   - Docker:  db-migrate.sh export env rồi gọi script này.
#
# Env bắt buộc:
#   SUPABASE_URL        — URL gốc của Supabase (kong/hosted),vd http://127.0.0.1:54321
#   SUPABASE_SERVICE_ROLE_KEY — service key (bypass RLS để upload + update)
# Tuỳ chọn:
#   SEED_IMAGES_DIR     — thư mục ảnh (mặc định: supabase/seed/images cạnh script)
#   SUPABASE_DB_URL     — (docker) PostgREST URL nếu muốn dùng thay vì $SUPABASE_URL/rest
# =============================================================================
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Đọc .env.local của app nếu env chưa được đặt (chạy local trên máy dev).
if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/../.env.local}"
  if [ -f "$ENV_FILE" ]; then
    SUPABASE_URL="${SUPABASE_URL:-$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r')}"
    SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r')}"
  fi
fi

: "${SUPABASE_URL:?Chưa đặt SUPABASE_URL}"
: "${SUPABASE_SERVICE_ROLE_KEY:?Chưa đặt SUPABASE_SERVICE_ROLE_KEY}"

IMAGES_DIR="${SEED_IMAGES_DIR:-$SCRIPT_DIR/../../../../supabase/seed/images}"
BUCKET="${SEED_IMAGES_BUCKET:-recipe-images}"
REST_URL="${SUPABASE_DB_URL:-$SUPABASE_URL/rest/v1}"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "[seed:images] Không tìm thấy thư mục ảnh: $IMAGES_DIR — bỏ qua."
  exit 0
fi

shopt -s nullglob
files=("$IMAGES_DIR"/*)
if [ ${#files[@]} -eq 0 ]; then
  echo "[seed:images] Thư mục ảnh trống — bỏ qua (xem supabase/seed/images/README.md)."
  exit 0
fi

uploaded=0
for file in "${files[@]}"; do
  fname="$(basename "$file")"

  # Bỏ qua file tài liệu (README.md...) — chỉ nhận đuôi ảnh.
  case "$fname" in
    *.jpg|*.jpeg|*.png|*.webp|*.avif) ;;
    *) continue ;;
  esac

  slug="${fname%.*}"

  # Dò content-type theo đuôi file (không phụ thuộc lệnh `file`).
  case "$fname" in
    *.png)  content_type="image/png" ;;
    *.webp) content_type="image/webp" ;;
    *.avif) content_type="image/avif" ;;
    *)      content_type="image/jpeg" ;;
  esac

  code="$(curl -s -m 60 -o /tmp/seed-img-resp.json -w "%{http_code}" \
    -X POST "$SUPABASE_URL/storage/v1/object/$BUCKET/$fname" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "x-upsert: true" \
    -H "Content-Type: $content_type" \
    --data-binary "@$file")"

  if [ "$code" = "200" ] || [ "$code" = "201" ]; then
    echo "[seed:images] Đã upload: $fname"
  else
    echo "[seed:images] CẢNH BÁO: upload $fname thất bại (HTTP $code): $(head -c 200 /tmp/seed-img-resp.json)"
    continue
  fi

  # Gắn image_url = '<bucket>/<file>' cho công thức trùng slug (qua PostgREST,
  # không cần psql nên chạy được ở mọi môi trường).
  link_code="$(curl -s -m 15 -o /tmp/seed-img-link.json -w "%{http_code}" \
    -X PATCH "$REST_URL/recipes?slug=eq.$slug" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"image_url\":\"$BUCKET/$fname\"}")"

  if [ "$link_code" = "200" ] || [ "$link_code" = "204" ]; then
    echo "[seed:images] Đã gắn image_url cho slug: $slug"
  else
    echo "[seed:images] CẢNH BÁO: gắn image_url cho $slug thất bại (HTTP $link_code)"
  fi

  uploaded=$((uploaded + 1))
done

echo "[seed:images] XONG: $uploaded ảnh trong bucket '$BUCKET'."
