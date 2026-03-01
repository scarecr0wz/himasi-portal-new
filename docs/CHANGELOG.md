# Changelog — HIMASI Portal

Perubahan dan penambahan fitur yang tercatat. Format longgar mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Direncanakan

- **Enhanced Link Management (Menu Publik):** Admin > Menu akan mengatur link navbar & footer landing (saat ini link hardcode). Rencana dan TODO tercatat di [docs/PLAN_ENHANCED_LINK_MENU.md](./PLAN_ENHANCED_LINK_MENU.md). Implementasi belum dilakukan.

---

## Perubahan yang sudah dilakukan (riwayat fitur)

### Data anggota & import

- **Import user dari dump MySQL (himasi.sql):**
  - Script: `backend/scripts/import-users-from-mysql-dump.ts`.
  - NPM: `npm run user:import-mysql-dump` (import), `npm run user:import-mysql-dump:dry` (preview + list NIM existing).
  - Hanya mengimpor user yang **NIM-nya belum ada** di PostgreSQL; NIM yang sudah ada dilaporkan dan tidak di-import.
  - Mapping jabatan & departemen ke Enumeration/Departemen portal; password dari dump (bcrypt) dipakai apa adanya.

### Admin — Data anggota

- **Export data anggota ke Excel:**
  - Backend: `GET /api/admin/mahasiswa/export` (auth admin). Query param opsional: `search`. Return file `.xlsx` (NIM, Nama, Email, Angkatan, No. HP, Jabatan, Departemen, Status Keanggotaan, Program Studi).
  - Frontend: Tombol "Export Excel" di halaman Data Anggota; filter search ikut diterapkan ke export.

### Ruang Terbuka (forum / bulletin board)

- **Schema:** Model `ForumTopic` dan `ForumReply` (Prisma); relasi ke User dan Enumeration (kategori forum).
- **Backend:** Route `/api/forum/*` (auth wajib, tanpa permission khusus):
  - `GET /forum/categories` — daftar kategori (forum_category).
  - `GET /forum/topics` — list topik (opsional `?categoryId=`).
  - `GET /forum/topics/:id` — detail topik + balasan.
  - `POST /forum/topics` — buat topik.
  - `POST /forum/topics/:id/replies` — balas topik.
- **Frontend:**
  - `/dashboard/forum` — list topik, filter kategori, modal buat topik.
  - `/dashboard/forum/:topicId` — detail topik, daftar balasan, form tulis balasan.

### Portal Mahasiswa — Acara

- **Backend:** `GET /api/profile/activities/registered` — daftar acara yang **user saat ini terdaftar** (participation), beserta data acara dan `participatedAt`, `attended`.
- **Frontend:** Halaman **Acara** di dashboard (`/dashboard/acara`) menampilkan **hanya acara yang pengguna terdaftar** (Acara Saya), dengan link ke "Lihat semua acara" (`/acara`) untuk daftar acara lain.

### Lain-lain

- **Dokumentasi:**  
  - [docs/PLAN_ENHANCED_LINK_MENU.md](./PLAN_ENHANCED_LINK_MENU.md) — rencana & TODO enhanced link management (menu publik).  
  - [docs/CHANGELOG.md](./CHANGELOG.md) — dokumen ini.

---

*Terakhir diperbarui: sesuai commit terakhir yang menyertakan changelog ini.*
