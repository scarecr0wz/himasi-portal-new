# Migrasi Database & Penambahan Tabel

Dokumentasi migrasi database dan workflow saat ada penambahan/ubah tabel di **HIMASI Portal**. Backend memakai **Prisma** + **PostgreSQL**.

---

## Ringkasan perintah

| Tujuan | Perintah (dari `backend/`) |
|--------|----------------------------|
| Sync schema ke DB (dev, tanpa file migrasi) | `npx prisma db push` |
| Buat & jalankan migrasi (dev, dengan history) | `npx prisma migrate dev --name <nama>` |
| Deploy migrasi (production) | `npx prisma migrate deploy` |
| Generate Prisma Client setelah ubah schema | `npx prisma generate` |
| Isi data awal | `npm run db:seed` |

---

## Kapan pakai apa?

- **`db push`**  
  Cepat untuk development: schema di `prisma/schema.prisma` langsung diterapkan ke database. **Tidak** menghasilkan file migrasi. Cocok untuk iterasi awal atau DB dev yang boleh di-reset.

- **`migrate dev`**  
  Setiap perubahan schema disimpan sebagai file di `prisma/migrations/`. Riwayat migrasi jelas, bisa rollback (manual), dan **wajib** dipakai jika ingin production aman.

- **`migrate deploy`**  
  Hanya menjalankan migrasi yang belum jalan di environment saat ini (biasanya production). Tidak mengubah schema dari file; hanya menerapkan file migrasi yang sudah ada.

Disarankan: **development** bisa pakai `db push` sampai struktur stabil, lalu beralih ke **migrate** dan seterusnya pakai `migrate dev` + `migrate deploy` di production.

---

## Workflow: mengubah schema (termasuk tambah tabel)

### 1. Edit schema

Edit `backend/prisma/schema.prisma` (tambah model, ubah field, relasi, dll).

Contoh tambah tabel baru:

```prisma
model ContohBaru {
  id        String   @id @default(uuid()) @db.Uuid
  nama      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("contoh_baru")
}
```

### 2. Pilih salah satu: push atau migrate

**Opsi A – Development (tanpa riwayat migrasi):**

```bash
cd backend
npx prisma generate
npx prisma db push
```

**Opsi B – Dengan migrasi (disarankan untuk production):**

```bash
cd backend
npx prisma migrate dev --name add_contoh_baru
```

- Nama migrasi (`add_contoh_baru`) ganti sesuai perubahan (mis. `add_news`, `add_user_roles`).
- Prisma akan membuat folder di `prisma/migrations/<timestamp>_add_contoh_baru/` dan menjalankan migrasi ke DB dev.
- `prisma generate` otomatis dijalankan setelah migrasi.

### 3. (Opsional) Update seed

Jika ada tabel baru yang perlu data awal, edit `backend/prisma/seed.ts`, lalu:

```bash
npm run db:seed
```

### 4. Commit

- Jika pakai **migrate**: commit semua file di `prisma/schema.prisma` dan `prisma/migrations/`.
- Jangan commit `.env` atau file rahasia.

---

## Workflow: production / deploy

1. Pastikan `DATABASE_URL` di server mengarah ke database production.
2. Jalankan hanya migrasi yang belum jalan:

   ```bash
   cd backend
   npx prisma migrate deploy
   ```

3. Generate client (biasanya sudah jalan di build):

   ```bash
   npx prisma generate
   ```

4. Restart aplikasi backend.

**Jangan** jalankan `db push` atau `migrate dev` langsung ke database production; pakai hanya `migrate deploy` untuk menerapkan migrasi yang sudah di-commit.

---

## Contoh: penambahan tabel lengkap

1. **Tambah model di `schema.prisma`** (lihat contoh `ContohBaru` di atas).
2. **Generate + push atau migrate:**
   - `npx prisma generate && npx prisma db push`  
   atau  
   - `npx prisma migrate dev --name add_contoh_baru`
3. **Update kode** (repository, service, route) yang memakai tabel baru.
4. **Seed** jika perlu: ubah `seed.ts` → `npm run db:seed`.
5. **Commit** schema + migrasi (jika pakai migrate) + perubahan kode.

---

## Troubleshooting

- **"Database schema is not in sync"**  
  Jalankan `npx prisma db push` (dev) atau perbaiki migrasi lalu `npx prisma migrate deploy` (production).

- **Tabel/kolom hilang setelah push**  
  `db push` menyesuaikan DB dengan schema; jika model dihapus, tabel bisa ikut hilang. Backup dulu jika data penting.

- **Migrasi gagal di production**  
  Cek log error SQL dari Prisma. Sering karena constraint/foreign key atau data lama yang melanggar. Perbaiki migrasi (atau data) lalu deploy lagi.

- **Prisma Client tidak mengenal model baru**  
  Jalankan `npx prisma generate` setelah mengubah `schema.prisma`.

---

## Referensi

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma db push](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push)
- Schema proyek: `backend/prisma/schema.prisma`  
- Seed: `backend/prisma/seed.ts`
