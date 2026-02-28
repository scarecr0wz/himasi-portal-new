/**
 * Import users from Laravel/MySQL dump (himasi.sql) ke PostgreSQL himasi-portal.
 * - Menampilkan dulu NIM yang sudah ada di database (existing).
 * - Hanya mengimpor user yang NIM-nya belum ada.
 *
 * Usage:
 *   npx tsx scripts/import-users-from-mysql-dump.ts              # list existing + import
 *   npx tsx scripts/import-users-from-mysql-dump.ts --dry-run    # hanya list existing & preview import
 */

import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const prisma = new PrismaClient();

function getSqlPath(): string {
  if (process.env.HIMASI_SQL_PATH && existsSync(process.env.HIMASI_SQL_PATH))
    return process.env.HIMASI_SQL_PATH;
  const local = resolve(process.cwd(), "himasi-dump.sql");
  if (existsSync(local)) return local;
  return "/root/himasi.sql";
}

// Map jabatan_id (MySQL UUID) -> value jabatan (untuk lookup di Enumeration portal)
const JABATAN_ID_TO_VALUE: Record<string, string> = {
  "668a22f7-c666-42c2-993c-dbbc7dba8312": "Dewan Pengarah",
  "aa751c0b-cc8f-4b87-9a5c-b76715221a43": "Ketua Umum",
  "d512bca4-4f7d-4ff1-b1bc-decdf688d3b2": "Wakil Ketua Umum",
  "f25a0d02-8911-481d-a95e-42d024c0ac7f": "Sekretaris Umum",
  "5a8a09ff-ed95-4926-88d2-20e62dfa70ef": "Sekretaris",
  "f5eb827b-a672-40c6-bb91-9253abf3c504": "Bendahara Umum",
  "5e260919-66d1-4b97-aab5-6a707c8bcdeb": "Bendahara",
  "81afb8cf-6a9d-4684-8dad-c381957f663a": "Kepala Departemen",
  "fccaa9ae-4aec-4d98-a783-246e0423b089": "Anggota Departemen",
  "c4a142b0-8bba-4cd2-bac7-d9dc563e2c8b": "Anggota Aktif",
};

// Map departemen_id (MySQL UUID) / title -> portal Departemen id (fixed UUIDs dari seed)
const DEPARTEMEN_TITLE_TO_ID: Record<string, string> = {
  "Akademik & Keilmuan": "00000000-0000-0000-0000-000000000001",
  "Media & Publikasi": "00000000-0000-0000-0000-000000000002",
  "PSDM": "00000000-0000-0000-0000-000000000003",
  "Acara & Kehumasan": "00000000-0000-0000-0000-000000000004",
  "Acara & Humas": "00000000-0000-0000-0000-000000000004",
  "Olahraga & Seni": "00000000-0000-0000-0000-000000000005",
  "Olahraga": "00000000-0000-0000-0000-000000000005",
};
const DEPARTEMEN_ID_MYSQL_TO_PORTAL: Record<string, string> = {
  "564779c4-3584-4c47-a468-0b56a1250a31": "00000000-0000-0000-0000-000000000001",
  "7a775f16-65ff-49ab-8796-a5eaf2e9ceba": "00000000-0000-0000-0000-000000000002",
  "a8aa68a7-2892-418b-89c0-2caa8dcaeec9": "00000000-0000-0000-0000-000000000003",
  "6feaac1a-3828-49e8-98fa-91582556940d": "00000000-0000-0000-0000-000000000004",
  "019c5236-0b97-736a-98ae-a2667cf5b813": "00000000-0000-0000-0000-000000000005",
};

/** Parse one MySQL VALUES row: ('a','b',NULL,'c') -> ['a','b', null, 'c'] */
function parseMySQLRow(line: string): (string | null)[] {
  const values: (string | null)[] = [];
  let i = 0;
  const len = line.length;
  while (i < len) {
    while (i < len && (line[i] === " " || line[i] === "," || line[i] === "(" || line[i] === ")")) i++;
    if (i >= len) break;
    if (line[i] === "'") {
      i++;
      let s = "";
      while (i < len) {
        if (line[i] === "\\" && i + 1 < len) {
          s += line[i + 1] === "n" ? "\n" : line[i + 1] === "r" ? "\r" : line[i + 1];
          i += 2;
          continue;
        }
        if (line[i] === "'") {
          i++;
          break;
        }
        s += line[i++];
      }
      values.push(s);
      continue;
    }
    if (line.slice(i, i + 4) === "NULL") {
      values.push(null);
      i += 4;
      continue;
    }
    i++;
  }
  return values;
}

