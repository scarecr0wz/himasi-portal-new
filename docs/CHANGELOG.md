# Changelog — HIMASI Portal

Perubahan dan penambahan fitur yang tercatat. Format longgar mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Direncanakan

- **Enhanced Link Management (Menu Publik):** Admin > Menu akan mengatur link navbar & footer landing (saat ini link hardcode). Rencana dan TODO tercatat di [docs/PLAN_ENHANCED_LINK_MENU.md](./PLAN_ENHANCED_LINK_MENU.md). Implementasi belum dilakukan.

---

### Social Sharing & SEO — Engagement Optimization

- **Social Share Buttons:** Fitur baru untuk membagikan konten ke platform populer:
  - **WhatsApp, Facebook, X (Twitter), & Telegram:** Integrasi link berbagi untuk meningkatkan jangkauan konten.
  - **Copy Link Feature:** Tombol salin URL cepat dengan feedback visual (checkmark & toast notification).
  - **UI/UX Premium:** Desain glassmorphism dengan hover micro-interactions, tooltip, dan transisi halus yang selaras dengan tema portal.
- **Dynamic Meta Tags (SEO Engine):** Implementasi komponen `SEO` reusable untuk optimasi preview saat link dibagikan:
  - **Berita & Acara:** Preview kini menyertakan Judul, Deskripsi dinamis (auto-clean markdown), dan Foto Utama secara akurat.
  - **Social Media Crawler Support:** Dukungan untuk Open Graph (Facebook/WhatsApp) dan Twitter Cards.
  - **Global Metadata:** Update metadata pada Landing Page dan Portal Departemen untuk konsistensi branding.
- **Berita Detail:** Integrasi penuh Share Buttons dan Metadata dynamic di setiap artikel.

---

## Perubahan yang sudah dilakukan (riwayat fitur)

### Landing & Berita Detail — UI Consistency

- **Public Header/Footer:** Integrasi komponen `PublicNavbar` dan `PublicFooter` secara global:
  - **Berita Detail:** Mengganti header minimalis dengan navbar situs lengkap untuk navigasi yang lebih baik dari halaman artikel.
  - **Landing Page:** Refaktorisasi header inline menjadi komponen `PublicNavbar` yang terpusat untuk kemudahan pemeliharaan.
- **Berita Layout:** Peningkatan tipografi dan tata letak artikel detail (padding, font size, dan shadow pada gambar) untuk kenyamanan baca.
- **Social Integration:** Update desain Social Media Links dengan gaya premium shadowed yang konsisten di seluruh situs.

### Content Editor & Markdown Engine — Reliability & UX

- **Live Preview System:** Penambahan fitur tab "Tulis" dan "Pratinjau" pada Admin Content Editor untuk verifikasi real-time sebelum publikasi.
- **Format Content:**
  - Integrasi library `marked` dan `remark-gfm` untuk rendering markdown yang lebih tangguh dan mendukung GitHub Flavored Markdown (List, Bold, Tables).
  - Pemasangan `@tailwindcss/typography` (Tailwind 4) untuk styling otomatis konten `.prose`.
  - Penambahan CSS manual override pada `index.css` untuk menjamin ketebalan font **Bold** dan indentasi **Lists** tetap terjaga meskipun ada global CSS reset.
- **Editor Toolbar:** Toolbar baru dengan shortcut untuk Bold (Mark), Italic, Heading, Bullet/Numbered List, Link, dan Quotes.
- **Stats:** Penambahan fitur penghitung kata (word count) pada editor berita.

### Pendaftaran (Register) — UI/UX Optimization

- **Optimalisasi Mobile & Desktop:**
  - **Tombol Navigasi:** Peningkatan ketebalan tombol "Langkah Berikutnya" dan "Kembali" menggunakan padding vertikal (`py-5`) untuk kenyamanan tap yang lebih baik (premium feel).
  - **Keyboard Mobile:** Penambahan `inputMode="numeric"` pada field NIM dan `inputMode="tel"` pada field WhatsApp agar keyboard numerik otomatis muncul di HP.
  - **Fokus Input:** Peningkatan visual fokus ring (`ring-8`) dan efek hover pada semua input field.
  - **Halaman Berhasil:** Overhaul total tampilan "Pendaftaran Berhasil" dengan desain celebratory premium, animasi dekoratif, dan panduan langkah selanjutnya (verifikasi admin 1x24 jam).

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
