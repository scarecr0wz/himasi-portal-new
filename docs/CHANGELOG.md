# Changelog — HIMASI Portal

Perubahan dan penambahan fitur yang tercatat. Format longgar mengikuti [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Admin — Sistem Manajemen Keuangan & Kas (Fase 2)

- **Buku Kas Interaktif:** Menambahkan halaman "Keuangan" untuk Bendahara guna mencatat arus kas (pemasukan dan pengeluaran).
- **Integrasi Multi-Tab Kas:** Menggabungkan "Kas Mahasiswa" dan "Kas Event" ke dalam halaman Keuangan agar navigasi terpusat dan rapi.
- **Kas Mahasiswa (Tab):** Menampilkan list seluruh anggota dalam format grid progres bulanan (Jan-Des), memudahkan *tracking* iuran kas wajib. 
- **Kas Event Backend & UI:** Modul "Kas Event" sudah berfungsi penuh, memungkinkan pembuatan buku kas terpisah per-event (pemasukan/pengeluaran mandiri).
- **Auto-Sync Saldo Event:** Tombol finalisasi Kas Event kini secara otomatis mengirim sisa dana (surplus/defisit) ke catatan "Buku Kas Utama".
- **Dashboard Finansial:** Ringkasan otomatis berupa kartu (cards) untuk Total Pemasukan, Total Pengeluaran, dan Saldo Saat Ini.
- **Tabel Pencatatan (Excel-like):** Menampilkan riwayat transaksi dalam format tabel akuntansi yang rapi (pemisahan kolom debit/kredit dan baris auto-sum di bawah).
- **Filter Rentang Waktu:** Menggunakan filter berdasarkan bulan untuk melacak rekam jejak keuangan per periode.
- **Bukti / Nota Transaksi:** Menambahkan field upload opsional (PDF/Gambar, drag & drop, maks. 10MB) pada form catat transaksi sebagai lampiran bukti kwitansi atau nota. File ditampilkan sebagai ikon klik-buka di kolom "Bukti" pada tabel riwayat transaksi.
- **UI Polish:** Menghilangkan border dan border-radius pada textbox form, menghapus border horizontal di tabel dan card, menyeragamkan tombol aksi dengan style tombol `+ Tambah` di halaman Content.

### Admin — Sistem Manajemen Persuratan & Dokumen (Fase 1)

- **Manajemen Arsip Terpadu:** Menambahkan halaman baru (UI) di portal Admin khusus untuk mendata Surat Masuk, Surat Keluar, dan Dokumen Penting.
- **Tampilan Dinamis:** Menyediakan mode grid (kartu) dan mode *list* (tabel) yang dapat di-switch sesuai kenyamanan baca pengurus.
- **Drag & Drop Upload:** Formulir unggah dokumen dengan *drag and drop* didukung validasi ekstensi untuk PDF dan gambar.
- **Baca PDF Langsung:** Dokumen PDF yang diunggah dapat di-klik langsung dari daftar dan terbuka secara presisi di *tab* browser baru.
- **UI Polish:** Menghilangkan border dan border-radius pada textbox form modal, menghapus border pada card/tabel utama, menyeragamkan tombol aksi dengan style tombol `+ Tambah` di halaman Content.

### Public UI — Pengurus Hierarchy & Animation

- **Struktur Hirarki Pengurus:** Memperbaiki tata letak (grid) pada seksi "Sekretariat & Keuangan" di halaman pengurus agar garis percabangan dari Wakil Ketua Umum terpusat dengan tepat.
- **Cabang Sekretaris & Bendahara 1:** Menghapus garis penghubung vertikal pada jabatan Sekretaris 1 dan Bendahara 1, lalu menambahkan garis horizontal untuk memvisualisasikan posisi staf sub-BPH yang bercabang langsung dari Sekretaris Umum dan Bendahara Umum.
- **Animasi & Responsivitas:** Menambahkan animasi CSS (`@keyframes`) pada garis hirarki, serta memperbaiki ukuran kartu Ketua Umum dan Dewan Pengarah agar ukurannya seragam di tampilan *mobile*. Urutan di *mobile* juga disesuaikan menjadi satu kolom (Dewan Pengarah di atas Ketua Umum) agar tetap merepresentasikan struktur dengan baik tanpa merusak *layout*.
- **Logo Departemen di Daftar Pengurus:** Mengintegrasikan komponen `DepartmentLogo` pada daftar departemen di halaman Pengurus agar sinkron dengan logo grafis asli, menggantikan ikon material statis.

### Admin & Portal Mahasiswa — UI Consistency

- **Visual Selaras:** Menyamakan palet navy–biru, permukaan, radius, dan bayangan admin panel serta portal mahasiswa dengan homepage.
- **Workspace Shell:** Memperbarui sidebar, header, logo HIMASI, latar konten, dan footer agar lebih konsisten dan responsif.
- **Dashboard Utama:** Menambahkan area pengantar, merapikan kartu statistik dan akses cepat, serta mengganti ikon lama dengan Material Symbols.

### Authentication & Navigation

- **Login Redirect:** Mengubah rute *redirect* setelah proses login berhasil. Pengguna kini langsung diarahkan ke halaman Dashboard Mahasiswa (`/dashboard`) alih-alih kembali ke halaman utama (Homepage).

### Landing Page — Hero Carousel

- **Auto-swipe Hero:** Menambahkan fitur *carousel* pada latar hero halaman Landing yang otomatis bergeser setiap 5 detik.
- **Smooth Transition:** Pergantian gambar dikustomisasi menggunakan efek *crossfade* melalui transisi CSS.
- **Persiapan CMS:** Transformasi pengaturan *background* dari CSS murni (`::before`) menjadi arsitektur state React agar kelak data gambar bisa diatur secara dinamis melalui Admin Panel.

### Public UI — Department Branding

- **Logo Departemen:** Menambahkan aset identitas visual departemen dari `frontend/public/departement-logs`.
- **Homepage:** Mengganti ikon generik pada section Departemen dengan logo resmi masing-masing departemen.
- **Halaman Departemen:** Menampilkan logo departemen pada directory card di `/departemen` dengan ukuran responsif.
- **Pemetaan Dinamis:** Menambahkan komponen `DepartmentLogo` untuk memetakan judul departemen dari CMS ke aset yang sesuai, lengkap dengan fallback ikon untuk departemen baru.

### Direncanakan

- **Enhanced Link Management (Menu Publik):** Admin > Menu akan mengatur link navbar & footer landing (saat ini link hardcode). Rencana dan TODO tercatat di [docs/PLAN_ENHANCED_LINK_MENU.md](./PLAN_ENHANCED_LINK_MENU.md). Implementasi belum dilakukan.
- **Manajemen Kas (Iuran):** Admin belum punya fitur manajemen kas; di portal mahasiswa menu Kas masih placeholder. Rencana sistem kas simple, transparan, dan siap audit (masuk/keluar + penggunaan, setoran per anggota, ringkasan untuk anggota, export laporan) tercatat di [docs/PLAN_MANAJEMEN_KAS.md](./PLAN_MANAJEMEN_KAS.md). Implementasi mengikuti TODO di dokumen tersebut.

---

### Ruang Terbuka — Markdown Editor

- **Editor Rich Text:** Penggantian textarea plain di Ruang Terbuka dengan Markdown editor yang sama seperti Content → Tambah Program Kerja:
  - **Toolbar:** Bold, Italic, bullet list, numbered list, Link, Gambar (upload + URL), Quote.
  - **Buat topik:** Modal "Buat topik baru" kini menggunakan Markdown editor untuk field Isi.
  - **Balasan:** Form tulis balasan memakai Markdown editor.
- **Rendering:** Konten topik dan balasan dirender dengan `ReactMarkdown` dan `remark-gfm` (dukungan GitHub Flavored Markdown).
- **Komponen Reusable:** Ekstraksi `MarkdownEditor` untuk dipakai di Forum dan editor Program Kerja.

---

### SEO & Share Thumbnail — Optimasi

- **Fallback Thumbnail:** Berita/acara tanpa foto kini tetap menampilkan thumbnail saat dibagikan (OG image fallback via URL).
- **Open Graph:** Penambahan `og:image:secure_url`, `og:image:width`, `og:image:height` untuk kompatibilitas crawler yang lebih baik.
- **Deskripsi:** Perbaikan stripping markdown dan truncation — `stripMarkdownForSEO()` dan `truncateDescription()` untuk preview yang lebih bersih.
- **URL absolut:** Helper `toAbsoluteImageUrl()` memastikan URL gambar valid untuk Facebook, WhatsApp, Twitter.

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

### Admin — CMS (Konten)

- **Program Kerja — upload gambar di Pengaturan:** Di editor Program Kerja (Admin > Konten > Program Kerja), sidebar "Pengaturan" sekarang menyediakan **upload file** untuk foto (sama seperti Gambar Utama di Berita): area klik untuk upload, preview gambar, opsi "atau isi URL gambar", batas 10MB (JPEG/PNG/GIF/WebP). Sebelumnya field Foto hanya input link/URL.

### Lain-lain

- **Dokumentasi:**  
  - [docs/PLAN_ENHANCED_LINK_MENU.md](./PLAN_ENHANCED_LINK_MENU.md) — rencana & TODO enhanced link management (menu publik).  
  - [docs/CHANGELOG.md](./CHANGELOG.md) — dokumen ini.

---

*Terakhir diperbarui: sesuai commit terakhir yang menyertakan changelog ini.*
