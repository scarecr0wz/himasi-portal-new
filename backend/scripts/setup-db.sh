#!/usr/bin/env bash
# Setup: buat user PG, database PG, lalu schema + seed untuk himasi-portal.
# Jalankan dari repo root backend:  ./scripts/setup-db.sh
# Butuh: psql (client) dan akses superuser PostgreSQL (mis. user postgres).

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$BACKEND_DIR"

PG_USER="${PG_USER:-postgres}"
DB_USER="himasi_portal"
DB_NAME="himasi_portal"
DB_PASSWORD="${DB_PASSWORD:-himasi_portal_secret}"

echo "==> Buat role & database (pakai superuser: $PG_USER)"
psql -U "$PG_USER" -h localhost -p 5432 -f "$SCRIPT_DIR/init-db.sql" || true

# Kalau init-db.sql sudah create database, skip. Kalau belum (mis. password prompt), create manual:
echo "==> Pastikan database $DB_NAME ada dan extension pgcrypto"
psql -U "$PG_USER" -h localhost -p 5432 -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";" 2>/dev/null || true

echo "==> Set DATABASE_URL di .env"
CONN="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
if grep -q "^DATABASE_URL=" .env 2>/dev/null; then
  sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$CONN\"|" .env
else
  echo "DATABASE_URL=\"$CONN\"" >> .env
fi

echo "==> Prisma: push schema & seed"
npx prisma generate
npx prisma db push
npm run db:seed

echo "==> Selesai. User app (login portal): NIM 123456, password password123"
echo "    DATABASE_URL sudah diisi di .env"
