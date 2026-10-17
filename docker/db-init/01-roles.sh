#!/bin/bash
# Chạy 1 lần khi volume db-data được khởi tạo (docker-entrypoint-initdb.d).
# Tạo các role Supabase mà PostgREST/GoTrue cần. Idempotent.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	DO \$\$
	BEGIN
		IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
			CREATE ROLE anon NOLOGIN;
		END IF;
		IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
			CREATE ROLE authenticated NOLOGIN;
		END IF;
		IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
			CREATE ROLE service_role NOLOGIN BYPASSRLS;
		END IF;
		IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
			CREATE ROLE authenticator NOINHERIT LOGIN;
		END IF;
	END
	\$\$;
	-- PostgREST kết nối bằng role này (PGRST_DB_URI), password khớp POSTGRES_PASSWORD.
	ALTER ROLE authenticator WITH PASSWORD '$POSTGRES_PASSWORD';
	GRANT anon, authenticated, service_role TO authenticator;
EOSQL
