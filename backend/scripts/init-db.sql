-- Setup database & user PostgreSQL untuk project himasi-portal.
-- Jalankan:  psql -U postgres -f scripts/init-db.sql
-- Ganti 'himasi_portal_secret' di bawah dengan password yang aman kalau mau.

-- 1. User PostgreSQL baru (untuk simpan data app + seed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'himasi_portal') THEN
    CREATE ROLE himasi_portal WITH LOGIN PASSWORD 'himasi_portal_secret';
  END IF;
END
$$;

-- 2. Database baru (kalau sudah ada, psql akan error "already exists" — aman diabaikan)
CREATE DATABASE himasi_portal OWNER himasi_portal;

-- 3. Setelah ini, connect ke DB baru lalu enable extension (bisa di step terpisah atau run manual):
--    psql -U postgres -d himasi_portal -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
