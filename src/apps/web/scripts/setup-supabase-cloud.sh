#!/bin/bash
# =============================================================================
# Setup Supabase CLOUD (cho deploy Vercel) — chạy từ máy local.
#
# Làm đầy đủ các bước để một project Supabase cloud sẵn sàng cho app:
#   1. supabase link  — nối repo với project cloud
#   2. supabase db push — áp toàn bộ supabase/migrations/ lên cloud
#   3. Chạy seed SQL (supabase/seed/*.sql) — danh mục, công thức, tài khoản demo
#   4. Upload ảnh demo (supabase/seed/images/) lên Storage bucket recipe-images
#
# Chuẩn bị:
#   - Đã `pnpm exec supabase login` (hoặc đặt SUPABASE_ACCESS_TOKEN)
#   - Env hoặc biến prompt:
#       SUPABASE_PROJECT_REF      — project ref (abcxyz.supabase.co)
#       SUPABASE_DB_PASSWORD      — mật khẩu Postgres của project (cho db push)
#       SUPABASE_URL              — https://<ref>.supabase.co
#       SUPABASE_SERVICE_ROLE_KEY — service key (Dashboard → Settings → API)
#
# Chạy:  pnpm --filter web supabase:setup-cloud
# =============================================================================
set -euo pipefail

log() { echo "[setup-cloud] $*"; }
die() { log "LỖI: $*"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/../../../.."

# Đọc env từ apps/web/.env.local nếu chưa đặt (máy dev thường có sẵn).
if [ -f "$SCRIPT_DIR/../.env.local" ]; then
  SUPABASE_PROJECT_REF="${SUPABASE_PROJECT_REF:-$(grep -E '^SUPABASE_PROJECT_REF=' "$SCRIPT_DIR/../.env.local" | head -1 | cut -d= -f2- | tr -d '\r')}"
  SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-$(grep -E '^SUPABASE_DB_PASSWORD=' "$SCRIPT_DIR/../.env.local" | head -1 | cut -d= -f2- | tr -d '\r')}"
  SUPABASE_URL="${SUPABASE_URL:-$(grep -E '^NEXT_PUBLIC_SUPABASE_URL=' "$SCRIPT_DIR/../.env.local" | head -1 | cut -d= -f2- | tr -d '\r')}"
  SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$(grep -E '^SUPABASE_SERVICE_ROLE_KEY=' "$SCRIPT_DIR/../.env.local" | head -1 | cut -d= -f2- | tr -d '\r')}"
fi

# Nếu chưa có project ref, hỏi (dán vào là xong).
if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  printf "[setup-cloud] Project ref (phần trước .supabase.co): "
  read -r SUPABASE_PROJECT_REF
  [ -n "$SUPABASE_PROJECT_REF" ] || die "Cần project ref."
fi
if [ -z "${SUPABASE_URL:-}" ]; then
  SUPABASE_URL="https://$SUPABASE_PROJECT_REF.supabase.co"
fi
[ -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ] || die "Cần SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API)."

command -v supabase >/dev/null 2>&1 || die "Chưa cài Supabase CLI (chạy: pnpm --filter web exec supabase --version để kiểm tra)."

cd "$REPO_ROOT/supabase"

# ─── 1. Link project ───
log "Link project $SUPABASE_PROJECT_REF..."
if [ -n "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN" supabase link --project-ref "$SUPABASE_PROJECT_REF"
else
  supabase link --project-ref "$SUPABASE_PROJECT_REF"
fi

# ─── 2. Push migrations ───
log "Push migrations lên cloud..."
SUPABASE_DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}" supabase db push --include-all

# ─── 3. Seed SQL ───
log "Chạy seed SQL (idempotent)..."
for f in "$REPO_ROOT"/supabase/seed/*.sql; do
  log "  - $(basename "$f")"
  supabase db execute --file "$f"
done

# ─── 4. Ảnh demo lên Storage ───
if ls "$REPO_ROOT"/supabase/seed/images/* >/dev/null 2>&1; then
  log "Upload ảnh demo lên Storage..."
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  SEED_IMAGES_DIR="$REPO_ROOT/supabase/seed/images" \
  bash "$SCRIPT_DIR/upload-seed-images.sh"
else
  log "Không có ảnh trong supabase/seed/images/ — bỏ qua."
fi

log "XONG. Các biến env cần đặt trong Vercel (Project Settings → Environment Variables):"
log "  NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL"
log "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key từ Dashboard → Settings → API>"
log "  SUPABASE_SERVICE_ROLE_KEY=<service key>"
log "  NEXT_PUBLIC_SITE_URL=https://<domain-vercel-của-bạn>"
