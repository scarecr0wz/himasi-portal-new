import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware, requirePermission } from "../lib/auth.js";
import { prisma } from "../lib/db.js";
import type { AuthVariables } from "../lib/auth.js";

const admin = new Hono<{ Variables: AuthVariables }>();

admin.use("*", authMiddleware, requirePermission("menu.cms.news"));

// Helper: soft delete by setting deletedAt
const now = () => new Date();

// ---------- Enumerations (for news category dropdown) ----------
admin.get("/admin/enumerations", async (c) => {
  const key = c.req.query("key");
  const list = await prisma.enumeration.findMany({
    where: key ? { key, deletedAt: null } : { deletedAt: null },
    orderBy: [{ key: "asc" }, { value: "asc" }],
  });
  return c.json(list);
});

// ---------- News ----------
const newsCreateSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1),
  slug: z.string().min(1),
  desc: z.string(),
  author: z.string().min(1),
  photo: z.string().optional().nullable(),
  publishedAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});
const newsUpdateSchema = newsCreateSchema.partial();

admin.get("/admin/news", async (c) => {
  const list = await prisma.news.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return c.json(list);
});
admin.post("/admin/news", zValidator("json", newsCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const created = await prisma.news.create({
    data: {
      categoryId: body.categoryId,
      title: body.title,
      slug: body.slug,
      desc: body.desc,
      author: body.author,
      photo: body.photo ?? null,
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      isActive: body.isActive ?? false,
    },
  });
  return c.json(created, 201);
});
admin.put("/admin/news/:id", zValidator("json", newsUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const updated = await prisma.news.update({
    where: { id },
    data: {
      ...(body.categoryId != null && { categoryId: body.categoryId }),
      ...(body.title != null && { title: body.title }),
      ...(body.slug != null && { slug: body.slug }),
      ...(body.desc != null && { desc: body.desc }),
      ...(body.author != null && { author: body.author }),
      ...(body.photo !== undefined && { photo: body.photo }),
      ...(body.publishedAt !== undefined && { publishedAt: body.publishedAt ? new Date(body.publishedAt) : null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return c.json(updated);
});
admin.delete("/admin/news/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.news.update({ where: { id }, data: { deletedAt: now() } });
  return c.json({ ok: true });
});

// ---------- Activities ----------
const activityCreateSchema = z.object({
  title: z.string().min(1),
  desc: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  isActive: z.boolean().optional(),
});
const activityUpdateSchema = activityCreateSchema.partial();

admin.get("/admin/activities", async (c) => {
  const list = await prisma.activity.findMany({
    where: { deletedAt: null },
    orderBy: { startAt: "desc" },
  });
  return c.json(list);
});
admin.post("/admin/activities", zValidator("json", activityCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const created = await prisma.activity.create({
    data: {
      title: body.title,
      desc: body.desc ?? null,
      image: body.image ?? null,
      startAt: new Date(body.startAt),
      endAt: new Date(body.endAt),
      uploadAt: now(),
      isActive: body.isActive ?? true,
    },
  });
  return c.json(created, 201);
});
admin.put("/admin/activities/:id", zValidator("json", activityUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const updated = await prisma.activity.update({
    where: { id },
    data: {
      ...(body.title != null && { title: body.title }),
      ...(body.desc !== undefined && { desc: body.desc }),
      ...(body.image !== undefined && { image: body.image }),
      ...(body.startAt != null && { startAt: new Date(body.startAt) }),
      ...(body.endAt != null && { endAt: new Date(body.endAt) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return c.json(updated);
});
admin.delete("/admin/activities/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.activity.update({ where: { id }, data: { deletedAt: now() } });
  return c.json({ ok: true });
});

// ---------- Departments ----------
const departmentCreateSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  desc: z.string(),
});
const departmentUpdateSchema = departmentCreateSchema.partial();

admin.get("/admin/departments", async (c) => {
  const list = await prisma.departemen.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return c.json(list);
});
admin.post("/admin/departments", zValidator("json", departmentCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const created = await prisma.departemen.create({
    data: { icon: body.icon, title: body.title, desc: body.desc },
  });
  return c.json(created, 201);
});
admin.put("/admin/departments/:id", zValidator("json", departmentUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const updated = await prisma.departemen.update({
    where: { id },
    data: {
      ...(body.icon != null && { icon: body.icon }),
      ...(body.title != null && { title: body.title }),
      ...(body.desc != null && { desc: body.desc }),
    },
  });
  return c.json(updated);
});
admin.delete("/admin/departments/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.departemen.update({ where: { id }, data: { deletedAt: now() } });
  return c.json({ ok: true });
});

// ---------- Prokers ----------
const prokerCreateSchema = z.object({
  departemenId: z.string().uuid(),
  title: z.string().min(1),
  desc: z.string(),
  photo: z.string().optional().nullable(),
  actionLink: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});
const prokerUpdateSchema = prokerCreateSchema.partial();

admin.get("/admin/prokers", async (c) => {
  const list = await prisma.proker.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { departemen: { select: { id: true, title: true } } },
  });
  return c.json(list);
});
admin.post("/admin/prokers", zValidator("json", prokerCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const created = await prisma.proker.create({
    data: {
      departemenId: body.departemenId,
      title: body.title,
      desc: body.desc,
      photo: body.photo ?? null,
      actionLink: body.actionLink ?? null,
      isActive: body.isActive ?? true,
    },
  });
  return c.json(created, 201);
});
admin.put("/admin/prokers/:id", zValidator("json", prokerUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const updated = await prisma.proker.update({
    where: { id },
    data: {
      ...(body.departemenId != null && { departemenId: body.departemenId }),
      ...(body.title != null && { title: body.title }),
      ...(body.desc != null && { desc: body.desc }),
      ...(body.photo !== undefined && { photo: body.photo }),
      ...(body.actionLink !== undefined && { actionLink: body.actionLink }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });
  return c.json(updated);
});
admin.delete("/admin/prokers/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.proker.update({ where: { id }, data: { deletedAt: now() } });
  return c.json({ ok: true });
});

// ---------- FAQs ----------
const faqCreateSchema = z.object({ title: z.string().min(1), desc: z.string() });
const faqUpdateSchema = faqCreateSchema.partial();

admin.get("/admin/faqs", async (c) => {
  const list = await prisma.faq.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return c.json(list);
});
admin.post("/admin/faqs", zValidator("json", faqCreateSchema), async (c) => {
  const body = c.req.valid("json");
  const created = await prisma.faq.create({
    data: { title: body.title, desc: body.desc },
  });
  return c.json(created, 201);
});
admin.put("/admin/faqs/:id", zValidator("json", faqUpdateSchema), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const updated = await prisma.faq.update({
    where: { id },
    data: {
      ...(body.title != null && { title: body.title }),
      ...(body.desc != null && { desc: body.desc }),
    },
  });
  return c.json(updated);
});
admin.delete("/admin/faqs/:id", async (c) => {
  const id = c.req.param("id");
  await prisma.faq.update({ where: { id }, data: { deletedAt: now() } });
  return c.json({ ok: true });
});

// ---------- Settings: User Administrasi (users with admin/superadmin role) ----------
const ADMIN_ROLE_NAMES = ["admin", "superadmin"];

admin.get("/admin/settings/users", async (c) => {
  const roleIds = await prisma.role.findMany({
    where: { name: { in: ADMIN_ROLE_NAMES }, guardName: "api" },
    select: { id: true },
  }).then((rows) => rows.map((r) => r.id));

  const modelHasRoles = await prisma.modelHasRole.findMany({
    where: { roleId: { in: roleIds } },
    select: { userId: true, role: { select: { name: true } } },
  });

  const userIds = [...new Set(modelHasRoles.map((m) => m.userId))];
  const roleByUser = new Map<string, string[]>();
  for (const m of modelHasRoles) {
    const arr = roleByUser.get(m.userId) ?? [];
    if (!arr.includes(m.role.name)) arr.push(m.role.name);
    roleByUser.set(m.userId, arr);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: userIds }, deletedAt: null },
    select: { id: true, name: true, email: true, nim: true },
    orderBy: { name: "asc" },
  });

  const list = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    nim: u.nim,
    roles: roleByUser.get(u.id) ?? [],
  }));

  return c.json(list);
});

export { admin as adminCms };
