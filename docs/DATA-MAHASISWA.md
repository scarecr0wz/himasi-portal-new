# Data Mahasiswa — Portal HIMASI

Struktur data mahasiswa mengikuti pengelompokan **aman → sensitif**. Hanya Level 1–3 yang disimpan; Level 4 sengaja **tidak dikoleksi**.

---

## Level 1 — Wajib (minimal, paling aman)

| Field | Lokasi | Keterangan |
|-------|--------|------------|
| Nama lengkap | `User.name` | |
| NIM | `User.nim` | Unique, untuk login |
| Email kampus / utama | `User.email` | |
| Nomor HP | `User.phoneNumber` | Opsional, untuk notifikasi |
| Angkatan / tahun masuk | `User.angkatan` | |
| Program studi | `User.programStudi` | Default: SI |
| Status keanggotaan | `User.membershipStatus` | `ACTIVE` / `INACTIVE` |
| Role di portal | Tabel `roles` + `model_has_roles` | member / pengurus / admin |
| Divisi | `User.departemenId` → `Departemen` | Kalau pengurus |

---

## Level 2 — Berguna untuk operasional & komunitas

| Field | Lokasi | Keterangan |
|-------|--------|------------|
| Domisili (kota saja) | `MahasiswaProfile.domisiliCity` | Bukan alamat lengkap |
| Minat & fokus | `MahasiswaProfile.minatFokus` | Data, Web, Mobile, UI/UX, Security, Cloud, dll |
| Skill set + level | `MahasiswaProfile.skillsJson` | Self-assessment (JSON) |
| Link portfolio | `MahasiswaProfile.portfolioGithub`, `portfolioLinkedin`, `portfolioBehance` | |
| Preferensi komunikasi | `MahasiswaProfile.communicationPreference` | WA / email |
| Jam notifikasi | `MahasiswaProfile.notificationHours` | Mis. 09-17 |
| Riwayat ikut event | `MahasiswaEventParticipation` | Audit trail: user + activity + attended |

---

## Level 3 — Fitur lanjutan (perlu governance)

| Field | Lokasi | Keterangan |
|-------|--------|------------|
| CV/Resume | `MahasiswaProfile.cvPath` | Simpan file di object storage, DB hanya path |
| Sertifikat / badge | `MahasiswaBadge` | badgeType, title, certificatePath, issuedAt |
| Transkrip kehadiran | `MahasiswaEventParticipation.attended` + activity | |
| Kontribusi komunitas | `MahasiswaKontribusi` | type: article / mentor / speaker, title, occurredAt |

**Governance:**  
- `MahasiswaProfile.consentAt` — kapan user setuju privacy policy.  
- `MahasiswaProfile.dataRetentionRequestedAt` — kapan user minta penghapusan data (hak subjek data).

---

## Level 4 — Sensitif (tidak dikoleksi)

Sesuai UU PDP, **tidak disimpan** di portal:

- Alamat rumah lengkap (kalau ada field legacy, jangan dipakai untuk form baru)
- NIK / KTP
- Tanggal lahir lengkap (cukup tahun lahir atau range umur bila perlu)
- Data kesehatan, biometrik, keuangan
- Data orang tua

---

## Best practice

1. **Self-service:** Mahasiswa daftar dan isi sendiri; verifikasi NIM/email via OTP atau kode dari prodi.
2. **Consent:** Checkbox consent (bukan auto-centang) saat daftar; simpan `consentAt`.
3. **Hak user:** Update data, download data, request delete — implementasi di API & UI.
4. **Role-based access:** Pengurus divisi hanya akses data yang relevan.
5. **Audit log:** Catat siapa akses data apa dan kapan (implementasi terpisah di aplikasi).

---

## MVP — Paket data minimal

Untuk peluncuran awal:

- Nama, NIM, Email, Angkatan (`User`)
- Role + Divisi (`User.departemenId` + roles)
- Minat/skill (checkbox atau tag) → `MahasiswaProfile.minatFokus` / `skillsJson`
- GitHub / LinkedIn (opsional) → `MahasiswaProfile.portfolioGithub`, `portfolioLinkedin`
- Event participation log → `MahasiswaEventParticipation` (isi otomatis dari sistem)

Schema Prisma sudah menyediakan kolom/tabel di atas; frontend dan API tinggal mengisi dan menampilkan sesuai kebijakan ini.
