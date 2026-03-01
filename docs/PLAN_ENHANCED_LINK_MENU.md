# Plan: Enhanced Link Management (Menu Publik)

Dokumentasi rencana pengembangan fitur **pengelolaan link navigasi publik** agar halaman Admin > Menu benar-benar mengatur link yang tampil di landing page (navbar & footer), bukan hanya placeholder.

---

## 1. Konteks saat ini

- **Admin > Menu** (`/admin/menus`) saat ini menampilkan placeholder dan **tidak mengubah** tampilan mana pun.
- Tabel **`Menu`** di Prisma dipakai untuk **sidebar admin** (nama, url, permission, parent, order) — bukan untuk navigasi landing.
- Link di **landing page** (navbar & footer) **semua hardcode** di frontend:
  - **PublicNavbar**: Berita, Acara, Pengurus, Program Kerja (#), Department (#), FAQ (#), Tentang (#)
  - **PublicFooter**: Berita, Acara, Pengurus, Program Kerja (#), Department (#), FAQ (#), Portal Mahasiswa, Tentang (#), Kontak (#)

---

## 2. Tujuan

- Admin bisa mengelola (tambah / edit / hapus / urut) link navigasi yang tampil di **navbar** dan **footer** landing.
- Frontend landing (navbar & footer) **mengambil data dari API**, bukan hardcode.
- Tetap ada **fallback** ke daftar default jika API kosong atau error.

---

## 3. Opsi pendekatan

| Opsi | Deskripsi | Pro | Kontra |
|------|-----------|-----|--------|
| **A. Model `PublicNavLink`** | Tabel baru untuk link publik (label, url, sortOrder, place, openInNewTab). API public GET link, admin CRUD. | Pemisahan jelas, fleksibel (navbar vs footer), mudah extend. | Perlu migration + halaman admin baru. |
| **B. Config JSON** | Satu key-value (mis. `public_nav_links`) berisi JSON array. Admin edit satu form/list. | Cepat, tanpa model baru. | Kurang fleksibel; beda navbar/footer harus di-handle di struktur JSON. |
| **C. Reuse tabel `Menu` + scope** | Tambah kolom `scope: 'admin' \| 'public'` di Menu. | Tidak perlu tabel baru. | Satu tabel dua tujuan; risiko salah filter; naming membingungkan. |

**Rekomendasi:** **Opsi A** (model `PublicNavLink`) — pemisahan jelas dan paling maintainable.

---

## 4. Rencana teknis (Opsi A)

### 4.1 Backend

- [ ] **Schema:** Tambah model `PublicNavLink` (contoh field):
  - `id` (UUID)
  - `label` (string)
  - `url` (string: path `/berita`, hash `/#faq`, atau URL eksternal)
  - `sortOrder` (int, default 0)
  - `openInNewTab` (boolean, optional)
  - `place` (enum atau string: `navbar` | `footer` — atau dua group terpisah)
  - `createdAt`, `updatedAt`
- [ ] **API public (no auth):** `GET /content/public-nav-links`  
  - Query opsional: `?place=navbar` atau `?place=footer`.  
  - Return array link, urut by `sortOrder`.
- [ ] **API admin (auth + permission):**  
  - `GET /admin/public-nav-links` — list untuk admin.  
  - `POST /admin/public-nav-links` — create.  
  - `PATCH /admin/public-nav-links/:id` — update.  
  - `DELETE /admin/public-nav-links/:id` — delete.  
  - (Opsional) endpoint reorder (PATCH bulk sortOrder).

### 4.2 Frontend

- [ ] **Admin:** Halaman "Link Navigasi Publik" (ganti atau isi halaman Menu):
  - List link per `place` (navbar / footer).
  - Tambah / edit / hapus.
  - Urutan (drag-drop atau input sortOrder).
- [ ] **PublicNavbar:** Fetch `GET /content/public-nav-links?place=navbar`. Render dari data; fallback ke daftar hardcode jika kosong/error.
- [ ] **PublicFooter:** Fetch `GET /content/public-nav-links?place=footer` (atau satu endpoint return grouped). Render dari data; fallback ke daftar hardcode.

### 4.3 Data awal (seed / migration)

- [ ] Seed atau migration: isi `PublicNavLink` dengan link default yang sama dengan hardcode saat ini (Berita, Acara, Pengurus, dll.) agar setelah deploy tampilan tetap sama.

---

## 5. TODO checklist (summary)

| No | Task | Status |
|----|------|--------|
| 1 | Desain final model `PublicNavLink` (field + place) | Belum |
| 2 | Migration Prisma + seed link default | Belum |
| 3 | API public GET public-nav-links | Belum |
| 4 | API admin CRUD public-nav-links | Belum |
| 5 | Halaman Admin "Link Navigasi Publik" | Belum |
| 6 | PublicNavbar pakai API + fallback | Belum |
| 7 | PublicFooter pakai API + fallback | Belum |
| 8 | Update sidebar admin: label "Menu" → "Link Publik" (opsional) | Belum |

---

## 6. Catatan

- **Tidak mengubah** tabel `Menu` yang dipakai untuk **admin sidebar** (permission-based).
- Implementasi **belum dilakukan**; dokumen ini hanya rencana dan TODO. Setelah disetujui, development mengikuti checklist di atas.
