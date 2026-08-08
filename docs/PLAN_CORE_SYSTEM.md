# Plan: Core System HIMASI Portal (Kepengurusan / BPH)

Dokumen rencana pengembangan inti sistem **HIMASI Portal** dari sisi **admin/BPH** (Badan Pengurus Harian). Tujuan akhir: admin panel tidak lagi "admin generik", melainkan melayani peran BPH yang nyata (Sekretaris, Bendahara, Media & Publikasi, PSDM) dengan akses penuh untuk Ketua Umum / Wakil.

> Status: **Rencana.** Implementasi belum dilakukan. Development mengikuti urutan prioritas di bawah setelah dokumen ini disetujui.

---

## 1. Ringkasan & keputusan utama

- **Tujuan:** Mengembangkan core system dari kondisi saat ini menjadi platform kepengurusan: persuratan, keuangan/kas, event + absensi, akademik (LMS), dan kas user dengan payment gateway.
- **Keputusan RBAC (Model Hybrid):** Role `admin` tetap jadi kunci masuk konsol + **role jabatan** sebagai template permission per kedudukan (Ketua, Sekretaris, Bendahara, Kadep, Wakadep, Anggota) + **scope data per departemen**. Semua level BPH & departemen boleh masuk admin, dibedakan permission-nya. Sudah dikonfirmasi (lihat section 3).
- **Urutan prioritas (MVP):**
  1. ~~**Sekretaris** → Persuratan (surat masuk, surat keluar, dokumen penting)~~ ✅ **DONE**
  2. **Bendahara** → Keuangan & Kas (pemasukan / pengeluaran + tabulasi rentang waktu)
  3. **Event & Absensi** → Buat acara, user absen, rekap kehadiran & keaktifan
  4. **Akademik** → LMS sederhana (mata kuliah, materi, kuis)
  5. **Kas User & Payment Gateway** → Otomatis hitung tunggakan + integrasi payment (fase paling akhir)
- **Media & Publikasi** sudah berfungsi sebagai CMS — hanya dipakai ulang, tidak dikerjakan ulang.
- **Data anggota (PSDM)** sebagian sudah ada — dilengkapi (verifikasi pendaftaran, dsb.).

---

## 2. Konteks saat ini (hasil review sistem)

### Yang sudah ada dan dipakai ulang

| Area | Kondisi | Lokasi |
|------|---------|--------|
| Stack | Node.js + **Hono** + **Prisma** (PostgreSQL); React + TS + Vite + Tailwind v4 | `backend/`, `frontend/` |
| RBAC | Spatie-like: `Role`, `Permission`, `ModelHasRole`, `ModelHasPermission`, `RoleHasPermission`; middleware `requirePermission()` | `backend/src/lib/auth.ts`, `prisma/schema.prisma` |
| Auth `/auth/me` | Mengembalikan `roles`, `permissions`, `menus` (menu sudah difilter permission) | `backend/src/routes/auth.ts:160` |
| Admin console | Dashboard, Data Anggota, Content (CMS), Pengurus, Menu, Pengaturan. **Sidebar masih hardcode** di `AdminLayout.tsx` | `frontend/src/components/AdminLayout.tsx` |
| CMS (Media & Publikasi) | Berita, Acara, Departemen, Proker, FAQ, Foto — CRUD lengkap | `backend/src/routes/admin-cms.ts` |
| Data anggota (PSDM) | List + search + export Excel + detail + update status/departemen + soft delete; registrasi user → status `PENDING` | `admin-cms.ts` (admin/mahasiswa) |
| Event dasar | Model `Activity`; user daftar via `MahasiswaEventParticipation` (ada flag `attended`, tapi **belum ada API/UI untuk isi kehadiran**) | `schema.prisma`, `backend/src/routes/profile.ts:124` |

### Yang sudah "disiapkan" oleh seed tapi belum dibangun

- **Enumerasi:** `archive_category` (Dokumen Internal, Dokumen Eksternal, Laporan Kegiatan, Proposal, Lainnya), `category_finance` (Kas, Sponsorship, Donasi, Operasional, Pengembangan Program Kerja), `jabatan` (Ketua Umum, Sekretaris, Bendahara, dll.).
- **Permission:** `archive.*`, `finance.*`, `recap-finance.*`, `activity.*`, `absence.*`, `academic.*`, `bersi.*`, `registration.*`.
- **Menu:** `Persuratan`, `Keuangan`, `Kas`, `Kehadiran`, `Kehadiran Mahasiswa`, `Akademik`, `BerSI`, `Pendaftaran`.

