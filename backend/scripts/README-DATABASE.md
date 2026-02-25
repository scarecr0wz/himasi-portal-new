# Setup Database PostgreSQL

Error `Authentication failed... for himasi_portal` berarti user PostgreSQL `himasi_portal` belum ada atau password salah. Buat user & database dulu pakai akun **superuser** (biasanya `postgres`).

## Cara 1: Pakai psql (superuser)

Masuk sebagai superuser (ganti password jika diminta):

```bash
# Linux sering pakai peer auth — tidak perlu password:
sudo -u postgres psql

# Atau pakai password:
psql -U postgres -h localhost -p 5432
```

Di dalam `psql` jalankan:

```sql
-- 1. Buat user & password (sesuai .env)
CREATE ROLE himasi_portal WITH LOGIN PASSWORD 'himasi_portal_secret';

-- 2. Buat database
CREATE DATABASE himasi_portal OWNER himasi_portal;

-- 3. Enable extension (connect ke DB dulu)
\c himasi_portal
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\q
```

Lalu di project:

```bash
cd /apps/himasi-portal/backend
npx prisma db push
npm run db:seed
```

## Cara 2: Satu baris dari shell

Kalau user `postgres` bisa login (peer atau password):

```bash
sudo -u postgres psql -c "CREATE ROLE himasi_portal WITH LOGIN PASSWORD 'himasi_portal_secret';"
sudo -u postgres psql -c "CREATE DATABASE himasi_portal OWNER himasi_portal;"
sudo -u postgres psql -d himasi_portal -c "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
```

Kalau role/database sudah ada, psql akan error "already exists" — aman diabaikan.

## Opsi: Pakai user postgres di .env

Kalau kamu cuma punya akses user `postgres` dan tidak mau buat user baru, isi `.env`:

```
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_KAMU@localhost:5432/himasi_portal?schema=public"
```

Lalu buat database saja (sebagai postgres):

```bash
sudo -u postgres psql -c "CREATE DATABASE himasi_portal;"
```

Setelah itu `npx prisma db push` dan `npm run db:seed` pakai kredensial itu.