/** Extract user rows from INSERT INTO `users` ... VALUES ... */
function extractUsersFromSql(content: string): Array<Record<string, string | null>> {
  const users: Array<Record<string, string | null>> = [];
  const insertStart = content.indexOf("INSERT INTO `users`");
  if (insertStart === -1) return users;
  let chunk = content.slice(insertStart);
  const valuesStart = chunk.indexOf("VALUES");
  if (valuesStart === -1) return users;
  chunk = chunk.slice(valuesStart + 5);
  const lines = chunk.split(/\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("(")) continue;
    if (trimmed === ");") break;
    const row = parseMySQLRow(trimmed);
    if (row.length < 19) continue;
    const str = (v: string | null) => (v != null && v !== "NULL" ? v : null);
    users.push({
      id: str(row[0]),
      name: str(row[1]),
      nim: str(row[2]),
      email: str(row[3]),
      email_verified_at: str(row[4]),
      password: str(row[5]),
      jabatan_id: str(row[6]),
      departemen_id: str(row[7]),
      angkatan: str(row[8]),
      joined_at: str(row[9]),
      birth_date: str(row[10]),
      phone_number: str(row[11]),
      instagram_account: str(row[12]),
      address: str(row[13]),
      avatar: str(row[14]),
      remember_token: str(row[15]),
      deleted_at: str(row[16]),
      created_at: str(row[17]) ?? "",
      updated_at: str(row[18]) ?? "",
    });
  }
  return users;
}

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log("=== HIMASI Portal: Import Users dari MySQL Dump ===\n");

  // 1. List existing NIMs di PostgreSQL
  const existingUsers = await prisma.user.findMany({
    select: { nim: true, name: true, email: true },
    orderBy: { nim: "asc" },
  });
  const existingNims = new Set(existingUsers.map((u) => u.nim));

  console.log("📋 NIM yang SUDAH ADA di database (existing):");
  if (existingUsers.length === 0) {
    console.log("   (tidak ada)");
  } else {
    existingUsers.forEach((u) => console.log(`   - ${u.nim}  ${u.name}  ${u.email}`));
  }
  console.log(`   Total: ${existingUsers.length} user\n`);

  // 2. Baca & parse SQL dump
  const sqlPath = getSqlPath();
  let sqlContent: string;
  try {
    sqlContent = readFileSync(sqlPath, "utf-8");
  } catch (e) {
    console.error("File SQL tidak ditemukan:", sqlPath);
    console.error("Set env HIMASI_SQL_PATH atau taruh himasi-dump.sql di backend/.");
    process.exit(1);
  }

  const rawUsers = extractUsersFromSql(sqlContent);
  console.log(`📂 Dari file SQL: ${rawUsers.length} user terbaca.\n`);

  const toImport = rawUsers.filter((u) => !existingNims.has(u.nim!));
  const skippedByNim = rawUsers.length - toImport.length;

  console.log(`⏭️  Dilewati (NIM sudah ada): ${skippedByNim} user`);
  if (skippedByNim > 0) {
    const skipped = rawUsers.filter((u) => existingNims.has(u.nim!));
    skipped.forEach((u) => console.log(`   - ${u.nim}  ${u.name}`));
  }
  console.log(`\n✅ Akan diimport (NIM belum ada): ${toImport.length} user\n`);

  if (dryRun) {
    console.log("(Dry run – tidak menulis ke database. Hapus --dry-run untuk import.)");
    toImport.slice(0, 20).forEach((u, i) => console.log(`   ${i + 1}. ${u.nim}  ${u.name}  ${u.email}`));
    if (toImport.length > 20) console.log(`   ... dan ${toImport.length - 20} lagi.`);
    return;
  }

  if (toImport.length === 0) {
    console.log("Tidak ada user baru untuk diimport.");
    return;
  }

  // Resolve jabatan by value (Enumeration key=jabatan)
  const jabatanByValue = new Map<string, string>();
  const enumerations = await prisma.enumeration.findMany({ where: { key: "jabatan" } });
  for (const e of enumerations) {
    jabatanByValue.set(e.value, e.id);
  }

  const GUARD = "api";
  const anggotaAktifRole = await prisma.role.findFirst({ where: { name: "anggota-aktif", guardName: GUARD } });
  const roleIdForNewUsers = anggotaAktifRole?.id;

  let created = 0;
  let failed = 0;

  for (const u of toImport) {
    try {
      const jabatanValue = u.jabatan_id ? JABATAN_ID_TO_VALUE[u.jabatan_id] : null;
      const jabatanId = jabatanValue ? jabatanByValue.get(jabatanValue) ?? null : null;

      let departemenId: string | null = null;
      if (u.departemen_id) {
        departemenId = DEPARTEMEN_ID_MYSQL_TO_PORTAL[u.departemen_id] ?? null;
      }

      const emailVerifiedAt = parseDate(u.email_verified_at);
      const joinedAt = parseDate(u.joined_at);
      const birthDate = parseDate(u.birth_date);

      await prisma.user.create({
        data: {
          name: u.name!,
          nim: u.nim!,
          email: u.email!,
          emailVerifiedAt: emailVerifiedAt ?? undefined,
          password: u.password!,
          jabatanId: jabatanId ?? undefined,
          departemenId: departemenId ?? undefined,
          angkatan: u.angkatan ?? undefined,
          joinedAt: joinedAt ?? undefined,
          birthDate: birthDate ?? undefined,
          phoneNumber: (u.phone_number ?? undefined)?.slice(0, 20),
          instagramAccount: u.instagram_account ?? undefined,
          address: u.address ?? undefined,
          avatar: u.avatar ?? undefined,
          membershipStatus: "APPROVED",
          programStudi: "SI",
        },
      });

      if (roleIdForNewUsers) {
        const newUser = await prisma.user.findUnique({ where: { nim: u.nim! } });
        if (newUser) {
          await prisma.modelHasRole.upsert({
            where: { roleId_userId: { roleId: roleIdForNewUsers, userId: newUser.id } },
            create: { roleId: roleIdForNewUsers, userId: newUser.id },
            update: {},
          }).catch(() => {});
        }
      }
      created++;
      if (created % 20 === 0) console.log(`   Imported ${created}/${toImport.length}...`);
    } catch (err: unknown) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   Gagal ${u.nim} ${u.name}: ${msg}`);
    }
  }

  console.log(`\n✅ Selesai. Created: ${created}, Failed: ${failed}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