### Yang belum ada sama sekali

- Model/API/UI: **Persuratan**, **Keuangan/Kas**, **Absensi & rekap**, **LMS**, **Kas user + payment**.
- Sidebar & routing admin yang **permission-driven**.
- UI **verifikasi pendaftaran** (APPROVE/REJECT).
- API admin untuk **mengisi kehadiran** event.

---

## 3. Model akses (RBAC)

> Desain **dua sumbu**: (1) **fungsi** — permission per modul per level, (2) **scope data** — data milik departemen mana yang boleh dikelola/dilihat.

### 3.1 Cara kerja — Model Hybrid

- Role `admin` (dan `superadmin`) tetap menjadi **kunci masuk konsol admin** (route guard `/admin` & `isAdmin` tidak perlu dirombak drastis).
- Tambah **role jabatan** sebagai **template permission**: `ketua_umum`, `wakil_ketua`, `sekretaris`, `bendahara`, `kadep`, `wakadep`, `anggota_departemen`.
- Setiap pengurus mendapat: role `admin` (entry) + role jabatan sesuai kedudukan (template permission) + `departemen_id` (scope data). `ModelHasPermission` bersifat opsional untuk pengecualian per user.
- **Keputusan: semua level BPH & departemen boleh masuk konsol admin**, dibedakan permission-nya.
- **Keputusan: pasangan level disamakan** — Sekretaris Umum = Sekretaris, Bendahara Umum = Bendahara (satu set akses per pasangan).

### 3.2 Role jabatan → pemetaan jabatan

| Role (template) | Jabatan (`Enumeration` key `jabatan`) |
|------------------|---------------------------------------|
| `ketua_umum` | Ketua Umum |
| `wakil_ketua` | Wakil Ketua Umum |
| `sekretaris` | Sekretaris Umum, Sekretaris |
| `bendahara` | Bendahara Umum, Bendahara |
| `kadep` | Kepala Departemen |
| `wakadep` | Wakil Kepala Departemen *(belum ada di seed — perlu ditambah)* |
| `anggota_departemen` | Anggota Departemen |

Plus `superadmin` (Dewan Pengarah / teknis) = bypass semua permission & scope.

### 3.3 Matriks akses fungsi per modul

*(Contoh awal — cakupan tiap sel tinggal disesuaikan saat implementasi.)*

| Modul | Ketua | Wakil | Sekretaris | Bendahara | Kadep | Wakadep | Anggota Dept |
|-------|-------|-------|------------|-----------|-------|---------|--------------|
| Persuratan (`archive.*`) | CRUD | view | CRUD | – | view (dept) | view | – |
| Keuangan (`finance.*`) | view | view | – | CRUD | – | – | – |
| Kas (`recap-finance.*`) | view | view | – | CRUD | – | – | – |
| Data Anggota (`user.*`) | all | all | view | – | view (dept) | view (dept) | view (dept) |
| Pendaftaran (`registration.*`) | all | all | – | – | view (dept) | – | – |
| CMS (`cms.*`) | all | all | – | – | CRUD (dept) | create | create |
| Event (`activity.*`) | all | all | rekap | – | CRUD (dept) | create/edit | – |
| Absensi (`absence.*`) | all | all | rekap | – | rekap (dept) | input | input |
| Akademik/LMS (`academic.*`) | all | all | – | – | CRUD (dept) | create/edit | create |
| Pengaturan (`settings`) | all | view | – | – | – | – | – |

Keterangan:
- `all` = view + create + edit + delete (+ approve/publish bila ada).
- `(dept)` = berlaku **terbatas pada data departemen sendiri** (scope).
- `–` = tanpa akses ke modul tersebut.

### 3.4 Scope data (sumbu kedua)

- Setiap user departemen punya `departemen_id` → query difilter agar hanya data `departemenId` miliknya yang bisa dikelola.
- **Kelola:** data departemen sendiri (mengikuti permission level).
- **Lihat lintas departemen:** read-only — keputusan untuk Kadep; berlaku umum untuk semua level departemen.
- **Ketua / Wakil / Superadmin:** bypass scope — lihat & kelola semua departemen.
- Implikasi teknis: helper middleware/query scope (mis. `whereDepartemenScope(user)`) dipakai di tiap route modul yang berhubungan dengan departemen (`activity`, `proker`, `course`, dsb.).

### 3.5 Pekerjaan penyerta RBAC

