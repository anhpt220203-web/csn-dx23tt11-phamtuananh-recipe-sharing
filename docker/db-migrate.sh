#!/bin/bash
# One-shot: chạy migrations, nạp seed, import ảnh demo, tạo tài khoản demo
# cho Supabase self-hosted. Chạy 1 lần khi `docker compose up` (service db-migrate).
set -u

log() { echo "[db-migrate] $*"; }
die() { log "LỖI: $*"; exit 1; }

: "${PGHOST:?}" "${PGPORT:?}" "${PGDATABASE:?}" "${PGUSER:?}" "${PGPASSWORD:?}"
: "${KONG_URL:?}" "${SERVICE_ROLE_KEY:?}"
SEED_DEMO_DATA="${SEED_DEMO_DATA:-true}"

PSQL="psql -v ON_ERROR_STOP=1 -q"

wait_tcp() { # host port, tối đa ~120s
  local host="$1" port="$2" i
  for i in $(seq 1 60); do
    if (echo > "/dev/tcp/${host}/${port}") 2>/dev/null; then
      log "$host:$port sẵn sàng."
      return 0
    fi
    sleep 2
  done
  return 1
}

log "Đợi Postgres..."
wait_tcp "$PGHOST" "$PGPORT" || die "không kết nối được Postgres."

log "Đợi auth (GoTrue)..."
wait_tcp auth 9999 || die "GoTrue chưa sẵn sàng."
log "Đợi PostgREST..."
wait_tcp rest 3000 || die "PostgREST chưa sẵn sàng."
log "Đợi storage-api..."
wait_tcp storage 5000 || die "storage-api chưa sẵn sàng."

# GoTrue và storage-api tự migrate schema auth/storage khi khởi động,
# nhưng cho thêm thời gian để chắc chắn bảng đã được tạo.
log "Đợi schema auth/storage khởi tạo..."
for i in $(seq 1 30); do
  if $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -tAc \
    "select 1 from information_schema.tables where table_schema='auth' and table_name='users'" | grep -q 1 \
    && $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -tAc \
    "select 1 from information_schema.tables where table_schema='storage' and table_name='buckets'" | grep -q 1; then
    log "Schema auth/storage đã sẵn sàng."
    break
  fi
  [ "$i" -eq 30 ] && die "hết thời gian chờ schema auth/storage."
  sleep 4
done

# Role Supabase (phòng khi volume db-data đã tồn tại từ trước khi có db-init/)
$PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN CREATE ROLE authenticator NOINHERIT LOGIN; END IF;
END $$;
SQL
# Password authenticator phải khớp PGRST_DB_URI (dùng PGPASSWORD từ env service)
$PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c \
  "ALTER ROLE authenticator WITH PASSWORD '$PGPASSWORD';" >/dev/null
$PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c \
  "GRANT anon, authenticated, service_role TO authenticator;" >/dev/null
log "Roles đã đảm bảo."

# Schema + extension nền mà migrations/seed cần (CLI Supabase thường tự cài,
# stack docker self-hosted thì không — phải đảm bảo trước khi chạy migrations).
$PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -q <<'SQL'
create schema if not exists extensions;
create schema if not exists kit;
create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "pgcrypto" schema extensions;
create extension if not exists "pg_trgm" schema kit;
create extension if not exists "unaccent" schema kit;
SQL
log "Schema + extension nền đã sẵn sàng."

# Bảng theo dõi migrations đã chạy
$PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" <<'SQL'
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL

