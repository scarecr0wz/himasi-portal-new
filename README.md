# HIMASI Portal

Portal resmi **Himpunan Mahasiswa Sistem Informasi (HIMASI)** Universitas Terbuka Bogor. Stack: **Node.js + React + TypeScript**, database **PostgreSQL**.

---

## Tech stack

| Lapisan   | Stack |
|----------|--------|
| Backend  | Node.js, **Hono**, TypeScript |
| Database | **PostgreSQL** (Prisma ORM) |
| Frontend | **React**, TypeScript, **Vite**, **Tailwind CSS v4** |

---

## Struktur proyek

```
himasi-portal/
├── backend/          # API (Hono + Prisma + PostgreSQL)
│   ├── prisma/       # Schema & migration
│   ├── src/          # Routes, services, middleware
│   └── scripts/      # setup-db, create-user, seed
├── frontend/         # SPA (React + Vite + Tailwind)
│   ├── public/       # Logo, gambar landing (hero, department, bergabung)
│   └── src/
│       ├── components/  # Layout, AdminLayout
│       ├── pages/       # Landing, Login, Home, Profile, dll.
│       ├── lib/         # auth context
│       ├── index.css    # Dashboard & global styles
│       └── tailwind.css # Tailwind + theme (primary #137fec, Manrope)
├── scripts/
│   └── rebuild-restart.sh   # Rebuild frontend+backend, jalankan dev server di background
├── nginx/            # Contoh konfigurasi Nginx (opsional)
├── .gitignore
└── README.md
```

---

## Persyaratan

- **Node.js** 18+
- **PostgreSQL** 14+
- **npm** atau **pnpm**

---

## Setup

### 1. Clone & install

```bash
git clone git@github.com:othmansuseno/himasi-portal.git
cd himasi-portal
```

### 2. Backend (database + API)

```bash
cd backend
npm install
```

**Database:**

- Buat user dan database PostgreSQL (opsional, satu project):
  ```bash
  chmod +x scripts/setup-db.sh
  ./scripts/setup-db.sh
  ```
  Atau manual: jalankan `psql -U postgres -f scripts/init-db.sql`, lalu isi `backend/.env` dengan `DATABASE_URL` yang memakai user tersebut.

- Isi `backend/.env`:
  ```env
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/himasi_portal"
  JWT_SECRET="your-secret-key"
  ```

- Generate client & push schema:
  ```bash
  npx prisma generate
  npx prisma db push
  npm run db:seed
  ```

**Jalankan API:**

```bash
npm run dev
```

API: **http://localhost:3001**

**User setelah seed:**

- Superadmin: NIM `0000000000` atau `000`, password `password`
- Admin: NIM `0000000001`, password `password`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173** (proxy `/api` → backend)

---

## Script utilitas

### Rebuild & restart (background)

Dari **root repo**:

```bash
./scripts/rebuild-restart.sh
```

- Rebuild frontend (`npm run build`)
- Rebuild backend (`npm run build`)
- Hentikan proses di port 3001 dan 5173
- Jalankan backend dan frontend dev di **background**
- Log: `logs/backend.log`, `logs/frontend.log`
- Hentikan: `fuser -k 3001/tcp 5173/tcp`

### Backend

| Script        | Keterangan              |
|---------------|-------------------------|
| `npm run dev` | Dev server (tsx watch)  |
| `npm run build` | Compile TypeScript   |
| `npm run start` | Jalankan dist        |
| `npm run db:generate` | Prisma generate |
| `npm run db:push` | Push schema ke DB  |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Seed data           |
| `npm run db:studio` | Prisma Studio     |
| `npm run user:create` | Buat user (script) |

### Frontend

| Script        | Keterangan           |
|---------------|----------------------|
| `npm run dev` | Dev server (Vite)    |
| `npm run build` | Build production   |
| `npm run preview` | Preview build     |

---

## Halaman & fitur

### Public (landing)

- **Hero:** “Bangun Masa Depanmu di Sini.” + gambar + CTA Mulai / Lihat Acara
- **HIMASI Infopedia** (id=`berita`): section berita; judul "HIMASI Infopedia", kartu berita (gambar + tag Berita Kegiatan, tanggal & author, judul, ringkasan, link Baca artikel). Data: `GET /api/content/news`
- **Acara Mendatang:** daftar acara dengan badge tanggal + tombol Daftar. Data: `GET /api/content/activities`
- **Tentang HIMASI:** teks + gambar + kartu statistik (5 Departemen, 100+ Anggota Aktif, 12 Program Kerja, 8/10 Kepuasan)
- **Visi & Misi:** dua kartu (Visi kutipan, Misi 5 poin)
- **Department:** 5 kartu (Acara & Kehumasan, Akademik & Keilmuan, Media & Publikasi, Olahraga & Seni, PSDM)
- **Program Kerja HIMASI** (id=`program-kerja`): filter departemen (tab), daftar proker (sidebar), detail (gambar + departemen, judul & deskripsi). Data: `GET /api/content/departments`, `GET /api/content/prokers` (include departemen)
- **Mari Bergabung dengan HIMASI:** 3 kartu (Wadah Berkembang, Peningkatan Prestasi, Lebih dari Organisasi) + tombol Daftar Sekarang
- **Footer:** logo, link, newsletter, copyright

Nav: Berita, Acara, Pengurus, Program Kerja, Department, FAQ, Tentang. Aset: `frontend/public/` (logo-himasi, hero-himasi, tentang-himasi, wadah-berkembang, peningkatan-prestasi, lebih-dari-organisasi).

### Setelah login (mahasiswa)

- Dashboard (statistik kehadiran, kas, aspirasi, proker; aktivitas terkini)
- Profil (edit level 1 & 2)
- Akademik, Acara, Kehadiran, Kas, Ruang Terbuka (placeholder / halaman lanjutan)

### Admin

- Route `/admin` (role admin): dashboard, users, roles, content, menus (placeholder).

---

## API (ringkas)

**Auth:** `POST /api/auth/sign-in`, `POST /api/auth/sign-out`, `GET /api/auth/me`, `PUT /api/auth/update-profile`, `POST /api/auth/update-avatar`

**Content (public):** `GET /api/content/benefits`, `/news`, `/departments`, `/prokers` (termasuk `departemen`), `/activities`, `/photos`, `/faqs`

**Profil:** `GET /api/profile`, `PUT /api/profile` (per level)

---

## Deploy

- **Backend:** build dengan `npm run build`, jalankan `node dist/index.js` (atau gunakan process manager). Set `DATABASE_URL` dan `JWT_SECRET` di environment.
- **Frontend:** `npm run build` di `frontend/`, serve isi folder `dist/` lewat Nginx/Apache/Vercel/Netlify. Pastikan base URL API sesuai (proxy atau `VITE_API_URL` jika dipakai).
- **Database:** jalankan migration Prisma di environment production (`prisma migrate deploy`).

---

## Lisensi & kontak

© 2024 HIMASI Universitas Terbuka Bogor. Dikelola oleh Departemen Media & Publikasi.

Repository: [github.com/othmansuseno/himasi-portal](https://github.com/othmansuseno/himasi-portal)