- [ ] **Sidebar admin dinamis:** render dari `menus` yang dikembalikan `/auth/me` (sudah difilter permission), bukan hardcode. Tiap level hanya melihat menu yang ia boleh akses.
- [ ] **Perbaiki gate router admin:** saat ini `admin.use("*", requirePermission("menu.cms.news"))` di `admin-cms.ts:11` memaksa seluruh route admin butuh permission CMS. Pecah jadi router per-modul dengan permission masing-masing (mis. `archive.view`, `finance.view`, `academic.view`).
- [ ] **Seed role jabatan + template permission:** tambah role `ketua_umum`, `wakil_ketua`, `sekretaris`, `bendahara`, `kadep`, `wakadep`, `anggota_departemen` beserta `RoleHasPermission` sesuai matriks 3.3; tambah enumeration `Wakil Kepala Departemen`.
- [ ] **UI pengelolaan jabatan & akses:** di Pengaturan → Role & Permission — assign role jabatan + template ke user; tambah/revoke permission individual (ModelHasPermission) sebagai pengecualian.
- [ ] **Middleware/helper scope departemen** di backend untuk filter data per `departemen_id` (ketua/superadmin bypass).

---

## 4. Fase 1 — Persuratan (Sekretaris) - ✅ **DONE**

### 4.1 Tujuan
Pencatatan **surat masuk**, **surat keluar**, dan **dokumen penting**. Fokus ke persuratan: input, nomor surat, keterangan, lampiran, riwayat. Telah diimplementasikan dengan UI berbasis grid/tabel dan dukungan drag & drop.

### 4.2 Model DB (baru) — `ArchiveDocument`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | |
| `docType` | string | `SURAT_MASUK` \| `SURAT_KELUAR` \| `DOKUMEN` |
| `noSurat` | string? | nomor surat (manual) |
| `fromTo` | string? | pengirim (dari) / penerima (kepada) |
| `subject` | string | perihal / judul |
| `letterDate` | date? | tanggal surat / tanggal dokumen |
| `description` | text? | ringkasan / keterangan tambahan |
| `attachmentPath` | string? | upload lampiran (PDF/image) |
| `createdBy` | UUID | → `User` (pencatat) |
| `createdAt`, `updatedAt` | | Timestamp otomatis |

### 4.3 API admin
- `GET /admin/archive` — list
- `POST /admin/archive` — create
- `POST /admin/archive/upload` - upload file terpisah
- `PUT /admin/archive/:id` — update
- `DELETE /admin/archive/:id` — soft/hard delete

### 4.4 Frontend
- Admin: halaman `/admin/documents` (menu sidebar **"Persuratan"**) — tab **Surat Masuk / Surat Keluar / Dokumen**, form create (dengan preview/upload lampiran), detail, filter & pencarian, auto-generate nomor surat.
- User/anggota: tidak ada halaman khusus di MVP (khusus admin/sekretaris).

### 4.5 Permission
- Pakai yang sudah di-seed: `archive.view/create/edit/delete`, `menu.archive`.

---

## 5. Fase 2 — Keuangan & Kas (Bendahara)

### 5.1 Tujuan
Pencatatan **uang masuk & uang keluar** via form, lalu **tabulasi pemasukan–pengeluaran** dalam **rentang waktu** dengan UI yang cantik (ringkasan card + chart + tabel). Serupa dengan modul persuratan, tapi fokus perhitungan uang.

### 5.2 Model DB (baru) — `FinanceTransaction`

| Field | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID | |
| `type` | string | `INCOME` \| `EXPENSE` |
| `categoryId` | UUID? | → `Enumeration` key `category_finance` (Kas, Sponsorship, Donasi, Operasional, dsb.) |
| `amount` | Decimal | nominal |
| `description` | text? | keterangan |
| `transactionDate` | date | tanggal transaksi |
| `evidencePath` | string? | bukti (upload) |
| `createdBy` | UUID | → `User` |
| `createdAt`, `updatedAt`, `deletedAt` | | |

### 5.3 API admin
- `GET /admin/finance` — list + filter (type, kategori, rentang tanggal, pencarian)
- `POST /admin/finance` — create
- `PUT /admin/finance/:id` — update
- `DELETE /admin/finance/:id` — soft delete
- `GET /admin/finance/summary?from=&to=` — total pemasukan, pengeluaran, saldo, breakdown per kategori (untuk chart)
- (Opsional) `GET /admin/finance/export` — Excel/PDF

### 5.4 Frontend
- Admin: halaman `/admin/finance` (menu sidebar **"Keuangan"**) — form entri cepat, ringkasan card (Pemasukan / Pengeluaran / Saldo), chart bar/line per kategori, tabel tabulasi dengan **filter rentang waktu** (default bulan berjalan).
- User/anggota: pembayaran kas pribadi → **Fase 5** (nanti).