# Chạy migrations theo thứ tự tên file (kèm retry nếu auth/storage chưa xong hẳn)
applied=0
for f in $(ls /migrations/*.sql | sort); do
  version="$(basename "$f" .sql)"
  done_already="$($PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -tAc \
    "select 1 from supabase_migrations.schema_migrations where version='$version'")"
  if [ "$done_already" = "1" ]; then
    log "Bỏ qua (đã chạy): $version"
    continue
  fi
  log "Chạy migration: $version"
  ok=0
  for attempt in 1 2 3 4 5; do
    if $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f "$f" 2>/tmp/mig.err; then
      ok=1; break
    fi
    log "Thử lần $attempt thất bại, đợi 10s rồi thử lại..."
    sleep 10
  done
  [ "$ok" -eq 1 ] || { log "Migration thất bại:"; cat /tmp/mig.err; die "$version"; }
  $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c \
    "insert into supabase_migrations.schema_migrations(version) values ('$version') on conflict do nothing;" >/dev/null
  applied=$((applied + 1))
done
log "Migrations: $applied file mới được áp dụng."
# PostgREST giữ schema cache từ lúc khởi động — báo nó reload sau khi có DDL.
$PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "notify pgrst, 'reload schema';" >/dev/null
sleep 2

# ─── Nạp seed data (supabase/seed/*.sql, idempotent, theo thứ tự tên file) ───
if [ "$SEED_DEMO_DATA" = "true" ]; then
  for f in $(ls /seed/*.sql | sort); do
    version="$(basename "$f" .sql)"
    done_already="$($PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -tAc \
      "select 1 from supabase_migrations.schema_migrations where version='seed:$version'")"
    if [ "$done_already" = "1" ]; then
      log "Seed bỏ qua (đã nạp): $version"
      continue
    fi
    log "Nạp seed: $version"
    $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -f "$f" \
      || die "nạp seed $version thất bại."
    $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c \
      "insert into supabase_migrations.schema_migrations(version) values ('seed:$version') on conflict do nothing;" >/dev/null
  done
  log "Seed SQL xong."
  $PSQL -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -c "notify pgrst, 'reload schema';" >/dev/null
  sleep 2

  # Import ảnh demo (supabase/seed/images/) vào Storage + gắn image_url theo slug.
  if ls /seed/images/* >/dev/null 2>&1; then
    log "Import ảnh demo vào Storage..."
    SUPABASE_URL="$KONG_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
    SEED_IMAGES_DIR=/seed/images \
    bash /upload-seed-images.sh || log "CẢNH BÁO: import ảnh có lỗi — web vẫn chạy (ảnh demo sẽ thiếu)."
  else
    log "Không có ảnh demo trong /seed/images — bỏ qua import."
  fi
else
  log "SEED_DEMO_DATA=false: bỏ qua seed."
fi

# Tạo 5 tài khoản demo qua GoTrue Admin API (idempotent: bỏ qua nếu đã tồn tại)
create_user() { # email password role
  local email="$1" password="$2" role="$3" resp code
  if curl -sf -m 10 "$KONG_URL/auth/v1/admin/users" \
      -H "apikey: $SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SERVICE_ROLE_KEY" | grep -q "\"$email\""; then
    log "Tài khoản đã tồn tại: $email"
    return 0
  fi
  resp="$(curl -s -m 15 -o /tmp/user.json -w "%{http_code}" -X POST "$KONG_URL/auth/v1/admin/users" \
    -H "apikey: $SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"email_confirm\":true,\"app_metadata\":{\"role\":\"$role\"},\"user_metadata\":{}}")"
  code="$resp"
  if [ "$code" = "200" ] || [ "$code" = "201" ]; then
    log "Đã tạo tài khoản: $email ($role)"
  elif [ "$code" = "500" ] && grep -q "23505\|already exists" /tmp/user.json 2>/dev/null; then
    # Seed SQL đã tạo user này trước đó (duplicate email) — coi như thành công.
    log "Tài khoản đã tồn tại (từ seed SQL): $email"
  else
    log "CẢNH BÁO: tạo $email thất bại (HTTP $code): $(head -c 200 /tmp/user.json)"
  fi
}

log "Tạo tài khoản demo..."
#create_user "phamtuananh@example.com" "Demo@123456" "admin"
#create_user "member@example.com" "Demo@123456" ""

log "XONG. Web app có thể khởi động."
