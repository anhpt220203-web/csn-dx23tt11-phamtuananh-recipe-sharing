#!/bin/bash
# Chạy 1 lần khi volume db-data được khởi tạo (docker-entrypoint-initdb.d).
# Tạo schema auth/storage — GoTrue và storage-api tự migrate bảng của chúng
# vào đây lúc khởi động (không tự tạo schema), nếu thiếu sẽ báo
# "no schema has been selected to create in". Idempotent.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	create schema if not exists auth;
	create schema if not exists storage;
	grant usage on schema auth, storage to public;
EOSQL