### 5.5 Permission
- `finance.view/create/edit/delete`, `recap-finance.*`, `menu.finance`.

---

## 6. Fase 3 — Event & Absensi

### 6.1 Tujuan
Admin (Sekretaris, Departemen Acara, PSDM) **membuat acara** → acara muncul di halaman user → user **klik absen** (seperti aplikasi absensi pemerintahan untuk rapat/kegiatan) → Sekretaris & PSDM bisa **cek rekap kehadiran & keaktifan** anggota.

### 6.2 Yang sudah ada (dipakai ulang)
- `Activity` + CRUD admin (`admin-cms.ts`).
- User daftar acara via `MahasiswaEventParticipation` (unique `userId + activityId`), flag `attended`.
- Public: `AcaraList`, `AcaraDetail`; user: `DashboardAcara`.

### 6.3 Yang perlu ditambahkan

**Backend:**
- `POST /profile/activities/:id/attend` — user menandai hadir (validasi dalam rentang waktu acara / batas waktu absen).
- `GET /admin/activities/:id/attendance` — daftar terdaftar + status hadir (untuk admin rekap).
- `PUT /admin/activities/:id/attendance/:userId` — admin menandai hadir manual (fallback saat kode absen bermasalah).
- (Opsional, seperti absensi pemerintahan) **kode/PIN atau QR absen** per event: model `AbsenceCode` (kode, berlaku dari `validFrom` s.d. `validUntil`); user input kode/PIN saat absen → `attended = true`.
- `GET /admin/activities/:id/attendance/export` — Excel/PDF rekap.
- `GET /admin/users/:id/attendance` — riwayat kehadiran per anggota (untuk cek keaktifan).
- `GET /profile/attendance` — riwayat & statistik keaktifan pribadi user.

**Frontend admin:**
- Halaman `/admin/events` (kelola acara — bisa menimpa menu Acara lama) dan `/admin/events/:id/attendance` (rekap, toggle hadir, export).

**Frontend user:**
- Tombol **"Absen"** di `AcaraDetail` (kode/PIN atau langsung).
- Halaman `/dashboard/kehadiran` (ganti placeholder) — riwayat kehadiran + ringkasan keaktifan.

### 6.4 Permission
- `activity.*`, `absence.view/create`, `menu.activities`, `menu.acara`.

---

## 7. Fase 4 — Akademik (LMS sederhana)

### 7.1 Tujuan
LMS **simple**: ada **mata kuliah**, bisa **akses materi**, dan **kuis**. MVP cukup CRUD konten + akses user.

### 7.2 Model DB (baru)

- `Course` — `id`, `title`, `code` (kode MK), `desc`, `coverImage`, `isActive`, timestamps.
- `CourseMaterial` — `id`, `courseId`, `title`, `type` (`FILE` \| `TEXT` \| `LINK`), `contentPath` (file), `contentText`, `sortOrder`.
- `CourseQuiz` — `id`, `courseId`, `title`, `description`, `durationMin`, `deadline`, `isActive`.
- `QuizQuestion` — `id`, `quizId`, `question`, `type` (`MULTIPLE_CHOICE`), `optionsJson`, `correctAnswer`.
- `QuizAttempt` — `id`, `quizId`, `userId`, `score`, `answeredAt` (rekap nilai per user).

### 7.3 API
- **Admin:** CRUD `/admin/academic/courses`, `/admin/academic/courses/:id/materials`, `/admin/academic/courses/:id/quizzes`, CRUD soal.
- **User:** `GET /academic/courses`, `GET /academic/courses/:id` (detail + daftar materi), `GET /academic/courses/:id/materials/:materialId` (konten materi), `GET/POST /academic/quizzes/:id` (ambil kuis & submit → skor otomatis).

### 7.4 Frontend
- Admin: halaman `/admin/academic` — kelola course → materi → kuis.
- User: halaman `/dashboard/akademik` (ganti placeholder) — daftar course, detail materi, kerjakan kuis + hasil nilai.

### 7.5 Permission
- `academic.*`, `bersi.*`, `menu.akademik`.

---

## 8. Fase 5 — Kas User & Payment Gateway (paling akhir)

### 8.1 Tujuan
Di sisi user (fokus **pengurus dulu**): melihat status pembayaran **uang kas** yang **dihitung otomatis** (sudah bayar berapa, belum bayar berapa) dan bayar melalui **payment gateway**.

### 8.2 Model DB (baru)

