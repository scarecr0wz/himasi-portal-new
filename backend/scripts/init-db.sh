#!/usr/bin/env bash
# Buat user PostgreSQL 'himasi_portal' dan database 'himasi_portal'.
# Jalankan sebagai user yang bisa akses postgres (biasanya: sudo -u postgres ./scripts/init-db.sh)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Membuat role himasi_portal (password: himasi_portal_secret)..."
psql -v ON_ERROR_STOP=1 -c "
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'himasi_portal') THEN
    CREATE ROLE himasi_portal WITH LOGIN PASSWORD 'himasi_portal_secret';
    RAISE NOTICE 'Role himasi_portal dibuat.';
  ELSE
    RAISE NOTICE 'Role himasi_portal sudah ada.';
  END IF;
END
\$\$;
" || true

echo "Membuat database himasi_portal..."
psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE himasi_portal OWNER himasi_portal;" || echo "(Database mungkin sudah ada.)"

echo "Enable extension pgcrypto..."
psql -d himasi_portal -v ON_ERROR_STOP=1 -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";" || true

echo "Selesai. Cek .env pakai: DATABASE_URL=postgresql://himasi_portal:himasi_portal_secret@localhost:5432/himasi_portal?schema=public"
echo "Lalu: npx prisma db push && npm run db:seed"
