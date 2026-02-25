/**
 * Seed dari referensi backend-web-himasi (Laravel seeders).
 * Urutan: Enumeration → Departemen → Proker → Activity → Menu → Permission → Role → RoleHasPermission → User → ModelHasRole
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const GUARD = "api";

async function main() {
  // ---- 1. EnumerationSeeder ----
  const enumData = [
    { key: "article_category", value: "Akademik" },
    { key: "article_category", value: "Event" },
    { key: "article_category", value: "Inovasi" },
    { key: "forum_category", value: "Diskusi Umum" },
    { key: "forum_category", value: "Perkenalan" },
    { key: "jabatan", value: "Dewan Pengarah" },
    { key: "jabatan", value: "Ketua Umum" },
    { key: "jabatan", value: "Wakil Ketua Umum" },
    { key: "jabatan", value: "Sekretaris Umum" },
    { key: "jabatan", value: "Sekretaris" },
    { key: "jabatan", value: "Bendahara Umum" },
    { key: "jabatan", value: "Bendahara" },
    { key: "jabatan", value: "Kepala Departemen" },
    { key: "jabatan", value: "Anggota Departemen" },
    { key: "jabatan", value: "Anggota Aktif" },
    { key: "category_finance", value: "Kas" },
    { key: "category_finance", value: "Sponsorship" },
    { key: "category_finance", value: "Donasi" },
    { key: "category_finance", value: "Operasional" },
    { key: "category_finance", value: "Pengembangan Program Kerja" },
    { key: "category_news", value: "Pengumuman" },
    { key: "category_news", value: "Berita Kegiatan" },
    { key: "category_news", value: "Artikel" },
    { key: "category_news", value: "Informasi Umum" },
    { key: "category_news", value: "Update Teknologi" },
    { key: "category_aspiration", value: "Akademik & Perkuliahan" },
    { key: "category_aspiration", value: "Fasilitas & Layanan" },
    { key: "category_aspiration", value: "Kegiatan & Acara" },
    { key: "category_aspiration", value: "Organisasi & Kepengurusan" },
    { key: "category_aspiration", value: "Lainnya" },
    { key: "archive_category", value: "Dokumen Internal" },
    { key: "archive_category", value: "Dokumen Eksternal" },
    { key: "archive_category", value: "Laporan Kegiatan" },
    { key: "archive_category", value: "Proposal" },
    { key: "archive_category", value: "Lainnya" },
  ];
  for (const item of enumData) {
    const exists = await prisma.enumeration.findFirst({ where: { key: item.key, value: item.value } });
    if (!exists) await prisma.enumeration.create({ data: item });
  }
  console.log("Enumeration: OK");

  // ---- 2. DepartemenSeeder ----
  const deptAkademik = await prisma.departemen.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      icon: "pepicons-print:book",
      title: "Akademik & Keilmuan",
      desc: "Fokus pada pengembangan akademik dan wawasan teknologi informasi mahasiswa.",
    },
    update: {},
  });
  const deptMedia = await prisma.departemen.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      icon: "material-symbols-light:media-link-sharp",
      title: "Media & Publikasi",
      desc: "Mengelola informasi, media sosial, dan branding organisasi.",
    },
    update: {},
  });
  await prisma.departemen.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      icon: "streamline-freehand-color:human-resources-hierarchy",
      title: "PSDM",
      desc: "Pengembangan Sumber Daya Mahasiswa, kaderisasi, dan pelatihan soft skill.",
    },
    update: {},
  });
  await prisma.departemen.upsert({
    where: { id: "00000000-0000-0000-0000-000000000004" },
    create: {
      id: "00000000-0000-0000-0000-000000000004",
      icon: "ic:outline-emoji-events",
      title: "Acara & Humas",
      desc: "Menyelenggarakan event dan menjalin hubungan dengan pihak luar.",
    },
    update: {},
  });
  await prisma.departemen.upsert({
    where: { id: "00000000-0000-0000-0000-000000000005" },
    create: {
      id: "00000000-0000-0000-0000-000000000005",
      icon: "fluent:sport-20-filled",
      title: "Olahraga",
      desc: "Menampung minat dan bakat mahasiswa di bidang olahraga.",
    },
    update: {},
  });
  console.log("Departemen: OK");

  // ---- 3. Proker (dari DepartemenSeeder) ----
  await prisma.proker.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      departemenId: deptAkademik.id,
      title: "Belajar Bersama (Study Club)",
      desc: "Kegiatan rutin untuk membahas materi perkuliahan dan belajar teknologi baru bersama-sama. Dipandu oleh mentor dari mahasiswa senior atau alumni.",
      isActive: true,
    },
    update: {},
  });
  await prisma.proker.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      departemenId: deptAkademik.id,
      title: "Webinar Teknologi",
      desc: "Agenda berbagi wawasan teknologi terbaru bersama praktisi dan akademisi.",
      isActive: true,
    },
    update: {},
  });
  console.log("Proker: OK");

  // ---- 4. ActivitySeeder ----
  await prisma.activity.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      title: "Malam Keakraban Keluarga Prodi SI by Hima",
      desc: `✨ MAKRASI 2026 ✨
"CODE THE BOND : DECODE YOUR NEW FAMILY"

📅 14–15 Februari 2026
📍 Villa Jangkrik 🤩

MAKRASI hadir buat kamu yang pengen:
🤍 bonding & kebersamaan
🎯 games + fun activity
💬 sharing & cerita baru
🎁 EXCHANGE GIFT (Tukar Kado)
(min 10K – max 15K , bukan makanan/minuman )
AND MANY MORE~`,
      startAt: new Date("2026-02-11T00:00:00"),
      endAt: new Date("2026-02-11T16:00:00"),
      uploadAt: new Date("2026-02-09"),
      isActive: true,
    },
    update: {},
  });
  console.log("Activity: OK");

  // ---- 5. MenuSeeder ----
  const menuDashboard = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000001" },
    create: { id: "10000000-0000-0000-0000-000000000001", name: "Dashboard", url: "/dashboard", permissionName: "menu.dashboard", order: 1, icon: "material-symbols:dashboard" },
    update: {},
  });
  const menuUsers = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000002" },
    create: { id: "10000000-0000-0000-0000-000000000002", name: "User Management", url: "#", permissionName: "menu.user.management", order: 2, icon: "ix:user-management-filled" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000003" },
    create: { id: "10000000-0000-0000-0000-000000000003", name: "Permission", url: "/user/permission", parentId: menuUsers.id, permissionName: "menu.user.permission", order: 3 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000004" },
    create: { id: "10000000-0000-0000-0000-000000000004", name: "Role", url: "/user/role", parentId: menuUsers.id, permissionName: "menu.user.role", order: 4 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000005" },
    create: { id: "10000000-0000-0000-0000-000000000005", name: "Menu", url: "/user/menu", parentId: menuUsers.id, permissionName: "menu.user.menu", order: 5 },
    update: {},
  });
  const menuMaster = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000006" },
    create: { id: "10000000-0000-0000-0000-000000000006", name: "Master Data", url: "#", permissionName: "menu.master", order: 2, icon: "eos-icons:master-outlined" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000007" },
    create: { id: "10000000-0000-0000-0000-000000000007", name: "Enumeration", url: "/master/enumeration", parentId: menuMaster.id, permissionName: "menu.master.enumeration", order: 1 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000008" },
    create: { id: "10000000-0000-0000-0000-000000000008", name: "Department", url: "/master/department", parentId: menuMaster.id, permissionName: "menu.master.department", order: 2 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000009" },
    create: { id: "10000000-0000-0000-0000-000000000009", name: "Proker", url: "/master/proker", parentId: menuMaster.id, permissionName: "menu.master.proker", order: 3 },
    update: {},
  });
  const menuAdministrasi = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000010" },
    create: { id: "10000000-0000-0000-0000-000000000010", name: "Administrasi", url: "#", permissionName: "menu.administrasi", order: 3, icon: "formkit:folder" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000011" },
    create: { id: "10000000-0000-0000-0000-000000000011", name: "Keuangan", url: "/finance", parentId: menuAdministrasi.id, permissionName: "menu.finance", order: 1, icon: "streamline-stickies-color:money-briefcase" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000012" },
    create: { id: "10000000-0000-0000-0000-000000000012", name: "Persuratan", url: "/archive-document", parentId: menuAdministrasi.id, permissionName: "menu.archive", order: 2, icon: "material-symbols:archive" },
    update: {},
  });
  const menuKemahasiswaan = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000013" },
    create: { id: "10000000-0000-0000-0000-000000000013", name: "Kemahasiswaan", url: "/kemahasiswaan", permissionName: "menu.kemahasiswaan", order: 3, icon: "formkit:avatarman" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000014" },
    create: { id: "10000000-0000-0000-0000-000000000014", name: "Mahasiswa", url: "/user/user", parentId: menuKemahasiswaan.id, permissionName: "menu.user.user", order: 1 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000015" },
    create: { id: "10000000-0000-0000-0000-000000000015", name: "Pendaftaran", url: "/registration", parentId: menuKemahasiswaan.id, permissionName: "menu.registration", order: 2 },
    update: {},
  });
  const menuAkademik = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000016" },
    create: { id: "10000000-0000-0000-0000-000000000016", name: "Akademik", url: "/akademik", permissionName: "menu.akademik", order: 3, icon: "tdesign:education" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000017" },
    create: { id: "10000000-0000-0000-0000-000000000017", name: "BerSI", url: "/akademik/bersi", parentId: menuAkademik.id, permissionName: "menu.akademik.bersi", order: 1 },
    update: {},
  });
  const menuCms = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000018" },
    create: { id: "10000000-0000-0000-0000-000000000018", name: "Media & Publikasi", url: "#", permissionName: "menu.cms", order: 4, icon: "formkit:playcircle" },
    update: {},
  });
  const menuAcara = await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000019" },
    create: { id: "10000000-0000-0000-0000-000000000019", name: "Acara", url: "#", permissionName: "menu.acara", order: 4, icon: "lucide:calendar-days" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000020" },
    create: { id: "10000000-0000-0000-0000-000000000020", name: "Kegiatan", url: "/activities", parentId: menuAcara.id, permissionName: "menu.activities", order: 1 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000021" },
    create: { id: "10000000-0000-0000-0000-000000000021", name: "Kehadiran Mahasiswa", url: "/activities/recap", parentId: menuAcara.id, permissionName: "menu.activities", order: 1 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000022" },
    create: { id: "10000000-0000-0000-0000-000000000022", name: "Keuntungan", url: "/cms/benefits", parentId: menuCms.id, permissionName: "menu.cms.benefits", order: 2 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000023" },
    create: { id: "10000000-0000-0000-0000-000000000023", name: "Berita", url: "/cms/news", parentId: menuCms.id, permissionName: "menu.cms.news", order: 3 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000024" },
    create: { id: "10000000-0000-0000-0000-000000000024", name: "FAQ", url: "/cms/faq", parentId: menuCms.id, permissionName: "menu.cms.faq", order: 4 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000025" },
    create: { id: "10000000-0000-0000-0000-000000000025", name: "Photo Dokumentasi", url: "/cms/photo", parentId: menuCms.id, permissionName: "menu.cms.photo", order: 5 },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000026" },
    create: { id: "10000000-0000-0000-0000-000000000026", name: "Kas", url: "/recap-payment", permissionName: "menu.recap-finance", order: 5, icon: "iconoir:wallet-solid" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000027" },
    create: { id: "10000000-0000-0000-0000-000000000027", name: "Kehadiran", url: "/absensi", permissionName: "absence.view", order: 6, icon: "mingcute:base-station-fill" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000028" },
    create: { id: "10000000-0000-0000-0000-000000000028", name: "Aspirasi", url: "/aspiration", permissionName: "menu.aspiration", order: 7, icon: "icons8:idea" },
    update: {},
  });
  await prisma.menu.upsert({
    where: { id: "10000000-0000-0000-0000-000000000029" },
    create: { id: "10000000-0000-0000-0000-000000000029", name: "Ruang Terbuka", url: "/forum", permissionName: "menu.forum", order: 8, icon: "ri:chat-3-line" },
    update: {},
  });
  console.log("Menu: OK");

  // ---- 6. RolePermissionSeeder: permissions ----
  const permissionNames = [
    "permission.view", "permission.create", "permission.edit", "permission.delete",
    "enumeration.view", "enumeration.create", "enumeration.edit", "enumeration.delete",
    "role.view", "role.create", "role.edit", "role.delete",
    "menu.view", "menu.create", "menu.edit", "menu.delete",
    "user.view", "user.create", "user.edit", "user.delete",
    "menu.dashboard", "menu.user.management", "menu.user.permission", "menu.user.role", "menu.user.user", "menu.user.menu",
    "menu.master", "menu.master.enumeration", "menu.master.department", "menu.master.proker",
    "menu.administrasi", "menu.finance", "menu.archive",
    "menu.kemahasiswaan", "menu.registration",
    "menu.akademik", "menu.akademik.bersi",
    "menu.cms", "menu.cms.benefits", "menu.cms.news", "menu.cms.departments", "menu.cms.faq", "menu.cms.proker", "menu.cms.photo",
    "menu.aspiration", "menu.forum", "menu.recap-finance", "menu.activities", "menu.acara",
    "cms.benefit.view", "cms.benefit.create", "cms.benefit.edit", "cms.benefit.delete",
    "cms.news.view", "cms.news.create", "cms.news.show", "cms.news.edit", "cms.news.delete",
    "cms.departemen.view", "cms.departemen.create", "cms.departemen.edit", "cms.departemen.delete",
    "cms.faq.view", "cms.faq.create", "cms.faq.edit", "cms.faq.delete",
    "cms.proker.view", "cms.proker.create", "cms.proker.edit", "cms.proker.delete",
    "cms.photo.view", "cms.photo.create", "cms.photo.edit", "cms.photo.delete",
    "registration.view", "registration.exportPdfAll", "registration.exportPdf", "registration.delete",
    "archive.view", "archive.create", "archive.edit", "archive.delete",
    "activity.view", "activity.detail", "activity.create", "activity.edit", "activity.delete",
    "absence.view", "absence.create",
    "academic.view", "academic.detail", "academic.create", "academic.edit", "academic.delete",
    "forum.view", "forum.create", "forum.delete", "forum.edit",
    "finance.view", "finance.create", "finance.edit", "finance.delete",
    "aspiration.view", "aspiration.exportPdfAll", "aspiration.exportPdf", "aspiration.delete",
    "bersi.view", "bersi.create", "bersi.edit", "bersi.delete",
    "recap-finance.view", "recap-finance.create", "recap-finance.edit", "recap-finance.delete",
  ];
  for (const name of permissionNames) {
    await prisma.permission.upsert({
      where: { name_guardName: { name, guardName: GUARD } },
      create: { name, guardName: GUARD },
      update: {},
    });
  }
  const allPerms = await prisma.permission.findMany({ where: { guardName: GUARD } });
  console.log("Permission: OK");

  // ---- 7. Roles ----
  const superadminRole = await prisma.role.upsert({
    where: { name_guardName: { name: "superadmin", guardName: GUARD } },
    create: { name: "superadmin", guardName: GUARD },
    update: {},
  });
  const adminRole = await prisma.role.upsert({
    where: { name_guardName: { name: "admin", guardName: GUARD } },
    create: { name: "admin", guardName: GUARD },
    update: {},
  });

  // ---- 8. RoleHasPermission: superadmin = all, admin = subset ----
  for (const p of allPerms) {
    await prisma.roleHasPermission.upsert({
      where: { permissionId_roleId: { permissionId: p.id, roleId: superadminRole.id } },
      create: { permissionId: p.id, roleId: superadminRole.id },
      update: {},
    }).catch(() => {});
  }
  const adminPermNames = [
    "permission.view", "permission.create", "permission.edit", "permission.delete",
    "enumeration.view", "enumeration.create", "enumeration.edit", "enumeration.delete",
    "role.view", "role.create", "role.edit", "role.delete",
    "menu.view", "menu.create", "menu.edit", "menu.delete",
    "user.view", "user.create", "user.edit", "user.delete",
    "menu.dashboard", "menu.master", "menu.master.enumeration", "menu.master.department", "menu.master.proker",
    "menu.administrasi", "menu.finance", "menu.archive",
    "menu.kemahasiswaan", "menu.registration", "menu.akademik", "menu.akademik.bersi",
    "menu.cms", "menu.activities", "menu.cms.benefits", "menu.cms.news", "menu.cms.departments", "menu.cms.faq", "menu.cms.proker", "menu.cms.photo",
    "menu.recap-finance", "menu.aspiration", "menu.forum", "menu.acara",
    "activity.view", "activity.detail", "activity.create", "activity.edit", "activity.delete",
    "absence.view", "absence.create",
    "academic.view", "academic.detail", "academic.create", "academic.edit", "academic.delete",
    "forum.view", "forum.create", "forum.delete", "forum.edit",
    "cms.benefit.view", "cms.benefit.create", "cms.benefit.edit", "cms.benefit.delete",
    "cms.news.view", "cms.news.create", "cms.news.show", "cms.news.edit", "cms.news.delete",
    "cms.departemen.view", "cms.departemen.create", "cms.departemen.edit", "cms.departemen.delete",
    "cms.faq.view", "cms.faq.create", "cms.faq.edit", "cms.faq.delete",
    "cms.proker.view", "cms.proker.create", "cms.proker.edit", "cms.proker.delete",
    "cms.photo.view", "cms.photo.create", "cms.photo.edit", "cms.photo.delete",
    "registration.view", "registration.exportPdfAll", "registration.exportPdf", "registration.delete",
    "archive.view", "archive.create", "archive.edit", "archive.delete",
    "finance.view", "finance.create", "finance.edit", "finance.delete",
    "aspiration.view", "aspiration.exportPdfAll", "aspiration.exportPdf", "aspiration.delete",
    "bersi.view", "bersi.create", "bersi.edit", "bersi.delete",
    "recap-finance.view", "recap-finance.create", "recap-finance.edit", "recap-finance.delete",
  ];
  for (const name of adminPermNames) {
    const perm = allPerms.find((x) => x.name === name);
    if (perm)
      await prisma.roleHasPermission.upsert({
        where: { permissionId_roleId: { permissionId: perm.id, roleId: adminRole.id } },
        create: { permissionId: perm.id, roleId: adminRole.id },
        update: {},
      }).catch(() => {});
  }
  console.log("Role + RoleHasPermission: OK");

  // ---- 9. Users (RolePermissionSeeder) ----
  const hash = (s: string) => bcrypt.hash(s, 10);
  const userSuperadmin = await prisma.user.upsert({
    where: { nim: "0000000000" },
    create: { nim: "0000000000", name: "Super Admin", email: "superadmin@gmail.com", password: await hash("password") },
    update: {},
  });
  const userSuperadmin2 = await prisma.user.upsert({
    where: { nim: "000" },
    create: { nim: "000", name: "Super Admin2", email: "superadmin2@gmail.com", password: await hash("password") },
    update: {},
  });
  const userAdmin = await prisma.user.upsert({
    where: { nim: "0000000001" },
    create: { nim: "0000000001", name: "Admin", email: "admin@gmail.com", password: await hash("password") },
    update: {},
  });

  // ---- 10. ModelHasRole ----
  await prisma.modelHasRole.upsert({
    where: { roleId_userId: { roleId: superadminRole.id, userId: userSuperadmin.id } },
    create: { roleId: superadminRole.id, userId: userSuperadmin.id },
    update: {},
  }).catch(() => {});
  await prisma.modelHasRole.upsert({
    where: { roleId_userId: { roleId: superadminRole.id, userId: userSuperadmin2.id } },
    create: { roleId: superadminRole.id, userId: userSuperadmin2.id },
    update: {},
  }).catch(() => {});
  await prisma.modelHasRole.upsert({
    where: { roleId_userId: { roleId: adminRole.id, userId: userAdmin.id } },
    create: { roleId: adminRole.id, userId: userAdmin.id },
    update: {},
  }).catch(() => {});

  console.log("User + ModelHasRole: OK");
  console.log("");
  console.log("Seed dari referensi backend-web-himasi selesai.");
  console.log("Login: NIM 0000000000 / 000 (superadmin) atau 0000000001 (admin), password: password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