- `KasSetting` — `period`, `monthlyAmount` (nominal iuran/bulan), `dueDay` (tanggal jatuh tempo).
- `KasPayment` — `id`, `userId`, `period` (mis. `2026-08`), `amount`, `method` (`MANUAL` \| `GATEWAY`), `status` (`UNPAID` \| `PENDING` \| `PAID` \| `VERIFIED`), `paidAt`, `reference` (trxId), `verifiedBy`.
- (Opsional) `PaymentGatewayLog` — `provider`, `trxId`, `payload`, status callback.

### 8.3 Catatan
- **Tunggakan otomatis:** generate entitlement kas per periode, bandingkan dengan `KasPayment` berstatus `VERIFIED`/`PAID` → tampil "Belum bayar: X bulan (Rp Y)".
- MVP pembayaran bisa dicatat **manual oleh bendahara** (masuk ke modul Keuangan Fase 2) dan otomatis memperbarui status kas user. Integrasi **payment gateway** (Midtrans/Xendit/dll.) dikerjakan setelah Fase 1–4 stabil.
- Pengurus dengan akses kas hanya melihat miliknya sendiri; bendahara/ketua melihat rekap semua (via `recap-finance.*`).

---

## 9. Peran Ketua Umum & Wakil

- Diberi **seluruh permission** divisi (atau role `superadmin`) → bisa akses semua modul dan semua data.
- **Dashboard eksekutif:** ringkasan lintas divisi (jumlah dokumen aktif, saldo kas, jumlah acara & rata-rata kehadiran, jumlah anggota aktif) — pengembangan setelah Fase 1–4.

---

## 10. TODO checklist (summary)

| No | Task | Fase | Status |
|----|------|------|--------|
| 1 | Seed role jabatan (ketua/wakil/sekretaris/bendahara/kadep/wakadep/anggota) + template permission + enum Wakil Kepala Departemen | RBAC | Belum |
| 2 | Sidebar admin dinamis (permission-driven) + perbaikan gate router admin per-modul | RBAC | Belum |
| 3 | UI pengelolaan jabatan & akses (assign role jabatan + permission per user) di Pengaturan | RBAC | Belum |
| 4 | Middleware/helper scope departemen di backend | RBAC | Belum |
| 5 | Model + API + UI Persuratan (Sekretaris) | 1 | Belum |
| 6 | Model + API + UI Keuangan/Kas (Bendahara) | 2 | Belum |
| 7 | API absen user + rekap kehadiran admin + halaman kehadiran | 3 | Belum |
| 8 | LMS: Course, Materi, Kuis (API + UI admin & user) | 4 | Belum |
| 9 | Verifikasi pendaftaran (APPROVE/REJECT) untuk PSDM | PSDM | Belum |
| 10 | Kas user otomatis (tunggakan) + integrasi payment gateway | 5 | Belum |
| 11 | Dashboard eksekutif Ketua Umum/Wakil | 9 | Belum |

---

## 11. Catatan & pertanyaan terbuka

- **Nomor surat otomatis:** format perlu disepakati, mis. `002/HM.UTB/SEK/VIII/2026` (per jenis surat + bulan + tahun), dengan counter per tahun.
- **Media & Publikasi** tidak dikerjakan ulang; hanya perlu memastikan permission CMS tetap milik divisi Media (dan bisa dilihat Ketua).
- **Absensi:** pilih mekanisme MVP — (a) tombol absen langsung dalam rentang acara, atau (b) kode/PIN/QR yang diumumkan saat acara. Disarankan mulai dari (a), kode/PIN jadi pengembangan lanjutan.
- **Dynamic Event & Pendaftaran Berbayar:** Jika ke depannya ada fitur absensi/pendaftaran mahasiswa ke sebuah acara yang membutuhkan uang pendaftaran, sistem ini direncanakan akan **sinkron otomatis**. Status `PAYMENT_PENDING` pada tabel pendaftaran, setelah diverifikasi/dibayar (Lunas), akan *mentrigger* otomatis pencatatan 1 row pemasukan ke tabel `EventKasTransaction` milik acara (Kas Event) tersebut. Ini menjamin Pemasukan Kas Event selalu klop 100% dengan data jumlah pendaftar tanpa butuh rekap manual oleh bendahara event.
- **Payment gateway** diputuskan belakangan (Midtrans / Xendit / QRIS) setelah Fase 1–4 berjalan.
- Perubahan pada `schema.prisma` akan membutuhkan migration (`npm run db:migrate`) — lihat `docs/MIGRATION.md`.
